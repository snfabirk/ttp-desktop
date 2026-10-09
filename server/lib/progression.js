const fs = require('fs');
const path = require('path');
const { dataSubdir } = require('./dataPaths');

// XP-/Level-System (v5.0.0, PROVISORISCH): Profil-Level (laeuft fuer immer,
// jedes Level etwas teurer), Challenge-Pass (30 Stufen, pro Challenge neu),
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
// Anti-Abuse fuer den Challenge-Pass (Nutzerwunsch): XP kommen spaeter aus
// einem Ledger, in dem jedes Match (matchId) und jede Quest/Trophy nur EINMAL
// gutgeschrieben wird - unabhaengig von der Challenge. Wer nach einem Spiel
// resettet und neu startet, bekommt fuer dasselbe Spiel nichts zweimal, und
// Pass-Belohnungen werden pro Stufe nur einmal dauerhaft freigeschaltet.

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

// XP fuer Level n -> n+1: jedes Level etwas teurer.
function xpForLevel(level) {
  return 2000 + 250 * (level - 1);
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

// ----- Speicherung -----
function filePath() {
  return path.join(dataSubdir('progression'), 'progression.json');
}

function emptyState() {
  return {
    version: 1, totalXp: 0, ledger: [], rerolls: {}, passXp: 0, passChallengeStart: null,
    // lastLP: zuletzt gesehener LP-Stand (vergleichbar ueber Tiers hinweg,
    // siehe rankHistory.toComparableLP), progress: 0-99 auf dem Konto.
    lpBank: { puuid: null, lastLP: null, progress: 0, fills: 0, events: [] }
  };
}

function readState() {
  try {
    return { ...emptyState(), ...JSON.parse(fs.readFileSync(filePath(), 'utf-8')) };
  } catch (e) {
    return emptyState();
  }
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
// Challenge bringt fuer dasselbe Spiel nichts zweimal. Der Pass zaehlt nur
// XP, die waehrend der aktuellen Challenge (challengeStart) gutgeschrieben
// wurden.
function syncPassChallenge(state, challengeStart) {
  if (challengeStart && state.passChallengeStart !== challengeStart) {
    state.passChallengeStart = challengeStart;
    state.passXp = 0;
  }
}

function creditMatches(games, { challengeStart }) {
  const state = readState();
  syncPassChallenge(state, challengeStart);
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
        champId: g.champId || '', base, halved, xp
      };
      state.ledger.push(entry);
      state.totalXp += xp;
      state.passXp += xp;
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
function creditLp({ puuid, currentLP, baselineLP, challengeStart }) {
  if (!puuid || typeof currentLP !== 'number' || Number.isNaN(currentLP)) return null;
  const state = readState();
  syncPassChallenge(state, challengeStart);
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
    state.passXp += xp;
    event = { at: Date.now(), gained, filled, xp };
    bank.events.push(event);
    if (bank.events.length > 50) bank.events.splice(0, bank.events.length - 50);
  }
  writeState(state);
  return event;
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

function getOverview(context) {
  const now = new Date();
  const state = readState();
  const passXp = state.passXp;
  const passTier = Math.min(PASS_TIERS, Math.floor(passXp / PASS_XP_PER_TIER));
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
    pass: {
      tiers: PASS_TIERS,
      xpPerTier: PASS_XP_PER_TIER,
      tier: passTier,
      xpIntoTier: passTier >= PASS_TIERS ? PASS_XP_PER_TIER : passXp % PASS_XP_PER_TIER
    },
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
  rerollDaily,
  resetState
};
