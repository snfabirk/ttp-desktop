const fs = require('fs');
const path = require('path');
const { dataSubdir } = require('./dataPaths');
const { COSMETICS, PRICES, priceOf, getCosmetic, passCosmetic } = require('./cosmetics');

// XP-/Level-System (v5.0.0, PROVISORISCH): Profil-Level (laeuft fuer immer,
// jedes Level etwas teurer), Monats-Pass (seit v5.3.0: ein Pass pro
// Kalendermonat, 30 Stufen + endlose 30+-Leiste, Coins + Cosmetics),
// Daily/Weekly Quests. Seit v5.1.0 bringen gespielte Spiele (creditMatches)
// und gewonnene LP (creditLp, "LP-Konto") echte XP - beides aufgerufen vom
// Match-Scan in runSummaryBatch; seit v5.17.0 auch erledigte Quests (nur
// XP, keine Coins - Nutzerentscheidung). Trophies vergeben noch nichts.
// Alle Zahlen hier sind Platzhalter.
//
// Bewusst KEIN Multiplikator (Schwierigkeit/LP-Abstand) mehr: der war beim
// Start frei waehlbar und haette jedes Spiel aufgewertet, ohne dass man das
// Ziel je erreichen muss - Majestic + riesiges Ziel = Pass doppelt so
// schnell (Nutzerentscheidung 2026-10-09).
//
// Gespeichert in userData/ttp-data/progression (update-fest, siehe
// dataPaths.js). Factory Reset loescht es mit, "Reset Account Progress" in
// den Settings NUR das hier.
//
// Anti-Abuse (Nutzerwunsch): jedes Match (matchId) und jede Quest/Trophy
// wird nur EINMAL gutgeschrieben (Ledger), und der Pass-Fortschritt haengt am
// Kalendermonat, NICHT an der Challenge - ein Challenge-Reset setzt nichts
// zurueck, es gibt also nichts, was man durch Reset+Neustart farmen koennte.
// Jede Pass-Stufe vergibt ihre Belohnung pro Monat genau einmal.

const XP_PER_GAME = {
  poolChamp: 500,       // einer der 1-3 gewaehlten Champions
  sameRoleOther: 300,   // Main-Rolle, anderer Champion
  secondRole: 250,      // Second-Rolle
  offRole: 50           // alles andere (Fill)
};
const XP_WIN_BONUS = 150;            // zusaetzlich bei Sieg, egal welche Kategorie
const XP_PER_KILL = 10;
const XP_PER_ASSIST = 5;
const FULL_XP_GAMES_PER_DAY = 5;      // ab dem 6. Spiel des Tages: alle XP halbiert
const XP_PER_TROPHY = 750;            // temporaere Trophaeen zaehlen nicht

// LP-Konto (Nutzeridee 2026-10-09): jeder LP-GEWINN wandert auf ein Konto
// 0-100, LP-Verluste werden ignoriert. Ist es voll, gibt es XP (Level + Pass)
// und es beginnt von vorn - ueberschuessige LP werden mitgenommen. So
// bekommen auch Spieler XP, die kaum netto climben (hardstuck).
const LP_BANK_SIZE = 100;
const XP_PER_LP_BANK = 1000;

const PASS_TIERS = 30;
const PASS_XP_PER_TIER = 1500;
// Pass-Belohnungen (Nutzerdesign 2026-10-09): Stufen 5/10/../30 = die 6
// Cosmetics DIESES Monats (cosmetics.js), alle anderen Stufen = Coins. Nach
// Stufe 30 gibt es endlos weiter Coins, aber jede 30+-Stufe kostet mehr XP,
// damit der Coin-Grind langsamer ist als der Pass selbst.
// Coins steigen leicht mit der Stufe (Nutzerwunsch: spaeter auch coin-
// technisch lohnender) - seit v5.13.0 1-10: 80, 11-20: 100, 21-30: 120,
// in Summe weiterhin 2.400 pro Pass (24 Coin-Stufen).
function coinsForTier(tier) {
  return tier <= 10 ? 80 : tier <= 20 ? 100 : 120;
}
const FALLBACK_COSMETIC_COINS = 300; // Monat ohne angelegte Cosmetics
// Pass 30+ (Nutzerentscheidung 2026-10-09, v5.14.0): jede weitere 30+-Stufe
// kostet 500 XP mehr als die vorige (2.500, 3.000, 3.500 ...), damit
// Vielspieler den Shop nicht leerkaufen. Bereits abgeholte Stufen bleiben.
const OVERFLOW_XP_FIRST = 2500;
const OVERFLOW_XP_GROWTH = 500;
const COINS_PER_OVERFLOW_STEP = 100;
const overflowStepCost = n => OVERFLOW_XP_FIRST + OVERFLOW_XP_GROWTH * n; // n = schon erreichte Stufen

// XP fuer Level n -> n+1: jedes Level 100 XP teurer, ab Level 21 fix 4.000
// (Nutzerentscheidung 2026-10-09 - vorher +250 ohne Deckel, viel zu steil).
// Der Challenge Pass bleibt bewusst linear (PASS_XP_PER_TIER).
const LEVEL_XP_BASE = 2000;
const LEVEL_XP_STEP = 100;
const LEVEL_XP_CAP = 4000;
function xpForLevel(level) {
  return Math.min(LEVEL_XP_CAP, LEVEL_XP_BASE + LEVEL_XP_STEP * (level - 1));
}

function levelFromXp(totalXp) {
  let level = 1;
  let rest = Math.max(0, totalXp);
  while (rest >= xpForLevel(level)) {
    rest -= xpForLevel(level);
    level++;
  }
  return { level, xpIntoLevel: rest, xpForNextLevel: xpForLevel(level) };
}

// ----- Quests -----
// Tageswechsel 06:00 Ortszeit (ein Spiel um 1 Uhr nachts zaehlt noch zum
// Vortag), Wochenwechsel Montag 06:00.
const RESET_HOUR = 6;

