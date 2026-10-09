// Cosmetics-Katalog (v5.3.0). Jeder Monats-Pass hat genau 6 eigene
// Cosmetics auf den Stufen 5/10/15/20/25/30 (Nutzerdesign 2026-10-09: "ich
// muesste lediglich 6 neue Cosmetics pro Monat erstellen"). Spaeter kommen
// Shop-Cosmetics (source: 'shop') dazu, alte Pass-Cosmetics wandern in den
// rotierenden Shop.
//
// Neuen Monat anlegen: 6 Eintraege mit passMonth 'YYYY-MM' + tier 5..30
// hinzufuegen und die passenden CSS-Klassen in public/cosmetics.css bauen
// (Klasse = "cos-" + id). Hat ein Monat (noch) keine Cosmetics, gibt es auf
// diesen Stufen stattdessen Coins (FALLBACK_COSMETIC_COINS in progression.js).

const COSMETICS = [
  // ----- Oktober-Pass 2026 (Test-Borders) -----
  { id: 'border-2026-10-bronze', type: 'border', name: 'Bronze Ring', passMonth: '2026-10', tier: 5 },
  { id: 'border-2026-10-ember', type: 'border', name: 'Ember', passMonth: '2026-10', tier: 10 },
  { id: 'border-2026-10-frost', type: 'border', name: 'Frostbite', passMonth: '2026-10', tier: 15 },
  { id: 'border-2026-10-verdant', type: 'border', name: 'Verdant', passMonth: '2026-10', tier: 20 },
  { id: 'border-2026-10-void', type: 'border', name: 'Void Rift', passMonth: '2026-10', tier: 25 },
  { id: 'border-2026-10-crown', type: 'border', name: 'Golden Pony', passMonth: '2026-10', tier: 30 }
];

const byId = new Map(COSMETICS.map(c => [c.id, c]));

function getCosmetic(id) {
  return byId.get(id) || null;
}

function passCosmetic(month, tier) {
  return COSMETICS.find(c => c.passMonth === month && c.tier === tier) || null;
}

module.exports = { COSMETICS, getCosmetic, passCosmetic };
