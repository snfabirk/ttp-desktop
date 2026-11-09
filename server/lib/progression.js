const fs = require('fs');
const path = require('path');
const { dataSubdir } = require('./dataPaths');
const { COSMETICS, PRICES, priceOf, getCosmetic, passCosmetic, passLastMonth, inPass } = require('./cosmetics');
const STICKERS = require('./stickers');

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
  offRole: 50,          // alles andere (Fill)
  // v6.0: Spiel ohne laufende Challenge - nur Account-Level (+Coins), kein
  // Pass, keine Quests. 300 vom Nutzer bestaetigt (2026-11-06).
  noChallenge: 300
};
const XP_WIN_BONUS = 150;            // zusaetzlich bei Sieg, egal welche Kategorie
// Coins pro gewertetem Game (v5.27.0), ab dem 6. Spiel des Tages wie XP halbiert
const COINS_PER_GAME = 30;
const COINS_WIN_BONUS = 20;
const XP_PER_KILL = 10;
const XP_PER_ASSIST = 5;
const FULL_XP_GAMES_PER_DAY = 5;      // ab dem 6. Spiel des Tages: alle XP halbiert

// LP-Konto (Nutzeridee 2026-10-09): jeder LP-GEWINN wandert auf ein Konto
// 0-100, LP-Verluste werden ignoriert. Ist es voll, gibt es XP (Level + Pass)
// und es beginnt von vorn - ueberschuessige LP werden mitgenommen. So
// bekommen auch Spieler XP, die kaum netto climben (hardstuck).
const LP_BANK_SIZE = 100;
// v6.6.0 (Nutzerwunsch): 600 XP (= halbe Pass-Stufe) + 1 Gutschein fuer einen
// regulaeren Booster pro voller Bank (frueher 1000 XP).
const XP_PER_LP_BANK = 600;
const BUNDLE_SIZE = 5; // 5 Booster kaufen = 4 bezahlen (v6.6.0)

const PASS_TIERS = 30;
// 1.200 statt 1.500 seit v5.21.0 (Nutzerwunsch: "auch mal abschalten koennen" -
// Stufe 30 in ~46 Pool-Games statt ~57, also auch mit Pausen im Monat machbar)
const PASS_XP_PER_TIER = 1200;
// Pass-Belohnungen (Nutzerdesign 2026-10-09): Stufen 5/10/../30 = die 6
// Cosmetics DIESES Monats (cosmetics.js), alle anderen Stufen = Coins. Nach
// Stufe 30 gibt es endlos weiter Coins, aber jede 30+-Stufe kostet mehr XP,
// damit der Coin-Grind langsamer ist als der Pass selbst.
// Coins steigen leicht mit der Stufe (Nutzerwunsch: spaeter auch coin-
// technisch lohnender) - seit v5.13.0 1-10: 80, 11-20: 100, 21-30: 120,
// in Summe weiterhin 2.400 pro Pass (24 Coin-Stufen).
// v5.27.0 (Nutzer: "man soll nicht einen Monat grinden, um sich eine Sache
// leisten zu koennen"): Pass-Coins verdreifacht, 30+ verdoppelt, Coins pro
// Game, Gluecksrad x3 - die Booster werden der Coin-Abfluss.
function coinsForTier(tier) {
  // v6.3.0 (Nutzer): +40 je Stufe, weil Stufe 13/22 jetzt Profilbilder sind
  return tier <= 10 ? 280 : tier <= 20 ? 340 : 400;
}
const FALLBACK_COSMETIC_COINS = 900; // Monat ohne angelegte Cosmetics
// Pass 30+ (Nutzerentscheidung 2026-10-09, v5.14.0): jede weitere 30+-Stufe
// kostet 500 XP mehr als die vorige (2.500, 3.000, 3.500 ...), damit
// Vielspieler den Shop nicht leerkaufen. Bereits abgeholte Stufen bleiben.
// v5.21.0: 2.000 / +300 (vorher 2.500 / +500) - passend zu 1.200 XP pro Stufe,
// 30+5 kostet 13.000 XP
const OVERFLOW_XP_FIRST = 2000;
const OVERFLOW_XP_GROWTH = 300;
const COINS_PER_OVERFLOW_STEP = 200;
// Gutschein (Nutzeridee 2026-10-10, v5.22.0): bei 30+5 gibt es einmal pro
// Monat einen Gutschein fuer ein Gratis-Refined/Fancy aus dem HEUTIGEN Daily-
// Shop. Er laeuft mit dem Daily-Wechsel ab (Nutzer: sonst wartet man einfach
// auf den naechsten Tag - "wers verpasst selbst schuld"). Eigener Platz,
// belegt keinen der 3 Buff-Slots.
const VOUCHER_AT_OVERFLOW = 5;
const VOUCHER_RARITIES = ['refined', 'fancy'];
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
// Tageswechsel 00:00 deutscher Zeit (Europe/Berlin, Sommer- und Winterzeit
// automatisch), Wochenwechsel Montag 00:00 - Nutzerwunsch 2026-11-06, vorher
// 06:00 Ortszeit. Gilt fuer Quests, Spiele-pro-Tag, Shop, Goods und Wheel.
const RESET_TZ = 'Europe/Berlin';
const berlinFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: RESET_TZ, hourCycle: 'h23',
  year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
});
function berlinParts(t) {
  const p = {};
  berlinFmt.formatToParts(new Date(t)).forEach(x => { if (x.type !== 'literal') p[x.type] = Number(x.value); });
  return p;
}
// Versatz Berlin - UTC in ms zum Zeitpunkt t
function berlinOffset(t) {
  const p = berlinParts(t);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(t / 1000) * 1000;
}
// Kalenderdatum in Berlin: { y, m (1-12), d, wd (0 = Sonntag) }
function berlinDate(now = new Date()) {
  const p = berlinParts(now);
  return { y: p.year, m: p.month, d: p.day, wd: new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() };
}
// 00:00 Berliner Zeit an diesem Kalendertag (Ueberlauf wie bei Date.UTC erlaubt).
// Die Zeitumstellung passiert erst um 2/3 Uhr, deshalb gilt um Mitternacht
// noch der Versatz vom Vortag.
function berlinMidnight(y, m, d) {
  const utc = Date.UTC(y, m - 1, d);
  return new Date(utc - berlinOffset(utc - 12 * 3600000));
}
function ymdKey({ y, m, d }) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function dayKey(now) {
  return ymdKey(berlinDate(now));
}
function nextDailyReset(now = new Date()) {
  const { y, m, d } = berlinDate(now);
  return berlinMidnight(y, m, d + 1);
}
function nextWeeklyReset(now = new Date()) {
  const { y, m, d, wd } = berlinDate(now);
  const daysUntilMonday = ((8 - wd) % 7) || 7;
  return berlinMidnight(y, m, d + daysUntilMonday);
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
    { id: 'firstwin', slot: 'firstwin', title: 'First Win of the Day', desc: 'Win any ranked game', target: 1, xp: 400, rerollable: false }
  ];

  const champs = (champions || []).filter(c => c && c.name);
  if (champs.length) {
    const champ = champs[seededIndex(`${day}:champ`, champs.length)];
    quests.push({ id: `champwin_${champ.id}`, slot: 'champ', title: 'Champion of the Day', desc: `Win a game with ${champ.name}`, champId: champ.id, target: 1, xp: 500, rerollable: false });
  }

  const pool = DAILY_POOL.filter(q => !q.role || q.role === role);
  const rerolled = state.rerolls[day];
  let pick = pool[seededIndex(`${day}:role`, pool.length)];
  if (rerolled) pick = pool.find(q => q.id === rerolled) || pick;
  quests.push({ ...pick, slot: 'role', rerollable: !rerolled });

  return quests.map(q => ({ ...q, progress: 0, done: false }));
}

