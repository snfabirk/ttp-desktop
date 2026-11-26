// Arena-Challenges (v6.13.0, Nutzervorgabe 2026-11-26).
//
// Drei Stufen, immer eine Steigerung (keine Easy/Normal/Hard bei Arena):
//   Riot God     = 60 zufaellige Champions (Riots eigene God-Definition)
//   Elder God    = 100 zufaellige Champions
//   Ultimate God = ALLE Champions, waechst mit jedem neuen Champion mit
// Bei Riot/Elder God wird die Auswahl beim Start verdeckt gezogen - der
// Spieler sieht nur alphabetisch einsortierte "?"-Platzhalter.
//
// Rollen (bei allen drei Stufen): der Spieler rollt per Knopf 2 Champions.
// Nur das NAECHSTE Arena-Spiel mit einem der beiden zaehlt:
//   - Platz 1 damit -> Champion geschafft
//   - danach (egal ob Platz 1 oder nicht) ist das Paar "verbraucht" (spent)
//     und der Spieler rollt per Knopf ein neues (v6.13.0, Nutzer: grosser
//     Roll-Knopf, der zum Reroll-Knopf wird)
// Ein Spiel mit einem anderen Champion zaehlt nicht, das Paar bleibt stehen;
// es gibt dafuer nur Profil-XP, keine Pass-XP. 1 Reroll pro Tag.
// Es zaehlt nur Platz 1 (im Match-V5 ist "win" schon bei Top 4 true).
//
// Verfuegbarkeit: die oeffentliche Riot-API kennt keine "aktiven Queues". Der
// lokale League-Client schon (LCU /lol-game-queues/v1/queues) - der zuletzt
// gesehene Stand wird gespeichert, damit die Auswahl auch bei geschlossenem
// Client stimmt. Unbekannt (Client nie offen gewesen) = verfuegbar, Arena ist
// seit 2025 ein permanenter Modus.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DATA_DIR } = require('./dataPaths');
const lcu = require('./lcu');

const ARENA_QUEUES = [1700, 1710];
const VARIANTS = {
  riot: { id: 'riot', name: 'Riot God', target: 60 },
  elder: { id: 'elder', name: 'Elder God', target: 100 },
  ultimate: { id: 'ultimate', name: 'Ultimate God', target: null } // null = alle Champions
};
// Kuerzer als das: Remake / Abbruch, zaehlt nicht
const MIN_GAME_SECONDS = 300;

