// Set-Releases (v6.10.0, Nutzer 2026-11-10): die naechsten regulaeren Sets
// erscheinen zu zufaellig ausgewuerfelten Terminen (Mittwoch 00:00 deutsche
// Zeit, mind. 3 Wochen Abstand, bis Ende Februar 2027). Termine + Reihenfolge
// sind GEHEIM - auch der Nutzer/Entwickler soll sie nicht kennen. Deshalb nur
// verschleiert hier abgelegt; nie im Klartext ausgeben, loggen oder committen.
//
// Zeit: kommt vom Supabase-Server (HTTP-Date-Header), damit das Vorstellen der
// PC-Uhr nichts bringt. Ohne Verbindung zaehlt der hoechste bisher gesehene
// Serverzeitpunkt (gespeichert) - erschienene Sets bleiben erschienen, neue
// kommen erst, wenn wieder eine echte Uhrzeit da ist.
const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('./dataPaths');

// Slot -> Set-Id (Slot 0 = Lock In, 1 = Worlds Stage, 2 = Ranked Climb) - Reihenfolge NIE aendern
const SLOT_IDS = ['lockin', 'worlds', 'ranked'];
const BLOB = 'LwoKbtXhiU08ByfP6bBFfk1eh5ChVTIbJ8KL+kpgCi7xhr9/bjM4+4n4UmoKybOBpUlvDseRvg==';
const TEASER_MS = 7 * 86400000;           // Ankuendigung 1 Woche vorher

const SCHEDULE = (() => {
  try {
    const KEY = 'ttp-pony-release-v1';
    const b = Buffer.from(BLOB, 'base64');
    const raw = Buffer.from(b.map((x, i) => x ^ KEY.charCodeAt(i % KEY.length) ^ ((i * 37) & 255)));
    return JSON.parse(raw.toString()).map(([slot, at]) => ({ id: SLOT_IDS[slot], at }));
  } catch (e) { return []; }
})();

// ---------- vertrauenswuerdige Uhr ----------
const SUPABASE_URL = 'https://qrpfbnnapsvsfxvpwjfu.supabase.co';
const CLOCK_FILE = path.join(DATA_DIR, 'release-clock.json');
let offset = null, syncedAt = 0, syncing = null;
let highWater = (() => { try { return Number(JSON.parse(fs.readFileSync(CLOCK_FILE, 'utf8')).hw) || 0; } catch (e) { return 0; } })();
function saveHighWater(t) {
  if (t <= highWater + 60000) { highWater = Math.max(highWater, t); return; }   // nicht bei jedem Aufruf schreiben
  highWater = t;
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(CLOCK_FILE, JSON.stringify({ hw: t })); } catch (e) { /* best effort */ }
}
async function syncClock() {
  if (syncing) return syncing;
  syncing = (async () => {
    try {
      const t0 = Date.now();
      const r = await fetch(`${SUPABASE_URL}/auth/v1/health`, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      const d = Date.parse(r.headers.get('date') || '');
      if (!Number.isFinite(d)) return;
      const t1 = Date.now();
      // Date-Header hat Sekundengenauigkeit: Mitte der Sekunde + halbe Laufzeit
      offset = d + 500 - (t0 + t1) / 2;
      syncedAt = t1;
      saveHighWater(t1 + offset);
    } catch (e) { /* offline - spaeter erneut */ } finally { syncing = null; }
  })();
  return syncing;
}
// alle 30 min neu abgleichen, ohne Abgleich alle 2 min versuchen (z. B. nach Standby ohne Netz)
syncClock();
setInterval(() => { if (offset == null || Date.now() - syncedAt > 30 * 60000 || Date.now() < syncedAt) syncClock(); }, 2 * 60000).unref();

function now() {
  if (offset != null) {
    // Sprung der PC-Uhr (Standby, Umstellen) -> Abgleich auffrischen, Wert bleibt bis dahin gueltig
    if (Math.abs(Date.now() - syncedAt) > 35 * 60000) syncClock();
    const t = Date.now() + offset;
    saveHighWater(t);
    return t;
  }
  return highWater;          // ohne echte Uhr: nichts Neues freischalten
}

// ---------- Testinstanz ----------
// TTP_TEST_SET2=1      -> alle kommenden Sets sind schon erschienen (wie bisher)
// TTP_TEST_TEASER=<id> -> <id> wird gerade angekuendigt, erscheint TTP_TEST_TEASER_SECS (Std. 2 Tage) nach Serverstart
// TTP_TEST_RELEASE=<id> (stickers.js) -> <id> ist heute erschienen
const testStart = Date.now();
function scheduleFor(id) {
  const tz = process.env.TTP_TEST_TEASER;
  if (tz && tz === id) return testStart + (Number(process.env.TTP_TEST_TEASER_SECS) || 2 * 86400) * 1000;
  if (process.env.TTP_TEST_RELEASE === id) return testStart - 60000;
  const e = SCHEDULE.find(s => s.id === id);
  return e ? e.at : null;
}
const isUpcomingId = id => SLOT_IDS.includes(id);
function isReleased(id) {
  if (!isUpcomingId(id)) return true;
  if (process.env.TTP_TEST_SET2 === '1' && process.env.TTP_TEST_TEASER !== id) return true;
  const at = scheduleFor(id);
  const t = process.env.TTP_TEST_TEASER === id || process.env.TTP_TEST_RELEASE === id ? Date.now() : now();
  return at != null && t >= at;
}
function releaseAt(id) { return scheduleFor(id); }
// laufende Ankuendigung (hoechstens eine - die Termine liegen >= 3 Wochen auseinander)
function teaser(knownIds) {
  for (const id of SLOT_IDS) {
    if (knownIds && !knownIds.includes(id)) continue;
    const at = scheduleFor(id);
    if (at == null || isReleased(id)) continue;
    const t = process.env.TTP_TEST_TEASER === id ? Date.now() : now();
    if (t >= at - TEASER_MS) return { id, at };
  }
  return null;
}

module.exports = { isReleased, releaseAt, teaser, now, syncClock, isUpcomingId, TEASER_MS };
