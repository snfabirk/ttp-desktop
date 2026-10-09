// Cosmetics-Katalog (v5.3.0). Jeder Monats-Pass hat genau 6 eigene
// Cosmetics auf den Stufen 5/10/15/20/25/30 (Nutzerdesign 2026-10-09: "ich
// muesste lediglich 6 neue Cosmetics pro Monat erstellen"). Spaeter kommen
// Shop-Cosmetics (source: 'shop') dazu, alte Pass-Cosmetics wandern in den
// rotierenden Shop.
//
// Neuen Monat anlegen: 6 Eintraege mit passMonth 'YYYY-MM' + tier 5..30
// hinzufuegen und die passenden CSS-Klassen bauen: Borders/Frames in
// public/cosmetics.css (Klasse = "cos-" + id bzw. "pframe-" + id), Themes
// als html[data-theme="<themeKey>"] in public/style.css (+ Animation in
// public/theme-fx.js). Hat ein Monat (noch) keine Cosmetics, gibt es auf
// diesen Stufen stattdessen Coins (FALLBACK_COSMETIC_COINS in progression.js).

// Aufbau pro Monat (Nutzerdesign 2026-10-09):
//   Stufe  5 / 20 = Profilbild-Rahmen (border)  - simpel / fancy
//   Stufe 10 / 25 = Profil-Rahmen um alle Widgets (frame) - simpel / fancy
//                   (fancy: kurze Einzeichnen-Animation + optionaler
//                   Profil-Hintergrund, im Editor ein-/ausschaltbar)
//   Stufe 15 / 30 = App-Theme (theme) - simpel mit Akzenten / fancy mit
//                   Animation (Einstellung: Aus / Nur bei Benutzung / Immer)
// Rahmen sieht jeder auf dem Profil, das Theme ist rein persoenlich.
// Seltenheiten (Nutzerdesign 2026-10-09): Basic (gratis, z.B. die Grund-
// Themes) -> Refined -> Fancy -> Animated. Pass: Stufe 5/10/15 Refined,
// 20/25 Fancy, 30 Animated. Shop-Preise nach Seltenheit x Typ.
const RARITIES = ['basic', 'refined', 'fancy', 'animated'];
const PRICES = {
  basic: { border: 0, frame: 0, theme: 0 },
  refined: { border: 500, frame: 650, theme: 900 },
  fancy: { border: 1000, frame: 1300, theme: 1600 },
  animated: { border: 1600, frame: 1900, theme: 2400 }
};
const priceOf = c => (PRICES[c.rarity] || PRICES.refined)[c.type] || 0;