// ----- Champion-Liste (Data Dragon, faellt auf die mitgelieferte zurueck) -----
let champCache = { at: 0, list: null, version: null };
const CHAMP_TTL = 6 * 60 * 60 * 1000;
function bundledChampions() {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'data', 'champions.json'), 'utf-8'))
      .map(c => ({ id: c.id, key: String(c.key), name: c.name }));
  } catch (e) { return []; }
}
async function allChampions() {
  if (champCache.list && Date.now() - champCache.at < CHAMP_TTL) return champCache;
  try {
    const versions = await (await fetch('https://ddragon.leagueoflegends.com/api/versions.json', { signal: AbortSignal.timeout(6000) })).json();
    const version = versions[0];
    const data = await (await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`, { signal: AbortSignal.timeout(8000) })).json();
    const list = Object.values(data.data).map(c => ({ id: c.id, key: String(c.key), name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    champCache = { at: Date.now(), list, version };
  } catch (e) {
    // Offline: mitgelieferte Liste, in 5 min erneut versuchen
    if (!champCache.list) champCache = { at: Date.now() - CHAMP_TTL + 5 * 60 * 1000, list: bundledChampions().sort((a, b) => a.name.localeCompare(b.name)), version: null };
  }
  return champCache;
}

// ----- Verfuegbarkeit -----
const AVAIL_FILE = path.join(DATA_DIR, 'mode-availability.json');
function readAvail() {
  try { return JSON.parse(fs.readFileSync(AVAIL_FILE, 'utf-8')); } catch (e) { return {}; }
}
function writeAvail(s) {
  try { fs.writeFileSync(AVAIL_FILE, JSON.stringify(s, null, 2)); } catch (e) {}
}
let lastCheck = 0;
const CHECK_EVERY = 10 * 60 * 1000;
async function availability({ force = false } = {}) {
  const state = readAvail();
  if (force || Date.now() - lastCheck > CHECK_EVERY) {
    lastCheck = Date.now();
    const queues = await lcu.gameQueues();
    if (queues) {
      const arena = queues.filter(q => ARENA_QUEUES.includes(q.id) || q.gameMode === 'CHERRY');
      const available = arena.some(q => q.queueAvailability !== 'PlatformDisabled' && q.isVisible !== false);
      state.arena = { available, checkedAt: new Date().toISOString(), source: 'client' };
      writeAvail(state);
    }
  }
  const a = state.arena;
  return { arena: { available: a ? a.available !== false : true, known: Boolean(a), checkedAt: a ? a.checkedAt : null } };
}

// ----- Lauf-Logik -----
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Alle Champions, die zu diesem Lauf gehoeren (Ultimate: aktuelle Liste)
function poolKeys(run, champions) {
  return run.variant === 'ultimate' ? champions.map(c => c.key) : (run.pool || []);
}
function remainingKeys(run, champions) {
  return poolKeys(run, champions).filter(k => !run.won[k]);
}
function targetFor(run, champions) {
  const v = VARIANTS[run.variant] || VARIANTS.riot;
  return v.target == null ? champions.length : v.target;
}

// Neues Paar aus den noch offenen Champions. avoid: wenn moeglich nicht
// dieselben wieder (Reroll soll sich nach Reroll anfuehlen).
function rollPair(run, champions, at, avoid = []) {
  const remaining = remainingKeys(run, champions);
  let candidates = remaining.filter(k => !avoid.includes(k));
  if (candidates.length < Math.min(2, remaining.length)) candidates = remaining;
  const champs = shuffled(candidates).slice(0, 2);
  const seq = ((run.roll && run.roll.seq) || 0) + 1;
  run.roll = champs.length ? { champs, at, seq, spent: null } : null;
  return run.roll;
}

// Aktives (noch nicht verbrauchtes) Paar?
const hasActivePair = run => Boolean(run.roll && !run.roll.spent);
function needsRoll(run, champions) {
  return !hasActivePair(run) && remainingKeys(run, champions).length > 0;
}
// Roll-Knopf: nur ohne aktives Paar
function roll(run, champions, now = Date.now()) {
  if (!needsRoll(run, champions)) return false;
  rollPair(run, champions, now);
  return true;
}

function newRun(variant, champions, now = Date.now()) {
  const v = VARIANTS[variant] || VARIANTS.riot;
  const run = {
    mode: 'arena', since: new Date(now).toISOString(), variant: v.id,
    pool: v.target == null ? null : shuffled(champions.map(c => c.key)).slice(0, v.target),
    won: {}, roll: null, processed: [], rerollDay: null
  };
  return run; // erstes Paar rollt der Spieler selbst
}

// Arbeitet neue Arena-Spiele (aelteste zuerst) gegen den Lauf ab. Veraendert
// run, liefert die Spiele fuer die XP-Gutschrift zurueck.
function advanceRun(run, matches, findMe, champions) {
  const done = new Set(run.processed);
  const xpGames = [];
  const sorted = matches.filter(m => !done.has(m.metadata.matchId))
    .sort((a, b) => a.info.gameCreation - b.info.gameCreation);
  for (const m of sorted) {
    run.processed.push(m.metadata.matchId);
    const me = findMe(m);
    if (!me || (m.info.gameDuration || 0) < MIN_GAME_SECONDS) continue;
    const key = String(me.championId);
    const placement = me.placement || me.subteamPlacement || 0;
    const end = m.info.gameEndTimestamp || (m.info.gameCreation + (m.info.gameDuration || 0) * 1000);
    // Gilt nur mit aktivem Paar und wenn das Spiel NACH dem Rollen anfing
    const rolled = Boolean(hasActivePair(run) && m.info.gameCreation >= run.roll.at && run.roll.champs.includes(key));
    if (rolled) {
      const won = placement === 1 && !run.won[key];
      if (won) run.won[key] = { at: end, matchId: m.metadata.matchId };
      run.roll.spent = { matchId: m.metadata.matchId, key, placement, won: placement === 1 };
    }
    xpGames.push({ match: m, me, rolled, placement });
  }
  return xpGames;
}

function canReroll(run, today) {
  return hasActivePair(run) && run.rerollDay !== today;
}
function reroll(run, champions, today, now = Date.now()) {
  if (!canReroll(run, today)) return false;
  const avoid = run.roll ? run.roll.champs : [];
  rollPair(run, champions, now, avoid);
  run.rerollDay = today;
  return true;
}

// Ansicht fuer den Client. Verdeckte Champions werden NICHT mitgeschickt -
// nur als null-Platzhalter an ihrer alphabetischen Stelle.
function view(run, champions, games, today) {
  const byKey = new Map(champions.map(c => [c.key, c]));
  const keys = poolKeys(run, champions);
  const target = targetFor(run, champions);
  const rolledKeys = new Set(run.roll ? run.roll.champs : []);
  const hidden = run.variant !== 'ultimate';
  const slots = keys.map(k => byKey.get(k) || { id: '', key: k, name: '' })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(c => {
      const w = run.won[c.key];
      const visible = !hidden || w || rolledKeys.has(c.key);
      return visible
        ? { key: c.key, id: c.id, name: c.name, won: w ? w.at : null, rolled: rolledKeys.has(c.key) && !run.roll.spent }
        : { key: null };
    });
  const count = keys.filter(k => run.won[k]).length;
  const sortedGames = [...games].sort((a, b) => b.at - a.at);
  return {
    variant: run.variant, variantName: (VARIANTS[run.variant] || VARIANTS.riot).name,
    since: run.since, target, count, completed: target > 0 && count >= target,
    hidden, slots,
    roll: run.roll ? { seq: run.roll.seq, at: run.roll.at, spent: run.roll.spent, champs: run.roll.champs.map(k => byKey.get(k) || { key: k, id: '', name: '' }) } : null,
    needsRoll: needsRoll(run, champions),
    canReroll: canReroll(run, today),
    totalGames: games.length,
    firstPlaces: games.filter(g => g.placement === 1).length,
    avgPlacement: games.length ? Math.round((games.reduce((s, g) => s + g.placement, 0) / games.length) * 10) / 10 : null,
    recent: sortedGames.slice(0, 12)
  };
}

module.exports = { ARENA_QUEUES, VARIANTS, MIN_GAME_SECONDS, allChampions, availability, newRun, advanceRun, roll, reroll, view, targetFor };
