const fs = require('fs');
const path = require('path');
const { dataSubdir } = require('./dataPaths');

// XP-/Level-System (v5.0.0, PROVISORISCH): Profil-Level (laeuft fuer immer,
// jedes Level etwas teurer), Challenge-Pass (30 Stufen, pro Challenge neu),
// Daily/Weekly Quests. In dieser Version wird noch KEINE XP vergeben - alles
// wird nur mit Stand 0 angezeigt, damit Aufbau und Zahlen besprochen werden
// koennen. Alle Zahlen hier sind Platzhalter.
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
const XP_PER_KILL_PARTICIPATION = 10; // pro Kill + Assist
const FULL_XP_GAMES_PER_DAY = 5;      // ab dem 6. Spiel des Tages: alle XP halbiert
const XP_PER_TROPHY = 750;            // temporaere Trophaeen zaehlen nicht

const PASS_TIERS = 30;
const PASS_XP_PER_TIER = 1500;
const DEMO_PASS_XP = 15 * 1500 + 900; // TEMPORAER: Demo-Ansicht, Pass halb durch (null = aus)

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

// Multiplikator = Schwierigkeit x LP-Abstand zum Ziel (ein 200-LP-Ziel ist
// viel schneller geschafft als ein 1000-LP-Ziel).
const DIFFICULTY_MULTIPLIER = { easy: 1.0, normal: 1.1, hard: 1.2, very_hard: 1.35, majestic: 1.5 };
function lpDistanceMultiplier(distance) {
  const d = Math.max(0, distance || 0);
  return 1 + Math.min(0.5, Math.max(0, d - 200) / 2000);
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
  return { version: 1, totalXp: 0, ledger: [], rerolls: {}, passXp: 0, passChallengeStart: null };
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
  const difficulty = DIFFICULTY_MULTIPLIER[context.challengeLevel] || 1;
  // TEMPORAERE DEMO (Nutzerwunsch): Pass halb durch anzeigen - wieder entfernen.
  const passXp = DEMO_PASS_XP !== null ? DEMO_PASS_XP : state.passXp;
  const passTier = Math.min(PASS_TIERS, Math.floor(passXp / PASS_XP_PER_TIER));
  return {
    provisional: true,
    level: levelFromXp(state.totalXp),
    totalXp: state.totalXp,
    gamesToday: 0,
    fullXpGamesPerDay: FULL_XP_GAMES_PER_DAY,
    dailies: buildDailies(state, context, now),
    weeklies: buildWeeklies(state, context),
    dailyResetAt: nextDailyReset(now).toISOString(),
    weeklyResetAt: nextWeeklyReset(now).toISOString(),
    pass: {
      tiers: PASS_TIERS,
      xpPerTier: PASS_XP_PER_TIER,
      tier: passTier,
      xpIntoTier: passTier >= PASS_TIERS ? PASS_XP_PER_TIER : passXp % PASS_XP_PER_TIER,
      demo: DEMO_PASS_XP !== null
    },
    multiplier: { difficulty },
    xpSources: {
      perGame: XP_PER_GAME,
      winBonus: XP_WIN_BONUS,
      perKillParticipation: XP_PER_KILL_PARTICIPATION,
      perTrophy: XP_PER_TROPHY
    }
  };
}

module.exports = {
  DIFFICULTY_MULTIPLIER,
  lpDistanceMultiplier,
  getOverview,
  rerollDaily,
  resetState
};