const COSMETICS = [
  // ----- Shop (v5.19.0): zeitlose, bunt gemischte Cosmetics (Designs aus
  // theme-lab/shop-*.html). Jahreszeiten gehoeren dem Monats-Pass. Jedes
  // Animated-Teil hat ein eigenes Easter Egg. Darstellung: shop-cosmetics.js
  // (Borders/Rahmen) und shop-scenes.js (Themes). -----
  { id: 'theme-shop-abyss', type: 'theme', name: 'Deep Abyss', rarity: 'animated', source: 'shop', themeKey: 'abyss', animated: true },
  { id: 'theme-shop-neon', type: 'theme', name: 'Neon City', rarity: 'animated', source: 'shop', themeKey: 'neon', animated: true },
  { id: 'border-shop-storm', type: 'border', name: 'Storm Crown', rarity: 'animated', source: 'shop' },
  { id: 'border-shop-obsidian', type: 'border', name: 'Obsidian Crown', rarity: 'animated', source: 'shop' },
  { id: 'frame-shop-arcane', type: 'frame', name: 'Arcane Circuit', rarity: 'animated', source: 'shop' },
  { id: 'theme-shop-starfall', type: 'theme', name: 'Starfall', rarity: 'fancy', source: 'shop', themeKey: 'starfall', animated: true },
  { id: 'theme-shop-koi', type: 'theme', name: 'Koi Garden', rarity: 'fancy', source: 'shop', themeKey: 'koi', animated: true },
  { id: 'border-shop-dragonfire', type: 'border', name: 'Dragonfire Ring', rarity: 'fancy', source: 'shop' },
  { id: 'border-shop-gyro', type: 'border', name: 'Gyro Orbit', rarity: 'fancy', source: 'shop' },
  { id: 'border-shop-chemtech', type: 'border', name: 'Chemtech', rarity: 'fancy', source: 'shop' },
  { id: 'frame-shop-void', type: 'frame', name: 'Void Rift', rarity: 'fancy', source: 'shop' },
  { id: 'frame-shop-clock', type: 'frame', name: 'Clockwork', rarity: 'fancy', source: 'shop' },
  { id: 'frame-shop-filigree', type: 'frame', name: 'Golden Filigree', rarity: 'fancy', source: 'shop' },
  { id: 'theme-shop-desert', type: 'theme', name: 'Desert Dusk', rarity: 'refined', source: 'shop', themeKey: 'desert' },
  { id: 'theme-shop-forest', type: 'theme', name: 'Emerald Forest', rarity: 'refined', source: 'shop', themeKey: 'forest' },
  { id: 'border-shop-ember', type: 'border', name: 'Ember Ring', rarity: 'refined', source: 'shop' },
  { id: 'border-shop-frost', type: 'border', name: 'Frost Rim', rarity: 'refined', source: 'shop' },
  { id: 'border-shop-moonlit', type: 'border', name: 'Moonlit Ring', rarity: 'refined', source: 'shop' },
  { id: 'border-shop-thorn', type: 'border', name: 'Thorn Ring', rarity: 'refined', source: 'shop' },
  { id: 'border-shop-runestone', type: 'border', name: 'Runestone Ring', rarity: 'refined', source: 'shop' },
  { id: 'border-shop-compass', type: 'border', name: 'Compass Ring', rarity: 'refined', source: 'shop' },
  { id: 'frame-shop-iron', type: 'frame', name: 'Iron Frame', rarity: 'refined', source: 'shop' },
  { id: 'frame-shop-ivy', type: 'frame', name: 'Ivy Frame', rarity: 'refined', source: 'shop' },
  { id: 'frame-shop-rune', type: 'frame', name: 'Rune Frame', rarity: 'refined', source: 'shop' },
  { id: 'frame-shop-gilded', type: 'frame', name: 'Gilded Frame', rarity: 'refined', source: 'shop' },
  { id: 'frame-shop-marble', type: 'frame', name: 'Marble Frame', rarity: 'refined', source: 'shop' },
  { id: 'frame-shop-bamboo', type: 'frame', name: 'Bamboo Frame', rarity: 'refined', source: 'shop' },
  { id: 'border-shop-plain', type: 'border', name: 'Plain Ring', rarity: 'basic', source: 'shop' },
  { id: 'border-shop-ash', type: 'border', name: 'Ash Ring', rarity: 'basic', source: 'shop' },
  { id: 'border-shop-silver', type: 'border', name: 'Silver Ring', rarity: 'basic', source: 'shop' },
  { id: 'frame-shop-slate', type: 'frame', name: 'Slate Frame', rarity: 'basic', source: 'shop' },
  { id: 'frame-shop-oak', type: 'frame', name: 'Oak Frame', rarity: 'basic', source: 'shop' },
  { id: 'frame-shop-paper', type: 'frame', name: 'Paper Frame', rarity: 'basic', source: 'shop' },
  // ----- Basic (v5.17.0): zu jedem Grund-Theme eine schlichte Border + ein
  // schlichter Rahmen in dessen Farben. Hat jeder (base: true), frei
  // kombinierbar mit jedem Theme (Nutzerwunsch: alles mit allem). -----
  { id: 'border-base-classic', type: 'border', name: 'Classic Ring', rarity: 'basic', base: true },
  { id: 'frame-base-classic', type: 'frame', name: 'Classic Frame', rarity: 'basic', base: true },
  { id: 'border-base-graphite', type: 'border', name: 'Graphite Ring', rarity: 'basic', base: true },
  { id: 'frame-base-graphite', type: 'frame', name: 'Graphite Frame', rarity: 'basic', base: true },
  { id: 'border-base-light', type: 'border', name: 'Light Ring', rarity: 'basic', base: true },
  { id: 'frame-base-light', type: 'frame', name: 'Light Frame', rarity: 'basic', base: true },
  { id: 'border-base-hextech', type: 'border', name: 'Hextech Ring', rarity: 'basic', base: true },
  { id: 'frame-base-hextech', type: 'frame', name: 'Hextech Frame', rarity: 'basic', base: true },
  { id: 'border-base-arcane', type: 'border', name: 'Arcane Ring', rarity: 'basic', base: true },
  { id: 'frame-base-arcane', type: 'frame', name: 'Arcane Frame', rarity: 'basic', base: true },
  { id: 'border-base-noxus', type: 'border', name: 'Noxus Ring', rarity: 'basic', base: true },
  { id: 'frame-base-noxus', type: 'frame', name: 'Noxus Frame', rarity: 'basic', base: true },
  { id: 'border-base-freljord', type: 'border', name: 'Freljord Ring', rarity: 'basic', base: true },
  { id: 'frame-base-freljord', type: 'frame', name: 'Freljord Frame', rarity: 'basic', base: true },
  { id: 'border-base-ionia', type: 'border', name: 'Ionia Ring', rarity: 'basic', base: true },
  { id: 'frame-base-ionia', type: 'frame', name: 'Ionia Frame', rarity: 'basic', base: true },

  // ----- Oktober 2026: Halloween (schwarz / grau / orange) -----
  { id: 'border-2026-10-pumpkin', type: 'border', name: 'Pumpkin Ring', rarity: 'refined', passMonth: '2026-10', tier: 5 },
  { id: 'frame-2026-10-cobweb', type: 'frame', name: 'Cobweb', rarity: 'refined', passMonth: '2026-10', tier: 10 },
  { id: 'theme-2026-10-hallows', type: 'theme', name: 'All Hallows', rarity: 'refined', passMonth: '2026-10', tier: 15, themeKey: 'hallows' },
  { id: 'border-2026-10-haunted', type: 'border', name: "Widow's Nest", rarity: 'fancy', passMonth: '2026-10', tier: 20 },
  { id: 'frame-2026-10-manor', type: 'frame', name: 'Ectoplasm Manor', rarity: 'fancy', passMonth: '2026-10', tier: 25, hasBackground: true },
  { id: 'theme-2026-10-haunted', type: 'theme', name: 'Haunted Night', rarity: 'animated', passMonth: '2026-10', tier: 30, themeKey: 'haunted', animated: true }
];

const byId = new Map(COSMETICS.map(c => [c.id, c]));

function getCosmetic(id) {
  return byId.get(id) || null;
}

function passCosmetic(month, tier) {
  return COSMETICS.find(c => c.passMonth === month && c.tier === tier) || null;
}

module.exports = { COSMETICS, RARITIES, PRICES, priceOf, getCosmetic, passCosmetic };
