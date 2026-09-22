const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const express = require('express');
const { getAccountByRiotId, getAllMatchIds, getMatch, getLeagueEntriesByPuuid, getSummonerByPuuid } = require('./lib/riot');
const { setEnvValue } = require('./lib/envStore');
const { createBucket, addMatchToBucket, finalizeBucket, isRemake, computeStreaks } = require('./lib/stats');
const { createJob, updateProgress, completeJob, failJob, getJob } = require('./lib/jobs');
const { recordSnapshot, readHistory, findSnapshotAtOrBefore, toComparableLP, seedManualSnapshot } = require('./lib/rankHistory');

const app = express();
const PORT = process.env.PORT || 3000;
const PLATFORM = process.env.RIOT_PLATFORM || 'euw1';
const REGION = process.env.RIOT_REGION || 'europe';
const RANKED_SOLO_QUEUE_ID = 420;

// Der API Key ist ueber /api/settings/api-key zur Laufzeit aenderbar
// (Riot Personal Keys laufen nach 24h ab), deshalb kein const.
const config = {
  apiKey: process.env.RIOT_API_KEY || ''
};

const championsPath = path.join(__dirname, '..', 'public', 'data', 'champions.json');
const champions = JSON.parse(fs.readFileSync(championsPath, 'utf-8'));
const championByKey = new Map(champions.map(c => [c.key, c]));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

function requireApiKey(req, res, next) {
  if (!config.apiKey) {
    return res.status(500).json({
      error: 'No Riot API key set. Enter it on the Champion Selection page.'
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
    setEnvValue('RIOT_API_KEY', config.apiKey);
  } catch (e) {
    // Key wirkt trotzdem sofort im laufenden Server, auch wenn das
    // Schreiben in .env fehlschlaegt - dann nur nach Neustart wieder weg.
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
function findMeAndOpponent(match, puuid) {
  const participants = match.info.participants;
  const me = participants.find(p => p.puuid === puuid);
  if (!me) return { me: null, opponent: null };

  const opponent = participants.find(
    p => p.puuid !== puuid &&
         p.teamId !== me.teamId &&
         p.teamPosition === me.teamPosition &&
         me.teamPosition !== ''
  );

  return { me, opponent };
}

app.get('/api/summary', requireApiKey, async (req, res) => {
  const { puuid, championKey, since, role } = req.query;
  if (!puuid || !championKey || !since) {
    return res.status(400).json({ error: 'puuid, championKey and since are required.' });
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

    for (const matchId of matchIds) {
      const match = await getMatch(matchId, config.apiKey, REGION);
      const { me, opponent } = findMeAndOpponent(match, puuid);
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
async function buildRankOverview(puuid, sinceMs, manualRank) {
  try {
    const entries = await getLeagueEntriesByPuuid(puuid, config.apiKey, PLATFORM);
    const solo = entries.find(e => e.queueType === 'RANKED_SOLO_5x5');
    if (!solo) {
      return { current: null, deltaLP: null, note: 'Unranked or no Solo/Duo entry found.' };
    }

    let history = recordSnapshot(puuid, {
      tier: solo.tier,
      rank: solo.rank,
      leaguePoints: solo.leaguePoints,
      wins: solo.wins,
      losses: solo.losses
    });

    let startSnapshot = findSnapshotAtOrBefore(history, sinceMs);

    // Kein echter Snapshot vor dem "Since"-Datum? Falls der Nutzer auf der
    // Champion-Auswahl-Seite seinen Rang/LP-Stand manuell eingetragen hat,
    // nehmen wir den als Startpunkt statt zu raten.
    if (!startSnapshot && manualRank && manualRank.tier &&
        manualRank.leaguePoints !== null && manualRank.leaguePoints !== undefined &&
        manualRank.leaguePoints !== '') {
      history = seedManualSnapshot(puuid, sinceMs, manualRank);
      startSnapshot = findSnapshotAtOrBefore(history, sinceMs);
    }

    const current = { tier: solo.tier, rank: solo.rank, leaguePoints: solo.leaguePoints };
    const currentLP = toComparableLP(solo.tier, solo.rank, solo.leaguePoints);

    let deltaLP = null;
    let note = null;
    let noHistoryYet = false;
    if (startSnapshot) {
      deltaLP = currentLP - toComparableLP(startSnapshot.tier, startSnapshot.rank, startSnapshot.leaguePoints);
      if (startSnapshot.manual) {
        note = 'Based on the rank/LP you entered manually on the Champion Selection page.';
      }
    } else if (history.length > 1) {
      const earliest = history[0];
      deltaLP = currentLP - toComparableLP(earliest.tier, earliest.rank, earliest.leaguePoints);
      note = `No LP history before ${new Date(earliest.timestamp).toLocaleDateString('en-GB')} yet - showing change since then instead.`;
    } else {
      noHistoryYet = true;
      note = 'LP tracking just started - enter your current rank/LP on the Champion Selection page for an accurate value, or check back after your next game.';
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
async function runSummaryBatch(jobId, { puuid, champions, since, startTime, manualRank }) {
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

    for (const matchId of matchIds) {
      const match = await getMatch(matchId, config.apiKey, REGION);
      processed += 1;
      updateProgress(jobId, processed, matchIds.length);

      const { me, opponent } = findMeAndOpponent(match, puuid);
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

    const rank = await buildRankOverview(puuid, startTime * 1000, manualRank);

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
  const { puuid, champions, since, manualRank } = req.body || {};
  if (!puuid || !champions || !since) {
    return res.status(400).json({ error: 'puuid, champions and since are required.' });
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

  const startTime = Math.floor(new Date(since).getTime() / 1000);
  if (Number.isNaN(startTime)) {
    return res.status(400).json({ error: 'Invalid date for "since".' });
  }

  const jobId = createJob();
  runSummaryBatch(jobId, { puuid, champions: dedupedChampions, since, startTime, manualRank });
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
    console.warn('WARNING: No RIOT_API_KEY set. Enter it on the Champion Selection page.');
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
