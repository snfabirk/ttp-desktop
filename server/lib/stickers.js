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

const SETS = [
  { id: 'base', name: 'Base Set', price: 150, released: true, stickers: BASE_LIST.map((id, i) => ({ n: i + 1, id, r: rarityOf(i + 1) })) }
];
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

module.exports = { SETS, getSet, rollPack, DUPE_REFUND, ANIM_CHANCE, PACK, migrateBaseN };
