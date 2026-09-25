const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Persistiert eine Liste ALLER je gestarteten Challenges pro puuid (nicht nur
// die aktuell laufende) - fuer die "Challenge History"-Liste auf trophies.html.
// Eine Datei pro puuid, ein Array von Eintraegen, chronologisch angehaengt.
//
// Ein Eintrag wird bei "Start Challenge" angelegt (until: null = laeuft noch)
// und bei jedem Trophies-Seitenaufruf per /update mit den aktuellsten Trophy-
// Zahlen synchronisiert (kein teurer Extra-Match-Scan noetig - trophies.html
// hat die Zahlen ohnehin schon aus dem normalen Achievement-Request). Bei
// "Reset Challenge" wird der offene Eintrag mit ended:true final geschlossen
// (until = jetzt). Trophy-Zahlen fuer eine bereits geschlossene Challenge
// koennen NICHT mehr nachtraeglich neu berechnet werden (das zugehoerige
// achievement-state wird beim Reset aktiv geloescht, siehe achievementState.js)
// - der zuletzt bekannte Stand (aus dem letzten /update waehrend die Challenge
// noch lief) bleibt einfach stehen.

const HISTORY_DIR = path.join(__dirname, '..', 'data', 'challenge-history');
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

function filePath(puuid) {
  return path.join(HISTORY_DIR, `${puuid}.json`);
}

function readEntries(puuid) {
  try {
    const raw = fs.readFileSync(filePath(puuid), 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function writeEntries(puuid, entries) {
  try {
    if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });
    fs.writeFileSync(filePath(puuid), JSON.stringify(entries));
  } catch (e) {
    // Nicht kritisch - die History ist ein Bonus-Feature, kein Datenverlust
    // an anderer Stelle, wenn ein Schreibversuch hier mal fehlschlaegt.
  }
}

function startEntry(puuid, { since, champions, role, challengeLevel, lpGoalTier, lpGoalDivision, lpGoalLp }) {
  const entries = readEntries(puuid);
  const entry = {
    id: crypto.randomUUID(),
    since,
    until: null,
    champions: Array.isArray(champions) ? champions : [],
    role: role || '',
    challengeLevel: challengeLevel || '',
    lpGoalTier: lpGoalTier || '',
    lpGoalDivision: lpGoalDivision || '',
    lpGoalLp: lpGoalLp || 0,
    unlockedCount: 0,
    totalCount: 21,
    platinumUnlocked: false
  };
  entries.push(entry);
  writeEntries(puuid, entries);
  return entry;
}

// Findet den zu "since" passenden Eintrag - bei einer laufenden Challenge ist
// das immer der zuletzt offene (until: null); nach dem Schliessen wird er
// nicht mehr per "since" gesucht (ended:true macht daraus den finalen Stand).
function updateEntry(puuid, since, { unlockedCount, totalCount, platinumUnlocked, ended }) {
  const entries = readEntries(puuid);
  const idx = entries.findIndex(e => e.since === since && e.until === null);
  if (idx === -1) return null;
  if (typeof unlockedCount === 'number') entries[idx].unlockedCount = unlockedCount;
  if (typeof totalCount === 'number') entries[idx].totalCount = totalCount;
  if (typeof platinumUnlocked === 'boolean') entries[idx].platinumUnlocked = platinumUnlocked;
  if (ended) entries[idx].until = new Date().toISOString();
  writeEntries(puuid, entries);
  return entries[idx];
}

function listEntries(puuid) {
  return readEntries(puuid).slice().reverse(); // neueste zuerst
}

function deleteEntry(puuid, id) {
  const entries = readEntries(puuid);
  const filtered = entries.filter(e => e.id !== id);
  writeEntries(puuid, filtered);
  return filtered.length !== entries.length;
}

module.exports = { startEntry, updateEntry, listEntries, deleteEntry };
