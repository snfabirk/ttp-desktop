// Three-Trick-Pony - Set 3 "Ranked Climb" (50 Sticker, regulaeres Set).
// Thema: die Ranked-Leiter von Iron bis Challenger mit dem Pony als Hauptfigur -
// eigene Rang-Embleme (nur von den Rangfarben inspiriert, keine Riot-Artworks).
// Raritaeten wie das Base Set: #1-3 animated, #4-10 holo, #11-25 uncommon, #26-50 common.
// Laedt NACH stickers.js (nutzt dessen Karten-CSS, Neigung und Zeichen-Bausteine KIT).
(function () {
  const B = window.STICKERS, K = B.KIT;
  const { U, pony, bg, glow, rays, spark, sparks, txt, sword, crown, flame, coin, minion } = K;

  // ---------- Szenen-Details (Struktur, Licht, Partikel) ----------
  const D = {
    hex: (c = '#fff', op = .06) => { const p = U('rpx'); return `<defs><pattern id="${p}" width="12" height="10.4" patternUnits="userSpaceOnUse"><path d="M3 0 H9 L12 5.2 L9 10.4 H3 L0 5.2 Z" fill="none" stroke="${c}" stroke-width=".7"/></pattern></defs><rect width="120" height="120" fill="url(#${p})" opacity="${op}"/>`; },
    hatch: (c = '#fff', op = .05) => { const p = U('rpt'); return `<defs><pattern id="${p}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V6" stroke="${c}" stroke-width="1.2"/></pattern></defs><rect width="120" height="120" fill="url(#${p})" opacity="${op}"/>`; },
    grid: (c = '#fff', op = .06) => { const p = U('rpg'); return `<defs><pattern id="${p}" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 H0 V10" fill="none" stroke="${c}" stroke-width=".6"/></pattern></defs><rect width="120" height="120" fill="url(#${p})" opacity="${op}"/>`; },
    beams: (c = '#fff', op = .08) => `<g opacity="${op}">${[[18, 22], [52, 16], [86, 26]].map(([x, w]) => `<path d="M${x} -4 L${x + w} -4 L${x + w + 26} 124 L${x + 10} 124 Z" fill="${c}"/>`).join('')}</g>`,
    motes: (c = '#fff', n = 9) => [...Array(n)].map((_, i) => `<circle cx="${(i * 37 + 11) % 112 + 4}" cy="${(i * 53 + 7) % 104 + 6}" r="${.7 + (i % 3) * .45}" fill="${c}" opacity="${.35 + (i % 4) * .12}"/>`).join(''),
    shadow: (x, y, rx, ry = rx * .22, op = .45) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#000" opacity="${op}"/>`,
    // Sternenhimmel (feste Positionen)
    stars: (c = '#fff', n = 12) => [...Array(n)].map((_, i) => `<circle cx="${(i * 47 + 9) % 114 + 3}" cy="${(i * 29 + 5) % 60 + 4}" r="${.5 + (i % 3) * .35}" fill="${c}" opacity="${.45 + (i % 3) * .18}"/>`).join(''),
    // Boden: Steinplatten
    floor: (y = 98, c = '#1a2a30', c2 = '#2a3e44') => `<rect y="${y}" width="120" height="${120 - y}" fill="${c}"/><path d="M0 ${y} H120" stroke="${c2}" stroke-width="2"/>${[...Array(7)].map((_, i) => `<path d="M${i * 20 + 6} ${y} L${i * 20 - 6} 120" stroke="${c2}" stroke-width="1.2"/>`).join('')}`,
    // Konfetti (feste Positionen)
    confetti: (n = 14, cls = '') => [...Array(n)].map((_, i) => { const x = (i * 29 + 7) % 112 + 2, y = (i * 41 + 9) % 96 + 4; return `<g transform="translate(${x} ${y}) rotate(${i * 37})"><rect class="${cls ? `${cls} d${i % 4}` : ''}" x="-1.5" y="-3" width="3" height="6" rx="1" fill="${['#ff5a6a', '#6bc8ff', '#5fd08a', '#ffd36b', '#b98cff'][i % 5]}"/></g>`; }).join('')
  };

  // ---------- Eigene Rang-Embleme ----------
  // c = Koerper hell/mittel/dunkel, g = Edelstein hell/dunkel, lv = Stufe (0 Iron .. 9 Challenger)
  const TIER = {
    iron: { c: ['#d0d4da', '#6e737c', '#2a2d33'], g: ['#a8aeb8', '#4a4e56'], lv: 0 },
    bronze: { c: ['#f6c49a', '#a8642e', '#3e1e0a'], g: ['#ffb36b', '#8a3e10'], lv: 1 },
    silver: { c: ['#ffffff', '#a2aebc', '#3a4250'], g: ['#e2eefa', '#6a7a90'], lv: 2 },
    gold: { c: ['#fff4b0', '#e2b23c', '#5a3a06'], g: ['#fff2a8', '#d8941c'], lv: 3 },
    platinum: { c: ['#d0fff6', '#3ab8a8', '#0a3e3a'], g: ['#c8fff4', '#1a8a7a'], lv: 4 },
    emerald: { c: ['#c8ffd8', '#22a85a', '#063a1a'], g: ['#8affb8', '#0a7a3a'], lv: 5 },
    diamond: { c: ['#e2f2ff', '#4a8ae0', '#102454'], g: ['#d8f2ff', '#3a6ad8'], lv: 6 },
    master: { c: ['#f2d8ff', '#9a4ad8', '#26084a'], g: ['#f0c0ff', '#7a2ac8'], lv: 7 },
    grandmaster: { c: ['#ffd0c8', '#d83a3a', '#3e0606'], g: ['#ffb08a', '#b01a1a'], lv: 8 },
    challenger: { c: ['#fff6c8', '#f2c94c', '#4a3006'], g: ['#c8f2ff', '#2a7ad8'], lv: 9 },
    unranked: { c: ['#8a96a8', '#4a5466', '#1a2030'], g: ['#6a7488', '#2a3040'], lv: 0 }
  };
  const TIER_ORDER = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master', 'grandmaster', 'challenger'];
  // Umriss je Rang (um 0,0, ca. 52 breit, 62 hoch)
  const SHAPE = {
    iron: 'M0 -28 L24 -14 L24 14 L0 28 L-24 14 L-24 -14 Z',
    bronze: 'M-24 -24 Q0 -32 24 -24 V2 C24 18 12 26 0 31 C-12 26 -24 18 -24 2 Z',
    silver: 'M0 -30 L24 -22 C24 4 16 20 0 31 C-16 20 -24 4 -24 -22 Z',
    gold: 'M-24 -26 L-12 -20 L0 -31 L12 -20 L24 -26 C26 2 16 20 0 32 C-16 20 -26 2 -24 -26 Z',
    platinum: 'M0 -33 Q18 -18 24 -6 Q16 16 0 33 Q-16 16 -24 -6 Q-18 -18 0 -33 Z',
    emerald: 'M-12 -28 H12 L26 -14 V12 L12 28 H-12 L-26 12 V-14 Z',
    diamond: 'M-14 -26 H14 L28 -6 L0 33 L-28 -6 Z',
    master: 'M0 -32 L10 -20 L26 -24 L22 -6 L27 10 L10 14 L0 32 L-10 14 L-27 10 L-22 -6 L-26 -24 L-10 -20 Z',
    grandmaster: 'M0 -36 L8 -20 L22 -30 L20 -10 L30 -2 L17 8 L0 33 L-17 8 L-30 -2 L-20 -10 L-22 -30 L-8 -20 Z',
    challenger: 'M0 -30 C15 -30 27 -21 27 -5 C27 12 14 24 0 33 C-14 24 -27 12 -27 -5 C-27 -21 -15 -30 0 -30 Z',
    unranked: 'M0 -30 L24 -22 C24 4 16 20 0 31 C-16 20 -24 4 -24 -22 Z'
  };
  const GEM = {
    iron: '<circle r="7"/>',
    bronze: '<circle r="7.5"/>',
    silver: '<path d="M0 -10 L8 0 L0 10 L-8 0 Z"/>',
    gold: '<path d="M0 -12 L10 0 L0 12 L-10 0 Z"/>',
    platinum: '<path d="M0 -12 C7 -4 9 2 9 5 A9 9 0 0 1 -9 5 C-9 2 -7 -4 0 -12 Z"/>',
    emerald: '<path d="M-6 -11 H6 L10 -7 V7 L6 11 H-6 L-10 7 V-7 Z"/>',
    diamond: '<path d="M-11 -5 L-6 -11 H6 L11 -5 L0 12 Z"/>',
    master: '<path d="M0 -13 L3.5 -3.5 L13 0 L3.5 3.5 L0 13 L-3.5 3.5 L-13 0 L-3.5 -3.5 Z"/>',
    grandmaster: '<path d="M0 -12 L3.2 -4 L11.4 -3.7 L5 1.5 L7 9.7 L0 5 L-7 9.7 L-5 1.5 L-11.4 -3.7 L-3.2 -4 Z"/>',
    challenger: '<circle r="9.5"/>',
    unranked: '<circle r="8"/>'
  };
  // Federn/Blaetter/Kristalle/Hoerner hinter dem Emblem (je Seite gespiegelt)
  const feathers = (n, L, w, fill, stroke, vein) => [1, -1].map(sd => `<g transform="scale(${sd} 1)">${[...Array(n)].map((_, i) => {
    const a = 42 - i * (56 / Math.max(1, n - 1)), l = L - i * 3;
    return `<g transform="translate(-14 ${-8 + i * 5}) rotate(${a.toFixed(1)})"><path d="M0 0 C${-l * .3} ${-w} ${-l * .75} ${-w} ${-l} 0 C${-l * .75} ${w * .7} ${-l * .3} ${w * .8} 0 ${w * .5} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round"/><path d="M-2 0.5 L${-l * .85} 0" stroke="${vein}" stroke-width=".9" opacity=".7"/></g>`;
  }).join('')}</g>`).join('');
  const crystals = (n, L, fill, stroke) => [1, -1].map(sd => `<g transform="scale(${sd} 1)">${[...Array(n)].map((_, i) => {
    const a = 34 - i * (60 / Math.max(1, n - 1)), l = L - (i % 2) * 8;
    return `<g transform="translate(-16 ${-4 + i * 4}) rotate(${a.toFixed(1)})"><path d="M0 -5 L${-l * .7} -6 L${-l} 0 L${-l * .7} 5 L0 4 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/><path d="M0 -1 L${-l} 0 L${-l * .7} -6" stroke="#fff" stroke-width=".8" fill="none" opacity=".6"/></g>`;
  }).join('')}</g>`).join('');
  const horns = (s, fill, stroke) => [1, -1].map(sd => `<g transform="scale(${sd * s} ${s})"><path d="M-10 -20 C-26 -24 -36 -40 -30 -56 C-25 -42 -16 -36 -2 -32 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/><path d="M-12 -24 C-24 -30 -30 -40 -29 -50" stroke="#fff" stroke-width="1" fill="none" opacity=".45"/></g>`).join('');
  const fins = (fill, stroke) => [1, -1].map(sd => `<path transform="scale(${sd} 1)" d="M-22 -14 L-36 -20 L-30 -6 L-37 4 L-22 2 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round"/>`).join('');
  // ng = ohne Leuchtfleck (fuer Hologramm-Ebenen: der wuerde in den 3D-Schichten mitwachsen)
  function emblem(t, x, y, s = 1, ng = false) {
    const T = TIER[t], [c0, c1, c2] = T.c, [g0, g1] = T.g, sh = SHAPE[t];
    const gb = U('reb'), gg = U('reg'), cp = U('rec');
    let back = '';
    if (T.lv >= 4 && !ng) back += glow(0, 0, 44 + T.lv * 2, c1, .3 + T.lv * .025);
    if (t === 'bronze') back += fins(c1, c2);
    if (t === 'silver') back += feathers(2, 28, 5, c0, c2, c1);
    if (t === 'gold') back += feathers(3, 32, 5.5, c1, c2, c0);
    if (t === 'platinum') back += feathers(4, 34, 5.5, c0, c2, c1);
    if (t === 'emerald') back += feathers(4, 32, 8, c1, c2, c0);
    if (t === 'diamond') back += crystals(4, 40, c0, c2);
    if (t === 'master') back += horns(1, c1, c2) + crystals(3, 30, c1, c2);
    if (t === 'grandmaster') back += horns(1.15, c1, c2) + crystals(4, 36, '#ff8a5a', c2);
    if (t === 'challenger') back += crystals(4, 44, '#9ae4ff', '#1a4a8a') + feathers(5, 40, 6, c0, c2, c1);
    // Rang-eigene Details auf dem Koerper
    let deco = '';
    if (t === 'iron') deco = [[-18, -11], [18, -11], [-18, 11], [18, 11], [0, -22], [0, 22]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2" fill="${c0}" stroke="${c2}" stroke-width=".8"/>`).join('');
    if (t === 'diamond' || t === 'emerald') deco = `<path d="${t === 'diamond' ? 'M-28 -6 H28 M-14 -26 L-8 -6 L0 33 L8 -6 L14 -26' : 'M-12 -28 L-8 -18 H8 L12 -28 M-26 12 L-18 8 V-10 L-26 -14 M26 12 L18 8 V-10 L26 -14 M-12 28 L-8 18 H8 L12 28'}" stroke="${c2}" stroke-width="1" fill="none" opacity=".5"/>`;
    let top = '';
    if (t === 'gold') top = `<path d="M-8 -30 L-4 -38 L0 -32 L4 -38 L8 -30 Z" fill="${c1}" stroke="${c2}" stroke-width="1.2"/>`;
    if (t === 'platinum') top = `<path d="M0 -44 L4 -36 L0 -32 L-4 -36 Z" fill="${g0}" stroke="${c2}" stroke-width="1.2"/>`;
    if (t === 'master' || t === 'grandmaster') top = `<path d="M0 ${t === 'master' ? -46 : -50} L5 -34 L0 -30 L-5 -34 Z" fill="${g0}" stroke="${c2}" stroke-width="1.2"/>`;
    if (t === 'challenger') top = crown(0, -44, .34, ['#6bc8ff', '#ffd36b', '#6bc8ff', '#ffd36b', '#6bc8ff']);
    const gemExtra = t === 'challenger' ? [...Array(8)].map((_, i) => { const a = i / 8 * Math.PI * 2; return `<path d="M${(Math.cos(a) * 11).toFixed(1)} ${(Math.sin(a) * 11).toFixed(1)} L${(Math.cos(a) * 15).toFixed(1)} ${(Math.sin(a) * 15).toFixed(1)}" stroke="${c0}" stroke-width="2" stroke-linecap="round"/>`; }).join('') : '';
    return `<g transform="translate(${x} ${y}) scale(${s})"><defs>
      <linearGradient id="${gb}" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset=".5" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
      <radialGradient id="${gg}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${g0}"/><stop offset="1" stop-color="${g1}"/></radialGradient>
      <clipPath id="${cp}"><path d="${sh}"/></clipPath></defs>
      ${back}<path d="${sh}" fill="#000" opacity=".35" transform="translate(1.6 3)"/>
      <path d="${sh}" fill="url(#${gb})" stroke="${c2}" stroke-width="2.6" stroke-linejoin="round"/>
      <g clip-path="url(#${cp})"><rect x="0" y="-40" width="40" height="80" fill="#000" opacity=".16"/><path d="M-30 -40 L-6 -40 L-34 10 Z" fill="#fff" opacity=".18"/></g>
      <path d="${sh}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" transform="scale(.78)"/>${deco}${top}
      <g transform="translate(0 -1)">${gemExtra}<g fill="url(#${gg})" stroke="#fff" stroke-width="1.4" stroke-linejoin="round">${GEM[t]}</g><circle cx="-3" cy="-4" r="2" fill="#fff" opacity=".85"/></g></g>`;
  }

  // ---------- Pony-Zubehoer (Koordinaten des Pony-Kopfs, 0..100) ----------
  const ACC = {
    crown: (gems) => `<g transform="rotate(-8 58 8)">${crown(58, -4, .5, gems || ['#6bc8ff', '#ffd36b', '#6bc8ff', '#ffd36b', '#6bc8ff'])}</g>`,
    laurel: (c = '#ffd36b', c2 = '#8a5a08') => [...Array(9)].map((_, i) => { const t = i / 8, x = 28 + t * 62, y = 24 - Math.sin(t * Math.PI) * 14; return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(-50 + t * 100).toFixed(0)})"><path d="M0 0 C-3 -5 -2 -10 0 -12 C2 -10 3 -5 0 0 Z" fill="${c}" stroke="${c2}" stroke-width="1"/></g>`; }).join('') + `<path d="M28 24 Q59 2 90 24" stroke="${c2}" stroke-width="1.6" fill="none"/>`,
    headset: () => `<path d="M30 30 C30 0 90 -4 92 32" stroke="#2a2a3a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M32 26 C36 6 82 2 90 26" stroke="#5a5a7a" stroke-width="1.6" fill="none"/><ellipse cx="88" cy="40" rx="9" ry="12" fill="#3a3a52" stroke="#120a1a" stroke-width="1.6"/><ellipse cx="86" cy="38" rx="3" ry="5" fill="#6bc8ff" opacity=".7"/><path d="M82 48 C70 64 46 70 30 66" stroke="#2a2a3a" stroke-width="2.4" fill="none"/><circle cx="29" cy="66" r="3.4" fill="#2a2a3a"/>`,
    disguise: () => `<circle cx="36" cy="33" r="9" fill="#9ae4ff" fill-opacity=".25" stroke="#1a1410" stroke-width="2.8"/><path d="M45 31 L70 29" stroke="#1a1410" stroke-width="2.6"/><path d="M28 24 Q36 18 44 24" stroke="#3a2008" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M4 60 C8 54 18 54 24 58 C28 62 22 66 16 63 C12 66 6 66 4 60 Z" fill="#3a2008" stroke="#1a0e04" stroke-width="1"/>`,
    cap: (c = '#3a6ad8') => `<path d="M30 22 C32 2 76 -2 88 22 Z" fill="${c}" stroke="#0a1430" stroke-width="2"/><path d="M34 22 C22 22 10 26 8 30 C18 30 28 28 40 26 Z" fill="${c}" stroke="#0a1430" stroke-width="2"/><path d="M42 10 C52 4 66 4 76 10" stroke="#fff" stroke-width="2" fill="none" opacity=".4"/>`,
    sweat: () => `<path d="M62 18 C58 26 62 30 65 30 C68 30 70 26 62 18 Z" fill="#9ae4ff" stroke="#fff" stroke-width="1"/>`,
    cape: (c = '#2a7ad8', c2 = '#ffd36b') => `<path d="M40 112 C42 94 54 86 70 88 C88 86 102 96 106 112 Z" fill="${c}" stroke="#0a1430" stroke-width="2"/><path d="M44 102 C56 92 82 90 102 100" stroke="${c2}" stroke-width="3" fill="none"/><circle cx="72" cy="94" r="4" fill="${c2}" stroke="#4a3006" stroke-width="1"/>`
  };

  // ---------- Gegenstaende ----------
  const bar = (x, y, w, h, pct, c, back = '#0a1418') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${back}" stroke="#000" stroke-opacity=".6" stroke-width="1.4"/><rect x="${x + 1.5}" y="${y + 1.5}" width="${Math.max(0, (w - 3) * pct)}" height="${h - 3}" rx="${(h - 3) / 2}" fill="${c}"/>
    <rect x="${x + 2.5}" y="${y + 2}" width="${Math.max(0, (w - 5) * pct)}" height="${(h - 3) * .35}" rx="${h / 4}" fill="#fff" opacity=".3"/>${[...Array(Math.floor(w / 12))].map((_, i) => `<rect x="${x + 12 * (i + 1)}" y="${y + 2}" width=".9" height="${h - 4}" fill="#000" opacity=".35"/>`).join('')}`;
  // dicker Pfeil nach oben (bzw. unten mit rot=180)
  const bigArrow = (x, y, s = 1, c = '#5fd08a', c2 = '#0a4a24', rot = 0) => { const g = U('rar'); return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="${c}" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs>
    <path d="M0 -24 L20 -2 H8 V22 H-8 V-2 H-20 Z" fill="${c}" stroke="${c2}" stroke-width="2.6" stroke-linejoin="round"/><path d="M0 -24 L20 -2 H8 V22 H-8 V-2 H-20 Z" fill="url(#${g})"/><path d="M-3 -18 L-14 -5" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/></g>`; };
  const trophy = (x, y, s = 1, c = '#ffd36b', ng = false) => `<g transform="translate(${x} ${y}) scale(${s})">${ng ? '' : glow(0, -4, 26, c, .4)}<path d="M-14 -16 H14 C14 2 8 10 0 12 C-8 10 -14 2 -14 -16 Z" fill="${c}" stroke="#6a4a08" stroke-width="2"/><path d="M-14 -12 C-24 -12 -24 2 -10 4 M14 -12 C24 -12 24 2 10 4" stroke="${c}" stroke-width="3" fill="none"/>
    <path d="M-9 -12 C-9 -2 -5 4 -2 6" stroke="#fff6c8" stroke-width="2" fill="none" opacity=".7"/><rect x="-3" y="12" width="6" height="8" fill="#c8941c"/><rect x="-10" y="20" width="20" height="5" rx="1.5" fill="#8a5a10" stroke="#3a2004" stroke-width="1.2"/><path d="M0 -10 l1.6 3.4 3.6 .4 -2.7 2.4 .8 3.6 -3.3 -1.9 -3.3 1.9 .8 -3.6 -2.7 -2.4 3.6 -.4 Z" fill="#fff6c8"/></g>`;
  // Bildschirm mit Rahmen
  const screen = (x, y, w, h, fill = '#0a1a24', frame = '#2a3a44') => `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="4" fill="${frame}" stroke="#05080c" stroke-width="1.6"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}"/><path d="M${x + 2} ${y + 2} L${x + w * .4} ${y + 2} L${x + 2} ${y + h * .5} Z" fill="#fff" opacity=".06"/>`;
  // Steinplakette mit Text (Divisionen)
  const plaque = (t, c0, c1, c2, tc) => { const g = U('rpl'); return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset=".55" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <path d="M20 26 H100 L108 36 V84 L100 94 H20 L12 84 V36 Z" fill="#000" opacity=".4" transform="translate(2 4)"/><path d="M20 26 H100 L108 36 V84 L100 94 H20 L12 84 V36 Z" fill="url(#${g})" stroke="${c2}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M24 32 H96 L102 39 V81 L96 88 H24 L18 81 V39 Z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.4"/>${[[20, 34], [100, 34], [20, 86], [100, 86]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.4" fill="${c0}" stroke="${c2}" stroke-width="1"/>`).join('')}
    <text x="60" y="75" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="bold" font-size="40" fill="${tc}" stroke="${c2}" stroke-width="2.4" paint-order="stroke" letter-spacing="2">${t}</text>`; };
  // Rollen-Symbole (eigene Formen): top, jungle, mid, bot, support
  const ROLE = {
    top: '<path d="M-2 7 V-8 L0 -11 L2 -8 V7 Z M-6 6 H6 M0 7 V11" stroke-linejoin="round"/>',
    jungle: '<path d="M0 10 C-11 2 -8 -8 0 -11 C8 -8 11 2 0 10 Z" stroke-linejoin="round"/><path d="M0 9 V-7" stroke="#0e2a30" stroke-width="1.4"/>',
    mid: '<path d="M0 -10 L2.6 -3 L10 -3 L4 1.6 L6.2 9 L0 4.6 L-6.2 9 L-4 1.6 L-10 -3 L-2.6 -3 Z" stroke-linejoin="round"/>',
    bot: '<path d="M-8 8 L8 -8 M1 -8 H8 V-1 M-8 8 V3 M-8 8 H-3" fill="none" stroke-linejoin="round"/>',
    support: '<path d="M0 -3 C-4 -11 -12 -5 0 8 C12 -5 4 -11 0 -3 Z" stroke-linejoin="round"/>'
  };
  const roleIcon = (k, x, y, s = 1, c = '#c8a96e', on = false) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="14" fill="${on ? '#3a2a08' : '#0e2a30'}" stroke="${on ? '#ffd36b' : c}" stroke-width="${on ? 2.6 : 1.8}"/><circle r="11" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>
    <g fill="${on ? '#ffd36b' : c}" stroke="${on ? '#ffd36b' : c}" stroke-width="2" stroke-linecap="round">${ROLE[k]}</g></g>`;
  const heart = (x, y, s = 1, c = '#ff5a8a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -4 C-6 -14 -20 -6 0 12 C20 -6 6 -14 0 -4 Z" fill="${c}" stroke="#fff" stroke-width="2"/><path d="M-9 -8 C-11 -8 -12 -5 -11 -3" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/></g>`;
  const cloud = (x, y, s = 1, c = '#fff', o = .9) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="16" ry="8" fill="${c}"/><ellipse cx="-10" cy="2" rx="10" ry="6" fill="${c}"/><ellipse cx="11" cy="2" rx="11" ry="6.5" fill="${c}"/><ellipse cx="2" cy="-6" rx="9" ry="7" fill="${c}"/></g>`;
  // Feuerwerk (Strahlenkranz)
  const burst = (x, y, r, c, cls = '') => `<g transform="translate(${x} ${y})"><g class="${cls}">${[...Array(12)].map((_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M${(Math.cos(a) * r * .35).toFixed(1)} ${(Math.sin(a) * r * .35).toFixed(1)} L${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><circle cx="${(Math.cos(a) * r * 1.12).toFixed(1)}" cy="${(Math.sin(a) * r * 1.12).toFixed(1)}" r="1.3" fill="#fff"/>`; }).join('')}</g></g>`;
  // Spiel-Ergebnis-Kaestchen (W/L)
  const wl = (x, y, w, sz = 14) => `<g transform="translate(${x} ${y})"><rect x="${-sz / 2}" y="${-sz / 2}" width="${sz}" height="${sz}" rx="3" fill="${w ? '#1e6ad8' : '#c8283a'}" stroke="${w ? '#9ae4ff' : '#ff9aa0'}" stroke-width="1.4"/><rect x="${-sz / 2 + 1.5}" y="${-sz / 2 + 1.5}" width="${sz - 3}" height="${sz * .3}" rx="1.5" fill="#fff" opacity=".22"/>${txt(w ? 'W' : 'L', 0, sz * .3, sz * .62, '#fff', 'rgba(0,0,0,.35)', 1.4)}</g>`;
  const mug = (x, y, s = 1, c = '#c8a96e') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-9 -10 H9 V8 C9 12 6 14 2 14 H-2 C-6 14 -9 12 -9 8 Z" fill="${c}" stroke="#3a2008" stroke-width="1.6"/><path d="M9 -5 C16 -5 16 6 9 6" stroke="#3a2008" stroke-width="2.4" fill="none"/><ellipse cx="0" cy="-10" rx="9" ry="2.4" fill="#4a2a10"/><path d="M-6 -6 V8" stroke="#fff" stroke-width="1.6" opacity=".35"/>
    <path d="M-3 -16 C-6 -20 0 -22 -3 -27 M3 -16 C0 -20 6 -22 3 -27" stroke="#fff" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/></g>`;
  const magnifier = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><rect x="-3.4" y="14" width="6.8" height="24" rx="3" fill="#5a3a1a" stroke="#2a1808" stroke-width="1.4"/><circle r="15" fill="#9ae4ff" fill-opacity=".22" stroke="#c8a96e" stroke-width="4.4"/><circle r="15" fill="none" stroke="#4a3208" stroke-width="1"/><path d="M-9 -6 C-7 -11 -2 -12 2 -11" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".75"/></g>`;
  const clock = (x, y, r, t1 = -60, t2 = 90, face = '#f6efe2', rim = '#c8a96e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${face}" stroke="${rim}" stroke-width="${r * .16}"/><circle r="${r}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1"/>${[...Array(12)].map((_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M${(Math.cos(a) * r * .74).toFixed(1)} ${(Math.sin(a) * r * .74).toFixed(1)} L${(Math.cos(a) * r * .86).toFixed(1)} ${(Math.sin(a) * r * .86).toFixed(1)}" stroke="#3a2a1a" stroke-width="${i % 3 ? .8 : 1.6}"/>`; }).join('')}
    <path d="M0 0 L${(Math.cos(t1 * Math.PI / 180) * r * .45).toFixed(1)} ${(Math.sin(t1 * Math.PI / 180) * r * .45).toFixed(1)}" stroke="#1a1410" stroke-width="${r * .12}" stroke-linecap="round"/><path d="M0 0 L${(Math.cos(t2 * Math.PI / 180) * r * .68).toFixed(1)} ${(Math.sin(t2 * Math.PI / 180) * r * .68).toFixed(1)}" stroke="#1a1410" stroke-width="${r * .08}" stroke-linecap="round"/><circle r="${r * .08}" fill="#c8283a"/></g>`;
  const portrait = (x, y, w, hi = false) => `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="3" fill="${hi ? '#3a2a0a' : '#16303a'}" stroke="${hi ? '#ffd36b' : '#2e5058'}" stroke-width="${hi ? 2 : 1}"/><circle cx="${x + w / 2}" cy="${y + w * .42}" r="${w * .2}" fill="${hi ? '#ffd36b' : '#3e6670'}" opacity=".9"/><path d="M${x + w * .2} ${y + w * .9} Q${x + w / 2} ${y + w * .52} ${x + w * .8} ${y + w * .9} Z" fill="${hi ? '#ffd36b' : '#3e6670'}" opacity=".9"/>`;
  const banner = (y, t, c = '#c8283a', c2 = '#5a0a10', tc = '#fff6c8', w = 92, fs = 11) => `<g><path d="M${60 - w / 2 - 10} ${y + 3} L${60 - w / 2} ${y - 1} L${60 - w / 2} ${y + 13} L${60 - w / 2 - 10} ${y + 17} L${60 - w / 2 - 5} ${y + 10} Z M${60 + w / 2 + 10} ${y + 3} L${60 + w / 2} ${y - 1} L${60 + w / 2} ${y + 13} L${60 + w / 2 + 10} ${y + 17} L${60 + w / 2 + 5} ${y + 10} Z" fill="${c2}"/>
    <path d="M${60 - w / 2} ${y - 3} Q60 ${y - 7} ${60 + w / 2} ${y - 3} V${y + 13} Q60 ${y + 9} ${60 - w / 2} ${y + 13} Z" fill="${c}" stroke="${c2}" stroke-width="1.6"/><path d="M${60 - w / 2 + 3} ${y - 1} Q60 ${y - 5} ${60 + w / 2 - 3} ${y - 1}" stroke="#fff" stroke-width="1" opacity=".35" fill="none"/>${txt(t, 60, y + 8.5, fs, tc, c2, 2.2)}</g>`;
  // Leiter (fuer The Ladder / Hardstuck)
  const ladderRungs = (x1, y1, x2, y2, n, cols) => { let o = ''; for (let i = 0; i < n; i++) { const t = (i + .5) / n, cx = x1 + (x2 - x1) * t, cy = y1 + (y2 - y1) * t; o += `<path d="M${(cx - 15).toFixed(1)} ${(cy + 4).toFixed(1)} L${(cx + 15).toFixed(1)} ${(cy - 4).toFixed(1)}" stroke="#1a0e04" stroke-width="6" stroke-linecap="round"/><path d="M${(cx - 15).toFixed(1)} ${(cy + 4).toFixed(1)} L${(cx + 15).toFixed(1)} ${(cy - 4).toFixed(1)}" stroke="${cols[i % cols.length]}" stroke-width="3.6" stroke-linecap="round"/>`; } return o; };

  // ---------- Die 50 Motive ----------
  const ART = {
    // ===== Animated Rare: Hintergrund hier, Figur als Hologramm-Ebene (POP) =====
    'challenger': () => `${bg('#04102a', '#0e2a5a')}${D.stars('#cdf2ff', 16)}${rays(60, 50, '#ffe9a0', 18, .13, 95, 'a-spin')}${glow(60, 52, 50, '#9ae4ff', .55, 'a-pulse')}
      <path d="M0 120 V94 L18 78 L30 86 L48 62 L60 52 L72 64 L88 80 L100 72 L120 90 V120 Z" fill="#0a1e44"/><path d="M60 52 L52 60 L57 59 L61 63 L66 59 L72 64 Z" fill="#e2f2ff"/><path d="M18 78 L13 83 L18 82 L22 84 Z M100 72 L95 77 L100 76 L105 78 Z" fill="#c8dcf0"/>
      <path d="M0 120 V104 L24 96 L44 104 L70 98 L94 106 L120 100 V120 Z" fill="#06122e"/>${sparks([[14, 18, .8], [106, 16, .9], [10, 66, .5], [110, 58, .6]], 'a-twinkle', '#fff2a8')}${D.motes('#cdf2ff', 7)}`,
    'promoted': () => `${bg('#1a0a36', '#3a1a5a')}${rays(60, 58, '#ffe9a0', 16, .14, 95, 'a-spin')}${glow(60, 58, 50, '#ffd36b', .6, 'a-pulse')}${D.confetti(16, 'a-twinkle')}
      ${emblem('gold', 17, 20, .3)}<path d="M32 20 H46 M42 16 L46 20 L42 24" stroke="#fff2a8" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${emblem('platinum', 102, 20, .33)}
      ${banner(100, 'PROMOTED!', '#d8941c', '#5a3a06', '#fff6c8', 84, 11)}`,
    'season-end': () => `${bg('#0a0620', '#22104a')}${D.stars('#fff', 14)}${burst(22, 26, 14, '#ff7ad9', 'a-pulse')}${burst(98, 20, 12, '#6bc8ff', 'a-pulse d2')}${burst(70, 44, 9, '#ffd36b', 'a-pulse d1')}
      ${sparks([[44, 14, .5], [110, 52, .5], [8, 56, .4]], 'a-twinkle', '#fff2a8')}<path d="M0 104 H120 V120 H0 Z" fill="#160a30"/><path d="M14 104 H106" stroke="#c8a96e" stroke-width="1.4"/>
      <path d="M16 104 V96 H44 V104 Z M76 104 V98 H104 V104 Z" fill="#2a1a4a" stroke="#c8a96e" stroke-width="1"/>${txt('2', 30, 103, 6, '#c8a96e', 'none', 0)}${txt('3', 90, 103, 6, '#c8a96e', 'none', 0)}${D.motes('#ffe9f4', 6)}`,

    // ===== Holo Rare =====
    'grandmaster': () => `${bg('#200404', '#4e0c0c', '#ff5a3a')}${D.hatch('#ff9a8a', .05)}${rays(60, 54, '#ff8a6a', 16, .1)}
      <path d="M0 120 V100 L14 94 L28 100 L46 92 L60 98 L76 90 L94 98 L108 92 L120 98 V120 Z" fill="#1a0404"/>${flame(18, 92, .5)}${flame(102, 94, .48)}${flame(60, 102, .32)}
      ${emblem('grandmaster', 60, 62, .94)}${sparks([[16, 20, .7], [104, 24, .6], [20, 64, .4]], '', '#ffb08a')}${D.motes('#ffb08a', 8)}`,
    'master': () => `${bg('#120626', '#2e0e52', '#b46aff')}${D.hex('#e0b8ff', .05)}
      <circle cx="60" cy="56" r="48" fill="none" stroke="#b46aff" stroke-width="1.4" stroke-dasharray="4 4" opacity=".55"/><circle cx="60" cy="56" r="42" fill="none" stroke="#e0b8ff" stroke-width=".8" opacity=".45"/>
      ${[...Array(8)].map((_, i) => { const a = i / 8 * Math.PI * 2; return `<text x="${(60 + Math.cos(a) * 45).toFixed(1)}" y="${(59 + Math.sin(a) * 45).toFixed(1)}" text-anchor="middle" font-family="Georgia,serif" font-size="7" fill="#e8d0ff" opacity=".75">${'ᚠᚱᚦᚨᛃᛇᛉᛟ'[i]}</text>`; }).join('')}
      <path d="M30 108 H90 L84 98 H36 Z" fill="#3a1a5a" stroke="#1a0630" stroke-width="2"/><path d="M38 98 H82" stroke="#b46aff" stroke-width="1.2"/>${emblem('master', 60, 60, .98)}${sparks([[18, 18, .7], [104, 22, .6], [104, 100, .5]], '', '#f0d8ff')}${D.motes('#e8d0ff', 8)}`,
    'diamond': () => `${bg('#06143a', '#123a7a', '#9ae4ff')}${D.beams('#cdf2ff', .08)}
      ${[[8, 120, 16, 30], [26, 120, 10, 20], [96, 120, 14, 34], [112, 120, 10, 22], [80, 120, 8, 14]].map(([x, y, w, h]) => `<path d="M${x - w / 2} ${y} L${x - w * .2} ${y - h} L${x + w * .3} ${y - h * .8} L${x + w / 2} ${y} Z" fill="#6ab4f0" stroke="#e2f2ff" stroke-width="1.2" stroke-linejoin="round"/><path d="M${x - w * .2} ${y - h} L${x} ${y}" stroke="#fff" stroke-width=".8" opacity=".6"/>`).join('')}
      <g opacity=".9">${pony({ x: 4, y: 70, s: .36, eye: 'wide' })}</g>${emblem('diamond', 66, 46, .95)}${sparks([[20, 20, .7], [108, 16, .8], [104, 80, .5], [34, 58, .4]], '', '#e2f2ff')}${D.motes('#cdf2ff', 8)}`,
    'emerald': () => `${bg('#03180c', '#0c3a1e', '#5fffa0')}${D.beams('#b8ffd0', .06)}
      <path d="M14 120 V58 C14 22 106 22 106 58 V120 H92 V60 C92 36 28 36 28 60 V120 Z" fill="#2a3a30" stroke="#0a140e" stroke-width="2"/>${[[16, 70], [16, 92], [94, 74], [94, 98], [30, 34], [60, 26], [86, 32]].map(([x, y]) => `<rect x="${x}" y="${y}" width="10" height="7" rx="1.5" fill="#3a4e42" stroke="#0a140e" stroke-width="1"/>`).join('')}
      <path d="M18 40 C24 56 14 70 22 90 M100 44 C94 60 104 74 96 96 M40 30 C50 36 70 36 82 30" stroke="#1e7a3a" stroke-width="3" fill="none"/>${[[20, 52], [16, 76], [102, 58], [98, 84], [52, 34], [72, 34]].map(([x, y], i) => `<path transform="translate(${x} ${y}) rotate(${i * 50})" d="M0 0 C-4 -3 -4 -8 0 -10 C4 -8 4 -3 0 0 Z" fill="#3ac86a" stroke="#0a4a1e" stroke-width=".8"/>`).join('')}
      <rect y="104" width="120" height="16" fill="#0a2414"/>${emblem('emerald', 60, 70, .92)}${D.motes('#b8ffd0', 9)}`,
    'platinum': () => `${bg('#04222a', '#0a4a50', '#6bffe4')}${D.hex('#c8fff4', .05)}${rays(40, 52, '#c8fff4', 14, .08)}
      ${[0, 1, 2].map(i => `<path d="M0 ${100 + i * 7} Q15 ${95 + i * 7} 30 ${100 + i * 7} T60 ${100 + i * 7} T90 ${100 + i * 7} T120 ${100 + i * 7} V120 H0 Z" fill="${['#0e5a5a', '#0a4448', '#06302e'][i]}"/>`).join('')}
      ${emblem('platinum', 38, 52, .9)}${pony({ x: 62, y: 46, s: .46, flip: true, eye: 'happy', body: '#e8f6f4', shade: '#8ac8c0', mane: '#2a9a8a' })}${sparks([[100, 18, .7], [14, 96, .5], [74, 30, .5]], '', '#c8fff4')}${D.motes('#c8fff4', 7)}`,
    'win-streak': () => `${bg('#2a0a04', '#5a1e08', '#ff8a3a')}${D.hatch('#ffc08a', .05)}${rays(60, 64, '#ffb46b', 14, .1)}
      ${[0, 1, 2, 3, 4].map(i => wl(16 + i * 22, 16, true, 16)).join('')}${flame(60, 62, 1.25)}
      ${pony({ x: 28, y: 50, s: .5, eye: 'angry', body: '#f0d4a0', shade: '#c08838', mane: '#ff5a1e', extra: '<path d="M30 22 C44 16 70 18 90 28 L88 36 C70 26 48 26 32 30 Z" fill="#ffd36b" stroke="#6a4a08" stroke-width="1.6"/>' })}
      ${txt('x5', 100, 108, 13, '#ffe46b', '#3a0a04', 2.6)}${D.motes('#ffd08a', 8)}`,
    'victorious': () => `${bg('#06142a', '#14365a', '#ffd36b')}${rays(60, 50, '#fff2b0', 20, .12)}${D.beams('#ffe9b0', .07)}
      ${[0, 1].map(sd => `<g transform="translate(${sd ? 120 : 0} 0) scale(${sd ? -1 : 1} 1)"><path d="M6 16 H22 V64 L14 58 L6 64 Z" fill="#c8283a" stroke="#4a0610" stroke-width="1.4"/><path d="M14 26 l4 8 -4 8 -4 -8 Z" fill="#ffd36b"/></g>`).join('')}
      ${pony({ x: 20, y: 18, s: .62, eye: 'closed', body: '#f6efe2', shade: '#c8b89a', mane: '#ffd36b', extra: ACC.laurel() + ACC.cape('#c8283a', '#ffd36b') })}
      ${banner(98, 'VICTORIOUS', '#1e4a8a', '#0a1a3a', '#ffe46b', 88, 10)}${sparks([[60, 10, .7], [100, 76, .5]], '', '#fff2b0')}`,

    // ===== Uncommon =====
    'gold': () => `${bg('#2a1a04', '#5a3a08', '#ffd36b')}${D.hex('#ffe9b0', .05)}${rays(60, 54, '#fff2b0', 14, .1)}${emblem('gold', 60, 54, 1.05)}
      ${coin(18, 100, 7)}${coin(30, 106, 8)}${coin(96, 104, 8)}${coin(106, 96, 6)}${D.motes('#ffe9b0', 7)}`,
    'silver': () => `${bg('#141c2a', '#34445a', '#d8e6f4')}${D.stars('#fff', 10)}<circle cx="96" cy="22" r="10" fill="#e8eef8" opacity=".85"/><circle cx="100" cy="19" r="9" fill="#2a3648"/>
      ${D.floor(100, '#1e2838', '#3a4a5e')}${emblem('silver', 60, 56, 1.05)}${D.motes('#e2eefa', 6)}`,
    'bronze': () => `${bg('#24120a', '#4a2a14', '#ffb36b')}${D.hatch('#ffc89a', .05)}
      <path d="M0 120 V100 Q30 94 60 100 T120 98 V120 Z" fill="#3a2010"/>${[[16, 104], [30, 110], [94, 106], [108, 112]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2" fill="#5a3418"/>`).join('')}
      ${emblem('bronze', 60, 56, 1.05)}${D.motes('#ffc89a', 6)}`,
    'iron': () => `${bg('#16181c', '#2e3238')}${[0, 1, 2, 3].map(i => `<rect x="${i * 32 - 4}" y="${i % 2 ? 4 : 0}" width="30" height="120" fill="#22262c" stroke="#0e1014" stroke-width="2"/>${[14, 56, 98].map(y => `<circle cx="${i * 32 + 4}" cy="${y + (i % 2) * 4}" r="1.6" fill="#4a4e56"/>`).join('')}`).join('')}
      ${[0, 1].map(sd => `<g transform="translate(${sd ? 120 : 0} 0) scale(${sd ? -1 : 1} 1)">${[...Array(5)].map((_, i) => `<ellipse cx="${10 + i * 6}" cy="${10 + i * 9}" rx="3.4" ry="5" fill="none" stroke="#6e737c" stroke-width="2" transform="rotate(-30 ${10 + i * 6} ${10 + i * 9})"/>`).join('')}</g>`).join('')}
      ${emblem('iron', 60, 60, 1.05)}`,
    'tier-up': () => `${bg('#0a1e24', '#123e44', '#ffd36b')}${D.grid('#9affec', .05)}${emblem('silver', 30, 86, .55)}${emblem('gold', 88, 40, .78)}
      <path d="M38 64 C40 44 52 36 66 38" stroke="#0a1418" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M38 64 C40 44 52 36 66 38" stroke="#ffe46b" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60 30 L70 38 L60 46 Z" fill="#ffe46b" stroke="#0a1418" stroke-width="1.6" stroke-linejoin="round"/>
      ${txt('TIER UP', 60, 114, 13, '#ffe46b', '#0a1e24', 2.6)}${sparks([[100, 82, .5], [18, 20, .5]], '', '#fff2b0')}`,
    'demotion-shield': () => { const g = U('rds'); return `${bg('#0a1e2a', '#16384a', '#6bc8ff')}${D.hex('#9ae4ff', .05)}
      <g opacity=".85">${pony({ x: 4, y: 40, s: .52, eye: 'wide', extra: ACC.sweat() })}</g>
      <g transform="translate(78 56)"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8f2ff"/><stop offset=".5" stop-color="#3a8ad8"/><stop offset="1" stop-color="#123a6a"/></linearGradient></defs>
      ${glow(0, 0, 36, '#6bc8ff', .45)}<path d="M0 -32 L26 -24 C26 4 18 22 0 32 C-18 22 -26 4 -26 -24 Z" fill="url(#${g})" stroke="#e2f2ff" stroke-width="3" stroke-linejoin="round"/>
      <path d="M0 -26 L20 -20 C20 2 14 16 0 25 C-14 16 -20 2 -20 -20 Z" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1.2"/><path d="M4 -32 L-2 -14 L6 -6 L-4 8 L2 14" stroke="#0a1e2a" stroke-width="2" fill="none" stroke-linejoin="round"/>
      ${txt('0', 0, 6, 18, '#fff', '#123a6a', 2.4)}${txt('LP', 0, 18, 7, '#e2f2ff', '#123a6a', 1.6)}</g>${bar(14, 104, 92, 8, 0, '#6bc8ff')}`; },
    'lp-gain': () => `${bg('#04200e', '#0c4a22', '#5fd08a')}${D.grid('#9affb8', .05)}${[[16, 30, .5], [104, 40, .45], [96, 92, .4]].map(([x, y, s]) => bigArrow(x, y, s)).join('')}
      ${pony({ x: 16, y: 40, s: .5, eye: 'happy' })}${txt('+28', 66, 34, 26, '#9affb8', '#04200e', 3.4)}${txt('LP', 96, 52, 12, '#d8ffe4', '#04200e', 2.4)}${bar(14, 104, 92, 8, .82, '#5fd08a')}${D.motes('#c8ffd8', 6)}`,
    'lp-loss': () => `${bg('#1a0408', '#3e0c14', '#ff4a5a')}${D.hatch('#ff9aa0', .04)}${cloud(84, 16, 1.2, '#3a1a24', 1)}${[...Array(8)].map((_, i) => `<path d="M${70 + (i * 7) % 30} ${28 + (i * 13) % 26} l-2 6" stroke="#9ab4d8" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`).join('')}
      ${pony({ x: 50, y: 44, s: .5, flip: true, eye: 'tired' })}${txt('-22', 32, 44, 24, '#ff7a8a', '#1a0408', 3.4)}${txt('LP', 32, 60, 11, '#ffc0c6', '#1a0408', 2.4)}${bigArrow(26, 84, .42, '#e83a4a', '#4a0610', 180)}${bar(14, 104, 92, 8, .12, '#e83a4a')}`,
    'placements': () => `${bg('#0e1a24', '#1e3442')}${D.hex('#9ab4c8', .05)}${emblem('unranked', 60, 44, .8)}${txt('?', 60, 52, 20, '#e2eaf4', '#1a2030', 3)}
      ${[true, true, false, null, null].map((w, i) => w === null ? `<g transform="translate(${20 + i * 20} 96)"><rect x="-7.5" y="-7.5" width="15" height="15" rx="3" fill="#162430" stroke="#4a6070" stroke-width="1.4" stroke-dasharray="3 2"/>${txt('?', 0, 4, 9, '#6a8494', 'none', 0)}</g>` : wl(20 + i * 20, 96, w, 15)).join('')}
      ${txt('3 / 5', 60, 116, 8, '#9ab4c8', '#0e1a24', 1.8)}`,
    'hidden-mmr': () => `${bg('#120a24', '#2a1a48')}${D.grid('#c8b0ff', .05)}
      <g transform="translate(72 58)"><path d="M-34 10 A34 34 0 0 1 34 10" fill="none" stroke="#0a0618" stroke-width="12"/>${['#e83a4a', '#ffd36b', '#5fd08a'].map((c, i) => `<path d="M${(-Math.cos(i * Math.PI / 3 * .9 + .17) * 34).toFixed(1)} ${(10 - Math.sin(i * Math.PI / 3 * .9 + .17) * 34).toFixed(1)} A34 34 0 0 1 ${(-Math.cos((i + 1) * Math.PI / 3 * .9 + .17) * 34).toFixed(1)} ${(10 - Math.sin((i + 1) * Math.PI / 3 * .9 + .17) * 34).toFixed(1)}" fill="none" stroke="${c}" stroke-width="8"/>`).join('')}
      <path d="M0 10 L14 -20" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cy="10" r="5" fill="#c8a96e" stroke="#3a2a08" stroke-width="1.4"/>${txt('???', 0, 34, 13, '#e8d8ff', '#120a24', 2.6)}</g>
      ${pony({ x: -2, y: 56, s: .42, flip: true, eye: 'normal' })}${magnifier(48, 70, .62, 30)}`,
    'decay': () => `${bg('#1a1a14', '#2e2e22')}${D.hatch('#c8c8a0', .04)}
      <path d="M0 0 L26 0 M0 0 L0 26 M0 0 L22 18 M0 10 Q8 8 10 0 M0 18 Q14 16 18 0 M0 4 Q4 4 4 0" stroke="#d8d8c8" stroke-width=".8" fill="none" opacity=".5"/>
      <g opacity=".6" style="filter:saturate(.25)">${emblem('diamond', 42, 58, .66)}</g><path d="M30 34 L40 46 L34 56 L44 66" stroke="#1a1a14" stroke-width="2" fill="none"/>${[[30, 96], [36, 100], [46, 98], [52, 102]].map(([x, y]) => `<path d="M${x} ${y} l3 -3 3 3 -3 2 Z" fill="#6a8ab8" opacity=".6"/>`).join('')}
      <g transform="translate(92 60)"><rect x="-14" y="-32" width="28" height="5" rx="2" fill="#7a4a20" stroke="#3a1a08" stroke-width="1.4"/><rect x="-14" y="27" width="28" height="5" rx="2" fill="#7a4a20" stroke="#3a1a08" stroke-width="1.4"/>
      <path d="M-11 -27 H11 L2 0 L11 27 H-11 L-2 0 Z" fill="#e8eef8" fill-opacity=".7" stroke="#6a5a40" stroke-width="2"/><path d="M-6 -20 H6 L1 -6 H-1 Z M-1 4 H1 L8 24 H-8 Z" fill="#d8b46a"/></g>${txt('-LP', 92, 112, 11, '#d8d8c8', '#1a1a14', 2.4)}`,
    'dodge-penalty': () => `${bg('#200606', '#3e0c10')}${D.grid('#ff9a9a', .04)}${screen(14, 18, 92, 58, '#141018', '#4a2a30')}
      ${[...Array(10)].map((_, i) => `<rect x="${19 + (i % 5) * 17.6}" y="${24 + Math.floor(i / 5) * 18}" width="14" height="14" rx="2" fill="#2a2030" stroke="#4a3a50" stroke-width=".8"/>`).join('')}
      <g transform="translate(60 47)"><circle r="17" fill="#c8283a" stroke="#fff" stroke-width="2.6"/><path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>
      ${clock(28, 100, 12, -90, 0)}${txt('5:00', 72, 98, 15, '#ffb0b0', '#200606', 2.6)}${txt('-5 LP', 72, 113, 9, '#ff7a8a', '#200606', 2)}`,
    'loss-streak': () => `${bg('#0e1220', '#1e2638')}${cloud(40, 18, 1.5, '#3a4258', 1)}${cloud(86, 14, 1.3, '#2e3448', 1)}<path d="M64 18 L56 34 H64 L58 48" stroke="#ffe46b" stroke-width="2.6" fill="none" stroke-linejoin="round"/>
      ${[...Array(12)].map((_, i) => `<path d="M${14 + (i * 9) % 96} ${32 + (i * 17) % 40} l-2.4 7" stroke="#8aa8d8" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`).join('')}
      ${pony({ x: 26, y: 38, s: .48, eye: 'tired', body: '#c8b08c', shade: '#8a6a3a' })}${[0, 1, 2, 3, 4].map(i => wl(18 + i * 21, 106, false, 14)).join('')}`,
    'hardstuck': () => `${bg('#1a1a20', '#2e3038')}${D.hatch('#9aa0aa', .04)}${D.floor(100, '#202228', '#3a3e46')}
      ${pony({ x: 6, y: 24, s: .54, eye: 'tired', extra: ACC.sweat() })}
      ${[...Array(6)].map((_, i) => `<ellipse cx="${56 + i * 6}" cy="${80 + Math.sin(i) * 5 + i * 1.6}" rx="3.6" ry="2.4" fill="none" stroke="#8a909a" stroke-width="2" transform="rotate(${i % 2 ? 60 : -20} ${56 + i * 6} ${80 + Math.sin(i) * 5 + i * 1.6})"/>`).join('')}
      <g transform="translate(96 86)"><path d="M-14 14 L-10 -8 H10 L14 14 Z" fill="#3a3e46" stroke="#0e1014" stroke-width="2"/><rect x="-6" y="-14" width="12" height="7" rx="3" fill="none" stroke="#3a3e46" stroke-width="3"/>${txt('G4', 0, 9, 11, '#ffd36b', '#0e1014', 2)}</g>
      ${txt('3 SEASONS', 60, 16, 9, '#c8ccd2', '#1a1a20', 2)}`,
    'the-ladder': () => `${bg('#08141e', '#163040')}${D.stars('#e2f2ff', 10)}${glow(106, 34, 18, '#ffe9a0', .6)}${crown(106, 30, .2, ['#6bc8ff', '#ffd36b', '#6bc8ff', '#ffd36b', '#6bc8ff'])}
      <path d="M8 124 L82 0 M30 132 L104 8" stroke="#2a1608" stroke-width="7"/><path d="M8 124 L82 0 M30 132 L104 8" stroke="#a8784a" stroke-width="4"/>
      ${ladderRungs(19, 126, 93, 4, 10, TIER_ORDER.map(t => TIER[t].c[1]))}
      ${pony({ x: 40, y: 50, s: .3, eye: 'angry' })}${txt('UP', 22, 26, 11, '#ffe46b', '#08141e', 2.4)}`,

    // ===== Common =====
    'ranked-queue': () => `${bg('#08202a', '#123a46')}${D.grid('#9affec', .05)}<circle cx="60" cy="52" r="34" fill="#061820" stroke="#c8a96e" stroke-width="3"/><circle cx="60" cy="52" r="28" fill="none" stroke="#3ab8a8" stroke-width="4" stroke-dasharray="120 60" transform="rotate(-90 60 52)"/>
      <circle cx="60" cy="52" r="28" fill="none" stroke="#fff" stroke-width="1" opacity=".2"/>${txt('2:13', 60, 58, 17, '#e8fff8', '#061820', 2.4)}${txt('FINDING MATCH', 60, 106, 9, '#c8a96e', '#08202a', 2)}`,
    'solo-queue': () => `${bg('#0a1418', '#1a2c30')}<path d="M44 -4 L76 -4 L100 104 L20 104 Z" fill="#fff6c8" opacity=".08"/><ellipse cx="60" cy="102" rx="38" ry="8" fill="#fff6c8" opacity=".12"/>
      ${D.shadow(60, 102, 26)}${pony({ x: 26, y: 34, s: .58, eye: 'normal' })}${txt('SOLO', 18, 20, 10, '#c8a96e', '#0a1418', 2.4, 'start')}`,
    'flex-queue': () => `${bg('#0a1e26', '#14404a')}${D.hex('#9affec', .05)}${[['#7a4a20', '#e8c48c'], ['#ff5a8a', '#f6efe2'], ['#3a7ad8', '#d8b88a'], ['#5fd08a', '#c89a5a'], ['#9a6aff', '#e8d8c8']].map(([m, b], i) => `<g>${pony({ x: 2 + i * 22, y: 36 + (i % 2) * 14, s: .26, eye: 'happy', mane: m, body: b })}</g>`).join('')}
      <path d="M8 90 H112" stroke="#c8a96e" stroke-width="1.4"/>${txt('FLEX 5/5', 60, 108, 11, '#e8fff8', '#0a1e26', 2.4)}`,
    'lp-bar': () => `${bg('#0a1e24', '#16363e')}${D.grid('#9affec', .05)}${emblem('gold', 60, 40, .62)}${bar(12, 76, 96, 14, .75, '#3ab8a8')}${txt('75 / 100 LP', 60, 106, 10, '#e8fff8', '#0a1e24', 2.2)}`,
    'division-four': () => `${bg('#141a1c', '#283234')}${plaque('IV', '#a8aeb8', '#6e737c', '#2a2d33', '#e2e6ea')}<path d="M86 30 L80 44 L88 52 L82 64" stroke="#1a1c20" stroke-width="1.6" fill="none"/>`,
    'division-one': () => `${bg('#201604', '#4a3608', '#ffd36b')}${plaque('I', '#fff4b0', '#e2b23c', '#5a3a06', '#fff8d8')}${sparks([[16, 18, .6], [106, 104, .7], [104, 18, .5]], '', '#fff2b0')}`,
    'one-trick': () => `${bg('#0a1a20', '#16323c')}${[0, 1, 3, 4].map(i => `<g opacity=".35">${portrait(6 + i * 22, 30, 20)}</g>`).join('')}
      <g transform="translate(60 44)">${glow(0, 0, 30, '#ffd36b', .35)}<rect x="-20" y="-24" width="40" height="48" rx="4" fill="#3a2a0a" stroke="#ffd36b" stroke-width="2.4"/></g>${pony({ x: 43, y: 24, s: .34, eye: 'happy' })}
      ${txt('1,204', 60, 92, 15, '#ffe46b', '#0a1a20', 2.6)}${txt('GAMES', 60, 106, 9, '#c8a96e', '#0a1a20', 2)}`,
    'mastery-badge': () => { const g = U('rmb'); return `${bg('#0e1a2a', '#1e3450')}${D.hex('#c8a96e', .05)}<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ad8c8"/><stop offset="1" stop-color="#0e5a5a"/></linearGradient></defs>
      <path d="M44 74 L36 112 L48 104 L54 114 L58 78 Z M76 74 L84 112 L72 104 L66 114 L62 78 Z" fill="#c8283a" stroke="#4a0610" stroke-width="1.4"/>
      <path d="M60 14 L88 30 V62 L60 80 L32 62 V30 Z" fill="url(#${g})" stroke="#ffd36b" stroke-width="3.4" stroke-linejoin="round"/><path d="M60 22 L80 34 V58 L60 71 L40 58 V34 Z" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1.2"/>
      ${txt('7', 60, 58, 26, '#fff6c8', '#0a3a3a', 3)}${sparks([[92, 20, .5], [26, 26, .4]], '', '#fff2b0')}`; },
    'match-history': () => `${bg('#0a161c', '#162a32')}${[[1, '8/2/11'], [1, '5/1/7'], [0, '2/9/4'], [1, '12/3/6'], [0, '3/7/9']].map(([w, k], i) => `<g transform="translate(0 ${12 + i * 20})"><rect x="8" y="0" width="104" height="17" rx="3" fill="${w ? '#123a6a' : '#5a1420'}" stroke="${w ? '#3a8ad8' : '#d83a4a'}" stroke-width="1.2"/><rect x="8" y="0" width="4" height="17" rx="2" fill="${w ? '#6bc8ff' : '#ff6a7a'}"/>${portrait(15, 2, 13, i === 3)}${txt(w ? 'WIN' : 'LOSS', 34, 12, 7.5, w ? '#9ae4ff' : '#ffb0b0', 'none', 0, 'start')}${txt(k, 106, 12, 7.5, '#e8eef8', 'none', 0, 'end')}</g>`).join('')}`,
    'profile-stalking': () => `${bg('#0e1420', '#1c2638')}<rect x="14" y="16" width="70" height="88" rx="6" fill="#16303a" stroke="#c8a96e" stroke-width="2"/><circle cx="49" cy="40" r="13" fill="#2a4a54" stroke="#c8a96e" stroke-width="1.6"/>${pony({ x: 39, y: 30, s: .2, eye: 'normal' })}
      <rect x="24" y="60" width="50" height="5" rx="2" fill="#3a5a64"/><rect x="28" y="70" width="42" height="4" rx="2" fill="#2a4a54"/>${emblem('emerald', 49, 88, .3)}${magnifier(84, 58, 1.05, -35)}`,
    'alt-account': () => `${bg('#1a1424', '#30264a')}${D.hatch('#c8b0ff', .04)}${pony({ x: 16, y: 26, s: .62, eye: 'normal', body: '#d8c8a8', shade: '#9a7a48', extra: ACC.disguise() + ACC.cap('#3a3a52') })}
      <rect x="62" y="88" width="52" height="18" rx="4" fill="#f6efe2" stroke="#3a2a4a" stroke-width="1.6"/>${txt('NOT_ME', 88, 101, 9, '#3a2a4a', 'none', 0)}${txt('LVL 31', 22, 18, 8, '#c8b0ff', '#1a1424', 2)}`,
    'night-grind': () => `${bg('#04060e', '#0e1426')}<rect x="66" y="10" width="44" height="34" rx="2" fill="#0a1a3a" stroke="#2a2a3a" stroke-width="3"/><path d="M88 10 V44 M66 27 H110" stroke="#2a2a3a" stroke-width="2"/><circle cx="78" cy="20" r="5" fill="#fff2d8"/><circle cx="80" cy="18" r="4.4" fill="#0a1a3a"/>${[[100, 16], [96, 36], [74, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".8" fill="#fff"/>`).join('')}
      ${glow(34, 76, 40, '#6bc8ff', .35)}${pony({ x: 38, y: 40, s: .5, eye: 'tired', extra: ACC.headset() })}${screen(6, 60, 34, 26, '#123a6a', '#1a1a2a')}<path d="M10 80 L18 72 L24 76 L34 66" stroke="#6bc8ff" stroke-width="1.6" fill="none"/>
      <rect x="0" y="100" width="120" height="20" fill="#1a1420"/>${mug(26, 98, .6)}${txt('3:47 AM', 8, 16, 9, '#9ab4d8', '#04060e', 2, 'start')}`,
    'remake': () => `${bg('#141a20', '#262e38')}${screen(12, 16, 96, 82, '#0e141a', '#3a4450')}${txt('REMAKE?', 60, 36, 12, '#e8eef8', '#0e141a', 2)}
      ${[1, 1, 1, 1, 0].map((v, i) => `<g transform="translate(${24 + i * 18} 58)"><circle r="7" fill="${v ? '#1e6a3a' : '#5a1420'}" stroke="${v ? '#5fd08a' : '#d83a4a'}" stroke-width="1.6"/><path d="${v ? 'M-3.4 0 L-1 2.6 L3.6 -2.6' : 'M-3 -3 L3 3 M3 -3 L-3 3'}" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`).join('')}
      ${bar(22, 76, 76, 8, .8, '#5fd08a')}${txt('4 / 5', 60, 112, 10, '#9ab4c8', '#141a20', 2)}`,
    'lp-saved': () => { const g = U('rpg'); return `${bg('#1a0e1a', '#3a1a34', '#ff9ac8')}${D.hex('#ffc8e0', .04)}<defs><radialGradient id="${g}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffd0e4"/><stop offset=".6" stop-color="#ff8ab8"/><stop offset="1" stop-color="#b8487a"/></radialGradient></defs>
      ${D.shadow(56, 104, 36)}<g transform="translate(56 74)"><ellipse rx="38" ry="28" fill="url(#${g})" stroke="#6a1a3a" stroke-width="2.4"/><ellipse cx="-38" cy="2" rx="8" ry="10" fill="#ff9ac8" stroke="#6a1a3a" stroke-width="2"/><circle cx="-40" cy="0" r="1.6" fill="#6a1a3a"/><circle cx="-36" cy="4" r="1.6" fill="#6a1a3a"/>
      <path d="M-18 -24 L-12 -36 L-6 -26" fill="#ff8ab8" stroke="#6a1a3a" stroke-width="2" stroke-linejoin="round"/><circle cx="-22" cy="-10" r="2.6" fill="#1a1410"/>${[-22, 18].map(x => `<rect x="${x}" y="22" width="9" height="12" rx="2" fill="#e87aa8" stroke="#6a1a3a" stroke-width="1.6"/>`).join('')}
      <rect x="-6" y="-29" width="18" height="4" rx="2" fill="#6a1a3a"/><path d="M-26 -14 C-18 -24 4 -26 14 -22" stroke="#fff" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/>${txt('LP', 6, 8, 14, '#fff', '#6a1a3a', 2)}</g>
      <g transform="translate(59 26)">${coin(0, 0, 10)}${txt('+', 0, 4, 11, '#6a4508', 'none', 0)}</g><path d="M59 38 V44" stroke="#ffe46b" stroke-width="1.4" stroke-dasharray="2 2"/>`; },
    'autofill': () => `${bg('#0e1a20', '#1e3440')}<rect x="14" y="22" width="92" height="56" rx="8" fill="#3a2a0a" stroke="#c8a96e" stroke-width="3"/>${['top', 'support', 'jungle'].map((k, i) => `<rect x="${20 + i * 28}" y="28" width="24" height="44" rx="4" fill="#061218"/>${roleIcon(k, 32 + i * 28, 50, .72, i === 1 ? '#ff9ac8' : '#9ab4c8')}`).join('')}
      <path d="M14 50 H106" stroke="#ffd36b" stroke-width="1" opacity=".6"/><path d="M108 32 V58" stroke="#5a3a1a" stroke-width="3"/><circle cx="108" cy="30" r="5" fill="#c8283a" stroke="#4a0610" stroke-width="1.4"/>
      ${txt('AUTOFILLED', 60, 100, 11, '#ffd36b', '#0e1a20', 2.4)}${txt('?', 104, 112, 10, '#9ab4c8', 'none', 0)}`,
    'role-select': () => `${bg('#08202a', '#123c48')}${D.hex('#9affec', .05)}${['top', 'jungle', 'mid', 'bot', 'support'].map((k, i) => roleIcon(k, 16 + i * 22, 54, .7, '#8ab4b8', i === 2)).join('')}
      <path d="M58 74 L58 94 L63 89 L67 98 L71 96 L67 87 L74 87 Z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/>${txt('PICK ROLE', 60, 30, 10, '#e8fff8', '#08202a', 2)}`,
    'break-time': () => `${bg('#1a1424', '#2e2440')}<rect x="0" y="86" width="120" height="34" fill="#3a2a4a"/><path d="M6 92 C6 80 50 78 64 86 C78 78 114 80 114 92 V104 H6 Z" fill="#8a5a8a" stroke="#3a1a3a" stroke-width="2"/>
      ${pony({ x: 18, y: 38, s: .48, eye: 'closed', body: '#e8c48c' })}${mug(98, 76, .6, '#5fd0b0')}${txt('z', 74, 40, 10, '#d8c8ff', '#1a1424', 2)}${txt('Z', 84, 28, 13, '#d8c8ff', '#1a1424', 2)}${txt('Z', 98, 16, 16, '#d8c8ff', '#1a1424', 2.4)}`,
    'vod-review': () => `${bg('#0a141c', '#16283a')}${screen(10, 14, 100, 64, '#1a3a24')}<path d="M10 54 Q40 40 60 54 T110 46" stroke="#c8a96e" stroke-width="5" fill="none" opacity=".6"/>
      <circle cx="40" cy="38" r="9" fill="none" stroke="#e83a4a" stroke-width="2"/><path d="M50 30 L76 24" stroke="#e83a4a" stroke-width="1.6"/>${txt('why?', 86, 24, 8, '#ff9aa0', 'none', 0)}
      <path d="M54 52 L68 60 L54 68 Z" fill="#fff" opacity=".85"/><rect x="10" y="84" width="100" height="5" rx="2.5" fill="#2a3a4a"/><rect x="10" y="84" width="56" height="5" rx="2.5" fill="#e83a4a"/><circle cx="66" cy="86.5" r="4" fill="#fff"/>
      <rect x="14" y="96" width="44" height="20" rx="2" fill="#f6efe2" stroke="#8a7a5a" stroke-width="1"/><path d="M18 102 H52 M18 107 H46 M18 112 H50" stroke="#8a9ab8" stroke-width="1"/>${txt('14:32', 96, 108, 9, '#9ab4c8', '#0a141c', 2)}`,
    'new-goal': () => `${bg('#08202a', '#14404a', '#ffd36b')}<path d="M0 120 V96 Q40 82 74 92 T120 90 V120 Z" fill="#0a3a2a"/>
      <g transform="translate(46 60)">${[30, 22, 14, 6].map((r, i) => `<circle r="${r}" fill="${i % 2 ? '#f6efe2' : '#c8283a'}" stroke="#4a0610" stroke-width="1.4"/>`).join('')}</g>
      <g transform="translate(46 60) rotate(-30)"><path d="M0 0 H44" stroke="#5a3a1a" stroke-width="3"/><path d="M34 0 L40 -6 H46 L40 0 L46 6 H40 Z" fill="#ffd36b" stroke="#6a4508" stroke-width=".8"/></g>
      <path d="M96 92 V30" stroke="#5a3a1a" stroke-width="2.4"/><path d="M96 30 H116 L110 38 L116 46 H96 Z" fill="#3ab8a8" stroke="#0a3e3a" stroke-width="1.4"/>${txt('GOAL', 60, 112, 11, '#ffe46b', '#08202a', 2.4)}`,
    'rank-border': () => { const g = U('rrb'); return `${bg('#0a1420', '#16283e', '#6bc8ff')}<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".5" stop-color="#f2c94c"/><stop offset="1" stop-color="#6a4508"/></linearGradient></defs>
      ${crystals(3, 30, '#9ae4ff', '#1a4a8a').replace(/<g transform="scale/g, '<g transform="translate(60 58) scale')}
      <circle cx="60" cy="58" r="36" fill="#0e2a44"/><circle cx="60" cy="58" r="36" fill="none" stroke="url(#${g})" stroke-width="7"/><circle cx="60" cy="58" r="31" fill="none" stroke="#6bc8ff" stroke-width="1.4"/>
      <clipPath id="${g}c"><circle cx="60" cy="58" r="31"/></clipPath><g clip-path="url(#${g}c)">${pony({ x: 30, y: 30, s: .6, eye: 'happy' })}</g>
      ${crown(60, 18, .3, ['#6bc8ff', '#ffd36b', '#6bc8ff', '#ffd36b', '#6bc8ff'])}<rect x="38" y="90" width="44" height="13" rx="6" fill="#0e2a44" stroke="url(#${g})" stroke-width="2.4"/>${txt('427', 60, 100, 9, '#fff6c8', 'none', 0)}`; },
    'split-reset': () => `${bg('#0a1e24', '#16363e')}<path d="M60 18 A40 40 0 1 1 22 46" stroke="#3ab8a8" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M14 40 L22 50 L30 38 Z" fill="#3ab8a8" stroke="#0a3e3a" stroke-width="1.2" stroke-linejoin="round"/>
      <g transform="translate(60 60)"><rect x="-24" y="-22" width="48" height="46" rx="4" fill="#f6efe2" stroke="#2a3a40" stroke-width="2"/><rect x="-24" y="-22" width="48" height="12" rx="4" fill="#c8283a"/><rect x="-24" y="-14" width="48" height="4" fill="#c8283a"/>${[-14, 14].map(x => `<rect x="${x - 2}" y="-27" width="4" height="9" rx="2" fill="#2a3a40"/>`).join('')}
      ${txt('1', 0, 16, 22, '#2a3a40', 'none', 0)}</g>${txt('SPLIT 2', 60, 114, 10, '#c8fff4', '#0a1e24', 2.2)}`,
    'leaderboard': () => `${bg('#0e1420', '#1e2a40')}${[['#ffd36b', '#5a3a06'], ['#d8e0ee', '#3a4250'], ['#d8946a', '#4a2008'], ['#3a5a64', '#0e1a20'], ['#3a5a64', '#0e1a20']].map(([c, c2], i) => `<g transform="translate(0 ${12 + i * 20})"><rect x="8" y="0" width="104" height="17" rx="3" fill="${i ? '#16283a' : '#3a2a0a'}" stroke="${i ? '#2e4a5a' : '#ffd36b'}" stroke-width="${i ? 1 : 1.8}"/><circle cx="19" cy="8.5" r="6" fill="${c}" stroke="${c2}" stroke-width="1.2"/>${txt(String(i + 1), 19, 11.4, 7.5, c2, 'none', 0)}<rect x="30" y="5" width="${i ? 44 - i * 4 : 22}" height="3" rx="1.5" fill="${i ? '#4a6a7a' : '#ffe9a0'}"/><rect x="30" y="10" width="${26 - i * 2}" height="2.4" rx="1.2" fill="#2e4a5a"/>${txt(String(1480 - i * 87), 106, 12, 7.5, i ? '#9ab4c8' : '#ffe46b', 'none', 0, 'end')}</g>`).join('')}
      ${pony({ x: 56, y: 12, s: .17, eye: 'happy' })}`,
    'coinflip-game': () => { const g = U('rcf'); return `${bg('#141a24', '#262e40')}${D.grid('#9ab4c8', .04)}<path d="M18 104 C24 60 40 36 60 30" stroke="#fff" stroke-width="1.4" stroke-dasharray="3 3" fill="none" opacity=".5"/>
      <defs><radialGradient id="${g}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#e2b23c"/><stop offset="1" stop-color="#8a5a10"/></radialGradient></defs>
      <g transform="translate(64 46) rotate(-14)"><ellipse rx="26" ry="10" fill="#8a5a10" transform="translate(0 4)"/><ellipse rx="26" ry="22" fill="url(#${g})" stroke="#6a4508" stroke-width="2"/><ellipse rx="19" ry="16" fill="none" stroke="#9a6a12" stroke-width="1.4"/>${txt('W', 0, 7, 20, '#fff6c8', '#6a4508', 2)}</g>
      ${[[22, 20], [100, 24], [104, 70]].map(([x, y]) => spark(x, y, .5, .8, '', '#ffe46b')).join('')}${D.shadow(60, 104, 22)}${txt('50 / 50', 60, 96, 13, '#e8eef8', '#141a24', 2.4)}`; },
    'carry-me': () => `${bg('#0a1e24', '#16404a')}${D.hex('#9affec', .04)}${D.shadow(56, 106, 30)}
      ${pony({ x: 14, y: 40, s: .66, eye: 'angry', extra: '<path d="M30 24 C46 18 70 20 90 30 L88 38 C70 28 48 28 32 32 Z" fill="#3ab8a8" stroke="#0a3e3a" stroke-width="1.8"/>' })}
      ${pony({ x: 40, y: 22, s: .26, eye: 'happy', body: '#f6efe2', shade: '#c8b89a', mane: '#ff9ac8' })}${txt('CARRY ME', 60, 16, 10, '#ffe46b', '#0a1e24', 2.2)}${sparks([[100, 40, .4]], '', '#fff2b0')}`,
    'next-game': () => `${bg('#08202a', '#14404a', '#ffd36b')}${D.beams('#ffe9b0', .05)}${pony({ x: 4, y: 26, s: .5, eye: 'angry' })}
      <g transform="translate(76 74)"><rect x="-34" y="-14" width="68" height="28" rx="8" fill="#1a0e04" transform="translate(0 3)" opacity=".5"/><rect x="-34" y="-14" width="68" height="28" rx="8" fill="#3ab8a8" stroke="#ffd36b" stroke-width="2.6"/><rect x="-31" y="-11" width="62" height="9" rx="4" fill="#fff" opacity=".25"/>${txt('PLAY', 0, 6, 15, '#fff', '#0a3e3a', 2.4)}</g>
      <path d="M96 84 L96 104 L101 99 L105 108 L109 106 L105 97 L112 97 Z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/>${txt('ONE MORE', 76, 40, 10, '#ffe46b', '#08202a', 2.2)}`
  };

  // Hologramm-Figuren der Animated Rares (eigene Ebene, schwebt ueber der Karte)
  const POP = {
    'challenger': () => `<g class="a-float">${emblem('challenger', 86, 46, .5, true)}${pony({ x: 4, y: 26, s: .64, eye: 'star', body: '#fff6e0', shade: '#d8b46a', mane: '#6bc8ff', extra: ACC.crown() + ACC.cape('#2a7ad8', '#ffd36b') })}</g>`,
    'promoted': () => `<g class="a-float">${bigArrow(24, 62, 1.05, '#ffd36b', '#6a4508')}${pony({ x: 30, y: 22, s: .62, eye: 'star', body: '#f0d4a0', shade: '#c09040', mane: '#3ab8a8' })}</g>`,
    'season-end': () => `<g class="a-float">${pony({ x: 2, y: 30, s: .58, eye: 'happy', extra: ACC.laurel('#5fd08a', '#0a4a24') })}${trophy(90, 70, 1.25, '#ffd36b', true)}</g>`
  };

  // ---------- Full Arts (Nutzerwahl 2026-11-10: #1, 3, 9, 17, 18, 22, 27, 38, 48, 49) ----------
  // Szene 120x168 (Hochformat, randlos), Mittelebene schwebt auf ~45 % Hoehe, bewegte
  // FX-Ebene auf ~65 %, Hologramm-Figur (120x120) liegt oben auf der Karte (left/right 4 %, top 7 %).
  // In Mittelebene und Figur keine Leuchtflecke (glow) - die wuerden in den Schichten mitwachsen.
  const fbg = (top, mid, bottom) => { const a = U('rfb'); return `<defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="120" height="168" fill="url(#${a})"/>`; };
  const fvig = (op = .5) => { const v = U('rfv'); return `<defs><radialGradient id="${v}" cx=".5" cy=".42" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${op}"/></radialGradient></defs><rect width="120" height="168" fill="url(#${v})"/>`; };
  const fmotes = (c = '#fff', n = 12) => [...Array(n)].map((_, i) => `<circle cx="${(i * 37 + 11) % 112 + 4}" cy="${(i * 53 + 7) % 150 + 6}" r="${.7 + (i % 3) * .45}" fill="${c}" opacity="${.35 + (i % 4) * .12}"/>`).join('');
  const fstars = (c = '#fff', n = 24, h = 90) => [...Array(n)].map((_, i) => `<circle cx="${(i * 47 + 9) % 116 + 2}" cy="${(i * 29 + 5) % h + 3}" r="${.45 + (i % 3) * .35}" fill="${c}" opacity="${.4 + (i % 3) * .2}"/>`).join('');
  // Regen (schraege Striche)
  const frain = (c = '#8aa8d8', n = 30, op = .5) => [...Array(n)].map((_, i) => `<path d="M${(i * 41 + 7) % 124} ${(i * 67 + 3) % 160} l-3 9" stroke="${c}" stroke-width="1.2" stroke-linecap="round" opacity="${op}"/>`).join('');
  // Warnstreifen-Band
  const hazard = (y, h = 10) => { const p = U('rhz'); return `<defs><pattern id="${p}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="12" fill="#ffd36b"/><rect x="6" width="6" height="12" fill="#1a0a04"/></pattern></defs><rect y="${y}" width="120" height="${h}" fill="url(#${p})" opacity=".85"/><path d="M0 ${y} H120 M0 ${y + h} H120" stroke="#1a0a04" stroke-width="1.4"/>`; };
  const vote = (x, y, ok, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="9" fill="${ok ? '#1e6a3a' : '#5a1420'}" stroke="${ok ? '#9affb8' : '#ff9aa0'}" stroke-width="2"/><circle r="6.6" fill="none" stroke="#fff" stroke-opacity=".2"/><path d="${ok ? 'M-4.4 0 L-1.2 3.4 L4.6 -3.4' : 'M-3.6 -3.6 L3.6 3.6 M3.6 -3.6 L-3.6 3.6'}" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const chips = (x, y, n, c, c2) => [...Array(n)].map((_, i) => `<g transform="translate(${x} ${y - i * 4})"><ellipse rx="10" ry="4" fill="${c2}" transform="translate(0 1.6)"/><ellipse rx="10" ry="4" fill="${c}" stroke="${c2}" stroke-width="1"/><ellipse rx="6" ry="2.2" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 2" opacity=".7"/></g>`).join('');
  const bubble = (x, y, w, h, t, fs = 9) => `<g transform="translate(${x} ${y})"><path d="M${-w / 2} ${-h / 2} H${w / 2} V${h / 2} H${-w / 2 + 14} L${-w / 2 + 4} ${h / 2 + 8} L${-w / 2 + 8} ${h / 2} H${-w / 2} Z" fill="#000" opacity=".35" transform="translate(1.5 2.5)"/><path d="M${-w / 2} ${-h / 2} H${w / 2} V${h / 2} H${-w / 2 + 14} L${-w / 2 + 4} ${h / 2 + 8} L${-w / 2 + 8} ${h / 2} H${-w / 2} Z" fill="#fff6e0" stroke="#3a2a10" stroke-width="1.8" stroke-linejoin="round"/>${txt(t, 0, fs * .36, fs, '#3a2a10', 'none', 0)}</g>`;
  const bigCheck = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-16 0 L-5 11 L17 -13" stroke="#0a3a1a" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-16 0 L-5 11 L17 -13" stroke="#5fd08a" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-15 -1 L-6 8" stroke="#d8ffe4" stroke-width="2.4" stroke-linecap="round"/></g>`;
  const bigCoin = (x, y, r, t, cls = '') => { const g = U('rbc'); return `<g transform="translate(${x} ${y})"><g class="${cls}"><defs><radialGradient id="${g}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff6c8"/><stop offset=".55" stop-color="#e2b23c"/><stop offset="1" stop-color="#8a5a10"/></radialGradient></defs>
    <circle r="${r}" fill="#6a4508" transform="translate(0 2)"/><circle r="${r}" fill="url(#${g})" stroke="#6a4508" stroke-width="1.6"/><circle r="${r * .74}" fill="none" stroke="#9a6a12" stroke-width="1.2"/>${[...Array(16)].map((_, i) => { const a = i / 16 * Math.PI * 2; return `<circle cx="${(Math.cos(a) * r * .87).toFixed(1)}" cy="${(Math.sin(a) * r * .87).toFixed(1)}" r=".9" fill="#fff6c8" opacity=".8"/>`; }).join('')}
    ${txt(t, 0, r * .36, r * 1.05, '#fff6c8', '#6a4508', 2)}<path d="M${-r * .6} ${-r * .3} A${r * .7} ${r * .7} 0 0 1 ${-r * .1} ${-r * .68}" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7" stroke-linecap="round"/></g></g>`; };

  // Season-End-Feuerwerk: Leuchten in FA_ART, die Raketen selbst in FA_MID (3D)
  const SE_FW = [[18, 26, 16, '#ff7ad9', 0], [100, 20, 15, '#6bc8ff', 2], [62, 36, 11, '#ffd36b', 1], [28, 64, 10, '#5fd08a', 3], [96, 62, 12, '#ff9a5a', 1]];
  const FA_ART = {
    // #1 Challenger: Gipfel ueber dem Wolkenmeer, Polarlicht, riesiger Sternen-Halo
    'challenger': () => `${fbg('#02061c', '#0c2462', '#2a1a4a')}${fstars('#e2f2ff', 34, 110)}
      <path d="M-10 26 C24 6 54 48 130 14" stroke="#5affc8" stroke-width="16" fill="none" opacity=".14"/><path d="M-10 40 C30 22 70 60 130 30" stroke="#9a6aff" stroke-width="12" fill="none" opacity=".14"/><path d="M-10 26 C24 6 54 48 130 14" stroke="#c8fff0" stroke-width="1.4" fill="none" opacity=".35"/>
      ${glow(60, 74, 84, '#ffd36b', .32, 'a-pulse')}${rays(60, 74, '#ffe9a0', 24, .09, 170, 'a-spin')}
      <circle cx="60" cy="74" r="56" fill="none" stroke="#ffd36b" stroke-width="1.2" stroke-dasharray="1.5 4" opacity=".55"/><circle cx="60" cy="74" r="49" fill="none" stroke="#9ae4ff" stroke-width=".8" opacity=".4"/>
      <path d="M0 132 L14 116 L26 122 L40 104 L50 110 L58 98 L70 112 L84 102 L100 118 L120 108 V140 H0 Z" fill="#14285a" opacity=".85"/>
      ${[[14, 136, 1.4], [46, 140, 1.7], [86, 136, 1.5], [116, 140, 1.3]].map(([x, y, sc]) => cloud(x, y, sc, '#c8d8f4', .55)).join('')}
      <path d="M-4 168 V150 L22 140 L40 132 L54 122 L60 118 L66 122 L80 134 L100 142 L124 150 V168 Z" fill="#071232"/><path d="M54 122 L60 118 L66 122 L62 126 L58 124 Z M36 134 L40 132 L44 135 Z" fill="#e2f2ff"/>
      ${sparks([[12, 20, .8], [108, 24, 1], [16, 80, .5], [106, 70, .6], [60, 10, .7]], 'a-twinkle', '#fff2a8')}${fmotes('#cdf2ff', 10)}${fvig(.45)}`,
    // #3 Season End: Stadion bei Nacht, Feuerwerk, Scheinwerfer
    'season-end': () => `${fbg('#06021a', '#1e0a44', '#0a0418')}${fstars('#fff', 22, 70)}
      ${SE_FW.map(([x, y, r, c]) => glow(x, y, r * 1.8, c, .3)).join('')}
      ${[[-10, 168, 30], [130, 168, -30]].map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-6 0 L6 0 L26 -150 L-26 -150 Z" fill="#fff6c8" opacity=".09"/>`).join('')}
      <path d="M0 168 V112 Q60 92 120 112 V168 Z" fill="#160a30"/><path d="M0 112 Q60 92 120 112" stroke="#c8a96e" stroke-width="1.4" fill="none"/>
      ${[...Array(3)].map((_, r) => [...Array(16)].map((_, i) => `<circle cx="${i * 8 + (r % 2) * 4}" cy="${116 + r * 8 - Math.sin(i / 15 * Math.PI) * 6}" r="3" fill="${['#2a1a4a', '#241640', '#1e1238'][r]}"/>`).join('')).join('')}
      ${D.confetti(18, 'a-twinkle')}<g transform="translate(0 56)">${D.confetti(10, 'a-twinkle')}</g>${fmotes('#ffe9f4', 8)}${fvig(.5)}`,
    // #9 Win Streak: Feuerwand, Lava-Boden, Funken
    'win-streak': () => `${fbg('#1a0402', '#6e1c06', '#1e0602')}${glow(60, 90, 80, '#ff8a2a', .5, 'a-pulse')}${rays(60, 90, '#ffb46b', 18, .09, 170, 'a-spin')}
      ${[[8, 150, 1], [30, 156, .8], [56, 150, 1.1], [84, 156, .85], [110, 150, 1]].map(([x, y, sc]) => flame(x, y - 10, sc)).join('')}
      <path d="M0 168 V146 Q30 140 60 146 T120 144 V168 Z" fill="#2a0804"/><path d="M8 150 L22 156 L30 152 L46 160 M70 152 L84 158 L100 152 L114 160" stroke="#ff8a2a" stroke-width="1.8" fill="none" opacity=".85"/>
      ${[...Array(14)].map((_, i) => `<circle class="a-twinkle d${i % 4}" cx="${(i * 37 + 9) % 114 + 3}" cy="${(i * 53 + 11) % 120 + 6}" r="${1 + (i % 3) * .5}" fill="#ffd08a"/>`).join('')}${fvig(.5)}`,
    // #17 +28 LP: Sonnenaufgang ueber gruenen Huegeln, steigende Pfeile
    'lp-gain': () => `${fbg('#063a2a', '#2a8a5a', '#e8e08a')}${glow(60, 132, 70, '#fff2b0', .7)}<circle cx="60" cy="134" r="22" fill="#fff2c0"/>${rays(60, 134, '#fff6c8', 18, .1, 170, 'a-spin')}
      ${[[14, 70, .35], [104, 96, .3], [30, 30, .25], [96, 40, .22]].map(([x, y, sc]) => `<g opacity=".35">${bigArrow(x, y, sc, '#d8ffe4', '#2a8a5a')}</g>`).join('')}
      ${cloud(20, 46, 1, '#e8fff0', .45)}${cloud(100, 24, 1.2, '#e8fff0', .4)}
      <path d="M0 168 V138 Q30 126 60 136 T120 132 V168 Z" fill="#2a7a3a"/><path d="M0 168 V150 Q40 140 80 150 T120 146 V168 Z" fill="#1e5a2a"/>${[...Array(14)].map((_, i) => `<path d="M${4 + i * 8.4} ${152 + (i % 3)} l2 -${5 + (i % 4)} 2 ${5 + (i % 4)}" fill="#3a9a4a"/>`).join('')}
      ${fmotes('#ffffe0', 10)}${fvig(.35)}`,
    // #18 -22 LP: Spiegelbild - Gewitter bei Nacht, Regen, Pfuetze
    'lp-loss': () => `${fbg('#06020a', '#3a0a18', '#120208')}${glow(60, 132, 60, '#ff3a4a', .35, 'a-pulse')}
      ${[[20, 22, 1.9], [70, 14, 2.2], [112, 26, 1.7], [44, 38, 1.4]].map(([x, y, sc]) => cloud(x, y, sc, '#2a1a26', 1)).join('')}<path d="M90 30 L80 52 H90 L82 72" stroke="#ffe46b" stroke-width="2.4" fill="none" stroke-linejoin="round"/><path d="M90 30 L80 52 H90 L82 72" stroke="#fff" stroke-width=".8" fill="none"/>
      ${frain('#9ab4d8', 34, .45)}${[[18, 70, .35], [100, 100, .3]].map(([x, y, sc]) => `<g opacity=".3">${bigArrow(x, y, sc, '#ff9aa0', '#4a0610', 180)}</g>`).join('')}
      <path d="M0 168 V142 Q60 134 120 142 V168 Z" fill="#14040a"/><ellipse cx="60" cy="152" rx="40" ry="6" fill="#ff3a4a" opacity=".22"/>${[0, 1].map(i => `<ellipse cx="${40 + i * 40}" cy="${150 + i * 4}" rx="${8 - i * 2}" ry="1.6" fill="none" stroke="#ff9aa0" stroke-width=".8" opacity=".5"/>`).join('')}${fvig(.55)}`,
    // #22 Dodge Penalty: Alarm im Champ Select
    'dodge-penalty': () => `${fbg('#140206', '#3a0810', '#0a0204')}<g class="a-pulse" style="transform-origin:60px 80px">${glow(60, 80, 80, '#ff2a3a', .35)}</g>
      ${[...Array(4)].map((_, r) => [...Array(5)].map((_, c) => `<g opacity=".45">${portrait(6 + c * 22.4, 22 + r * 26, 19)}</g>`).join('')).join('')}
      ${[...Array(28)].map((_, i) => `<rect y="${i * 6}" width="120" height="1" fill="#000" opacity=".25"/>`).join('')}
      <rect x="${18}" y="58" width="44" height="3" fill="#ff5a6a" opacity=".5"/><rect x="66" y="96" width="38" height="2" fill="#9ae4ff" opacity=".4"/>${hazard(0, 10)}${hazard(150, 10)}${fvig(.55)}`,
    // #27 Solo Queue: ein Scheinwerfer in der leeren Arena
    'solo-queue': () => `${fbg('#02080a', '#0a1c22', '#040a0c')}
      ${[...Array(3)].map((_, r) => [...Array(10)].map((_, i) => `<path d="M${i * 13 - 2 + (r % 2) * 6} ${40 + r * 14} v-8 a5 5 0 0 1 10 0 v8 Z" fill="${['#0e2228', '#0c1e24', '#0a1a20'][r]}"/>`).join('')).join('')}
      <path d="M46 -4 L74 -4 L112 146 L8 146 Z" fill="#fff6c8" opacity=".1"/><path d="M54 -4 L66 -4 L92 146 L28 146 Z" fill="#fff6c8" opacity=".07"/>
      <path d="M0 168 V134 H120 V168 Z" fill="#0a1418"/><path d="M0 134 H120" stroke="#2a4048" stroke-width="1.4"/><ellipse cx="60" cy="146" rx="52" ry="11" fill="#fff6c8" opacity=".16"/><ellipse cx="60" cy="146" rx="34" ry="6" fill="#fff6c8" opacity=".14"/>
      ${[...Array(12)].map((_, i) => `<circle cx="${30 + (i * 23) % 60}" cy="${(i * 37) % 130 + 8}" r="${.6 + (i % 3) * .4}" fill="#fff6c8" opacity="${.3 + (i % 3) * .15}"/>`).join('')}${fvig(.6)}`,
    // #38 Remake: verschwommene Karte, Verbindung weg
    'remake': () => `${fbg('#0a1418', '#14303a', '#0a1014')}
      <g opacity=".5"><rect x="-4" y="20" width="128" height="128" fill="#1e4a2a"/><path d="M8 140 L8 30 L112 30 M8 140 L112 30 M8 140 L112 140 L112 30" stroke="#8a7a5a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M0 148 C40 110 80 70 124 26" stroke="#2a6aa8" stroke-width="14" fill="none"/></g>
      <rect width="120" height="168" fill="#06101a" opacity=".55"/>
      <g transform="translate(96 46)" opacity=".8">${[22, 15, 8].map((r, i) => `<path d="M${-r * .7} ${-r * .7 + 10} A${r} ${r} 0 0 1 ${r * .7} ${-r * .7 + 10}" stroke="${i ? '#9ab4c8' : '#5a6a7a'}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}<circle cy="10" r="2.6" fill="#9ab4c8"/><path d="M-14 -10 L14 18" stroke="#e83a4a" stroke-width="3" stroke-linecap="round"/></g>
      ${fmotes('#9ab4c8', 8)}${fvig(.55)}`,
    // #48 Coinflip Game: Spieltisch mit Filz und Goldrand
    'coinflip-game': () => `${fbg('#020a06', '#0a3a20', '#04140a')}${glow(60, 40, 60, '#fff2b0', .25)}<path d="M42 -4 L78 -4 L104 120 L16 120 Z" fill="#fff6c8" opacity=".06"/>
      <path d="M-10 168 V96 Q60 70 130 96 V168 Z" fill="#0e4a2a"/><path d="M-10 96 Q60 70 130 96" stroke="#c8a96e" stroke-width="3" fill="none"/><path d="M-10 100 Q60 74 130 100" stroke="#6a4a18" stroke-width="1.2" fill="none"/>
      ${D.hatch('#9affb8', .04)}${[['&#9824;', 20, 120], ['&#9829;', 100, 116], ['&#9830;', 30, 150], ['&#9827;', 92, 150]].map(([c, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#2a7a4a" opacity=".6">${c}</text>`).join('')}
      <path d="M24 30 C30 12 46 6 60 10" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity=".4"/><path d="M96 30 C90 12 74 6 60 10" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity=".4"/>${fmotes('#ffe9b0', 8)}${fvig(.55)}`,
    // #49 Carry Me: Sonnenaufgang ueber dem Schlachtfeld, Weg zum Gipfel
    'carry-me': () => `${fbg('#1a2a5a', '#e2845a', '#3a1a10')}${glow(60, 92, 60, '#ffe0a0', .7)}<circle cx="60" cy="94" r="18" fill="#fff0c0"/>${rays(60, 94, '#fff2c8', 16, .1, 160, 'a-spin')}
      ${cloud(18, 40, 1.1, '#ffc8a8', .5)}${cloud(102, 30, 1.3, '#ffc8a8', .45)}
      <path d="M0 120 L20 100 L34 108 L52 90 L66 100 L82 88 L100 104 L120 96 V168 H0 Z" fill="#5a2a3a"/><path d="M0 140 Q30 122 60 132 T120 126 V168 H0 Z" fill="#3a1a1e"/>
      <path d="M48 168 C52 150 58 140 62 130 C64 140 70 152 76 168 Z" fill="#7a4a2a"/>
      ${[[12, 128, '#3a7ad8'], [108, 124, '#d83a4a']].map(([x, y, c]) => `<path d="M${x} ${y} v-20" stroke="#2a1408" stroke-width="1.6"/><path d="M${x} ${y - 20} h10 l-3 4 3 4 h-10" fill="${c}"/>`).join('')}${fmotes('#fff2c8', 10)}${fvig(.4)}`
  };
  // Mittlere Ebene: Teile der Szene schweben zwischen Szene und Figur
  const FA_MID = {
    'challenger': () => `<path d="M104 140 V86" stroke="#4a3008" stroke-width="2.4"/><path d="M104 88 H124 L118 96 L124 104 H104 Z" fill="#2a7ad8" stroke="#0a2a5a" stroke-width="1.2"/><path d="M104 88 H124" stroke="#ffd36b" stroke-width="2"/><circle cx="104" cy="85" r="2.4" fill="#ffd36b"/>
      ${[[12, 96, 20], [22, 120, -14], [8, 132, 34]].map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0 -9 L5 -2 L0 10 L-5 -2 Z" fill="#9ae4ff" stroke="#e2f2ff" stroke-width="1"/>`).join('')}`,
    // (Nutzer) Feuerwerk eine Ebene nach vorn (3D) - Leuchten bleibt in der Szene
    'season-end': () => `${SE_FW.map(([x, y, r, c, d]) => burst(x, y, r * 1.12, c, `a-pulse d${d}`)).join('')}${[[8, 30, 112, '2', '#d8e0ee'], [38, 44, 102, '1', '#ffd36b'], [82, 30, 116, '3', '#d8946a']].map(([x, w, y, n, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${132 - y}" fill="#2a1a4a" stroke="#c8a96e" stroke-width="1.6"/><rect x="${x}" y="${y}" width="${w}" height="4" fill="${c}"/>${txt(n, x + w / 2, y + 16, 11, c, '#160a30', 2)}`).join('')}`,
    'win-streak': () => `${[[14, 40], [34, 26], [60, 20], [86, 26], [106, 40]].map(([x, y]) => wl(x, y, true, 17)).join('')}${txt('x5', 104, 134, 16, '#ffe46b', '#3a0a04', 3)}`,
    'lp-gain': () => `${txt('+28', 82, 48, 30, '#b8ffd0', '#06301a', 3.6)}${txt('LP', 98, 66, 15, '#e8fff0', '#06301a', 3)}${bigArrow(18, 130, .45, '#5fd08a', '#0a4a24')}${bigArrow(104, 120, .38, '#5fd08a', '#0a4a24')}`,
    'lp-loss': () => `${txt('-22', 38, 48, 30, '#ff8a96', '#1a0408', 3.6)}${txt('LP', 22, 66, 15, '#ffd0d4', '#1a0408', 3)}${bigArrow(102, 130, .45, '#e83a4a', '#4a0610', 180)}${bigArrow(16, 120, .38, '#e83a4a', '#4a0610', 180)}`,
    'dodge-penalty': () => `<g transform="translate(96 32)"><circle r="15" fill="#c8283a" stroke="#fff" stroke-width="2.6"/><path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/></g>${txt('5:00', 96, 64, 14, '#ffb0b0', '#200606', 2.6)}${txt('-5 LP', 24, 128, 11, '#ff7a8a', '#200606', 2.4)}`,
    'solo-queue': () => `${[[4, 30], [96, 26], [2, 100], [98, 104]].map(([x, y]) => `<rect x="${x}" y="${y}" width="20" height="20" rx="3" fill="#0e1e24" stroke="#3a5058" stroke-width="1.2" stroke-dasharray="3 2"/><path d="M${x + 7} ${y + 7} l6 6 M${x + 13} ${y + 7} l-6 6" stroke="#3a5058" stroke-width="1.4"/>`).join('')}${txt('1 / 1', 60, 128, 10, '#c8a96e', '#02080a', 2.4)}`,
    'remake': () => `${txt('REMAKE?', 60, 24, 16, '#e8eef8', '#06101a', 3)}${[1, 1, 1, 1, 0].map((v, i) => vote(20 + i * 20, 124, v)).join('')}`,
    'coinflip-game': () => `${chips(14, 140, 4, '#3a8ad8', '#123a6a')}${chips(106, 140, 3, '#d83a4a', '#5a1420')}${txt('W', 14, 120, 9, '#9ae4ff', '#04140a', 2)}${txt('L', 106, 124, 9, '#ff9aa0', '#04140a', 2)}`,
    'carry-me': () => `${minion(14, 140, '#3a7ad8', 1)}${minion(108, 138, '#d83a4a', 1)}${bubble(88, 20, 58, 16, 'CARRY ME!', 7.4)}`
  };
  // Bewegte 3D-Ebene (ein flaches Blatt ohne Kanten-Schichten): dreht/pulsiert scharf
  const FA_FX = {
    // Sternenkranz um den Gipfel
    'challenger': () => `<g class="a-spin" style="transform-origin:60px 74px; animation-duration: 16s">${[...Array(10)].map((_, i) => { const a = i / 10 * Math.PI * 2; return spark((60 + Math.cos(a) * 54).toFixed(1), (74 + Math.sin(a) * 54).toFixed(1), i % 2 ? .45 : .7, .95, '', i % 2 ? '#9ae4ff' : '#fff2a8'); }).join('')}</g>`,
    // aufsteigende Glut
    'win-streak': () => `${[[18, 70], [104, 64], [30, 112], [92, 118], [60, 8], [10, 30]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><path class="a-twinkle d${i % 4}" d="M0 -5 C3 -2 3 2 0 5 C-3 2 -3 -2 0 -5 Z" fill="#ffb43a"/></g>`).join('')}`,
    // Alarmlicht oben (kreisender Lichtkegel)
    'dodge-penalty': () => { const c = U('rcl'); return `<defs><clipPath id="${c}"><rect width="120" height="168" rx="8"/></clipPath></defs><g clip-path="url(#${c})"><g class="a-spin" style="transform-origin:60px 16px; animation-duration: 2.2s"><path d="M60 16 L4 -10 L4 42 Z" fill="#ff3a4a" opacity=".22"/><path d="M60 16 L116 42 L116 -10 Z" fill="#ff3a4a" opacity=".22"/></g></g><rect x="52" y="10" width="16" height="10" rx="5" fill="#e8202e" stroke="#fff" stroke-width="1.2"/><rect x="55" y="12" width="5" height="3" rx="1.5" fill="#fff" opacity=".7"/>`; },
    // Muenze dreht sich ueber dem Tisch
    'coinflip-game': () => bigCoin(60, 26, 15, 'W', 'rc-flip')
  };
  // Hologramm-Figuren (120x120)
  const FA_POP = {
    'challenger': () => `<g class="a-float">${emblem('challenger', 92, 30, .5, true)}${pony({ x: 0, y: 28, s: .72, eye: 'star', body: '#fff6e0', shade: '#d8b46a', mane: '#6bc8ff', extra: ACC.crown() + ACC.cape('#2a7ad8', '#ffd36b') })}</g>`,
    'season-end': () => `<g class="a-float">${pony({ x: 0, y: 26, s: .62, eye: 'happy', extra: ACC.laurel('#5fd08a', '#0a4a24') })}${trophy(92, 66, 1.4, '#ffd36b', true)}</g>`,
    'win-streak': () => `<g class="a-float">${flame(62, 56, 1.15)}${pony({ x: 14, y: 30, s: .7, eye: 'angry', body: '#f0d4a0', shade: '#c08838', mane: '#ff5a1e', extra: '<path d="M30 22 C44 16 70 18 90 28 L88 36 C70 26 48 26 32 30 Z" fill="#ffd36b" stroke="#6a4a08" stroke-width="1.6"/>' })}</g>`,
    'lp-gain': () => `<g class="a-float">${pony({ x: -4, y: 40, s: .66, flip: true, eye: 'happy' })}${sparks([[20, 34, .7], [34, 22, .5], [8, 50, .45]], '', '#fff6c8')}</g>`,
    'lp-loss': () => `<g class="a-float">${pony({ x: 58, y: 40, s: .66, eye: 'tired', extra: ACC.sweat() })}${cloud(96, 30, .8, '#4a3a4a', 1)}<path d="M90 38 l-2 6 M98 38 l-2 6 M104 37 l-2 6" stroke="#9ab4d8" stroke-width="1.6" stroke-linecap="round"/></g>`,
    'dodge-penalty': () => `<g class="a-float">${pony({ x: 4, y: 30, s: .66, eye: 'wide', extra: ACC.sweat() })}<path d="M80 88 h14 M82 98 h18 M80 108 h12" stroke="#ffb0b0" stroke-width="3" stroke-linecap="round"/></g>`,
    'solo-queue': () => `<g class="a-float">${pony({ x: 18, y: 26, s: .7, eye: 'angry', extra: ACC.headset() })}</g>`,
    'remake': () => `<g class="a-float">${pony({ x: 0, y: 36, s: .62, eye: 'happy' })}${bigCheck(92, 52, 1.3)}</g>`,
    'coinflip-game': () => `<g class="a-float">${pony({ x: 20, y: 40, s: .64, eye: 'wide', extra: ACC.sweat() })}</g>`,
    'carry-me': () => `<g class="a-float">${pony({ x: 4, y: 40, s: .7, eye: 'angry', extra: '<path d="M30 24 C46 18 70 20 90 30 L88 38 C70 28 48 28 32 32 Z" fill="#3ab8a8" stroke="#0a3e3a" stroke-width="1.8"/>' })}${pony({ x: 32, y: 20, s: .28, eye: 'happy', body: '#f6efe2', shade: '#c8b89a', mane: '#ff9ac8' })}</g>`
  };

  const LIST = [
    ['challenger', 'Challenger'], ['promoted', 'Promoted!'], ['season-end', 'Season End'],
    ['grandmaster', 'Grandmaster'], ['master', 'Master'], ['diamond', 'Diamond'], ['emerald', 'Emerald'], ['platinum', 'Platinum'], ['win-streak', 'Win Streak'], ['victorious', 'Victorious'],
    ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze'], ['iron', 'Iron'], ['tier-up', 'Tier Up'], ['demotion-shield', 'Demotion Shield'], ['lp-gain', '+28 LP'], ['lp-loss', '-22 LP'],
    ['placements', 'Placements'], ['hidden-mmr', 'Hidden MMR'], ['decay', 'Decay'], ['dodge-penalty', 'Dodge Penalty'], ['loss-streak', 'Loss Streak'], ['hardstuck', 'Hardstuck'], ['the-ladder', 'The Ladder'],
    ['ranked-queue', 'Ranked Queue'], ['solo-queue', 'Solo Queue'], ['flex-queue', 'Flex Queue'], ['lp-bar', 'LP Bar'], ['division-four', 'Division IV'], ['division-one', 'Division I'], ['one-trick', 'One-Trick'], ['mastery-badge', 'Mastery Badge'], ['match-history', 'Match History'],
    ['profile-stalking', 'Profile Stalking'], ['alt-account', 'Alt Account'], ['night-grind', 'Night Grind'], ['remake', 'Remake'], ['lp-saved', 'LP Saved'], ['autofill', 'Autofill'], ['role-select', 'Role Select'], ['break-time', 'Break Time'],
    ['vod-review', 'VOD Review'], ['new-goal', 'New Goal'], ['rank-border', 'Rank Border'], ['split-reset', 'Split Reset'], ['leaderboard', 'Leaderboard'], ['coinflip-game', 'Coinflip Game'], ['carry-me', 'Carry Me'], ['next-game', 'Next Game']
  ];
  const rarityOf = n => n <= 3 ? 'anim' : n <= 10 ? 'holo' : n <= 25 ? 'uncommon' : 'common';
  const SET = LIST.map(([id, name], i) => ({ n: i + 1, id, name, r: rarityOf(i + 1) }));
  const { RL, RC } = B;

  // Karten-Front in Set-Farbe: dunkles Petrol mit Gold-Akzenten; die Raritaet zeigen
  // Rahmen, Effekte und Text (Rahmen-Verlaeufe wie im Base Set)
  const css = document.createElement('style');
  css.textContent = `
  .stk-front.rc.r-common { background: linear-gradient(160deg, #0e3a40, #04161a) padding-box, linear-gradient(135deg, #e6ecf5, #7a8496 45%, #d8dee8 70%, #6a7486) border-box; }
  .stk-front.rc.r-common .name { color: #f2e2b0; }
  .stk-front.rc.r-uncommon { background: radial-gradient(circle at 50% 35%, #12464a, #04161a 70%) padding-box, linear-gradient(135deg, #b8ffd8, #2a8a4a 40%, #8affc0 65%, #1e6a3a) border-box; }
  .stk-front.rc.r-holo { background: linear-gradient(160deg, #104448, #03141a) padding-box, linear-gradient(var(--hb, 0deg), #ff7ad9, #ffd36b, #7bffb4, #6bc8ff, #b98cff, #ff7ad9) border-box; }
  .stk-front.rc.r-anim { background: radial-gradient(circle at 50% 30%, #145a5a, #03141a 70%) padding-box, linear-gradient(var(--hb, 0deg), #ffd36b, #6bc8ff, #ffd36b, #3ab8a8, #ffd36b) border-box; }
  .stk-front.rc .meta { color: #c8a96e; }
  /* Muenzwurf der Coinflip-FA: Muenze dreht sich um die senkrechte Achse */
  .rc-flip { animation: rcFlip 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes rcFlip { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(.06); } }
  html.fx-off .rc-flip, html.fx-paused .rc-flip { animation-play-state: paused; }`;
  document.head.appendChild(css);
  const art = id => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${ART[id]()}</svg>`;
  const popLayers = id => B.popLayersOf(POP[id]);
  const frontHtml = s => `<div class="stk-face stk-front rc r-${s.r}" style="--rc:${RC[s.r]}">
      <div class="art">${art(s.id)}</div>
      ${POP[s.id] ? popLayers(s.id) : ''}
      <div class="name">${s.name}</div>
      <div class="meta"><span class="rar">${RL[s.r]}</span><span>#${String(s.n).padStart(3, '0')}</span></div>
    </div>`;
  const square = s => `<div class="stk-square r-${s.r}">${art(s.id)}${POP[s.id] ? `<div class="stk-sq-pop"><svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${POP[s.id]()}</svg></div>` : ''}</div>`;
  const square3d = s => POP[s.id] ? `<div class="stk-sq3d r-${s.r}"><div class="stk-square r-${s.r}">${art(s.id)}</div>${popLayers(s.id)}</div>` : square(s);
  // Full Arts: Szene (Hochformat), Mittelebene + Hologramm-Figur mit Schichten, flache Varianten
  const faArt = id => FA_ART[id] ? `<svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${FA_ART[id]()}</svg>` : '';
  const faPop = id => FA_POP[id] ? B.popLayersOf(FA_POP[id]) : '';
  const MID_SLABS = 4;
  const faMid = id => {
    if (!FA_MID[id]) return '';
    const svg = FA_MID[id](), wrap = x => `<svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${x}</svg>`;
    let out = `<div class="fa-mid-shadow">${wrap(svg)}</div>`;
    for (let k = 0; k < MID_SLABS; k++) {
      const fl = U('rml');
      out += `<div class="fa-mid slab" style="--i:${k};--shade:${(.3 + k / MID_SLABS * .25).toFixed(2)}">${wrap(`<defs><filter id="${fl}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="1.1"/></filter></defs><g filter="url(#${fl})">${svg}</g>`)}</div>`;
    }
    return out + `<div class="fa-mid" style="--i:${MID_SLABS}">${wrap(svg)}</div>`;
  };
  const faFx = id => FA_FX[id] ? `<div class="fa-fx"><svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${FA_FX[id]()}</svg></div>` : '';
  const faMidFlat = id => FA_MID[id] ? `<svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${FA_MID[id]()}</svg>` : '';
  const faPopFlat = id => FA_POP[id] ? `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${FA_POP[id]()}</svg>` : '';
  window.STICKERS_RANKED = { id: 'ranked', name: 'Ranked Climb', SET, RL, RC, art, frontHtml, square, square3d, TOTAL: SET.length, faArt, faPop, faPopFlat, faMid, faMidFlat, faFx };
  window.STICKER_SETS = window.STICKER_SETS || {};
  window.STICKER_SETS.ranked = window.STICKERS_RANKED;
})();