function questDay(now = new Date()) {
  const d = new Date(now);
  if (d.getHours() < RESET_HOUR) d.setDate(d.getDate() - 1);
  d.setHours(RESET_HOUR, 0, 0, 0);
  return d;
}
function dayKey(now) {
  const d = questDay(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function nextDailyReset(now = new Date()) {
  const d = questDay(now);
  d.setDate(d.getDate() + 1);
  return d;
}
function nextWeeklyReset(now = new Date()) {
  const d = questDay(now);
  const daysUntilMonday = ((8 - d.getDay()) % 7) || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  return d;
}

// Rollen-Quests: role leer = fuer alle Rollen.
const DAILY_POOL = [
  { id: 'kp60', role: '', title: 'Team Player', desc: 'Get 60%+ kill participation in a game', target: 1, xp: 300 },
  { id: 'ka15', role: '', title: 'In the Thick of It', desc: 'Get 15+ kills + assists in one game', target: 1, xp: 300 },
  { id: 'play3', role: '', title: 'Grinder', desc: 'Play 3 ranked games', target: 3, xp: 250 },
  { id: 'fastwin', role: '', title: 'Speedrun', desc: 'Win a game in under 25 minutes', target: 1, xp: 350 },
  { id: 'top_cs', role: 'TOP', title: 'Lane Bully', desc: 'Reach 7+ CS/min in a game', target: 1, xp: 300 },
  { id: 'top_dmg', role: 'TOP', title: 'Juggernaut', desc: 'Deal 25,000+ damage to champions', target: 1, xp: 300 },
  { id: 'jgl_drakes', role: 'JUNGLE', title: 'Dragon Tamer', desc: 'Take 2+ dragons in a game', target: 1, xp: 300 },
  { id: 'jgl_epic', role: 'JUNGLE', title: 'Objective Control', desc: 'Secure Rift Herald, Void Grubs or Baron', target: 1, xp: 300 },
  { id: 'mid_cs', role: 'MIDDLE', title: 'Farm Machine', desc: 'Reach 7.5+ CS/min in a game', target: 1, xp: 300 },
  { id: 'mid_solo', role: 'MIDDLE', title: 'Outplayed', desc: 'Get a solo kill', target: 1, xp: 300 },
  { id: 'bot_cs', role: 'BOTTOM', title: 'Last-Hit Hero', desc: 'Reach 8+ CS/min in a game', target: 1, xp: 300 },
  { id: 'bot_dmg', role: 'BOTTOM', title: 'Carry Potential', desc: 'Deal 25,000+ damage to champions', target: 1, xp: 300 },
  { id: 'sup_vision', role: 'UTILITY', title: 'All-Seeing', desc: 'Reach a vision score of 60+', target: 1, xp: 300 },
  { id: 'sup_assists', role: 'UTILITY', title: 'Enabler', desc: 'Get 15+ assists in one game', target: 1, xp: 300 },
  { id: 'sup_wards', role: 'UTILITY', title: 'Control Freak', desc: 'Buy 3+ control wards in a game', target: 1, xp: 300 }
];

// Deterministischer Zufall aus einem String (gleicher Tag = gleiche Quests,
// auch wenn die App zwischendurch zu war).
function seededIndex(seed, length) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % length;
}

function buildDailies(state, { role, champions }, now) {
  const day = dayKey(now);
  const quests = [
    { id: 'firstwin', title: 'First Win of the Day', desc: 'Win any ranked game', target: 1, xp: 400, rerollable: false }
  ];

  const champs = (champions || []).filter(c => c && c.name);
  if (champs.length) {
    const champ = champs[seededIndex(`${day}:champ`, champs.length)];
    quests.push({ id: `champwin_${champ.id}`, title: 'Champion of the Day', desc: `Win a game with ${champ.name}`, champId: champ.id, target: 1, xp: 500, rerollable: false });
  }

  const pool = DAILY_POOL.filter(q => !q.role || q.role === role);
  const rerolled = state.rerolls[day];
  let pick = pool[seededIndex(`${day}:role`, pool.length)];
  if (rerolled) pick = pool.find(q => q.id === rerolled) || pick;
  quests.push({ ...pick, rerollable: !rerolled });

  return quests.map(q => ({ ...q, progress: 0, done: false }));
}

// ----- Quest-Fortschritt (v5.17.0) -----
// Jede Quest gilt fuer ihren Zeitraum (Tag ab 06:00 / Woche ab Montag 06:00)
// und wird pro Zeitraum genau EINMAL gutgeschrieben (state.questLedger).
const qs = g => g.stats || {};
const csPerMin = g => qs(g).duration ? qs(g).cs / (qs(g).duration / 60) : 0;
const DAILY_CHECKS = {
  firstwin: g => g.win,
  kp60: g => qs(g).kp >= 0.6,
  ka15: g => (g.kills || 0) + (g.assists || 0) >= 15,
  fastwin: g => g.win && qs(g).duration > 0 && qs(g).duration < 25 * 60,
  top_cs: g => csPerMin(g) >= 7,
  top_dmg: g => qs(g).damage >= 25000,
  jgl_drakes: g => qs(g).dragons >= 2,
  jgl_epic: g => qs(g).epic >= 1,
  mid_cs: g => csPerMin(g) >= 7.5,
  mid_solo: g => qs(g).soloKills >= 1,
  bot_cs: g => csPerMin(g) >= 8,
  bot_dmg: g => qs(g).damage >= 25000,
  sup_vision: g => qs(g).vision >= 60,
  sup_assists: g => (g.assists || 0) >= 15,
  sup_wards: g => qs(g).controlWards >= 3
};

function weekStartOf(now) {
  const d = nextWeeklyReset(now);
  d.setDate(d.getDate() - 7);
  return d;
}

function evaluateDaily(q, games) {
  let progress;
  if (q.id === 'play3') progress = games.length;
  else if (q.champId) progress = games.some(g => g.win && g.champId === q.champId) ? 1 : 0;
  else progress = games.some(DAILY_CHECKS[q.id] || (() => false)) ? 1 : 0;
  progress = Math.min(q.target, progress);
  return { ...q, progress, done: progress >= q.target };
}

function evaluateWeekly(q, games, state, since) {
  let progress = 0;
  if (q.id === 'win2each') {
    const breakdown = q.breakdown.map(b => ({ ...b, progress: Math.min(b.target, games.filter(g => g.win && g.champId === b.champId).length) }));
    progress = breakdown.reduce((a, b) => a + b.progress, 0);
    return { ...q, breakdown, progress: Math.min(q.target, progress), done: breakdown.length > 0 && breakdown.every(b => b.progress >= b.target) };
  }
  if (q.id === 'streak3') {
    let run = 0;
    [...games].sort((a, b) => a.gameCreation - b.gameCreation).forEach(g => { run = g.win ? run + 1 : 0; progress = Math.max(progress, run); });
  }
  if (q.id === 'climb75') {
    progress = state.lpBank.events.filter(e => new Date(e.at) >= since).reduce((a, e) => a + (e.gained || 0), 0);
  }
  // Bonus-Weeklies (Consumable)
  if (q.id === 'bw_win5') progress = games.filter(g => g.win).length;
  if (q.id === 'bw_play10') progress = games.length;
  if (q.id === 'bw_kills50') progress = games.reduce((a, g) => a + (g.kills || 0), 0);
  if (q.id === 'bw_lpfill2') progress = state.lpBank.events.filter(e => new Date(e.at) >= since).reduce((a, e) => a + (e.filled || 0), 0);
  progress = Math.min(q.target, progress);
  return { ...q, progress, done: progress >= q.target };
}

function questsWithProgress(state, context, now) {
  const today = dayKey(now);
  const weekFrom = weekStartOf(now);
  const todays = state.ledger.filter(g => g.day === today);
  const weeks = state.ledger.filter(g => new Date(g.gameCreation) >= weekFrom);
  const credited = state.questLedger || {};
  const weekKeyStr = weekKey(now);
  const bq = state.bonusQuests || {};
  const dailyList = buildDailies(state, context, now);
  if (bq.daily && bq.daily.day === today) dailyList.push({ ...bq.daily.quest, bonus: true, rerollable: false, progress: 0, done: false });
  const weeklyList = buildWeeklies(state, context);
  if (bq.weekly && bq.weekly.week === weekKeyStr) weeklyList.push({ ...bq.weekly.quest, bonus: true, progress: 0, done: false });
  const qKey = (p, period, q) => `${p}:${period}:${q.bonus ? 'bonus:' : ''}${q.id}`;
  const dailies = dailyList.map(q => evaluateDaily(q, todays))
    .map(q => ({ ...q, key: qKey('d', today, q) })).map(q => ({ ...q, credited: !!credited[q.key] }));
  const weeklies = weeklyList.map(q => evaluateWeekly(q, weeks, state, weekFrom))
    .map(q => ({ ...q, key: qKey('w', weekKeyStr, q) })).map(q => ({ ...q, credited: !!credited[q.key] }));
  return { dailies, weeklies, today, weekKeyStr };
}

// Schreibt erledigte, noch nicht gutgeschriebene Quests gut (Level + Pass).
function creditQuestsInState(state, context, now) {
  const { dailies, weeklies, today, weekKeyStr } = questsWithProgress(state, context, now);
  state.questLedger = state.questLedger || {};
  let added = 0;
  const credit = (key, q) => {
    if (!q.done || state.questLedger[key]) return;
    state.questLedger[key] = { xp: q.xp, at: now.toISOString() };
    state.totalXp += q.xp;
    addPassXp(state, monthKey(now), q.xp);
    added += q.xp;
  };
  dailies.forEach(q => credit(q.key, q));
  weeklies.forEach(q => credit(q.key, q));
  return added;
}

function creditQuests(context) {
  const state = readState();
  const added = creditQuestsInState(state, context || {}, new Date());
  if (added) writeState(state);
  return added;
}

function buildWeeklies(_state, { champions }) {
  const champs = (champions || []).filter(c => c && c.name);
  return [
    {
      id: 'win2each', title: 'Master of Three', desc: champs.length
        ? `Win 2 games with each of your champions (${champs.map(c => c.name).join(', ')})`
        : 'Win 2 games with each of your champions',
      target: Math.max(1, champs.length) * 2, xp: 2500,
      breakdown: champs.map(c => ({ champId: c.id, name: c.name, progress: 0, target: 2 }))
    },
    { id: 'streak3', title: 'On Fire', desc: 'Win 3 ranked games in a row (any champion counts)', target: 3, xp: 1500 },
    { id: 'climb75', title: 'Climber', desc: 'Gain 75 LP this week', target: 75, xp: 2000 }
  ].map(q => ({ ...q, progress: 0, done: false }));
}

// ----- Monats-Pass -----
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}
function monthEnd(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m, 1, 0, 0, 0, 0); // 1. des Folgemonats, Ortszeit
}