// ----- Quest-Fortschritt (v5.17.0) -----
// Jede Quest gilt fuer ihren Zeitraum (Tag ab 00:00 / Woche ab Montag 00:00, Berliner Zeit)
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
  // v6.0: nur Spiele aus einer Challenge zaehlen (egal welcher Summoner)
  const challengeGames = state.ledger.filter(g => g.pass !== false);
  const todays = challengeGames.filter(g => g.day === today);
  const weeks = challengeGames.filter(g => new Date(g.gameCreation) >= weekFrom);
  const credited = state.questLedger || {};
  const weekKeyStr = weekKey(now);
  const bq = state.bonusQuests || {};
  const dailyList = buildDailies(state, context, now);
  if (bq.daily && bq.daily.day === today) dailyList.push({ ...bq.daily.quest, bonus: true, rerollable: false, progress: 0, done: false });
  const weeklyList = buildWeeklies(state, context);
  if (bq.weekly && bq.weekly.week === weekKeyStr) weeklyList.push({ ...bq.weekly.quest, bonus: true, progress: 0, done: false });
  // Schluessel pro SLOT (v6.0, Nutzerwunsch): wer "Champion of the Day" auf
  // einem Summoner erledigt hat, bekommt ihn auf einem anderen (mit anderen
  // Champs) nicht noch einmal. Alte Schluessel (pro Quest-ID) zaehlen mit.
  const qKey = (p, period, q) => `${p}:${period}:${q.bonus ? 'bonus:' : ''}${q.slot || q.id}`;
  const oldKey = (p, period, q) => `${p}:${period}:${q.bonus ? 'bonus:' : ''}${q.id}`;
  const lockDone = q => (q.credited ? { ...q, done: true, progress: q.target } : q);
  const dailies = dailyList.map(q => evaluateDaily(q, todays))
    .map(q => ({ ...q, key: qKey('d', today, q) }))
    .map(q => ({ ...q, credited: !!(credited[q.key] || credited[oldKey('d', today, q)]) })).map(lockDone);
  const weeklies = weeklyList.map(q => evaluateWeekly(q, weeks, state, weekFrom))
    .map(q => ({ ...q, key: qKey('w', weekKeyStr, q) }))
    .map(q => ({ ...q, credited: !!(credited[q.key] || credited[oldKey('w', weekKeyStr, q)]) })).map(lockDone);
  return { dailies, weeklies, today, weekKeyStr };
}

