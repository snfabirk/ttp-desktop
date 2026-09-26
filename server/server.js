const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const express = require('express');
const { getAccountByRiotId, getAccountByPuuid, getAllMatchIds, getMatch, getMatchTimeline, getLeagueEntriesByPuuid, getSummonerByPuuid } = require('./lib/riot');
const { loadPersistedApiKey, savePersistedApiKey } = require('./lib/envStore');
const { createBucket, addMatchToBucket, finalizeBucket, isRemake, computeStreaks } = require('./lib/stats');
const { createJob, updateProgress, completeJob, failJob, getJob } = require('./lib/jobs');
const { recordSnapshot, readHistory, findSnapshotAtOrBefore, toComparableLP, computeMinGoalLP, seedManualSnapshot } = require('./lib/rankHistory');
const {
  RULES_VERSION,
  computeErwarteteSpiele,
  createAchievementAccumulator,
  addMatchToAchievementAccumulator,
  addSoloTowerKillsFromTimeline,
  computeAllTrophyProgress
} = require('./lib/achievements');
const { loadFinalizedState, saveFinalizedState, clearFinalizedState } = require('./lib/achievementState');
const { startEntry: startHistoryEntry, updateEntry: updateHistoryEntry, listEntries: listHistoryEntries, deleteEntry: deleteHistoryEntry } = require('./lib/challengeHistory');

const app = express();
const PORT = process.env.PORT || 3000;
const PLATFORM = process.env.RIOT_PLATFORM || 'euw1';
const REGION = process.env.RIOT_REGION || 'europe';
const RANKED_SOLO_QUEUE_ID = 420;

// Der API Key ist ueber /api/settings/api-key zur Laufzeit aenderbar
// (Riot Personal Keys laufen nach 24h ab), deshalb kein const. Ein zuvor
// im updatefesten userData-Ordner gespeicherter Key hat Vorrang vor
// RIOT_API_KEY aus server/.env (die z.B. bei einem Auto-Update verloren
// geht, der persistierte Key aber nicht).
const config = {
  apiKey: loadPersistedApiKey() || process.env.RIOT_API_KEY || ''
};

const championsPath = path.join(__dirname, '..', 'public', 'data', 'champions.json');
const champions = JSON.parse(fs.readFileSync(championsPath, 'utf-8'));
const championByKey = new Map(champions.map(c => [c.key, c]));

app.use(express.static(path.join(__dirname, '..', 'public')));
// Nur fuer statische Assets aus build/ (z.B. das App-Icon), die auch von
// Seiten benoetigt werden, die ueber diesen Server ausgeliefert werden
// (siehe public/update-window.html) - keine Server-Logik, nur Dateien.
app.use('/build', express.static(path.join(__dirname, '..', 'build')));
app.use(express.json());

function requireApiKey(req, res, next) {
  if (!config.apiKey) {
    return res.status(500).json({
      error: 'No Riot API key set. Enter one in the "Riot API Key" box.'
    });
  }
  next();
}

app.get('/api/settings', (req, res) => {
  res.json({
    hasApiKey: Boolean(config.apiKey),
    apiKeyPreview: config.apiKey ? `****${config.apiKey.slice(-4)}` : null,
    platform: PLATFORM,
    region: REGION
  });
});

app.post('/api/settings/api-key', (req, res) => {
  const { apiKey } = req.body || {};
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return res.status(400).json({ error: 'Please provide a valid API key.' });
  }
  config.apiKey = apiKey.trim();
  try {
    savePersistedApiKey(config.apiKey);
  } catch (e) {
    // Key wirkt trotzdem sofort im laufenden Server, auch wenn das
    // Schreiben fehlschlaegt - dann nur nach Neustart/Update wieder weg.
  }
  res.json({ ok: true, apiKeyPreview: `****${config.apiKey.slice(-4)}` });
});

