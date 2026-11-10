// Sticker-Sammlung (v5.29.0): Booster-Sets mit je einer festen Sticker-Liste.
// Die Kunst liegt in public/stickers.js (gleiche Nummern/Ids). Raritaeten:
// common / uncommon / holo / anim. Keine steigenden Chancen - jeder Pack ist
// ein unabhaengiger Wurf (Nutzerwunsch).
const BASE_LIST = [
  'golden-pony', 'three-trick-legend', 'secretly-a-unicorn', 'pentakill', 'baron-steal', 'quadra-kill', 'ace', 'comeback', 'rank-up', 'flawless',
  'gank', 'tilted', 'counter-jungle', 'dragon-soul', 'herald-charge', 'double-kill', 'triple-kill', 'shutdown', 'backdoor', 'elder-dragon',
  'promo-series', 'smurf-alert', 'buff-steal', 'inhib-down', 'vision-king', 'smite', 'one-more-game', 'ward', 'first-blood', 'blue-buff',
  'red-buff', 'river-crab', 'full-clear', 'recall', 'ping', 'gg', 'afk', 'minion-wave', 'tower-dive', 'gold-fever',
  'in-queue', 'dodge', 'flash', 'ignite', 'health-potion', 'lens-sweep', 'wolf-camp', 'lag-spike', 'mute-all', 'honor'
];
// Nummerierung (v5.29.2, Nutzer): seltenste zuerst, damit sie im Album oben
// stehen - auch bei groesseren Sets. #1-3 animated, #4-10 holo, #11-25 uncommon, #26-50 common
const rarityOf = n => n <= 3 ? 'anim' : n <= 10 ? 'holo' : n <= 25 ? 'uncommon' : 'common';
// alte Nummer (v5.29.0/1: common zuerst) -> neue Nummer
const migrateBaseN = n => n >= 48 ? n - 47 : n >= 41 ? n - 37 : n >= 26 ? n - 15 : n + 25;

// Special Set #1 (v6.5.0, Nutzer 2026-11-06): Cyberpunk-Hommage, 25 Sticker
// (halbes Base Set: 2 animated, 4 holo, 7 uncommon, 12 common), doppelter
// Preis, nur am Wochenende kaufbar. Kunst: public/stickers-neon.js
const NEON_LIST = [
  'netrunner', 'neon-overdrive', 'chrome-hoof', 'megacity', 'breach-protocol', 'street-samurai',
  'noodle-bar', 'flying-car', 'hologram-ad', 'back-alley-clinic', 'surveillance-drone', 'overclocked-flash', 'chrome-baron',
  'neon-sign', 'vending-machine', 'rain-alley', 'data-chip', 'credstick', 'synth-coffee', 'glitch', 'graffiti-tag', 'smart-gun', 'neon-ward', 'cyber-smite', 'hacked-minion'
];
const rarityOfSpecial = n => n <= 2 ? 'anim' : n <= 6 ? 'holo' : n <= 13 ? 'uncommon' : 'common';

// Full Arts (v6.6.0, Nutzer): GEHEIME Liste je Set, welche Karten eine FA-Version
// haben (Nummer der normalen Karte). Der Nutzer waehlt sie selbst aus (ca. 8-10
// im regulaeren Set, etwa halb so viele in Special Sets). Auswahl Nutzer 2026-11-07.
// Nie an die Oberflaeche geben (Anzahl soll nirgends stehen).
const SETS = [
  { id: 'base', name: 'Base Set', price: 150, released: true, fullArts: [3, 4, 10, 12, 18, 25, 27, 30, 31, 49], stickers: BASE_LIST.map((id, i) => ({ n: i + 1, id, r: rarityOf(i + 1) })) },
  { id: 'neon', name: 'Neon District', price: 300, released: true, special: true, fullArts: [1, 5, 6, 11, 16, 22, 25], stickers: NEON_LIST.map((id, i) => ({ n: i + 1, id, r: rarityOfSpecial(i + 1) })) }
];