// Schreibt erledigte, noch nicht gutgeschriebene Quests gut (Level + Pass).
function creditQuestsInState(state, context, now) {
  const { dailies, weeklies, today, weekKeyStr } = questsWithProgress(state, context, now);
  state.questLedger = state.questLedger || {};
  let added = 0;
  const credit = (key, q) => {
    if (!q.done || q.credited || state.questLedger[key]) return;
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
  if (!context || !context.challengeActive) return 0; // v6.0: Quests nur mit Challenge
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

// Gratis-Booster im Pass (v5.29.0, Nutzer: unregelmaessig verteilt, 8 Stueck,
// gelten fuer jedes Set - aktuell gibt es nur das Base Set)
// v6.7.2 (Nutzer): statt eines Base-Boosters ein Gutschein fuer einen
// regulaeren Booster nach Wahl (wie aus der LP Bank, Einloesen im Shop)
const BOOSTER_TIERS = [3, 7, 12, 16, 19, 23, 27, 29];
// Profilbilder im Pass (v6.3.0, Nutzerdesign): Stufe 13 simpel, 22 besser.
// Monate ohne angelegte Profilbilder geben dort ganz normal Coins.
const AVATAR_TIERS = [13, 22];
function tierReward(month, tier) {
  if (BOOSTER_TIERS.includes(tier)) return { type: 'boosterVoucher', amount: 1 };
  if (AVATAR_TIERS.includes(tier)) {
    const av = passCosmetic(month, tier);
    if (av) return { type: 'cosmetic', id: av.id, name: av.name, cosmeticType: av.type, animated: !!av.animated };
  }
  if (tier % 5 === 0) {
    const cosmetic = passCosmetic(month, tier);
    if (cosmetic) return { type: 'cosmetic', id: cosmetic.id, name: cosmetic.name, cosmeticType: cosmetic.type, themeKey: cosmetic.themeKey, animated: !!cosmetic.animated };
    return { type: 'coins', amount: FALLBACK_COSMETIC_COINS };
  }
  return { type: 'coins', amount: coinsForTier(tier) };
}

// Vergibt alle Belohnungen bis zur aktuell erreichten Stufe, die in diesem
// Monat noch nicht vergeben wurden. Cosmetics bleiben fuer immer im Inventar.
// Belohnungen holt man seit v5.25.0 selbst ab (Nutzerwunsch: sehen, dass sie
// bereit sind, anklicken - Coins fliegen in den Kontostand, Cosmetics zum
// Profil). claimedTier/claimedOverflow heissen weiter so, bedeuten aber
// "erreicht und verbucht"; die Belohnung liegt bis zum Abholen in
// pass.pendingTiers (Coins UND Cosmetics) / pass.pendingOverflow.
function claimPassRewards(state, month) {
  const pass = state.passes[month];
  if (!Array.isArray(pass.pendingTiers)) pass.pendingTiers = [];
  pass.pendingOverflow = pass.pendingOverflow || 0;
  const prog = passProgress(pass.xp);
  for (let t = pass.claimedTier + 1; t <= prog.tier; t++) {
    const reward = tierReward(month, t);
    // Schon besessenes Cosmetic (z.B. verlaengerter Pass, v5.30.1): nichts
    // abzuholen, die Stufe zeigt "Already owned" (Nutzerentscheidung: kein Ersatz)
    if (reward.type === 'cosmetic' && state.inventory.includes(reward.id)) markOwnedTier(pass, t);
    else pass.pendingTiers.push(t);
  }
  pass.claimedTier = Math.max(pass.claimedTier, prog.tier);
  if (prog.overflowCount > pass.claimedOverflow) {
    pass.pendingOverflow += prog.overflowCount - pass.claimedOverflow;
    pass.claimedOverflow = prog.overflowCount;
  }
  if (prog.overflowCount >= VOUCHER_AT_OVERFLOW && !pass.voucherGranted) {
    pass.voucherGranted = true;
    const now = new Date();
    state.voucher = { month, grantedAt: now.toISOString(), expiresAt: nextDailyReset(now).toISOString() };
  }
}

function markOwnedTier(pass, t) {
  pass.ownedTiers = pass.ownedTiers || [];
  if (!pass.ownedTiers.includes(t)) pass.ownedTiers.push(t);
}

// Nicht abgeholte Coins vergangener Monate automatisch gutschreiben (den alten
// Pass kann man nicht mehr oeffnen, also geht so nichts verloren)
function settleOldPasses(state, now = new Date()) {
  const cur = monthKey(now);
  Object.entries(state.passes || {}).forEach(([month, pass]) => {
    if (month === cur) return;
    (pass.pendingTiers || []).forEach(t => {
      const r = tierReward(month, t);
      if (r.type === 'boosterVoucher') state.boosterVouchers = (state.boosterVouchers || 0) + 1;
      else if (r.type === 'cosmetic') { if (!state.inventory.includes(r.id)) state.inventory.push(r.id); } else state.coins += r.amount || 0;
    });
    state.coins += (pass.pendingOverflow || 0) * COINS_PER_OVERFLOW_STEP;
    pass.pendingTiers = []; pass.pendingOverflow = 0;
  });
}

// Coins einer Stufe (tier) bzw. aller 30+-Stufen (overflow) oder alles abholen
function claimPassCoins({ tier, overflow, all } = {}) {
  const state = readState();
  const now = new Date();
  const month = monthKey(now);
  const pass = state.passes[month];
  if (!pass) return { ok: false, error: 'Nothing to claim yet.' };
  pass.pendingTiers = pass.pendingTiers || [];
  let amount = 0;
  const cosmetics = [], boosters = [];
  const takeTier = t => {
    const i = pass.pendingTiers.indexOf(t); if (i < 0) return false;
    pass.pendingTiers.splice(i, 1);
    const r = tierReward(month, t);
    if (r.type === 'boosterVoucher') {
      state.boosterVouchers = (state.boosterVouchers || 0) + 1;
      boosters.push({ tier: t, voucher: true });
    } else if (r.type === 'cosmetic') {
      if (state.inventory.includes(r.id)) { markOwnedTier(pass, t); return true; }
      state.inventory.push(r.id);
      cosmetics.push({ tier: t, id: r.id, name: r.name, type: r.cosmeticType });
    } else amount += r.amount || 0;
    return true;
  };
  if (all) {
    [...pass.pendingTiers].forEach(takeTier);
    amount += (pass.pendingOverflow || 0) * COINS_PER_OVERFLOW_STEP; pass.pendingOverflow = 0;
  } else if (overflow) {
    amount += (pass.pendingOverflow || 0) * COINS_PER_OVERFLOW_STEP; pass.pendingOverflow = 0;
  } else if (!takeTier(Number(tier))) {
    return { ok: false, error: 'Nothing to claim on this tier.' };
  }
  if (!amount && !cosmetics.length && !boosters.length) return { ok: false, error: 'Nothing to claim.' };
  state.coins += amount;
  writeState(state);
  return { ok: true, amount, cosmetics, boosters, coins: state.coins };
}

// ----- Booster & Sticker (v5.29.0) -----
// Jeder neu erhaltene Booster (Pass, Shop) zaehlt fuer den Album-Reiter mit
// (v6.6.0, Nutzerwunsch): "+N seit dem letzten Album-Besuch", nicht der Bestand.
function gainBoosters(state, setId, n) {
  state.boosters[setId] = (state.boosters[setId] || 0) + n;
  state.newBoosters = (state.newBoosters || 0) + n;
}
// Booster verschenken (v6.6.0, supabase/007-booster-gifts.sql): beim Senden
// lokal abziehen (bei Fehler zurueckgeben), beim Empfang gutschreiben - zaehlt
// dann auch fuer den Album-Reiter.
function takeBoostersForGift(setId, qty) {
  const st = STICKERS.getSet(setId);
  qty = Math.floor(Number(qty) || 0);
  if (!st) return { ok: false, error: 'Unknown booster.' };
  if (qty < 1 || qty > 10) return { ok: false, error: 'You can gift 1 to 10 boosters at once.' };
  const state = readState();
  if ((state.boosters[setId] || 0) < qty) return { ok: false, error: "You don't have that many unopened boosters." };
  state.boosters[setId] -= qty;
  writeState(state);
  return { ok: true, owned: state.boosters[setId] };
}
function returnGiftBoosters(setId, qty) {
  const state = readState();
  state.boosters[setId] = (state.boosters[setId] || 0) + qty;
  writeState(state);
}
function receiveGiftBoosters(gifts) {
  if (!gifts.length) return;
  const state = readState();
  gifts.forEach(g => gainBoosters(state, g.set_id, g.qty));
  writeState(state);
}
function newBoostersCount() { return readState().newBoosters || 0; }
// Release-Geschenk (v6.9.0): offene Gratis-Booster neuer Sets
function releaseGiftsPending() {
  const state = readState(), got = state.releaseGifts || {};
  return {
    pending: STICKERS.SETS.filter(st => STICKERS.releaseWindowOpen(st) && !got[st.id])
      .map(st => ({ id: st.id, name: st.name, special: !!st.special, total: st.stickers.length, qty: STICKERS.RELEASE_GIFT }))
  };
}
function claimReleaseGift(setId) {
  const st = STICKERS.getSet(setId);
  if (!st || !STICKERS.releaseWindowOpen(st)) return { ok: false, error: 'There is nothing to claim for this set.' };
  const state = readState();
  state.releaseGifts = state.releaseGifts || {};
  if (state.releaseGifts[setId]) return { ok: false, error: 'You already claimed these boosters.' };
  state.releaseGifts[setId] = new Date().toISOString();
  gainBoosters(state, setId, STICKERS.RELEASE_GIFT);
  writeState(state);
  return { ok: true, qty: STICKERS.RELEASE_GIFT, owned: state.boosters[setId], newBoosters: state.newBoosters };
}
function markBoostersSeen() {
  const state = readState();
  if (state.newBoosters) { state.newBoosters = 0; writeState(state); }
  return { ok: true, newBoosters: 0 };
}
function boosterSetsView(state) {
  const win = STICKERS.weekendWindow();
  return STICKERS.SETS.map(st => ({
    id: st.id, name: st.name, price: st.price, released: st.released,
    special: !!st.special, available: STICKERS.availableNow(st),
    ...(st.special ? { opensAt: win.opensAt, closesAt: win.closesAt } : {}),
    owned: state.boosters[st.id] || 0,
    total: st.stickers.length,
    collected: Object.keys(state.stickers[st.id] || {}).length
  }));
}
// 5er-Pack: jeder fuenfte Booster ist gratis (20 % Rabatt)
const boosterCost = (price, qty) => price * (qty - Math.floor(qty / BUNDLE_SIZE));
// LP-Bank-Gutschein gegen einen regulaeren (nicht Special) Booster einloesen
function redeemBoosterVoucher(setId) {
  const st = STICKERS.getSet(setId);
  if (!st || !st.released) return { ok: false, error: 'This booster is not available.' };
  if (st.special) return { ok: false, error: 'Vouchers only work on regular boosters.' };
  const state = readState();
  if (!(state.boosterVouchers > 0)) return { ok: false, error: 'You have no booster voucher.' };
  state.boosterVouchers -= 1;
  gainBoosters(state, setId, 1);
  writeState(state);
  return { ok: true, vouchers: state.boosterVouchers, owned: state.boosters[setId], newBoosters: state.newBoosters };
}
function buyBooster(setId, qty = 1) {
  const st = STICKERS.getSet(setId);
  if (!st || !st.released) return { ok: false, error: 'This booster is not available.' };
  if (!STICKERS.availableNow(st)) return { ok: false, error: 'Special boosters can only be bought on Saturdays and Sundays.' };
  qty = Math.max(1, Math.min(10, Math.floor(Number(qty) || 1)));
  const state = readState();
  const cost = boosterCost(st.price, qty);
  if (state.coins < cost) return { ok: false, error: 'Not enough coins.' };
  state.coins -= cost;
  gainBoosters(state, setId, qty);
  writeState(state);
  return { ok: true, coins: state.coins, owned: state.boosters[setId], newBoosters: state.newBoosters };
}
// Oeffnet count Booster: jeder Sticker ist "neu", wenn man ihn bis dahin noch
// nicht hatte (auch innerhalb desselben Openings). Doppelte landen seit v6.6.0
// in der Dupes-Sammlung (stickers[set][n] = Anzahl Kopien) und werden dort
// verkauft oder spaeter getauscht (Nutzeridee).
function openBoosters(setId, count = 1) {
  const st = STICKERS.getSet(setId);
  if (!st) return { ok: false, error: 'Unknown booster.' };
  const state = readState();
  const have = state.boosters[setId] || 0;
  count = Math.max(1, Math.min(have, Math.floor(Number(count) || 1)));
  if (!have) return { ok: false, error: 'You have no boosters of this set.' };
  const col = state.stickers[setId] = state.stickers[setId] || {};
  const faCol = state.fullArts[setId] = state.fullArts[setId] || {};
  const cards = [];
  let refund = 0;
  for (let p = 0; p < count; p++) {
    for (const s of STICKERS.rollPack(st)) {
      const c = s.fa ? faCol : col;
      const isNew = !c[s.n];
      c[s.n] = (c[s.n] || 0) + 1;
      cards.push({ n: s.n, id: s.id, r: s.r, fa: !!s.fa, isNew, dupe: !isNew, refund: 0 });
    }
  }
  state.boosters[setId] = have - count;
  state.coins += refund;
  writeState(state);
  return { ok: true, cards, refund, coins: state.coins, owned: state.boosters[setId], stickers: col, fullArts: faCol };
}
// Dupes verkaufen (v6.6.0): pro Set (oder alle) und Seltenheit (oder alle);
// keep = so viele Doppelte JE Sticker behalten (z.B. 1 als Tauschkopie).
// Das Album-Exemplar selbst wird nie verkauft.
function sellDupes({ set, rarity, keep } = {}) {
  keep = Math.max(0, Math.min(99, Math.floor(Number(keep) || 0)));
  const state = readState();
  const sets = STICKERS.SETS.filter(st => !set || set === 'all' || st.id === set);
  let sold = 0, coins = 0;
  const sellFrom = (col, list, r) => list.forEach(n => {
    const extra = Math.max(0, (col[n] || 0) - 1 - keep);
    if (!extra) return;
    col[n] -= extra;
    sold += extra;
    coins += extra * STICKERS.DUPE_REFUND[r];
  });
  sets.forEach(st => {
    const col = state.stickers[st.id] || {};
    st.stickers.forEach(s => { if (!rarity || rarity === 'all' || s.r === rarity) sellFrom(col, [s.n], s.r); });
    if (!rarity || rarity === 'all' || rarity === 'fullart') sellFrom(state.fullArts[st.id] || {}, Object.keys(state.fullArts[st.id] || {}).map(Number), 'fullart');
  });
  if (!sold) return { ok: false, error: 'Nothing to sell.' };
  state.coins += coins;
  writeState(state);
  return { ok: true, sold, refund: coins, coins: state.coins, stickers: state.stickers, fullArts: state.fullArts };
}
// ----- Sticker tauschen (v6.6.0, supabase/009-sticker-trades.sql) -----
// Angebote: Der Anbieter reserviert seine Sticker + zahlt seine Gebuehr beim
// Senden; der Partner gibt seine Sticker + Gebuehr beim Annehmen. Gebuehr =
// je ERHALTENEM Sticker nach Seltenheit (Nutzer: kleine Gebuehr auf beiden Seiten).
// Nutzer (v6.6.0): Gebuehr waechst mit der Groesse, damit sich ein riesiger
// Sammeltausch nicht lohnt - 50 Coins je Sticker im GANZEN Tausch, beide Seiten
// zahlen sie (1:1 = 100 je Seite, 3:1 = 200, 10:10 = 1000).
const TRADE_FEE = 50;
const stickerOf = (set, n, fa) => {
  const st = STICKERS.getSet(set); if (!st) return null;
  if (fa && !(st.fullArts || []).includes(Number(n))) return null;
  return st.stickers.find(s => s.n === Number(n)) || null;
};
// Sammlung fuer ein Item: normale Sticker oder Full Arts (fa: true)
const colFor = (state, it, create) => {
  const root = it.fa ? state.fullArts : state.stickers;
  if (create && !root[it.set]) root[it.set] = {};
  return root[it.set] || {};
};
const itemKey = it => `${it.set}:${it.n}${it.fa ? 'fa' : ''}`;
// [{set,n,qty,fa}] pruefen + zusammenfassen; null = ungueltig
function normTradeItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 10) return null;
  const out = [];
  for (const it of items) {
    const fa = !!(it && it.fa);
    const s = it && stickerOf(it.set, it.n, fa);
    const qty = Math.floor(Number(it && it.qty) || 1);
    if (!s || qty < 1 || qty > 10) return null;
    const ex = out.find(o => o.set === it.set && o.n === s.n && !!o.fa === fa);
    if (ex) ex.qty += qty; else out.push(fa ? { set: it.set, n: s.n, qty, fa: true } : { set: it.set, n: s.n, qty });
  }
  return out.length <= 10 ? out : null;
}
const qtyOf = items => (items || []).reduce((a, it) => a + (it.qty || 1), 0);
const tradeFee = (give, want) => TRADE_FEE * (qtyOf(give) + qtyOf(want));
const missingStickers = (state, items) => items.filter(it => (colFor(state, it)[it.n] || 0) < it.qty);
const profileKey = c => `${c.set || 'base'}:${c.n}${c.fa ? 'fa' : ''}`;
function takeStickers(state, items) {
  items.forEach(it => {
    const col = colFor(state, it, true);
    col[it.n] = (col[it.n] || 0) - it.qty;
    if (col[it.n] <= 0) delete col[it.n];
  });
  // Weggegebene letzte Exemplare verschwinden auch vom Profil
  if (Array.isArray(state.profileLayout)) {
    state.profileLayout = state.profileLayout.filter(w => !(w && w.type === 'sticker' && w.config && !colFor(state, { set: w.config.set || 'base', fa: w.config.fa })[w.config.n]));
  }
}
function addStickers(state, items) {
  items.forEach(it => {
    const col = colFor(state, it, true);
    col[it.n] = (col[it.n] || 0) + it.qty;
  });
}
// Hinweise fuer die Oberflaeche: letztes Exemplar / klebt auf dem Profil
function tradeWarnings(items) {
  const state = readState();
  const onProfile = new Set((state.profileLayout || []).filter(w => w && w.type === 'sticker' && w.config).map(w => profileKey(w.config)));
  return items.map(it => {
    const have = colFor(state, it)[it.n] || 0;
    return { set: it.set, n: it.n, fa: !!it.fa, lastCopy: have - it.qty < 1, onProfile: onProfile.has(itemKey(it)) && have - it.qty < 1 };
  });
}
// Anbieter: reservieren (give) + eigene Gebuehr (fuer want) zahlen
function tradeReserve(give, want) {
  const state = readState();
  const miss = missingStickers(state, give);
  if (miss.length) return { ok: false, error: "You don't have all the stickers you offered anymore." };
  const fee = tradeFee(give, want);
  if (state.coins < fee) return { ok: false, error: `Not enough coins for the trade fee (${fee}).` };
  takeStickers(state, give);
  state.coins -= fee;
  writeState(state);
  return { ok: true, fee };
}
function tradeUnreserve(give, want) {
  const state = readState();
  addStickers(state, give);
  state.coins += tradeFee(give, want);
  writeState(state);
}
// Partner: seine Sticker (want) geben + Gebuehr (fuer give) zahlen
function tradeAcceptTake(give, want) {
  const state = readState();
  const miss = missingStickers(state, want);
  if (miss.length) return { ok: false, error: "You don't have all the stickers they asked for anymore." };
  const fee = tradeFee(give, want);
  if (state.coins < fee) return { ok: false, error: `Not enough coins for the trade fee (${fee}).` };
  takeStickers(state, want);
  state.coins -= fee;
  writeState(state);
  return { ok: true, fee };
}
function tradeAcceptRollback(give, want) {
  const state = readState();
  addStickers(state, want);
  state.coins += tradeFee(give, want);
  writeState(state);
}
function tradeReceive(items) {
  const state = readState();
  addStickers(state, items);
  writeState(state);
}
// Anbieter rechnet entschiedene Angebote ab: angenommen -> want bekommen,
// sonst Reserviertes + Gebuehr zurueck
function tradeSettle(rows) {
  if (!rows.length) return;
  const state = readState();
  rows.forEach(r => {
    const give = normTradeItems(r.give) || [], want = normTradeItems(r.want) || [];
    if (r.status === 'accepted') addStickers(state, want);
    else { addStickers(state, give); state.coins += tradeFee(give, want); }
  });
  writeState(state);
}
function tradeInfo() {
  const state = readState();
  return { coins: state.coins, stickers: state.stickers, fee: TRADE_FEE };
}
// { set: { complete, master } } - Master braucht alle (geheimen) Full Arts
const setStatusAll = state => Object.fromEntries(STICKERS.SETS.map(st => [st.id, STICKERS.setStatus(st, state.stickers[st.id], state.fullArts[st.id])]));
function getAlbum() {
  const state = readState();
  return {
    coins: state.coins,
    sets: boosterSetsView(state),
    stickers: state.stickers,
    fullArts: state.fullArts,
    setStatus: setStatusAll(state),
    tradeFee: TRADE_FEE,
    profileStickers: (state.profileLayout || []).filter(w => w && w.type === 'sticker' && w.config).map(w => profileKey(w.config)),
    rates: { pack: STICKERS.PACK, animChance: STICKERS.ANIM_CHANCE, dupeRefund: STICKERS.DUPE_REFUND }
  };
}