function passProgress(xp) {
  const tier = Math.min(PASS_TIERS, Math.floor(xp / PASS_XP_PER_TIER));
  let overflowXp = Math.max(0, xp - PASS_TIERS * PASS_XP_PER_TIER);
  let overflowCount = 0;
  while (overflowXp >= overflowStepCost(overflowCount)) { overflowXp -= overflowStepCost(overflowCount); overflowCount++; }
  return {
    tier,
    xpIntoTier: tier >= PASS_TIERS ? PASS_XP_PER_TIER : xp % PASS_XP_PER_TIER,
    overflowCount,
    overflowXpInto: overflowXp,
    overflowStepXp: overflowStepCost(overflowCount)
  };
}

function tierReward(month, tier) {
  if (tier % 5 === 0) {
    const cosmetic = passCosmetic(month, tier);
    if (cosmetic) return { type: 'cosmetic', id: cosmetic.id, name: cosmetic.name, cosmeticType: cosmetic.type, themeKey: cosmetic.themeKey, animated: !!cosmetic.animated };
    return { type: 'coins', amount: FALLBACK_COSMETIC_COINS };
  }
  return { type: 'coins', amount: coinsForTier(tier) };
}

// Vergibt alle Belohnungen bis zur aktuell erreichten Stufe, die in diesem
// Monat noch nicht vergeben wurden. Cosmetics bleiben fuer immer im Inventar.
function claimPassRewards(state, month) {
  const pass = state.passes[month];
  const prog = passProgress(pass.xp);
  for (let t = pass.claimedTier + 1; t <= prog.tier; t++) {
    const reward = tierReward(month, t);
    if (reward.type === 'coins') state.coins += reward.amount;
    else if (!state.inventory.includes(reward.id)) state.inventory.push(reward.id);
  }
  pass.claimedTier = Math.max(pass.claimedTier, prog.tier);
  if (prog.overflowCount > pass.claimedOverflow) {
    state.coins += (prog.overflowCount - pass.claimedOverflow) * COINS_PER_OVERFLOW_STEP;
    pass.claimedOverflow = prog.overflowCount;
  }
}

function addPassXp(state, month, xp) {
  if (!state.passes[month]) state.passes[month] = { xp: 0, claimedTier: 0, claimedOverflow: 0 };
  state.passes[month].xp += xp;
  claimPassRewards(state, month);
}

function getPassOverview(state, now) {
  const month = monthKey(now);
  const pass = state.passes[month] || { xp: 0 };
  const prog = passProgress(pass.xp);
  const rewards = [];
  for (let t = 1; t <= PASS_TIERS; t++) rewards.push({ tier: t, ...tierReward(month, t) });
  return {
    month,
    label: monthLabel(month),
    endsAt: monthEnd(month).toISOString(),
    tiers: PASS_TIERS,
    xpPerTier: PASS_XP_PER_TIER,
    xp: pass.xp,
    tier: prog.tier,
    xpIntoTier: prog.xpIntoTier,
    rewards,
    overflow: {
      xpPerStep: prog.overflowStepXp,
      firstStepXp: OVERFLOW_XP_FIRST,
      stepGrowthXp: OVERFLOW_XP_GROWTH,
      coinsPerStep: COINS_PER_OVERFLOW_STEP,
      count: prog.overflowCount,
      xpInto: prog.overflowXpInto
    }
  };
}

// ----- Cosmetics / Coins -----
// Besitz = Inventar + alle Basic-Grund-Cosmetics (die hat jeder)
const BASE_IDS = COSMETICS.filter(c => c.base).map(c => c.id);
const ownsCosmetic = (state, id) => BASE_IDS.includes(id) || state.inventory.includes(id);
const ownedList = state => [
  ...[...BASE_IDS, ...state.inventory].map(getCosmetic).filter(Boolean),
  // per "Try It On" geliehen (24 h) - mit rentedUntil fuer die Anzeige
  ...(state.buffs || []).filter(b => b.kind === 'rental' && new Date(b.expiresAt).getTime() > Date.now() && !state.inventory.includes(b.cosmeticId))
    .map(b => getCosmetic(b.cosmeticId) && { ...getCosmetic(b.cosmeticId), rentedUntil: b.expiresAt }).filter(Boolean)
];

function getCosmeticsState() {
  const state = readState();
  return {
    coins: state.coins,
    owned: ownedList(state),
    equipped: state.equipped
  };
}

function equipCosmetic(type, id) {
  const state = readState();
  // Profil-Hintergrund des Rahmens an/aus (nur fuer Rahmen mit Hintergrund)
  if (type === 'frameBg') {
    state.equipped = { ...state.equipped, frameBg: id === 'on' };
    writeState(state);
    return { ok: true, equipped: state.equipped };
  }
  if (id) {
    const cosmetic = getCosmetic(id);
    if (!cosmetic || cosmetic.type !== type) return { ok: false, error: 'Unknown cosmetic.' };
    if (!ownsOrRents(state, id)) return { ok: false, error: 'You do not own this cosmetic yet.' };
  }
  state.equipped = { ...state.equipped, [type]: id || null };
  writeState(state);
  return { ok: true, equipped: state.equipped };
}

// ----- Profil-Layout -----
const LAYOUT_COLS = 6;
const LAYOUT_MAX_WIDGETS = 40;

// Nur grobe Plausibilitaet - welche Typen/Groessen es gibt, weiss der Client.
function saveProfileLayout(layout) {
  if (!Array.isArray(layout) || layout.length > LAYOUT_MAX_WIDGETS) return { ok: false, error: 'Invalid layout.' };
  const clean = [];
  for (const w of layout) {
    const ints = ['x', 'y', 'w', 'h'].every(k => Number.isInteger(w && w[k]));
    if (!ints || typeof w.type !== 'string' || typeof w.id !== 'string') return { ok: false, error: 'Invalid widget.' };
    if (w.x < 0 || w.y < 0 || w.w < 1 || w.h < 1 || w.x + w.w > LAYOUT_COLS || w.y + w.h > 60) return { ok: false, error: 'Widget out of bounds.' };
    const config = w.config && typeof w.config === 'object' ? { text: typeof w.config.text === 'string' ? w.config.text.slice(0, 280) : undefined } : {};
    clean.push({ id: w.id.slice(0, 40), type: w.type.slice(0, 30), x: w.x, y: w.y, w: w.w, h: w.h, config });
  }
  const state = readState();
  state.profileLayout = clean;
  writeState(state);
  return { ok: true };
}

