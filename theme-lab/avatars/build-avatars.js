// Profilbilder (v6.3.0, Ueberarbeitung 2: "krasser"): erzeugt
// public/avatars/<id>.svg. Gemeinsame Pony-Silhouette (Kopf nach rechts) mit
// Licht/Schatten, Mähnen-Straehnen und Iris; pro Bild eigener Hintergrund mit
// Tiefe, Partikeln und Effekten. Animated per SMIL (laeuft auch als <img>).
// Aufruf: node theme-lab/avatars/build-avatars.js
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', '..', 'public', 'avatars');
fs.mkdirSync(OUT, { recursive: true });

// ---------- Pony (viewBox 0 0 256 256) ----------
const HEAD = 'M70 246 C66 208 70 174 84 148 C94 128 100 112 102 94 C104 76 114 62 128 56 L133 30 L147 53 C165 55 181 63 195 77 C211 93 223 111 229 127 C233 139 229 151 217 153 C205 155 195 149 185 145 C175 141 167 145 163 157 C157 177 161 210 171 246 Z';
const EAR_IN = 'M134 40 L141 55 L131 57 Z';
const MANE = 'M102 94 C86 98 72 112 64 132 C54 156 52 190 56 224 L70 246 C66 208 70 174 84 148 C94 128 100 112 102 94 Z';
const FORELOCK = 'M129 55 C119 63 111 76 107 90 C119 84 128 73 134 61 Z';
const TUFTS = 'M60 150 C46 160 42 174 44 190 C53 178 60 168 66 160 Z M56 192 C42 202 40 218 44 234 C51 220 56 210 60 202 Z M78 112 C64 116 56 126 52 138 C62 132 70 126 80 122 Z';
const STRANDS = 'M98 100 C84 112 76 130 72 152 M90 112 C80 130 74 160 74 196 M82 132 C74 156 70 186 72 220 M120 62 C114 70 110 80 109 88';
const RIM = 'M147 53 C165 55 181 63 195 77 C211 93 223 111 229 127';
const SHADE = 'M70 246 C66 208 70 174 84 148 C94 128 100 112 102 94 C112 100 118 120 116 148 C114 182 118 214 128 246 Z';

function pony(o) {
  const {
    id, body, mane, outline = '#0b0f1a', iris = '#3a2a1a', glow = null, rim = '#ffffff', rimOpacity = 0.45,
    strand = 'rgba(0,0,0,.28)', extra = '', maneExtra = ''
  } = o;
  return `
  <g stroke="${outline}" stroke-width="3" stroke-linejoin="round">
    <path d="${MANE}" fill="${mane}"/>
    <path d="${TUFTS}" fill="${mane}"/>
  </g>
  <path d="${STRANDS}" fill="none" stroke="${strand}" stroke-width="2.2" stroke-linecap="round"/>
  ${maneExtra}
  <path d="${HEAD}" fill="${body}" stroke="${outline}" stroke-width="3" stroke-linejoin="round"/>
  <path d="${SHADE}" fill="#000" opacity=".22"/>
  <ellipse cx="158" cy="134" rx="18" ry="12" fill="#000" opacity=".06"/>
  <path d="${RIM}" fill="none" stroke="${rim}" stroke-width="4" stroke-linecap="round" opacity="${rimOpacity}"/>
  <path d="M138 58 C150 62 158 72 162 84" fill="none" stroke="${rim}" stroke-width="3" stroke-linecap="round" opacity="${rimOpacity * 0.7}"/>
  <path d="${FORELOCK}" fill="${mane}" stroke="${outline}" stroke-width="3" stroke-linejoin="round"/>
  <path d="${EAR_IN}" fill="${outline}" opacity=".35"/>
  ${glow ? `<circle cx="176" cy="98" r="17" fill="${glow}" opacity=".35"/><circle cx="176" cy="98" r="11" fill="${glow}" opacity=".5"/>` : ''}
  <circle cx="176" cy="98" r="8.5" fill="#fff" stroke="${outline}" stroke-width="2"/>
  <circle cx="177.5" cy="98.5" r="6" fill="${iris}"/>
  <circle cx="178" cy="99" r="3" fill="#05060a"/>
  <circle cx="180" cy="96" r="1.9" fill="#fff"/><circle cx="175.5" cy="101.5" r="1" fill="#fff" opacity=".8"/>
  <path d="M167 92 C171 88 178 87 184 89" fill="none" stroke="${outline}" stroke-width="2.5" stroke-linecap="round"/>
  <ellipse cx="213" cy="136" rx="4.2" ry="3" fill="${outline}" opacity=".6"/>
  <path d="M200 147 C206 150 212 150 218 147" fill="none" stroke="${outline}" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
  ${extra}`;
}
const FG = inner => `<g transform="translate(20 30) scale(0.84)">${inner}</g>`;

