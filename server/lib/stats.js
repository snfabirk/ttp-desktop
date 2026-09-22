// Baut fuer jeden gesuchten Champion einen "Eimer" (Bucket) mit allen
// Kennzahlen, die aus einem einzigen Durchlauf durch die Match-Liste
// gesammelt werden koennen - Wins/Losses, KDA, CS/min, Matchups und die
// letzten Spiele fuer Recent-Games-Liste + Form-Guide.

// Ein Remake (Spielabbruch wegen Leaver/AFK in der ersten Minuten) ist
// weder ein Win noch ein Loss und soll komplett aus der Statistik raus -
// auch wenn Riots Daten dem Spiel trotzdem win:true oder win:false zuweisen.
function isRemake(me) {
  return me.gameEndedInEarlySurrender === true ||
    (me.kills === 0 && me.deaths === 0 && me.assists === 0);
}

// Lane-Win ist NICHT dasselbe wie Game-Win und auch nicht einfach "mehr
// Kills als der Lane-Gegner" - 5/0 als Midlaner heisst nichts, wenn die
// Kills von woanders (Ganks/Roams) kommen und der Gegner selbst nie im
// Nachteil war. Riot berechnet dafuer bereits einen Gold+Exp-Vorsprung
// waehrend der Laning-Phase relativ zum erkannten Lane-Gegner
// (challenges.laningPhaseGoldExpAdvantage, 0 oder 1). Das Feld ist nie bei
// beiden Spielern gleichzeitig 1 - wenn keiner von beiden einen klaren
// Vorsprung geholt hat, steht es bei beiden auf 0 (= Unentschieden).
// Jungler haben konzeptionell keine "Lane", deshalb dort kein Ergebnis.
function laneResultFor(me, opponent) {
  if (!opponent || me.teamPosition === 'JUNGLE') return null;
  const myAdv = me.challenges ? me.challenges.laningPhaseGoldExpAdvantage : undefined;
  const oppAdv = opponent.challenges ? opponent.challenges.laningPhaseGoldExpAdvantage : undefined;
  if (myAdv === undefined || oppAdv === undefined) return null;
  if (myAdv === 1) return 'win';
  if (oppAdv === 1) return 'loss';
  return 'tie';
}

function createBucket() {
  return {
    wins: 0,
    losses: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    durationSeconds: 0,
    laneWins: 0,
    laneLosses: 0,
    laneTies: 0,
    matchupMap: new Map(),
    recentGames: []
  };
}

function addMatchToBucket(bucket, { matchId, me, opponent, championByKey, gameCreation, gameDuration }) {
  const win = me.win;
  if (win) bucket.wins += 1; else bucket.losses += 1;

  bucket.kills += me.kills;
  bucket.deaths += me.deaths;
  bucket.assists += me.assists;
  bucket.cs += (me.totalMinionsKilled || 0) + (me.neutralMinionsKilled || 0);
  bucket.durationSeconds += gameDuration;

  const laneResult = laneResultFor(me, opponent);
  if (laneResult === 'win') bucket.laneWins += 1;
  else if (laneResult === 'loss') bucket.laneLosses += 1;
  else if (laneResult === 'tie') bucket.laneTies += 1;

  let opponentInfo = null;
  if (opponent) {
    const oKey = String(opponent.championId);
    const known = championByKey.get(oKey);
    opponentInfo = {
      key: oKey,
      id: known ? known.id : opponent.championName,
      name: known ? known.name : opponent.championName
    };

    const entry = bucket.matchupMap.get(oKey) || {
      key: oKey,
      id: opponentInfo.id,
      name: opponentInfo.name,
      games: 0,
      wins: 0,
      losses: 0,
      laneWins: 0,
      laneLosses: 0,
      laneTies: 0
    };
    entry.games += 1;
    if (win) entry.wins += 1; else entry.losses += 1;
    if (laneResult === 'win') entry.laneWins += 1;
    else if (laneResult === 'loss') entry.laneLosses += 1;
    else if (laneResult === 'tie') entry.laneTies += 1;
    bucket.matchupMap.set(oKey, entry);
  }

  bucket.recentGames.push({
    matchId,
    win,
    laneResult,
    kills: me.kills,
    deaths: me.deaths,
    assists: me.assists,
    cs: (me.totalMinionsKilled || 0) + (me.neutralMinionsKilled || 0),
    durationSeconds: gameDuration,
    gameCreation,
    opponent: opponentInfo
  });
}

function finalizeBucket(bucket) {
  const totalGames = bucket.wins + bucket.losses;
  const minutes = bucket.durationSeconds / 60;

  const avgKills = totalGames > 0 ? bucket.kills / totalGames : 0;
  const avgDeaths = totalGames > 0 ? bucket.deaths / totalGames : 0;
  const avgAssists = totalGames > 0 ? bucket.assists / totalGames : 0;
  const kda = bucket.deaths > 0
    ? (bucket.kills + bucket.assists) / bucket.deaths
    : (bucket.kills + bucket.assists);
  const csPerMin = minutes > 0 ? bucket.cs / minutes : 0;

  const recentGames = [...bucket.recentGames]
    .sort((a, b) => b.gameCreation - a.gameCreation)
    .slice(0, 10);

  const form = recentGames.slice(0, 10).map(g => g.win);

  const laneDecided = bucket.laneWins + bucket.laneLosses;

  const matchups = [...bucket.matchupMap.values()].map(m => {
    const mLaneDecided = m.laneWins + m.laneLosses;
    return {
      ...m,
      laneWinrate: mLaneDecided > 0 ? round1((m.laneWins / mLaneDecided) * 100) : null
    };
  }).sort((a, b) => b.games - a.games);

  return {
    totalGames,
    wins: bucket.wins,
    losses: bucket.losses,
    avgKills: round1(avgKills),
    avgDeaths: round1(avgDeaths),
    avgAssists: round1(avgAssists),
    kda: round2(kda),
    csPerMin: round1(csPerMin),
    laneWins: bucket.laneWins,
    laneLosses: bucket.laneLosses,
    laneTies: bucket.laneTies,
    laneWinrate: laneDecided > 0 ? round1((bucket.laneWins / laneDecided) * 100) : null,
    matchups,
    recentGames,
    form
  };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
function round2(n) {
  return Math.round(n * 100) / 100;
}

// Aktueller Lauf + laengster bekannter Win-/Loss-Lauf INNERHALB des
// gescannten Zeitraums (nicht Karriere-weit - dafuer muessten wir viel
// weiter als "since" zurueckscannen). games: [{ win, gameCreation }, ...]
// in beliebiger Reihenfolge - wird hier selbst chronologisch sortiert.
function computeStreaks(games) {
  const sorted = [...games].sort((a, b) => a.gameCreation - b.gameCreation);

  let bestWinStreak = 0;
  let worstLossStreak = 0;
  let runWin = null;
  let runLength = 0;

  sorted.forEach(g => {
    if (g.win === runWin) {
      runLength += 1;
    } else {
      runWin = g.win;
      runLength = 1;
    }
    if (runWin) bestWinStreak = Math.max(bestWinStreak, runLength);
    else worstLossStreak = Math.max(worstLossStreak, runLength);
  });

  let current = null;
  if (sorted.length > 0) {
    const currentWin = sorted[sorted.length - 1].win;
    let count = 1;
    for (let i = sorted.length - 2; i >= 0 && sorted[i].win === currentWin; i--) {
      count += 1;
    }
    current = { win: currentWin, count };
  }

  return { current, bestWinStreak, worstLossStreak };
}

module.exports = { createBucket, addMatchToBucket, finalizeBucket, isRemake, computeStreaks };