// ----- Speicherung -----
function filePath() {
  return path.join(dataSubdir('progression'), 'progression.json');
}

function emptyState() {
  return {
    version: 2, totalXp: 0, ledger: [], rerolls: {},
    // passes['YYYY-MM'] = { xp, claimedTier, claimedOverflow }
    passes: {}, coins: 0, inventory: [], equipped: { border: null, frame: null, frameBg: true },
    // Profil-Layout (Widget-Raster auf profile.html), null = Standard-Layout
    // des Clients. [{ id, type, x, y, w, h, config }]
    profileLayout: null,
    // lastLP: zuletzt gesehener LP-Stand (vergleichbar ueber Tiers hinweg,
    // siehe rankHistory.toComparableLP), progress: 0-99 auf dem Konto.
    lpBank: { puuid: null, lastLP: null, progress: 0, fills: 0, events: [] },
    // Gluecksrad im Shop: einmal pro Tag (Tageswechsel wie die Quests)
    wheel: { lastSpinDay: null, spins: 0 },
    // Persoenlicher Shop: Angebote werden pro Tag/Woche einmal ausgewuerfelt
    shop: { dayKey: null, daily: [], weekKey: null, weekly: [], pityDaily: 0, pityWeekly: 0 },
    // Consumables (v5.18.0): 2 Tagesplaetze im Shop, gekauft = sofort eingesetzt
    consumables: { dayKey: null, slots: [null, null], sold: [false, false] },
    // Aktive Buffs mit Ablaufdatum: { kind, id, startedAt, expiresAt, gamesLeft?, cosmeticId? }
    buffs: [],
    // Bonus-Quests aus Consumables: { daily: { day, quest }, weekly: { week, quest } }
    bonusQuests: { daily: null, weekly: null }
  };
}

function readState() {
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(filePath(), 'utf-8'));
  } catch (e) {
    return emptyState();
  }
  const state = { ...emptyState(), ...raw };
  // Cosmetics, die es nicht (mehr) gibt (z.B. die Test-Borders des ersten
  // Oktober-Passes), fallen still aus Inventar und Ausruestung.
  state.inventory = (state.inventory || []).filter(id => getCosmetic(id));
  state.equipped = { ...emptyState().equipped, ...(state.equipped || {}) };
  // Zu jeder schon erreichten Cosmetic-Stufe gehoert das AKTUELLE Cosmetic
  // dieses Monats ins Inventar (idempotent) - so bekommt auch, wer die Stufe
  // vor einer Katalog-Aenderung geholt hat, die neue Belohnung.
  Object.entries(state.passes || {}).forEach(([month, pass]) => {
    for (let t = 5; t <= Math.min(pass.claimedTier || 0, PASS_TIERS); t += 5) {
      const c = passCosmetic(month, t);
      if (c && !state.inventory.includes(c.id)) state.inventory.push(c.id);
    }
  });
  ['border', 'frame'].forEach(t => { if (state.equipped[t] && !ownsOrRents(state, state.equipped[t])) state.equipped[t] = null; });
  // v5.1/5.2 -> v5.3: der Pass hing an der Challenge (passXp). Monats-Paesse
  // aus dem Ledger (Spielzeitpunkt) + LP-Bank-Events (Zeitpunkt) neu aufbauen.
  if (!raw.passes) {
    delete state.passXp;
    delete state.passChallengeStart;
    state.ledger.forEach(g => addPassXp(state, monthKey(new Date(g.gameCreation)), g.xp));
    state.lpBank.events.forEach(e => { if (e.xp) addPassXp(state, monthKey(new Date(e.at)), e.xp); });
    state.version = 2;
  }
  return state;
}

function writeState(state) {
  fs.writeFileSync(filePath(), JSON.stringify(state, null, 2));
}

function resetState() {
  fs.rmSync(filePath(), { force: true });
}

// Schreibt XP fuer alle noch nicht gutgeschriebenen Spiele gut. games kommt
// aus dem Match-Scan seit Challenge-Start: [{ matchId, gameCreation,
// category, win, kills, assists, champId }]. Jedes matchId landet genau
// einmal im Ledger - ein erneuter Scan, ein Reset oder ein Neustart der
// Challenge bringt fuer dasselbe Spiel nichts zweimal. Die XP gehen in den
// Pass des Monats, in dem das Spiel gespielt wurde.
function creditMatches(games) {
  const state = readState();
  const credited = new Set(state.ledger.map(e => e.matchId));
  const gamesPerDay = {};
  state.ledger.forEach(e => { gamesPerDay[e.day] = (gamesPerDay[e.day] || 0) + 1; });

  const added = [];
  [...games]
    .filter(g => g && g.matchId && !credited.has(g.matchId) && XP_PER_GAME[g.category] !== undefined)
    .sort((a, b) => a.gameCreation - b.gameCreation)
    .forEach(g => {
      const day = dayKey(new Date(g.gameCreation));
      const gameOfDay = (gamesPerDay[day] || 0) + 1;
      gamesPerDay[day] = gameOfDay;
      const halved = gameOfDay > FULL_XP_GAMES_PER_DAY;
      const base = {
        game: XP_PER_GAME[g.category],
        win: g.win ? XP_WIN_BONUS : 0,
        kills: (g.kills || 0) * XP_PER_KILL,
        assists: (g.assists || 0) * XP_PER_ASSIST
      };
      const raw = base.game + base.win + base.kills + base.assists;
      const xp = Math.round(raw * (halved ? 0.5 : 1));
      // Consumable "Double XP": +100 % NUR aufs Level (der Pass bekommt die
      // normalen XP), fuer die naechsten 3 Spiele nach dem Kauf
      let levelBonus = 0;
      const boost = activeBuff(state, 'xpLevel', g.gameCreation);
      if (boost && boost.gamesLeft > 0) {
        levelBonus = xp;
        boost.gamesLeft -= 1;
        if (boost.gamesLeft <= 0) state.buffs = state.buffs.filter(b => b !== boost);
      }
      const entry = {
        matchId: g.matchId, gameCreation: g.gameCreation, day, gameOfDay,
        category: g.category, win: !!g.win, kills: g.kills || 0, deaths: g.deaths || 0, assists: g.assists || 0,
        champId: g.champId || '', champName: g.champName || '', base, halved, xp,
        levelBonus,
        stats: g.stats || null
      };
      state.ledger.push(entry);
      state.totalXp += xp + levelBonus;
      addPassXp(state, monthKey(new Date(g.gameCreation)), xp);
      added.push(entry);
    });

  writeState(state);
  return added;
}