// ---------- Helfer ----------
const radial = (id, stops, cx = '50%', cy = '40%', r = '75%') => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
const linear = (id, stops, x2 = '0', y2 = '1') => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const rng = seed => { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
const stars = (n, seed, color = '#fff', maxR = 2, yMax = 170, twinkle = false) => {
  const r = rng(seed); let out = '';
  for (let i = 0; i < n; i++) {
    const x = (r() * 256).toFixed(1), y = (r() * yMax).toFixed(1), rad = (0.5 + r() * maxR).toFixed(1), op = (0.35 + r() * 0.65).toFixed(2);
    out += twinkle
      ? `<circle cx="${x}" cy="${y}" r="${rad}" fill="${color}" opacity="${op}"><animate attributeName="opacity" values="${op};.1;${op}" dur="${(1.5 + r() * 2.5).toFixed(1)}s" begin="${(r() * 2).toFixed(1)}s" repeatCount="indefinite"/></circle>`
      : `<circle cx="${x}" cy="${y}" r="${rad}" fill="${color}" opacity="${op}"/>`;
  }
  return out;
};
const sparkle = (x, y, s, fill, anim = '') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 L2.4 -2.4 L10 0 L2.4 2.4 L0 10 L-2.4 2.4 L-10 0 L-2.4 -2.4 Z" fill="${fill}">${anim}</path>`;
// gemeinsamer Abschluss: Vignette + Innenring + Lichtschimmer oben links
const FINISH = (ring = '#ffffff', ringOp = 0.25) => `
  <rect width="256" height="256" fill="url(#vig)"/>
  <circle cx="128" cy="128" r="121" fill="none" stroke="${ring}" stroke-width="3" opacity="${ringOp}"/>
  <ellipse cx="78" cy="48" rx="70" ry="26" fill="#fff" opacity=".06" transform="rotate(-28 78 48)"/>`;
const VIG = radial('vig', [[0.55, '#000', 0], [1, '#000', 0.55]], '50%', '50%', '72%');
const svg = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">\n<defs>${VIG}${defs}</defs>\n${body}\n</svg>\n`;

// ---------- Die Bilder ----------
const A = {};

// ===== Refined =====
A['avatar-shop-golden'] = svg(
  radial('bg', [[0, '#3a4f8a'], [0.55, '#16224a'], [1, '#070b1c']], '50%', '35%') + linear('b', [[0, '#fff0b0'], [0.45, '#f2c25a'], [1, '#a8701c']]) + linear('m', [[0, '#fffbe6'], [1, '#e8b24a']]) + radial('halo', [[0, '#ffe08a', 0.55], [1, '#ffe08a', 0]]),
  `<rect width="256" height="256" fill="url(#bg)"/>
   <circle cx="150" cy="110" r="100" fill="url(#halo)"/>
   <g stroke="#ffd57a" stroke-width="2" opacity=".18">${[...Array(16)].map((_, i) => `<line x1="150" y1="110" x2="${150 + Math.cos(i / 16 * 6.283) * 200}" y2="${110 + Math.sin(i / 16 * 6.283) * 200}"/>`).join('')}</g>
   ${stars(30, 7, '#ffe9a8', 1.4)}
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#4a3410', iris: '#8a5a12', rim: '#fff6d0', strand: 'rgba(160,110,20,.45)' }))}
   ${sparkle(46, 70, 1, '#fff2c4')}${sparkle(212, 196, 0.7, '#fff2c4')}
   ${FINISH('#e2b04a', 0.5)}`);

A['avatar-shop-crimson'] = svg(
  linear('bg', [[0, '#7a1424'], [1, '#1c0509']]) + linear('b', [[0, '#ff8a8a'], [0.5, '#e0283f'], [1, '#7a0c1c']]) + linear('m', [[0, '#3a0a14'], [1, '#10030a']]),
  `<rect width="256" height="256" fill="url(#bg)"/>
   <g opacity=".22" stroke="#ff8a8a" stroke-width="12">${[...Array(10)].map((_, i) => `<line x1="${-80 + i * 40}" y1="256" x2="${20 + i * 40}" y2="0"/>`).join('')}</g>
   <g fill="#ffb3b3" opacity=".5">${[...Array(14)].map((_, i) => { const r = rng(i + 3); return `<rect x="${(r() * 256).toFixed(0)}" y="${(r() * 256).toFixed(0)}" width="2" height="${(8 + r() * 14).toFixed(0)}" transform="rotate(25)"/>`; }).join('')}</g>
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#1a0408', iris: '#ffcc4d', glow: '#ff3b3b', strand: 'rgba(255,90,90,.35)' }))}
   ${FINISH('#ff6b6b', 0.4)}`);

A['avatar-shop-meadow'] = svg(
  linear('sky', [[0, '#6cc4ff'], [0.7, '#dff4ff']]) + linear('h1', [[0, '#8fd46c'], [1, '#4c9a3c']]) + linear('h2', [[0, '#6cbf55'], [1, '#2f7a2c']]) + linear('b', [[0, '#f1d2a8'], [0.5, '#cfa070'], [1, '#8e6238']]) + radial('sun', [[0, '#fffbe0'], [0.4, '#fff1a0', 0.8], [1, '#fff1a0', 0]]),
  `<rect width="256" height="256" fill="url(#sky)"/>
   <circle cx="56" cy="50" r="46" fill="url(#sun)"/><circle cx="56" cy="50" r="16" fill="#fff9d6"/>
   <g fill="#fff" opacity=".85"><ellipse cx="190" cy="44" rx="30" ry="10"/><ellipse cx="208" cy="38" rx="18" ry="10"/><ellipse cx="120" cy="70" rx="20" ry="6"/></g>
   <path d="M0 160 C50 140 90 150 140 146 C190 142 220 130 256 138 L256 256 L0 256 Z" fill="url(#h1)"/>
   <path d="M0 196 C60 176 130 200 256 176 L256 256 L0 256 Z" fill="url(#h2)"/>
   <g>${[[24, 214, '#fff'], [40, 226, '#ffd1e8'], [222, 200, '#fff'], [204, 230, '#ffe27a'], [236, 222, '#ffd1e8'], [14, 238, '#ffe27a']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${c}"/><circle cx="${x}" cy="${y}" r="1.6" fill="#f2b234"/>`).join('')}</g>
   ${FG(pony({ body: 'url(#b)', mane: '#fdf6ea', outline: '#4b3320', iris: '#6b4423', strand: 'rgba(170,140,100,.45)' }))}
   ${FINISH('#ffffff', 0.35)}`);

A['avatar-shop-tide'] = svg(
  linear('bg', [[0, '#0e6a8c'], [0.6, '#08374d'], [1, '#03141f']]) + linear('b', [[0, '#b8fff6'], [0.5, '#4fd6cf'], [1, '#14817f']]) + linear('m', [[0, '#ffffff'], [0.5, '#9fe8ff'], [1, '#2e9bd6']]) + radial('lt', [[0, '#bff6ff', 0.45], [1, '#bff6ff', 0]], '50%', '0%', '80%'),
  `<rect width="256" height="256" fill="url(#bg)"/>
   <rect width="256" height="256" fill="url(#lt)"/>
   <g fill="#c8f7ff" opacity=".12">${[40, 90, 150, 200].map(x => `<path d="M${x} 0 L${x + 22} 0 L${x + 60} 256 L${x + 30} 256 Z"/>`).join('')}</g>
   <g fill="none" stroke="#8ef0ff" stroke-linecap="round">
     <path d="M-10 190 C20 174 40 206 70 190 S120 174 150 190 S200 206 230 190 S270 174 280 190" stroke-width="5" opacity=".35"/>
     <path d="M-10 214 C20 198 40 230 70 214 S120 198 150 214 S200 230 230 214 S270 198 280 214" stroke-width="4" opacity=".25"/></g>
   <g fill="#e6fdff" opacity=".7">${[[30, 120, 5], [42, 92, 3], [220, 150, 4], [232, 118, 2.5], [200, 70, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#e6fdff" stroke-width="1.5"/>`).join('')}</g>
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#06303d', iris: '#0b6e8a', strand: 'rgba(20,110,140,.4)' }))}
   ${FINISH('#7fe3ff', 0.4)}`);

A['avatar-shop-dusk'] = svg(
  linear('bg', [[0, '#2a1f5e'], [0.55, '#9a5cc0'], [1, '#f6b8c8']]) + linear('b', [[0, '#f4eaff'], [0.5, '#cdb4f2'], [1, '#8f6fd0']]) + linear('m', [[0, '#a36cf0'], [1, '#4b2a96']]) + radial('moon', [[0, '#fff7ea', 0.8], [1, '#fff7ea', 0]]),
  `<rect width="256" height="256" fill="url(#bg)"/>${stars(34, 3, '#fff', 1.3, 140)}
   <circle cx="198" cy="54" r="46" fill="url(#moon)"/>
   <circle cx="198" cy="54" r="22" fill="#fff6e8"/><circle cx="208" cy="48" r="20" fill="#4a3488"/>
   <path d="M0 214 C40 200 70 218 110 206 C150 194 190 214 256 198 L256 256 L0 256 Z" fill="#3a2466" opacity=".55"/>
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#2e1d55', iris: '#6a3fc4', rim: '#fff', strand: 'rgba(255,255,255,.3)' }))}
   ${sparkle(40, 60, 0.8, '#fff')}${sparkle(60, 30, 0.5, '#fff')}
   ${FINISH('#ffd6f0', 0.45)}`);

// ===== Fancy =====
A['avatar-shop-hextech'] = svg(
  radial('bg', [[0, '#1b4a86'], [0.6, '#0a1c3a'], [1, '#030814']], '50%', '45%') + linear('b', [[0, '#f2f7fc'], [0.4, '#a9bed4'], [1, '#41566e']]) + linear('m', [[0, '#9ffbff'], [0.5, '#2fd2ff'], [1, '#1150d6']]) + radial('core', [[0, '#bff8ff', 0.9], [1, '#2fd2ff', 0]]) + linear('gold', [[0, '#ffe7a3'], [1, '#b8862c']]),
  `<rect width="256" height="256" fill="url(#bg)"/>
   <g transform="translate(128 128)" fill="none" stroke="#3fd9ff">
     <circle r="112" stroke-width="2" stroke-dasharray="4 8" opacity=".5"/>
     <circle r="100" stroke-width="1" opacity=".3"/>
     <path d="M0 -118 L102 -59 L102 59 L0 118 L-102 59 L-102 -59 Z" stroke-width="2" opacity=".25"/></g>
   <g fill="none" stroke="#3fd9ff" stroke-width="2.2" opacity=".6" stroke-linecap="round">
     <path d="M0 64 H34 L52 82 H96"/><path d="M256 46 H214 L196 64 H160"/><path d="M0 206 H26 L44 188 H66"/><path d="M256 196 H228 L210 214 H190"/></g>
   <g fill="#9ffbff">${[[96, 82], [160, 64], [66, 188], [190, 214]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/><circle cx="${x}" cy="${y}" r="9" opacity=".25"/>`).join('')}</g>
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#0b1a2e', iris: '#2fd2ff', glow: '#5ff4ff', rim: '#dff9ff', rimOpacity: 0.6, strand: 'rgba(200,250,255,.55)',
    extra: `<path d="M118 120 L140 120 L150 132 L172 132" fill="none" stroke="url(#gold)" stroke-width="4" stroke-linecap="round"/>
            <circle cx="128" cy="160" r="12" fill="url(#core)"/><circle cx="128" cy="160" r="6" fill="#e8fdff"/>
            <path d="M120 160 H136 M128 152 V168" stroke="#2fd2ff" stroke-width="1.5"/>
            <path d="M150 70 L170 63 M196 118 L214 116" stroke="#5ff4ff" stroke-width="2.5" stroke-linecap="round"/>` }))}
   ${FINISH('#3fd9ff', 0.6)}`);

A['avatar-shop-ember'] = svg(
  radial('bg', [[0, '#6a1a06'], [0.55, '#2a0803'], [1, '#0a0201']], '50%', '75%') + linear('b', [[0, '#4a3434'], [1, '#120a0a']]) + linear('m', [[0, '#fff6a8'], [0.35, '#ffb02e'], [0.7, '#ff5a1a'], [1, '#a8170c']]) + radial('lava', [[0, '#ffd24a'], [1, '#ff5a1a', 0]]),
  `<rect width="256" height="256" fill="url(#bg)"/>
   <ellipse cx="128" cy="250" rx="160" ry="50" fill="url(#lava)" opacity=".7"/>
   <g fill="none" stroke-linecap="round">
     <path d="M8 236 L40 204 L34 178 L66 150 L60 128" stroke="#ffb02e" stroke-width="3.5"/>
     <path d="M248 240 L214 212 L224 186 L196 166" stroke="#ff7a1a" stroke-width="3"/>
     <path d="M118 256 L130 228 L116 206 L126 190" stroke="#ffd24a" stroke-width="2.5"/></g>
   <g fill="#ffb347">${[...Array(22)].map((_, i) => { const r = rng(i * 7 + 1); return `<circle cx="${(r() * 256).toFixed(0)}" cy="${(40 + r() * 200).toFixed(0)}" r="${(0.8 + r() * 2.2).toFixed(1)}" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`; }).join('')}</g>
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#000', iris: '#ffcc33', glow: '#ff7a1a', rim: '#ff9d4a', rimOpacity: 0.7, strand: 'rgba(255,240,150,.55)',
    maneExtra: `<path d="M60 150 C40 134 42 112 56 100 C52 118 60 128 70 136 Z M54 196 C34 186 30 164 40 150 C40 168 48 180 60 186 Z" fill="url(#m)"/>`,
    extra: `<g fill="none" stroke="#ff7a1a" stroke-width="2.5" stroke-linecap="round" opacity=".9"><path d="M118 118 L134 132 L128 152 L140 170"/><path d="M170 186 L178 206 L172 224"/><path d="M196 100 L206 110"/></g>` }))}
   ${FINISH('#ff7a1a', 0.55)}`);

A['avatar-shop-galaxy'] = svg(
  radial('bg', [[0, '#4a2a8c'], [0.5, '#1c0f40'], [1, '#05020f']], '40%', '40%') + linear('b', [[0, '#ffffff'], [0.6, '#e4e6fb'], [1, '#a9aee0']]) + linear('m', [[0, '#ff8ae2'], [0.35, '#a46bff'], [0.7, '#4fb6ff'], [1, '#5effd8']]) + linear('h', [[0, '#fff8d0'], [1, '#d9a23a']], '1', '0') + radial('neb1', [[0, '#ff6ad5', 0.5], [1, '#ff6ad5', 0]]) + radial('neb2', [[0, '#4fb6ff', 0.45], [1, '#4fb6ff', 0]]),
  `<rect width="256" height="256" fill="url(#bg)"/>
   <ellipse cx="60" cy="70" rx="90" ry="40" fill="url(#neb1)" transform="rotate(-25 60 70)"/>
   <ellipse cx="200" cy="200" rx="90" ry="44" fill="url(#neb2)" transform="rotate(-20 200 200)"/>
   ${stars(60, 21, '#fff', 1.6, 256)}
   ${sparkle(36, 120, 0.9, '#fff')}${sparkle(224, 60, 0.7, '#ffe6ff')}${sparkle(210, 230, 0.6, '#d6f0ff')}
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#1e1240', iris: '#7a4fff', rim: '#fff', rimOpacity: 0.7, strand: 'rgba(255,255,255,.45)',
    maneExtra: [[72, 150], [64, 190], [82, 122], [70, 220], [90, 104]].map(([x, y], i) => sparkle(x, y, 0.35 + (i % 2) * 0.2, '#fff')).join(''),
    extra: `<path d="M148 52 L190 2 L162 58 Z" fill="url(#h)" stroke="#1e1240" stroke-width="3" stroke-linejoin="round"/>
            <path d="M154 46 L176 36 M158 38 L182 22 M164 28 L186 12" stroke="#b7862a" stroke-width="2"/>
            <circle cx="190" cy="4" r="8" fill="#fff8d0" opacity=".5"/>` }))}
   ${FINISH('#d9a8ff', 0.55)}`);

A['avatar-shop-crowned'] = svg(
  radial('bg', [[0, '#7a3cb0'], [0.6, '#2c1048'], [1, '#0e0418']], '50%', '35%') + linear('b', [[0, '#ffffff'], [0.5, '#e6dcf7'], [1, '#a594c8']]) + linear('m', [[0, '#8a52d8'], [1, '#3a1a72']]) + linear('g', [[0, '#fff2b0'], [0.5, '#f0c24a'], [1, '#9c6a14']]) + linear('cape', [[0, '#c0283c'], [1, '#5a0a18']]),
  `<rect width="256" height="256" fill="url(#bg)"/>
   <g fill="#f0c24a" opacity=".12">${[...Array(12)].map((_, i) => `<path d="M128 128 L${128 + Math.cos(i / 12 * 6.283) * 190} ${128 + Math.sin(i / 12 * 6.283) * 190} L${128 + Math.cos((i + 0.5) / 12 * 6.283) * 190} ${128 + Math.sin((i + 0.5) / 12 * 6.283) * 190} Z"/>`).join('')}</g>
   <g fill="none" stroke="url(#g)" stroke-width="4"><path d="M36 246 C14 204 12 150 30 108"/><path d="M220 246 C242 204 244 150 226 108"/></g>
   <g fill="url(#g)">${[110, 136, 162, 188, 214].map((y, i) => `<ellipse cx="${26 - i * 0.5}" cy="${y}" rx="11" ry="5" transform="rotate(-40 ${26 - i * 0.5} ${y})"/><ellipse cx="${230 + i * 0.5}" cy="${y}" rx="11" ry="5" transform="rotate(40 ${230 + i * 0.5} ${y})"/>`).join('')}</g>
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#24113d', iris: '#6a3fc4', rim: '#fff', rimOpacity: 0.6, strand: 'rgba(255,255,255,.3)',
    extra: `<path d="M74 212 C100 200 142 200 166 210 L169 232 C142 222 102 222 72 234 Z" fill="url(#cape)" stroke="#24113d" stroke-width="3" stroke-linejoin="round"/>
            <path d="M74 212 C100 200 142 200 166 210" fill="none" stroke="url(#g)" stroke-width="4"/>
            <path d="M72 234 C102 222 142 222 169 232" fill="none" stroke="url(#g)" stroke-width="3"/>
            <circle cx="120" cy="218" r="6" fill="url(#g)" stroke="#5a3d0a" stroke-width="2"/><circle cx="120" cy="218" r="2.5" fill="#e3364d"/>
            <path d="M108 52 L114 18 L128 38 L142 12 L152 38 L166 20 L164 56 Z" fill="url(#g)" stroke="#5a3d0a" stroke-width="3" stroke-linejoin="round"/>
            <circle cx="142" cy="34" r="5" fill="#e3364d" stroke="#5a0a18" stroke-width="1.5"/><circle cx="118" cy="40" r="3" fill="#4fd2ff"/><circle cx="160" cy="40" r="3" fill="#4fd2ff"/>
            <circle cx="114" cy="18" r="3" fill="#fff2b0"/><circle cx="142" cy="12" r="3" fill="#fff2b0"/><circle cx="166" cy="20" r="3" fill="#fff2b0"/>` }))}
   ${sparkle(150, 22, 0.7, '#fff')}
   ${FINISH('#f0c24a', 0.6)}`);

// ===== Animated 1: Prism Pony (deutlich mehr Bewegung) =====
const CYCLE = (vals, dur = '3s') => `<animate attributeName="stop-color" values="${vals}" dur="${dur}" repeatCount="indefinite"/>`;
const RB = ['#ff4d6d', '#ffb84d', '#fff04d', '#4dff88', '#4dd8ff', '#8a4dff', '#ff4dd8', '#ff4d6d'];
const rot = (arr, k) => [...arr.slice(k), ...arr.slice(1, k + 1)].join(';');
A['avatar-shop-prism'] = svg(
  radial('bg', [[0, '#2a2f66'], [0.6, '#0e1230'], [1, '#04050f']]) + linear('b', [[0, '#ffffff'], [0.6, '#eef1ff'], [1, '#b8c0ec']]) +
  `<linearGradient id="m" x1="0" y1="0" x2="0.4" y2="1">
     <stop offset="0" stop-color="${RB[0]}">${CYCLE(rot(RB, 0))}</stop>
     <stop offset=".33" stop-color="${RB[2]}">${CYCLE(rot(RB, 2))}</stop>
     <stop offset=".66" stop-color="${RB[4]}">${CYCLE(rot(RB, 4))}</stop>
     <stop offset="1" stop-color="${RB[6]}">${CYCLE(rot(RB, 6))}</stop></linearGradient>
   <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0" stop-color="${RB[1]}">${CYCLE(rot(RB, 1), '2s')}</stop>
     <stop offset="1" stop-color="${RB[5]}">${CYCLE(rot(RB, 5), '2s')}</stop></linearGradient>
   <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
   <clipPath id="headclip"><path transform="translate(20 30) scale(0.84)" d="${HEAD}"/></clipPath>`,
  `<rect width="256" height="256" fill="url(#bg)"/>
   <g opacity=".35"><g>${[...Array(12)].map((_, i) => `<path d="M128 128 L${128 + Math.cos(i / 12 * 6.283) * 200} ${128 + Math.sin(i / 12 * 6.283) * 200} L${128 + Math.cos((i + 0.45) / 12 * 6.283) * 200} ${128 + Math.sin((i + 0.45) / 12 * 6.283) * 200} Z" fill="${RB[i % 7]}"/>`).join('')}
     <animateTransform attributeName="transform" type="rotate" from="0 128 128" to="360 128 128" dur="18s" repeatCount="indefinite"/></g></g>
   <circle cx="128" cy="128" r="70" fill="#fff" opacity=".08"><animate attributeName="r" values="60;90;60" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".12;.02;.12" dur="3s" repeatCount="indefinite"/></circle>
   ${stars(30, 9, '#fff', 1.5, 256, true)}
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#141836', iris: '#8a4dff', rim: '#fff', rimOpacity: 0.8, strand: 'rgba(255,255,255,.5)' }))}
   <g clip-path="url(#headclip)"><rect x="-80" y="0" width="60" height="256" fill="url(#sweep)" transform="skewX(-20)"><animate attributeName="x" values="-120;320" dur="2.6s" repeatCount="indefinite"/></rect></g>
   <g>${[0, 1, 2, 3, 4, 5].map(i => `<g><animateTransform attributeName="transform" type="rotate" from="${i * 60} 128 128" to="${i * 60 + 360} 128 128" dur="${7 + i % 3}s" repeatCount="indefinite"/>${sparkle(128, 18, 0.7 + (i % 3) * 0.2, '#fff', `<animate attributeName="opacity" values="1;.2;1" dur="${1.2 + i * 0.3}s" repeatCount="indefinite"/>`)}</g>`).join('')}</g>
   <rect width="256" height="256" fill="url(#vig)"/>
   <circle cx="128" cy="128" r="120" fill="none" stroke="url(#ring)" stroke-width="5"/>
   <circle cx="128" cy="128" r="112" fill="none" stroke="url(#ring)" stroke-width="1.5" stroke-dasharray="3 9" opacity=".7"><animateTransform attributeName="transform" type="rotate" from="0 128 128" to="-360 128 128" dur="12s" repeatCount="indefinite"/></circle>`);

// ===== Animated 2: Cyberpunk (Gelb / Cyan / Rot, Glitch, Neon, Regen) =====
A['avatar-shop-cyber'] = svg(
  linear('sky', [[0, '#1a0a2e'], [0.6, '#3a0f3e'], [1, '#0a0510']]) + linear('b', [[0, '#3b3f4c'], [0.5, '#1b1e26'], [1, '#0b0c11']]) + linear('m', [[0, '#fcee0a'], [1, '#d9a400']]) + linear('chrome', [[0, '#e9f0f7'], [1, '#6f7c8c']]) +
  `<clipPath id="cyc"><circle cx="128" cy="128" r="122"/></clipPath>
   <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#000" opacity=".25"/></pattern>`,
  `<g clip-path="url(#cyc)">
   <rect width="256" height="256" fill="url(#sky)"/>
   <circle cx="190" cy="70" r="40" fill="#ff2a6d" opacity=".25"/>
   <g fill="#140818">${[[0, 120, 30], [26, 96, 22], [46, 140, 26], [70, 80, 20], [88, 130, 30], [150, 100, 24], [172, 70, 28], [198, 116, 22], [218, 90, 38]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${256 - y}"/>`).join('')}</g>
   <g>${[...Array(40)].map((_, i) => { const r = rng(i * 13 + 5); const c = ['#fcee0a', '#00f0ff', '#ff2a6d'][i % 3]; return `<rect x="${(r() * 250).toFixed(0)}" y="${(80 + r() * 160).toFixed(0)}" width="3" height="2" fill="${c}" opacity=".8"><animate attributeName="opacity" values=".8;.1;.8" dur="${(0.6 + r() * 2.4).toFixed(1)}s" begin="${(r() * 2).toFixed(1)}s" repeatCount="indefinite"/></rect>`; }).join('')}</g>
   <g transform="translate(18 60)"><rect width="44" height="18" rx="3" fill="none" stroke="#00f0ff" stroke-width="2.5"><animate attributeName="opacity" values="1;1;.2;1;1;.4;1" dur="3s" repeatCount="indefinite"/></rect>
     <text x="22" y="13.5" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#00f0ff">TTP<animate attributeName="opacity" values="1;1;.2;1;1;.4;1" dur="3s" repeatCount="indefinite"/></text></g>
   <g stroke="#7fd8ff" stroke-width="1.2" opacity=".35">${[...Array(18)].map((_, i) => { const r = rng(i * 3 + 2); const x = (r() * 256).toFixed(0); return `<line x1="${x}" y1="-20" x2="${x - 6}" y2="0"><animateTransform attributeName="transform" type="translate" values="0 0;-12 280" dur="${(0.7 + r() * 0.6).toFixed(2)}s" begin="${(r()).toFixed(2)}s" repeatCount="indefinite"/></line>`; }).join('')}</g>
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#000', iris: '#ff2a6d', glow: '#ff2a6d', rim: '#00f0ff', rimOpacity: 0.85, strand: 'rgba(0,0,0,.45)',
    maneExtra: `<path d="M98 100 C84 112 76 130 72 152" fill="none" stroke="#00f0ff" stroke-width="2"/>`,
    extra: `<path d="M150 62 L190 70 L206 92 L190 96 L176 84 L150 80 Z" fill="url(#chrome)" stroke="#000" stroke-width="2.5"/>
            <path d="M160 108 L196 108 L208 120" fill="none" stroke="#fcee0a" stroke-width="3"/><circle cx="208" cy="120" r="3.5" fill="#fcee0a"/>
            <path d="M118 140 L118 176 L132 190 L132 230" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
            <circle cx="118" cy="140" r="3" fill="#00f0ff"/><circle cx="132" cy="230" r="3" fill="#00f0ff"/>
            <rect x="140" y="196" width="22" height="8" fill="#ff2a6d"/><rect x="140" y="208" width="14" height="5" fill="#fcee0a"/>` }))}
   <g opacity="0"><animate attributeName="opacity" values="0;0;0;0;1;0;0;1;0;0" dur="2.4s" repeatCount="indefinite"/>
     <rect x="0" y="92" width="256" height="10" fill="#00f0ff" opacity=".35"/><rect x="0" y="150" width="256" height="6" fill="#ff2a6d" opacity=".45"/>
     <rect x="40" y="118" width="120" height="4" fill="#fcee0a" opacity=".6"/></g>
   <g opacity="0"><animate attributeName="opacity" values="0;0;0;1;0;0;0;0;0" dur="2.4s" repeatCount="indefinite"/>
     <g transform="translate(5 0)" opacity=".5">${FG(`<path d="${HEAD}" fill="none" stroke="#00f0ff" stroke-width="3"/>`)}</g>
     <g transform="translate(-5 0)" opacity=".5">${FG(`<path d="${HEAD}" fill="none" stroke="#ff2a6d" stroke-width="3"/>`)}</g></g>
   <rect width="256" height="256" fill="url(#scan)"/>
   <rect width="256" height="256" fill="url(#vig)"/>
   </g>
   <circle cx="128" cy="128" r="120" fill="none" stroke="#fcee0a" stroke-width="4"/>
   <path d="M128 8 A120 120 0 0 1 248 128" fill="none" stroke="#00f0ff" stroke-width="4" stroke-dasharray="40 14"><animateTransform attributeName="transform" type="rotate" from="0 128 128" to="360 128 128" dur="6s" repeatCount="indefinite"/></path>`);

// ===== November-Pass (Halloween) =====
A['avatar-pass-2026-11-pumpkin'] = svg(
  linear('bg', [[0, '#3a1a08'], [0.6, '#1a0b04'], [1, '#080302']]) + linear('b', [[0, '#4a4a54'], [1, '#141418']]) + linear('m', [[0, '#ffc04d'], [0.5, '#ff7a1a'], [1, '#c2410c']]) + radial('p', [[0, '#ffc266'], [0.7, '#e2701c'], [1, '#9a3a08']], '40%', '35%') + radial('moon', [[0, '#fff1c4', 0.9], [1, '#fff1c4', 0]]) + radial('inner', [[0, '#fff3a0'], [1, '#ff9a1a']]),
  `<rect width="256" height="256" fill="url(#bg)"/>${stars(18, 5, '#ffcf8a', 1.2, 120)}
   <circle cx="200" cy="56" r="44" fill="url(#moon)"/><circle cx="200" cy="56" r="20" fill="#ffe8b0"/>
   <path d="M0 230 C40 214 80 226 128 220 C176 214 210 226 256 216 L256 256 L0 256 Z" fill="#0a0503"/>
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#000', iris: '#ff9a1a', glow: '#ff8a1e', rim: '#ffb347', rimOpacity: 0.55, strand: 'rgba(120,30,0,.45)' }))}
   <g transform="translate(22 172)">
     <ellipse cx="38" cy="38" rx="40" ry="33" fill="url(#p)" stroke="#3a1a05" stroke-width="3"/>
     <path d="M20 12 C18 30 18 50 22 66 M38 6 V70 M56 12 C58 30 58 50 54 66" fill="none" stroke="#9a3a08" stroke-width="2" opacity=".6"/>
     <path d="M38 8 L40 -6 L50 -4" stroke="#3d5a1e" stroke-width="5" fill="none" stroke-linecap="round"/>
     <path d="M20 28 L30 20 L32 32 Z M46 32 L48 20 L58 28 Z" fill="url(#inner)"/>
     <path d="M18 46 C26 58 50 58 58 46 L52 50 L45 45 L38 51 L31 45 L24 50 Z" fill="url(#inner)"/>
     <ellipse cx="38" cy="40" rx="30" ry="22" fill="#ffb347" opacity=".12"/></g>
   ${FINISH('#ff8a1e', 0.55)}`);

A['avatar-pass-2026-11-haunted'] = svg(
  radial('bg', [[0, '#4a2478'], [0.55, '#1a0c33'], [1, '#06030d']], '50%', '25%') + linear('b', [[0, '#f4f8ff', 0.95], [1, '#9cb0dc', 0.85]]) + linear('m', [[0, '#d8bcff'], [0.5, '#8a5ae0'], [1, '#3a1a7a']]) + radial('moon', [[0, '#f4ecff', 0.9], [0.5, '#c9b2ff', 0.35], [1, '#c9b2ff', 0]]) + linear('fog', [[0, '#c8b6ff', 0], [1, '#c8b6ff', 0.5]]) + radial('flame', [[0, '#fff6c0'], [1, '#ffb347', 0]]),
  `<rect width="256" height="256" fill="url(#bg)"/>
   <circle cx="128" cy="78" r="70" fill="url(#moon)"/><circle cx="128" cy="78" r="34" fill="#efe6ff"/>
   <g fill="#d9ccff" opacity=".5"><ellipse cx="96" cy="88" rx="40" ry="7"/><ellipse cx="166" cy="70" rx="34" ry="6"/></g>
   ${stars(20, 31, '#e8dcff', 1.2, 120, true)}
   <g fill="#0b0618">${[[30, 46, 1], [214, 32, 0.8], [226, 98, 0.6], [56, 110, 0.5]].map(([x, y, s], i) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C-6 -8 -16 -8 -22 -2 C-16 -4 -12 0 -12 4 C-8 0 -4 0 0 6 C4 0 8 0 12 4 C12 0 16 -4 22 -2 C16 -8 6 -8 0 0 Z"><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="${1.4 + i * 0.3}s" repeatCount="indefinite"/></path></g>`).join('')}</g>
   <g fill="#140a26">
     <path d="M14 256 V214 C14 200 40 200 40 214 V256 Z"/><path d="M214 256 V206 C214 190 244 190 244 206 V256 Z"/>
     <path d="M188 256 V226 H182 V220 H188 V214 H194 V220 H200 V226 H194 V256 Z"/></g>
   <g opacity=".9">
     <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="4s" repeatCount="indefinite"/>
     ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#1b0f33', iris: '#7dffcf', glow: '#7dffcf', rim: '#ffffff', rimOpacity: 0.7, strand: 'rgba(255,255,255,.35)',
      maneExtra: `<path d="M56 224 C44 236 46 250 40 262 M66 234 C60 248 64 256 58 268" fill="none" stroke="#c9b2ff" stroke-width="5" stroke-linecap="round" opacity=".6"/>` }))}
   </g>
   <rect y="180" width="256" height="76" fill="url(#fog)"/>
   <ellipse cx="70" cy="232" rx="80" ry="16" fill="#e6dcff" opacity=".2"><animate attributeName="cx" values="60;90;60" dur="7s" repeatCount="indefinite"/></ellipse>
   <ellipse cx="190" cy="244" rx="90" ry="14" fill="#e6dcff" opacity=".18"><animate attributeName="cx" values="200;170;200" dur="8s" repeatCount="indefinite"/></ellipse>
   <g transform="translate(206 176)"><rect x="-7" y="0" width="14" height="38" rx="3" fill="#efe6d3"/><path d="M-7 6 C-4 10 -2 8 0 14" stroke="#d8cdb6" stroke-width="2" fill="none"/>
     <circle cx="0" cy="-6" r="16" fill="url(#flame)"><animate attributeName="r" values="14;18;14" dur="1.2s" repeatCount="indefinite"/></circle>
     <path d="M0 -16 C7 -7 5 -2 0 0 C-5 -2 -7 -7 0 -16 Z" fill="#ffd36b"><animate attributeName="d" values="M0 -16 C7 -7 5 -2 0 0 C-5 -2 -7 -7 0 -16 Z;M1 -18 C8 -8 5 -2 0 0 C-5 -2 -6 -8 1 -18 Z;M0 -16 C7 -7 5 -2 0 0 C-5 -2 -7 -7 0 -16 Z" dur=".8s" repeatCount="indefinite"/></path></g>
   ${FINISH('#b48cff', 0.6)}`);

// ===== Dezember-Pass (Winter) =====
A['avatar-pass-2026-12-snow'] = svg(
  linear('bg', [[0, '#1b3a66'], [0.6, '#0e2042'], [1, '#060d1f']]) + linear('b', [[0, '#d9b48c'], [0.5, '#a97a52'], [1, '#6a4a2e']]) + linear('m', [[0, '#3a2a1e'], [1, '#1a120c']]) + linear('scarf', [[0, '#3fb8c9'], [1, '#1b6f86']]) + radial('moon', [[0, '#eaf4ff', 0.7], [1, '#eaf4ff', 0]]) + linear('snow', [[0, '#ffffff'], [1, '#c9dcf2']]),
  `<rect width="256" height="256" fill="url(#bg)"/>
   <circle cx="62" cy="58" r="50" fill="url(#moon)"/><circle cx="62" cy="58" r="16" fill="#f1f7ff"/>
   ${stars(22, 41, '#dfeeff', 1.1, 110)}
   <g fill="#0a1a33">${[[20, 150, 26], [46, 134, 30], [214, 140, 28], [238, 156, 22], [190, 160, 20]].map(([x, y, h]) => `<path d="M${x} ${y - h * 2} L${x + h * 0.7} ${y} L${x - h * 0.7} ${y} Z"/><path d="M${x} ${y - h * 2} L${x + h * 0.35} ${y - h} L${x - h * 0.35} ${y - h} Z" fill="#dce9f7" opacity=".7"/>`).join('')}</g>
   <path d="M0 196 C50 184 100 196 150 188 C196 181 226 190 256 186 L256 256 L0 256 Z" fill="url(#snow)"/>
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#24170e', iris: '#5a3a1e', rim: '#e8f2ff', rimOpacity: 0.55, strand: 'rgba(120,90,60,.5)',
    maneExtra: `<g fill="#f4f9ff"><ellipse cx="96" cy="98" rx="10" ry="4"/><ellipse cx="74" cy="132" rx="9" ry="3.5"/><ellipse cx="126" cy="58" rx="8" ry="3"/></g>`,
    extra: `<path d="M86 196 C106 182 146 180 170 192 L172 214 C146 204 108 206 84 220 Z" fill="url(#scarf)" stroke="#0b2a36" stroke-width="3" stroke-linejoin="round"/>
            <g stroke="#e9fbff" stroke-width="2.5" opacity=".75"><path d="M96 204 L100 196 M108 200 L112 192 M120 198 L124 190 M132 197 L136 189 M144 198 L148 190 M156 200 L160 192"/></g>
            <path d="M150 204 L160 246 L176 244 L166 202 Z" fill="url(#scarf)" stroke="#0b2a36" stroke-width="3" stroke-linejoin="round"/>
            <path d="M158 240 L156 252 M164 240 L164 254 M170 240 L172 252" stroke="#e9fbff" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M224 140 C236 136 242 128 246 120" fill="none" stroke="#e8f2ff" stroke-width="5" stroke-linecap="round" opacity=".35"/>` }))}
   <g fill="#fff">${[...Array(36)].map((_, i) => { const r = rng(i * 17 + 3); return `<circle cx="${(r() * 256).toFixed(0)}" cy="${(r() * 256).toFixed(0)}" r="${(0.8 + r() * 2).toFixed(1)}" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`; }).join('')}</g>
   ${FINISH('#bfe3ff', 0.55)}`);

// ===== Dezember-Pass (Weihnachten, Stufe 22) =====
A['avatar-pass-2026-12-yule'] = svg(
  radial('bg', [[0, '#5a1a14'], [0.55, '#2a0a0a'], [1, '#0c0303']], '50%', '55%') + linear('b', [[0, '#fbf3e8'], [0.5, '#e6d4bd'], [1, '#a8906e']]) + linear('m', [[0, '#b8231f'], [1, '#5e0d0b']]) + linear('gold', [[0, '#fff0b5'], [0.5, '#e8b64a'], [1, '#93641a']]) + radial('bok', [[0, '#ffd27a', 0.9], [1, '#ffd27a', 0]]) + radial('bokr', [[0, '#ff5a4a', 0.8], [1, '#ff5a4a', 0]]) + linear('holly', [[0, '#2f7a3c'], [1, '#123d1c']]),
  `<rect width="256" height="256" fill="url(#bg)"/>
   ${[[40, 60, 22, 'bok', 0], [210, 50, 16, 'bokr', 1], [226, 170, 24, 'bok', 2], [30, 200, 18, 'bokr', 0.5], [120, 30, 12, 'bok', 1.5], [180, 230, 14, 'bok', 2.5]].map(([x, y, r, g, d]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})"><animate attributeName="opacity" values=".5;1;.5" dur="3.5s" begin="${d}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="5s" begin="${d}s" repeatCount="indefinite"/></circle>`).join('')}
   ${FG(pony({ body: 'url(#b)', mane: 'url(#m)', outline: '#2a0a08', iris: '#7a2a12', rim: '#fff5d6', rimOpacity: 0.6, strand: 'rgba(255,200,160,.35)',
    extra: `<g>${[[112, 50, -40], [124, 42, -15], [138, 40, 10], [150, 44, 35], [160, 52, 60]].map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0 -14 C5 -10 3 -6 8 -6 C5 -2 7 2 3 4 C4 8 2 10 0 14 C-2 10 -4 8 -3 4 C-7 2 -5 -2 -8 -6 C-3 -6 -5 -10 0 -14 Z" fill="url(#holly)" stroke="#0a2210" stroke-width="1.5"/>`).join('')}
            <circle cx="130" cy="50" r="5" fill="#d2231f" stroke="#5a0a08" stroke-width="1.5"/><circle cx="140" cy="54" r="4.5" fill="#e63a2e" stroke="#5a0a08" stroke-width="1.5"/><circle cx="134" cy="58" r="4" fill="#c21d1a" stroke="#5a0a08" stroke-width="1.5"/></g>
            <path d="M80 200 C104 188 146 188 170 198 L172 216 C146 208 104 208 78 220 Z" fill="#b8231f" stroke="#3a0806" stroke-width="3" stroke-linejoin="round"/>
            <path d="M80 200 C104 188 146 188 170 198 M78 220 C104 208 146 208 172 216" fill="none" stroke="url(#gold)" stroke-width="3"/>
            <path d="M126 204 C110 190 96 194 100 206 C104 216 118 212 126 204 C134 196 150 192 152 204 C154 216 138 214 126 204 Z" fill="#d82a24" stroke="#3a0806" stroke-width="2.5"/>
            <path d="M126 204 L114 232 L122 230 L126 240 Z M126 204 L136 232 L130 230 L128 240 Z" fill="#b8231f" stroke="#3a0806" stroke-width="2"/>
            <circle cx="126" cy="204" r="6" fill="url(#gold)" stroke="#5a3d0a" stroke-width="1.5"/>` }))}
   <g fill="#ffe7a0">${[...Array(16)].map((_, i) => { const r = rng(i * 11 + 9); const x = (r() * 256).toFixed(0), y = (r() * 256).toFixed(0); return `<circle cx="${x}" cy="${y}" r="${(0.8 + r() * 1.6).toFixed(1)}"><animate attributeName="opacity" values="0;1;0" dur="${(2 + r() * 2).toFixed(1)}s" begin="${(r() * 2).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }).join('')}</g>
   ${FINISH('#e8b64a', 0.65)}`);

Object.entries(A).forEach(([id, content]) => fs.writeFileSync(path.join(OUT, `${id}.svg`), content));
console.log(`wrote ${Object.keys(A).length} avatars`);