// Abgelaufenen Gutschein entfernen; liefert true bei Aenderung
function pruneVoucher(state) {
  if (state.voucher && state.voucher.expiresAt && new Date(state.voucher.expiresAt).getTime() <= Date.now()) {
    state.voucher = null;
    return true;
  }
  return false;
}
const voucherView = state => state.voucher && !(state.voucher.expiresAt && new Date(state.voucher.expiresAt).getTime() <= Date.now())
  ? { expiresAt: state.voucher.expiresAt, rarities: VOUCHER_RARITIES }
  : null;

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
  const pending = new Set(pass.pendingTiers || []);
  const ownedTiers = new Set(pass.ownedTiers || []);
  for (let t = 1; t <= PASS_TIERS; t++) {
    const r = tierReward(month, t);
    // vorher schon besessen: erreicht (ownedTiers) oder noch nicht erreicht
    const alreadyOwned = r.type === 'cosmetic' && (ownedTiers.has(t) || (t > prog.tier && state.inventory.includes(r.id)));
    rewards.push({ tier: t, ...r, claimable: pending.has(t) && !alreadyOwned, alreadyOwned });
  }
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
      xpInto: prog.overflowXpInto,
      pending: pass.pendingOverflow || 0,
      voucherAt: VOUCHER_AT_OVERFLOW,
      voucherGranted: !!(state.passes[month] && state.passes[month].voucherGranted)
    },
    voucher: voucherView(state)
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