// LP-Konto fuellen. currentLP = aktueller Stand (vergleichbar), baselineLP =
// Stand beim Challenge-Start - nur beim allerersten Mal genutzt, damit LP seit
// dem Start nicht verloren gehen. Danach zaehlt jeder Scan die Differenz zum
// zuletzt gesehenen Stand; nur positive Differenzen kommen aufs Konto. Da
// alle 15 Minuten gescannt wird, liegt meist hoechstens ein Spiel dazwischen
// - lief die App mehrere Spiele lang nicht, wird nur der Netto-Gewinn dieser
// Spiele gezaehlt. Account-Wechsel: neuer Ausgangspunkt, nichts gutgeschrieben.
function creditLp({ puuid, currentLP, baselineLP }) {
  if (!puuid || typeof currentLP !== 'number' || Number.isNaN(currentLP)) return null;
  const state = readState();
  const bank = state.lpBank;

  if (bank.puuid !== puuid || bank.lastLP === null) {
    const isFirstEver = bank.lastLP === null;
    bank.puuid = puuid;
    bank.lastLP = isFirstEver && typeof baselineLP === 'number' ? baselineLP : currentLP;
  }

  const gained = currentLP - bank.lastLP;
  bank.lastLP = currentLP;
  let event = null;
  if (gained > 0) {
    bank.progress += gained;
    let filled = 0;
    while (bank.progress >= LP_BANK_SIZE) {
      bank.progress -= LP_BANK_SIZE;
      filled++;
    }
    let xp = filled * XP_PER_LP_BANK;
    // Consumable "LP Bank Booster": die naechste volle Bank gibt +50 % (Level + Pass)
    const lpBoost = filled ? activeBuff(state, 'lpBank', Date.now()) : null;
    if (lpBoost) {
      xp += Math.round(XP_PER_LP_BANK * 0.5);
      state.buffs = state.buffs.filter(b => b !== lpBoost);
    }
    bank.fills += filled;
    state.totalXp += xp;
    if (xp) addPassXp(state, monthKey(new Date()), xp);
    event = { at: Date.now(), gained, filled, xp };
    bank.events.push(event);
    if (bank.events.length > 50) bank.events.splice(0, bank.events.length - 50);
  }
  writeState(state);
  return event;
}

// Lebenszeit-Zahlen fuer die Spielerprofil-Seite (profile.html) - alles,
// was das Ledger seit v5.1.0 mitgeschrieben hat.
function getLifetimeStats() {
  const state = readState();
  const games = state.ledger;
  const champCounts = {};
  games.forEach(g => {
    if (!g.champId) return;
    const c = champCounts[g.champId] || (champCounts[g.champId] = { champId: g.champId, name: g.champName || g.champId, games: 0, wins: 0 });
    c.games++;
    if (g.win) c.wins++;
  });
  return {
    level: levelFromXp(state.totalXp),
    totalXp: state.totalXp,
    games: games.length,
    wins: games.filter(g => g.win).length,
    kills: games.reduce((n, g) => n + (g.kills || 0), 0),
    deaths: games.reduce((n, g) => n + (g.deaths || 0), 0),
    assists: games.reduce((n, g) => n + (g.assists || 0), 0),
    topChamps: Object.values(champCounts).sort((a, b) => b.games - a.games || b.wins - a.wins).slice(0, 3),
    lpGained: state.lpBank.events.reduce((n, e) => n + e.gained, 0),
    lpBankFills: state.lpBank.fills,
    coins: state.coins,
    equipped: state.equipped,
    owned: ownedList(state),
    // Alle Cosmetics, die es gibt (Sammelansicht im Profil-Editor: fehlende
    // ausgegraut mit Schloss + "x / y gesammelt", Nutzerwunsch v5.15.0)
    catalog: COSMETICS.map(c => ({ ...c, source: c.passMonth ? `${monthLabel(c.passMonth)} Pass · tier ${c.tier}` : c.base ? 'Basic' : 'Shop' })),
    profileLayout: state.profileLayout,
    // Fuer weitere Profil-Widgets (v5.6.0)
    pass: (({ label, tier, tiers, xpIntoTier, xpPerTier }) => ({ label, tier, tiers, xpIntoTier, xpPerTier }))(getPassOverview(state, new Date())),
    lpBank: { progress: state.lpBank.progress, size: LP_BANK_SIZE },
    recentGames: [...games].sort((a, b) => b.gameCreation - a.gameCreation).slice(0, 5)
      .map(g => ({ champId: g.champId, champName: g.champName, win: g.win, kills: g.kills, deaths: g.deaths, assists: g.assists, xp: g.xp, gameCreation: g.gameCreation })),
    bestWinStreak: [...games].sort((a, b) => a.gameCreation - b.gameCreation)
      .reduce((acc, g) => { acc.cur = g.win ? acc.cur + 1 : 0; acc.best = Math.max(acc.best, acc.cur); return acc; }, { cur: 0, best: 0 }).best,
    poolGames: games.filter(g => g.category === 'poolChamp').length,
    trackedSince: games.length ? Math.min(...games.map(g => g.gameCreation)) : null
  };
}

function rerollDaily(context) {
  const state = readState();
  const day = dayKey(new Date());
  if (state.rerolls[day]) return { ok: false, error: 'Reroll already used today.' };
  const pool = DAILY_POOL.filter(q => !q.role || q.role === context.role);
  const current = pool[seededIndex(`${day}:role`, pool.length)];
  // Schon erledigte Quest kann nicht mehr getauscht werden (sonst XP doppelt)
  if (evaluateDaily(current, state.ledger.filter(g => g.day === day)).done) return { ok: false, error: 'This quest is already done.' };
  const others = pool.filter(q => q.id !== current.id);
  if (!others.length) return { ok: false, error: 'No other quest available.' };
  state.rerolls = { [day]: others[Math.floor(Math.random() * others.length)].id };
  writeState(state);
  return { ok: true };
}

// ----- Shop (v5.16.0, persoenlich, noch PROVISORISCH) -----
// Jeder Spieler hat seinen eigenen Shop: taeglich 3 Angebote (Wechsel 06:00
// wie die Daily Quests), woechentlich 2 Highlights (Montag 06:00), einmal
// ausgewuerfelt und gespeichert. Was man schon besitzt, wird NIE angeboten.
// Die Shop-Artikel unten sind Platzhalter fuer spaetere Shop-Cosmetics -
// noch nicht kaufbar (Basic-Artikel waeren gratis).
//
// INTERN - bewusst nirgends in der App/den Patch Notes beschrieben
// (Nutzerwunsch: "der Shop ist fuer Aussenstehende ein Mysterium"):
//  - Gewichte pro Platz nach Seltenheit (Tag: Basic 30 / Refined 50 /
//    Fancy 18 / Animated 2; Woche: Fancy 70 / Animated 30)
//  - die Animated-Chance steigt mit jeder Rotation ohne Animated
//    (Tag +1 Punkt, Woche +20 Punkte) und faellt zurueck, sobald einer kommt
//  - Tagesangebote und Wochen-Highlights zeigen nie denselben Artikel
//  - alte Pass-Cosmetics (nicht der laufende Monat) haben eine eigene
//    Chance pro Platz (Tag 8 %, Woche 20 %), solange man nicht alle hat
const SHOP_ITEMS = [
  { id: 'shop-plain-ring', type: 'border', rarity: 'basic', name: 'Plain Ring', c: ['#9aa0a6', '#2a2c30'] },
  { id: 'shop-ash-ring', type: 'border', rarity: 'basic', name: 'Ash Ring', c: ['#7d7470', '#221e1c'] },
  { id: 'shop-slate-frame', type: 'frame', rarity: 'basic', name: 'Slate Frame', c: ['#6e7480', '#16181c'] },
  { id: 'shop-oak-frame', type: 'frame', rarity: 'basic', name: 'Oak Frame', c: ['#8a6a44', '#1e160e'] },
  { id: 'shop-ember-ring', type: 'border', rarity: 'refined', name: 'Ember Ring', c: ['#ff7a18', '#5a1a08'] },
  { id: 'shop-frost-rim', type: 'border', rarity: 'refined', name: 'Frost Rim', c: ['#9fd8ff', '#1c3a5a'] },
  { id: 'shop-moonlit-ring', type: 'border', rarity: 'refined', name: 'Moonlit Ring', c: ['#e9dcc0', '#2a2440'] },
  { id: 'shop-thorn-ring', type: 'border', rarity: 'refined', name: 'Thorn Ring', c: ['#6fbf73', '#1a2a14'] },
  { id: 'shop-iron-frame', type: 'frame', rarity: 'refined', name: 'Iron Frame', c: ['#9a9aa3', '#202024'] },
  { id: 'shop-ivy-frame', type: 'frame', rarity: 'refined', name: 'Ivy Frame', c: ['#4caf7d', '#10241a'] },
  { id: 'shop-rune-frame', type: 'frame', rarity: 'refined', name: 'Rune Frame', c: ['#b088ff', '#1e1436'] },
  { id: 'shop-gilded-frame', type: 'frame', rarity: 'refined', name: 'Gilded Frame', c: ['#c8aa6e', '#2a2010'] },
  { id: 'shop-deep-sea', type: 'theme', rarity: 'refined', name: 'Deep Sea', c: ['#04161f', '#3fd0c9'] },
  { id: 'shop-dragonfire', type: 'border', rarity: 'fancy', name: 'Dragonfire Ring', c: ['#ff4d1a', '#3a0a04'] },
  { id: 'shop-void-rift', type: 'frame', rarity: 'fancy', name: 'Void Rift', c: ['#7a3cff', '#0c0618'] },
  { id: 'shop-starfall', type: 'theme', rarity: 'fancy', name: 'Starfall', c: ['#0a0f2a', '#ffd86b'] },
  { id: 'shop-storm-crown', type: 'border', rarity: 'animated', name: 'Storm Crown', c: ['#7fd4ff', '#0a1426'] },
  { id: 'shop-sakura', type: 'theme', rarity: 'animated', name: 'Sakura Garden', c: ['#2a0f1c', '#ff8fb1'] }
];
const SHOP_RARITY_ORDER = ['basic', 'refined', 'fancy', 'animated'];
const SHOP_DAILY_WEIGHTS = { basic: 30, refined: 50, fancy: 18, animated: 2 };
const SHOP_WEEKLY_WEIGHTS = { fancy: 70, animated: 30 };
const PITY_DAILY_STEP = 1;
const PITY_WEEKLY_STEP = 20;
const PAST_PASS_CHANCE = { daily: 0.08, weekly: 0.2 };

