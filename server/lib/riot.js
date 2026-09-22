const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', 'cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const MIN_DELAY_MS = 60; // ~16 req/s, sicher unter dem 20/1s-Limit eines Personal Keys
let lastRequestAt = 0;

// Prioritaets-Warteschlange statt einfacher FIFO-Kette: eine schnelle Anfrage
// (z.B. Summoner suchen) muss so nicht hinter hunderten Match-Abrufen warten,
// die von einem grossen "Laden"-Klick noch abgearbeitet werden.
const highPriorityQueue = [];
const normalQueue = [];
let processing = false;

function enqueue(task, priority) {
  return new Promise((resolve, reject) => {
    const item = { task, resolve, reject };
    (priority ? highPriorityQueue : normalQueue).push(item);
    processQueue();
  });
}

async function processQueue() {
  if (processing) return;
  processing = true;

  while (highPriorityQueue.length > 0 || normalQueue.length > 0) {
    const { task, resolve, reject } = highPriorityQueue.shift() || normalQueue.shift();

    const wait = MIN_DELAY_MS - (Date.now() - lastRequestAt);
    if (wait > 0) {
      await new Promise(r => setTimeout(r, wait));
    }
    lastRequestAt = Date.now();

    try {
      resolve(await task());
    } catch (e) {
      reject(e);
    }
  }

  processing = false;
}

const REQUEST_TIMEOUT_MS = 15000;

function throttledFetch(url, options, priority) {
  return enqueue(
    () => fetch(url, { ...options, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }),
    priority
  );
}

async function riotFetch(url, apiKey, { priority = false, attempt = 0 } = {}) {
  let res;
  try {
    res = await throttledFetch(url, {
      headers: { 'X-Riot-Token': apiKey }
    }, priority);
  } catch (e) {
    if (e.name === 'TimeoutError' || e.name === 'AbortError') {
      const err = new Error(
        `No response from Riot within ${REQUEST_TIMEOUT_MS / 1000}s (${url}). ` +
        `A firewall/antivirus/VPN may be blocking the connection.`
      );
      err.status = 504;
      throw err;
    }
    throw e;
  }

  if (res.status === 429 && attempt < 5) {
    const retryAfter = parseInt(res.headers.get('retry-after') || '1', 10);
    await new Promise(resolve => setTimeout(resolve, (retryAfter + 0.5) * 1000));
    return riotFetch(url, apiKey, { priority, attempt: attempt + 1 });
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Riot API error ${res.status} at ${url}: ${body}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

async function getAccountByRiotId(gameName, tagLine, apiKey, regionalHost) {
  const url = `https://${regionalHost}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  // Hohe Prioritaet: einzelne, schnelle Anfrage, soll nicht hinter einem
  // laufenden Massen-Abruf von Matches warten muessen.
  return riotFetch(url, apiKey, { priority: true });
}

async function getMatchIdsPage(puuid, { queueId, startTime, start, count }, apiKey, regionalHost) {
  const params = new URLSearchParams({
    queue: String(queueId),
    startTime: String(startTime),
    start: String(start),
    count: String(count)
  });
  const url = `https://${regionalHost}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?${params}`;
  return riotFetch(url, apiKey);
}

async function getAllMatchIds(puuid, { queueId, startTime }, apiKey, regionalHost, maxGames = 1000) {
  console.log(
    `getAllMatchIds: startTime=${startTime} (${new Date(startTime * 1000).toISOString()}), queue=${queueId}`
  );

  const ids = [];
  let start = 0;
  const pageSize = 100;
  while (ids.length < maxGames) {
    const page = await getMatchIdsPage(puuid, { queueId, startTime, start, count: pageSize }, apiKey, regionalHost);
    console.log(`  Page from start=${start}: ${page.length} match IDs received`);
    ids.push(...page);
    if (page.length < pageSize) break;
    start += pageSize;
  }

  console.log(`getAllMatchIds: found ${ids.length} match IDs in total`);
  return ids.slice(0, maxGames);
}

// Fuer LP/Rang - anders als die anderen Endpunkte hier ueber den Platform-
// Host (z.B. euw1), nicht den regionalen Host (europe).
async function getLeagueEntriesByPuuid(puuid, apiKey, platformHost) {
  const url = `https://${platformHost}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  return riotFetch(url, apiKey, { priority: true });
}

// Fuer das Profilbild (profileIconId) - ebenfalls ueber den Platform-Host.
async function getSummonerByPuuid(puuid, apiKey, platformHost) {
  const url = `https://${platformHost}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return riotFetch(url, apiKey, { priority: true });
}

async function getMatch(matchId, apiKey, regionalHost) {
  const cachePath = path.join(CACHE_DIR, `${matchId}.json`);
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }
  const url = `https://${regionalHost}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const data = await riotFetch(url, apiKey);
  fs.writeFileSync(cachePath, JSON.stringify(data));
  return data;
}

module.exports = {
  getAccountByRiotId,
  getAllMatchIds,
  getMatch,
  getLeagueEntriesByPuuid,
  getSummonerByPuuid
};
