// Set-Releases (Nutzer 2026-11-22): neue Sets werden von Hand angekuendigt
// (ANNOUNCED). Automatik nur als Notnagel: AUTO_WEEKS ohne Release -> ein
// zufaelliges Set aus dem POOL erscheint, TEASER_DAYS vorher angekuendigt.
// Welches das ist, bleibt GEHEIM (auch fuer den Nutzer): buildSchedule fuer
// kuenftige Automatik-Releases nie ausgeben, loggen oder committen.
//
// Zeit: kommt vom Supabase-Server (HTTP-Date-Header), damit das Vorstellen der
// PC-Uhr nichts bringt. Ohne Verbindung zaehlt der hoechste bisher gesehene
// Serverzeitpunkt (gespeichert) - erschienene Sets bleiben erschienen, neue
// kommen erst, wenn wieder eine echte Uhrzeit da ist.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DATA_DIR } = require('./dataPaths');

// Fertige regulaere Sets. since = ab wann die Automatik es nehmen darf (Tag der
// App-Version, die es mitbringt). Eintraege nie entfernen, auch nicht nach Release.
// Jedes Set braucht auch einen Eintrag in stickers.js UPCOMING.
const POOL = [
  { id: 'lockin', since: '2026-11-10' },
  { id: 'worlds', since: '2026-11-10' },
  { id: 'ranked', since: '2026-11-10' }
];

// SET ANKUENDIGEN: Zeile anhaengen + App-Update veroeffentlichen.
//   announced = Tag des Updates (ab dann Popup, Shop-Karte, Anmeldung); NIE rueckdatieren
//   release   = Erscheinungstag, 00:00 deutscher Zeit
// Alte Zeilen nie loeschen oder aendern, die 12 Wochen zaehlen ab dem letzten Release.
// Hat die Automatik ein Set schon angekuendigt, bleibt es dabei.
const ANNOUNCED = [
  { id: 'worlds', announced: '2026-11-22', release: '2026-11-25' }    // Hommage an die Worlds
];

const AUTO_WEEKS = 12;
const TEASER_DAYS = 7;                    // Vorlauf der automatischen Ankuendigung
const WEDNESDAY = 3;
// Zufall, der bei allen Installationen gleich ausfaellt. NIE aendern.
const SEED = '9c418fe0c5d0439f40c9f6058914a46c';

// ---------- Zeitplan (gerechnet wird mit Kalendertagen 'YYYY-MM-DD') ----------
const addDays = (day, n) => new Date(Date.parse(day) + n * 86400000).toISOString().slice(0, 10);
const onOrAfterWednesday = day => addDays(day, (WEDNESDAY - new Date(day).getUTCDay() + 7) % 7);
const berlinHour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' });
// 00:00 in Berlin ist 22:00 (Sommer) oder 23:00 UTC (Winter) am Vortag
function berlinMidnight(day) {
  const summer = Date.parse(day) - 2 * 3600000;
  return Number(berlinHour.format(summer)) === 0 ? summer : summer + 3600000;
}
const drawKey = (seed, day, id) => crypto.createHash('sha256').update(`${seed}|${day}|${id}`).digest('hex');

// Reine Funktion ohne Uhr: derselbe Input ergibt bei allen denselben Plan.
function buildSchedule(pool, announced, seed) {
  const plan = [];
  function nextAuto() {
    const left = pool.filter(s => !plan.some(e => e.id === s.id));
    if (!plan.length || !left.length) return null;
    const last = plan.map(e => e.release).sort().pop();
    // ein spaet fertig gewordenes Set bekommt trotzdem seine volle Ankuendigungswoche
    const ready = addDays(left.map(s => s.since).sort()[0], TEASER_DAYS);
    const release = onOrAfterWednesday([addDays(last, AUTO_WEEKS * 7), ready].sort().pop());
    const teaserDay = addDays(release, -TEASER_DAYS);
    // nur Sets, die es da schon gab: ein neues Set im Pool aendert keine alte Ziehung
    const pick = left.filter(s => s.since <= teaserDay)
      .map(s => ({ id: s.id, key: drawKey(seed, release, s.id) }))
      .sort((a, b) => a.key.localeCompare(b.key))[0];
    return { id: pick.id, announced: teaserDay, release };
  }
  for (const m of [...announced].sort((a, b) => a.announced.localeCompare(b.announced))) {
    // was die Automatik vor dieser Ankuendigung schon angekuendigt hat, bleibt stehen
    for (let a; (a = nextAuto()) && a.announced <= m.announced;) plan.push(a);
    const known = plan.find(e => e.id === m.id);
    if (!known) plan.push({ ...m });
    else if (m.announced < known.release) known.release = m.release;    // Termin von Hand geht vor
  }
  for (let a; (a = nextAuto());) plan.push(a);
  return plan
    .map(e => ({ id: e.id, announcedAt: berlinMidnight(e.announced), at: berlinMidnight(e.release) }))
    .sort((a, b) => a.at - b.at);
}

// Ein Tippfehler kostet nur seine Zeile, nicht die App oder die schon erschienenen Sets
const isDay = d => /^\d{4}-\d\d-\d\d$/.test(d) && !isNaN(Date.parse(d)) && addDays(d, 0) === d;
function validAnnouncements(pool, rows) {
  return rows.filter(m => {
    const ok = pool.some(s => s.id === m.id) && isDay(m.announced) && isDay(m.release) && m.announced <= m.release;
    if (!ok) console.error('Invalid set announcement ignored:', JSON.stringify(m));
    return ok;
  });
}
const SCHEDULE = buildSchedule(POOL, validAnnouncements(POOL, ANNOUNCED), SEED);

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
const isUpcomingId = id => POOL.some(s => s.id === id);
function isReleased(id) {
  if (!isUpcomingId(id)) return true;
  if (process.env.TTP_TEST_SET2 === '1' && process.env.TTP_TEST_TEASER !== id) return true;
  const at = scheduleFor(id);
  const t = process.env.TTP_TEST_TEASER === id || process.env.TTP_TEST_RELEASE === id ? Date.now() : now();
  return at != null && t >= at;
}
// Erst ab Release: sonst verraet die Album-Reihenfolge mit TTP_TEST_SET2 die Ziehung
function releaseAt(id) {
  const at = scheduleFor(id);
  return at != null && now() >= at ? at : null;
}
// laufende Ankuendigung (die mit dem naechsten Termin)
function teaser(knownIds) {
  const known = id => !knownIds || knownIds.includes(id);
  const tz = process.env.TTP_TEST_TEASER;
  if (tz && known(tz) && isUpcomingId(tz) && !isReleased(tz)) return { id: tz, at: scheduleFor(tz) };
  const t = now();
  for (const e of SCHEDULE) {
    if (known(e.id) && t >= e.announcedAt && !isReleased(e.id)) return { id: e.id, at: e.at };
  }
  return null;
}

module.exports = { isReleased, releaseAt, teaser, now, syncClock, isUpcomingId, buildSchedule, validAnnouncements };