function shopItemById(id) {
  return SHOP_ITEMS.find(i => i.id === id) || getCosmetic(id);
}

// Gewichte inkl. steigender Animated-Chance: der Zuwachs wird den anderen
// Seltenheiten anteilig abgezogen, Summe bleibt 100.
function shopWeights(base, pity, step) {
  const anim = Math.min(100, base.animated + pity * step);
  const restBase = Object.entries(base).filter(([r]) => r !== 'animated');
  const restSum = restBase.reduce((a, [, w]) => a + w, 0);
  const w = { animated: anim };
  restBase.forEach(([r, v]) => { w[r] = restSum ? v / restSum * (100 - anim) : 0; });
  return w;
}

function rollRarity(weights) {
  const entries = Object.entries(weights).filter(([, v]) => v > 0);
  let roll = Math.random() * entries.reduce((a, [, v]) => a + v, 0);
  for (const [r, v] of entries) { if (roll < v) return r; roll -= v; }
  return entries[entries.length - 1][0];
}

function rollOffers(state, count, weights, kind, exclude = []) {
  const owned = new Set(state.inventory);
  const taken = new Set(exclude);
  const current = monthKey(new Date());
  const allowed = new Set(Object.keys(weights));
  const pastPass = COSMETICS.filter(c => c.passMonth && c.passMonth < current && allowed.has(c.rarity));
  const out = [];
  for (let i = 0; i < count; i++) {
    const free = list => list.filter(c => !owned.has(c.id) && !taken.has(c.id));
    let pick = null;
    const past = free(pastPass);
    if (past.length && Math.random() < PAST_PASS_CHANCE[kind]) pick = past[Math.floor(Math.random() * past.length)];
    if (!pick) {
      // gewuerfelte Seltenheit; ist dort nichts mehr frei, erst hoeher, dann tiefer
      const want = rollRarity(weights);
      const idx = SHOP_RARITY_ORDER.indexOf(want);
      const order = [...SHOP_RARITY_ORDER.slice(idx), ...SHOP_RARITY_ORDER.slice(0, idx).reverse()].filter(r => allowed.has(r));
      for (const r of order) {
        const pool = free(SHOP_ITEMS.filter(it => it.rarity === r));
        if (pool.length) { pick = pool[Math.floor(Math.random() * pool.length)]; break; }
      }
    }
    if (!pick) break; // alles gesammelt
    taken.add(pick.id);
    out.push(pick.id);
  }
  return out;
}

function offerView(id, owned) {
  const c = shopItemById(id);
  if (!c) return null;
  return {
    id: c.id, type: c.type, name: c.name, rarity: c.rarity || 'refined', price: priceOf(c), c: c.c || null,
    themeKey: c.themeKey || null,
    fromPass: c.passMonth ? `${monthLabel(c.passMonth)} Pass` : null,
    owned: owned.has(c.id)
  };
}

// Wuerfelt neue Angebote, wenn ein neuer Tag / eine neue Woche begonnen hat.
function refreshShop(state, now) {
  const shop = { ...emptyState().shop, ...(state.shop || {}) };
  const today = dayKey(now), week = weekKey(now);
  let changed = false;
  if (shop.weekKey !== week) {
    shop.weekly = rollOffers(state, 2, shopWeights(SHOP_WEEKLY_WEIGHTS, shop.pityWeekly, PITY_WEEKLY_STEP), 'weekly');
    const hit = shop.weekly.some(id => (shopItemById(id) || {}).rarity === 'animated');
    shop.pityWeekly = hit ? 0 : shop.pityWeekly + 1;
    shop.weekKey = week;
    changed = true;
  }
  if (shop.dayKey !== today) {
    shop.daily = rollOffers(state, 3, shopWeights(SHOP_DAILY_WEIGHTS, shop.pityDaily, PITY_DAILY_STEP), 'daily', shop.weekly);
    const hit = shop.daily.some(id => (shopItemById(id) || {}).rarity === 'animated');
    shop.pityDaily = hit ? 0 : shop.pityDaily + 1;
    shop.dayKey = today;
    changed = true;
  }
  state.shop = shop;
  return changed;
}

// ----- Consumables (v5.18.0) -----
// Nutzerdesign 2026-10-09: unter dem Gluecksrad 2 Tagesplaetze, jeder mit
// 30 % leer ("der Haendler hat hier nichts"). Gekauft = SOFORT eingesetzt,
// nichts kann aufgehoben werden ("wir unterstuetzen Sammler, keine Horter").
// Was eine Dauer hat, wird ein Buff mit Ablaufdatum; pro Buff-Art ist immer
// nur einer gleichzeitig aktiv. Preise/Gewichte sind Startwerte.
const CONSUMABLE_EMPTY_CHANCE = 0.3;
const MAX_BUFFS = 3; // Nutzer: hoechstens 3 Buffs gleichzeitig - "man muss smart sein"
const CONSUMABLES = {
  xp_double: { name: 'Double XP', desc: '+100% level XP for your next 3 games', price: 100, weight: 15, icon: '⚡', buff: { kind: 'xpLevel', days: 3, games: 3 } },
  lp_boost: { name: 'LP Bank Booster', desc: 'Your next full LP Bank gives +50% XP', price: 150, weight: 12, icon: '📈', buff: { kind: 'lpBank', days: 7 } },
  shop_reroll: { name: 'Fresh Stock', desc: 'New daily offers in your shop, right now', price: 75, weight: 15, icon: '🔄' },
  week_reroll: { name: 'New Highlights', desc: 'New weekly highlights in your shop, right now', price: 200, weight: 8, icon: '✨' },
  bonus_daily: { name: 'Bonus Quest', desc: 'One extra daily quest for today', price: 100, weight: 15, icon: '📜' },
  bonus_weekly: { name: 'Bonus Weekly', desc: 'One extra weekly quest for this week', price: 250, weight: 8, icon: '📜' },
  coupon: { name: '20% Coupon', desc: '20% off the next shop item you buy', price: 150, weight: 8, icon: '🏷️', buff: { kind: 'coupon', days: 7 } },
  mystery: { name: 'Mystery Cosmetic', desc: 'A random cosmetic you do not own yet', price: 700, weight: 7, icon: '🎁' },
  try_on: { name: 'Try It On', desc: 'Use any cosmetic you do not own for 24 hours', price: 150, weight: 12, icon: '👗', buff: { kind: 'rental', hours: 24 } }
};
const BUFF_LABEL = { xpLevel: 'Double XP', lpBank: 'LP Bank Booster', coupon: '20% Coupon', rental: 'Try It On' };
const MYSTERY_WEIGHTS = { refined: 75, fancy: 22, animated: 3 };
const BONUS_WEEKLY_POOL = [
  { id: 'bw_win5', title: 'Winning Week', desc: 'Win 5 ranked games this week', target: 5, xp: 1500 },
  { id: 'bw_play10', title: 'Regular', desc: 'Play 10 ranked games this week', target: 10, xp: 1500 },
  { id: 'bw_kills50', title: 'Headhunter', desc: 'Get 50 kills this week', target: 50, xp: 1500 },
  { id: 'bw_lpfill2', title: 'Double Deposit', desc: 'Fill your LP Bank twice this week', target: 2, xp: 2000 }
];

