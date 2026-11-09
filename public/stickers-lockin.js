// Three-Trick-Pony - Set 2 "Lock In" (50 Sticker, regulaeres Set), v6.9.0.
// Thema (Nutzer 2026-11-09): das Pony in seinen Rollen (Magier, Tank, Assassine,
// Schuetze, Support, Jungler, Kaempfer) und die kleinen Momente einer Runde -
// eigene Motive, keine League-Figuren. Raritaeten wie das Base Set:
// #1-3 animated, #4-10 holo, #11-25 uncommon, #26-50 common.
// Laedt NACH stickers.js (nutzt dessen Karten-CSS, Neigung und Zeichen-Bausteine KIT).
(function () {
  const B = window.STICKERS, K = B.KIT;
  const { U, pony, bg, glow, rays, spark, sparks, dots, txt, sword, crown, flame, coin, bush, rune, ground, tower, minion } = K;

  // ---------- Rollen-Zubehoer (im Koordinatensystem des Pony-Kopfs, 0..100) ----------
  // Kopfschmuck (ueber dem Kopf) + Kragen/Schultern (unten am Hals) je Rolle
  const ACC = {
    mage: () => { const g = U('mh'); return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5ae0"/><stop offset="1" stop-color="#2a1670"/></linearGradient></defs>
      <path d="M26 20 L58 -40 Q62 -46 66 -40 L84 16 Z" fill="url(#${g})" stroke="#1a0e48" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M58 -38 Q66 -26 64 -10 M50 -20 Q54 -8 52 6" stroke="rgba(255,255,255,.22)" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M34 4 L80 6 L82 12 L32 12 Z" fill="#ffd36b" stroke="#8a5a08" stroke-width="1.2"/>${[40, 52, 64, 76].map(x => `<circle cx="${x}" cy="8.5" r="1.4" fill="#8a5a08"/>`).join('')}
      <ellipse cx="56" cy="17" rx="36" ry="7.5" fill="url(#${g})" stroke="#1a0e48" stroke-width="2.4"/><path d="M24 17 Q56 26 88 17" stroke="rgba(0,0,0,.3)" stroke-width="2" fill="none"/>
      <path d="M60 -16 l2 5 5 .4 -4 3.4 1.4 5 -4.4 -2.8 -4.4 2.8 1.4 -5 -4 -3.4 5 -.4 Z" fill="#ffe46b" stroke="#8a5a08" stroke-width=".6"/><circle cx="70" cy="-28" r="1.6" fill="#fff6c8"/><circle cx="48" cy="-4" r="1.2" fill="#fff6c8"/>
      <path d="M38 112 C40 92 52 84 70 86 C88 84 102 94 106 112 Z" fill="url(#${g})" stroke="#1a0e48" stroke-width="2"/><path d="M42 104 C50 92 60 90 70 92 C82 90 94 96 100 106" stroke="#ffd36b" stroke-width="2.6" fill="none"/>
      <path d="M70 92 l6 7 -6 7 -6 -7 Z" fill="#6bd8ff" stroke="#fff" stroke-width="1.2"/>`; },
    tank: () => { const g = U('tk'); return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8e0ee"/><stop offset=".5" stop-color="#8a96aa"/><stop offset="1" stop-color="#4a5466"/></linearGradient></defs>
      <path d="M60 -2 C64 -22 88 -22 94 -6 C84 -12 72 -6 64 4 Z" fill="#c0392b" stroke="#5a0a08" stroke-width="1.6"/><path d="M66 -6 C72 -14 82 -14 88 -9" stroke="#ff7a6a" stroke-width="1.6" fill="none"/>
      <path d="M26 30 C26 4 90 -2 92 34 L92 44 L76 40 L74 30 L44 30 L42 44 L34 44 Z" fill="url(#${g})" stroke="#2a3040" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M32 22 C40 10 70 6 86 18" stroke="rgba(255,255,255,.55)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M28 28 H90" stroke="#2a3040" stroke-width="1.4" opacity=".6"/>
      ${[34, 46, 58, 70, 82].map(x => `<circle cx="${x}" cy="26" r="1.5" fill="#e8eef8" stroke="#2a3040" stroke-width=".6"/>`).join('')}
      <rect x="40" y="30" width="5" height="22" rx="2" fill="url(#${g})" stroke="#2a3040" stroke-width="1.8"/>
      <path d="M36 112 C36 92 48 82 66 84 L96 84 C104 90 108 100 108 112 Z" fill="url(#${g})" stroke="#2a3040" stroke-width="2"/>
      <path d="M40 98 C52 90 80 88 104 96 M38 106 C54 98 84 96 106 104" stroke="#2a3040" stroke-width="1.4" fill="none" opacity=".7"/>${[48, 64, 80, 96].map(x => `<circle cx="${x}" cy="92" r="1.6" fill="#e8eef8" stroke="#2a3040" stroke-width=".6"/>`).join('')}`; },
    // Assassine als Ninja (Nutzer): enges Kopftuch, Maske ueber der Schnauze (nur die Augen frei),
    // rotes Stirnband mit fliegenden Enden, dunkler Schal
    rogue: () => `<path d="M26 34 C24 6 70 -8 94 24 L96 44 C82 28 62 22 46 26 C38 28 31 32 28 38 Z" fill="#1a1e2e" stroke="#06080e" stroke-width="2"/>
      <path d="M32 22 C44 8 70 6 86 20" stroke="#3a4060" stroke-width="2" fill="none"/><path d="M50 16 C58 12 70 12 78 18" stroke="#2a3048" stroke-width="1.4" fill="none"/>
      <path d="M28 28 C44 21 70 21 93 30 L91 37 C70 28 46 28 30 35 Z" fill="#c8202e" stroke="#4a0610" stroke-width="1.6"/><circle cx="92" cy="33" r="3.6" fill="#a8101e" stroke="#4a0610" stroke-width="1.2"/>
      <path d="M94 32 C104 30 112 22 120 18 C114 30 106 36 96 37 Z M94 36 C104 40 112 40 122 36 C114 46 104 46 95 40 Z" fill="#c8202e" stroke="#4a0610" stroke-width="1.2"/>
      <path d="M2 50 C10 42 34 40 58 45 L63 72 C42 68 18 72 3 75 Z" fill="#1a1e2e" stroke="#06080e" stroke-width="1.8"/><path d="M6 56 C20 50 40 50 58 54 M5 64 C20 60 40 60 60 63" stroke="#2e344a" stroke-width="1.2" fill="none"/>
      <path d="M38 112 C40 94 52 86 68 86 C88 84 102 94 106 112 Z" fill="#1a1e2e" stroke="#06080e" stroke-width="2"/><path d="M44 100 C56 92 82 90 102 100" stroke="#c8202e" stroke-width="2.6" fill="none"/>
      <path d="M58 96 L86 112" stroke="#3a4060" stroke-width="3"/>`,
    marksman: () => `<path d="M30 24 C46 16 70 18 90 30 L88 38 C70 26 48 26 32 32 Z" fill="#e2733a" stroke="#6a2a08" stroke-width="1.8"/>
      ${[40, 52, 64, 76].map((x, i) => `<path d="M${x} ${24 + i * .8} l3 3 -3 3 -3 -3 Z" fill="#ffe08a"/>`).join('')}
      <path d="M86 30 L106 12 L98 30 Z" fill="#fff2d8" stroke="#8a6a40" stroke-width="1.2"/><path d="M96 24 L104 16" stroke="#8a6a40" stroke-width=".8"/><path d="M88 34 L112 26 L100 38 Z" fill="#ffd36b" stroke="#8a6a40" stroke-width="1.2"/>
      <path d="M40 112 C44 94 58 86 74 88 C90 88 102 98 104 112 Z" fill="#8a5a2a" stroke="#3a2008" stroke-width="2"/>
      <path d="M50 88 L96 112" stroke="#4a2a10" stroke-width="5"/><path d="M50 88 L96 112" stroke="#c88a4a" stroke-width="1.4" stroke-dasharray="3 3"/><circle cx="66" cy="96" r="3" fill="#ffd36b" stroke="#6a4a08" stroke-width="1"/>`,
    support: () => `<ellipse cx="56" cy="-6" rx="20" ry="5.5" fill="none" stroke="#ffe46b" stroke-width="4"/><ellipse cx="56" cy="-6" rx="20" ry="5.5" fill="none" stroke="#fff6c8" stroke-width="1.4"/>
      ${glow(56, -6, 22, '#fff2b0', .35)}
      <path d="M40 112 C42 94 54 86 70 88 C88 86 102 96 104 112 Z" fill="#f6efe2" stroke="#b8a888" stroke-width="2"/><path d="M44 104 C54 94 66 94 72 96 C82 94 94 98 100 106" stroke="#e2b23c" stroke-width="2.4" fill="none"/>
      <path d="M72 96 V104" stroke="#e2b23c" stroke-width="1.6"/><circle cx="72" cy="107" r="4" fill="#ff7ab4" stroke="#fff" stroke-width="1.4"/>`,
    jungle: () => `${[[30, 22, -40, '#3aa85a'], [42, 12, -20, '#4ac06a'], [56, 8, 0, '#3aa85a'], [70, 12, 22, '#4ac06a'], [82, 20, 40, '#3aa85a']].map(([x, y, r, c]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0 C-6 -6 -4 -16 0 -20 C4 -16 6 -6 0 0 Z" fill="${c}" stroke="#14461e" stroke-width="1.4"/><path d="M0 -2 V-17" stroke="#14461e" stroke-width=".8"/></g>`).join('')}
      <path d="M26 26 Q56 14 88 26" stroke="#7a4a20" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="56" cy="18" r="2.6" fill="#ff6a2a" stroke="#6a1a04" stroke-width="1"/>
      <path d="M36 112 C38 94 50 86 66 86 C86 84 102 94 106 112 Z" fill="#7a5226" stroke="#3a2008" stroke-width="2"/>
      ${[44, 54, 64, 74, 84, 94].map((x, i) => `<path d="M${x} ${92 + (i % 2) * 2} l-3 8 6 0 Z" fill="#a8783a"/>`).join('')}
      ${[52, 62, 72, 82].map((x, i) => `<path d="M${x} ${100 + (i % 2) * 2} l3 8 3 -8" fill="#f6efe2" stroke="#8a7a5a" stroke-width=".6"/>`).join('')}`,
    fighter: () => `<path d="M30 24 C46 18 70 20 90 30 L88 38 C70 28 48 28 32 32 Z" fill="#d8283a" stroke="#5a0a10" stroke-width="1.8"/><path d="M34 27 C50 22 70 24 86 32" stroke="#ff7a8a" stroke-width="1.2" fill="none"/>
      <path d="M88 32 C98 30 106 22 112 14 C108 26 102 32 94 36 Z M90 36 C100 38 108 36 116 30 C110 40 100 42 92 40 Z" fill="#d8283a" stroke="#5a0a10" stroke-width="1.4"/>
      <path d="M38 112 C40 94 52 86 68 86 C88 84 102 94 106 112 Z" fill="#8a96aa" stroke="#2a3040" stroke-width="2"/><path d="M44 100 C56 92 82 90 102 100" stroke="#d8283a" stroke-width="4" fill="none"/>
      <path d="M40 108 C56 100 84 98 104 108" stroke="#2a3040" stroke-width="1.2" fill="none" opacity=".6"/><circle cx="72" cy="94" r="3.4" fill="#ffd36b" stroke="#6a4a08" stroke-width="1"/>`
  };
  const P = (role, o = {}) => pony({ ...o, extra: (role ? ACC[role]() : '') + (o.extra || '') });

  // ---------- Szenen-Details (Struktur, Licht, Partikel) ----------
  const D = {
    // feines Muster ueber dem Hintergrund
    hex: (c = '#fff', op = .06) => { const p = U('px'); return `<defs><pattern id="${p}" width="12" height="10.4" patternUnits="userSpaceOnUse"><path d="M3 0 H9 L12 5.2 L9 10.4 H3 L0 5.2 Z" fill="none" stroke="${c}" stroke-width=".7"/></pattern></defs><rect width="120" height="120" fill="url(#${p})" opacity="${op}"/>`; },
    hatch: (c = '#fff', op = .05) => { const p = U('pt'); return `<defs><pattern id="${p}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V6" stroke="${c}" stroke-width="1.2"/></pattern></defs><rect width="120" height="120" fill="url(#${p})" opacity="${op}"/>`; },
    grid: (c = '#fff', op = .06) => { const p = U('pg2'); return `<defs><pattern id="${p}" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 H0 V10" fill="none" stroke="${c}" stroke-width=".6"/></pattern></defs><rect width="120" height="120" fill="url(#${p})" opacity="${op}"/>`; },
    stone: (y = 96) => `<rect y="${y}" width="120" height="${120 - y}" fill="#2a2430"/>${[...Array(12)].map((_, i) => `<rect x="${(i % 6) * 21 - (Math.floor(i / 6) % 2) * 10}" y="${y + Math.floor(i / 6) * 12 + 1}" width="20" height="11" rx="1.5" fill="#3a3440" stroke="#1a1420" stroke-width="1"/>`).join('')}`,
    grass: (y = 98, c = '#2a5a2a') => `<path d="M0 ${y} Q30 ${y - 5} 60 ${y} T120 ${y} V120 H0 Z" fill="${c}"/>${[...Array(16)].map((_, i) => `<path d="M${4 + i * 7.4} ${y + 2 + (i % 3)} l2 -${5 + (i % 4)} 2 ${5 + (i % 4)}" fill="#3a7a3a"/>`).join('')}`,
    // Lichtstrahlen von oben
    beams: (c = '#fff', op = .08) => `<g opacity="${op}">${[[18, 22], [52, 16], [86, 26]].map(([x, w]) => `<path d="M${x} -4 L${x + w} -4 L${x + w + 26} 124 L${x + 10} 124 Z" fill="${c}"/>`).join('')}</g>`,
    // schwebende Staubkoerner
    motes: (c = '#fff', n = 9) => [...Array(n)].map((_, i) => `<circle cx="${(i * 37 + 11) % 112 + 4}" cy="${(i * 53 + 7) % 104 + 6}" r="${.7 + (i % 3) * .45}" fill="${c}" opacity="${.35 + (i % 4) * .12}"/>`).join(''),
    // weicher Bodenschatten
    shadow: (x, y, rx, ry = rx * .22, op = .45) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#000" opacity="${op}"/>`,
    // Glanzkante oben
    rim: (c = '#fff') => `<path d="M6 3 H114" stroke="${c}" stroke-width="1.4" opacity=".18"/>`
  };

  // ---------- Gegenstaende ----------
  const staff = (x, y, s = 1, orb = '#9a6aff', cls = '') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2.6" y="0" width="5.2" height="70" rx="2" fill="#7a4a20" stroke="#3a1a08" stroke-width="1.4"/>
    <path d="M-1 4 V68" stroke="#a87a4a" stroke-width="1.2"/>${[18, 34, 50].map(y2 => `<rect x="-3.6" y="${y2}" width="7.2" height="3" rx="1" fill="#c8a96e" stroke="#5a3a08" stroke-width=".6"/>`).join('')}
    <path d="M-11 4 C-14 -10 -4 -16 0 -16 C4 -16 14 -10 11 4" fill="none" stroke="#c8a96e" stroke-width="3.4"/><path d="M-11 4 C-14 -10 -4 -16 0 -16 C4 -16 14 -10 11 4" fill="none" stroke="#fff2c8" stroke-width="1"/>
    ${glow(0, -6, 18, orb, .75, cls)}<circle cx="0" cy="-6" r="7.5" fill="${orb}" stroke="#fff" stroke-width="1.6"/><circle cx="-2.4" cy="-8.4" r="2.2" fill="#fff" opacity=".85"/><circle cx="2.6" cy="-3" r="1" fill="#fff" opacity=".6"/></g>`;
  const shield = (x, y, s = 1, c = '#3a7ab8', c2 = '#c8a96e') => { const g = U('sh'); return `<g transform="translate(${x} ${y}) scale(${s})"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".45" stop-color="${c}" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>
    <path d="M0 -30 L26 -22 C26 6 18 22 0 32 C-18 22 -26 6 -26 -22 Z" fill="${c}" stroke="${c2}" stroke-width="4" stroke-linejoin="round"/><path d="M0 -30 L26 -22 C26 6 18 22 0 32 C-18 22 -26 6 -26 -22 Z" fill="url(#${g})"/>
    <path d="M0 -25 L21 -18.6 C21 4 14.6 17.6 0 25.6 C-14.6 17.6 -21 4 -21 -18.6 Z" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.2"/>
    <path d="M0 -18 V20 M-14 -4 H14" stroke="${c2}" stroke-width="4.4" stroke-linecap="round"/><circle r="4.6" cy="-4" fill="${c2}" stroke="#4a3208" stroke-width="1"/><circle r="1.8" cy="-4" fill="#fff6c8"/>
    ${[[-20, -18], [20, -18], [-16, 10], [16, 10]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="1.6" fill="#fff6c8" stroke="#4a3208" stroke-width=".6"/>`).join('')}
    <path d="M-20 -20 C-18 -8 -16 2 -10 12" stroke="#fff" stroke-width="2.4" opacity=".35" fill="none" stroke-linecap="round"/></g>`; };
  const dagger = (x, y, rot = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-3.4 0 L0 -36 L3.4 0 Z" fill="#e4ebf5" stroke="#3a4250" stroke-width="1.2"/><path d="M0 -34 V-2" stroke="#8a96aa" stroke-width=".9"/><path d="M-1.6 -4 L0 -30" stroke="#fff" stroke-width=".8" opacity=".8"/>
    <path d="M-9 0 Q0 3 9 0 L8 4 Q0 6 -8 4 Z" fill="#8a2a3a" stroke="#2a0a10" stroke-width="1"/><circle cy="2" r="1.8" fill="#ff5a7a"/><rect x="-2" y="4" width="4" height="10" rx="1.5" fill="#2a1a10"/><path d="M-2 7 H2 M-2 10 H2" stroke="#6a4a2a" stroke-width=".8"/><circle cy="15.5" r="2.2" fill="#c8a96e" stroke="#4a3208" stroke-width=".8"/></g>`;
  const bow = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 -36 C22 -24 22 24 0 36" fill="none" stroke="#5a2a0a" stroke-width="6" stroke-linecap="round"/><path d="M0 -36 C22 -24 22 24 0 36" fill="none" stroke="#e2a03a" stroke-width="2"/>
    <rect x="11" y="-6" width="6" height="12" rx="2" fill="#7a3a1a" stroke="#2a1008" stroke-width="1"/>${[-3, 0, 3].map(d => `<path d="M11 ${d} H17" stroke="#c88a4a" stroke-width=".8"/>`).join('')}
    <path d="M0 -36 L-10 0 L0 36" fill="none" stroke="#f6efe2" stroke-width="1.4"/><path d="M-10 0 H40" stroke="#c8a96e" stroke-width="2.4"/><path d="M42 0 L32 -6 L34 0 L32 6 Z" fill="#e4ebf5" stroke="#3a4250" stroke-width="1"/>
    <path d="M-10 0 L-18 -6 L-14 0 L-18 6 Z" fill="#ff8a5a" stroke="#8a3a1a" stroke-width=".8"/></g>`;
  const arrow = (x, y, rot = 0, s = 1, c = '#ffd36b') => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-20 0 H14" stroke="${c}" stroke-width="2.4"/><path d="M19 0 L10 -5.5 L12 0 L10 5.5 Z" fill="#fff" stroke="${c}" stroke-width="1"/><path d="M-20 0 L-27 -5 L-24 0 L-27 5 Z" fill="${c}" opacity=".85"/><path d="M-34 0 H-24" stroke="${c}" stroke-width="1" opacity=".4"/></g>`;
  const cross = (x, y, s = 1, c = '#5fd08a') => `<g transform="translate(${x} ${y}) scale(${s})">${glow(0, 0, 18, c, .45)}<path d="M-5 -14 H5 V-5 H14 V5 H5 V14 H-5 V5 H-14 V-5 H-5 Z" fill="${c}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M-3 -12 H3 V-5" stroke="#fff" stroke-width="1.4" opacity=".55" fill="none"/></g>`;
  const wing = (x, y, s = 1, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${[0, 1, 2, 3].map(i => `<path d="M0 0 C${-14 - i * 6} ${-10 + i * 10} ${-30 - i * 4} ${-6 + i * 14} ${-40 - i * 2} ${2 + i * 14} C${-26} ${6 + i * 10} ${-12} ${6 + i * 6} 0 ${4 + i * 4} Z" fill="${i % 2 ? '#fff6e8' : '#ffffff'}" stroke="#d8c8a8" stroke-width="1.2"/><path d="M-6 ${3 + i * 4} C${-16 - i * 4} ${4 + i * 9} ${-26 - i * 3} ${2 + i * 12} ${-34 - i * 2} ${4 + i * 14}" stroke="#e8dcc0" stroke-width=".8" fill="none"/>`).join('')}</g>`;
  const bar = (x, y, w, h, pct, c, back = '#1a1420') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${back}" stroke="#000" stroke-opacity=".6" stroke-width="1.4"/><rect x="${x + 1.5}" y="${y + 1.5}" width="${Math.max(0, (w - 3) * pct)}" height="${h - 3}" rx="${(h - 3) / 2}" fill="${c}"/>
    <rect x="${x + 2.5}" y="${y + 2}" width="${Math.max(0, (w - 5) * pct)}" height="${(h - 3) * .35}" rx="${h / 4}" fill="#fff" opacity=".3"/>${[...Array(Math.floor(w / 12))].map((_, i) => `<rect x="${x + 12 * (i + 1)}" y="${y + 2}" width=".9" height="${h - 4}" fill="#000" opacity=".35"/>`).join('')}`;
  // Faehigkeits-Symbol (abgerundetes Quadrat, Taste + kleines Symbol)
  const GLYPH = { Q: 'M-5 3 L0 -5 L5 3', W: 'M-6 -2 Q0 -8 6 -2 Q0 4 -6 -2', E: 'M-5 -4 H5 M-5 0 H3 M-5 4 H5', R: 'M0 -6 L2 -1 L7 -1 L3 2 L4.5 7 L0 4 L-4.5 7 L-3 2 L-7 -1 L-2 -1 Z' };
  const skill = (x, y, key, c = '#3a6ad8', sz = 22) => { const g = U('sk'); return `<g transform="translate(${x} ${y})"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>
    <rect x="${-sz / 2 - 2}" y="${-sz / 2 - 2}" width="${sz + 4}" height="${sz + 4}" rx="5" fill="#c8a96e" stroke="#4a3208" stroke-width="1.2"/><rect x="${-sz / 2}" y="${-sz / 2}" width="${sz}" height="${sz}" rx="4" fill="${c}"/><rect x="${-sz / 2}" y="${-sz / 2}" width="${sz}" height="${sz}" rx="4" fill="url(#${g})"/>
    <path d="${GLYPH[key] || ''}" transform="translate(0 ${-sz * .12}) scale(${sz / 26})" fill="${key === 'R' ? '#fff6c8' : 'none'}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>${txt(key, sz * .26, sz * .4, sz * .34, '#fff', '#0a0e1a', 1.6)}</g>`; };
  // Karte mit drei Lanes (fuer Top/Mid/Bot/Jungle), mit Wald, Fluss und Tuermen
  const map = (hi) => {
    const lane = (d, on) => `<path d="${d}" stroke="#2a1e0e" stroke-width="${on ? 11 : 8}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/><path d="${d}" stroke="${on ? '#ffd36b' : '#8a7a5a'}" stroke-width="${on ? 7 : 4.5}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${on ? 1 : .6}"/>`;
    const trees = [[42, 40], [50, 70], [70, 48], [78, 80], [36, 60], [84, 62], [60, 88], [60, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#164a24"/><circle cx="${x - 1.4}" cy="${y - 1.4}" r="2.4" fill="#2a7a3a"/>`).join('');
    const towers = [[22, 60], [22, 38], [60, 22], [40, 78], [60, 60], [78, 40], [60, 98], [82, 98], [98, 60], [98, 82]].map(([x, y]) => `<rect x="${x - 2.2}" y="${y - 2.2}" width="4.4" height="4.4" fill="${x + y < 120 ? '#6bc8ff' : '#ff6a6a'}" stroke="#fff" stroke-width=".8"/>`).join('');
    return `<rect x="10" y="10" width="100" height="100" rx="10" fill="#1e4a2a" stroke="#c8a96e" stroke-width="2.4"/>${D.hatch('#000', .12)}${trees}
      <path d="M12 106 C40 80 80 40 106 12" stroke="#1a4a7a" stroke-width="15" fill="none" opacity=".9"/><path d="M12 106 C40 80 80 40 106 12" stroke="#4a9ad8" stroke-width="5" fill="none" opacity=".55" stroke-dasharray="6 5"/>
      ${lane('M22 98 L22 22 L98 22', hi === 'top')}${lane('M22 98 L98 22', hi === 'mid')}${lane('M22 98 L98 98 L98 22', hi === 'bot')}${towers}
      <circle cx="22" cy="98" r="9" fill="#3a7ad8" stroke="#fff" stroke-width="2"/><circle cx="22" cy="98" r="4" fill="#9ae4ff"/><circle cx="98" cy="22" r="9" fill="#d83a4a" stroke="#fff" stroke-width="2"/><circle cx="98" cy="22" r="4" fill="#ffb0b0"/>`;
  };
  const pingMark = (x, y, c, sym, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="26" rx="14" ry="4" fill="none" stroke="${c}" stroke-width="2" opacity=".6"/><ellipse cx="0" cy="26" rx="22" ry="6.5" fill="none" stroke="${c}" stroke-width="1.2" opacity=".35"/>
    <path d="M0 24 C-6 14 -18 6 -18 -6 C-18 -18 -10 -26 0 -26 C10 -26 18 -18 18 -6 C18 6 6 14 0 24 Z" fill="#000" opacity=".3" transform="translate(2 3)"/>
    <path d="M0 22 C-6 12 -18 4 -18 -6 C-18 -18 -10 -26 0 -26 C10 -26 18 -18 18 -6 C18 4 6 12 0 22 Z" fill="${c}" stroke="#fff" stroke-width="2.4"/><path d="M-12 -14 C-8 -22 4 -24 10 -18" stroke="#fff" stroke-width="2.4" fill="none" opacity=".45" stroke-linecap="round"/>${txt(sym, 0, 1, 20, '#fff', 'rgba(0,0,0,.4)', 2)}</g>`;
  const slashes = (x, y, s = 1, c = '#fff') => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-linecap="round">${[0, 1, 2].map(i => `<path d="M${-20 + i * 9} -24 Q${-4 + i * 9} 0 ${-18 + i * 9} 26" stroke-width="${3.4 - i * .6}" opacity="${.9 - i * .2}"/>`).join('')}</g>`;
  const stars = (x, y, n = 3, r = 14) => [...Array(n)].map((_, i) => { const a = i / n * Math.PI * 2; return spark((x + Math.cos(a) * r).toFixed(1), (y + Math.sin(a) * r * .45).toFixed(1), .55, 1, '', '#ffe46b'); }).join('');
  const potion = (x, y, s = 1, c = '#e01e2e') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-5 -10 h10 v5 q8 4 8 12 q0 10 -13 10 q-13 0 -13 -10 q0 -8 8 -12 z" fill="${c}" stroke="#3a0a0a" stroke-width="1.4"/><path d="M-6 0 q6 3 12 0" stroke="#fff" stroke-width="1.2" opacity=".5" fill="none"/><rect x="-6" y="-13" width="12" height="4" rx="1" fill="#8a5a2a" stroke="#3a1a08" stroke-width="1"/><circle cx="-4" cy="4" r="2" fill="#fff" opacity=".6"/></g>`;
  const portrait = (x, y, w, hi = false) => `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="3" fill="${hi ? '#3a2a0a' : '#1e2638'}" stroke="${hi ? '#ffd36b' : '#3a4a6a'}" stroke-width="${hi ? 2 : 1}"/><circle cx="${x + w / 2}" cy="${y + w * .42}" r="${w * .2}" fill="${hi ? '#ffd36b' : '#4a5a7a'}" opacity=".9"/><path d="M${x + w * .2} ${y + w * .9} Q${x + w / 2} ${y + w * .52} ${x + w * .8} ${y + w * .9} Z" fill="${hi ? '#ffd36b' : '#4a5a7a'}" opacity=".9"/>`;

  // ---------- Die 50 Motive ----------
  const ART = {
    // ===== Animated Rare: Hintergrund hier, Figur als Hologramm-Ebene (POP) =====
    'hypercarry': () => `${bg('#2a1204', '#6a2a08')}${D.hatch('#ffd08a', .05)}${rays(60, 56, '#ffd08a', 16, .14, 95, 'a-spin')}${glow(60, 58, 48, '#ffb43a', .85, 'a-pulse')}
      ${D.grass(100, '#3a2a10')}${[0, 1, 2, 3, 4].map(i => `<g class="a-twinkle d${i % 4}">${arrow(14 + i * 4, 18 + i * 20, 0, .6, '#ffe08a')}</g>`).join('')}${sparks([[100, 18, .8], [104, 100, .7]], 'a-twinkle', '#ffe08a')}${D.motes('#ffe08a')}`,
    'last-stand': () => `${bg('#0a1420', '#2a1a1a')}${rays(60, 60, '#ff6a4a', 14, .12, 95, 'a-spin')}${glow(60, 62, 50, '#ff5a3a', .55, 'a-pulse')}
      ${[0, 1, 2, 3, 4, 5].map(i => `<g transform="translate(${8 + i * 21} ${92 - (i % 2) * 6}) rotate(${(i % 3 - 1) * 14})">${arrow(0, 0, 70, .5, '#8a96aa')}</g>`).join('')}
      <path d="M0 104 L18 96 L34 104 L52 94 L70 104 L88 96 L104 104 L120 98 V120 H0 Z" fill="#1a0e0e"/><path d="M0 104 L18 96 L34 104 L52 94 L70 104 L88 96 L104 104 L120 98" stroke="#ff6a4a" stroke-width="1" opacity=".4" fill="none"/>
      ${sparks([[14, 20, .7], [106, 24, .8], [12, 80, .5]], 'a-twinkle', '#ffb48a')}${D.motes('#ffb48a', 7)}`,
    'shadow-strike': () => `${bg('#0a0618', '#2a0e2a')}<g class="a-pulse" style="transform-origin:86px 30px">${glow(86, 30, 30, '#ffe9c8', .5)}</g><circle cx="86" cy="30" r="16" fill="#fff2d8"/><circle cx="80" cy="26" r="3" fill="#e8d8b8" opacity=".7"/><circle cx="90" cy="35" r="2" fill="#e8d8b8" opacity=".7"/>
      <path d="M-10 108 L130 18" stroke="#ff3a6a" stroke-width="2.4" opacity=".6"/><path d="M-10 114 L130 24" stroke="#fff" stroke-width="1" opacity=".45"/>
      <path d="M0 120 V98 L10 92 L26 92 L36 98 V120 Z M44 120 V90 L52 84 L48 84 L60 74 L72 84 L68 84 L76 90 V120 Z M84 120 V100 L94 94 L110 94 L120 100 V120 Z" fill="#07030c"/>
      <path d="M48 84 L60 74 L72 84 M8 92 H28 M92 94 H112" stroke="#3a1a3a" stroke-width="1.4" fill="none"/>${[[56, 96], [62, 96], [16, 104], [100, 106]].map(([x, y]) => `<rect x="${x}" y="${y}" width="3" height="4" fill="#ffb43a" opacity=".75"/>`).join('')}
      ${[[20, 30, 30], [40, 60, -20], [104, 70, 50], [14, 76, 10], [70, 50, -40]].map(([x, y, r], i) => `<path class="a-twinkle d${i % 4}" transform="translate(${x} ${y}) rotate(${r})" d="M0 -3.4 C3 -1.4 3 1.4 0 3.4 C-3 1.4 -3 -1.4 0 -3.4 Z" fill="#ff9ac8"/>`).join('')}`,

    // ===== Holo Rare =====
    'archmage': () => `${bg('#0e0a2a', '#2a1a6a', '#9a6aff')}${D.hex('#c8b0ff', .05)}${rays(60, 50, '#c8b0ff', 18, .08)}
      <circle cx="60" cy="58" r="46" fill="none" stroke="#9a6aff" stroke-width="1.6" stroke-dasharray="4 4" opacity=".6"/><circle cx="60" cy="58" r="38" fill="none" stroke="#c8b0ff" stroke-width=".8" opacity=".5"/>
      ${[...Array(8)].map((_, i) => { const a = i / 8 * Math.PI * 2; return `<text x="${(60 + Math.cos(a) * 42).toFixed(1)}" y="${(61 + Math.sin(a) * 42).toFixed(1)}" text-anchor="middle" font-family="Georgia,serif" font-size="7" fill="#d8c8ff" opacity=".8">${'ᚠᚱᚦᚨᛃᛇᛉᛟ'[i]}</text>`; }).join('')}
      ${D.shadow(48, 104, 30)}${staff(98, 40, .9)}${P('mage', { x: 6, y: 34, s: .64, eye: 'closed' })}${sparks([[20, 20, .8], [80, 14, .6], [104, 104, .6]], '', '#d8c8ff')}${D.motes('#d8c8ff')}`,
    'iron-bulwark': () => `${bg('#141a24', '#2e3a4e', '#6bc8ff')}${D.beams('#9ae4ff', .06)}
      ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${i * 22 - 8}" y="${74 + (i % 2) * 8}" width="20" height="14" fill="#4a5466" stroke="#1a2030" stroke-width="2"/><path d="M${i * 22 - 6} ${76 + (i % 2) * 8} h16" stroke="#6a7488" stroke-width="1"/>`).join('')}${D.stone(96)}
      ${P('tank', { x: 0, y: 18, s: .62, eye: 'angry' })}${D.shadow(78, 100, 22)}${shield(78, 64, 1.05)}${sparks([[16, 16, .6], [104, 18, .7]])}${D.motes('#9ae4ff', 6)}`,
    'blade-dancer': () => `${bg('#2a0a10', '#5a1420', '#ff6a4a')}${D.hatch('#ffb0a0', .04)}
      ${[0, 1, 2].map(i => `<circle cx="60" cy="60" r="${30 + i * 12}" fill="none" stroke="#fff" stroke-width="${2.4 - i * .6}" stroke-dasharray="${30 + i * 10} ${50 + i * 10}" opacity="${.7 - i * .18}" transform="rotate(${i * 50} 60 60)"/>`).join('')}
      ${[[18, 96, 20], [100, 100, -30], [34, 108, 60], [86, 88, -70]].map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0 -5 C4 -2 4 2 0 5 C-4 2 -4 -2 0 -5 Z" fill="#ff8aa0" opacity=".8"/>`).join('')}
      ${sword(96, 86, 56, 30, '#fff2e8', '#c8a96e')}${P('fighter', { x: 10, y: 22, s: .64, eye: 'angry' })}${sparks([[100, 20, .8], [18, 100, .6]], '', '#ffd0c0')}`,
    'guardian-wings': () => `${bg('#2a2040', '#7a5a8a', '#fff2d8')}${rays(60, 52, '#fff6e0', 20, .12)}${D.beams('#fff', .07)}
      ${[[14, 104, 12], [44, 110, 16], [80, 108, 14], [108, 102, 10]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .45}" fill="#fff" opacity=".35"/>`).join('')}
      ${wing(44, 58, .8)}${wing(84, 58, .8, true)}${P('support', { x: 18, y: 22, s: .64, eye: 'happy', body: '#f6efe2', shade: '#d8c8b0', mane: '#ffb4d8' })}${sparks([[18, 18, .7], [102, 20, .8], [60, 112, .6]], '', '#fff6c8')}${D.motes('#fff6c8')}`,
    'wild-hunter': () => `${bg('#04140a', '#12341c', '#5fd08a')}${D.beams('#9affb8', .05)}
      ${[[8, 30], [112, 40]].map(([x, y]) => `<path d="M${x} -4 C${x + 4} ${y} ${x - 4} ${y + 40} ${x + 2} 124" stroke="#0a2a12" stroke-width="10" fill="none"/>`).join('')}${[[16, 20], [104, 30], [12, 60]].map(([x, y]) => `<path d="M${x} ${y} q8 -4 12 4 q-8 4 -12 -4 Z" fill="#2a7a3a"/>`).join('')}
      ${bush(18, 110, 60, '#1e5a2e', '#164a24')}${bush(104, 112, 60, '#1e5a2e', '#164a24')}
      ${slashes(92, 46, .9, '#c8ffd8')}${P('jungle', { x: 6, y: 20, s: .64, eye: 'angry', body: '#c89a5a', shade: '#7a5a20', mane: '#3a2a10' })}
      ${[[100, 96], [16, 92]].map(([x, y]) => `<ellipse cx="${x - 4}" cy="${y}" rx="2.6" ry="1.6" fill="#ffe46b"/><ellipse cx="${x + 4}" cy="${y}" rx="2.6" ry="1.6" fill="#ffe46b"/>`).join('')}${D.motes('#c8ffd8', 8)}`,
    'siege-engine': () => `${bg('#1a1206', '#4a3010', '#ffb43a')}${D.hatch('#ffd08a', .04)}${tower(100, 98, .8)}${D.stone(98)}
      <g transform="translate(36 86)">${D.shadow(0, 20, 30)}<rect x="-26" y="0" width="52" height="10" rx="3" fill="#6a4a20" stroke="#2a1a08" stroke-width="2"/><path d="M-24 4 H24" stroke="#8a6a3a" stroke-width="1"/>
      ${[-16, 16].map(cx => `<circle cx="${cx}" cy="12" r="7.5" fill="#4a3014" stroke="#1a0e04" stroke-width="2"/><circle cx="${cx}" cy="12" r="2.4" fill="#c8a96e"/>${[0, 1, 2, 3].map(k => `<path d="M${cx} 12 l${(Math.cos(k * Math.PI / 2) * 6).toFixed(1)} ${(Math.sin(k * Math.PI / 2) * 6).toFixed(1)}" stroke="#1a0e04" stroke-width="1.2"/>`).join('')}`).join('')}
      <g transform="rotate(-24)"><rect x="-8" y="-22" width="44" height="16" rx="6" fill="#5a6070" stroke="#1a2030" stroke-width="2"/><rect x="30" y="-24" width="8" height="20" rx="3" fill="#4a5060" stroke="#1a2030" stroke-width="2"/><path d="M-4 -18 H32" stroke="#8a96aa" stroke-width="1.4"/>${[4, 14, 24].map(x => `<rect x="${x}" y="-22" width="2" height="16" fill="#3a4050"/>`).join('')}</g></g>
      <path d="M72 50 Q84 30 96 42" stroke="#ffd36b" stroke-width="2" stroke-dasharray="3 3" fill="none"/>${glow(98, 44, 14, '#ffb43a', .8)}<circle cx="98" cy="44" r="5" fill="#2a2a2a" stroke="#ffd36b" stroke-width="1.4"/>
      ${P('fighter', { x: 4, y: 18, s: .44, eye: 'happy' })}${D.motes('#ffd08a', 6)}`,
    'duelists-oath': () => `${bg('#1a0a2a', '#3a1a2a', '#ffd36b')}${D.hex('#ffe9b0', .04)}${rays(60, 52, '#ffe9b0', 14, .09)}
      <path d="M0 104 H120 V120 H0 Z" fill="#2a1420"/><path d="M0 104 H120" stroke="#c8a96e" stroke-width="1.4"/>${[...Array(7)].map((_, i) => `<path d="M${i * 20} 104 L${i * 20 - 8} 120" stroke="#3a1e2a" stroke-width="1.4"/>`).join('')}
      ${sword(52, 92, 62, 28, '#e4ebf5', '#c8a96e')}${sword(68, 92, 62, -28, '#e4ebf5', '#c8a96e')}${glow(60, 38, 18, '#fff', .9)}${spark(60, 38, 1.2)}
      ${P('fighter', { x: 66, y: 48, s: .46, eye: 'angry', flip: true })}${P('rogue', { x: 8, y: 48, s: .46, eye: 'angry', body: '#9aa6b8', shade: '#5a6478', mane: '#2a3040' })}${D.motes('#ffe9b0', 7)}`,

    // ===== Uncommon =====
    'combo-starter': () => `${bg('#0a1430', '#1a2a5a')}${D.grid('#6bc8ff', .06)}${['Q', 'W', 'E', 'R'].map((k, i) => skill(17 + i * 28.6, 58, k, ['#3a6ad8', '#3aa85a', '#d8a03a', '#d83a5a'][i], 21)).join('')}
      ${[0, 1, 2].map(i => `<path d="M${29 + i * 28.6} 58 l7 0 m-3.4 -3.4 l3.4 3.4 l-3.4 3.4" stroke="#ffe46b" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join('')}
      ${txt('COMBO!', 60, 98, 15, '#ffe46b', '#0a1430', 3)}${txt('x4', 98, 30, 12, '#ff9ac8', '#0a1430', 2.4)}${sparks([[100, 104, .6], [18, 26, .5]])}${D.motes('#9ae4ff', 6)}`,
    'hook-shot': () => `${bg('#0a2030', '#14465a')}${D.hatch('#9ae4ff', .04)}<path d="M0 100 Q60 92 120 100 V120 H0 Z" fill="#0a2a3a"/>${[0, 1, 2].map(i => `<path d="M${10 + i * 40} ${108 + (i % 2) * 4} q8 -3 16 0" stroke="#4a9ad8" stroke-width="1.6" fill="none" opacity=".6"/>`).join('')}
      ${P('tank', { x: -2, y: 42, s: .5, eye: 'happy' })}
      ${[...Array(9)].map((_, i) => `<ellipse cx="${46 + i * 6}" cy="${73 - i * 3.6}" rx="3" ry="2" fill="none" stroke="#9aa6b8" stroke-width="1.6" transform="rotate(${-30} ${46 + i * 6} ${73 - i * 3.6})"/>`).join('')}
      <g transform="translate(100 38) rotate(-30)">${glow(0, 0, 12, '#9ae4ff', .5)}<path d="M0 0 C11 -2 15 9 8 15 M0 0 C-11 -2 -15 9 -8 15" stroke="#d8e0ee" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M0 0 C11 -2 15 9 8 15" stroke="#fff" stroke-width="1.2" fill="none"/><circle r="4.4" fill="#9aa6b8" stroke="#1a2030" stroke-width="1.4"/></g>
      ${sparks([[104, 22, .6], [16, 20, .5]])}`,
    'peel': () => `${bg('#1a2a40', '#2a4a6a', '#9ae4ff')}${D.hex('#c8f2ff', .06)}<circle cx="40" cy="62" r="34" fill="#9ae4ff" opacity=".18" stroke="#c8f2ff" stroke-width="2.4"/><path d="M18 42 Q30 30 46 30" stroke="#fff" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
      ${P('marksman', { x: 12, y: 32, s: .5, eye: 'wide' })}<g opacity=".85">${P('rogue', { x: 76, y: 28, s: .44, flip: true, eye: 'angry', body: '#4a4a5a', shade: '#2a2a3a', mane: '#1a1a24' })}</g>
      <path d="M78 64 l14 -6 M80 74 l16 0 M78 84 l14 6" stroke="#c8f2ff" stroke-width="2.6" stroke-linecap="round"/>${stars(92, 30, 3, 10)}`,
    'kite': () => `${bg('#2a1a0a', '#5a3a14')}${D.beams('#ffd08a', .06)}${D.grass(98, '#4a3218')}${[0, 1, 2, 3].map(i => `<ellipse cx="${18 + i * 16}" cy="${108 - (i % 2) * 4}" rx="4" ry="2" fill="#2a1a08" opacity=".6"/>`).join('')}
      ${D.shadow(80, 98, 22)}${P('marksman', { x: 52, y: 18, s: .56, eye: 'happy' })}${arrow(30, 46, 180, .9)}${arrow(22, 66, 175, .8)}${arrow(36, 84, 185, .7)}${txt('PEW', 22, 30, 11, '#ffe46b', '#2a1a0a', 2.4)}${D.motes('#ffd08a', 6)}`,
    'engage': () => `${bg('#2a0a0a', '#6a1a14', '#ff6a3a')}${D.hatch('#ffb48a', .05)}${[0, 1, 2, 3, 4].map(i => `<path d="M${90 + (i % 2) * 8} ${30 + i * 14} H${116}" stroke="#ffb48a" stroke-width="3" stroke-linecap="round" opacity=".6"/>`).join('')}
      ${D.stone(100)}${[[96, 98], [108, 92], [88, 94]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#6a5a50" opacity=".8"/>`).join('')}${P('tank', { x: 10, y: 22, s: .64, eye: 'angry' })}${txt('ENGAGE!', 60, 114, 15, '#fff2a8', '#3a0a04', 3)}`,
    'backline-dive': () => `${bg('#120a24', '#2a1440')}${D.hex('#c8a0ff', .04)}<rect x="0" y="80" width="120" height="40" fill="#2a1e40"/><rect x="0" y="80" width="120" height="8" fill="#3a2a5a"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${i * 22}" y="70" width="14" height="10" fill="#4a3a6a" stroke="#1a1030" stroke-width="1"/>`).join('')}
      ${D.stone(96)}<path d="M10 104 Q50 -6 104 70" stroke="#ff7ad9" stroke-width="2.4" stroke-dasharray="5 4" fill="none"/>${P('rogue', { x: 40, y: 2, s: .44, eye: 'angry' })}${dagger(86, 46, 40, .7)}${sparks([[104, 76, .6]], '', '#ff9ae4')}${D.motes('#ff9ae4', 6)}`,
    'zone-control': () => `${bg('#0e0a20', '#24143a')}${D.hex('#c88aff', .05)}<ellipse cx="60" cy="84" rx="54" ry="22" fill="#9a3aff" opacity=".22" stroke="#c88aff" stroke-width="2.4"/>
      <ellipse cx="60" cy="84" rx="38" ry="14" fill="none" stroke="#c88aff" stroke-width="1.6" stroke-dasharray="4 3"/>${[...Array(8)].map((_, i) => { const a = i / 8 * Math.PI * 2; return `<path d="M${(60 + Math.cos(a) * 46).toFixed(1)} ${(84 + Math.sin(a) * 18).toFixed(1)} l0 -8" stroke="#e8c8ff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`; }).join('')}
      ${P('mage', { x: 22, y: 6, s: .56, eye: 'normal' })}${txt('DON\'T STEP IN IT', 60, 116, 8, '#e8c8ff', '#0e0a20', 2)}${D.motes('#e8c8ff', 8)}`,
    'burst-window': () => `${bg('#200a06', '#4a1a0a', '#ffb43a')}${rays(60, 58, '#ffd08a', 16, .12)}
      <g transform="translate(60 56)"><rect x="-22" y="-34" width="44" height="6" rx="2" fill="#7a4a20" stroke="#3a1a08" stroke-width="1.6"/><rect x="-22" y="28" width="44" height="6" rx="2" fill="#7a4a20" stroke="#3a1a08" stroke-width="1.6"/>
      <path d="M-18 -28 H18 L4 0 L18 28 H-18 L-4 0 Z" fill="#f6efe2" fill-opacity=".85" stroke="#6a4a20" stroke-width="2.6"/><path d="M-11 -22 H11 L2 -6 H-2 Z" fill="#ffd36b"/><path d="M-2 4 H2 L12 24 H-12 Z" fill="#ffd36b"/><path d="M0 -4 V4" stroke="#ffd36b" stroke-width="1.4"/>
      <path d="M-14 -26 L-6 -10" stroke="#fff" stroke-width="2" opacity=".6"/></g>
      ${flame(22, 88, .5)}${flame(98, 88, .5)}${txt('NOW!', 60, 114, 14, '#fff2a8', '#3a1004', 3)}${D.motes('#ffd08a', 7)}`,
    'frontline': () => `${bg('#141e2a', '#26384a')}${D.beams('#c8d8ff', .05)}${D.stone(96)}${[0, 1, 2].map(i => `${D.shadow(26 + i * 34, 100, 18)}${shield(26 + i * 34, 66, .78, ['#3a7ab8', '#b83a4a', '#3a9a5a'][i])}`).join('')}
      ${[0, 1, 2].map(i => `<path d="M${26 + i * 34} 34 V20" stroke="#8a96aa" stroke-width="2"/><path d="M${26 + i * 34} 20 h10 l-3 3 3 3 h-10" fill="${['#3a7ab8', '#b83a4a', '#3a9a5a'][i]}"/>`).join('')}${sparks([[60, 12, .6]])}`,
    'sustain': () => `${bg('#06200e', '#124a24', '#5fd08a')}${D.hex('#9affb8', .05)}${bar(14, 86, 92, 14, .78, '#5fd08a')}${txt('+250', 96, 80, 9, '#9affb8', '#06200e', 2)}
      ${cross(60, 44, 1.4)}${[[26, 32], [94, 28], [88, 62], [30, 64]].map(([x, y]) => cross(x, y, .45, '#9affb8')).join('')}${D.motes('#9affb8', 8)}`,
    'split-push': () => `${bg('#1a2014', '#30402a')}${map('top')}${P('fighter', { x: 52, y: 30, s: .34, eye: 'happy' })}<path d="M30 30 L52 30" stroke="#fff" stroke-width="2" stroke-dasharray="3 2"/>${txt('SPLIT', 60, 117, 10, '#ffe46b', '#1a2014', 2.4)}`,
    'bubble-shield': () => `${bg('#0a1a3a', '#1a3a6a', '#9ae4ff')}${D.hex('#c8f2ff', .05)}<circle cx="58" cy="60" r="46" fill="#9ae4ff" opacity=".16"/><circle cx="58" cy="60" r="46" fill="none" stroke="#c8f2ff" stroke-width="3"/>
      <circle cx="58" cy="60" r="40" fill="none" stroke="#fff" stroke-width=".8" opacity=".4"/><path d="M28 34 Q42 20 62 20" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/><circle cx="86" cy="34" r="3" fill="#fff" opacity=".7"/>
      ${P('support', { x: 22, y: 26, s: .56, eye: 'happy', body: '#f6efe2', shade: '#d8c8b0', mane: '#ffb4d8' })}${[[16, 98], [104, 96], [100, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#c8f2ff" stroke-width="1.2" opacity=".6"/>`).join('')}`,
    'crowd-control': () => `${bg('#1a1a30', '#2e2e52')}${D.hatch('#c8c8ff', .04)}${D.shadow(54, 104, 28)}${P('', { x: 18, y: 32, s: .64, eye: 'tired' })}${stars(54, 30, 4, 22)}<ellipse cx="54" cy="30" rx="24" ry="9" fill="none" stroke="#ffe46b" stroke-width="1.6" stroke-dasharray="3 3"/>
      <path d="M84 52 q6 -4 4 -10 M90 60 q8 -2 8 -8" stroke="#ffe46b" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>${txt('STUNNED', 60, 114, 12, '#ffe46b', '#1a1a30', 2.6)}`,
    'execute': () => `${bg('#200606', '#4a0e0e', '#ff3a3a')}${D.hatch('#ff8a8a', .04)}${bar(14, 20, 92, 12, .06, '#e01e2e')}${txt('42', 60, 15, 8, '#ff9aa0', '#200606', 2)}
      ${sword(60, 106, 68, -30, '#fff2f2', '#c8a96e')}${slashes(60, 68, 1.1, '#ffd0d0')}${[[30, 96], [40, 104], [26, 108]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#e01e2e"/>`).join('')}${sparks([[100, 60, .6], [18, 86, .5]], '', '#ffb0b0')}`,
    'healing-aura': () => `${bg('#0a2a1a', '#1a5a3a', '#9affb8')}${D.beams('#d8ffe0', .06)}<ellipse cx="60" cy="98" rx="50" ry="13" fill="#5fd08a" opacity=".3" stroke="#9affb8" stroke-width="2"/><ellipse cx="60" cy="98" rx="36" ry="8" fill="none" stroke="#d8ffe0" stroke-width="1" stroke-dasharray="3 3"/>
      ${[[18, 56], [100, 50], [24, 86], [96, 84], [60, 14]].map(([x, y], i) => cross(x, y, .36 + (i % 2) * .12, '#9affb8')).join('')}${P('support', { x: 22, y: 24, s: .58, eye: 'closed', body: '#f6efe2', shade: '#d8c8b0', mane: '#ffb4d8' })}${D.motes('#d8ffe0', 8)}`,

    // ===== Common =====
    'auto-attack': () => `${bg('#1a1a2a', '#2e2e4a')}${D.grid('#9aa6c8', .05)}${D.shadow(48, 100, 20)}${sword(52, 96, 66, 35)}${[0, 1, 2].map(i => `<path d="M${30 - i * 4} ${36 + i * 6} q-6 6 -4 14" stroke="#fff" stroke-width="1.6" fill="none" opacity="${.5 - i * .12}"/>`).join('')}
      <path d="M80 56 L80 82 L86 76 L91 86 L95 84 L90 74 L98 74 Z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/><circle cx="80" cy="56" r="8" fill="none" stroke="#ffe46b" stroke-width="1.4" opacity=".7"/>${txt('CLICK', 88, 106, 10, '#c8d0e8', '#1a1a2a', 2)}`,
    'last-hit': () => `${bg('#1a1a30', '#2a3050')}${D.grass(96, '#2a4a2a')}${D.shadow(52, 98, 14)}${minion(52, 84, '#d84a4a', 1.4)}<path d="M40 60 L64 72 M64 60 L40 72" stroke="#fff" stroke-width="2" opacity=".5"/>
      ${coin(86, 40, 12)}${[[74, 30], [98, 50], [96, 28]].map(([x, y]) => spark(x, y, .4, .9, '', '#ffe46b')).join('')}${txt('+21', 88, 22, 12, '#ffe46b', '#1a1a30', 2.4)}${bar(34, 54, 36, 6, .08, '#e01e2e')}`,
    'out-of-mana': () => `${bg('#0a1028', '#1a2048')}${D.hex('#6bc8ff', .04)}${bar(14, 90, 92, 12, .04, '#3a8aff')}${P('mage', { x: 22, y: 22, s: .54, eye: 'tired' })}<path d="M88 50 q4 6 0 10 q-4 -4 0 -10 Z" fill="#6bc8ff" opacity=".8"/>${txt('0 / 400', 60, 114, 9, '#8ab8ff', '#0a1028', 2)}`,
    'on-cooldown': () => `${bg('#141420', '#26263a')}${D.grid('#fff', .04)}${skill(60, 56, 'R', '#d83a5a', 54)}<path d="M60 56 L60 29 A27 27 0 1 1 36.6 69.5 Z" fill="#000" opacity=".55"/>${txt('87', 60, 64, 20, '#fff', '#000', 3)}
      ${[0, 1, 2, 3].map(i => `<circle cx="${30 + i * 20}" cy="104" r="4" fill="${i < 1 ? '#ffd36b' : '#3a3a50'}" stroke="#0a0a14" stroke-width="1"/>`).join('')}`,
    'level-up': () => `${bg('#1a1404', '#4a3a0a', '#ffd36b')}${rays(60, 50, '#ffe9a0', 14, .12)}${glow(60, 50, 34, '#fff2b0', .4)}<path d="M60 16 L88 50 H72 V82 H48 V50 H32 Z" fill="#ffd36b" stroke="#6a4a08" stroke-width="3" stroke-linejoin="round"/>
      <path d="M60 22 L80 46 H68 V76" stroke="#fff6c8" stroke-width="2.4" fill="none" opacity=".7"/>${txt('17', 60, 72, 12, '#6a4a08', 'none', 0)}${txt('LEVEL UP', 60, 106, 14, '#fff2a8', '#3a2a04', 3)}${D.motes('#fff2b0', 8)}`,
    'skill-point': () => `${bg('#0a1430', '#1a2a5a')}${D.grid('#6bc8ff', .05)}${skill(46, 62, 'W', '#3aa85a', 40)}<g transform="translate(82 38)">${glow(0, 0, 20, '#ffd36b', .5)}<circle r="14" fill="#ffd36b" stroke="#6a4a08" stroke-width="2.4"/><path d="M-7 0 H7 M0 -7 V7" stroke="#3a2a04" stroke-width="3.4" stroke-linecap="round"/></g>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${28 + i * 8}" y="88" width="6" height="6" rx="1" fill="${i < 2 ? '#ffd36b' : '#2a3450'}" stroke="#0a1430" stroke-width="1"/>`).join('')}${sparks([[100, 70, .5], [20, 24, .5]])}`,
    'starter-item': () => `${bg('#1a140a', '#3a2a14')}${D.hatch('#c8a96e', .05)}${[0, 1, 2].map(i => `<rect x="${16 + i * 32}" y="36" width="26" height="26" rx="4" fill="#2a2018" stroke="#c8a96e" stroke-width="2"/><rect x="${18 + i * 32}" y="38" width="22" height="8" rx="2" fill="#fff" opacity=".06"/>`).join('')}
      ${sword(29, 58, 18, 30, '#e4ebf5')}${potion(61, 50, .8)}${potion(93, 50, .8)}${txt('2', 102, 60, 8, '#fff', '#000', 2)}
      ${coin(46, 92, 8)}${coin(60, 96, 8)}${coin(74, 92, 8)}${txt('450', 60, 114, 9, '#ffe46b', '#1a140a', 2)}`,
    'shop-run': () => `${bg('#2a1a0a', '#5a3a14', '#ffd36b')}${D.beams('#ffe9b0', .06)}<path d="M34 50 H86 L80 104 H40 Z" fill="#c8a96e" stroke="#4a3208" stroke-width="2.6"/><path d="M38 56 H82" stroke="#8a6a2a" stroke-width="1.4"/><path d="M46 50 C46 30 74 30 74 50" fill="none" stroke="#4a3208" stroke-width="4"/>
      <path d="M40 60 L44 100" stroke="#fff" stroke-width="2" opacity=".25"/>${coin(28, 92, 9)}${coin(94, 88, 10)}${coin(88, 106, 7)}${coin(20, 106, 6)}${txt('SHOP', 60, 84, 12, '#4a3208', 'none', 0)}`,
    'rune-page': () => `${bg('#0e0a20', '#24183a')}${D.motes('#d8c8ff', 6)}<path d="M14 30 Q36 22 60 30 Q84 22 106 30 V100 Q84 92 60 100 Q36 92 14 100 Z" fill="#f6efe2" stroke="#4a3a6a" stroke-width="2.6"/><path d="M60 30 V100" stroke="#4a3a6a" stroke-width="2"/>
      ${[[18, 98, 42, 96], [62, 96, 102, 98]].map(([a, b, c, d]) => `<path d="M${a} ${b} Q${(a + c) / 2} ${b - 4} ${c} ${d}" stroke="#c8b8a0" stroke-width="1" fill="none"/>`).join('')}
      ${[[36, 52], [36, 78], [84, 52], [84, 78]].map(([x, y], i) => `${glow(x, y, 13, ['#ffd36b', '#9a6aff', '#5fd08a', '#ff6a4a'][i], .35)}<circle cx="${x}" cy="${y}" r="9" fill="${['#ffd36b', '#9a6aff', '#5fd08a', '#ff6a4a'][i]}" stroke="#2a1a3a" stroke-width="1.6"/><circle cx="${x - 3}" cy="${y - 3}" r="2.4" fill="#fff" opacity=".6"/>`).join('')}
      <path d="M36 61 V69 M84 61 V69" stroke="#8a7a9a" stroke-width="1.4"/>`,
    'lane-swap': () => `${bg('#141e30', '#26385a')}${D.grid('#9ae4ff', .05)}<path d="M24 44 H88 L80 34 M88 44 L80 54" stroke="#0a1020" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/><path d="M24 44 H88 L80 34 M88 44 L80 54" stroke="#6bc8ff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M96 78 H32 L40 68 M32 78 L40 88" stroke="#0a1020" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/><path d="M96 78 H32 L40 68 M32 78 L40 88" stroke="#ff8a5a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${txt('TOP', 16, 32, 7, '#9ae4ff', '#141e30', 1.6, 'start')}${txt('BOT', 104, 96, 7, '#ffb48a', '#141e30', 1.6, 'end')}${txt('SWAP', 60, 112, 12, '#e8eef8', '#141e30', 2.4)}`,
    'on-my-way': () => `${bg('#0e1e30', '#1a3a5a')}${D.grid('#9ae4ff', .05)}${pingMark(86, 40, '#3ab4ff', '»')}${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${14 + i * 13} ${104 - i * 11}) rotate(-40)"><ellipse rx="3.4" ry="2.2" fill="#9ae4ff" opacity="${.25 + i * .14}"/><ellipse cx="5" cy="3" rx="3.4" ry="2.2" fill="#9ae4ff" opacity="${.2 + i * .12}"/></g>`).join('')}${txt('ON MY WAY', 46, 20, 10, '#9ae4ff', '#0e1e30', 2)}`,
    'missing': () => `${bg('#2a1a04', '#4a3008')}${D.grid('#ffd08a', .05)}${pingMark(60, 50, '#ffb43a', '?', 1.5)}${[[18, 26], [100, 30], [20, 84], [104, 80]].map(([x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial Black" font-size="9" fill="#ffd08a" opacity=".35">?</text>`).join('')}${txt('MISSING', 60, 110, 13, '#ffd08a', '#2a1a04', 2.6)}`,
    'back-off': () => `${bg('#2a0606', '#4a0e0e')}${D.hatch('#ff8a8a', .05)}${pingMark(60, 50, '#e83a3a', '!', 1.5)}${[0, 1].map(i => `<circle cx="60" cy="50" r="${48 + i * 10}" fill="none" stroke="#ff6a6a" stroke-width="1.4" opacity="${.35 - i * .15}"/>`).join('')}${txt('BACK OFF', 60, 110, 13, '#ffb0b0', '#2a0606', 2.6)}`,
    'top-lane': () => `${bg('#0e1a10', '#1a3020')}${map('top')}${txt('TOP', 60, 66, 14, '#ffe46b', '#0e1a10', 3)}`,
    'mid-lane': () => `${bg('#0e1a10', '#1a3020')}${map('mid')}${txt('MID', 60, 66, 14, '#ffe46b', '#0e1a10', 3)}`,
    'bot-lane': () => `${bg('#0e1a10', '#1a3020')}${map('bot')}${txt('BOT', 60, 66, 14, '#ffe46b', '#0e1a10', 3)}`,
    'jungle-path': () => `${bg('#06180c', '#12341c')}${D.beams('#9affb8', .05)}${bush(20, 112, 44, '#1e5a2e', '#164a24')}${bush(100, 18, 44, '#1e5a2e', '#164a24')}${bush(104, 108, 36, '#1e5a2e', '#164a24')}
      <path d="M22 96 C40 70 30 50 56 46 S88 30 98 22" stroke="#000" stroke-width="5" fill="none" opacity=".25"/><path d="M22 96 C40 70 30 50 56 46 S88 30 98 22" stroke="#ffe46b" stroke-width="2.6" stroke-dasharray="4 4" fill="none"/>
      ${[[22, 96, '#6bc8ff'], [56, 46, '#ff6a2a'], [98, 22, '#5fd08a']].map(([x, y, c], i) => `${glow(x, y, 12, c, .4)}<circle cx="${x}" cy="${y}" r="7" fill="${c}" stroke="#fff" stroke-width="2"/>${txt(String(i + 1), x, y + 3, 7, '#fff', 'rgba(0,0,0,.4)', 1.4)}`).join('')}${D.motes('#c8ffd8', 6)}`,
    'support-item': () => `${bg('#1a1430', '#3a2a5a', '#ffd36b')}${D.hex('#ffe9b0', .04)}<g transform="translate(60 56)"><path d="M-32 8 C-32 -24 32 -24 32 8 L24 16 H-24 Z" fill="#c8a96e" stroke="#4a3208" stroke-width="3"/><path d="M-26 0 C-24 -16 24 -16 26 0" stroke="#fff6c8" stroke-width="1.6" fill="none" opacity=".6"/>
      ${glow(0, -4, 14, '#6bc8ff', .5)}<circle r="9" cy="-4" fill="#6bc8ff" stroke="#fff" stroke-width="2"/><circle cx="-3" cy="-7" r="2.4" fill="#fff" opacity=".7"/>${[-22, -11, 11, 22].map(x => `<circle cx="${x}" cy="9" r="2" fill="#4a3208"/>`).join('')}</g>
      ${bar(26, 82, 68, 8, .6, '#ffd36b')}${coin(30, 104, 7)}${coin(60, 106, 7)}${coin(90, 104, 7)}${txt('QUEST', 60, 24, 10, '#ffe46b', '#1a1430', 2)}`,
    'duo-queue': () => `${bg('#2a0a1e', '#5a1a3a', '#ff7ab4')}${D.hex('#ffb4d8', .05)}${P('marksman', { x: 0, y: 30, s: .46, eye: 'happy' })}${P('support', { x: 66, y: 30, s: .46, eye: 'happy', flip: true, body: '#f6efe2', shade: '#d8c8b0', mane: '#ffb4d8' })}
      ${glow(60, 40, 18, '#ff5a8a', .5)}<path d="M60 36 C52 24 38 34 60 52 C82 34 68 24 60 36 Z" fill="#ff5a8a" stroke="#fff" stroke-width="2"/><path d="M50 32 C48 30 46 34 48 36" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/>${txt('DUO', 60, 114, 12, '#ffd0e4', '#2a0a1e', 2.4)}`,
    'champ-select': () => `${bg('#0a1020', '#1a2440')}${D.grid('#6bc8ff', .04)}${[...Array(12)].map((_, i) => portrait(13 + (i % 4) * 24.5, 16 + Math.floor(i / 4) * 24.5, 21, i === 5)).join('')}
      <g transform="translate(38 40)">${pony({ x: 1, y: 2, s: .2, eye: 'happy' })}</g><rect x="20" y="96" width="80" height="14" rx="3" fill="#0a1020" stroke="#3a4a6a" stroke-width="1.4"/>${txt('search...', 26, 106, 7, '#4a5a7a', 'none', 0, 'start')}`,
    'instalock': () => `${bg('#200a2a', '#3a1a4a', '#ff7ad9')}${D.hex('#ffb4e8', .05)}<g transform="translate(60 56)">${glow(0, 4, 32, '#ffd36b', .35)}<path d="M-14 -6 V-16 C-14 -30 14 -30 14 -16 V-6" fill="none" stroke="#c8d0e8" stroke-width="6"/><path d="M-12 -14 C-12 -26 0 -28 6 -26" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/>
      <rect x="-22" y="-8" width="44" height="34" rx="5" fill="#ffd36b" stroke="#6a4a08" stroke-width="2.6"/><rect x="-19" y="-5" width="38" height="8" rx="3" fill="#fff" opacity=".3"/><circle cy="6" r="4" fill="#6a4a08"/><rect x="-1.6" y="8" width="3.2" height="8" rx="1" fill="#6a4a08"/></g>
      <path d="M94 16 L82 38 H92 L84 58 L104 32 H94 L100 16 Z" fill="#ffe46b" stroke="#fff6c8" stroke-width="1.4"/>${txt('0:29', 60, 112, 13, '#ff9ae4', '#200a2a', 2.4)}`,
    'loading-screen': () => `${bg('#0a0e1a', '#181e30')}${[0, 1, 2, 3, 4].map(i => `<rect x="${8 + i * 21.5}" y="18" width="18.5" height="58" rx="3" fill="#2a3048" stroke="${i === 2 ? '#ffd36b' : '#4a5470'}" stroke-width="1.4"/><rect x="${8 + i * 21.5}" y="62" width="18.5" height="14" rx="2" fill="#0a0e1a" opacity=".6"/><rect x="${11 + i * 21.5}" y="66" width="12" height="2.4" rx="1" fill="#6a7490"/><rect x="${11 + i * 21.5}" y="70" width="8" height="2" rx="1" fill="#4a5470"/>`).join('')}
      <g transform="translate(50 30)">${pony({ x: -2, y: 2, s: .2, eye: 'normal' })}</g>${[0, 1, 3, 4].map(i => `<circle cx="${17 + i * 21.5}" cy="40" r="6" fill="#3a4466"/>`).join('')}${bar(14, 90, 92, 10, .62, '#6bc8ff')}${txt('62%', 60, 114, 9, '#9ae4ff', '#0a0e1a', 2)}`,
    'respawn': () => `${bg('#0a1a30', '#1a3a6a', '#9ae4ff')}${D.beams('#c8f2ff', .08)}<ellipse cx="60" cy="98" rx="42" ry="11" fill="#6bc8ff" opacity=".35" stroke="#c8f2ff" stroke-width="2"/><ellipse cx="60" cy="98" rx="30" ry="7" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>
      ${[0, 1, 2, 3].map(i => `<path d="M${36 + i * 16} 96 V${40 + (i % 2) * 10}" stroke="#c8f2ff" stroke-width="2" opacity=".5"/>`).join('')}<g opacity=".8">${P('', { x: 26, y: 24, s: .52, eye: 'closed' })}</g>
      <circle cx="96" cy="26" r="13" fill="#0a1a30" stroke="#9ae4ff" stroke-width="2"/>${txt('3', 96, 32, 16, '#fff', '#0a1a30', 2)}${D.motes('#c8f2ff', 8)}`,
    'dodge-roll': () => `${bg('#141a2a', '#2a3450')}${D.grid('#9aa6c8', .04)}<path d="M0 50 H120" stroke="#ff8a5a" stroke-width="10" opacity=".18"/>${arrow(76, 50, 0, 2, '#ff8a5a')}${D.grass(100, '#2a3a2a')}
      <g transform="rotate(-30 46 78)">${P('marksman', { x: 26, y: 56, s: .4, eye: 'wide' })}</g><path d="M18 100 C30 112 60 114 76 100" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="3 3" opacity=".6"/>${[[16, 96], [24, 102]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#8a7a5a" opacity=".6"/>`).join('')}`,
    'victory-pose': () => `${bg('#06122a', '#123a5a')}${D.beams('#9ae4ff', .1)}${[...Array(14)].map((_, i) => `<rect x="${(i * 29 + 7) % 112}" y="${(i * 41 + 9) % 80}" width="3" height="6" rx="1" fill="${['#ff5a6a', '#6bc8ff', '#5fd08a', '#ffd36b', '#b98cff'][i % 5]}" transform="rotate(${i * 37} ${(i * 29 + 7) % 112} ${(i * 41 + 9) % 80})"/>`).join('')}
      <path d="M14 96 H106 L100 108 H20 Z" fill="#3a4a6a" stroke="#0a1428" stroke-width="2"/><path d="M20 108 H100 V120 H20 Z" fill="#2a3450"/>${txt('1', 60, 106, 9, '#ffd36b', 'none', 0)}
      ${P('fighter', { x: 4, y: 30, s: .5, eye: 'happy' })}
      <g transform="translate(84 46)">${glow(0, 0, 26, '#ffd36b', .45)}<path d="M-14 -16 H14 C14 2 8 10 0 12 C-8 10 -14 2 -14 -16 Z" fill="#ffd36b" stroke="#6a4a08" stroke-width="2"/><path d="M-14 -12 C-24 -12 -24 2 -10 4 M14 -12 C24 -12 24 2 10 4" stroke="#ffd36b" stroke-width="3" fill="none"/>
        <path d="M-9 -12 C-9 -2 -5 4 -2 6" stroke="#fff6c8" stroke-width="2" fill="none" opacity=".7"/><rect x="-3" y="12" width="6" height="8" fill="#c8941c"/><rect x="-10" y="20" width="20" height="5" rx="1.5" fill="#8a5a10" stroke="#3a2004" stroke-width="1.2"/></g>
      ${txt('VICTORY', 60, 22, 15, '#c8f2ff', '#06122a', 3)}`
  };

  // Hologramm-Figuren der Animated Rares (eigene Ebene, schwebt ueber der Karte)
  const POP = {
    'hypercarry': () => `<g class="a-float">${bow(84, 60, .8)}${P('marksman', { x: 10, y: 18, s: .66, eye: 'angry' })}</g>`,
    'last-stand': () => `<g class="a-float">${P('tank', { x: 2, y: 16, s: .62, eye: 'angry' })}${shield(80, 62, 1.15, '#b83a3a', '#ffd36b')}</g>`,
    'shadow-strike': () => `<g class="a-float">${dagger(24, 94, -30, 1.05)}${dagger(100, 96, 30, 1.05)}${P('rogue', { x: 14, y: 16, s: .66, eye: 'angry' })}</g>`
  };

  // ---------- Full Arts (Nutzerwahl 2026-11-09: #2, 5, 10, 14, 20, 28, 37, 38, 44, 48) ----------
  // Szene 120x168 (Hochformat, randlos), Mittelebene schwebt auf ~45 % Hoehe,
  // Hologramm-Figur (120x120) liegt oben auf der Karte (left/right 4 %, top 7 %).
  const fbg = (top, mid, bottom) => { const a = U('lfb'); return `<defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="120" height="168" fill="url(#${a})"/>`; };
  const fvig = (op = .5) => { const v = U('lfv'); return `<defs><radialGradient id="${v}" cx=".5" cy=".42" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${op}"/></radialGradient></defs><rect width="120" height="168" fill="url(#${v})"/>`; };
  const fmotes = (c = '#fff', n = 12) => [...Array(n)].map((_, i) => `<circle cx="${(i * 37 + 11) % 112 + 4}" cy="${(i * 53 + 7) % 150 + 6}" r="${.7 + (i % 3) * .45}" fill="${c}" opacity="${.35 + (i % 4) * .12}"/>`).join('');
  const petal = (x, y, r, c = '#ff9ac8', cls = '') => `<path class="${cls}" transform="translate(${x} ${y}) rotate(${r})" d="M0 -3.6 C3.2 -1.4 3.2 1.4 0 3.6 C-3.2 1.4 -3.2 -1.4 0 -3.6 Z" fill="${c}"/>`;
  // Drehen um die eigene Mitte (fill-box) - a-spin dreht um die Bildmitte
  const shuriken = (x, y, s = 1, cls = '') => `<g transform="translate(${x} ${y}) scale(${s})"><g${cls ? ' class="a-spin" style="transform-box: fill-box; transform-origin: center; animation-duration: 2.4s"' : ''}><path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill="#c8d0e0" stroke="#2a3040" stroke-width="1.2"/><circle r="2.6" fill="#2a3040"/><path d="M0 -10 L2 -3" stroke="#fff" stroke-width=".8"/></g></g>`;
  const torch = (x, y) => `${glow(x, y - 6, 16, '#ffb43a', .6, 'a-pulse')}<rect x="${x - 2}" y="${y}" width="4" height="14" fill="#5a3a1a"/><rect x="${x - 4}" y="${y - 2}" width="8" height="4" rx="1" fill="#8a96aa"/>${flame(x, y - 8, .28)}`;
  const cloud = (x, y, s = 1, c = '#fff', o = .9) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="16" ry="8" fill="${c}"/><ellipse cx="-10" cy="2" rx="10" ry="6" fill="${c}"/><ellipse cx="11" cy="2" rx="11" ry="6.5" fill="${c}"/><ellipse cx="2" cy="-6" rx="9" ry="7" fill="${c}"/></g>`;
  const heart = (x, y, s = 1, c = '#ff5a8a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -4 C-6 -14 -20 -6 0 12 C20 -6 6 -14 0 -4 Z" fill="${c}" stroke="#fff" stroke-width="2"/><path d="M-9 -8 C-11 -8 -12 -5 -11 -3" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/></g>`;

  const FA_ART = {
    // #2 Shadow Strike: Daecher bei Vollmond, Kirschblueten
    'shadow-strike': () => `${fbg('#06030e', '#1e0a26', '#0a0410')}${glow(84, 40, 60, '#ffe9c8', .35, 'a-pulse')}<circle cx="84" cy="40" r="26" fill="#fff2d8"/><circle cx="76" cy="34" r="5" fill="#e8d8b8" opacity=".6"/><circle cx="92" cy="48" r="3" fill="#e8d8b8" opacity=".6"/>
      ${[[10, 20], [30, 12], [104, 82], [16, 64], [50, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#fff" opacity=".8"/>`).join('')}
      <path d="M0 168 V112 L14 104 L36 104 L48 112 V168 Z M54 168 V100 L62 92 L56 92 L72 78 L88 92 L82 92 L90 100 V168 Z M96 168 V116 L106 110 L120 110 V168 Z" fill="#05020a"/>
      <path d="M56 92 L72 78 L88 92 M2 104 H40" stroke="#3a1a3a" stroke-width="1.6" fill="none"/>${[[64, 108], [74, 108], [64, 124], [10, 120], [104, 126]].map(([x, y]) => `<rect x="${x}" y="${y}" width="3.4" height="5" fill="#ffb43a" opacity=".8"/>`).join('')}
      <path d="M0 64 C20 60 30 70 40 66 C50 62 46 54 56 52" stroke="#2a0e1a" stroke-width="3" fill="none"/>${[[8, 62], [20, 58], [34, 66], [46, 58], [52, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#ff8ab8" opacity=".85"/>`).join('')}
      ${[[20, 90, 30], [40, 130, -20], [100, 60, 50], [12, 150, 10], [70, 140, -40], [110, 110, 70]].map(([x, y, r], i) => petal(x, y, r, '#ff9ac8', `a-twinkle d${i % 4}`)).join('')}${fvig(.6)}`,
    // #5 Iron Bulwark: Burgtor mit Fackeln und Bannern
    'iron-bulwark': () => `${fbg('#0e1420', '#1e2838', '#0a0e16')}
      ${[...Array(8)].map((_, r) => [...Array(5)].map((_, c) => `<rect x="${c * 26 - (r % 2) * 13}" y="${r * 18}" width="25" height="17" fill="#2e3646" stroke="#141a24" stroke-width="1.4"/>`).join('')).join('')}
      <path d="M24 168 V96 C24 64 96 64 96 96 V168 Z" fill="#141a24" stroke="#4a5466" stroke-width="3"/>${[34, 46, 58, 70, 82].map(x => `<path d="M${x} 80 V168" stroke="#4a5466" stroke-width="3"/>`).join('')}${[100, 120, 140].map(y => `<path d="M26 ${y} H94" stroke="#4a5466" stroke-width="2.4"/>`).join('')}
      ${[[10, 20, '#3a7ab8'], [98, 20, '#b83a4a']].map(([x, y, c]) => `<path d="M${x} ${y} h14 v36 l-7 -6 -7 6 Z" fill="${c}" stroke="#0a0e16" stroke-width="1.4"/><path d="M${x + 7} ${y + 8} l3 6 -3 6 -3 -6 Z" fill="#ffd36b"/>`).join('')}
      ${torch(12, 76)}${torch(108, 76)}<rect x="0" y="150" width="120" height="18" fill="#1a1e28"/>${fmotes('#ffd08a', 8)}${fvig(.55)}`,
    // #10 Duelist's Oath: Arena im Abendlicht
    'duelists-oath': () => `${fbg('#2a0e1e', '#7a3a2a', '#1a0a10')}${glow(60, 70, 70, '#ffb46b', .55)}${rays(60, 70, '#ffe0b0', 16, .08, 140, 'a-spin')}
      <path d="M0 120 V70 H120 V120 Z" fill="#4a2420"/>${[...Array(6)].map((_, i) => `<path d="M${4 + i * 20} 120 V88 C${4 + i * 20} 78 ${18 + i * 20} 78 ${18 + i * 20} 88 V120 Z" fill="#2a1014"/>`).join('')}<path d="M0 70 H120" stroke="#c8946a" stroke-width="2"/>
      ${[...Array(12)].map((_, i) => `<circle cx="${5 + i * 10}" cy="${64 - (i % 2) * 3}" r="3" fill="#1a080c"/>`).join('')}
      <path d="M0 168 V124 Q60 112 120 124 V168 Z" fill="#8a5a3a"/><path d="M0 124 Q60 112 120 124" stroke="#c8946a" stroke-width="1.6" fill="none"/>
      ${[[10, 30], [110, 36]].map(([x, y]) => `<path d="M${x} ${y} v26" stroke="#5a3a2a" stroke-width="2"/><path d="M${x} ${y} h12 l-3 4 3 4 h-12" fill="#c8202e"/>`).join('')}${fmotes('#ffe0b0', 10)}${fvig(.5)}`,
    // #14 Kite: Herbstwald, Pfad im Abendlicht
    'kite': () => `${fbg('#3a1a0a', '#8a4a14', '#2a1408')}${glow(60, 80, 64, '#ffc86b', .5)}${D.beams('#ffd08a', .1)}
      ${[[6, 0, 16], [104, 0, 18], [24, 0, 10], [88, 0, 10]].map(([x, , w]) => `<path d="M${x} -2 C${x + 4} 60 ${x - 4} 110 ${x + 2} 170" stroke="#2a1408" stroke-width="${w}" fill="none"/>`).join('')}
      ${[[10, 24, '#e2733a'], [30, 14, '#ffb43a'], [96, 18, '#c84a1a'], [112, 40, '#e2733a'], [18, 50, '#ffb43a'], [84, 44, '#e2a03a']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="16" fill="${c}" opacity=".9"/>`).join('')}
      <path d="M40 168 C46 140 54 120 60 104 C66 120 74 140 80 168 Z" fill="#5a3a1a"/>${[[30, 130, 20], [90, 120, -40], [50, 150, 60], [74, 144, 10], [20, 100, -20], [100, 96, 30]].map(([x, y, r], i) => petal(x, y, r, ['#e2733a', '#ffb43a', '#c84a1a'][i % 3], `a-twinkle d${i % 4}`)).join('')}
      ${fmotes('#ffe0a0', 10)}${fvig(.5)}`,
    // #20 Sustain: Heilquelle in der Lichtung
    'sustain': () => `${fbg('#04160c', '#0e3a20', '#041008')}${D.beams('#c8ffd8', .1)}
      <ellipse cx="60" cy="128" rx="56" ry="16" fill="#2a8a6a"/><ellipse cx="60" cy="126" rx="50" ry="12" fill="#5fd0b0" opacity=".7"/><g class="a-pulse" style="transform-origin:60px 126px">${glow(60, 126, 40, '#9affd8', .6)}</g>
      ${[0, 1, 2].map(i => `<ellipse cx="60" cy="126" rx="${16 + i * 14}" ry="${4 + i * 3}" fill="none" stroke="#d8fff0" stroke-width="1" opacity="${.6 - i * .15}"/>`).join('')}
      ${[[8, 120], [112, 118], [20, 140], [100, 142]].map(([x, y]) => `<path d="M${x} ${y} C${x - 6} ${y - 30} ${x + 6} ${y - 50} ${x} ${y - 70}" stroke="#1e5a2e" stroke-width="6" fill="none"/><circle cx="${x}" cy="${y - 70}" r="10" fill="#2a7a3a"/>`).join('')}
      <path d="M0 168 V146 Q60 136 120 146 V168 Z" fill="#0a2a14"/>${fmotes('#c8ffd8', 14)}${fvig(.5)}`,
    // #28 Out of Mana: Bibliothek bei Nacht mit erloschenen Kristallen
    'out-of-mana': () => `${fbg('#0a0a24', '#16163a', '#06061a')}
      ${[0, 1].map(k => `<g transform="translate(${k ? 86 : 0} 0)"><rect x="0" y="0" width="34" height="168" fill="#2a1a10"/>${[0, 1, 2, 3, 4, 5].map(r => `<rect x="2" y="${8 + r * 26}" width="30" height="3" fill="#4a2e18"/>${[...Array(6)].map((_, i) => `<rect x="${3 + i * 5}" y="${-10 + r * 26 + (i % 3)}" width="4" height="${17 - (i % 3)}" fill="${['#5a2a4a', '#2a4a6a', '#6a4a1a', '#3a5a3a'][(i + r) % 4]}"/>`).join('')}`).join('')}</g>`).join('')}
      <rect x="34" y="104" width="52" height="8" fill="#4a2e18"/>${[44, 60, 76].map((x, i) => `<path d="M${x} 104 l-5 -10 5 -14 5 14 Z" fill="${i === 1 ? '#3a4a6a' : '#2a3048'}" stroke="#6a7a9a" stroke-width="1"/>`).join('')}
      <path d="M38 40 C38 24 82 24 82 40 V70 H38 Z" fill="#141a3a" stroke="#4a3a2a" stroke-width="3"/><circle cx="68" cy="44" r="7" fill="#e8e8f8" opacity=".6"/><path d="M60 70 V24 M38 50 H82" stroke="#4a3a2a" stroke-width="2"/>${fmotes('#8ab8ff', 8)}${fvig(.6)}`,
    // #37 Missing: Nebel ueber der Karte, Fragezeichen
    'missing': () => `${fbg('#1a1404', '#3a2a0a', '#100c04')}${D.grid('#ffd08a', .08)}
      <path d="M0 0 C40 30 80 20 120 40 V0 Z" fill="#2a4a2a" opacity=".5"/><path d="M0 168 C30 120 80 150 120 110 V168 Z" fill="#1e3a20" opacity=".7"/>
      ${[[18, 40], [96, 64], [30, 112], [88, 140], [60, 26]].map(([x, y], i) => `<text class="a-twinkle d${i % 4}" x="${x}" y="${y}" text-anchor="middle" font-family="Arial Black" font-weight="900" font-size="${12 + (i % 3) * 4}" fill="#ffd08a" opacity=".45">?</text>`).join('')}
      ${[[10, 70, 30], [90, 100, 40], [40, 150, 36]].map(([x, y, w]) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="8" fill="#fff" opacity=".07"/>`).join('')}${fmotes('#ffd08a', 8)}${fvig(.6)}`,
    // #38 Back Off: Gefahrenzone, rote Augen im Dunkeln
    'back-off': () => `${fbg('#200404', '#4a0a0a', '#120202')}<g class="a-pulse" style="transform-origin:60px 70px">${glow(60, 70, 70, '#ff3a3a', .45)}</g>
      ${[0, 1, 2, 3].map(i => `<circle cx="60" cy="70" r="${30 + i * 18}" fill="none" stroke="#ff5a5a" stroke-width="1.4" opacity="${.45 - i * .1}" stroke-dasharray="6 5"/>`).join('')}
      <path d="M0 168 V128 L20 120 L36 130 L58 118 L80 132 L100 120 L120 128 V168 Z" fill="#0a0202"/>
      ${[[18, 112], [98, 108], [60, 140], [30, 150]].map(([x, y]) => `<ellipse cx="${x - 4}" cy="${y}" rx="2.6" ry="1.4" fill="#ff3a3a"/><ellipse cx="${x + 4}" cy="${y}" rx="2.6" ry="1.4" fill="#ff3a3a"/>`).join('')}
      ${[...Array(6)].map((_, i) => `<path d="M${i * 24 - 10} 0 L${i * 24 + 4} 0 L${i * 24 - 16} 18 L${i * 24 - 30} 18 Z" fill="#ffd36b" opacity=".18"/>`).join('')}${fvig(.6)}`,
    // #44 Duo Queue: Sonnenuntergang auf dem Huegel
    'duo-queue': () => `${fbg('#2a0a2a', '#c84a5a', '#3a1420')}${glow(60, 96, 60, '#ffd08a', .7)}<circle cx="60" cy="100" r="24" fill="#ffd08a"/>
      ${[0, 1, 2].map(i => `<rect x="0" y="${92 + i * 6}" width="120" height="2" fill="#c84a5a" opacity=".6"/>`).join('')}
      ${cloud(20, 40, 1, '#ff9ab0', .5)}${cloud(96, 30, 1.2, '#ff9ab0', .45)}
      <path d="M0 168 V118 Q60 102 120 118 V168 Z" fill="#2a0a1a"/><path d="M0 128 Q40 120 70 126 T120 124 V168 H0 Z" fill="#1a0610"/>
      ${[[30, 20], [56, 14], [84, 24], [104, 58], [14, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#fff" opacity=".8"/>`).join('')}${fmotes('#ffd0e0', 8)}${fvig(.45)}`,
    // #48 Respawn: Brunnen der Basis mit Kristall
    'respawn': () => `${fbg('#04102a', '#0e2a5a', '#040a1a')}${D.beams('#9ae4ff', .1)}
      <ellipse cx="60" cy="138" rx="56" ry="14" fill="#1a3a6a" stroke="#6bc8ff" stroke-width="2"/><ellipse cx="60" cy="136" rx="46" ry="9" fill="#6bc8ff" opacity=".5"/><g class="a-pulse" style="transform-origin:60px 136px">${glow(60, 136, 40, '#c8f2ff', .7)}</g>
      ${[...Array(10)].map((_, i) => { const a = i / 10 * Math.PI * 2; return `<path d="M${(60 + Math.cos(a) * 50).toFixed(1)} ${(138 + Math.sin(a) * 12).toFixed(1)} v-${20 + (i % 3) * 14}" stroke="#c8f2ff" stroke-width="1.4" opacity=".4"/>`; }).join('')}
      ${[[12, 60], [108, 60]].map(([x, y]) => `<path d="M${x} ${y} l-8 20 8 40 8 -40 Z" fill="#3a8ad8" stroke="#c8f2ff" stroke-width="1.4"/>`).join('')}${fmotes('#c8f2ff', 14)}${fvig(.5)}`
  };
  // Mittlere Ebene: Teile der Szene schweben zwischen Szene und Figur
  const FA_MID = {
    // Dolche + Wurfsterne in der Mittelebene (in der vordersten Ebene zeigten duenne schraege Klingen Treppenkanten)
    'shadow-strike': () => `${dagger(26, 112, -34, 1.1)}${dagger(96, 114, 34, 1.1)}`,
    'iron-bulwark': () => `${[[14, 40, 150], [104, 50, 30], [20, 110, 200], [100, 118, -20]].map(([x, y, r]) => arrow(x, y, r, .8, '#c8d0e0')).join('')}`,
    'duelists-oath': () => `${glow(60, 98, 22, '#fff', .8)}${spark(60, 98, 1.6, 1, 'a-twinkle', '#fff6c8')}${[[44, 90], [76, 92], [52, 110], [70, 108]].map(([x, y]) => spark(x, y, .5, .9, '', '#ffe0b0')).join('')}`,
    'kite': () => `${arrow(20, 60, 180, 1.1, '#ffe08a')}${arrow(14, 90, 176, 1, '#ffe08a')}${arrow(26, 120, 184, .9, '#ffe08a')}`,
    'sustain': () => `${cross(20, 40, .7, '#9affb8')}${cross(102, 56, .6, '#9affb8')}${cross(16, 104, .5, '#9affb8')}${cross(106, 116, .55, '#9affb8')}`,
    'out-of-mana': () => `${bar(14, 146, 92, 10, .03, '#3a8aff')}${[[20, 40], [100, 34], [24, 96], [98, 100]].map(([x, y], i) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="#6a7aaa" opacity=".7">${'ᚠᚱᚦᚨ'[i]}</text>`).join('')}`,
    'missing': () => `${bush(28, 132, 36, '#1e5a2e', '#164a24')}${bush(92, 134, 36, '#1e5a2e', '#164a24')}<ellipse cx="88" cy="128" rx="2.4" ry="1.4" fill="#ffe46b"/><ellipse cx="96" cy="128" rx="2.4" ry="1.4" fill="#ffe46b"/>`,
    'back-off': () => `${[0, 1].map(i => `<ellipse cx="60" cy="128" rx="${30 + i * 16}" ry="${8 + i * 4}" fill="none" stroke="#ff5a5a" stroke-width="2.4" opacity="${.8 - i * .3}"/>`).join('')}`,
    'duo-queue': () => `${heart(60, 30, 1.1)}${heart(22, 60, .5, '#ff9ab8')}${heart(100, 70, .55, '#ff9ab8')}`,
    'respawn': () => `${[0, 1].map(i => `<ellipse cx="60" cy="${126 - i * 26}" rx="${40 - i * 8}" ry="${8 - i * 2}" fill="none" stroke="#c8f2ff" stroke-width="2" opacity="${.8 - i * .3}" stroke-dasharray="6 4"/>`).join('')}`
  };
  // Bewegte 3D-Ebene (ein flaches Blatt ohne Kanten-Schichten): dreht/pulsiert scharf
  const FA_FX = {
    'shadow-strike': () => `${shuriken(18, 40, 1, 'spin')}${shuriken(104, 50, .8, 'spin')}${shuriken(16, 124, .7, 'spin')}`
  };
  // Hologramm-Figuren (120x120)
  const FA_POP = {
    'shadow-strike': () => `<g class="a-float">${P('rogue', { x: 14, y: 14, s: .7, eye: 'angry' })}</g>`,
    'iron-bulwark': () => `<g class="a-float">${P('tank', { x: 0, y: 12, s: .64, eye: 'angry' })}${shield(80, 64, 1.2)}</g>`,
    'duelists-oath': () => `<g class="a-float">${sword(52, 104, 62, 28, '#e4ebf5', '#c8a96e')}${sword(68, 104, 62, -28, '#e4ebf5', '#c8a96e')}${P('fighter', { x: 64, y: 50, s: .48, eye: 'angry', flip: true })}${P('rogue', { x: 6, y: 50, s: .48, eye: 'angry', body: '#9aa6b8', shade: '#5a6478', mane: '#2a3040' })}</g>`,
    'kite': () => `<g class="a-float">${bow(88, 62, .85)}${P('marksman', { x: 14, y: 18, s: .64, eye: 'happy' })}</g>`,
    // grosses Heil-Kreuz als Hologramm (ohne Leuchtfleck - der wuerde in den 3D-Schichten mitwachsen)
    'sustain': () => { const g = U('lcx'); return `<g class="a-float"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8ffd0"/><stop offset=".5" stop-color="#4ac87a"/><stop offset="1" stop-color="#1e7a44"/></linearGradient></defs>
      <path d="M48 26 H72 V50 H96 V74 H72 V98 H48 V74 H24 V50 H48 Z" fill="url(#${g})" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
      <path d="M52 30 H68 V54 M28 54 H48" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/></g>`; },
    'out-of-mana': () => `<g class="a-float">${staff(96, 44, .85, '#3a4a6a')}${P('mage', { x: 12, y: 18, s: .62, eye: 'tired' })}</g>`,
    'missing': () => `<g class="a-float">${pingMark(60, 62, '#ffb43a', '?', 1.9)}</g>`,
    'back-off': () => `<g class="a-float">${pingMark(60, 62, '#e83a3a', '!', 1.9)}</g>`,
    'duo-queue': () => `<g class="a-float">${P('marksman', { x: 0, y: 40, s: .5, eye: 'happy' })}${P('support', { x: 64, y: 40, s: .5, eye: 'happy', flip: true, body: '#f6efe2', shade: '#d8c8b0', mane: '#ffb4d8' })}</g>`,
    'respawn': () => `<g class="a-float">${P('', { x: 14, y: 16, s: .66, eye: 'closed', body: '#f2f6ff', shade: '#9ab4d8', mane: '#6bc8ff' })}${[[18, 30], [100, 40], [26, 96], [98, 92]].map(([x, y]) => spark(x, y, .6, 1, '', '#c8f2ff')).join('')}</g>`
  };

  const LIST = [
    ['hypercarry', 'Hypercarry'], ['shadow-strike', 'Shadow Strike'], ['last-stand', 'Last Stand'],
    ['archmage', 'Archmage'], ['iron-bulwark', 'Iron Bulwark'], ['blade-dancer', 'Blade Dancer'], ['guardian-wings', 'Guardian Wings'], ['wild-hunter', 'Wild Hunter'], ['siege-engine', 'Siege Engine'], ['duelists-oath', 'Duelist\'s Oath'],
    ['combo-starter', 'Combo Starter'], ['hook-shot', 'Hook Shot'], ['peel', 'Peel'], ['kite', 'Kite'], ['engage', 'Engage!'], ['backline-dive', 'Backline Dive'], ['zone-control', 'Zone Control'], ['burst-window', 'Burst Window'],
    ['frontline', 'Frontline'], ['sustain', 'Sustain'], ['split-push', 'Split Push'], ['bubble-shield', 'Bubble Shield'], ['crowd-control', 'Crowd Control'], ['execute', 'Execute'], ['healing-aura', 'Healing Aura'],
    ['auto-attack', 'Auto Attack'], ['last-hit', 'Last Hit'], ['out-of-mana', 'Out of Mana'], ['on-cooldown', 'On Cooldown'], ['level-up', 'Level Up'], ['skill-point', 'Skill Point'], ['starter-item', 'Starter Item'], ['shop-run', 'Shop Run'], ['rune-page', 'Rune Page'], ['lane-swap', 'Lane Swap'],
    ['on-my-way', 'On My Way'], ['missing', 'Missing!'], ['back-off', 'Back Off'], ['top-lane', 'Top Lane'], ['mid-lane', 'Mid Lane'], ['bot-lane', 'Bot Lane'], ['jungle-path', 'Jungle Path'], ['support-item', 'Support Item'], ['duo-queue', 'Duo Queue'],
    ['champ-select', 'Champ Select'], ['instalock', 'Instalock'], ['loading-screen', 'Loading Screen'], ['respawn', 'Respawn'], ['dodge-roll', 'Dodge Roll'], ['victory-pose', 'Victory Pose']
  ];
  const rarityOf = n => n <= 3 ? 'anim' : n <= 10 ? 'holo' : n <= 25 ? 'uncommon' : 'common';
  const SET = LIST.map(([id, name], i) => ({ n: i + 1, id, name, r: rarityOf(i + 1) }));
  const { RL, RC } = B;

  // Karten-Front in Set-Farbe (Nutzer): dunkelrot; die Raritaet zeigen Rahmen,
  // Effekte und Text (Rahmen-Verlaeufe wie im Base Set)
  const css = document.createElement('style');
  css.textContent = `
  .stk-front.li.r-common { background: linear-gradient(160deg, #3c0c14, #160306) padding-box, linear-gradient(135deg, #e6ecf5, #7a8496 45%, #d8dee8 70%, #6a7486) border-box; }
  .stk-front.li.r-uncommon { background: radial-gradient(circle at 50% 35%, #40141c, #160306 70%) padding-box, linear-gradient(135deg, #b8ffd8, #2a8a4a 40%, #8affc0 65%, #1e6a3a) border-box; }
  .stk-front.li.r-holo { background: linear-gradient(160deg, #46101e, #14030a) padding-box, linear-gradient(var(--hb, 0deg), #ff7ad9, #ffd36b, #7bffb4, #6bc8ff, #b98cff, #ff7ad9) border-box; }
  .stk-front.li.r-anim { background: radial-gradient(circle at 50% 30%, #5a0e22, #14030a 70%) padding-box, linear-gradient(var(--hb, 0deg), #ff5ab4, #ffd36b, #ff5ab4, #b98cff, #ff5ab4) border-box; }
  .stk-front.li .meta { color: #b08a7a; }`;
  document.head.appendChild(css);
  const art = id => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${ART[id]()}</svg>`;
  const popLayers = id => B.popLayersOf(POP[id]);
  const frontHtml = s => `<div class="stk-face stk-front li r-${s.r}" style="--rc:${RC[s.r]}">
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
      const fl = U('lml');
      out += `<div class="fa-mid slab" style="--i:${k};--shade:${(.3 + k / MID_SLABS * .25).toFixed(2)}">${wrap(`<defs><filter id="${fl}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="1.1"/></filter></defs><g filter="url(#${fl})">${svg}</g>`)}</div>`;
    }
    return out + `<div class="fa-mid" style="--i:${MID_SLABS}">${wrap(svg)}</div>`;
  };
  const faFx = id => FA_FX[id] ? `<div class="fa-fx"><svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${FA_FX[id]()}</svg></div>` : '';
  const faMidFlat = id => FA_MID[id] ? `<svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${FA_MID[id]()}</svg>` : '';
  const faPopFlat = id => FA_POP[id] ? `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${FA_POP[id]()}</svg>` : '';
  window.STICKERS_LOCKIN = { id: 'lockin', name: 'Lock In', SET, RL, RC, art, frontHtml, square, square3d, TOTAL: SET.length, faArt, faPop, faPopFlat, faMid, faMidFlat, faFx };
  window.STICKER_SETS = window.STICKER_SETS || {};
  window.STICKER_SETS.lockin = window.STICKERS_LOCKIN;
})();
