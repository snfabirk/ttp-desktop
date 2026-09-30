const fs = require('fs');
const path = require('path');

// Zentrale Speicherorte fuer alles, was der Server zur Laufzeit selbst
// anlegt (Challenge History, LP-Verlauf, Achievement-State, Match-Cache).
//
// Bis v4.26.5 lag das unter server/data bzw. server/cache - also IM
// Installationsordner. Den ersetzt jedes Auto-Update komplett, d.h. bei
// jedem Update gingen die komplette Challenge History, der LP-Verlauf und
// der Achievement-State verloren (gleiches Problem wie frueher beim API-Key,
// siehe envStore.js). Jetzt unter TTP_USER_DATA_DIR (= Electrons userData,
// %AppData%\Roaming\three-trick-pony-desktop), das Updates ueberlebt.
// Bewusst "ttp-data"/"ttp-cache" statt "data"/"cache": Chromium legt dort
// selbst schon einen "Cache"-Ordner an, und Windows unterscheidet nicht
// zwischen Gross-/Kleinschreibung.
//
// Ohne Electron (lokale Entwicklung per "node server/server.js") bleibt es
// beim alten Ort im server-Ordner.
const LEGACY_DATA_DIR = path.join(__dirname, '..', 'data');
const LEGACY_CACHE_DIR = path.join(__dirname, '..', 'cache');
const USER_DATA_DIR = process.env.TTP_USER_DATA_DIR || '';

const DATA_DIR = USER_DATA_DIR ? path.join(USER_DATA_DIR, 'ttp-data') : LEGACY_DATA_DIR;
const CACHE_DIR = USER_DATA_DIR ? path.join(USER_DATA_DIR, 'ttp-cache') : LEGACY_CACHE_DIR;

// Einmalige Migration: liegt am neuen Ort noch nichts, aber im alten
// Installationsordner schon (erster Start nach dem Update auf die Version
// mit diesem Fix), wird der alte Stand uebernommen statt verworfen.
function migrateLegacyData() {
  if (!USER_DATA_DIR || fs.existsSync(DATA_DIR)) return;
  try {
    if (fs.existsSync(LEGACY_DATA_DIR)) {
      fs.cpSync(LEGACY_DATA_DIR, DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // Migration ist best-effort - schlimmstenfalls startet man mit leerer
    // History, genau wie vor diesem Fix nach jedem Update.
  }
}
migrateLegacyData();

function dataSubdir(name) {
  const dir = path.join(DATA_DIR, name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = { DATA_DIR, CACHE_DIR, LEGACY_DATA_DIR, LEGACY_CACHE_DIR, dataSubdir };