function activeBuff(state, kind, at = Date.now()) {
  const t = typeof at === 'number' ? at : new Date(at).getTime();
  return (state.buffs || []).find(b => b.kind === kind && new Date(b.startedAt).getTime() <= t && new Date(b.expiresAt).getTime() > Date.now()) || null;
}
function pruneBuffs(state) {
  const before = (state.buffs || []).length;
  state.buffs = (state.buffs || []).filter(b => new Date(b.expiresAt).getTime() > Date.now());
  // abgelaufene Probe-Cosmetics wieder ablegen
  ['border', 'frame'].forEach(t => { if (state.equipped[t] && !ownsOrRents(state, state.equipped[t])) state.equipped[t] = null; });
  return before !== state.buffs.length;
}
const rentedIds = state => (state.buffs || []).filter(b => b.kind === 'rental' && new Date(b.expiresAt).getTime() > Date.now()).map(b => b.cosmeticId);
const ownsOrRents = (state, id) => ownsCosmetic(state, id) || rentedIds(state).includes(id);

// Cosmetics fuer Mystery/Try It On: echte Designs, nicht Basic, nicht der
// laufende Pass (Nutzer: den vorher testen waere unfair), noch nicht besessen
function lootableCosmetics(state) {
  const current = monthKey(new Date());
  return COSMETICS.filter(c => !c.base && c.passMonth !== current && !state.inventory.includes(c.id));
}

function consumableUnavailable(state, id) {
  const c = CONSUMABLES[id];
  if (c.buff && activeBuff(state, c.buff.kind)) return 'Already active';
  if (c.buff && (state.buffs || []).length >= MAX_BUFFS) return 'Buff slots full';
  if (id === 'bonus_daily' && state.bonusQuests.daily && state.bonusQuests.daily.day === dayKey(new Date())) return 'Already active';
  if (id === 'bonus_weekly' && state.bonusQuests.weekly && state.bonusQuests.weekly.week === weekKey(new Date())) return 'Already active';
  if ((id === 'mystery' || id === 'try_on') && !lootableCosmetics(state).filter(c => id === 'mystery' || !rentedIds(state).includes(c.id)).length) return 'Nothing left';
  return null;
}

function refreshConsumables(state, now) {
  const today = dayKey(now);
  const cs = { ...emptyState().consumables, ...(state.consumables || {}) };
  if (cs.dayKey === today) { state.consumables = cs; return false; }
  // nur anbieten, was gerade ueberhaupt sinnvoll ist (z.B. Mystery nur, wenn es etwas gibt)
  const pool = Object.keys(CONSUMABLES).filter(id => !((id === 'mystery' || id === 'try_on') && !lootableCosmetics(state).length));
  const slots = [];
  for (let i = 0; i < 2; i++) {
    if (Math.random() < CONSUMABLE_EMPTY_CHANCE) { slots.push(null); continue; }
    const left = pool.filter(id => !slots.includes(id));
    const total = left.reduce((a, id) => a + CONSUMABLES[id].weight, 0);
    let roll = Math.random() * total, pick = left[left.length - 1];
    for (const id of left) { if (roll < CONSUMABLES[id].weight) { pick = id; break; } roll -= CONSUMABLES[id].weight; }
    slots.push(pick || null);
  }
  state.consumables = { dayKey: today, slots, sold: [false, false] };
  return true;
}

function consumablesView(state) {
  return state.consumables.slots.map((id, i) => {
    if (!id) return null;
    const c = CONSUMABLES[id];
    return { id, slot: i, name: c.name, desc: c.desc, price: c.price, icon: c.icon, sold: !!state.consumables.sold[i], unavailable: state.consumables.sold[i] ? null : consumableUnavailable(state, id) };
  });
}

function buffsView(state) {
  return (state.buffs || []).map(b => {
    const cos = b.cosmeticId ? getCosmetic(b.cosmeticId) : null;
    return {
      kind: b.kind, label: BUFF_LABEL[b.kind] || b.kind, expiresAt: b.expiresAt,
      detail: b.kind === 'xpLevel' ? `${b.gamesLeft} game${b.gamesLeft === 1 ? '' : 's'} left`
        : b.kind === 'rental' && cos ? cos.name
        : b.kind === 'lpBank' ? 'next full bank' : b.kind === 'coupon' ? 'next shop item' : ''
    };
  });
}

function pickWeightedRarity(list) {
  const byR = {};
  list.forEach(c => { (byR[c.rarity] = byR[c.rarity] || []).push(c); });
  const entries = Object.entries(MYSTERY_WEIGHTS).filter(([r]) => byR[r]);
  if (!entries.length) return list[Math.floor(Math.random() * list.length)];
  let roll = Math.random() * entries.reduce((a, [, w]) => a + w, 0);
  for (const [r, w] of entries) { if (roll < w) return byR[r][Math.floor(Math.random() * byR[r].length)]; roll -= w; }
  const last = byR[entries[entries.length - 1][0]];
  return last[Math.floor(Math.random() * last.length)];
}

