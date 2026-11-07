// Three-Trick-Pony - Base Set (50 Sticker), App-Version (v5.29.0). Entwurf und
// Freigabe: theme-lab/sticker-set.js - Klassen hier mit stk- Praefix, damit sie
// nicht mit App-Klassen (z.B. .shop-scene.front) kollidieren.
// Eigene Motive rund um Jungle/Ranked/Pony - keine Riot-Namen/-Artworks.
// Raritaeten: common (25), uncommon (15), holo (7), anim (3).
(function () {
  let uid = 0;
  const U = p => p + (++uid);
  const HEAD = 'M42 4 L48 15 L54 3 L60 18 C74 20 86 30 90 48 C93 62 92 80 92 96 L48 96 C50 84 52 72 50 62 C40 64 28 74 16 75 C8 75 4 69 6 62 C10 52 26 36 37 22 Z';
  const MANE = 'M60 18 L66 9 L69 20 L77 13 L79 26 L87 22 L87 35 L95 35 L91 47 L99 51 L93 59 L99 67 L93 73 L97 81 L92 85 L92 96 C92 80 93 62 90 48 C86 30 74 20 60 18 Z';

  // ---------- Bausteine ----------
  // Pony-Kopf mit Schattierung; eye: normal | happy | angry | tired | closed | wide | star
  function pony({ body = '#e8c48c', shade = '#b07d18', mane = '#7a4a20', x = 16, y = 14, s = .88, flip = false, eye = 'normal', cls = '', extra = '' } = {}) {
    const g = U('pg');
    const eyes = {
      normal: '<ellipse cx="36" cy="33" rx="4" ry="4.6" fill="#1a1410"/><circle cx="37.3" cy="31.6" r="1.4" fill="#fff"/>',
      happy: '<path d="M31 34 Q36 28 41 34" stroke="#1a1410" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
      angry: '<ellipse cx="36" cy="34" rx="3.6" ry="4" fill="#1a1410"/><path d="M29 26 L43 31" stroke="#1a1410" stroke-width="3" stroke-linecap="round"/>',
      tired: '<ellipse cx="36" cy="34" rx="4" ry="3" fill="#1a1410"/><path d="M30 31 L42 31" stroke="#8a6a40" stroke-width="3.4" stroke-linecap="round"/>',
      closed: '<path d="M31 33 Q36 37 41 33" stroke="#1a1410" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
      wide: '<circle cx="36" cy="33" r="5.6" fill="#fff" stroke="#1a1410" stroke-width="1.2"/><circle cx="36.5" cy="33.5" r="2.6" fill="#1a1410"/>',
      star: '<path d="M36 26 L38 31 L43 31 L39 34 L40.5 39 L36 36 L31.5 39 L33 34 L29 31 L34 31 Z" fill="#fff6c8" stroke="#c8941c" stroke-width=".8"/>'
    };
    return `<g class="${cls}" transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})${flip ? ' translate(-100 0)' : ''}">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${body}"/><stop offset="1" stop-color="${shade}"/></linearGradient></defs>
      <path d="${HEAD}" fill="url(#${g})" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
      <path d="${MANE}" fill="${mane}" stroke="rgba(0,0,0,.3)" stroke-width="1"/>
      <path d="M14 66 C22 70 30 68 36 64" stroke="rgba(0,0,0,.25)" stroke-width="1.6" fill="none"/>
      <path d="M44 14 C50 30 56 40 70 50" stroke="rgba(255,255,255,.25)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="13" cy="64" r="2" fill="rgba(0,0,0,.45)"/>${eyes[eye] || eyes.normal}${extra}
    </g>`;
  }
  // Hintergrund: Verlauf + Vignette
  function bg(top, bottom, glowColor) {
    const a = U('bg'), v = U('vg');
    return `<defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
      <radialGradient id="${v}" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>
      <rect width="120" height="120" fill="url(#${a})"/>${glowColor ? glow(60, 52, 54, glowColor, .45) : ''}<rect width="120" height="120" fill="url(#${v})"/>`;
  }
  function glow(cx, cy, r, color, op = .8, cls = '') {
    const g = U('gl');
    return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}" fill="url(#${g})"/>`;
  }
  function rays(cx, cy, color, n = 14, op = .1, len = 95, cls = '') {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, w = Math.PI / n * .55;
      out += `<path d="M${cx} ${cy} L${(cx + Math.cos(a - w) * len).toFixed(1)} ${(cy + Math.sin(a - w) * len).toFixed(1)} L${(cx + Math.cos(a + w) * len).toFixed(1)} ${(cy + Math.sin(a + w) * len).toFixed(1)} Z" fill="${color}" opacity="${op}"/>`;
    }
    return `<g class="${cls}" style="transform-origin:${cx}px ${cy}px">${out}</g>`;
  }
  // Position im aeusseren <g>, Animation am inneren Pfad - sonst ueberschreibt
  // die CSS-Animation das transform-Attribut und der Stern springt in die Ecke
  const spark = (x, y, s = 1, o = .9, cls = '', c = '#fff') => `<g transform="translate(${x} ${y}) scale(${s})"><path class="${cls}" d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2 Z" fill="${c}" opacity="${o}"/></g>`;
  const sparks = (pts, cls = '', c = '#fff') => pts.map(([x, y, s = 1], i) => spark(x, y, s, .9, cls ? `${cls} d${i % 4}` : '', c)).join('');
  const dots = (pts, c = '#fff', o = .6) => pts.map(([x, y, r = 1.2]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}"/>`).join('');
  const txt = (t, x, y, size, fill, stroke = '#120a1a', sw = 3, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial Black,Segoe UI,sans-serif" font-weight="900" font-size="${size}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" letter-spacing=".5">${t}</text>`;
  function sword(x, y, len = 70, rot = 0, blade = '#e4ebf5', hilt = '#c8a96e') {
    const g = U('sw');
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${blade}"/><stop offset="1" stop-color="#8a96aa"/></linearGradient></defs>
      <path d="M-4 0 L-4 ${-len} L0 ${-len - 10} L4 ${-len} L4 0 Z" fill="url(#${g})" stroke="#3a4250" stroke-width="1.2"/>
      <rect x="-13" y="-2" width="26" height="6" rx="2" fill="${hilt}" stroke="#4a3208" stroke-width="1.2"/>
      <rect x="-2.6" y="4" width="5.2" height="14" rx="2" fill="#5a3a1a"/><circle cx="0" cy="20" r="3.6" fill="${hilt}" stroke="#4a3208" stroke-width="1"/></g>`;
  }
  function crown(x, y, s = 1, gems = ['#ff5a6a', '#5fd08a', '#6bc8ff', '#b98cff', '#ffd36b'], points = 5) {
    const g = U('cr');
    const w = 84, step = w / (points - 1);
    let tips = `M${-w / 2} 30 `;
    for (let i = 0; i < points; i++) { const px = -w / 2 + i * step; tips += `L${px} ${i % 2 ? 6 : -10} L${px + step / 2} 18 `; }
    tips = tips.replace(/L[^L]*$/, '') + `L${w / 2} 30 Z`;
    let gemDots = '';
    for (let i = 0; i < points; i++) gemDots += `<circle cx="${-w / 2 + i * step}" cy="${i % 2 ? 6 : -10}" r="4.6" fill="${gems[i % gems.length]}" stroke="#fff" stroke-width="1.3"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#f2c94c"/><stop offset="1" stop-color="#a4700e"/></linearGradient></defs>
      <path d="${tips}" fill="url(#${g})" stroke="#5a3a06" stroke-width="2.2" stroke-linejoin="round"/>
      <rect x="${-w / 2 - 2}" y="28" width="${w + 4}" height="14" rx="4" fill="url(#${g})" stroke="#5a3a06" stroke-width="2.2"/>${gemDots}</g>`;
  }
  function flame(x, y, s = 1, c1 = '#ffe46b', c2 = '#ff5a1e', cls = '') {
    const g = U('fl');
    return `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})"><defs><linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs>
      <path d="M0 30 C-22 26 -24 2 -8 -12 C-6 -2 -2 2 2 4 C0 -10 6 -24 16 -32 C14 -16 28 -6 24 10 C22 24 12 30 0 30 Z" fill="url(#${g})" stroke="#7a1a08" stroke-width="1.5"/>
      <path d="M0 26 C-10 22 -10 10 -2 4 C0 12 6 12 8 6 C12 14 8 24 0 26 Z" fill="#fff6c8" opacity=".85"/></g>`;
  }
  function coin(x, y, r = 10) {
    const g = U('co');
    return `<g><defs><radialGradient id="${g}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#e2b23c"/><stop offset="1" stop-color="#9a6a12"/></radialGradient></defs>
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})" stroke="#6a4508" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="${r * .66}" fill="none" stroke="#9a6a12" stroke-width="1"/></g>`;
  }
  const bush = (x, y, w, c = '#2f8a4a', c2 = '#256e3a') => `<g transform="translate(${x} ${y})">${[0, 1, 2, 3, 4].map(i => `<circle cx="${(i - 2) * w / 5}" cy="${(i % 2) * -4}" r="${w / 4.2}" fill="${i % 2 ? c : c2}"/>`).join('')}</g>`;
  function rune(x, y, r, c1, c2, glyph, cls = '') {
    const g = U('ru');
    return `<g class="${cls}" style="transform-origin:${x}px ${y}px"><defs><radialGradient id="${g}"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})" stroke="#fff" stroke-width="2" opacity=".95"/>
      <circle cx="${x}" cy="${y}" r="${r * .72}" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 3" opacity=".7"/>
      <path d="${glyph}" transform="translate(${x} ${y})" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  const ground = (y, c, c2) => `<path d="M0 ${y} Q30 ${y - 6} 60 ${y} T120 ${y} V120 H0 Z" fill="${c}"/>${c2 ? `<path d="M0 ${y + 8} Q40 ${y + 2} 80 ${y + 8} T120 ${y + 6} V120 H0 Z" fill="${c2}"/>` : ''}`;
  const tower = (x, y, s = 1, c = '#6a7488') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 L-10 -60 L10 -60 L14 0 Z" fill="${c}" stroke="#2a3040" stroke-width="2"/><path d="M-16 -60 H16 V-70 H-16 Z" fill="#8a96aa" stroke="#2a3040" stroke-width="2"/>
    <path d="M-16 -70 V-78 H-8 V-72 H-2 V-78 H4 V-72 H10 V-78 H16 V-70" fill="#8a96aa" stroke="#2a3040" stroke-width="2"/><circle cx="0" cy="-86" r="7" fill="#6bc8ff" stroke="#fff" stroke-width="1.5"/>${glow(0, -86, 16, '#6bc8ff', .7)}</g>`;
  const minion = (x, y, c = '#4a7ad8', s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="7" ry="9" fill="${c}" stroke="#1a2440" stroke-width="1.2"/><circle cx="0" cy="-12" r="6" fill="${c}" stroke="#1a2440" stroke-width="1.2"/><circle cx="-2" cy="-13" r="1.4" fill="#fff"/><circle cx="2.4" cy="-13" r="1.4" fill="#fff"/><path d="M-6 -16 L0 -22 L6 -16" fill="#d8e0ee" stroke="#1a2440" stroke-width="1"/></g>`;
  const dragonEye = (x, y, r, c1, c2) => { const g = U('de'); return `<g><defs><radialGradient id="${g}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs><path d="M${x - r * 1.8} ${y} Q${x} ${y - r * 1.5} ${x + r * 1.8} ${y} Q${x} ${y + r * 1.5} ${x - r * 1.8} ${y} Z" fill="url(#${g})" stroke="#1a0a00" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="${r * .28}" ry="${r * 1.05}" fill="#0a0400"/><circle cx="${x + r * .4}" cy="${y - r * .45}" r="${r * .18}" fill="#fff" opacity=".9"/></g>`; };

  // ---------- Die 50 Motive ----------
  const ART = {
    // ===== Common =====
    'smite': () => `${bg('#0d1d44', '#2346a8', '#ffe46b')}<ellipse cx="60" cy="108" rx="52" ry="10" fill="#0a1430"/>
      <path d="M70 6 L38 62 H58 L46 116 L88 48 H64 L80 6 Z" fill="#ffe46b" stroke="#fff6c8" stroke-width="2" stroke-linejoin="round"/><path d="M70 6 L56 34 H66 Z" fill="#fff" opacity=".7"/>
      ${sparks([[20, 30], [98, 24, .8], [100, 82], [16, 86, .7]])}`,
    'one-more-game': () => `${bg('#2a1838', '#5b2c4a')}<rect x="16" y="86" width="88" height="30" rx="4" fill="#3a2440"/><rect x="24" y="80" width="72" height="10" rx="3" fill="#7b5a8a"/>
      <rect x="30" y="92" width="22" height="16" rx="2" fill="#6bc8ff" opacity=".7"/><rect x="58" y="96" width="32" height="4" rx="2" fill="#9a7ab0"/>
      <circle cx="60" cy="46" r="30" fill="#f6efe2" stroke="#3a2a1a" stroke-width="4"/>
      ${[...Array(12)].map((_, i) => { const a = i / 12 * Math.PI * 2; return `<line x1="${(60 + Math.sin(a) * 24).toFixed(1)}" y1="${(46 - Math.cos(a) * 24).toFixed(1)}" x2="${(60 + Math.sin(a) * 27).toFixed(1)}" y2="${(46 - Math.cos(a) * 27).toFixed(1)}" stroke="#3a2a1a" stroke-width="${i % 3 ? 1.5 : 3}"/>`; }).join('')}
      <path d="M60 46 L72.8 51.6 M60 46 L39.5 41.6" stroke="#3a2a1a" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="46" r="3" fill="#c0392b"/>${txt('3:47 AM', 60, 114, 11, '#ff7a8a', '#2a1838', 2)}`,
    'ward': () => `${bg('#071a12', '#0f3a26')}${bush(14, 112, 50, '#123a22', '#0e2e1a')}${bush(104, 114, 50, '#123a22', '#0e2e1a')}${glow(60, 44, 46, '#ffe9a0', .85)}
      <path d="M54 62 L52 108 H68 L66 62 Z" fill="#6b4a2e" stroke="#3a2614" stroke-width="2"/>
      <path d="M40 46 C40 28 80 28 80 46 C80 58 70 64 60 64 C50 64 40 58 40 46 Z" fill="#ffd36b" stroke="#a87a1e" stroke-width="2.5"/>
      <ellipse cx="60" cy="46" rx="13" ry="9" fill="#fff"/><circle cx="60" cy="46" r="6" fill="#2b6e3a"/><circle cx="60" cy="46" r="3" fill="#0a1a0e"/><circle cx="62" cy="44" r="1.4" fill="#fff"/>${sparks([[26, 22, .6], [94, 30, .5]])}`,
    'first-blood': () => `${bg('#2a0a0a', '#5a1010', '#ff3a3a')}${sword(60, 100, 72, 0)}
      <path d="M60 30 C55 40 52 46 52 52 C52 57 56 60 60 60 C64 60 68 57 68 52 C68 46 65 40 60 30 Z" fill="#e01e2e" stroke="#5a0008" stroke-width="2"/><ellipse cx="57" cy="50" rx="2.4" ry="4" fill="#fff" opacity=".6"/>
      ${txt('FIRST BLOOD', 60, 114, 12, '#ff5a6a', '#2a0a0a', 2.6)}`,
    'blue-buff': () => `${bg('#041428', '#0d3a6e', '#3ab4ff')}${rune(60, 54, 32, '#6bd8ff', '#1a5ab0', 'M-10 -12 L0 -20 L10 -12 M-12 0 H12 M-10 12 L0 20 L10 12')}${dots([[20, 20], [100, 26], [24, 96], [96, 98], [60, 104]], '#9ae4ff', .8)}`,
    'red-buff': () => `${bg('#2a0604', '#6a1408', '#ff6a2a')}${rune(60, 54, 32, '#ffb46b', '#b02a0a', 'M0 -20 L6 -4 L20 -4 L8 6 L12 20 L0 12 L-12 20 L-8 6 L-20 -4 L-6 -4 Z')}${flame(20, 96, .45)}${flame(100, 98, .45)}`,
    'river-crab': () => `${bg('#0a2a3a', '#0e5a6a')}<path d="M0 74 Q30 66 60 74 T120 72 V120 H0 Z" fill="#1a7a8a" opacity=".8"/>${[0, 1, 2].map(i => `<path d="M${10 + i * 38} ${86 + i * 6} q8 -4 16 0" stroke="#9ae4ff" stroke-width="2" fill="none" opacity=".6"/>`).join('')}
      <ellipse cx="60" cy="70" rx="26" ry="16" fill="#ff8a5a" stroke="#7a2a10" stroke-width="2"/><ellipse cx="54" cy="64" rx="10" ry="5" fill="#ffb48a" opacity=".7"/>
      <path d="M34 66 Q22 58 22 46 M86 66 Q98 58 98 46" stroke="#ff8a5a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M16 42 Q22 36 28 42 L22 48 Z M92 42 Q98 36 104 42 L98 48 Z" fill="#ff8a5a" stroke="#7a2a10" stroke-width="1.5"/>
      <circle cx="52" cy="56" r="4" fill="#fff"/><circle cx="68" cy="56" r="4" fill="#fff"/><circle cx="52.6" cy="56.6" r="2" fill="#111"/><circle cx="68.6" cy="56.6" r="2" fill="#111"/>${[0, 1, 2].map(i => `<path d="M${42 + i * 4} 82 l-6 8 M${78 - i * 4} 82 l6 8" stroke="#7a2a10" stroke-width="2.4"/>`).join('')}`,
    'full-clear': () => `${bg('#0e2418', '#1f4a2c')}${pony({ x: 6, y: 30, s: .7, eye: 'happy' })}
      <circle cx="88" cy="38" r="20" fill="#f6efe2" stroke="#3a2a1a" stroke-width="3"/><path d="M88 38 V24 M88 38 L98 44" stroke="#3a2a1a" stroke-width="3" stroke-linecap="round"/><rect x="84" y="12" width="8" height="6" rx="1.5" fill="#3a2a1a"/>
      ${['#6bc8ff', '#ff6a2a', '#5fd08a', '#ffd36b'].map((c, i) => `<g transform="translate(${64 + i * 13} 98)"><circle r="5.5" fill="${c}"/><path d="M-2.6 0 L-.6 2.4 L3 -2.4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g>`).join('')}`,
    'recall': () => `${bg('#0a1030', '#1a2a6a')}<ellipse cx="60" cy="96" rx="44" ry="12" fill="none" stroke="#6bc8ff" stroke-width="3"/><ellipse cx="60" cy="96" rx="34" ry="8" fill="#6bc8ff" opacity=".25"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${22 + i * 18}" y="${30 + (i % 2) * 14}" width="2.4" height="${50 - (i % 2) * 14}" fill="#9ae4ff" opacity=".55"/>`).join('')}${pony({ x: 22, y: 22, s: .72, eye: 'closed' })}${sparks([[18, 30, .6], [102, 40, .7], [96, 80, .5]], '', '#9ae4ff')}`,
    'ping': () => `${bg('#1a1a2a', '#2e2e4a')}${pony({ x: 20, y: 40, s: .78, eye: 'wide' })}
      <circle cx="78" cy="30" r="22" fill="#ffd36b" stroke="#7a5a10" stroke-width="3"/>${txt('?', 78, 42, 32, '#3a2a00', '#ffd36b', 0)}${[0, 1].map(i => `<circle cx="78" cy="30" r="${28 + i * 8}" fill="none" stroke="#ffd36b" stroke-width="2" opacity="${.5 - i * .2}"/>`).join('')}`,
    'gg': () => `${bg('#0e2a1e', '#1e5a3a', '#5fd08a')}<path d="M20 22 H100 Q108 22 108 30 V64 Q108 72 100 72 H52 L36 86 L38 72 H20 Q12 72 12 64 V30 Q12 22 20 22 Z" fill="#f6efe2" stroke="#1a3a28" stroke-width="3"/>
      ${txt('GG', 60, 60, 34, '#2a8a4a', '#f6efe2', 0)}${['#c8a96e', '#8a6a40'].map((c, i) => `<path d="M${36 + i * 30} 112 C${36 + i * 30} 96 ${44 + i * 30} 90 ${52 + i * 30} 90 C${60 + i * 30} 90 ${62 + i * 30} 100 ${58 + i * 30} 112 Z" fill="${c}" stroke="#3a2a10" stroke-width="2"/>`).join('')}`,
    'afk': () => `${bg('#1a1418', '#3a2a30')}<rect x="30" y="40" width="44" height="50" rx="6" fill="#6a3a4a" stroke="#2a1018" stroke-width="2.5"/><rect x="24" y="78" width="56" height="12" rx="4" fill="#7a4a5a" stroke="#2a1018" stroke-width="2.5"/>
      <path d="M32 90 L28 112 M72 90 L76 112" stroke="#2a1018" stroke-width="4"/><path d="M84 70 h18 v14 q0 10 -9 10 q-9 0 -9 -10 z" fill="#f6efe2" stroke="#3a2a1a" stroke-width="2"/><path d="M102 74 q8 0 6 8 q-2 4 -6 4" stroke="#3a2a1a" stroke-width="2" fill="none"/>
      <path d="M88 64 q3 -6 0 -12 M96 64 q3 -6 0 -12" stroke="#c8b8a8" stroke-width="2" fill="none"/>${txt('AFK', 52, 30, 18, '#ff8a9a', '#1a1418', 2.4)}`,
    'minion-wave': () => `${bg('#16203a', '#2a3a5a')}${ground(92, '#2a4a2a', '#1e3a20')}${[[20, 92, '#4a7ad8'], [42, 96, '#4a7ad8'], [64, 92, '#8a6ad8'], [86, 96, '#4a7ad8'], [104, 92, '#4a7ad8']].map(([x, y, c]) => minion(x, y, c, 1.1)).join('')}${txt('WAVE', 60, 34, 18, '#9ab8ff', '#16203a', 2.6)}`,
    'tower-dive': () => `${bg('#1a1028', '#3a2048', '#ff6a8a')}${tower(84, 108, 1)}<path d="M84 22 L56 70" stroke="#6bc8ff" stroke-width="4" opacity=".8"/>${pony({ x: 4, y: 40, s: .66, eye: 'angry' })}${sparks([[56, 70, .8]], '', '#6bc8ff')}`,
    'gold-fever': () => `${bg('#2a1a04', '#5a3a08', '#ffd36b')}${[[34, 96, 14], [60, 100, 16], [86, 96, 14], [46, 80, 13], [74, 80, 13], [60, 64, 14]].map(([x, y, r]) => coin(x, y, r)).join('')}${sparks([[24, 36], [96, 30, .8], [60, 30, .6]], '', '#fff2b0')}`,
    'in-queue': () => `${bg('#0e1428', '#1e2a4a')}<circle cx="60" cy="52" r="32" fill="none" stroke="#2a3a5a" stroke-width="7"/><path d="M60 20 A32 32 0 1 1 28 52" fill="none" stroke="#6bc8ff" stroke-width="7" stroke-linecap="round"/>
      ${txt('4:59', 60, 60, 20, '#e6ecff', '#0e1428', 2)}${txt('IN QUEUE', 60, 108, 12, '#9ab8ff', '#0e1428', 2)}`,
    'dodge': () => `${bg('#2a1414', '#4a2020')}<rect x="20" y="30" width="80" height="44" rx="6" fill="#f6efe2" stroke="#4a2020" stroke-width="3" transform="rotate(-6 60 52)"/>${txt('DODGED', 60, 58, 16, '#c0392b', '#f6efe2', 0)}
      <path d="M40 74 L36 104 M80 70 L84 104" stroke="#6a4a2e" stroke-width="5"/>${txt('-5 LP', 60, 112, 12, '#ff8a9a', '#2a1414', 2)}`,
    'flash': () => `${bg('#1a1a04', '#4a4a10', '#ffe46b')}${[0, 1, 2].map(i => `<g opacity="${.2 + i * .25}">${pony({ x: 4 + i * 22, y: 30, s: .6, eye: 'normal' })}</g>`).join('')}${sparks([[100, 34], [104, 70, .7], [90, 96, .6]], '', '#ffe46b')}`,
    'ignite': () => `${bg('#2a0a04', '#5a1a08', '#ff6a1e')}${flame(60, 70, 1.4)}${dots([[30, 30, 1.6], [90, 24, 1.4], [26, 80], [96, 86, 1.6]], '#ffb46b', .9)}`,
    'health-potion': () => `${bg('#2a0a14', '#4a1424')}${glow(60, 70, 40, '#ff3a5a', .5)}<path d="M50 20 H70 V38 Q92 50 90 76 Q88 104 60 104 Q32 104 30 76 Q28 50 50 38 Z" fill="#e01e3a" stroke="#4a0a14" stroke-width="2.5"/>
      <path d="M36 70 Q60 62 84 70 Q86 98 60 100 Q34 98 36 70 Z" fill="#ff5a7a"/><rect x="48" y="12" width="24" height="10" rx="3" fill="#a87a4e" stroke="#4a2a14" stroke-width="2"/><ellipse cx="46" cy="58" rx="5" ry="10" fill="#fff" opacity=".45"/>`,
    'lens-sweep': () => `${bg('#120a0a', '#2a1414')}<path d="M60 96 L14 30 Q60 10 106 30 Z" fill="#ff3a3a" opacity=".22"/>${[[32, 42], [60, 34], [86, 46]].map(([x, y]) => `<g opacity=".9"><circle cx="${x}" cy="${y}" r="6" fill="#ffd36b"/><path d="M${x - 8} ${y - 8} L${x + 8} ${y + 8} M${x + 8} ${y - 8} L${x - 8} ${y + 8}" stroke="#ff3a3a" stroke-width="2.6"/></g>`).join('')}
      <circle cx="60" cy="96" r="12" fill="#c0392b" stroke="#fff" stroke-width="2"/><circle cx="60" cy="96" r="5" fill="#ff8a8a"/>`,
    'wolf-camp': () => `${bg('#060a12', '#121a2a')}${bush(30, 104, 60, '#0e2a1a', '#0a2014')}${bush(92, 106, 60, '#0e2a1a', '#0a2014')}${[[30, 56], [60, 46], [90, 58]].map(([x, y]) => `<g><path d="M${x - 9} ${y} L${x - 2} ${y - 4} L${x - 3} ${y + 3} Z M${x + 9} ${y} L${x + 2} ${y - 4} L${x + 3} ${y + 3} Z" fill="#ffd36b"/>${glow(x, y, 12, '#ffd36b', .35)}</g>`).join('')}`,
    'lag-spike': () => `${bg('#0a1414', '#143030')}<path d="M8 90 L30 86 L44 88 L54 84 L62 24 L70 88 L90 86 L112 88" fill="none" stroke="#ff5a6a" stroke-width="4" stroke-linejoin="round"/><path d="M8 100 H112" stroke="#2a5a5a" stroke-width="1.5"/>
      ${txt('999 ms', 60, 114, 13, '#ff8a9a', '#0a1414', 2)}${[0, 1, 2, 3].map(i => `<rect x="${86 + i * 6}" y="${20 + (3 - i) * 4}" width="4" height="${8 + i * 4}" fill="${i ? '#3a5a5a' : '#ff5a6a'}"/>`).join('')}`,
    'mute-all': () => `${bg('#1a1424', '#2a2040')}<path d="M24 26 H96 Q104 26 104 34 V70 Q104 78 96 78 H52 L36 92 L38 78 H24 Q16 78 16 70 V34 Q16 26 24 26 Z" fill="#e6e0f0" stroke="#2a2040" stroke-width="3"/>
      ${[0, 1, 2].map(i => `<rect x="30" y="${38 + i * 12}" width="${60 - i * 12}" height="5" rx="2.5" fill="#8a80a0"/>`).join('')}<path d="M14 100 L106 20" stroke="#ff4a5a" stroke-width="8" stroke-linecap="round"/>`,
    'honor': () => `${bg('#0a1a2a', '#1a3a5a', '#ffd36b')}<path d="M60 18 L94 32 V62 C94 84 78 98 60 106 C42 98 26 84 26 62 V32 Z" fill="#e2b23c" stroke="#6a4508" stroke-width="3"/>
      <path d="M60 28 L84 38 V62 C84 78 72 90 60 96 C48 90 36 78 36 62 V38 Z" fill="#1a3a6a"/><path d="M60 40 L64 52 L76 52 L66 60 L70 72 L60 64 L50 72 L54 60 L44 52 L56 52 Z" fill="#ffd36b"/>`,
    // ===== Uncommon =====
    'gank': () => `${bg('#0c1f16', '#1c4a2c')}${rays(60, 46, '#ff4d5e', 12, .07)}
      <g transform="translate(60 74)">
        <path d="M-30 -22 L-44 -50 L-16 -32 Z" fill="#c0392b" stroke="#3a0a0a" stroke-width="2"/><path d="M30 -22 L44 -50 L16 -32 Z" fill="#2a2a2a" stroke="#000" stroke-width="2"/>
        <circle cx="-44" cy="-50" r="4.5" fill="#ffd36b" stroke="#6a4508" stroke-width="1.2"/><circle cx="44" cy="-50" r="4.5" fill="#ffd36b" stroke="#6a4508" stroke-width="1.2"/>
        <path d="M-32 -20 Q0 -40 32 -20 Q30 -8 0 -6 Q-30 -8 -32 -20 Z" fill="#8a1a1a" stroke="#3a0a0a" stroke-width="2"/>
        <ellipse cx="0" cy="4" rx="26" ry="22" fill="#f2ebe0" stroke="#3a2a1a" stroke-width="2"/>
        <path d="M-15 -2 L-6 0 M15 -2 L6 0" stroke="#1a1a1a" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M-14 -5 Q-10 -9 -5 -6 M14 -5 Q10 -9 5 -6" stroke="#1a1a1a" stroke-width="1.6" fill="none"/>
        <path d="M-17 9 Q0 26 17 9 Q0 15 -17 9 Z" fill="#7a0a10" stroke="#1a1a1a" stroke-width="1.8"/>
        ${[-11, -5, 1, 7, 13].map(x => `<path d="M${x} 10.5 l3 4 l3 -4" fill="#fff"/>`).join('')}
        <path d="M-6 -16 L0 -10 L6 -16" stroke="#c0392b" stroke-width="2" fill="none"/></g>
      ${[...Array(10)].map((_, i) => `<path d="M${i * 13 - 6} 120 Q${i * 13 + 2} ${78 + (i % 3) * 6} ${i * 13 + 10} 120 Z" fill="${i % 2 ? '#2f8a4a' : '#256e3a'}"/>`).join('')}
      <ellipse cx="60" cy="112" rx="64" ry="18" fill="#2a7a40"/>
      <path d="M100 14 L108 34 H92 Z" fill="#ff4d5e" stroke="#7a0d16" stroke-width="2" stroke-linejoin="round"/><rect x="98.6" y="20" width="2.8" height="8" rx="1" fill="#fff"/><circle cx="100" cy="31" r="1.5" fill="#fff"/>`,
    'tilted': () => `${bg('#3a1010', '#6e1e14', '#ff5a3c')}${[0, 1, 2].map(i => `<path d="M${82 + i * 11} 42 q8 -9 0 -18 q-8 -9 0 -18" stroke="rgba(255,255,255,.55)" stroke-width="3.5" fill="none" stroke-linecap="round"/>`).join('')}
      <g transform="rotate(-16 60 70)">${pony({ x: 14, y: 24, s: .88, eye: 'angry', body: '#e8c48c', shade: '#b88848' })}</g>${txt('0 / 10 / 0', 60, 114, 12, '#ffb4a0', '#3a1010', 2)}`,
    'counter-jungle': () => `${bg('#140a24', '#2a1448', '#b98cff')}${bush(16, 112, 60, '#3a1a5a', '#2a1048')}${bush(106, 114, 60, '#3a1a5a', '#2a1048')}
      <g transform="translate(86 42) rotate(4)"><rect x="-22" y="-12" width="44" height="22" rx="3" fill="#7a2a2a" stroke="#2a0a0a" stroke-width="2"/><rect x="-2" y="10" width="4" height="40" fill="#5a3a1a"/>
        ${txt('ENEMY', 0, -1, 8, '#ffd6c8', '#7a2a2a', 0)}${txt('JUNGLE', 0, 7, 8, '#ffd6c8', '#7a2a2a', 0)}</g>
      ${pony({ x: 2, y: 40, s: .58, eye: 'angry', body: '#8a7aa8', shade: '#4a3a6a', mane: '#2a1a40' })}
      <path d="M44 66 Q58 48 70 62 Q76 74 62 80 Q48 82 44 66 Z" fill="#b08a5a" stroke="#4a2a10" stroke-width="2"/><path d="M50 58 Q54 52 60 56" stroke="#4a2a10" stroke-width="2" fill="none"/>
      ${txt('LOOT', 58, 72, 8, '#4a2a10', '#b08a5a', 0)}${[[30, 104], [40, 98], [50, 104], [60, 98]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.6" fill="#d8c8ff" opacity=".5"/>`).join('')}`,
    'dragon-soul': () => `${bg('#1a0a04', '#3a1a0a', '#ff9a3a')}${rays(60, 58, '#ffb46b', 16, .1)}${dragonEye(60, 58, 22, '#ffe46b', '#c0392b')}
      ${['#ff5a1e', '#3ab4ff', '#5fd08a', '#9aa6b8'].map((c, i) => { const a = i / 4 * Math.PI * 2 - Math.PI / 4; return `<circle cx="${(60 + Math.cos(a) * 40).toFixed(1)}" cy="${(58 + Math.sin(a) * 40).toFixed(1)}" r="7" fill="${c}" stroke="#fff" stroke-width="1.5"/>`; }).join('')}`,
    'herald-charge': () => `${bg('#141a2e', '#2a2048', '#b98cff')}${rays(86, 58, '#d8c8ff', 10, .07, 70)}
      ${tower(96, 116, .82)}<path d="M84 72 L92 60 L88 78 L96 70 L90 86" stroke="#fff" stroke-width="2" fill="none" opacity=".9"/>
      <g transform="translate(46 76)">
        <ellipse cx="0" cy="8" rx="40" ry="10" fill="#0a0a18" opacity=".5"/>
        <path d="M-40 0 C-40 -30 -10 -40 14 -34 C30 -30 38 -14 36 4 L-36 10 Z" fill="#5a3aa8" stroke="#1e1040" stroke-width="2.5"/>
        <path d="M-30 -10 C-20 -30 4 -34 20 -26" stroke="#8a6ad8" stroke-width="3" fill="none"/><path d="M-24 2 C-14 -16 6 -20 22 -14" stroke="#8a6ad8" stroke-width="3" fill="none"/>
        <path d="M30 -22 L58 -30 L38 -8 Z" fill="#e6e0f0" stroke="#1e1040" stroke-width="2"/>
        <circle cx="22" cy="-12" r="7" fill="#ffd36b" stroke="#1e1040" stroke-width="1.5"/><ellipse cx="23" cy="-12" rx="2" ry="5" fill="#2a1040"/>${glow(22, -12, 14, '#ffd36b', .5)}
        ${[-30, -12, 6, 22].map(x => `<path d="M${x} 8 l-4 10 M${x + 6} 8 l2 10" stroke="#1e1040" stroke-width="3" stroke-linecap="round"/>`).join('')}</g>
      ${[0, 1, 2].map(i => `<path d="M${6 - i * 2} ${62 + i * 12} H${-14}" stroke="#d8c8ff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`).join('')}${sparks([[86, 64, .9], [92, 54, .6]], '', '#ffd36b')}`,
    'double-kill': () => `${bg('#200a14', '#4a1424', '#ff5a6a')}${rays(60, 50, '#ff8a9a', 12, .09)}${sword(46, 96, 64, -24)}${sword(74, 96, 64, 24)}${txt('DOUBLE', 60, 112, 14, '#ffb4c0', '#200a14', 2.6)}`,
    'triple-kill': () => `${bg('#1e0a24', '#401448', '#e05aff')}${rays(60, 50, '#e8a0ff', 12, .09)}${sword(40, 98, 62, -30)}${sword(60, 100, 66, 0)}${sword(80, 98, 62, 30)}${txt('TRIPLE', 60, 114, 14, '#f0c8ff', '#1e0a24', 2.6)}`,
    'shutdown': () => `${bg('#2a1a08', '#4a2a10')}<rect x="24" y="14" width="72" height="88" rx="3" fill="#e8d4a8" stroke="#6a4a20" stroke-width="2.5" transform="rotate(3 60 58)"/>
      ${txt('WANTED', 60, 32, 13, '#5a2a0a', '#e8d4a8', 0)}<g transform="translate(36 36) scale(.48)">${pony({ x: 0, y: 0, s: 1, eye: 'angry' })}</g>${coin(84, 92, 13)}${txt('+1000', 50, 96, 12, '#5a2a0a', '#e8d4a8', 0)}`,
    'backdoor': () => `${bg('#0a0e1e', '#1a2240', '#6bc8ff')}<path d="M70 108 L84 36 L98 108 Z" fill="#3a4a6a" stroke="#1a2240" stroke-width="2"/><path d="M84 36 L78 20 L84 6 L90 20 Z" fill="#6bc8ff" stroke="#fff" stroke-width="1.5"/>${glow(84, 20, 20, '#6bc8ff', .7)}
      ${pony({ x: 4, y: 48, s: .56, eye: 'closed', body: '#9aa6b8', shade: '#5a6478', mane: '#3a4258' })}<path d="M44 96 q8 -6 16 0" stroke="#9ab8ff" stroke-width="2" fill="none" stroke-dasharray="3 3"/>${txt('SHH...', 34, 30, 12, '#9ab8ff', '#0a0e1e', 2)}`,
    'elder-dragon': () => `${bg('#0e0e14', '#24242e', '#d8d8ff')}${rays(60, 50, '#e6e6ff', 14, .07)}<path d="M8 104 C20 60 40 30 64 26 C92 22 112 48 112 104 Z" fill="#4a4a5e" stroke="#16161e" stroke-width="2.5"/>
      ${[[34, 50], [86, 44], [62, 34]].map(([x, y]) => `<path d="M${x} ${y} l-6 -14 l12 6 Z" fill="#8a8aa8"/>`).join('')}${dragonEye(46, 66, 9, '#e6e6ff', '#6a6aff')}${dragonEye(78, 66, 9, '#e6e6ff', '#6a6aff')}<path d="M40 90 Q60 100 80 90" stroke="#16161e" stroke-width="3" fill="none"/>`,
    'promo-series': () => `${bg('#0a1a14', '#14302a', '#5fd08a')}${['#5fd08a', '#5fd08a', '#3a4a5a'].map((c, i) => `<g transform="translate(${30 + i * 30} 56)"><rect x="-12" y="-12" width="24" height="24" rx="5" fill="${c}" stroke="#fff" stroke-width="2"/>${i < 2 ? '<path d="M-6 0 L-1 5 L7 -5" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>' : txt('?', 0, 7, 18, '#fff', '#3a4a5a', 0)}</g>`).join('')}${txt('PROMOS', 60, 100, 15, '#9aeec0', '#0a1a14', 2.4)}`,
    'smurf-alert': () => `${bg('#0a1a3a', '#1a3a7a', '#6bc8ff')}${pony({ x: 16, y: 18, s: .84, eye: 'happy', body: '#7ab8ff', shade: '#3a6ad8', mane: '#ffffff', extra: '<path d="M8 66 Q16 60 22 66 Q28 60 34 66 Q26 74 21 70 Q16 74 8 66 Z" fill="#3a2a1a"/>' })}${txt('LVL 31', 30, 26, 11, '#fff', '#0a1a3a', 2)}`,
    'buff-steal': () => `${bg('#1a0a04', '#3a1a0a', '#ff8a3a')}
      <g transform="translate(78 78)"><path d="M-26 30 L-30 -6 Q-30 -28 0 -30 Q30 -28 30 -6 L26 30 Z" fill="#8a3a1a" stroke="#2a0a04" stroke-width="2.5"/>
        <path d="M-20 -8 Q0 -20 20 -8" stroke="#ff8a3a" stroke-width="3" fill="none"/><circle cx="-9" cy="-4" r="4" fill="#ffd36b"/><circle cx="9" cy="-4" r="4" fill="#ffd36b"/>
        ${rune(0, 14, 10, '#ffb46b', '#b02a0a', 'M0 -5 L1.6 -1.6 L5 -1.6 L2.4 1 L3.4 5 L0 2.6 L-3.4 5 L-2.4 1 L-5 -1.6 L-1.6 -1.6 Z')}</g>
      <path d="M70 4 L54 36 H64 L56 64 L80 26 H68 L76 4 Z" fill="#ffe46b" stroke="#fff6c8" stroke-width="2" stroke-linejoin="round"/>${glow(66, 40, 24, '#ffe46b', .55)}
      ${pony({ x: 0, y: 40, s: .52, eye: 'angry' })}
      <g transform="translate(36 22) rotate(-12)"><rect x="-26" y="-9" width="52" height="18" rx="3" fill="none" stroke="#e01e2e" stroke-width="3"/>${txt('STOLEN!', 0, 5, 11, '#e01e2e', 'none', 0)}</g>`,
    'inhib-down': () => `${bg('#120a1e', '#2a1440', '#b98cff')}${rays(60, 52, '#e8d8ff', 14, .09)}
      <path d="M30 108 L36 92 H84 L90 108 Z" fill="#4a3a6a" stroke="#1a0a30" stroke-width="2"/><path d="M38 92 L44 84 H76 L82 92 Z" fill="#6a5a8a" stroke="#1a0a30" stroke-width="2"/>
      <path d="M50 84 L46 66 L58 74 Z" fill="#b98cff" stroke="#fff" stroke-width="1.5"/><path d="M70 84 L76 64 L62 74 Z" fill="#9a6ae0" stroke="#fff" stroke-width="1.5"/>
      ${[[40, 34, -30, 10], [80, 30, 25, 9], [58, 20, 5, 12], [28, 56, -50, 7], [94, 54, 60, 7], [66, 44, 15, 6]].map(([x, y, r, k]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0 ${-k} L${k * .5} 0 L0 ${k} L${-k * .5} 0 Z" fill="#d8b8ff" stroke="#fff" stroke-width="1.2"/>`).join('')}
      ${glow(60, 70, 26, '#ffffff', .75)}<path d="M60 58 L56 70 L62 70 L58 82" stroke="#fff" stroke-width="2.5" fill="none"/>${txt('INHIB DOWN', 60, 118, 10, '#e8d8ff', '#120a1e', 2)}`,
    'vision-king': () => `${bg('#04100a', '#0e2a1a')}
      ${[...Array(5)].map((_, i) => `<path d="M0 ${30 + i * 20} H120" stroke="#1a3a24" stroke-width="1"/><path d="M${20 + i * 22} 0 V120" stroke="#1a3a24" stroke-width="1"/>`).join('')}
      ${[[16, 22], [104, 20], [12, 96], [108, 98], [60, 108]].map(([x, y]) => `${glow(x, y, 16, '#ffe9a0', .55)}<circle cx="${x}" cy="${y}" r="4.5" fill="#ffd36b" stroke="#fff" stroke-width="1"/><circle cx="${x}" cy="${y}" r="1.8" fill="#2b6e3a"/>`).join('')}
      ${glow(60, 56, 40, '#ffe9a0', .35)}${pony({ x: 20, y: 30, s: .7, eye: 'happy' })}${crown(58, 26, .5, ['#6bc8ff', '#5fd08a', '#ffd36b', '#5fd08a', '#6bc8ff'])}${txt('VISION SCORE 99', 60, 118, 8, '#ffe9a0', '#04100a', 2)}`,
    // ===== Holo Rare =====
    'pentakill': () => `${bg('#1a0f30', '#3a1d5c', '#ffd36b')}${rays(60, 52, '#fff', 18, .07)}${crown(60, 44, 1)}${txt('PENTAKILL', 60, 110, 14, '#fff2a8', '#3a1d5c', 3)}${sparks([[16, 20], [104, 22, .8], [14, 86, .6], [106, 84, .7]])}`,
    'baron-steal': () => `${bg('#12061e', '#2e0f4a', '#9a5af0')}<path d="M6 120 C8 70 30 30 64 26 C98 22 118 56 114 120 Z" fill="#6a2ab8" stroke="#1e0838" stroke-width="2.5"/>
      ${[[30, 70], [44, 50], [88, 52], [100, 78]].map(([x, y]) => `<path d="M${x} ${y} l-6 -10 l10 4 Z" fill="#c9a0ff" opacity=".8"/>`).join('')}
      <ellipse cx="50" cy="62" rx="8" ry="10" fill="#ffe46b"/><ellipse cx="78" cy="62" rx="8" ry="10" fill="#ffe46b"/><ellipse cx="50" cy="64" rx="3" ry="7" fill="#1a0a2a"/><ellipse cx="78" cy="64" rx="3" ry="7" fill="#1a0a2a"/>
      <path d="M40 92 Q64 106 88 92 L84 100 L76 94 L70 102 L64 95 L58 102 L52 94 L44 100 Z" fill="#fff" stroke="#1e0838" stroke-width="2"/>
      <path d="M94 6 L72 46 H86 L76 84 L110 34 H92 L102 6 Z" fill="#ffe46b" stroke="#fff6c8" stroke-width="2" stroke-linejoin="round"/>${glow(90, 44, 26, '#ffe46b', .5)}`,
    'quadra-kill': () => `${bg('#0a1430', '#1a2a6a', '#6bc8ff')}${rays(60, 50, '#bfe4ff', 16, .08)}${[-36, -12, 12, 36].map(r => sword(60, 100, 66, r, '#e4f2ff', '#9ab8ff')).join('')}${txt('QUADRA', 60, 114, 15, '#d8f0ff', '#0a1430', 3)}${sparks([[18, 24], [102, 26, .8]])}`,
    'ace': () => `${bg('#1a0a04', '#4a2008', '#ffb43a')}${rays(60, 40, '#ffd36b', 18, .1)}
      <path d="M12 18 H108 L100 32 L108 46 H12 L20 32 Z" fill="#c0392b" stroke="#4a0a04" stroke-width="2.5"/>${txt('ACE', 60, 40, 20, '#fff2a8', '#4a0a04', 3)}
      ${[14, 37, 60, 83, 106].map((x, i) => `<g transform="translate(${x} ${92 + (i % 2) * 6})"><path d="M-10 18 V-6 Q-10 -18 0 -18 Q10 -18 10 -6 V18 Z" fill="#6a6a7a" stroke="#1a1a24" stroke-width="2"/>
        <path d="M-5 -10 l4 4 m0 -4 l-4 4 M1 -10 l4 4 m0 -4 l-4 4" stroke="#e01e2e" stroke-width="1.8" stroke-linecap="round"/><path d="M-4 2 H4" stroke="#1a1a24" stroke-width="1.6"/></g>`).join('')}
      ${sparks([[10, 60, .6], [110, 64, .7]], '', '#fff2a8')}`,
    'comeback': () => `${bg('#04140e', '#0e3a24', '#5fd08a')}<path d="M0 120 L0 96 L28 108 L50 76 L72 86 L120 30 V120 Z" fill="#14462e"/>
      <path d="M0 96 L28 108 L50 76 L72 86 L114 36" fill="none" stroke="#5fd08a" stroke-width="4" stroke-linejoin="round"/><path d="M118 30 L102 32 L112 44 Z" fill="#5fd08a"/>
      ${pony({ x: 70, y: 2, s: .42, eye: 'angry' })}${txt('-10K', 20, 82, 12, '#ff8a9a', '#04140e', 2)}${txt('WIN', 34, 28, 16, '#c8ffe0', '#04140e', 2.6)}${sparks([[96, 14, .6], [64, 22, .5]], '', '#c8ffe0')}`,
    'rank-up': () => `${bg('#0a1028', '#1a2a5a', '#ffd36b')}${rays(84, 26, '#fff2a8', 12, .11, 70)}
      ${[0, 1, 2, 3].map(i => `<rect x="${8 + i * 26}" y="${100 - i * 18}" width="26" height="${20 + i * 18}" fill="${['#8a5a2a', '#9aa6b8', '#e2b23c', '#6bd8d8'][i]}" stroke="#0a1028" stroke-width="2"/>${txt(['B', 'S', 'G', 'P'][i], 21 + i * 26, 116 - i * 9, 9, '#0a1028', 'none', 0)}`).join('')}
      ${pony({ x: 68, y: 6, s: .4, eye: 'happy' })}${sparks([[20, 30], [44, 16, .7], [110, 60, .6]])}`,
    'flawless': () => `${bg('#0e1a2a', '#2a3a5a', '#ffffff')}<ellipse cx="58" cy="18" rx="24" ry="6" fill="none" stroke="#ffe46b" stroke-width="4"/>${glow(58, 18, 30, '#fff6c8', .6)}${pony({ x: 14, y: 24, s: .84, eye: 'closed', body: '#f6efe2', shade: '#c8b89a', mane: '#ffd36b' })}${txt('0 DEATHS', 60, 114, 12, '#fff6c8', '#0e1a2a', 2.4)}`,
    // ===== Animated Rare (CSS-Klassen a-*) =====
    // Animated Rares: Hintergrund hier, die Figur kommt als Pop-out-Ebene aus POP
    'golden-pony': () => `${bg('#2a1a04', '#5a3a08')}${rays(60, 56, '#ffe08a', 16, .14, 95, 'a-spin')}${glow(60, 56, 48, '#fff2b0', .9, 'a-pulse')}${sparks([[18, 22, 1], [100, 30, .8], [96, 96, 1], [22, 92, .7]], 'a-twinkle')}`,
    'three-trick-legend': () => `${bg('#120a2a', '#2a1a5a')}${rays(60, 60, '#d8c8ff', 18, .12, 95, 'a-spin')}${glow(60, 62, 46, '#b98cff', .8, 'a-pulse')}${txt('3', 60, 74, 30, '#fff', '#2a1a5a', 3)}${sparks([[14, 18], [106, 20, .8], [16, 104, .7], [104, 102, .9]], 'a-twinkle')}`,
    'secretly-a-unicorn': () => `${bg('#2a0a3a', '#5a1a6a')}<g class="a-hue">${rays(60, 56, '#ff9ae4', 16, .16, 95, 'a-spin')}</g>${glow(60, 56, 46, '#ffd6f1', .8, 'a-pulse')}<g class="a-hue">${sparks([[16, 24, 1], [102, 26, .9], [98, 98, 1], [20, 96, .8]], 'a-twinkle', '#ffd6f1')}</g>`,
  };


  // Pop-out-Figuren der Animated Rares (eigene Ebene, ragt oben ueber den Bildrand)
  const POP = {
    'golden-pony': () => `<g class="a-float">${pony({ x: 16, y: 14, s: .88, eye: 'star', body: '#ffe08a', shade: '#c8941c', mane: '#fff4c8' })}</g>`,
    'three-trick-legend': () => `<g class="a-orbit" style="transform-origin:60px 62px">${[0, 1, 2].map(i => { const a = i / 3 * Math.PI * 2 - Math.PI / 2; const x = 60 + Math.cos(a) * 30 - 18, y = 62 + Math.sin(a) * 30 - 18; return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${pony({ x: 0, y: 0, s: .38, eye: 'happy', body: ['#ffe08a', '#7ab8ff', '#ff9ac8'][i], shade: ['#c8941c', '#3a6ad8', '#c84a8a'][i], mane: '#fff' })}</g>`; }).join('')}</g>`,
    'secretly-a-unicorn': () => `<g class="a-float">${pony({ x: 18, y: 22, s: .82, eye: 'happy', body: '#ffffff', shade: '#e0c8f0', mane: '#ff7ad9', extra: '<path d="M42 12 L26 -22 L50 8 Z" fill="#ffe08a" stroke="#c8941c" stroke-width="1.5" stroke-linejoin="round"/><circle cx="26" cy="54" r="4" fill="#ff9ec8" opacity=".8"/>' })}</g>`
  };


  // Hilfen fuer die Hochformat-Szenen (120x168)
  const fbg = (top, mid, bottom) => { const a = U('fb'); return `<defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="120" height="168" fill="url(#${a})"/>`; };
  const fvig = (op = .5) => { const v = U('fv'); return `<defs><radialGradient id="${v}" cx=".5" cy=".42" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${op}"/></radialGradient></defs><rect width="120" height="168" fill="url(#${v})"/>`; };
  const cloud = (x, y, s = 1, c = '#fff', o = .9) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="16" ry="8" fill="${c}"/><ellipse cx="-10" cy="2" rx="10" ry="6" fill="${c}"/><ellipse cx="11" cy="2" rx="11" ry="6.5" fill="${c}"/><ellipse cx="2" cy="-6" rx="9" ry="7" fill="${c}"/></g>`;
  const ward = (x, y, s = 1, cls = '') => `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})">${glow(0, 0, 14, '#ffe9a0', .6)}<path d="M-1.6 2 L-2.2 14 H2.2 L1.6 2 Z" fill="#6b4a2e"/><path d="M-7 -2 C-7 -9 7 -9 7 -2 C7 2 3 4 0 4 C-3 4 -7 2 -7 -2 Z" fill="#ffd36b" stroke="#a87a1e" stroke-width="1.2"/><circle cx="0" cy="-2" r="2" fill="#fff6c8"/></g>`;
  // ---------- Full Arts (v6.6.0, Nutzerauswahl) ----------
  // Vollbild-Szene im Hochformat (viewBox 120x168 = Kartenformat) + eigene
  // Hologramm-Figur (120x120 wie POP, schwebt ueber der Karte). Alle FAs haben
  // denselben Stil, egal welche Raritaet die Vorlage hat.
  const FA_ART = {
    'secretly-a-unicorn': () => `${fbg('#3a1050', '#8a3a8a', '#ffb0d8')}
      <g class="a-hue">${rays(60, 70, '#ffd6f1', 18, .14, 130, 'a-spin')}</g>${glow(60, 70, 60, '#ffe0f4', .55, 'a-pulse')}
      <path d="M0 132 Q30 120 60 128 T120 124 V168 H0 Z" fill="#c86aa8" opacity=".55"/><path d="M0 144 Q40 134 80 142 T120 138 V168 H0 Z" fill="#a24a8a"/>
      <g fill="#6a2a6a" opacity=".7"><rect x="84" y="104" width="6" height="26"/><rect x="92" y="96" width="8" height="34"/><rect x="102" y="106" width="6" height="24"/><path d="M84 104 L87 96 L90 104 Z M92 96 L96 84 L100 96 Z M102 106 L105 98 L108 106 Z"/></g>
      ${dots([[12, 18, 1], [30, 10, .8], [96, 14, 1.1], [110, 30, .8], [8, 60, .9], [114, 74, .8], [20, 96, .7]], '#fff', .9)}
      <g class="a-hue">${sparks([[16, 30, .8], [104, 22, .9], [10, 112, .6], [110, 100, .7]], 'a-twinkle', '#ffd6f1')}</g>${fvig(.35)}`,
    'pentakill': () => `${fbg('#12082a', '#2a1450', '#0a0618')}${rays(60, 62, '#ffd36b', 22, .1, 140, 'a-spin')}${glow(60, 66, 66, '#ffd36b', .4, 'a-pulse')}
      <path d="M0 128 L18 118 L34 126 L52 114 L70 124 L88 112 L104 122 L120 116 V168 H0 Z" fill="#1c0e34"/><path d="M0 142 Q40 132 80 140 T120 136 V168 H0 Z" fill="#0e0820"/>
      ${[[14, 128, -20], [34, 136, 14], [96, 130, 24], [108, 140, -12]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-1.4" y="-12" width="2.8" height="16" fill="#4a3a6a"/><path d="M1.4 -12 H12 L8 -8 L12 -4 H1.4 Z" fill="#6a2a3a"/></g>`).join('')}
      ${sparks([[14, 20, .8], [106, 16], [10, 92, .6], [112, 84, .7]], 'a-twinkle', '#fff2a8')}${fvig()}`,
    'flawless': () => `${fbg('#2a4a7a', '#8ab4e0', '#f0e6d0')}${rays(60, 64, '#fff', 20, .12, 140, 'a-spin')}${glow(60, 64, 70, '#fff6e0', .6)}
      ${cloud(18, 120, 1.2, '#fff', .85)}${cloud(100, 128, 1.4, '#fff', .9)}${cloud(60, 150, 1.8, '#fff', .95)}${cloud(10, 40, .7, '#fff', .5)}${cloud(108, 30, .8, '#fff', .5)}
      ${sparks([[22, 22, .7], [96, 52, .6], [16, 80, .5]], 'a-twinkle', '#fff')}${fvig(.25)}`,
    'tilted': () => `${fbg('#2a0606', '#6e1a10', '#1a0404')}${glow(60, 66, 70, '#ff5a3c', .4, 'a-pulse')}
      <g opacity=".85">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${-10 + i * 26} 0 L${6 + i * 26} 40 L${-4 + i * 26} 44 L${14 + i * 26} 90" stroke="#ff8a5a" stroke-width="1.2" fill="none" opacity="${.15 + (i % 3) * .1}"/>`).join('')}</g>
      <g transform="rotate(-8 60 140)"><path d="M-10 126 H130 V180 H-10 Z" fill="#3a0c08"/><path d="M10 126 L22 140 L16 152 M60 126 L54 138 L66 150 L60 168 M100 126 L108 142 L98 156" stroke="#ff6a3c" stroke-width="1.6" fill="none"/></g>
      ${fvig(.55)}${txt('0 / 10 / 0', 60, 124, 14, '#ffb4a0', '#2a0606', 3)}`,
    'shutdown': () => `${fbg('#3a2410', '#5a3a1a', '#2a1808')}
      ${[...Array(9)].map((_, i) => `<rect x="0" y="${i * 19}" width="120" height="18" fill="${i % 2 ? '#5a3a1a' : '#62401e'}"/><path d="M0 ${i * 19 + 18} H120" stroke="#2a1808" stroke-width="1.2"/><circle cx="${10 + (i * 37) % 100}" cy="${i * 19 + 9}" r="1.2" fill="#2a1808"/>`).join('')}
      ${glow(96, 20, 40, '#ffd36b', .45, 'a-pulse')}<path d="M96 0 V10" stroke="#2a1808" stroke-width="1.5"/><path d="M90 10 H102 L99 20 H93 Z" fill="#ffd36b" stroke="#6a4508" stroke-width="1"/>
      <rect x="0" y="146" width="120" height="22" fill="#2a1808"/><rect x="0" y="146" width="120" height="2" fill="#7a5a2a"/>${fvig(.55)}`,
    'vision-king': () => `${fbg('#03100a', '#0b2616', '#020a06')}
      ${[...Array(8)].map((_, i) => `<path d="M0 ${12 + i * 21} H120" stroke="#1a3a24" stroke-width=".8"/>`).join('')}${[...Array(6)].map((_, i) => `<path d="M${10 + i * 20} 0 V168" stroke="#1a3a24" stroke-width=".8"/>`).join('')}
      <path d="M0 168 L0 120 Q30 104 60 118 T120 110 V168 Z" fill="#0e2a18" opacity=".8"/>${bush(18, 150, 54, '#123a22', '#0e2e1a')}${bush(102, 154, 56, '#123a22', '#0e2e1a')}
      ${glow(60, 66, 56, '#ffe9a0', .25, 'a-pulse')}${dots([[20, 30, .8], [100, 40, .9], [30, 96, .7], [94, 104, .8]], '#ffe9a0', .6)}${fvig(.5)}`,
    'blue-buff': () => `${fbg('#020a1e', '#0a2a5a', '#020814')}${glow(60, 64, 70, '#3ab4ff', .4, 'a-pulse')}
      <path d="M0 0 H22 Q14 40 26 70 Q10 100 18 168 H0 Z M120 0 H98 Q108 40 94 74 Q112 104 102 168 H120 Z" fill="#06142e"/>
      <path d="M0 136 Q30 128 60 134 T120 130 V168 H0 Z" fill="#0d3a6e" opacity=".8"/>${[0, 1, 2].map(i => `<path d="M${14 + i * 34} ${146 + i * 5} q9 -4 18 0" stroke="#9ae4ff" stroke-width="1.6" fill="none" opacity=".55"/>`).join('')}
      ${dots([[30, 20, 1], [92, 28, 1.2], [22, 110, .9], [100, 120, 1], [60, 12, .8]], '#9ae4ff', .85)}${sparks([[14, 52, .5], [108, 64, .6]], 'a-twinkle', '#cdf2ff')}${fvig(.5)}`,
    'red-buff': () => `${fbg('#1e0402', '#5a1006', '#140200')}${glow(60, 64, 72, '#ff6a2a', .45, 'a-pulse')}
      <path d="M0 0 H20 Q12 44 24 76 Q8 104 16 168 H0 Z M120 0 H100 Q110 44 96 78 Q114 106 104 168 H120 Z" fill="#2a0604"/>
      <path d="M0 132 L20 126 L40 134 L64 124 L86 132 L120 124 V168 H0 Z" fill="#3a0a04"/><path d="M14 140 L30 150 L26 162 M70 136 L64 150 L76 160 M100 138 L108 152" stroke="#ff8a3a" stroke-width="1.6" fill="none"/>
      ${dots([[24, 30, 1], [96, 24, 1.1], [18, 100, .8], [104, 110, 1], [60, 16, .7], [40, 120, .7], [84, 118, .8]], '#ffb46b', .9)}${fvig(.55)}`,
    'mute-all': () => `${fbg('#140e1e', '#221a34', '#0e0a16')}
      ${[['?!', 6, 14, -8, '#ff5a6a'], ['gg ez', 70, 10, 6, '#9aa6b8'], ['report', 8, 120, 8, '#ff7a8a'], ['ff 15', 78, 132, -6, '#9aa6b8'], ['???', 92, 92, 10, '#ffd36b'], ['jgl diff', 4, 60, -4, '#9aa6b8']].map(([t, x, y, r, c]) => `<g transform="translate(${x} ${y}) rotate(${r})" opacity=".55"><rect width="${t.length * 5 + 10}" height="13" rx="5" fill="#2a2040" stroke="#3a3058" stroke-width="1"/><text x="5" y="9.4" font-family="Arial,sans-serif" font-weight="700" font-size="7" fill="${c}">${t}</text></g>`).join('')}
      ${fvig(.55)}`,
    'one-more-game': () => {
      const wall = U('fw'), scr = U('fsc'), kb = U('fkb');
      return `<defs>
          <linearGradient id="${wall}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#160a24"/><stop offset=".55" stop-color="#2c1438"/><stop offset="1" stop-color="#140818"/></linearGradient>
          <linearGradient id="${scr}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c4088"/><stop offset="1" stop-color="#0a1838"/></linearGradient>
          <linearGradient id="${kb}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff5ab4"/><stop offset=".25" stop-color="#ffd36b"/><stop offset=".5" stop-color="#7bffb4"/><stop offset=".75" stop-color="#6bc8ff"/><stop offset="1" stop-color="#b98cff"/></linearGradient></defs>
        <rect width="120" height="168" fill="url(#${wall})"/>
        <rect x="64" y="8" width="50" height="58" rx="2" fill="#0d0820" opacity=".55"/><circle cx="28" cy="30" r="20" fill="#0d0820" opacity=".4"/>
        ${glow(60, 120, 70, '#5aa8ff', .42, 'a-pulse')}
        <rect x="12" y="92" width="96" height="54" rx="4" fill="#0b0812" stroke="#3a2440" stroke-width="2"/>
        <rect x="16" y="96" width="88" height="44" rx="2" fill="url(#${scr})"/>
        <path d="M16 96 H104 L90 140 H16 Z" fill="#fff" opacity=".05"/>
        ${txt('DEFEAT', 60, 111, 9, '#ff5a6a', '#0a1838', 2)}
        <rect class="a-pulse" x="33" y="119" width="54" height="13" rx="3" fill="#ffd36b" stroke="#fff6c8" stroke-width="1.2"/>
        ${txt('PLAY AGAIN', 60, 128.6, 6.6, '#3a1d0a', 'none', 0)}
        <path d="M84 129 L84 138 L86.4 135.8 L88.4 140 L90 139.2 L88 135.2 L91.2 135 Z" fill="#fff" stroke="#000" stroke-width=".6"/>
        <rect x="53" y="146" width="14" height="5" fill="#241628"/>
        <rect x="0" y="150" width="120" height="18" fill="#3a2440"/><rect x="0" y="150" width="120" height="1.6" fill="#6b4a7a"/>
        <rect x="24" y="154" width="72" height="8" rx="1.5" fill="#120c18"/><rect x="26" y="155.5" width="68" height="5" rx="1" fill="url(#${kb})" opacity=".8"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${27 + i * 8.4}" y="156" width="7" height="4" rx=".6" fill="#120c18" opacity=".55"/>`).join('')}
        <rect x="3" y="128" width="9" height="22" rx="2" fill="#2ad86a" stroke="#0a3a1a" stroke-width="1"/><rect x="3" y="133" width="9" height="5" fill="#0a3a1a"/>
        <g transform="rotate(-78 108 150)"><rect x="104" y="134" width="8" height="18" rx="2" fill="#ff5ab4" stroke="#5a0a3a" stroke-width="1"/><rect x="104" y="138" width="8" height="4" fill="#5a0a3a"/></g>
        <rect x="98" y="134" width="20" height="12" rx="2" fill="#1a0a0a" stroke="#3a1a1a" stroke-width="1"/>
        <text x="108" y="143" text-anchor="middle" font-family="Consolas,monospace" font-weight="700" font-size="7" fill="#ff3a4a">3:47</text>`;
    }
  };
  // Mittlere Ebene (Nutzer): Teile des Hintergrunds schweben zwischen Szene und Figur
  const FA_MID = {
    'secretly-a-unicorn': () => { const rb = ['#ff6a8a', '#ffb45a', '#ffe46b', '#7be08a', '#6bc8ff', '#b98cff']; return `${rb.map((c, i) => `<path d="M${10 + i * 3.6} 124 A${50 - i * 3.6} ${50 - i * 3.6} 0 0 1 ${110 - i * 3.6} 124" stroke="${c}" stroke-width="3.6" fill="none" opacity=".9"/>`).join('')}${cloud(24, 122, .9)}${cloud(96, 122, .9)}${cloud(30, 30, .6, '#ffe8f6', .85)}`; },
    'pentakill': () => `${crown(60, 12, .5)}${glow(60, 16, 30, '#fff2a8', .35)}
      <g transform="translate(0 128)">${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${24 + i * 18} 0)"><circle r="7.5" fill="#2a1450" stroke="#ffd36b" stroke-width="1.6"/><path d="M-3.6 -1 C-3.6 -5 3.6 -5 3.6 -1 V1.6 H-3.6 Z" fill="#ffd36b"/><rect x="-2.2" y="1.6" width="4.4" height="2.4" fill="#ffd36b"/><circle cx="-1.4" cy="-1.2" r=".9" fill="#2a1450"/><circle cx="1.4" cy="-1.2" r=".9" fill="#2a1450"/></g>`).join('')}</g>`,
    'flawless': () => `<ellipse cx="60" cy="22" rx="26" ry="7" fill="none" stroke="#ffe46b" stroke-width="4.5"/><ellipse cx="60" cy="22" rx="26" ry="7" fill="none" stroke="#fff6c8" stroke-width="1.4"/>${glow(60, 22, 32, '#fff6c8', .5)}
      <g transform="translate(60 128)"><path d="M-46 -8 H46 L40 0 L46 8 H-46 L-40 0 Z" fill="#e2b23c" stroke="#6a4508" stroke-width="1.5"/><path d="M-50 -2 L-46 -8 L-46 8 Z M50 -2 L46 -8 L46 8 Z" fill="#a4700e"/>${txt('0 DEATHS', 0, 4, 10, '#fff6c8', '#6a4508', 2)}</g>`,
    'tilted': () => `${[[16, 22], [98, 30], [10, 96], [106, 104]].map(([x, y], i) => `<g transform="translate(${x} ${y}) rotate(${i * 23 - 30})"><rect x="-6" y="-6" width="12" height="12" rx="2" fill="#2a2030" stroke="#0a0408" stroke-width="1.2"/><text x="0" y="3" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="7" fill="#ff8a6a">${['Q', 'W', 'E', 'R'][i]}</text></g>`).join('')}
      ${[0, 1, 2].map(i => `<path d="M${74 + i * 12} 40 q8 -9 0 -18 q-8 -9 0 -18" stroke="rgba(255,255,255,.6)" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}`,
    'shutdown': () => `<g transform="translate(-4 -6) rotate(-6 34 60)"><rect x="8" y="26" width="52" height="68" rx="2" fill="#e8d4a8" stroke="#6a4a20" stroke-width="2"/><circle cx="34" cy="30" r="2.2" fill="#8a2a1a"/>
        ${txt('WANTED', 34, 41, 10, '#5a2a0a', '#e8d4a8', 0)}<g transform="translate(18 44) scale(.3)"><path d="${HEAD}" fill="#3a2410"/></g><text x="34" y="80" text-anchor="middle" font-family="Georgia,serif" font-size="5" fill="#5a2a0a">DEAD OR ALIVE</text>${txt('+1000', 34, 90, 9, '#8a2a0a', '#e8d4a8', 0)}</g>
      ${coin(96, 118, 9)}${coin(84, 132, 7)}${coin(104, 136, 8)}${coin(20, 130, 6)}`,
    'vision-king': () => `${ward(16, 30, 1.1, '')}${ward(104, 26, 1, '')}${ward(12, 110, .9, '')}${ward(108, 104, 1, '')}${ward(104, 62, .8, '')}`,
    'blue-buff': () => `${rune(60, 70, 52, '#6bd8ff', '#1a5ab0', 'M-16 -20 L0 -32 L16 -20 M-20 0 H20 M-16 20 L0 32 L16 20', 'a-pulse')}`,
    'red-buff': () => `${rune(60, 70, 52, '#ffb46b', '#b02a0a', 'M0 -32 L9 -6 L32 -6 L13 9 L19 32 L0 19 L-19 32 L-13 9 L-32 -6 L-9 -6 Z', 'a-pulse')}${flame(16, 130, .55)}${flame(104, 132, .55)}`,
    'mute-all': () => `<g transform="translate(-4 4) scale(.66)"><path d="M24 26 H96 Q104 26 104 34 V70 Q104 78 96 78 H52 L36 92 L38 78 H24 Q16 78 16 70 V34 Q16 26 24 26 Z" fill="#e6e0f0" stroke="#2a2040" stroke-width="3"/>
        ${[0, 1, 2].map(i => `<rect x="30" y="${38 + i * 12}" width="${60 - i * 12}" height="5" rx="2.5" fill="#8a80a0"/>`).join('')}<path d="M14 100 L106 20" stroke="#ff4a5a" stroke-width="8" stroke-linecap="round"/></g>`,
    'one-more-game': () => {
      const win = U('fwi');
      const clock = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="#2a1a30"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#f6efe2" stroke="#3a2a1a" stroke-width="2.4"/>
        ${[...Array(12)].map((_, i) => { const a = i / 12 * Math.PI * 2; return `<line x1="${(cx + Math.sin(a) * r * .8).toFixed(1)}" y1="${(cy - Math.cos(a) * r * .8).toFixed(1)}" x2="${(cx + Math.sin(a) * r * .92).toFixed(1)}" y2="${(cy - Math.cos(a) * r * .92).toFixed(1)}" stroke="#3a2a1a" stroke-width="${i % 3 ? .9 : 1.8}"/>`; }).join('')}
        <path d="M${cx} ${cy} L${(cx + Math.sin(3.8 / 12 * Math.PI * 2) * r * .5).toFixed(1)} ${(cy - Math.cos(3.8 / 12 * Math.PI * 2) * r * .5).toFixed(1)} M${cx} ${cy} L${(cx + Math.sin(47 / 60 * Math.PI * 2) * r * .75).toFixed(1)} ${(cy - Math.cos(47 / 60 * Math.PI * 2) * r * .75).toFixed(1)}" stroke="#3a2a1a" stroke-width="2.2" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="1.8" fill="#c0392b"/>`;
      const city = [[66, 50, 8], [74, 44, 7], [81, 52, 9], [90, 40, 8], [98, 48, 7], [105, 42, 9]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${66 - y}" fill="#140c2a"/>${[0, 1, 2].map(k => `<rect x="${x + 2}" y="${y + 3 + k * 5}" width="1.6" height="2" fill="#ffd36b" opacity="${(k + x) % 3 ? .85 : .3}"/>`).join('')}`).join('');
      return `<defs><linearGradient id="${win}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080d2a"/><stop offset="1" stop-color="#2a1a4a"/></linearGradient></defs>
        <rect x="64" y="8" width="50" height="58" rx="2" fill="url(#${win})"/>
        ${dots([[70, 16, .7], [80, 13, .5], [86, 24, .6], [74, 30, .5], [96, 34, .5], [110, 14, .6]], '#fff', .85)}
        <circle cx="100" cy="21" r="7.5" fill="#fff4c8"/><circle cx="103.5" cy="18.5" r="6.6" fill="#0b1030"/>${glow(100, 21, 16, '#fff4c8', .25)}
        ${city}
        <rect x="64" y="8" width="50" height="58" rx="2" fill="none" stroke="#4a2a52" stroke-width="3"/><path d="M89 8 V66 M64 37 H114" stroke="#4a2a52" stroke-width="2"/>
        <rect x="60" y="66" width="58" height="4" rx="1" fill="#4a2a52"/>
        ${clock(28, 30, 17)}
        <g class="a-twinkle d1">${spark(76, 22, .45, .9)}</g><g class="a-twinkle d3">${spark(106, 50, .35, .9)}</g>
`;
    }
  };
  const FA_POP = {
    'secretly-a-unicorn': () => POP['secretly-a-unicorn'](),
    'pentakill': () => `<g class="a-float">${sword(88, 74, 56, 26, '#fff6c8', '#ffd36b')}${pony({ x: 18, y: 32, s: .74, eye: 'star', body: '#ffe08a', shade: '#c8941c', mane: '#fff4c8' })}</g>`,
    'flawless': () => `<g class="a-float">${pony({ x: 16, y: 24, s: .82, eye: 'closed', body: '#f6efe2', shade: '#c8b89a', mane: '#ffd36b' })}</g>`,
    'tilted': () => `<g class="a-float"><g transform="rotate(-14 60 64)">${pony({ x: 16, y: 26, s: .8, eye: 'angry', body: '#e8c48c', shade: '#b88848', extra: '<path d="M22 22 L30 26 M26 18 L30 26" stroke="#c0392b" stroke-width="2.4" stroke-linecap="round"/>' })}</g></g>`,
    'shutdown': () => `<g class="a-float">${pony({ x: 50, y: 40, s: .64, eye: 'angry', extra: '<path d="M18 16 Q50 6 92 22 L86 30 Q52 18 22 26 Z" fill="#5a3a1a" stroke="#2a1808" stroke-width="1.5"/><path d="M34 16 Q40 -16 66 -8 Q80 -2 78 18 Q56 10 34 16 Z" fill="#6a4520" stroke="#2a1808" stroke-width="1.5"/><path d="M36 14 Q56 8 76 14" stroke="#c8a96e" stroke-width="2.4" fill="none"/>' })}</g>`,
    'vision-king': () => `<g class="a-float">${pony({ x: 18, y: 32, s: .76, eye: 'happy' })}${crown(61, 23, .46, ['#6bc8ff', '#5fd08a', '#ffd36b', '#5fd08a', '#6bc8ff'])}</g>`,
    'blue-buff': () => { const g = U('mana'); return `<g class="a-float">${pony({ x: 18, y: 30, s: .78, eye: 'happy', body: '#e8c48c', shade: '#b07d18', mane: '#3a7ad8' })}
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0f6ff"/><stop offset=".45" stop-color="#6bd8ff"/><stop offset="1" stop-color="#1a5ab0"/></linearGradient></defs>
      ${glow(60, 14, 18, '#6bd8ff', .55, 'a-pulse')}<g transform="translate(60 10)"><path d="M0 -15 C5 -6 10 0 10 7 A10 10 0 0 1 -10 7 C-10 0 -5 -6 0 -15 Z" fill="url(#${g})" stroke="#e0f6ff" stroke-width="1.4"/><ellipse cx="-3.4" cy="4" rx="2.4" ry="4" fill="#fff" opacity=".75"/><circle cx="3" cy="9" r="1.2" fill="#fff" opacity=".6"/></g></g>`; },
    'red-buff': () => `<g class="a-float">${pony({ x: 18, y: 30, s: .78, eye: 'angry', body: '#e8b48c', shade: '#a8601a', mane: '#ff5a1e' })}${flame(58, 18, .5)}</g>`,
    'mute-all': () => `<g class="a-float">${pony({ x: 34, y: 38, s: .7, eye: 'closed', extra: '<path d="M30 30 C34 0 76 -4 86 30" stroke="#2a2040" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="86" cy="40" rx="10" ry="12" fill="#3a3058" stroke="#120a1a" stroke-width="1.6"/><path d="M82 36 L86 36 L90 32 V48 L86 44 L82 44 Z" fill="#e6e0f0"/><path d="M80 34 L92 46" stroke="#ff4a5a" stroke-width="2"/>' })}${txt('ahh...', 28, 96, 9, '#e6e0f0', '#2a2040', 2)}</g>`,
    'one-more-game': () => `<g class="a-float">
      <g transform="translate(-6 40)"><path d="M40 16 L52 25 L33 16 Z" fill="#fff" stroke="#3a1d5c" stroke-width="1.6" stroke-linejoin="round"/>
        <rect width="54" height="18" rx="7" fill="#fff" stroke="#3a1d5c" stroke-width="1.6"/><rect x="32" y="15" width="10" height="3" fill="#fff"/>${txt('ONE MORE?', 27, 12.4, 6.6, '#3a1d5c', 'none', 0)}</g>
      ${pony({ x: 38, y: 24, s: .72, eye: 'tired', extra: `<path d="M30 40 Q36 44 42 40" stroke="#8a5aa0" stroke-width="1.6" fill="none"/>
        <path d="M31 28 C34 -2 76 -6 86 30" stroke="#1a1a24" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M33 26 C37 2 72 -2 83 26" stroke="#ff5ab4" stroke-width="1.2" fill="none" opacity=".8"/>
        <ellipse cx="85" cy="38" rx="8.5" ry="10.5" fill="#22202c" stroke="#0a0a10" stroke-width="1.5"/><ellipse cx="85" cy="38" rx="5" ry="7" fill="#ff5ab4" opacity=".85"/>
        <path d="M80 47 Q60 72 25 72" stroke="#22202c" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="24" cy="72" r="4.2" fill="#3a3a48" stroke="#0a0a10" stroke-width="1"/>` })}
    </g>`
  };

  // Set-Liste: Nummer, Id, Name, Raritaet
  const LIST = [
    ['golden-pony', 'Golden Pony'], ['three-trick-legend', 'Three-Trick Legend'], ['secretly-a-unicorn', 'Secretly a Unicorn'], ['pentakill', 'Pentakill'], ['baron-steal', 'Baron Steal'],
    ['quadra-kill', 'Quadra Kill'], ['ace', 'Ace'], ['comeback', 'Comeback'], ['rank-up', 'Rank Up'], ['flawless', 'Flawless'],
    ['gank', 'Gank Incoming'], ['tilted', 'Tilted'], ['counter-jungle', 'Counter Jungle'], ['dragon-soul', 'Dragon Soul'], ['herald-charge', 'Herald Charge'],
    ['double-kill', 'Double Kill'], ['triple-kill', 'Triple Kill'], ['shutdown', 'Shutdown'], ['backdoor', 'Backdoor'], ['elder-dragon', 'Elder Dragon'],
    ['promo-series', 'Promo Series'], ['smurf-alert', 'Smurf Alert'], ['buff-steal', 'Buff Steal'], ['inhib-down', 'Inhib Down'], ['vision-king', 'Vision King'],
    ['smite', 'Smite!'], ['one-more-game', 'One More Game'], ['ward', 'Ward Placed'], ['first-blood', 'First Blood'], ['blue-buff', 'Blue Buff'],
    ['red-buff', 'Red Buff'], ['river-crab', 'River Crab'], ['full-clear', 'Full Clear'], ['recall', 'Recall'], ['ping', 'Ping!'],
    ['gg', 'GG'], ['afk', 'AFK'], ['minion-wave', 'Minion Wave'], ['tower-dive', 'Tower Dive'], ['gold-fever', 'Gold Fever'],
    ['in-queue', 'In Queue'], ['dodge', 'Dodge'], ['flash', 'Flash'], ['ignite', 'Ignite'], ['health-potion', 'Health Potion'],
    ['lens-sweep', 'Lens Sweep'], ['wolf-camp', 'Wolf Camp'], ['lag-spike', 'Lag Spike'], ['mute-all', 'Mute All'], ['honor', 'Honor']
  ];
  // Nummerierung (v5.29.2): seltenste zuerst - #1-3 animated, #4-10 holo, #11-25 uncommon, #26-50 common
  const rarityOf = n => n <= 3 ? 'anim' : n <= 10 ? 'holo' : n <= 25 ? 'uncommon' : 'common';
  const SET = LIST.map(([id, name], i) => ({ n: i + 1, id, name, r: rarityOf(i + 1) }));
  const RL = { common: 'Common', uncommon: 'Uncommon', holo: 'Holo Rare', anim: 'Animated Rare' };
  const RC = { common: '#b8c2d2', uncommon: '#5fd08a', holo: '#b98cff', anim: '#ff5ab4' };

  // Kartenfront (Traegerkarte) - Rahmen/Effekte je Raritaet per CSS unten
  const art = id => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${ART[id]()}</svg>`;
  // Figur mit Volumen: Schatten auf der Karte + SLABS duenne, dunkle Schichten
  // (die Seitenkante, sichtbar beim Neigen) + farbige Vorderseite obenauf
  const SLABS = 12;
  const popLayers = (id, src = POP) => {
    const svg = src[id](), wrap = c => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${c}</svg>`;
    let out = `<div class="pop-shadow">${wrap(svg)}</div>`;
    // Schichten in Bild-Einheiten etwas dicker als die Vorderseite (feMorphology):
    // der Rand waechst mit der Kartengroesse mit - klein und gross gleich massiv
    for (let k = 0; k < SLABS; k++) {
      const f = U('dl');
      out += `<div class="pop slab" style="--i:${k};--shade:${(.28 + k / SLABS * .3).toFixed(2)}">${wrap(`<defs><filter id="${f}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="1.6"/></filter></defs><g filter="url(#${f})">${svg}</g>`)}</div>`;
    }
    return out + `<div class="pop" style="--i:${SLABS}">${wrap(svg)}</div>`;
  };
  const frontHtml = s => `<div class="stk-face stk-front r-${s.r}" style="--rc:${RC[s.r]}">
      <div class="art">${art(s.id)}</div>
      ${POP[s.id] ? popLayers(s.id) : ''}
      <div class="name">${s.name}</div>
      <div class="meta"><span class="rar">${RL[s.r]}</span><span>#${String(s.n).padStart(3, '0')}</span></div>
    </div>`;

  const CSS = `
  .stk-front { background: linear-gradient(160deg, #1b2a4a, #0e182c); border: 2px solid var(--rc); display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 7% 6% 5%; position: absolute; inset: 0; border-radius: 12px; overflow: hidden; }
  .stk-front .art { width: 100%; aspect-ratio: 1; border-radius: 8px; overflow: hidden; clip-path: inset(0 round 8px); position: relative; box-shadow: inset 0 0 0 1px rgba(255,255,255,.1), 0 3px 8px rgba(0,0,0,.4); }
  .stk-front .art svg { width: 100%; height: 100%; display: block; }
  .stk-front .name { font-family: 'Cinzel', Georgia, serif; font-size: .7em; letter-spacing: .5px; text-align: center; color: #fff; line-height: 1.15; margin-top: 5%; }
  .stk-front .meta { display: flex; justify-content: space-between; width: 100%; font-size: .5em; color: #8a8270; padding: 0 2px; }
  .stk-front .rar { color: var(--rc); letter-spacing: 1px; text-transform: uppercase; }
  /* Common: gebuerstetes Silber */
  .stk-front.r-common { border-color: transparent; background: linear-gradient(160deg, #1b2a4a, #0e182c) padding-box, linear-gradient(135deg, #e6ecf5, #7a8496 45%, #d8dee8 70%, #6a7486) border-box; }
  /* Uncommon: gruen-metallisch mit sanftem Innenleuchten */
  .stk-front.r-uncommon { border-color: transparent; background: radial-gradient(circle at 50% 35%, #1e3a3a, #0e182c 70%) padding-box, linear-gradient(135deg, #b8ffd8, #2a8a4a 40%, #8affc0 65%, #1e6a3a) border-box; box-shadow: inset 0 0 18px rgba(95,208,138,.18); }
  .stk-front.r-uncommon .name { color: #c8ffe0; }
  /* Holo: Regenbogen-Rahmen, Sternfolie, gerichteter Schimmer, goldgepraegter Name */
  .stk-front.r-holo { border-color: transparent; border-width: 3px; background: linear-gradient(160deg, #241a4a, #120c2a) padding-box, linear-gradient(var(--hb, 0deg), #ff7ad9, #ffd36b, #7bffb4, #6bc8ff, #b98cff, #ff7ad9) border-box; animation: holoFrame 4s linear infinite; }
  @property --hb { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
  @keyframes holoFrame { to { --hb: 360deg; } }
  .stk-front.r-holo .art::after { content: ''; position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen; opacity: .32; background: linear-gradient(45deg, transparent 0%, transparent 8%, #ff7ad9 16%, #ffd36b 21%, #7bffb4 26%, #6bc8ff 31%, #b98cff 36%, transparent 43%, transparent 50%, transparent 58%, #ff7ad9 66%, #ffd36b 71%, #7bffb4 76%, #6bc8ff 81%, #b98cff 86%, transparent 93%, transparent 100%); background-size: 9em 9em; animation: holoTile 3.2s linear infinite; }
  @keyframes holoTile { from { background-position: 0 0; } to { background-position: 9em 0; } }
  .stk-front.r-holo .art::before { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: .35; mix-blend-mode: screen;
    background-image: radial-gradient(1.2px 1.2px at 12% 18%, #fff, transparent), radial-gradient(1px 1px at 38% 62%, #fff, transparent), radial-gradient(1.4px 1.4px at 72% 28%, #fff, transparent), radial-gradient(1px 1px at 86% 76%, #fff, transparent), radial-gradient(1.2px 1.2px at 22% 84%, #fff, transparent), radial-gradient(1px 1px at 58% 12%, #fff, transparent); background-size: 50% 50%; }
  @keyframes holoSweep { from { background-position: 100% 100%; } to { background-position: 0% 0%; } }
  .stk-front.r-holo .name { background: linear-gradient(180deg, #fff6c8, #e2b23c 60%, #a4700e); -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: bold; filter: drop-shadow(0 1px 0 #3a2400); }
  /* Animated: pulsierender Pink-Gold-Rahmen, bewegte Kunst */
  .stk-front.r-anim { border-color: transparent; border-width: 3px; background: radial-gradient(circle at 50% 30%, #3a1040, #120a24 70%) padding-box, linear-gradient(var(--hb, 0deg), #ff5ab4, #ffd36b, #ff5ab4, #b98cff, #ff5ab4) border-box; animation: holoFrame 2.6s linear infinite, animPulse 1.6s ease-in-out infinite; }
  @keyframes animPulse { 0%,100% { box-shadow: 0 0 8px rgba(255,90,180,.45), inset 0 0 14px rgba(255,90,180,.25); } 50% { box-shadow: 0 0 22px rgba(255,211,107,.75), inset 0 0 22px rgba(255,211,107,.35); } }
  .stk-front.r-anim .name { background: linear-gradient(90deg, #ffd6f1, #ffd36b, #ff9ae4, #ffd36b, #ffd6f1); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: bold; animation: nameShine 2.4s linear infinite; }
  @keyframes nameShine { to { background-position: 200% 0; } }
  /* Hologramm-Effekt der Animated Rares: Die Figur liegt auf einer Ebene
     ueber der Karte (wie ~2 cm ueber einer Karte in der Hand), ihr Schatten
     liegt AUF der Karte. Abstand (--lift) und Perspektive skalieren mit der
     Kartenbreite (tiltTo), damit klein und gross gleich raeumlich wirken; die
     Figur wird per --comp so skaliert, dass sie von vorn gleich gross bleibt
     und nur durch den Blickwinkel versetzt erscheint. */
  .stk-card { transform-style: preserve-3d; }
  .stk-front.r-anim { overflow: visible; transform-style: preserve-3d; }
  .stk-front .pop, .stk-front .pop-shadow { position: absolute; left: 6%; right: 6%; top: 5%; aspect-ratio: 1; pointer-events: none; }
  .stk-front .pop { z-index: 3; transform: translateZ(calc(var(--lift, 0px) + var(--i, 0) * var(--step, 0px))) scale(var(--comp, 1)); transition: transform .3s ease-out; }
  .stk-front .pop.slab { filter: brightness(var(--shade, .5)) saturate(1.15) contrast(1.1); }
  .stk-front .pop-shadow { z-index: 2; transform: translate(3%, 5%); filter: brightness(0) blur(3px); opacity: .5; transition: filter .3s, opacity .3s; }
  .stk-card.tilting .stk-front .pop-shadow, .insp .stk-front .pop-shadow { filter: brightness(0) blur(6px); opacity: .42; }
  .stk-front .pop svg, .stk-front .pop-shadow svg { width: 100%; height: 100%; overflow: visible; }
  .stk-card.tilting { transition: transform .08s linear; }
  .stk-card.tilt-reset { transition: transform .35s ease-out; }
  .a-spin { animation: aSpin 14s linear infinite; transform-box: view-box; }
  @keyframes aSpin { to { transform: rotate(360deg); } }
  .a-orbit { animation: aSpin 9s linear infinite; transform-box: view-box; }
  .a-float { animation: aFloat 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes aFloat { 0%,100% { transform: translateY(2px) rotate(-1.5deg); } 50% { transform: translateY(-5px) rotate(1.5deg); } }
  .a-pulse { animation: aPulse 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes aPulse { 0%,100% { opacity: .55; transform: scale(.92); } 50% { opacity: 1; transform: scale(1.06); } }
  .a-twinkle { animation: aTwinkle 1.2s ease-in-out infinite; transform-box: fill-box; }
  .a-twinkle.d1 { animation-delay: .3s; } .a-twinkle.d2 { animation-delay: .6s; } .a-twinkle.d3 { animation-delay: .9s; }
  @keyframes aTwinkle { 0%,100% { opacity: .2; transform: scale(.5); } 50% { opacity: 1; transform: scale(1.15); } }
  .a-hue { animation: aHue 4s linear infinite; }
  @keyframes aHue { to { filter: hue-rotate(360deg); } }
  `;
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

  // Neigt eine Karte (px/py = -0.5..0.5, Blickrichtung) mit groessenabhaengiger
  // Tiefe: Augenabstand ~3 Kartenbreiten, Hologramm-Abstand ~22 % der Breite
  function tiltTo(c, px, py, max = 16) {
    const w = c.offsetWidth || 150, P = w * 3, lift = w * .3;
    c.style.setProperty('--lift', `${lift}px`);
    c.style.setProperty('--step', `${(w * .0095).toFixed(2)}px`);        // Schichtabstand = Dicke der Figur
    c.style.setProperty('--comp', ((P - lift) / P).toFixed(4));
    c.style.transform = `perspective(${P}px) rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg)`;
  }
  function untilt(c) { c.style.removeProperty('--lift'); c.style.removeProperty('--comp'); c.style.removeProperty('--step'); c.style.transform = ''; }
  // Karte neigt sich zum Cursor, solange man darauf ist (nur Karten in root)
  function enableTilt(root, max = 16) {
    root.addEventListener('mousemove', e => {
      const c = e.target.closest('.stk-card'); if (!c || !root.contains(c)) return;
      const r = c.getBoundingClientRect();
      c.classList.add('tilting'); c.classList.remove('tilt-reset');
      tiltTo(c, (e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5, max);
    });
    root.addEventListener('mouseout', e => {
      const c = e.target.closest('.stk-card'); if (!c || c.contains(e.relatedTarget)) return;
      c.classList.remove('tilting'); c.classList.add('tilt-reset'); untilt(c);
    });
  }
  // Maus verlaesst das Fenster: alle geneigten Karten sanft in die Grundstellung
  document.addEventListener('mouseleave', () => document.querySelectorAll('.stk-card.tilting').forEach(c => { c.classList.remove('tilting'); c.classList.add('tilt-reset'); untilt(c); }));

  // Nur das Sticker-Quadrat (ohne Traegerkarte) - fuers Profil (v5.29.0).
  // Animated Rares bekommen ihre Figur als eigene Ebene mit Hoehen-Schatten.
  const square = s => `<div class="stk-square r-${s.r}">${art(s.id)}${POP[s.id] ? `<div class="stk-sq-pop"><svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${POP[s.id]()}</svg></div>` : ''}</div>`;

  // Sticker-Quadrat mit echter Hologramm-Figur wie im Album (v6.5.0): Animated
  // Rares bekommen Schatten + Schichten (popLayers), tiltTo hebt sie an.
  const square3d = s => POP[s.id] ? `<div class="stk-sq3d r-${s.r}"><div class="stk-square r-${s.r}">${art(s.id)}</div>${popLayers(s.id)}</div>` : square(s);
  const sq = document.createElement('style');
  sq.textContent = `.stk-square { position: relative; width: 100%; height: 100%; border-radius: 12px; overflow: hidden; clip-path: inset(0 round 12px); }
  .stk-square > svg { width: 100%; height: 100%; display: block; }
  .stk-square.r-holo::after { content: ''; position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen; opacity: .32; background: linear-gradient(45deg, transparent 0%, transparent 8%, #ff7ad9 16%, #ffd36b 21%, #7bffb4 26%, #6bc8ff 31%, #b98cff 36%, transparent 43%, transparent 50%, transparent 58%, #ff7ad9 66%, #ffd36b 71%, #7bffb4 76%, #6bc8ff 81%, #b98cff 86%, transparent 93%, transparent 100%); background-size: 9em 9em; animation: holoTile 3.2s linear infinite; }
  .stk-square.r-anim { box-shadow: 0 0 14px rgba(255,90,180,.55), 0 4px 12px rgba(0,0,0,.4); }
  .stk-sq-pop { position: absolute; inset: 0; pointer-events: none; filter: drop-shadow(4px 7px 4px rgba(0,0,0,.5)); }
  .stk-sq-pop svg { width: 100%; height: 100%; overflow: visible; }
  html.fx-off .stk-square *, html.fx-paused .stk-square * { animation-play-state: paused !important; }
  /* 3D-Variante (Profil): gleiche Hologramm-Ebenen wie die Album-Karte. Keine filter/opacity
     auf Elementen in der 3D-Kette - sonst flacht Chrome alles ab (nur auf den Blaettern). */
  .stk-sq3d { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
  .stk-sq3d > .stk-square { box-shadow: 0 6px 14px rgba(0,0,0,.45); }
  .stk-sq3d > .pop, .stk-sq3d > .pop-shadow { position: absolute; inset: 0; pointer-events: none; }
  .stk-sq3d > .pop { transform: translateZ(calc(var(--lift, 0px) + var(--i, 0) * var(--step, 0px))) scale(var(--comp, 1)); transition: transform .3s ease-out; }
  .stk-sq3d > .pop.slab { filter: brightness(var(--shade, .5)) saturate(1.15) contrast(1.1); }
  .stk-sq3d > .pop-shadow { transform: translate(3%, 5%); filter: brightness(0) blur(4px); opacity: .45; }
  .stk-sq3d svg { width: 100%; height: 100%; overflow: visible; }
  html.fx-off .stk-sq3d *, html.fx-paused .stk-sq3d * { animation-play-state: paused !important; }`;
  document.head.appendChild(sq);

  // Full Arts: Szene (Hochformat), Hologramm-Figur mit Schichten, flache Figur
  const faArt = id => FA_ART[id] ? `<svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${FA_ART[id]()}</svg>` : '';
  const faPop = id => FA_POP[id] ? popLayers(id, FA_POP) : '';
  // Mittlere Ebene: Schatten auf der Szene + duenne Kante + Vorderseite, auf ~45 % der Figurenhoehe
  const MID_SLABS = 4;
  const faMid = id => {
    if (!FA_MID[id]) return '';
    const svg = FA_MID[id](), wrap = x => `<svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${x}</svg>`;
    let out = `<div class="fa-mid-shadow">${wrap(svg)}</div>`;
    for (let k = 0; k < MID_SLABS; k++) {
      const fl = U('ml');
      out += `<div class="fa-mid slab" style="--i:${k};--shade:${(.3 + k / MID_SLABS * .25).toFixed(2)}">${wrap(`<defs><filter id="${fl}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="1.1"/></filter></defs><g filter="url(#${fl})">${svg}</g>`)}</div>`;
    }
    return out + `<div class="fa-mid" style="--i:${MID_SLABS}">${wrap(svg)}</div>`;
  };
  const faMidFlat = id => FA_MID[id] ? `<svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${FA_MID[id]()}</svg>` : '';
  const faPopFlat = id => FA_POP[id] ? `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${FA_POP[id]()}</svg>` : '';
  window.STICKERS = { SET, RL, RC, art, frontHtml, square, square3d, enableTilt, tiltTo, untilt, TOTAL: SET.length, HEAD, faArt, faPop, faPopFlat, faMid, faMidFlat };
  // Alle Sticker-Sets nach id (v6.5.0) - weitere Sets melden sich hier an (stickers-neon.js)
  window.STICKER_SETS = window.STICKER_SETS || {};
  window.STICKER_SETS.base = window.STICKERS;
})();