// Fuer electron-main.js: welches App-Icon ist ausgeruestet (nur wenn besessen)
function getEquippedIcon() {
  const state = readState();
  const id = state.equipped && state.equipped.icon;
  return id && getCosmetic(id) && ownsCosmetic(state, id) ? id : null;
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
    const c = w.config && typeof w.config === 'object' ? w.config : {};
    const config = {
      text: typeof c.text === 'string' ? c.text.slice(0, 280) : undefined,
      champId: typeof c.champId === 'string' ? c.champId.slice(0, 40) : undefined,
      set: typeof c.set === 'string' ? c.set.slice(0, 20) : undefined,
      n: Number.isInteger(c.n) ? c.n : undefined,
      fa: c.fa === true ? true : undefined
    };
    clean.push({ id: w.id.slice(0, 40), type: w.type.slice(0, 30), x: w.x, y: w.y, w: w.w, h: w.h, config });
  }
  const state = readState();
  state.profileLayout = clean;
  writeState(state);
  return { ok: true };
}

// ----- Speicherung -----
// Seit v5.33.0 pro Profil-Account eine eigene Datei (cloud.js setzt den
// Scope beim Anmelden). progression.json = Stand von vor den Accounts, wird
// beim ersten Login einmalig uebernommen (claimLegacyState).
let userScope = null;
let onWrite = null;
function setUserScope(id) { userScope = id || null; }
function setOnWrite(fn) { onWrite = fn; }
function legacyFilePath() {
  return path.join(dataSubdir('progression'), 'progression.json');
}
function filePath() {
  return userScope ? path.join(dataSubdir('progression'), `${userScope}.json`) : legacyFilePath();
}
function hasUserFile(id) {
  return fs.existsSync(path.join(dataSubdir('progression'), `${id}.json`));
}
function claimLegacyState(id) {
  const legacy = legacyFilePath();
  if (!fs.existsSync(legacy)) return false;
  fs.copyFileSync(legacy, path.join(dataSubdir('progression'), `${id}.json`));
  fs.renameSync(legacy, path.join(dataSubdir('progression'), `progression.claimed-by-${id}.json`));
  return true;
}
// Wann der alte Stand von vor den Accounts zuletzt geaendert wurde (null = keiner da)
function legacyStateTime() {
  try { return fs.statSync(legacyFilePath()).mtimeMs; } catch (e) { return null; }
}
function exportState() {
  return readState();
}
function importState(data) {
  fs.writeFileSync(filePath(), JSON.stringify(data, null, 2));
}

