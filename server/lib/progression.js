const fs = require('fs');
const path = require('path');
const { dataSubdir } = require('./dataPaths');
const { getCosmetic, passCosmetic } = require('./cosmetics');

// XP-/Level-System (v5.0.0, PROVISORISCH): Profil-Level (laeuft fuer immer,
// jedes Level etwas teurer), Monats-Pass (seit v5.3.0: ein Pass pro
// Kalendermonat, 30 Stufen + endlose 30+-Leiste, Coins + Cosmetics),
// Daily/Weekly Quests. Seit v5.1.0 bringen gespielte Spiele (creditMatches)
// und gewonnene LP (creditLp, "LP-Konto") echte XP - beides aufgerufen vom
// Match-Scan in runSummaryBatch; Quests und Trophies vergeben noch nichts.
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
const OVERFLOW_XP_PER_STEP = 2500;
const COINS_PER_OVERFLOW_STEP = 100;

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
  const overflowXp = Math.max(0, xp - PASS_TIERS * PASS_XP_PER_TIER);
  return {
    tier,
    xpIntoTier: tier >= PASS_TIERS ? PASS_XP_PER_TIER : xp % PASS_XP_PER_TIER,
    overflowCount: Math.floor(overflowXp / OVERFLOW_XP_PER_STEP),
    overflowXpInto: overflowXp % OVERFLOW_XP_PER_STEP
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
      xpPerStep: OVERFLOW_XP_PER_STEP,
      coinsPerStep: COINS_PER_OVERFLOW_STEP,
      count: prog.overflowCount,
      xpInto: prog.overflowXpInto
    }
  };
}

// ----- Cosmetics / Coins -----
function getCosmeticsState() {
  const state = readState();
  return {
    coins: state.coins,
    owned: state.inventory.map(getCosmetic).filter(Boolean),
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
    if (!state.inventory.includes(id)) return { ok: false, error: 'You do not own this cosmetic yet.' };
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
    wheel: { lastSpinDay: null, spins: 0 }
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
  ['border', 'frame'].forEach(t => { if (state.equipped[t] && !state.inventory.includes(state.equipped[t])) state.equipped[t] = null; });
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
      const entry = {
        matchId: g.matchId, gameCreation: g.gameCreation, day, gameOfDay,
        category: g.category, win: !!g.win, kills: g.kills || 0, deaths: g.deaths || 0, assists: g.assists || 0,
        champId: g.champId || '', champName: g.champName || '', base, halved, xp
      };
      state.ledger.push(entry);
      state.totalXp += xp;
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
    const xp = filled * XP_PER_LP_BANK;
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
    owned: state.inventory.map(getCosmetic).filter(Boolean),
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
  const others = pool.filter(q => q.id !== current.id);
  if (!others.length) return { ok: false, error: 'No other quest available.' };
  state.rerolls = { [day]: others[Math.floor(Math.random() * others.length)].id };
  writeState(state);
  return { ok: true };
}

// ----- Shop (v5.13.0, PROVISORISCH) -----
// Rotierende Angebote: taeglich 3 (Wechsel wie die Daily Quests, 06:00) und
// woechentlich 2 Highlights (Montag 06:00). Die Artikel sind Platzhalter fuer
// spaetere Shop-exklusive Cosmetics - noch nicht kaufbar. Preise sind
// Platzhalter, die Preisstaffel nach Typ legt der Nutzer noch fest.
const SHOP_DAILY_POOL = [
  { id: 'shop-ember-ring', type: 'border', name: 'Ember Ring', price: 350, c: ['#ff7a18', '#5a1a08'] },
  { id: 'shop-frost-rim', type: 'border', name: 'Frost Rim', price: 350, c: ['#9fd8ff', '#1c3a5a'] },
  { id: 'shop-moonlit-ring', type: 'border', name: 'Moonlit Ring', price: 350, c: ['#e9dcc0', '#2a2440'] },
  { id: 'shop-thorn-ring', type: 'border', name: 'Thorn Ring', price: 350, c: ['#6fbf73', '#1a2a14'] },
  { id: 'shop-iron-frame', type: 'frame', name: 'Iron Frame', price: 400, c: ['#9a9aa3', '#202024'] },
  { id: 'shop-ivy-frame', type: 'frame', name: 'Ivy Frame', price: 400, c: ['#4caf7d', '#10241a'] },
  { id: 'shop-rune-frame', type: 'frame', name: 'Rune Frame', price: 400, c: ['#b088ff', '#1e1436'] },
  { id: 'shop-gilded-frame', type: 'frame', name: 'Gilded Frame', price: 400, c: ['#c8aa6e', '#2a2010'] }
];
const SHOP_WEEKLY_POOL = [
  { id: 'shop-starfall', type: 'theme', name: 'Starfall', price: 900, c: ['#0a0f2a', '#ffd86b'] },
  { id: 'shop-sakura', type: 'theme', name: 'Sakura Garden', price: 1200, c: ['#2a0f1c', '#ff8fb1'], animated: true },
  { id: 'shop-dragonfire', type: 'border', name: 'Dragonfire Ring', price: 800, c: ['#ff4d1a', '#3a0a04'], fancy: true },
  { id: 'shop-void-rift', type: 'frame', name: 'Void Rift', price: 800, c: ['#7a3cff', '#0c0618'], fancy: true },
  { id: 'shop-deep-sea', type: 'theme', name: 'Deep Sea', price: 900, c: ['#04161f', '#3fd0c9'] }
];
// Gluecksrad - Felder und Gewichte sind Platzhalter (Nutzer legt sie fest)
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

function pickRotation(pool, count, seed) {
  const left = pool.slice();
  const out = [];
  for (let i = 0; i < count && left.length; i++) out.push(left.splice(seededIndex(`${seed}:${i}`, left.length), 1)[0]);
  return out;
}

function getShopState() {
  const now = new Date();
  const state = readState();
  const today = dayKey(now);
  return {
    provisional: true,
    coins: state.coins,
    daily: pickRotation(SHOP_DAILY_POOL, 3, `shop:${today}`),
    weekly: pickRotation(SHOP_WEEKLY_POOL, 2, `shopw:${weekKey(now)}`),
    dailyResetAt: nextDailyReset(now).toISOString(),
    weeklyResetAt: nextWeeklyReset(now).toISOString(),
    wheel: {
      segments: WHEEL_SEGMENTS.map(s => ({ label: s.label, coins: s.coins })),
      canSpin: state.wheel.lastSpinDay !== today,
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
  state.wheel = { lastSpinDay: today, spins: (state.wheel.spins || 0) + 1 };
  state.coins += seg.coins;
  writeState(state);
  return { ok: true, index, coins: seg.coins, totalCoins: state.coins };
}

function getOverview(context) {
  const now = new Date();
  const state = readState();
  return {
    provisional: true,
    level: levelFromXp(state.totalXp),
    totalXp: state.totalXp,
    gamesToday: state.ledger.filter(e => e.day === dayKey(now)).length,
    recentGames: [...state.ledger].sort((a, b) => b.gameCreation - a.gameCreation).slice(0, 5),
    fullXpGamesPerDay: FULL_XP_GAMES_PER_DAY,
    dailies: buildDailies(state, context, now),
    weeklies: buildWeeklies(state, context),
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
  getShopState,
  spinWheel,
  resetState
};
