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

// 1740/1750 = Arena seit Ende 2026 (vorher 1700/1710). Zusaetzlich merkt sich
// availability() die CHERRY-Queues, die der Client meldet (arenaQueues()).
const ARENA_QUEUES = [1700, 1704, 1710, 1740, 1750];
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
      const queueIds = arena.map(q => q.id).filter(id => Number.isInteger(id));
      state.arena = { available, checkedAt: new Date().toISOString(), source: 'client', queueIds };
      writeAvail(state);
    }
  }
  const a = state.arena;
  return { arena: { available: a ? a.available !== false : true, known: Boolean(a), checkedAt: a ? a.checkedAt : null } };
}

// Alle bekannten Arena-Queues: feste Liste + zuletzt vom Client gemeldete
function arenaQueues() {
  const a = readAvail().arena;
  return [...new Set([...ARENA_QUEUES, ...((a && Array.isArray(a.queueIds)) ? a.queueIds : [])])];
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
  // Gespieltes, noch nicht ausgewertetes Paar + aufgehobene nie direkt wieder
  // (sonst waere unklar, zu welchem Paar das naechste Spiel gehoert)
  if (run.roll && run.roll.played && !run.roll.spent) avoid = [...avoid, ...run.roll.champs];
  (run.pending || []).forEach(p => { avoid = [...avoid, ...p.champs]; });
  const remaining = remainingKeys(run, champions);
  let candidates = remaining.filter(k => !avoid.includes(k));
  if (candidates.length < Math.min(2, remaining.length)) candidates = remaining;
  const champs = shuffled(candidates).slice(0, 2);
  const seq = ((run.roll && run.roll.seq) || 0) + 1;
  // v6.15.0: Paar wurde laut Client schon gespielt, Riot hat das Spiel aber
  // noch nicht -> aufheben, advanceRun wertet es nach, sobald es da ist
  if (run.roll && run.roll.played && !run.roll.spent) {
    run.pending = [...(run.pending || []), { champs: run.roll.champs, at: run.roll.at, played: run.roll.played }].slice(-5);
  }
  run.roll = champs.length ? { champs, at, seq, spent: null } : null;
  return run.roll;
}

