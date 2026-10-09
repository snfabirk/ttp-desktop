const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const express = require('express');
const { getAccountByRiotId, getAccountByPuuid, getAllMatchIds, getMatch, getMatchTimeline, getLeagueEntriesByPuuid, getSummonerByPuuid, getActiveGame } = require('./lib/riot');
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
const progression = require('./lib/progression');
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
async function runSummaryBatch(jobId, { puuid, champions, since, startTime, mainRole, secondRole }) {
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
    // Main/Second/Fill-Aufschluesselung (explizite Nutzeranfrage, 2026-09-30):
    // wie oft wurde tatsaechlich in der Hauptrolle, der festgelegten
    // Zweitrolle, oder in einer ganz anderen ("Fill") Rolle gespielt - unab-
    // haengig vom Champion. Ein Spieler kann natuerlich trotzdem eine andere
    // Rolle picken als vereinbart - zaehlt dann bewusst als Fill, das ist
    // sein eigenes Problem, wenn er die Challenge nicht ernst nimmt.
    const roleBreakdown = { main: 0, second: 0, fill: 0 };
    // Feinere Aufteilung fuer das Rollen-Balkendiagramm (Overview-Mini-
    // Version + role.html, explizite Nutzeranfrage 2026-09-30): Main Role
    // mit einem der 3 Pool-Champs ("Ponys") vs. Main Role mit anderem Champ,
    // Second Role (jeder Champ - dort ist kein Pool festgelegt) und Off Role.
    // Pro Kategorie Wins/Losses und die gespielten Champs mit eigener Bilanz.
    const poolKeys = new Set(champions.map(c => String(c.key)));
    const roleStats = {
      mainPony: { wins: 0, losses: 0, champs: {} },
      mainOther: { wins: 0, losses: 0, champs: {} },
      second: { wins: 0, losses: 0, champs: {} },
      off: { wins: 0, losses: 0, champs: {} }
    };
    const riotId = await resolveRiotId(puuid, config.apiKey);
    const xpGames = []; // fuer progression.creditMatches() am Ende

    for (const matchId of matchIds) {
      const match = await getMatch(matchId, config.apiKey, REGION);
      processed += 1;
      updateProgress(jobId, processed, matchIds.length);

      const { me, opponent } = findMeAndOpponent(match, puuid, riotId);
      if (!me || isRemake(me)) continue;

      if (me.win) overallWins += 1; else overallLosses += 1;
      overallGames.push({ win: me.win, gameCreation: match.info.gameCreation });

      if (mainRole && me.teamPosition === mainRole) roleBreakdown.main += 1;
      else if (secondRole && me.teamPosition === secondRole) roleBreakdown.second += 1;
      else roleBreakdown.fill += 1;

      const myKey = String(me.championId);

      const category = (mainRole && me.teamPosition === mainRole)
        ? (poolKeys.has(myKey) ? 'mainPony' : 'mainOther')
        : (secondRole && me.teamPosition === secondRole) ? 'second' : 'off';
      const cat = roleStats[category];
      if (me.win) cat.wins += 1; else cat.losses += 1;
      if (!cat.champs[myKey]) {
        const info = championByKey.get(myKey);
        cat.champs[myKey] = { key: myKey, id: info ? info.id : '', name: info ? info.name : (me.championName || myKey), wins: 0, losses: 0 };
      }
      if (me.win) cat.champs[myKey].wins += 1; else cat.champs[myKey].losses += 1;

      xpGames.push({
        matchId,
        gameCreation: match.info.gameCreation,
        category: { mainPony: 'poolChamp', mainOther: 'sameRoleOther', second: 'secondRole', off: 'offRole' }[category],
        win: me.win,
        kills: me.kills,
        deaths: me.deaths,
        assists: me.assists,
        champId: cat.champs[myKey].id,
        champName: cat.champs[myKey].name,
        // fuer die Quests (v5.17.0)
        stats: {
          role: me.teamPosition || '',
          duration: match.info.gameDuration || 0,
          cs: (me.totalMinionsKilled || 0) + (me.neutralMinionsKilled || 0),
          damage: me.totalDamageDealtToChampions || 0,
          dragons: me.dragonKills || 0,
          epic: (me.baronKills || 0) + ((me.challenges && me.challenges.riftHeraldTakedowns) || 0) + ((me.challenges && me.challenges.voidMonsterKill) || 0),
          soloKills: (me.challenges && me.challenges.soloKills) || 0,
          vision: me.visionScore || 0,
          controlWards: me.visionWardsBoughtInGame || 0,
          kp: (me.challenges && me.challenges.killParticipation) || 0
        }
      });

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

    // XP erst nach dem vollstaendigen Scan gutschreiben - jedes Spiel nur
    // einmal (Ledger in progression.js), egal wie oft gescannt wird.
    let xpCredited = [];
    try {
      xpCredited = progression.creditMatches(xpGames);
      // Quests (v5.17.0): erledigte Daily/Weekly Quests bringen XP (keine Coins)
      progression.creditQuests({
        role: mainRole,
        champions: champions.map(c => {
          const info = championByKey.get(String(c.key));
          return { id: info ? info.id : (c.id || ''), name: info ? info.name : (c.name || '') };
        })
      });
      if (rank.current) {
        const startSnapshot = findSnapshotAtOrBefore(readHistory(puuid), startTime * 1000);
        progression.creditLp({
          puuid,
          currentLP: toComparableLP(rank.current.tier, rank.current.rank, rank.current.leaguePoints),
          baselineLP: startSnapshot ? toComparableLP(startSnapshot.tier, startSnapshot.rank, startSnapshot.leaguePoints) : null
        });
      }
    } catch (e) {
      console.error('XP credit failed:', e.message);
    }

    // Champs pro Kategorie als Liste, meistgespielt zuerst (bei Gleichstand
    // mehr Wins zuerst).
    for (const cat of Object.values(roleStats)) {
      cat.champs = Object.values(cat.champs).sort((a, b) =>
        (b.wins + b.losses) - (a.wins + a.losses) || b.wins - a.wins);
    }

    completeJob(jobId, {
      since,
      queue: RANKED_SOLO_QUEUE_ID,
      totalMatchesScanned: matchIds.length,
      byChampion,
      streaks,
      roleBreakdown,
      roleStats,
      xpCredited,
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
  const { puuid, champions, since, mainRole, secondRole } = req.body || {};
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
  runSummaryBatch(jobId, {
    puuid,
    champions: dedupedChampions,
    since,
    startTime,
    mainRole: mainRole || '',
    secondRole: secondRole || ''
  });
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
// server/lib/achievements.js) ueber ALLE Ranked-Solo-Matches seit "since",
// account-weit (NICHT auf Champion-Pool/Rolle gescopt - explizite
// Nutzeranfrage 2026-09-26: Trophies sollen immer den tatsaechlich besten
// erreichten Stat zeigen, auch aus Autofill-Spielen auf anderen Champions/
// Rollen, statt hinter dem in "overall" auf der Overview-Seite gezeigten
// Account-Wert zurueckzubleiben - z.B. eine 6er Win-Streak zaehlt auch dann,
// wenn 2 der Spiele nicht auf dem OTP-Pool/in der gewaehlten Rolle waren).
// Fuer Top zusaetzlich ein Timeline-API-Call pro Match, um "echt solo"
// zerstoerte Tuerme zu erkennen (siehe [[achievements-trophies-design]]).
// Kern der Trophy-Berechnung, gemeinsam genutzt vom normalen Achievement-Job
// (Trophies-Seite) und vom Abschluss einer Challenge beim Reset (siehe
// /api/challenge-history/close) - letzterer braucht die FRISCHEN Zahlen,
// nicht den zuletzt auf der Trophies-Seite angezeigten Stand.
async function computeAchievementProgress({ puuid, since, startTime, role, challengeLevel, lpGoal }, onProgress = () => {}) {
  const matchIds = await getAllMatchIds(
    puuid,
    { queueId: RANKED_SOLO_QUEUE_ID, startTime },
    config.apiKey,
    REGION
  );
  onProgress(0, matchIds.length);

  const acc = createAchievementAccumulator();
  const riotId = await resolveRiotId(puuid, config.apiKey);

  let processed = 0;
  for (const matchId of matchIds) {
    const match = await getMatch(matchId, config.apiKey, REGION);
    processed += 1;
    onProgress(processed, matchIds.length);

    const { me } = findMeAndOpponent(match, puuid, riotId);
    if (!me || isRemake(me)) continue;

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
  return { acc, erwarteteSpiele, tier, finalizedState, progress };
}

async function runAchievementsBatch(jobId, { puuid, since, startTime, role, challengeLevel, lpGoal }) {
  try {
    const { acc, erwarteteSpiele, tier, finalizedState, progress } = await computeAchievementProgress(
      { puuid, since, startTime, role, challengeLevel, lpGoal },
      (done, total) => updateProgress(jobId, done, total)
    );

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

// ----- XP / Level / Quests (v5.0.0, provisorisch - siehe
// server/lib/progression.js). Rein lokal, kein requireApiKey. -----

function progressionContext(src) {
  let champions = [];
  try { champions = JSON.parse(src.champions || '[]'); } catch (e) {}
  return { role: src.role || '', challengeLevel: src.challengeLevel || '', champions: Array.isArray(champions) ? champions : [] };
}

app.get('/api/progression', (req, res) => {
  res.json(progression.getOverview(progressionContext(req.query)));
});

app.post('/api/progression/reroll', (req, res) => {
  const result = progression.rerollDaily(progressionContext(req.body || {}));
  res.status(result.ok ? 200 : 400).json(result);
});

// Spielerprofil (profile.html): Lebenszeit-Stats ueber alle Challenges -
// Challenges/Trophies aus der Challenge History, Spiele/XP aus dem
// Progression-Ledger. Rein lokal.
app.get('/api/profile-stats', (req, res) => {
  const { puuid } = req.query;
  const entries = puuid ? listHistoryEntries(puuid) : [];
  const goalReached = e => Array.isArray(e.trophies) && e.trophies.some(t => t.id === 'goal-reached' && t.unlocked);
  const best = entries.reduce((b, e) => (!b || (e.unlockedCount || 0) > (b.unlockedCount || 0) ? e : b), null);
  res.json({
    ...progression.getLifetimeStats(),
    challenges: {
      started: entries.length,
      finished: entries.filter(e => e.until).length,
      goalsReached: entries.filter(goalReached).length,
      trophies: entries.reduce((n, e) => n + (e.unlockedCount || 0), 0),
      platinum: entries.filter(e => e.platinumUnlocked).length,
      bestTrophies: best ? best.unlockedCount || 0 : 0,
      firstStarted: entries.length ? entries[entries.length - 1].since : null // listEntries: neueste zuerst
    }
  });
});

// Cosmetics ausruesten (nur eigene) - id null = ablegen.
// Shop (v5.13.0, provisorisch): rotierende Angebote + taegliches Gluecksrad
app.get('/api/shop', (req, res) => {
  res.json(progression.getShopState());
});
// Consumables (v5.18.0): Tagesplatz kaufen = sofort einsetzen
app.post('/api/shop/consumable', (req, res) => {
  const { slot, choice } = req.body || {};
  const result = progression.buyConsumable(Number(slot), choice || null, progressionContext(req.body || {}));
  res.status(result.ok ? 200 : 400).json(result);
});
app.get('/api/theme-access', (req, res) => {
  res.json(progression.themeAccess());
});

app.post('/api/shop/spin', (req, res) => {
  const result = progression.spinWheel();
  res.status(result.ok ? 200 : 400).json(result);
});

app.post('/api/cosmetics/equip', (req, res) => {
  const { type, id } = req.body || {};
  if (!type) return res.status(400).json({ error: 'type is required.' });
  const result = progression.equipCosmetic(type, id || null);
  res.status(result.ok ? 200 : 400).json(result);
});

// Live-Spiel fuer die Overview (v5.7.0). Spectator liefert keine Rollen -
// der gegnerische Jungler ist am Smite (Summoner Spell 11) erkennbar, fuer
// andere Rollen zeigt die Overview einfach alle 5 Gegner.
const SMITE_SPELL_ID = 11;
app.get('/api/live-game', requireApiKey, async (req, res) => {
  const { puuid } = req.query;
  if (!puuid) return res.status(400).json({ error: 'puuid is required.' });
  try {
    const game = await getActiveGame(puuid, config.apiKey, PLATFORM);
    if (!game) return res.json({ inGame: false });
    const champ = p => {
      const info = championByKey.get(String(p.championId));
      return {
        key: String(p.championId),
        id: info ? info.id : '',
        name: info ? info.name : String(p.championId),
        smite: p.spell1Id === SMITE_SPELL_ID || p.spell2Id === SMITE_SPELL_ID,
        riotId: p.riotId || ''
      };
    };
    const me = game.participants.find(p => p.puuid === puuid);
    const myTeam = me ? me.teamId : null;
    res.json({
      inGame: true,
      queueId: game.gameQueueConfigId,
      gameStartTime: game.gameStartTime,
      gameLength: game.gameLength,
      me: me ? champ(me) : null,
      allies: game.participants.filter(p => p.teamId === myTeam && p.puuid !== puuid).map(champ),
      enemies: game.participants.filter(p => p.teamId !== myTeam).map(champ)
    });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// Profil-Layout (Widget-Raster auf profile.html) speichern.
app.post('/api/profile/layout', (req, res) => {
  const result = progression.saveProfileLayout((req.body || {}).layout);
  res.status(result.ok ? 200 : 400).json(result);
});

// "Reset Account Progress" in den Settings - NUR Level/XP/Quests/Pass,
// alles andere (Challenge, Trophies, Verlauf) bleibt.
app.post('/api/progression/reset', (req, res) => {
  progression.resetState();
  res.json({ ok: true });
});

// ----- Challenge History (siehe server/lib/challengeHistory.js fuer die
// vollen Semantik-Kommentare) - reine lokale Datei-Operationen, kein
// requireApiKey noetig fuer keinen dieser vier Endpunkte. -----

app.post('/api/challenge-history/start', (req, res) => {
  const {
    puuid, since, champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp,
    startRankTier, startRankDivision, startRankLp
  } = req.body || {};
  if (!puuid || !since) {
    return res.status(400).json({ error: 'puuid and since are required.' });
  }
  const entry = startHistoryEntry(puuid, {
    since, champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp,
    startRankTier, startRankDivision, startRankLp
  });
  res.json({ entry });
});

app.post('/api/challenge-history/update', (req, res) => {
  const {
    puuid, since, unlockedCount, totalCount, platinumUnlocked, trophies, ended,
    // Optional - nur genutzt, falls hier nachtraeglich ein Eintrag angelegt
    // werden muss (siehe updateEntry() in challengeHistory.js), weil "since"
    // noch keinen offenen Eintrag hat (z.B. eine Challenge, die schon lief,
    // bevor es die History ueberhaupt gab).
    champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp,
    // Fuellt einen fehlenden Startrang nachtraeglich auf (siehe updateEntry()
    // - wird NUR gesetzt, wenn der Eintrag noch keinen hat), fuer Challenges
    // die vor v4.16.0 gestartet wurden.
    startRankTier, startRankDivision, startRankLp
  } = req.body || {};
  if (!puuid || !since) {
    return res.status(400).json({ error: 'puuid and since are required.' });
  }
  const entry = updateHistoryEntry(puuid, since, {
    unlockedCount, totalCount, platinumUnlocked, trophies, ended: Boolean(ended),
    // Unter welcher Trophy-Regelversion dieser Snapshot entstanden ist -
    // die History zeigt alte Challenges auch nach spaeteren Ziel-
    // Anpassungen weiter an, nur als "aeltere Trophy-Liste" markiert.
    rulesVersion: RULES_VERSION,
    champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp,
    startRankTier, startRankDivision, startRankLp
  });
  res.json({ entry });
});

// Schliesst eine Challenge beim "Reset Challenge" final ab. Rechnet die
// Trophies dafuer FRISCH aus den Matches nach (Match-Cache macht das schnell)
// statt den zuletzt auf der Trophies-Seite angezeigten Snapshot zu nehmen -
// der war oft veraltet (z.B. Win Streak 4/3 gespeichert, real 6/3) oder
// fehlte ganz, wenn die Trophies-Seite nie geoeffnet wurde, wodurch die
// Challenge als "0 Trophaeen" sogar komplett verworfen wurde. Nur wenn die
// Neuberechnung scheitert (kein Netz/API-Key), faellt es auf den
// mitgeschickten Snapshot zurueck. Loescht danach den finalisierten
// Ø-Trophy-Zustand (wie /api/achievements/clear-state) - erst NACH der
// Berechnung, die ihn noch braucht.
app.post('/api/challenge-history/close', async (req, res) => {
  const {
    puuid, since, fallback,
    champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp
  } = req.body || {};
  if (!puuid || !since) {
    return res.status(400).json({ error: 'puuid and since are required.' });
  }
  const startTime = Math.floor(new Date(since).getTime() / 1000);
  let snapshot = fallback || null;
  let recomputed = false;
  if (config.apiKey && !Number.isNaN(startTime)) {
    try {
      const lpGoal = { tier: lpGoalTier, division: lpGoalDivision, lp: lpGoalLp };
      const { progress } = await computeAchievementProgress({ puuid, since, startTime, role, challengeLevel, lpGoal });
      snapshot = {
        unlockedCount: progress.unlockedCount,
        totalCount: progress.totalCount,
        platinumUnlocked: progress.platinumUnlocked,
        trophies: progress.trophies.map(({ id, name, current, target, percent, unlocked }) => ({ id, name, current, target, percent, unlocked }))
      };
      recomputed = true;
    } catch (e) {
      // Faellt auf den mitgeschickten Snapshot zurueck.
    }
  }
  const entry = updateHistoryEntry(puuid, since, {
    unlockedCount: snapshot ? snapshot.unlockedCount : 0,
    totalCount: snapshot ? snapshot.totalCount : 21,
    platinumUnlocked: snapshot ? snapshot.platinumUnlocked : false,
    trophies: snapshot ? snapshot.trophies : undefined,
    rulesVersion: RULES_VERSION,
    ended: true,
    champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp
  });
  clearFinalizedState(puuid);
  res.json({ entry, recomputed });
});

app.get('/api/challenge-history/list', (req, res) => {
  const { puuid } = req.query;
  if (!puuid) {
    return res.status(400).json({ error: 'puuid is required.' });
  }
  res.json({ entries: listHistoryEntries(puuid), currentRulesVersion: RULES_VERSION });
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
