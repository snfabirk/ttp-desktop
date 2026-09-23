const fs = require('fs');
const path = require('path');

// Electron setzt TTP_USER_DATA_DIR auf app.getPath('userData'), bevor der
// Server gestartet wird - das liegt ausserhalb des Installationsordners und
// wird bei Auto-Updates NICHT ueberschrieben (anders als alles unter
// server/, das bei jedem Update komplett neu installiert wird - dort ging
// der Key bisher bei jedem Update verloren). Ohne Electron (z.B. lokale
// Entwicklung per "node server/server.js" direkt) faellt es zurueck auf den
// server-Ordner selbst.
const PERSIST_DIR = process.env.TTP_USER_DATA_DIR || path.join(__dirname, '..');
const API_KEY_PATH = path.join(PERSIST_DIR, 'riot-api-key.txt');

function loadPersistedApiKey() {
  try {
    if (fs.existsSync(API_KEY_PATH)) {
      return fs.readFileSync(API_KEY_PATH, 'utf-8').trim();
    }
  } catch (e) {
    // Kein persistierter Key vorhanden/lesbar - faellt auf RIOT_API_KEY aus
    // server/.env zurueck (siehe server.js).
  }
  return '';
}

function savePersistedApiKey(value) {
  fs.mkdirSync(PERSIST_DIR, { recursive: true });
  fs.writeFileSync(API_KEY_PATH, value);
}

module.exports = { loadPersistedApiKey, savePersistedApiKey };
