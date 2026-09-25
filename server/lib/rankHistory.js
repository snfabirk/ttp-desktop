const fs = require('fs');
const path = require('path');

// Riot liefert nur den AKTUELLEN LP-Stand, keine Historie. Um "LP gained/lost
// seit Datum X" ueberhaupt anzeigen zu koennen, legen wir bei jedem Abruf
// selbst einen Snapshot ab - der Delta-Wert wird dadurch erst mit der Zeit
// verlaesslich, ab dem Moment ab dem wir selbst zu tracken begonnen haben.

const HISTORY_DIR = path.join(__dirname, '..', 'data', 'rank-history');
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

const TIER_ORDER = [
  'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD',
  'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'
];
const RANK_VALUE = { I: 3, II: 2, III: 1, IV: 0 };

// Wandelt Tier+Rank+LP in eine einzelne vergleichbare Zahl um (400 "virtuelle
// LP" pro Tier, 100 pro Division), damit man ueber Aufstiege/Abstiege hinweg
// einfach subtrahieren kann. Apex-Tiers (Master+) haben keine Divisions,
// dort zaehlt nur der rohe LP-Wert (kann > 100 sein).
function toComparableLP(tier, rank, leaguePoints) {
  const tierIndex = TIER_ORDER.indexOf(tier);
  if (tierIndex < 0) return leaguePoints || 0;
  if (tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER') {
    return tierIndex * 400 + (leaguePoints || 0);
  }
  const rankValue = RANK_VALUE[rank] ?? 0;
  return tierIndex * 400 + rankValue * 100 + (leaguePoints || 0);
}

function historyPath(puuid) {
  return path.join(HISTORY_DIR, `${puuid}.json`);
}

function readHistory(puuid) {
  const filePath = historyPath(puuid);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function writeHistory(puuid, history) {
  // HISTORY_DIR wird nur einmal beim Modul-Laden angelegt (siehe oben) - kann
  // aber zur Laufzeit verschwinden (z.B. durch den "Werkseinstellungen
  // zuruecksetzen"-Button, der den ganzen Ordner loescht, waehrend der Server
  // weiterlaeuft), deshalb hier defensiv vor jedem Schreibzugriff neu anlegen.
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });
  fs.writeFileSync(historyPath(puuid), JSON.stringify(history));
}

function isSameDay(tsA, tsB) {
  const a = new Date(tsA);
  const b = new Date(tsB);
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// entry: { tier, rank, leaguePoints, wins, losses } (Riot league-v4 Format,
// wins/losses hier season-total, nicht "seit Datum"). Gibt die vollstaendige,
// evtl. aktualisierte Historie zurueck.
//
// Der Graph soll nicht mit jedem einzelnen Spiel ueberladen werden - egal ob
// an einem Tag 1 oder 20 Spiele gemacht wurden, zaehlt fuer den Graphen nur
// der zuletzt aktualisierte LP-Stand dieses Tages. Bei jedem Update wird der
// heutige Eintrag deshalb ueberschrieben statt einen neuen anzuhaengen; erst
// am naechsten Kalendertag entsteht ein neuer Punkt.
function recordSnapshot(puuid, entry) {
  const history = readHistory(puuid);
  const now = Date.now();
  const last = history[history.length - 1];

  const snapshot = {
    timestamp: now,
    tier: entry.tier,
    rank: entry.rank,
    leaguePoints: entry.leaguePoints,
    wins: entry.wins,
    losses: entry.losses
  };

  if (last && !last.manual && isSameDay(last.timestamp, now)) {
    history[history.length - 1] = snapshot;
  } else {
    history.push(snapshot);
    // Datei nicht unbegrenzt wachsen lassen.
    if (history.length > 2000) history.splice(0, history.length - 2000);
  }
  writeHistory(puuid, history);

  return history;
}

// Letzter Snapshot mit timestamp <= sinceMs, oder null wenn die Historie
// noch nicht so weit zurueckreicht.
function findSnapshotAtOrBefore(history, sinceMs) {
  let found = null;
  for (const snap of history) {
    if (snap.timestamp <= sinceMs) found = snap;
    else break;
  }
  return found;
}

// Vom Nutzer manuell eingegebener Rang/LP-Stand (Champion-Auswahl-Seite) als
// Ersatz fuer eine echte Historie, wenn wir selbst noch keinen Snapshot vor
// dem gewaehlten "Since"-Datum haben. Ueberschreibt einen vorherigen
// manuellen Eintrag zum selben Zeitpunkt (z.B. wenn der Nutzer den Wert
// korrigiert), statt Duplikate anzuhaeufen.
function seedManualSnapshot(puuid, timestampMs, entry) {
  const history = readHistory(puuid);
  const idx = history.findIndex(s => s.manual && s.timestamp === timestampMs);
  const snapshot = {
    timestamp: timestampMs,
    tier: entry.tier,
    rank: entry.rank || 'I',
    leaguePoints: Number(entry.leaguePoints) || 0,
    manual: true
  };
  if (idx >= 0) {
    history[idx] = snapshot;
  } else {
    history.push(snapshot);
    history.sort((a, b) => a.timestamp - b.timestamp);
  }
  writeHistory(puuid, history);
  return history;
}

module.exports = { recordSnapshot, readHistory, findSnapshotAtOrBefore, toComparableLP, seedManualSnapshot };