function emptyState() {
  return {
    version: 2, totalXp: 0, ledger: [], rerolls: {},
    // passes['YYYY-MM'] = { xp, claimedTier, claimedOverflow }
    passes: {}, coins: 0, inventory: [], equipped: { border: null, frame: null, frameBg: true, icon: null, avatar: null },
    // Sticker (v5.29.0): ungeoeffnete Booster je Set + gesammelte Sticker je Set ({ n: Anzahl })
    boosters: {}, stickers: {}, newBoosters: 0,
    // Full Arts (v6.6.0): eigene Sammlung { set: { n: Anzahl } } neben stickers
    fullArts: {},
    // Profil-Stats (v6.7.1, Nutzer): Summoner, dessen Statistiken das Profil zeigt -
    // im Profil-Editor gewaehlt, unabhaengig vom Umschalter oben (null = aktiver)
    profileStatsPuuid: null,
    // Gutscheine aus der LP Bank: je 1 regulaerer Booster nach Wahl (v6.6.0)
    boosterVouchers: 0,
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
    bonusQuests: { daily: null, weekly: null },
    lastBuffDiscardAt: null
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
  state.boosters = state.boosters || {}; state.stickers = state.stickers || {}; state.fullArts = state.fullArts || {};
  // v5.29.2: Base-Set neu nummeriert (seltenste zuerst) - Sammlung und Profil-
  // Sticker einmalig auf die neuen Nummern umziehen
  if (!state.stickerNumbering) {
    const old = state.stickers.base || {};
    const moved = {};
    Object.keys(old).forEach(n => { moved[STICKERS.migrateBaseN(Number(n))] = 1; });
    if (state.stickers.base) state.stickers.base = moved;
    (state.profileLayout || []).forEach(w => { if (w && w.type === 'sticker' && w.config && Number.isInteger(w.config.n)) w.config.n = STICKERS.migrateBaseN(w.config.n); });
    state.stickerNumbering = 2;
  }
  // Cosmetics, die es nicht (mehr) gibt (z.B. die Test-Borders des ersten
  // Oktober-Passes), fallen still aus Inventar und Ausruestung.
  state.inventory = (state.inventory || []).filter(id => getCosmetic(id));
  state.equipped = { ...emptyState().equipped, ...(state.equipped || {}) };
  // Zu jeder schon erreichten Cosmetic-Stufe gehoert das AKTUELLE Cosmetic
  // dieses Monats ins Inventar (idempotent) - so bekommt auch, wer die Stufe
  // vor einer Katalog-Aenderung geholt hat, die neue Belohnung.
  // Abholbereite Cosmetics, die man inzwischen schon besitzt (Pass-
  // Verlaengerung, v5.30.1): nicht mehr abholbar, Stufe zeigt "Already owned"
  Object.entries(state.passes || {}).forEach(([month, pass]) => {
    pass.pendingTiers = (pass.pendingTiers || []).filter(t => {
      const r = tierReward(month, t);
      if (r.type === 'cosmetic' && state.inventory.includes(r.id)) { markOwnedTier(pass, t); return false; }
      return true;
    });
  });
  Object.entries(state.passes || {}).forEach(([month, pass]) => {
    for (let t = 5; t <= Math.min(pass.claimedTier || 0, PASS_TIERS); t += 5) {
      if ((pass.pendingTiers || []).includes(t)) continue; // liegt noch zum Abholen bereit
      const c = passCosmetic(month, t);
      if (c && !state.inventory.includes(c.id)) state.inventory.push(c.id);
    }
  });
  ['border', 'frame'].forEach(t => { if (state.equipped[t] && !ownsOrRents(state, state.equipped[t])) state.equipped[t] = null; });
  settleOldPasses(state);
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
  // Level-Up-Ereignisse fuer die Activity (v6.3.0). Erstes Mal nur merken.
  const lvl = levelFromXp(state.totalXp || 0).level;
  if (typeof state.lastLevel !== 'number') state.lastLevel = lvl;
  else if (lvl > state.lastLevel) {
    state.levelEvents = [...(state.levelEvents || []), { at: Date.now(), level: lvl }].slice(-10);
    state.lastLevel = lvl;
  } else if (lvl < state.lastLevel) state.lastLevel = lvl; // Reset
  fs.writeFileSync(filePath(), JSON.stringify(state, null, 2));
  if (onWrite) onWrite();
}

function resetState() {
  fs.rmSync(filePath(), { force: true });
  if (onWrite) onWrite();
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
      const coins = Math.round((COINS_PER_GAME + (g.win ? COINS_WIN_BONUS : 0)) * (halved ? 0.5 : 1));
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
        // v6.7.0: von welchem Summoner das Spiel kam (Profil-Stats je Summoner)
        puuid: g.puuid || null,
        category: g.category, win: !!g.win, kills: g.kills || 0, deaths: g.deaths || 0, assists: g.assists || 0,
        champId: g.champId || '', champName: g.champName || '', base, halved, xp, coins,
        levelBonus,
        // v6.0: false = Spiel ausserhalb einer Challenge (zaehlt nicht fuer
        // Pass und Quests). Alte Eintraege ohne Feld zaehlen als Challenge-Spiel.
        pass: g.pass !== false,
        stats: g.stats || null
      };
      state.ledger.push(entry);
      state.totalXp += xp + levelBonus;
      state.coins += coins;
      if (entry.pass) addPassXp(state, monthKey(new Date(g.gameCreation)), xp);
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
    if (filled) state.boosterVouchers = (state.boosterVouchers || 0) + filled;
    state.totalXp += xp;
    if (xp) addPassXp(state, monthKey(new Date()), xp);
    event = { at: Date.now(), gained, filled, xp, puuid, ...(filled ? { vouchers: filled } : {}) };
    bank.events.push(event);
    if (bank.events.length > 50) bank.events.splice(0, bank.events.length - 50);
  }
  writeState(state);
  return event;
}

// Lebenszeit-Zahlen fuer die Spielerprofil-Seite (profile.html) - alles,
// was das Ledger seit v5.1.0 mitgeschrieben hat.
// Letzte Ereignisse fuer die Activity der Freunde (v6.2.0): Spiele und
// volle LP-Banks, neueste zuerst.
function getRecentActivity(limit = 10) {
  const state = readState();
  const games = [...state.ledger].sort((a, b) => b.gameCreation - a.gameCreation).slice(0, limit)
    .map(g => ({ kind: 'game', at: g.gameCreation, win: !!g.win, champId: g.champId || '', champName: g.champName || '', xp: g.xp || 0 }));
  const bank = [...((state.lpBank && state.lpBank.events) || [])].filter(e => e.filled).slice(-5)
    .map(e => ({ kind: 'lpbank', at: new Date(e.at).getTime(), xp: e.xp || 0 }));
  const levels = (state.levelEvents || []).map(e => ({ kind: 'levelup', at: e.at, level: e.level }));
  return [...games, ...bank, ...levels].sort((a, b) => b.at - a.at).slice(0, limit);
}