app.get('/api/account', requireApiKey, async (req, res) => {
  const { gameName, tagLine } = req.query;
  if (!gameName || !tagLine) {
    return res.status(400).json({ error: 'gameName and tagLine are required.' });
  }
  try {
    const account = await getAccountByRiotId(gameName, tagLine, config.apiKey, REGION);

    let profileIconId = null;
    try {
      const summoner = await getSummonerByPuuid(account.puuid, config.apiKey, PLATFORM);
      profileIconId = summoner.profileIconId;
    } catch (e) {
      // Icon ist rein kosmetisch - ein Fehler hier soll den Login nicht blockieren.
    }

    res.json({ ...account, profileIconId });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// Aktueller Rang/LP, schreibfrei - fuer die Champion-Auswahl-Seite, die den
// Stand direkt beim Oeffnen anzeigen will, ohne den Challenge-Start-Snapshot
// zu veraendern.
app.get('/api/current-rank', requireApiKey, async (req, res) => {
  const { puuid } = req.query;
  if (!puuid) {
    return res.status(400).json({ error: 'puuid is required.' });
  }
  try {
    const entries = await getLeagueEntriesByPuuid(puuid, config.apiKey, PLATFORM);
    const solo = entries.find(e => e.queueType === 'RANKED_SOLO_5x5');
    if (!solo) {
      return res.json({ current: null, note: 'Unranked or no Solo/Duo entry found.' });
    }
    const current = { tier: solo.tier, rank: solo.rank, leaguePoints: solo.leaguePoints };
    const minGoal = computeMinGoalLP(current.tier, current.rank, current.leaguePoints);
    res.json({ current, minGoal });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// Startet die Challenge: haelt den aktuellen Rang/LP als exakten (auf die
// Sekunde genauen) Startpunkt-Snapshot fest, den buildRankOverview() spaeter
// als Anker fuer die LP-Delta-Berechnung findet.
app.post('/api/challenge/start', requireApiKey, async (req, res) => {
  const { puuid } = req.body || {};
  if (!puuid) {
    return res.status(400).json({ error: 'puuid is required.' });
  }
  try {
    const entries = await getLeagueEntriesByPuuid(puuid, config.apiKey, PLATFORM);
    const solo = entries.find(e => e.queueType === 'RANKED_SOLO_5x5');
    const timestamp = Date.now();
    const current = solo ? { tier: solo.tier, rank: solo.rank, leaguePoints: solo.leaguePoints } : null;
    if (current) {
      seedManualSnapshot(puuid, timestamp, current);
    }
    res.json({ timestamp, current });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// Liefert die selbst gesammelten LP-Snapshots fuer den LP-Graphen. Riot hat
// keine Historie - das ist ausschliesslich das, was wir seit Einfuehrung des
// Trackings selbst aufgezeichnet haben (plus ein evtl. manuell gesetzter
// Startwert). Ein Snapshot kurz vor "since" wird als Anker mit reingenommen,
// damit der Graph nicht erst mitten im Zeitraum beginnt.
app.get('/api/rank-history', (req, res) => {
  const { puuid, since } = req.query;
  if (!puuid) {
    return res.status(400).json({ error: 'puuid is required.' });
  }

  const history = readHistory(puuid);
  const sinceMs = since ? new Date(since).getTime() : NaN;

  let points = history;
  if (!Number.isNaN(sinceMs)) {
    const anchor = findSnapshotAtOrBefore(history, sinceMs);
    points = history.filter(s => s.timestamp >= sinceMs);
    if (anchor && !points.includes(anchor)) {
      points = [anchor, ...points];
    }
  }

  res.json({
    points: points.map(s => ({
      timestamp: s.timestamp,
      comparableLP: toComparableLP(s.tier, s.rank, s.leaguePoints),
      tier: s.tier,
      rank: s.rank,
      leaguePoints: s.leaguePoints,
      manual: Boolean(s.manual)
    }))
  });
});

// Findet den eigenen Teilnehmer und den Lane-Gegner (gleiche teamPosition,
// anderes Team) in einem Match. Wird von den einzelnen und dem Batch-
// Endpoint gleichermassen genutzt.
//
// Matcht primaer ueber puuid, faellt aber auf die Riot ID (gameName+tagLine)
// zurueck, falls das fehlschlaegt - real beobachtet: puuids koennen sich bei
// einem Account aendern (hier: 2026-09-22), aeltere bereits gecachte/ueber
// die eigene Match-Liste gefundene Matches tragen dann noch die ALTE puuid
// in ihren participants[], obwohl der Spieler unveraendert derselbe ist.
// riotId ist optional (nur puuid-Vergleich, wenn nicht mitgegeben) - siehe
// resolveRiotId() weiter unten fuer die Aufloesung.
function findMeAndOpponent(match, puuid, riotId) {
  const participants = match.info.participants;
  const me = participants.find(p =>
    p.puuid === puuid ||
    (riotId && p.riotIdGameName === riotId.gameName && p.riotIdTagline === riotId.tagLine)
  );
  if (!me) return { me: null, opponent: null };

  const opponent = participants.find(
    p => p.puuid !== me.puuid &&
         p.teamId !== me.teamId &&
         p.teamPosition === me.teamPosition &&
         me.teamPosition !== ''
  );

  return { me, opponent };
}

// Loest die aktuelle Riot ID (gameName/tagLine) zu einer puuid auf - fuer den
// Riot-ID-Fallback in findMeAndOpponent() oben. Ein einzelner zusaetzlicher
// Account-V1-Call pro Batch-Job/Request (nicht pro Match), scheitert er (z.B.
// kein API-Key, oder die puuid selbst ist inzwischen ungueltig), wird einfach
// ohne Fallback weitergemacht statt den ganzen Job scheitern zu lassen - der
// reine puuid-Vergleich deckt ja weiterhin den Normalfall ab.
async function resolveRiotId(puuid, apiKey) {
  try {
    const account = await getAccountByPuuid(puuid, apiKey, REGION);
    return { gameName: account.gameName, tagLine: account.tagLine };
  } catch (e) {
    return null;
  }
}

app.get('/api/summary', requireApiKey, async (req, res) => {
  const { puuid, championKey, since, role } = req.query;
  if (!puuid || !championKey) {
    return res.status(400).json({ error: 'puuid and championKey are required.' });
  }
  // "since" ist jetzt Pflicht (nicht mehr optional) - ohne Challenge-Start
  // gibt es keine sinnvolle Untergrenze, und ein ungescopter Scan der
  // kompletten Historie (bis zu ~700 Spiele bei vielspielenden Accounts)
  // lief frueher als synchroner Request im Hintergrund weiter, auch wenn
  // zwischenzeitlich eine neue Challenge gestartet wurde - siehe overview.html.
  if (!since) {
    return res.status(400).json({ error: 'A "since" timestamp is required - start a challenge first.' });
  }
  const startTime = Math.floor(new Date(since).getTime() / 1000);
  if (Number.isNaN(startTime)) {
    return res.status(400).json({ error: 'Invalid date for "since".' });
  }

  try {
    const matchIds = await getAllMatchIds(
      puuid,
      { queueId: RANKED_SOLO_QUEUE_ID, startTime },
      config.apiKey,
      REGION
    );

    const bucket = createBucket();
    const riotId = await resolveRiotId(puuid, config.apiKey);

    for (const matchId of matchIds) {
      const match = await getMatch(matchId, config.apiKey, REGION);
      const { me, opponent } = findMeAndOpponent(match, puuid, riotId);
      if (!me || String(me.championId) !== String(championKey) || isRemake(me)) {
        continue;
      }
      if (role && me.teamPosition !== role) {
        continue; // andere Rolle gespielt - zaehlt nicht fuer diesen Rollen-gefilterten Champion
      }
      addMatchToBucket(bucket, {
        matchId,
        me,
        opponent,
        championByKey,
        gameCreation: match.info.gameCreation,
        gameDuration: match.info.gameDuration
      });
    }

    res.json({ since, queue: RANKED_SOLO_QUEUE_ID, ...finalizeBucket(bucket) });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// Account-weite Uebersicht (alle Champions, nicht nur die 3 getrackten) -
// wichtig weil man auch mal autofillt und dann etwas anderes spielt als
// erwartet. LP-Delta seit "since" ist nur so genau wie unsere eigene
// Snapshot-Historie (Riot liefert keine historischen LP-Werte).
async function buildRankOverview(puuid, sinceMs) {
  try {
    const entries = await getLeagueEntriesByPuuid(puuid, config.apiKey, PLATFORM);
    const solo = entries.find(e => e.queueType === 'RANKED_SOLO_5x5');
    if (!solo) {
      return { current: null, deltaLP: null, note: 'Unranked or no Solo/Duo entry found.' };
    }

    // Der Startpunkt wird bereits beim Klick auf "Start Challenge" exakt
    // (auf die Sekunde) als manueller Snapshot hinterlegt (siehe
    // /api/challenge/start) - hier muss nur noch danach gesucht werden.
    let history = recordSnapshot(puuid, {
      tier: solo.tier,
      rank: solo.rank,
      leaguePoints: solo.leaguePoints,
      wins: solo.wins,
      losses: solo.losses
    });

    const current = { tier: solo.tier, rank: solo.rank, leaguePoints: solo.leaguePoints };

    // Noch keine Challenge gestartet - es gibt keinen Startpunkt, von dem aus
    // ein LP-Delta ueberhaupt Sinn ergeben wuerde. Aktuellen Rang trotzdem
    // zeigen, nur ohne Delta.
    if (!sinceMs) {
      return { current, deltaLP: null, note: 'Start a challenge to track LP change.', noHistoryYet: false };
    }

    const startSnapshot = findSnapshotAtOrBefore(history, sinceMs);
    const currentLP = toComparableLP(solo.tier, solo.rank, solo.leaguePoints);

    let deltaLP = null;
    let note = null;
    let noHistoryYet = false;
    if (startSnapshot) {
      deltaLP = currentLP - toComparableLP(startSnapshot.tier, startSnapshot.rank, startSnapshot.leaguePoints);
    } else if (history.length > 1) {
      const earliest = history[0];
      deltaLP = currentLP - toComparableLP(earliest.tier, earliest.rank, earliest.leaguePoints);
      note = `No LP history before ${new Date(earliest.timestamp).toLocaleDateString('en-GB')} yet - showing change since then instead.`;
    } else {
      noHistoryYet = true;
      note = 'LP tracking just started - check back after your next game.';
    }

    return { current, deltaLP, note, noHistoryYet };
  } catch (e) {
    return { current: null, deltaLP: null, note: `Rank data unavailable: ${e.message}` };
  }
}

// Berechnet die Bilanz + Matchups + KDA/CS + Recent Games fuer mehrere
// Champions in einem einzigen Durchlauf durch die Match-Liste. Laeuft als
// Hintergrund-Job, damit das Frontend per Polling einen echten
// Live-Fortschritt anzeigen kann, statt auf einen einzigen, potenziell
// minutenlangen Request zu warten.
async function runSummaryBatch(jobId, { puuid, champions, since, startTime }) {
  try {
    const matchIds = await getAllMatchIds(
      puuid,
      { queueId: RANKED_SOLO_QUEUE_ID, startTime },
      config.apiKey,
      REGION
    );
    updateProgress(jobId, 0, matchIds.length);

    const buckets = {};
    const roleByKey = {};
    champions.forEach(c => {
      buckets[c.key] = createBucket();
      roleByKey[c.key] = c.role || '';
    });

    let processed = 0;
    // Ueber ALLE Ranked-Solo-Spiele seit "since" gezaehlt, unabhaengig vom
    // gespielten Champion - ergaenzt die Champion-gefilterten Buckets unten
    // um eine Account-Gesamtbilanz (relevant bei Autofill auf andere Champs).
    let overallWins = 0;
    let overallLosses = 0;
    const overallGames = []; // fuer Win/Loss-Streaks - {win, gameCreation}
    const riotId = await resolveRiotId(puuid, config.apiKey);

    for (const matchId of matchIds) {
      const match = await getMatch(matchId, config.apiKey, REGION);
      processed += 1;
      updateProgress(jobId, processed, matchIds.length);

      const { me, opponent } = findMeAndOpponent(match, puuid, riotId);
      if (!me || isRemake(me)) continue;

      if (me.win) overallWins += 1; else overallLosses += 1;
      overallGames.push({ win: me.win, gameCreation: match.info.gameCreation });

      const myKey = String(me.championId);
      const bucket = buckets[myKey];
      if (!bucket) continue; // nicht einer der gesuchten Champions

      const role = roleByKey[myKey];
      if (role && me.teamPosition !== role) continue; // andere Rolle gespielt

      addMatchToBucket(bucket, {
        matchId,
        me,
        opponent,
        championByKey,
        gameCreation: match.info.gameCreation,
        gameDuration: match.info.gameDuration
      });
    }

    const byChampion = {};
    champions.forEach(c => {
      byChampion[c.key] = finalizeBucket(buckets[c.key]);
    });

    const rank = await buildRankOverview(puuid, since ? startTime * 1000 : null);

    // Solange wir noch keinen zweiten Snapshot haben, gibt es keinen echten
    // Delta-Wert. Riot liefert pro Match kein LP-Delta (haengt von MMR,
    // Promo, Erstsieg-Bonus, Aegis-Doppel-LP, AFK-Mitigation usw. ab), daher
    // keine Einzelzahl vortaeuschen, sondern eine Spanne aus typischen
    // Bandbreiten (normal ca. 14-26 LP pro Spiel, ohne Sonderfaelle).
    // Sobald ein echter zweiter Snapshot existiert, wird automatisch der
    // echte, exakte Wert genutzt statt dieser Schaetzung.
    if (rank.noHistoryYet) {
      const WIN_LP_LOW = 14;
      const WIN_LP_HIGH = 26;
      const LOSS_LP_LOW = -26; // schlechtester Fall: hoher Verlust pro Loss
      const LOSS_LP_HIGH = -14; // bester Fall: niedriger Verlust pro Loss

      rank.deltaLPRange = {
        min: Math.round(overallWins * WIN_LP_LOW + overallLosses * LOSS_LP_LOW),
        max: Math.round(overallWins * WIN_LP_HIGH + overallLosses * LOSS_LP_HIGH)
      };
      rank.isEstimate = true;
    }

    const streaks = computeStreaks(overallGames);

    completeJob(jobId, {
      since,
      queue: RANKED_SOLO_QUEUE_ID,
      totalMatchesScanned: matchIds.length,
      byChampion,
      streaks,
      overall: {
        wins: overallWins,
        losses: overallLosses,
        totalGames: overallWins + overallLosses
      },
      rank
    });
  } catch (e) {
    failJob(jobId, e.message);
  }
}

app.post('/api/summary-batch/start', requireApiKey, (req, res) => {
  const { puuid, champions, since } = req.body || {};
  if (!puuid || !champions) {
    return res.status(400).json({ error: 'puuid and champions are required.' });
  }

  if (!Array.isArray(champions) || champions.length === 0) {
    return res.status(400).json({ error: 'At least one champion is required.' });
  }

  // Doppelte Keys (gleicher Champion mehrfach ausgewaehlt) zusammenfassen,
  // letzte gesetzte Rolle gewinnt.
  const byKey = new Map();
  champions.forEach(c => {
    if (c && c.key) byKey.set(String(c.key), { key: String(c.key), role: c.role || '' });
  });
  const dedupedChampions = [...byKey.values()];

  // "since" ist Pflicht (siehe /api/summary weiter oben fuer die Begruendung)
  // - ohne Challenge-Start liefe dieser Batch-Job unscoped und potenziell
  // minutenlang im Hintergrund weiter, selbst wenn zwischenzeitlich auf Seite
  // 1 eine neue Challenge gestartet wird.
  if (!since) {
    return res.status(400).json({ error: 'A "since" timestamp is required - start a challenge first.' });
  }
  const startTime = Math.floor(new Date(since).getTime() / 1000);
  if (Number.isNaN(startTime)) {
    return res.status(400).json({ error: 'Invalid date for "since".' });
  }

  const jobId = createJob();
  runSummaryBatch(jobId, { puuid, champions: dedupedChampions, since, startTime });
  res.json({ jobId });
});

app.get('/api/summary-batch/status/:jobId', (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found (server may have restarted).' });
  }
  res.json({
    status: job.status,
    processed: job.processed,
    total: job.total,
    result: job.status === 'done' ? job.result : undefined,
    error: job.status === 'error' ? job.error : undefined
  });
});

// Wie runSummaryBatch(), aber sammelt statt Matchup-Statistiken die rohen
// Achievement-Kennzahlen (Kills/CS/Gold/Multikills/Vision/... - siehe
// server/lib/achievements.js) ueber ALLE Matches der Challenge (Champion-
// Pool + Rolle + "since", exakt dieselbe Match-Auswahl wie beim normalen
// Summary). Fuer Top zusaetzlich ein Timeline-API-Call pro Match, um "echt
// solo" zerstoerte Tuerme zu erkennen (siehe [[achievements-trophies-design]]).
async function runAchievementsBatch(jobId, { puuid, champions, since, startTime, role, challengeLevel, lpGoal }) {
  try {
    const matchIds = await getAllMatchIds(
      puuid,
      { queueId: RANKED_SOLO_QUEUE_ID, startTime },
      config.apiKey,
      REGION
    );
    updateProgress(jobId, 0, matchIds.length);

    const championKeys = new Set(champions.map(c => String(c.key)));
    const acc = createAchievementAccumulator();
    const riotId = await resolveRiotId(puuid, config.apiKey);

    let processed = 0;
    for (const matchId of matchIds) {
      const match = await getMatch(matchId, config.apiKey, REGION);
      processed += 1;
      updateProgress(jobId, processed, matchIds.length);

      const { me } = findMeAndOpponent(match, puuid, riotId);
      if (!me || isRemake(me)) continue;
      if (!championKeys.has(String(me.championId))) continue;
      if (role && me.teamPosition !== role) continue;

      addMatchToAchievementAccumulator(acc, me, match);

      if (role === 'TOP') {
        try {
          const timeline = await getMatchTimeline(matchId, config.apiKey, REGION);
          addSoloTowerKillsFromTimeline(acc, timeline, me.participantId);
        } catch (e) {
          // Timeline-Fehler sollen den restlichen Achievement-Fortschritt
          // nicht kippen - Solo-Turm-Trophies bleiben fuer dieses Match dann
          // einfach unveraendert statt den ganzen Job scheitern zu lassen.
        }
      }
    }

    let currentRank = null;
    try {
      const entries = await getLeagueEntriesByPuuid(puuid, config.apiKey, PLATFORM);
      const solo = entries.find(e => e.queueType === 'RANKED_SOLO_5x5');
      if (solo) currentRank = { tier: solo.tier, rank: solo.rank, leaguePoints: solo.leaguePoints };
    } catch (e) {
      // Ohne aktuellen Rang faellt computeErwarteteSpiele() auf den 20er-
      // Mindestwert zurueck - kein harter Fehler noetig.
    }

    const erwarteteSpiele = computeErwarteteSpiele(currentRank, lpGoal);
    const tier = (challengeLevel || 'normal').toLowerCase();
    const finalizedState = loadFinalizedState(puuid, since);
    const progress = computeAllTrophyProgress(acc, { tier, erwarteteSpiele, role, currentRank, lpGoal, finalizedState });

    if (progress.newlyFinalizedIds.length > 0) {
      const merged = { ...finalizedState };
      // Neu finalisierte Trophies werden JETZT, unter der aktuell
      // geltenden RULES_VERSION bestaetigt - koennen also per Definition
      // nie "veraltet" sein.
      for (const id of progress.newlyFinalizedIds) merged[id] = RULES_VERSION;
      saveFinalizedState(puuid, since, merged);
    }

    // Bereits frueher finalisierte Trophies (aus finalizedState, VOR diesem
    // Lauf geladen) gelten als veraltet, wenn ihre gespeicherte Version nicht
    // mehr der aktuell im Code hinterlegten RULES_VERSION entspricht - z.B.
    // weil ein spaeteres Update die Zielzahlen/das Roster geaendert hat,
    // waehrend eine Challenge bereits lief. Siehe auch
    // /api/achievements/rules-status fuer den gleichen Check ohne vollen
    // Match-Scan (genutzt beim "Reset Challenge"-Warnhinweis).
    const rulesUpToDate = Object.values(finalizedState).every(v => v === RULES_VERSION);

    completeJob(jobId, {
      erwarteteSpiele,
      tier,
      totalGamesScanned: acc.totalGames,
      rulesUpToDate,
      ...progress
    });
  } catch (e) {
    failJob(jobId, e.message);
  }
}

// Leichtgewichtiger Check, ob die bereits FINALISIERTEN Ø-Trophies einer
// laufenden Challenge noch zur aktuell geltenden RULES_VERSION passen - nur
// ein lokaler Datei-Read, kein Riot-API-Call/Match-Scan, deshalb ohne
// requireApiKey nutzbar. Wird vom "Reset Challenge"-Button auf Seite 1
// benutzt, um vor dem Reset gezielt zu warnen, wenn sich die Trophy-Regeln
// seit Challenge-Start geaendert haben (siehe [[achievements-trophies-design]]).
app.get('/api/achievements/rules-status', (req, res) => {
  const { puuid, since } = req.query;
  if (!puuid || !since) {
    return res.status(400).json({ error: 'puuid and since are required.' });
  }
  const finalizedState = loadFinalizedState(puuid, since);
  const finalizedIds = Object.keys(finalizedState);
  const rulesUpToDate = finalizedIds.every(id => finalizedState[id] === RULES_VERSION);
  res.json({ rulesUpToDate, hasFinalizedTrophies: finalizedIds.length > 0 });
});

// Loescht den finalisierten Ø-Trophy-Zustand einer puuid aktiv, statt ihn nur
// unerreichbar werden zu lassen - vom "Reset Challenge"-Button auf Seite 1
// bei JEDEM Reset aufgerufen (siehe [[achievements-trophies-design]]), nicht
// nur wenn die Regeln sich geaendert haben, da ein Reset immer "frisch
// anfangen" bedeuten soll. Ohne requireApiKey, da rein lokaler Datei-Zugriff.
app.post('/api/achievements/clear-state', (req, res) => {
  const { puuid } = req.body || {};
  if (!puuid) {
    return res.status(400).json({ error: 'puuid is required.' });
  }
  clearFinalizedState(puuid);
  res.json({ ok: true });
});

// ----- Challenge History (siehe server/lib/challengeHistory.js fuer die
// vollen Semantik-Kommentare) - reine lokale Datei-Operationen, kein
// requireApiKey noetig fuer keinen dieser vier Endpunkte. -----

app.post('/api/challenge-history/start', (req, res) => {
  const { puuid, since, champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp } = req.body || {};
  if (!puuid || !since) {
    return res.status(400).json({ error: 'puuid and since are required.' });
  }
  const entry = startHistoryEntry(puuid, { since, champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp });
  res.json({ entry });
});

app.post('/api/challenge-history/update', (req, res) => {
  const {
    puuid, since, unlockedCount, totalCount, platinumUnlocked, ended,
    // Optional - nur genutzt, falls hier nachtraeglich ein Eintrag angelegt
    // werden muss (siehe updateEntry() in challengeHistory.js), weil "since"
    // noch keinen offenen Eintrag hat (z.B. eine Challenge, die schon lief,
    // bevor es die History ueberhaupt gab).
    champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp
  } = req.body || {};
  if (!puuid || !since) {
    return res.status(400).json({ error: 'puuid and since are required.' });
  }
  const entry = updateHistoryEntry(puuid, since, {
    unlockedCount, totalCount, platinumUnlocked, ended: Boolean(ended),
    champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp
  });
  res.json({ entry });
});

app.get('/api/challenge-history/list', (req, res) => {
  const { puuid } = req.query;
  if (!puuid) {
    return res.status(400).json({ error: 'puuid is required.' });
  }
  res.json({ entries: listHistoryEntries(puuid) });
});

app.post('/api/challenge-history/delete', (req, res) => {
  const { puuid, id } = req.body || {};
  if (!puuid || !id) {
    return res.status(400).json({ error: 'puuid and id are required.' });
  }
  const deleted = deleteHistoryEntry(puuid, id);
  res.json({ deleted });
});

app.post('/api/achievements/start', requireApiKey, (req, res) => {
  const { puuid, champions, since, role, challengeLevel, lpGoal } = req.body || {};
  if (!puuid || !champions || !Array.isArray(champions) || champions.length === 0) {
    return res.status(400).json({ error: 'puuid and champions are required.' });
  }

  const byKey = new Map();
  champions.forEach(c => {
    if (c && c.key) byKey.set(String(c.key), { key: String(c.key), role: c.role || '' });
  });
  const dedupedChampions = [...byKey.values()];

  let startTime = 0;
  if (since) {
    startTime = Math.floor(new Date(since).getTime() / 1000);
    if (Number.isNaN(startTime)) {
      return res.status(400).json({ error: 'Invalid date for "since".' });
    }
  }

  const jobId = createJob();
  runAchievementsBatch(jobId, {
    puuid,
    champions: dedupedChampions,
    since,
    startTime,
    role: role || '',
    challengeLevel,
    lpGoal
  });
  res.json({ jobId });
});

app.get('/api/achievements/status/:jobId', (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found (server may have restarted).' });
  }
  res.json({
    status: job.status,
    processed: job.processed,
    total: job.total,
    result: job.status === 'done' ? job.result : undefined,
    error: job.status === 'error' ? job.error : undefined
  });
});

// Verhindert, dass ein unerwarteter Fehler waehrend eines langen
// Match-Scans den ganzen Server stumm abstuerzen laesst - stattdessen
// wird der Fehler geloggt und der Server laeuft weiter.
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION (server keeps running):', err);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION (server keeps running):', err);
});

let resolveReady;
const ready = new Promise(resolve => { resolveReady = resolve; });

const server = app.listen(PORT, () => {
  console.log(`Three-Trick-Pony Server running at http://localhost:${PORT}`);
  if (!config.apiKey) {
    console.warn('WARNING: No RIOT_API_KEY set. Enter one in the "Riot API Key" box.');
  }
  resolveReady();
});

// Keine automatischen Timeouts, damit ein langer Match-Scan (viele Spiele
// seit einem weit zurueckliegenden Datum) nicht mittendrin abgebrochen wird.
server.requestTimeout = 0;
server.headersTimeout = 0;
server.keepAliveTimeout = 0;

// Wird von der Electron-Desktop-App (electron-main.js) genutzt, um das
// Fenster erst zu oeffnen, sobald der Server tatsaechlich Requests annimmt.
module.exports = { ready, PORT };
