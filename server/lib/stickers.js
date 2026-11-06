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

const SETS = [
  { id: 'base', name: 'Base Set', price: 150, released: true, stickers: BASE_LIST.map((id, i) => ({ n: i + 1, id, r: rarityOf(i + 1) })) },
  { id: 'neon', name: 'Neon District', price: 300, released: true, special: true, stickers: NEON_LIST.map((id, i) => ({ n: i + 1, id, r: rarityOfSpecial(i + 1) })) }
];

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
const ANIM_CHANCE = 0.10;                      // Rare-Slot: 90 % Holo, 10 % Animated
const DUPE_REFUND = { common: 3, uncommon: 8, holo: 50, anim: 300 };

const getSet = id => SETS.find(s => s.id === id) || null;
const pick = list => list[Math.floor(Math.random() * list.length)];

function rollPack(set) {
  const by = r => set.stickers.filter(s => s.r === r);
  const out = [];
  for (let i = 0; i < PACK.common; i++) out.push(pick(by('common')));
  for (let i = 0; i < PACK.uncommon; i++) out.push(pick(by('uncommon')));
  out.push(Math.random() < ANIM_CHANCE ? pick(by('anim')) : pick(by('holo')));
  return out;
}

module.exports = { SETS, getSet, rollPack, DUPE_REFUND, ANIM_CHANCE, PACK, migrateBaseN, weekendWindow, availableNow };