// Kauf = sofort einsetzen. choice = Cosmetic-id bei "Try It On".
function buyConsumable(slot, choice, context) {
  const state = readState();
  const now = new Date();
  pruneBuffs(state);
  refreshConsumables(state, now);
  const id = state.consumables.slots[slot];
  if (!id) return { ok: false, error: 'The merchant has nothing here today.' };
  if (state.consumables.sold[slot]) return { ok: false, error: 'Already bought today.' };
  const c = CONSUMABLES[id];
  const blocked = consumableUnavailable(state, id);
  if (blocked) return { ok: false, error: blocked };
  if (state.coins < c.price) return { ok: false, error: 'Not enough coins.' };
  const result = { ok: true, id };
  const until = ms => new Date(now.getTime() + ms).toISOString();
  if (c.buff) {
    const buff = { kind: c.buff.kind, id, startedAt: now.toISOString(), expiresAt: until(c.buff.hours ? c.buff.hours * 3600e3 : c.buff.days * 86400e3) };
    if (c.buff.games) buff.gamesLeft = c.buff.games;
    if (c.buff.kind === 'rental') {
      const target = lootableCosmetics(state).find(x => x.id === choice);
      if (!target || rentedIds(state).includes(target.id)) return { ok: false, error: 'Pick a cosmetic you do not own yet.' };
      buff.cosmeticId = target.id;
      result.cosmetic = { id: target.id, name: target.name, type: target.type, themeKey: target.themeKey || null };
    }
    state.buffs.push(buff);
  } else if (id === 'shop_reroll') {
    refreshShop(state, now);
    state.shop.daily = rollOffers(state, 3, shopWeights(SHOP_DAILY_WEIGHTS, state.shop.pityDaily, PITY_DAILY_STEP), 'daily', state.shop.weekly);
  } else if (id === 'week_reroll') {
    refreshShop(state, now);
    state.shop.weekly = rollOffers(state, 2, shopWeights(SHOP_WEEKLY_WEIGHTS, state.shop.pityWeekly, PITY_WEEKLY_STEP), 'weekly', state.shop.daily);
  } else if (id === 'bonus_daily') {
    const role = (context && context.role) || '';
    const today = dayKey(now);
    const shownId = (buildDailies(state, context || {}, now).find(q => q.rerollable !== undefined && DAILY_POOL.some(p => p.id === q.id)) || {}).id;
    const pool = DAILY_POOL.filter(q => (!q.role || q.role === role) && q.id !== shownId);
    state.bonusQuests.daily = { day: today, quest: pool[Math.floor(Math.random() * pool.length)] };
  } else if (id === 'bonus_weekly') {
    state.bonusQuests.weekly = { week: weekKey(now), quest: BONUS_WEEKLY_POOL[Math.floor(Math.random() * BONUS_WEEKLY_POOL.length)] };
  } else if (id === 'mystery') {
    const won = pickWeightedRarity(lootableCosmetics(state));
    state.inventory.push(won.id);
    result.cosmetic = { id: won.id, name: won.name, type: won.type, rarity: won.rarity };
  }
  state.coins -= c.price;
  state.consumables.sold[slot] = true;
  writeState(state);
  result.coins = state.coins;
  return result;
}

// Fuer theme-fx.js: welche Pass-/Shop-Themes darf dieses Profil gerade nutzen
// (besessen oder per "Try It On" geliehen)?
function themeAccess() {
  const state = readState();
  if (pruneBuffs(state)) writeState(state);
  const keys = new Set();
  [...state.inventory, ...rentedIds(state)].map(getCosmetic).filter(c => c && c.type === 'theme').forEach(c => keys.add(c.themeKey));
  return { themes: [...keys] };
}

// Gluecksrad - vom Nutzer so abgenommen (2026-10-09): Schnitt ~25 Coins pro
// Tag. Die Chancen werden bewusst NICHT angezeigt (Ueberraschungsmoment).
const WHEEL_SEGMENTS = [
  { label: '10', coins: 10, weight: 30 },
  { label: '25', coins: 25, weight: 24 },
  { label: '15', coins: 15, weight: 26 },
  { label: '50', coins: 50, weight: 10 },
  { label: '20', coins: 20, weight: 25 },
  { label: '100', coins: 100, weight: 4 },
  { label: '30', coins: 30, weight: 16 },
  { label: '250', coins: 250, weight: 1 }
];

function weekKey(now) {
  const d = nextWeeklyReset(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getShopState() {
  const now = new Date();
  const state = readState();
  const today = dayKey(now);
  const shopChanged = refreshShop(state, now);
  const consChanged = refreshConsumables(state, now);
  const buffsChanged = pruneBuffs(state);
  if (shopChanged || consChanged || buffsChanged) writeState(state);
  const owned = new Set(state.inventory);
  return {
    provisional: true,
    coins: state.coins,
    // Fuer das "?" im Shop: Preise + GRUND-Wahrscheinlichkeiten (die steigende
    // Chance bleibt bewusst unerwaehnt, Nutzerwunsch)
    prices: PRICES,
    odds: { daily: SHOP_DAILY_WEIGHTS, weekly: SHOP_WEEKLY_WEIGHTS, pastPass: PAST_PASS_CHANCE },
    consumables: consumablesView(state),
    maxBuffs: MAX_BUFFS,
    consumablesResetAt: nextDailyReset(now).toISOString(),
    buffs: buffsView(state),
    tryOn: lootableCosmetics(state).filter(c => !rentedIds(state).includes(c.id)).map(c => ({ id: c.id, name: c.name, type: c.type, rarity: c.rarity, themeKey: c.themeKey || null })),
    daily: state.shop.daily.map(id => offerView(id, owned)).filter(Boolean),
    weekly: state.shop.weekly.map(id => offerView(id, owned)).filter(Boolean),
    dailyResetAt: nextDailyReset(now).toISOString(),
    weeklyResetAt: nextWeeklyReset(now).toISOString(),
    wheel: {
      segments: WHEEL_SEGMENTS.map(s => ({ label: s.label, coins: s.coins })),
      canSpin: state.wheel.lastSpinDay !== today,
      todayIndex: state.wheel.lastSpinDay === today && Number.isInteger(state.wheel.lastIndex) ? state.wheel.lastIndex : null,
      nextSpinAt: nextDailyReset(now).toISOString()
    }
  };
}

function spinWheel() {
  const state = readState();
  const today = dayKey(new Date());
  if (state.wheel.lastSpinDay === today) return { ok: false, error: 'Already spun today - come back tomorrow.' };
  const total = WHEEL_SEGMENTS.reduce((a, s) => a + s.weight, 0);
  let roll = Math.random() * total;
  let index = 0;
  while (roll >= WHEEL_SEGMENTS[index].weight) { roll -= WHEEL_SEGMENTS[index].weight; index++; }
  const seg = WHEEL_SEGMENTS[index];
  state.wheel = { lastSpinDay: today, lastIndex: index, spins: (state.wheel.spins || 0) + 1 };
  state.coins += seg.coins;
  writeState(state);
  return { ok: true, index, coins: seg.coins, totalCoins: state.coins };
}

function getOverview(context) {
  const now = new Date();
  const state = readState();
  // Ohne Rolle/Champions (z.B. champion.html) nichts gutschreiben - die
  // Rollen-Quest des Tages haengt von der Rolle ab.
  const hasCtx = context && (context.role || (context.champions || []).length);
  if (hasCtx && creditQuestsInState(state, context, now)) writeState(state);
  const quests = questsWithProgress(state, context || {}, now);
  return {
    provisional: true,
    level: levelFromXp(state.totalXp),
    totalXp: state.totalXp,
    gamesToday: state.ledger.filter(e => e.day === dayKey(now)).length,
    recentGames: [...state.ledger].sort((a, b) => b.gameCreation - a.gameCreation).slice(0, 5),
    fullXpGamesPerDay: FULL_XP_GAMES_PER_DAY,
    dailies: quests.dailies,
    weeklies: quests.weeklies,
    dailyResetAt: nextDailyReset(now).toISOString(),
    weeklyResetAt: nextWeeklyReset(now).toISOString(),
    pass: getPassOverview(state, now),
    coins: state.coins,
    equipped: state.equipped,
    lpBank: {
      size: LP_BANK_SIZE,
      progress: state.lpBank.progress,
      fills: state.lpBank.fills,
      xpPerFill: XP_PER_LP_BANK,
      recent: [...state.lpBank.events].reverse().slice(0, 3)
    },
    xpSources: {
      perGame: XP_PER_GAME,
      winBonus: XP_WIN_BONUS,
      perKill: XP_PER_KILL,
      perAssist: XP_PER_ASSIST,
      perLpBank: XP_PER_LP_BANK,
      lpBankSize: LP_BANK_SIZE,
      perTrophy: XP_PER_TROPHY
    }
  };
}

module.exports = {
  getOverview,
  creditMatches,
  creditLp,
  getLifetimeStats,
  getCosmeticsState,
  equipCosmetic,
  saveProfileLayout,
  rerollDaily,
  creditQuests,
  buyConsumable,
  themeAccess,
  getShopState,
  spinWheel,
  resetState
};