// Aktives (noch nicht verbrauchtes) Paar?
const hasActivePair = run => Boolean(run.roll && !run.roll.spent);
// ...und noch nicht laut Client gespielt (v6.15.0) - nur so ein Paar darf
// rerollt/ersetzt werden; ein gespieltes Paar braucht ein neues
const livePair = run => hasActivePair(run) && !run.roll.played;
function needsRoll(run, champions) {
  return !livePair(run) && remainingKeys(run, champions).length > 0;
}
// Client meldet: Spiel mit diesem Champion hat begonnen (v6.15.0)
function markPlayed(run, key, now = Date.now()) {
  if (!livePair(run) || !run.roll.champs.includes(String(key))) return false;
  run.roll.played = { key: String(key), at: now };
  return true;
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
  run.pending = (run.pending || []).filter(p => Date.now() - ((p.played && p.played.at) || 0) < 24 * 3600 * 1000);
  // Aufgehobenes (schon ersetztes) Paar, zu dem dieses Spiel gehoert
  const pendingIdx = (m, key) => run.pending.findIndex(p => m.info.gameCreation >= p.at && p.champs.includes(key));
  for (const m of sorted) {
    run.processed.push(m.metadata.matchId);
    const me = findMe(m);
    if (!me) continue;
    if ((m.info.gameDuration || 0) < MIN_GAME_SECONDS) {
      // Remake: Paar wieder freigeben bzw. aufgehobenes verwerfen
      const k = String(me.championId), i = pendingIdx(m, k);
      if (i >= 0) run.pending.splice(i, 1);
      else if (run.roll && run.roll.played && run.roll.played.key === k && !run.roll.spent) delete run.roll.played;
      continue;
    }
    const key = String(me.championId);
    const placement = me.placement || me.subteamPlacement || 0;
    const end = m.info.gameEndTimestamp || (m.info.gameCreation + (m.info.gameDuration || 0) * 1000);
    // Gilt nur mit aktivem Paar und wenn das Spiel NACH dem Rollen anfing -
    // zuerst ein aufgehobenes (frueher gerolltes, schon gespieltes) Paar
    const pi = pendingIdx(m, key);
    if (pi >= 0) {
      run.pending.splice(pi, 1);
      if (placement === 1 && !run.won[key]) run.won[key] = { at: end, matchId: m.metadata.matchId };
      xpGames.push({ match: m, me, rolled: true, placement });
      continue;
    }
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
  return livePair(run) && run.rerollDay !== today;
}
function reroll(run, champions, today, now = Date.now()) {
  if (!canReroll(run, today)) return false;
  const avoid = run.roll ? run.roll.champs : [];
  rollPair(run, champions, now, avoid);
  run.rerollDay = today;
  return true;
}

// Champ Select (v6.14.0, Nutzerwunsch): ein gerollter Champion wurde gebannt
// oder von jemand anderem gepickt -> nur diesen gratis ersetzen (kein
// Tages-Reroll). unavailable: { key: 'banned' | 'picked' }. Nichts tun, wenn
// man selbst schon einen der beiden gelockt hat (dann zaehlt das Spiel ja).
// Liefert [{ from, to, reason }] oder null.
function replaceUnavailable(run, champions, unavailable, myPick, avoid = [], blocked = [], now = Date.now()) {
  if (!livePair(run)) return null;
  if (myPick && run.roll.champs.includes(String(myPick))) return null;
  const hit = run.roll.champs.filter(k => unavailable[k]);
  if (!hit.length) return null;
  const taken = new Set([...run.roll.champs, ...Object.keys(unavailable), ...blocked]);
  const open = remainingKeys(run, champions).filter(k => !taken.has(k));
  const free = open.filter(k => !avoid.includes(k));
  const pool = shuffled(free.length ? free : open);
  const replaced = [];
  run.roll.champs = run.roll.champs.map(k => {
    if (!unavailable[k]) return k;
    const to = pool.shift();
    if (!to) return k; // nichts mehr uebrig - bleibt stehen
    replaced.push({ from: k, to, reason: unavailable[k] });
    return to;
  });
  if (!replaced.length) return null;
  run.roll.seq = (run.roll.seq || 0) + 1;
  run.roll.at = now;
  run.roll.replaced = replaced;
  return replaced;
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
        ? { key: c.key, id: c.id, name: c.name, won: w ? w.at : null, rolled: rolledKeys.has(c.key) && !run.roll.spent && !run.roll.played }
        : { key: null };
    });
  const count = keys.filter(k => run.won[k]).length;
  const sortedGames = [...games].sort((a, b) => b.at - a.at);
  return {
    variant: run.variant, variantName: (VARIANTS[run.variant] || VARIANTS.riot).name,
    since: run.since, target, count, completed: target > 0 && count >= target,
    hidden, slots,
    roll: run.roll ? { seq: run.roll.seq, at: run.roll.at, spent: run.roll.spent, played: run.roll.played && !run.roll.spent ? { key: run.roll.played.key, name: (byKey.get(run.roll.played.key) || {}).name || '' } : null, replaced: (run.roll.replaced || []).map(r => ({ from: (byKey.get(r.from) || {}).name || '', to: (byKey.get(r.to) || {}).name || '', reason: r.reason })), champs: run.roll.champs.map(k => byKey.get(k) || { key: k, id: '', name: '' }) } : null,
    needsRoll: needsRoll(run, champions),
    canReroll: canReroll(run, today),
    totalGames: games.length,
    firstPlaces: games.filter(g => g.placement === 1).length,
    avgPlacement: games.length ? Math.round((games.reduce((s, g) => s + g.placement, 0) / games.length) * 10) / 10 : null,
    recent: sortedGames.slice(0, 12)
  };
}

module.exports = { ARENA_QUEUES, arenaQueues, VARIANTS, MIN_GAME_SECONDS, allChampions, availability, newRun, advanceRun, roll, reroll, replaceUnavailable, hasActivePair, livePair, needsRoll, markPlayed, view, targetFor };
