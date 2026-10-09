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
const COSMETICS = [
  // ----- Oktober 2026: Halloween (schwarz / grau / orange) -----
  { id: 'border-2026-10-pumpkin', type: 'border', name: 'Pumpkin Ring', passMonth: '2026-10', tier: 5 },
  { id: 'frame-2026-10-cobweb', type: 'frame', name: 'Cobweb', passMonth: '2026-10', tier: 10 },
  { id: 'theme-2026-10-hallows', type: 'theme', name: 'All Hallows', passMonth: '2026-10', tier: 15, themeKey: 'hallows' },
  { id: 'border-2026-10-haunted', type: 'border', name: 'Haunted Halo', passMonth: '2026-10', tier: 20 },
  { id: 'frame-2026-10-manor', type: 'frame', name: 'Haunted Manor', passMonth: '2026-10', tier: 25, hasBackground: true },
  { id: 'theme-2026-10-haunted', type: 'theme', name: 'Haunted Night', passMonth: '2026-10', tier: 30, themeKey: 'haunted', animated: true }
];

const byId = new Map(COSMETICS.map(c => [c.id, c]));

function getCosmetic(id) {
  return byId.get(id) || null;
}

function passCosmetic(month, tier) {
  return COSMETICS.find(c => c.passMonth === month && c.tier === tier) || null;
}

module.exports = { COSMETICS, getCosmetic, passCosmetic };