// Set 2 "Lock In" (v6.9.0, Nutzer 2026-11-09): regulaeres Set, das Pony in
// seinen Rollen + Momente einer Runde. Kunst: public/stickers-lockin.js.
// Noch nicht veroeffentlicht - nur in der Testinstanz (TTP_TEST_SET2=1) sichtbar.
// Full Arts (Nutzerwahl 2026-11-09): 2, 5, 10, 14, 20, 28, 37, 38, 44, 48 - GEHEIM.
const LOCKIN_LIST = [
  'hypercarry', 'shadow-strike', 'last-stand', 'archmage', 'iron-bulwark', 'blade-dancer', 'guardian-wings', 'wild-hunter', 'siege-engine', 'duelists-oath',
  'combo-starter', 'hook-shot', 'peel', 'kite', 'engage', 'backline-dive', 'zone-control', 'burst-window', 'frontline', 'sustain',
  'split-push', 'bubble-shield', 'crowd-control', 'execute', 'healing-aura', 'auto-attack', 'last-hit', 'out-of-mana', 'on-cooldown', 'level-up',
  'skill-point', 'starter-item', 'shop-run', 'rune-page', 'lane-swap', 'on-my-way', 'missing', 'back-off', 'top-lane', 'mid-lane',
  'bot-lane', 'jungle-path', 'support-item', 'duo-queue', 'champ-select', 'instalock', 'loading-screen', 'respawn', 'dodge-roll', 'victory-pose'
];
// Set 3 "Worlds Stage" + Set 4 "Ranked Climb" (v6.10.0, Nutzer 2026-11-10). Kunst:
// public/stickers-worlds.js / stickers-ranked.js. #1 Worlds = Faker-Hommage (Nutzer).
// Full Arts (Nutzerwahl 2026-11-10) - GEHEIM, nie an die Oberflaeche geben.
const WORLDS_LIST = ['unkillable-demon-king','summoners-cup','grand-final','world-champion','finals-mvp','the-outplay','base-race','reverse-sweep','caster-hype','anthem','opening-ceremony','draft-phase','first-pick','counter-pick','tech-pause','shotcaller','head-coach','analyst-desk','swiss-stage','quarterfinals','semifinals','upset','fan-sign','cosplayer','confetti','stage-lights','headset','gaming-chair','team-jersey','team-banner','scoreboard','game-five','blue-side','red-side','gg-handshake','press-room','post-game-interview','scrims','bootcamp','jet-lag','finals-ticket','merch-stand','pickem','lightstick','crowd-roar','camera-cut','energy-drink','stream-chat','instant-replay','trophy-case'];
const RANKED_LIST = ['challenger','promoted','season-end','grandmaster','master','diamond','emerald','platinum','win-streak','victorious','gold','silver','bronze','iron','tier-up','demotion-shield','lp-gain','lp-loss','placements','hidden-mmr','decay','dodge-penalty','loss-streak','hardstuck','the-ladder','ranked-queue','solo-queue','flex-queue','lp-bar','division-four','division-one','one-trick','mastery-badge','match-history','profile-stalking','alt-account','night-grind','remake','lp-saved','autofill','role-select','break-time','vod-review','new-goal','rank-border','split-reset','leaderboard','coinflip-game','carry-me','next-game'];

// (v6.10.0) Kommende regulaere Sets: erscheinen zu geheimen Terminen (releases.js).
// SETS wird bei jeder API-Anfrage aufgefrischt (refreshSets) - die App kann ja
// wochenlang laufen; das Array bleibt dasselbe Objekt (andere Module halten es).
const RELEASES = require('./releases');
const UPCOMING = [
  { id: 'lockin', name: 'Lock In', price: 150, released: true, fullArts: [2, 5, 10, 14, 20, 28, 37, 38, 44, 48], stickers: LOCKIN_LIST.map((id, i) => ({ n: i + 1, id, r: rarityOf(i + 1) })) },
  { id: 'worlds', name: 'Worlds Stage', price: 150, released: true, fullArts: [1, 7, 11, 19, 20, 23, 33, 34, 44, 48], stickers: WORLDS_LIST.map((id, i) => ({ n: i + 1, id, r: rarityOf(i + 1) })) },
  { id: 'ranked', name: 'Ranked Climb', price: 150, released: true, fullArts: [1, 3, 9, 17, 18, 22, 27, 38, 48, 49], stickers: RANKED_LIST.map((id, i) => ({ n: i + 1, id, r: rarityOf(i + 1) })) }
];
function refreshSets() {
  const want = [SETS.find(s => s.id === 'base'),
    ...UPCOMING.filter(st => RELEASES.isReleased(st.id)).sort((a, b) => (RELEASES.releaseAt(a.id) || 0) - (RELEASES.releaseAt(b.id) || 0)),
    ...SETS.filter(s => s.special)];
  if (want.length === SETS.length && want.every((st, i) => st === SETS[i])) return false;
  SETS.splice(0, SETS.length, ...want);
  return true;
}
refreshSets();
// Set, das gerade angekuendigt wird (1 Woche vor Release), sonst null
function teaserSet() {
  const t = RELEASES.teaser(UPCOMING.map(st => st.id));
  const st = t && UPCOMING.find(x => x.id === t.id);
  return st ? { set: st, at: t.at } : null;
}
const upcomingSet = id => UPCOMING.find(st => st.id === id) || null;