// Profil-Stats (v6.7.0, Nutzer): Spiel-Statistiken immer nur fuer EINEN
// Summoner - den oben gewaehlten - nie gemischt. Level/XP/Coins/Sammlung
// bleiben profilweit. Ohne Summoner gibt es keine Spiel-Statistiken.
function getLifetimeStats(puuid) {
  const state = readState();
  const games = puuid ? state.ledger.filter(g => g.puuid === puuid) : [];
  const lpEvents = puuid ? state.lpBank.events.filter(e => e.puuid === puuid) : [];
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
    lpGained: lpEvents.reduce((n, e) => n + e.gained, 0),
    lpBankFills: lpEvents.reduce((n, e) => n + (e.filled || 0), 0),
    coins: state.coins,
    equipped: state.equipped,
    owned: ownedList(state),
    // Alle Cosmetics, die es gibt (Sammelansicht im Profil-Editor: fehlende
    // ausgegraut mit Schloss + "x / y gesammelt", Nutzerwunsch v5.15.0)
    catalog: COSMETICS.map(c => ({ ...c, source: c.passMonth ? `${monthLabel(c.passMonth)} Pass · tier ${c.tier}` : c.base ? 'Basic' : 'Shop' })),
    profileLayout: state.profileLayout,
    stickers: state.stickers,
    fullArts: state.fullArts,
    setStatus: setStatusAll(state),
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

// Alte Spiele/LP-Ereignisse (vor v6.7.0 ohne Summoner) einmalig zuordnen.
// resolve(entry) liefert die puuid oder null (= nicht zuordenbar, 'unknown').
function getProfileStatsPuuid() { return readState().profileStatsPuuid || null; }
function setProfileStatsPuuid(puuid) {
  const state = readState();
  state.profileStatsPuuid = puuid || null;
  writeState(state);
  return { ok: true };
}
function assignSummoners(resolve) {
  const state = readState();
  let changed = 0;
  state.ledger.forEach(e => { if (e.puuid === undefined || e.puuid === null) { e.puuid = resolve(e) || 'unknown'; changed++; } });
  state.lpBank.events.forEach(e => { if (e.puuid === undefined || e.puuid === null) { e.puuid = resolve(e) || 'unknown'; changed++; } });
  if (changed) writeState(state);
  return changed;
}

function rerollDaily(context) {
  const state = readState();
  const day = dayKey(new Date());
  if (state.rerolls[day]) return { ok: false, error: 'Reroll already used today.' };
  if (!context || !context.challengeActive) return { ok: false, error: 'Quests only run during a challenge.' };
  if ((state.questLedger || {})[`d:${day}:role`]) return { ok: false, error: 'This quest is already done.' };
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
// Jeder Spieler hat seinen eigenen Shop: taeglich 3 Angebote (Wechsel 00:00
// wie die Daily Quests), woechentlich 2 Highlights (Montag 00:00), einmal
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
// Shop-Artikel = alle Cosmetics mit source 'shop' (cosmetics.js, seit v5.19.0 echte Designs)
const SHOP_ITEMS = COSMETICS.filter(c => c.source === 'shop');
const SHOP_RARITY_ORDER = ['basic', 'refined', 'fancy', 'animated', 'animatedplus'];
// Animated+ (v5.20.0): extrem selten, ohne steigende Chance
const SHOP_DAILY_WEIGHTS = { basic: 30, refined: 49.5, fancy: 18, animated: 2, animatedplus: .5 };
const SHOP_WEEKLY_WEIGHTS = { fancy: 68, animated: 30, animatedplus: 2 };
const PITY_DAILY_STEP = 1;
const PITY_WEEKLY_STEP = 20;
const PAST_PASS_CHANCE = { daily: 0.08, weekly: 0.2 };

function shopItemById(id) {
  return getCosmetic(id);
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
  const pastPass = COSMETICS.filter(c => c.passMonth && passLastMonth(c) < current && allowed.has(c.rarity));
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
      // Animated+ nur, wenn es selbst gewuerfelt wurde - sonst waere es fuer
      // alle, die Animated leergekauft haben, der Normalfall statt selten
      const order = [...SHOP_RARITY_ORDER.slice(idx), ...SHOP_RARITY_ORDER.slice(0, idx).reverse()]
        .filter(r => allowed.has(r) && (r !== 'animatedplus' || want === 'animatedplus'));
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
    themeKey: c.themeKey || null, devChoice: !!c.devChoice,
    fromPass: c.passMonth ? `${monthLabel(c.passMonth)} Pass` : null,
    owned: owned.has(c.id)
  };
}

// Wuerfelt neue Angebote, wenn ein neuer Tag / eine neue Woche begonnen hat.
// 4 Daily-Angebote seit v5.24.0 (Nutzer: mehr Auswahl = bewusste Entscheidung,
// die Coins bleiben die Grenze)
const DAILY_OFFERS = 4;
function refreshShop(state, now) {
  const shop = { ...emptyState().shop, ...(state.shop || {}) };
  const today = dayKey(now), week = weekKey(now);
  let changed = false;
  // Angebote, die es nicht (mehr) gibt (Platzhalter vor v5.19.0), neu wuerfeln
  if (shop.weekly.some(id => !getCosmetic(id))) shop.weekKey = null;
  if (shop.daily.some(id => !getCosmetic(id))) shop.dayKey = null;
  // Items des laufenden Passes gehoeren nicht in den Shop (z.B. nach einer
  // Pass-Verlaengerung schon als "alter Pass" gewuerfelt)
  const cur = monthKey(now);
  const inCurPass = id => { const c = getCosmetic(id); return !!c && inPass(c, cur); };
  if (shop.weekly.some(inCurPass)) shop.weekKey = null;
  if (shop.daily.some(inCurPass)) shop.dayKey = null;
  if (shop.weekKey !== week) {
    shop.weekly = rollOffers(state, 2, shopWeights(SHOP_WEEKLY_WEIGHTS, shop.pityWeekly, PITY_WEEKLY_STEP), 'weekly');
    const hit = shop.weekly.some(id => (shopItemById(id) || {}).rarity === 'animated');
    shop.pityWeekly = hit ? 0 : shop.pityWeekly + 1;
    shop.weekKey = week;
    changed = true;
  }
  if (shop.dayKey !== today) {
    shop.daily = rollOffers(state, DAILY_OFFERS, shopWeights(SHOP_DAILY_WEIGHTS, shop.pityDaily, PITY_DAILY_STEP), 'daily', shop.weekly);
    const hit = shop.daily.some(id => (shopItemById(id) || {}).rarity === 'animated');
    shop.pityDaily = hit ? 0 : shop.pityDaily + 1;
    shop.dayKey = today;
    changed = true;
  } else if (shop.daily.length < DAILY_OFFERS) {
    // Heute schon gewuerfelt, aber weniger Plaetze (z.B. vor v5.24.0 mit 3):
    // nur auffuellen, die bestehenden Angebote bleiben
    const add = rollOffers(state, DAILY_OFFERS - shop.daily.length, shopWeights(SHOP_DAILY_WEIGHTS, shop.pityDaily, PITY_DAILY_STEP), 'daily', [...shop.weekly, ...shop.daily]);
    if (add.length) { shop.daily = [...shop.daily, ...add]; changed = true; }
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
const BUFF_DISCARD_COOLDOWN_MS = 24 * 3600e3; // Buff entfernen: ohne Erstattung, 1x pro 24 h
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
  // App-Icons nicht (v5.28.0): ein geliehenes Icon liesse die Taskleiste nach
  // Ablauf nicht zurueckspringen, und als Mystery-Gewinn waere es enttaeuschend
  return COSMETICS.filter(c => !c.base && c.type !== 'icon' && !inPass(c, current) && !state.inventory.includes(c.id));
}

function consumableUnavailable(state, id) {
  const c = CONSUMABLES[id];
  if (c.buff && activeBuff(state, c.buff.kind)) return 'Already active';
  if (c.buff && (state.buffs || []).length >= MAX_BUFFS) return 'Effect slots full';
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

// Buff entfernen (Nutzerdesign): Notausgang, keine Erstattung, danach 24 h Pause
function discardBuff(kind) {
  const state = readState();
  pruneBuffs(state);
  const buff = state.buffs.find(b => b.kind === kind);
  if (!buff) return { ok: false, error: 'This effect is not active.' };
  const next = discardAvailableAt(state);
  if (next && next > Date.now()) return { ok: false, error: 'You can remove an effect again later.' };
  state.buffs = state.buffs.filter(b => b !== buff);
  state.lastBuffDiscardAt = new Date().toISOString();
  pruneBuffs(state); // abgelegte Probe-Cosmetics wieder ausziehen
  writeState(state);
  return { ok: true };
}
function discardAvailableAt(state) {
  return state.lastBuffDiscardAt ? new Date(state.lastBuffDiscardAt).getTime() + BUFF_DISCARD_COOLDOWN_MS : null;
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
    state.shop.daily = rollOffers(state, DAILY_OFFERS, shopWeights(SHOP_DAILY_WEIGHTS, state.shop.pityDaily, PITY_DAILY_STEP), 'daily', state.shop.weekly);
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

// Shop-Kauf (v5.19.0): nur was heute/diese Woche im eigenen Shop angeboten
// wird; Basic ist gratis; ein aktiver 20%-Gutschein wird dabei verbraucht.
function buyShopItem(id, useVoucher) {
  const state = readState();
  const now = new Date();
  pruneBuffs(state);
  pruneVoucher(state);
  refreshShop(state, now);
  if (!state.shop.daily.includes(id) && !state.shop.weekly.includes(id)) return { ok: false, error: 'This item is not in your shop right now.' };
  const c = getCosmetic(id);
  if (!c) return { ok: false, error: 'Unknown item.' };
  if (state.inventory.includes(id)) return { ok: false, error: 'You already own this.' };
  if (useVoucher) {
    if (!state.voucher) return { ok: false, error: 'Your voucher has expired.' };
    if (!state.shop.daily.includes(id)) return { ok: false, error: "The voucher only works in today's daily offers." };
    if (!VOUCHER_RARITIES.includes(c.rarity)) return { ok: false, error: 'The voucher only works on Refined and Fancy items.' };
    state.voucher = null;
    state.inventory.push(id);
    writeState(state);
    return { ok: true, id, price: 0, usedVoucher: true, coins: state.coins, cosmetic: { id: c.id, name: c.name, type: c.type, themeKey: c.themeKey || null } };
  }
  let price = priceOf(c);
  const coupon = price > 0 ? activeBuff(state, 'coupon') : null;
  if (coupon) price = Math.round(price * 0.8);
  if (state.coins < price) return { ok: false, error: 'Not enough coins.' };
  state.coins -= price;
  state.inventory.push(id);
  if (coupon) state.buffs = state.buffs.filter(b => b !== coupon);
  writeState(state);
  return { ok: true, id, price, usedCoupon: !!coupon, coins: state.coins, cosmetic: { id: c.id, name: c.name, type: c.type, themeKey: c.themeKey || null } };
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
  { label: '30', coins: 30, weight: 30 },
  { label: '75', coins: 75, weight: 24 },
  { label: '45', coins: 45, weight: 26 },
  { label: '150', coins: 150, weight: 10 },
  { label: '60', coins: 60, weight: 25 },
  { label: '300', coins: 300, weight: 4 },
  { label: '90', coins: 90, weight: 16 },
  { label: '750', coins: 750, weight: 1 }
];

function weekKey(now) {
  return ymdKey(berlinDate(nextWeeklyReset(now)));
}

function getShopState() {
  const now = new Date();
  const state = readState();
  const today = dayKey(now);
  const shopChanged = refreshShop(state, now);
  const consChanged = refreshConsumables(state, now);
  const buffsChanged = pruneBuffs(state);
  const voucherChanged = pruneVoucher(state);
  if (shopChanged || consChanged || buffsChanged || voucherChanged) writeState(state);
  const owned = new Set(state.inventory);
  return {
    coins: state.coins,
    // Fuer das "?" im Shop: Preise + GRUND-Wahrscheinlichkeiten (die steigende
    // Chance bleibt bewusst unerwaehnt, Nutzerwunsch)
    prices: PRICES,
    odds: { daily: SHOP_DAILY_WEIGHTS, weekly: SHOP_WEEKLY_WEIGHTS, pastPass: PAST_PASS_CHANCE },
    couponActive: !!activeBuff(state, 'coupon'),
    consumables: consumablesView(state),
    maxBuffs: MAX_BUFFS,
    discardAvailableAt: (t => t && t > Date.now() ? new Date(t).toISOString() : null)(discardAvailableAt(state)),
    consumablesResetAt: nextDailyReset(now).toISOString(),
    buffs: buffsView(state),
    voucher: voucherView(state),
    boosters: boosterSetsView(state),
    boosterRates: { pack: STICKERS.PACK, animChance: STICKERS.ANIM_CHANCE, faChance: STICKERS.FA_CHANCE, dupeRefund: STICKERS.DUPE_REFUND },
    boosterBundle: BUNDLE_SIZE,
    boosterVouchers: state.boosterVouchers || 0,
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

function creditedMatchIds() {
  return new Set(readState().ledger.map(e => e.matchId));
}

function getOverview(context) {
  const now = new Date();
  const state = readState();
  // Ohne Rolle/Champions (z.B. champion.html) nichts gutschreiben - die
  // Rollen-Quest des Tages haengt von der Rolle ab.
  const hasCtx = context && (context.role || (context.champions || []).length);
  const challengeActive = !!(context && context.challengeActive);
  if (challengeActive && hasCtx && creditQuestsInState(state, context, now)) writeState(state);
  const quests = challengeActive ? questsWithProgress(state, context || {}, now) : { dailies: [], weeklies: [] };
  return {
    level: levelFromXp(state.totalXp),
    totalXp: state.totalXp,
    gamesToday: state.ledger.filter(e => e.day === dayKey(now)).length,
    challengeActive,
    recentGames: [...state.ledger].sort((a, b) => b.gameCreation - a.gameCreation).slice(0, 7),
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
      vouchers: state.boosterVouchers || 0,
      recent: [...state.lpBank.events].reverse().slice(0, 3)
    },
    xpSources: {
      perGame: XP_PER_GAME,
      winBonus: XP_WIN_BONUS,
      perKill: XP_PER_KILL,
      perAssist: XP_PER_ASSIST,
      perLpBank: XP_PER_LP_BANK,
      lpBankSize: LP_BANK_SIZE
    }
  };
}

module.exports = {
  setUserScope, setOnWrite, hasUserFile, claimLegacyState, legacyStateTime, exportState, importState,
  getOverview,
  creditMatches,
  creditedMatchIds,
  getRecentActivity,
  creditLp,
  getLifetimeStats,
  assignSummoners,
  getProfileStatsPuuid,
  setProfileStatsPuuid,
  getCosmeticsState,
  equipCosmetic,
  saveProfileLayout,
  rerollDaily,
  creditQuests,
  claimPassCoins,
  getEquippedIcon,
  buyConsumable,
  buyShopItem,
  buyBooster,
  redeemBoosterVoucher,
  openBoosters,
  sellDupes,
  normTradeItems, tradeFee, missingStickers: (items) => missingStickers(readState(), items), tradeWarnings,
  tradeReserve, tradeUnreserve, tradeAcceptTake, tradeAcceptRollback, tradeReceive, tradeSettle, tradeInfo,
  newBoostersCount,
  releaseGiftsPending,
  claimReleaseGift,
  takeBoostersForGift,
  returnGiftBoosters,
  receiveGiftBoosters,
  markBoostersSeen,
  getAlbum,
  discardBuff,
  themeAccess,
  getShopState,
  spinWheel,
  resetState
};