// Special-Booster nur Samstag + Sonntag (Ortszeit des Rechners, Nutzer 2026-11-06).
// Liefert, ob gerade offen ist, und wann es oeffnet/schliesst (ms).
function weekendWindow(now = new Date()) {
  const day = now.getDay();                                  // 0 = So, 6 = Sa
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const open = day === 6 || day === 0;
  const satStart = new Date(midnight);
  satStart.setDate(midnight.getDate() + (day === 0 ? -1 : (6 - day)));
  const monStart = new Date(satStart); monStart.setDate(satStart.getDate() + 2);
  return { open, opensAt: satStart.getTime(), closesAt: monStart.getTime() };
}
const availableNow = (set, now) => !!set && set.released && (!set.special || weekendWindow(now).open);
const PACK = { common: 4, uncommon: 2 };      // + 1 Rare-Slot
const ANIM_CHANCE = 0.10;                      // Rare-Slot: 83 % Holo, 10 % Animated, 7 % Full Art
const FA_CHANCE = 0.07;                        // (v6.6.0, Nutzer; ohne FAs im Set: 90/10)
const DUPE_REFUND = { common: 3, uncommon: 8, holo: 50, anim: 300, fullart: 600 };

const getSet = id => SETS.find(s => s.id === id) || null;
const pick = list => list[Math.floor(Math.random() * list.length)];

function rollPack(set) {
  const by = r => set.stickers.filter(s => s.r === r);
  const out = [];
  for (let i = 0; i < PACK.common; i++) out.push(pick(by('common')));
  for (let i = 0; i < PACK.uncommon; i++) out.push(pick(by('uncommon')));
  const roll = Math.random(), fas = set.fullArts || [];
  if (fas.length && roll < FA_CHANCE) {
    const faN = pick(fas), base = set.stickers.find(s => s.n === faN);
    out.push({ n: base.n, id: base.id, r: 'fullart', fa: true });
  } else out.push(roll < (fas.length ? FA_CHANCE : 0) + ANIM_CHANCE ? pick(by('anim')) : pick(by('holo')));
  return out;
}

// Set-Status: komplett (alle normalen Sticker) / Master (dazu alle Full Arts)
function setStatus(set, col = {}, faCol = {}) {
  const complete = set.stickers.every(s => col[s.n]);
  // Master nur, wenn das Set ueberhaupt FAs hat (Nutzer: ohne FAs nur Complete)
  return { complete, master: complete && (set.fullArts || []).length > 0 && set.fullArts.every(n => faCol[n]) };
}
// Neues Set (v6.9.0, Nutzer): zum Release gibt es RELEASE_GIFT Booster gratis -
// grosse Ankuendigung beim Start, einmal abholbar pro Konto, RELEASE_DAYS lang
// ab dem Release-Termin (releases.js). Alte Sets (Base, Specials): nichts.
const RELEASE_GIFT = 3;
const RELEASE_DAYS = 30;
function releaseWindowOpen(set, now = new Date()) {
  if (!set || !set.released || !RELEASES.isUpcomingId(set.id) || !RELEASES.isReleased(set.id)) return false;
  if (process.env.TTP_TEST_RELEASE === set.id || process.env.TTP_TEST_TEASER === set.id) return true;
  const start = RELEASES.releaseAt(set.id), t = RELEASES.now();
  return start != null && t >= start && t < start + RELEASE_DAYS * 86400000;
}

module.exports = { SETS, refreshSets, teaserSet, upcomingSet, getSet, rollPack, setStatus, DUPE_REFUND, ANIM_CHANCE, FA_CHANCE, PACK, migrateBaseN, weekendWindow, availableNow, RELEASE_GIFT, releaseWindowOpen };
