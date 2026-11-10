// Three-Trick-Pony - Set 3 "Worlds Stage" (50 Sticker, regulaeres Set).
// Thema: League-Esport / die Weltmeisterschaft, das Pony als Star - eigene Motive,
// keine Riot-/LoL-Logos, keine echten Team-Logos, keine echten Gesichter.
// #1 ist eine Hommage an den "Unkillable Demon King" (die Mid-Lane-Legende) -
// als ruhiger Pony-Daemonenkoenig, ausdruecklich KEIN Portraet der echten Person.
// Raritaeten wie Lock In: #1-3 animated, #4-10 holo, #11-25 uncommon, #26-50 common.
// Laedt NACH stickers.js (nutzt dessen Karten-CSS, Neigung und Zeichen-Bausteine KIT).
(function () {
  const B = window.STICKERS, K = B.KIT;
  const { U, pony, bg, glow, rays, spark, sparks, txt, sword, flame, minion } = K;

  // ---------- Szenen-Details (wie Lock In) ----------
  const D = {
    hex: (c = '#fff', op = .06) => { const p = U('wpx'); return `<defs><pattern id="${p}" width="12" height="10.4" patternUnits="userSpaceOnUse"><path d="M3 0 H9 L12 5.2 L9 10.4 H3 L0 5.2 Z" fill="none" stroke="${c}" stroke-width=".7"/></pattern></defs><rect width="120" height="120" fill="url(#${p})" opacity="${op}"/>`; },
    hatch: (c = '#fff', op = .05) => { const p = U('wpt'); return `<defs><pattern id="${p}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V6" stroke="${c}" stroke-width="1.2"/></pattern></defs><rect width="120" height="120" fill="url(#${p})" opacity="${op}"/>`; },
    grid: (c = '#fff', op = .06) => { const p = U('wpg'); return `<defs><pattern id="${p}" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 H0 V10" fill="none" stroke="${c}" stroke-width=".6"/></pattern></defs><rect width="120" height="120" fill="url(#${p})" opacity="${op}"/>`; },
    beams: (c = '#fff', op = .08) => `<g opacity="${op}">${[[18, 22], [52, 16], [86, 26]].map(([x, w]) => `<path d="M${x} -4 L${x + w} -4 L${x + w + 26} 124 L${x + 10} 124 Z" fill="${c}"/>`).join('')}</g>`,
    motes: (c = '#fff', n = 9) => [...Array(n)].map((_, i) => `<circle cx="${(i * 37 + 11) % 112 + 4}" cy="${(i * 53 + 7) % 104 + 6}" r="${.7 + (i % 3) * .45}" fill="${c}" opacity="${.35 + (i % 4) * .12}"/>`).join(''),
    shadow: (x, y, rx, ry = rx * .22, op = .45) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#000" opacity="${op}"/>`
  };

  // ---------- Pony-Zubehoer (im Koordinatensystem des Pony-Kopfs, 0..100) ----------
  const ACC = {
    // Gaming-Headset: Buegel ueber den Kopf, Ohrmuschel, Mikro-Arm zur Schnauze
    headset: (c = '#1c2236', led = '#6bc8ff') => `<path d="M40 26 C38 4 64 -2 66 30" stroke="#0a0e1a" stroke-width="7.4" fill="none" stroke-linecap="round"/><path d="M40 26 C38 4 64 -2 66 30" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M44 12 C48 5 56 4 61 10" stroke="#fff" stroke-width="1.2" opacity=".35" fill="none"/>
      <path d="M58 49 C50 62 38 66 26 62" stroke="#0a0e1a" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M58 49 C50 62 38 66 26 62" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="24" cy="61.5" rx="4.4" ry="3.4" fill="#0a0e1a"/><ellipse cx="23" cy="60.4" rx="1.6" ry="1.1" fill="#fff" opacity=".35"/>
      <ellipse cx="65" cy="40" rx="9.5" ry="11.5" fill="${c}" stroke="#0a0e1a" stroke-width="2"/><ellipse cx="65" cy="40" rx="5.6" ry="7.4" fill="#2e3854"/><circle cx="65" cy="40" r="2.4" fill="${led}"/><path d="M59 33 Q61 30 65 30" stroke="#fff" stroke-width="1.2" opacity=".35" fill="none"/>`,
    // Trikot mit V-Kragen und Schulterstreifen
    jersey: (c = '#2a5ad8', c2 = '#ffd36b', num = '') => `<path d="M38 112 C40 94 52 86 68 86 C88 84 102 94 106 112 Z" fill="${c}" stroke="#0a0e1a" stroke-width="2"/><path d="M42 106 C46 98 52 94 58 92" stroke="#fff" stroke-width="2" opacity=".25" fill="none"/>
      <path d="M56 87 L66 98 L80 86" fill="none" stroke="${c2}" stroke-width="3.2" stroke-linejoin="round"/><path d="M90 90 C98 94 104 102 106 110" stroke="${c2}" stroke-width="3" fill="none"/>${num ? txt(num, 88, 109, 11, c2, '#0a0e1a', 2) : ''}`,
    // Anzug mit Hemd und Krawatte (Caster, Pressekonferenz)
    suit: (c = '#1a2238', tie = '#c8202e') => `<path d="M38 112 C40 94 52 86 68 86 C88 84 102 94 106 112 Z" fill="${c}" stroke="#05070e" stroke-width="2"/><path d="M58 87 L69 106 L80 86 Z" fill="#f6efe2" stroke="#8a8270" stroke-width="1"/>
      <path d="M67 92 H71 L73 104 L69 110 L65 104 Z" fill="${tie}" stroke="#3a0408" stroke-width="1"/><path d="M58 87 L64 104 L56 96 Z M80 86 L74 104 L84 94 Z" fill="#2a3450" stroke="#05070e" stroke-width="1"/><circle cx="90" cy="100" r="2" fill="#ffd36b"/>`,
    // Brille im Profil: vorderes Glas + dahinter hervorschauendes zweites Glas,
    // Steg ueber den Nasenruecken und Buegel bis zum Ohr (liest sich nicht als Monokel)
    glasses: (c = '#141018') => `<path d="M24 27 C20 27 18.6 30 19 33.4 C19.4 37 21.4 39 24.4 38.6" fill="#bfe0ff" fill-opacity=".18" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M24.4 31 H29" stroke="${c}" stroke-width="2.2"/>
      <rect x="29" y="25.6" width="16" height="14.6" rx="4.4" fill="#bfe0ff" fill-opacity=".2" stroke="${c}" stroke-width="2.6"/><path d="M45 30 L58 27.6 L66 30.6" stroke="${c}" stroke-width="2.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M32 29.6 L36 28" stroke="#fff" stroke-width="1.4" opacity=".75" stroke-linecap="round"/><path d="M40.6 37.4 L43 35.6" stroke="#fff" stroke-width="1" opacity=".45" stroke-linecap="round"/>`,
    // ruhiger, fokussierter Blick: schweres Oberlid + roter Glanz im Auge
    calm: () => `<path d="M30 28.6 Q36 26 42.4 29 L42.4 32 Q36 29.6 30 32 Z" fill="#1a1410"/><circle cx="37.6" cy="34.6" r="1.3" fill="#ff3a3a"/>`,
    // Koenigsmantel mit hohem Kragen (dunkel, rot gefuettert, Goldborte)
    mantle: (c = '#1a0c14', lin = '#a8101e') => `<path d="M34 112 C34 92 46 82 66 84 C88 82 104 92 110 112 Z" fill="${c}" stroke="#e2b23c" stroke-width="2"/><path d="M42 106 C48 96 58 91 66 91" stroke="${lin}" stroke-width="3" fill="none"/><path d="M40 110 C46 100 56 95 64 95" stroke="#e2b23c" stroke-width="1" fill="none" opacity=".7"/>
      <path d="M50 92 L40 72 L62 87 Z M88 86 L104 66 L102 94 Z" fill="${c}" stroke="#e2b23c" stroke-width="1.6" stroke-linejoin="round"/><path d="M50 90 L44 78 L58 87 Z M90 86 L101 72 L100 90 Z" fill="${lin}"/>
      <circle cx="68" cy="94" r="4.6" fill="#e2b23c" stroke="#5a3a06" stroke-width="1.2"/><circle cx="68" cy="94" r="2.2" fill="#ff2a3a"/>`,
    // Siegerumhang: weiss-gold, ueber den Schultern
    cape: () => `<path d="M30 112 C32 92 46 82 66 84 C90 82 106 94 112 112 Z" fill="#f6efe2" stroke="#8a6a20" stroke-width="2"/><path d="M38 110 C44 98 54 92 66 92 C84 90 100 98 106 110" stroke="#e2b23c" stroke-width="3.4" fill="none"/><path d="M50 100 C56 94 62 92 68 92" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>`,
    // Daemonenkoenig: zurueckgebogene Hoerner + klare dunkle Krone (3 Zacken, ein roter Stein)
    demon: () => { const g = U('dh'), k = U('dk'); return `<defs><linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2a060a"/><stop offset=".6" stop-color="#7a101a"/><stop offset="1" stop-color="#ff5a4a"/></linearGradient><linearGradient id="${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a34"/><stop offset="1" stop-color="#0a0408"/></linearGradient></defs>
      <path d="M44 16 C36 8 34 -4 40 -14 C42 -4 46 2 52 8 Z" fill="url(#${g})" stroke="#140204" stroke-width="1.6" stroke-linejoin="round"/><path d="M70 12 C78 2 90 -2 100 2 C90 4 84 10 80 20 Z" fill="url(#${g})" stroke="#140204" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M42 22 L42 8 L50 14 L58 -6 L66 14 L74 8 L74 22 Z" fill="url(#${k})" stroke="#e2b23c" stroke-width="2" stroke-linejoin="round"/><path d="M41 18 H75 V24 H41 Z" fill="#120810" stroke="#e2b23c" stroke-width="1.6"/>
      <path d="M58 6 C55 10 55 13 58 15 C61 13 61 10 58 6 Z" fill="#ff2a3a" stroke="#ffd36b" stroke-width=".9"/><circle cx="42" cy="8" r="1.6" fill="#e2b23c"/><circle cx="74" cy="8" r="1.6" fill="#e2b23c"/><circle cx="58" cy="-6" r="1.6" fill="#e2b23c"/><path d="M47 13 L50 10" stroke="#fff" stroke-width="1" opacity=".45"/>`; },
    // Baseball-Kappe (Schirm nach vorn = zur Schnauze)
    cap: (c = '#1a3a7a', c2 = '#ffd36b') => `<path d="M32 26 C30 2 76 -4 86 24 Z" fill="${c}" stroke="#06101e" stroke-width="2"/><path d="M38 14 C46 4 66 2 76 10" stroke="#fff" stroke-width="1.6" opacity=".3" fill="none"/><path d="M58 -1 V22" stroke="#06101e" stroke-width="1" opacity=".5"/><circle cx="58" cy="-1" r="2.4" fill="${c}" stroke="#06101e" stroke-width="1"/>
      <path d="M34 24 C22 20 10 24 4 30 C16 32 28 30 36 28 Z" fill="${c}" stroke="#06101e" stroke-width="1.8"/><path d="M50 12 l4 4 -4 4 -4 -4 Z" fill="${c2}"/>`,
    // offenes Maul (ruft / singt)
    mouth: () => `<path d="M14 66 C18 80 32 78 36 64 C30 68 22 70 14 66 Z" fill="#4a0a14" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/><path d="M20 72 C24 75 28 75 31 72" stroke="#ff7a8a" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    sweat: () => `<path d="M84 34 C80 42 80 46 84 47 C88 46 88 42 84 34 Z" fill="#9ae4ff" stroke="#fff" stroke-width="1"/><path d="M90 50 C87 56 87 59 90 60 C93 59 93 56 90 50 Z" fill="#9ae4ff" stroke="#fff" stroke-width=".8"/>`,
    // Schlafmaske auf die Stirn geschoben
    sleepmask: () => `<path d="M30 20 C44 12 64 12 82 20 L80 30 C64 22 46 22 32 30 Z" fill="#6a5ad8" stroke="#1a1040" stroke-width="1.6"/><path d="M42 22 Q47 26 52 22 M58 21 Q63 25 68 21" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M82 22 C90 22 96 26 98 32" stroke="#1a1040" stroke-width="2" fill="none"/>`,
    whistle: () => `<path d="M60 88 C58 96 50 100 44 100" stroke="#e2402e" stroke-width="2" fill="none"/><rect x="34" y="96" width="12" height="8" rx="3" fill="#c8d0dc" stroke="#2a3040" stroke-width="1.2"/><circle cx="38" cy="100" r="2" fill="#2a3040"/>`,
    medal: () => `<path d="M56 88 L66 104 M84 88 L74 104" stroke="#2a5ad8" stroke-width="5"/><path d="M56 88 L66 104 M84 88 L74 104" stroke="#d83a4a" stroke-width="1.6"/><circle cx="70" cy="108" r="8" fill="#ffd36b" stroke="#7a5208" stroke-width="1.6"/><path d="M70 103 l1.6 3.4 3.6 .3 -2.8 2.4 1 3.6 -3.4 -2 -3.4 2 1 -3.6 -2.8 -2.4 3.6 -.3 Z" fill="#fff6c8"/>`
  };
  const P = (o = {}, ...extras) => pony({ ...o, extra: extras.join('') + (o.extra || '') });

  // ---------- Gegenstaende ----------
  // Grosser Silberpokal (eigene Form), Fusspunkt (x,y), Hoehe ~70*s
  const cup = (x, y, s = 1) => { const g = U('wcp'); return `<g transform="translate(${x} ${y}) scale(${s})"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a6478"/><stop offset=".3" stop-color="#f4f8ff"/><stop offset=".55" stop-color="#c8d0dc"/><stop offset="1" stop-color="#3e4658"/></linearGradient></defs>
    <path d="M-17 0 L-13 -9 H13 L17 0 Z" fill="url(#${g})" stroke="#1e2432" stroke-width="1.4" stroke-linejoin="round"/><path d="M-15 -3 H15" stroke="#ffd36b" stroke-width="1.6"/><rect x="-12" y="-13" width="24" height="5" rx="2" fill="url(#${g})" stroke="#1e2432" stroke-width="1.2"/>
    <path d="M-5 -13 C-6 -20 -3 -26 -3 -32 H3 C3 -26 6 -20 5 -13 Z" fill="url(#${g})" stroke="#1e2432" stroke-width="1.2"/><ellipse cy="-31" rx="7" ry="3" fill="url(#${g})" stroke="#1e2432" stroke-width="1.2"/>
    ${[-1, 1].map(d => `<path d="M${d * 20} -64 C${d * 32} -64 ${d * 32} -46 ${d * 12} -41" fill="none" stroke="#1e2432" stroke-width="5.6" stroke-linecap="round"/><path d="M${d * 20} -64 C${d * 32} -64 ${d * 32} -46 ${d * 12} -41" fill="none" stroke="url(#${g})" stroke-width="3.4" stroke-linecap="round"/>`).join('')}
    <path d="M-22 -70 H22 C22 -50 14 -36 0 -34 C-14 -36 -22 -50 -22 -70 Z" fill="url(#${g})" stroke="#1e2432" stroke-width="1.6"/>
    <path d="M-21 -60 Q0 -55 21 -60" stroke="#8a96aa" stroke-width="1.2" fill="none"/><path d="M0 -58 l6 6 -6 6 -6 -6 Z" fill="#ffd36b" stroke="#7a5208" stroke-width=".9"/>
    <ellipse cy="-70" rx="22" ry="4.4" fill="#e8eef8" stroke="#1e2432" stroke-width="1.4"/><ellipse cy="-70" rx="17" ry="2.6" fill="#4a5466"/>
    <path d="M-15 -64 C-15 -52 -11 -44 -5 -40" stroke="#fff" stroke-width="2.4" fill="none" opacity=".75" stroke-linecap="round"/></g>`; };
  // Handmikrofon (Kopf bei x,y), optional mit Wuerfel (Sender-Kuerzel)
  const mic = (x, y, rot = 0, s = 1, cube = '') => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><rect x="-3.4" y="4" width="6.8" height="30" rx="3" fill="#20242e" stroke="#06080e" stroke-width="1.2"/><path d="M-1.4 7 V31" stroke="#4a5060" stroke-width="1.2"/>
    ${cube ? `<rect x="-8" y="9" width="16" height="12" rx="1.6" fill="#1a3a8a" stroke="#06080e" stroke-width="1"/>${txt(cube, 0, 18, 6, '#ffd36b', 'none', 0)}` : ''}
    <circle r="8" fill="#5a6070" stroke="#06080e" stroke-width="1.4"/><path d="M-7 -3 H7 M-7.6 1 H7.6 M-6 5 H6 M-3 -7.4 V7.4 M3 -7.4 V7.4" stroke="#2a2e38" stroke-width=".8"/><circle cx="-2.6" cy="-3" r="2.2" fill="#fff" opacity=".45"/></g>`;
  // Monitor (x,y = obere linke Ecke), inner in lokalen Koordinaten
  const monitor = (x, y, w, h, inner = '', scr = '#0a1a3a') => `<g transform="translate(${x} ${y})"><rect x="${w / 2 - 3}" y="${h}" width="6" height="6" fill="#2a3040"/><rect x="${w / 2 - 10}" y="${h + 5}" width="20" height="3" rx="1.5" fill="#3a4256" stroke="#10141e" stroke-width="1"/>
    <rect width="${w}" height="${h}" rx="2.4" fill="#1a1e2a" stroke="#06080e" stroke-width="1.6"/><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="1.2" fill="${scr}"/>${inner}<path d="M3 3 L${w * .4} 3 L3 ${h * .5} Z" fill="#fff" opacity=".07"/></g>`;
  // Nexus-Kristall auf Sockel (Fusspunkt x,y)
  const nexus = (x, y, s, c, c2, lit = true) => `<g transform="translate(${x} ${y}) scale(${s})">${lit ? glow(0, -20, 28, c, .55) : ''}<ellipse rx="22" ry="7" fill="#2a3040" stroke="#0a0e16" stroke-width="1.6"/><ellipse cy="-2" rx="18" ry="5" fill="#4a5466"/>
    <path d="M0 -42 L12 -19 L0 -3 L-12 -19 Z" fill="${c}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 -42 L0 -3 L-12 -19 Z" fill="${c2}" opacity=".7"/><path d="M-12 -19 H12" stroke="#fff" stroke-width=".8" opacity=".6"/><path d="M-4 -32 L-1 -37" stroke="#fff" stroke-width="1.6" opacity=".8" stroke-linecap="round"/>
    ${[-1, 1].map(d => `<path d="M${d * 15} -4 L${d * 21} -24 L${d * 12} -11 Z" fill="${c2}" stroke="#fff" stroke-width=".8"/>`).join('')}</g>`;
  const note = (x, y, s = 1, c = '#ffd36b', cls = '') => `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}"><ellipse cx="-3" cy="6" rx="4.4" ry="3.2" transform="rotate(-20 -3 6)" fill="${c}" stroke="#2a1a04" stroke-width="1"/><path d="M1 5 V-10 Q8 -8 9 -2" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round"/></g></g>`;
  // Feuerwerk
  const burst = (x, y, r, c, cls = '') => `<g class="${cls}" style="transform-origin:${x}px ${y}px">${glow(x, y, r * .7, c, .45)}${[...Array(12)].map((_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M${(x + Math.cos(a) * r * .35).toFixed(1)} ${(y + Math.sin(a) * r * .35).toFixed(1)} L${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)}" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/><circle cx="${(x + Math.cos(a) * r * 1.13).toFixed(1)}" cy="${(y + Math.sin(a) * r * 1.13).toFixed(1)}" r="1.3" fill="#fff"/>`; }).join('')}</g>`;
  // Scheinwerfer-Kegel von oben (x) nach unten (tx), Breite w
  const spot = (x, tx, w, c = '#fff', op = .3, cls = '') => { const g = U('wsp'); return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="${op}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs><path class="${cls}" d="M${x - 2.5} -2 L${x + 2.5} -2 L${tx + w} 122 L${tx - w} 122 Z" fill="url(#${g})"/>`; };
  // Publikum: Kopf-Silhouetten, optional mit Leuchtstaeben
  const crowd = (y = 104, c = '#04061a', lights = null, cls = '') => { let o = '', l = ''; for (let i = 0; i < 15; i++) { const x = +(i * 8.6 - 2).toFixed(1), h = (i * 5) % 4; o += `<circle cx="${x}" cy="${y - h}" r="4.4" fill="${c}"/><path d="M${x - 6.4} ${y + 20} C${x - 6.4} ${y + 3 - h} ${x + 6.4} ${y + 3 - h} ${x + 6.4} ${y + 20} Z" fill="${c}"/>`; if (lights && i % 2 === 0) { const lx = x + 4, ly = y - 12 - (i % 3) * 3, lc = lights[(i / 2) % lights.length]; l += `<path d="M${x + 3} ${y - 1} L${lx} ${ly}" stroke="${c}" stroke-width="1.8"/>${glow(lx, ly, 6, lc, .45)}<g transform="translate(${lx} ${ly})"><circle class="${cls ? `${cls} d${i % 4}` : ''}" r="2.2" fill="${lc}"/></g>`; } } return o + l; };
  const CONF = ['#ffd36b', '#ff6ab4', '#6bc8ff', '#7bffb4', '#b98cff', '#ffffff'];
  const confetti = (n, seed = 1, cls = '', a = [2, 4, 116, 108]) => [...Array(n)].map((_, i) => { const x = a[0] + (i * 37 + seed * 13) % a[2], y = a[1] + (i * 53 + seed * 29) % a[3], r = (i * 47 + seed * 31) % 180; return `<g transform="translate(${x} ${y}) rotate(${r})"><rect class="${cls ? `${cls} d${i % 4}` : ''}" x="-2" y="-1" width="${3.6 + (i % 2)}" height="${1.8 + (i % 3) * .5}" rx=".4" fill="${CONF[(i + seed) % CONF.length]}"/></g>`; }).join('');
  // Buehnenboden mit Fluchtlinien und Goldkante
  const floor = (y = 94, c = '#0c1230', edge = '#c8a96e') => `<rect y="${y}" width="120" height="${120 - y}" fill="${c}"/>${[...Array(9)].map((_, i) => `<path d="M60 ${y} L${i * 30 - 60} 120" stroke="#fff" stroke-width=".6" opacity=".07"/>`).join('')}<path d="M0 ${y} H120" stroke="${edge}" stroke-width="1.6"/><path d="M0 ${y + 2.4} H120" stroke="#fff" stroke-width=".6" opacity=".18"/>`;
  const portrait = (x, y, w, hi = false, c = '#4a5a7a') => `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="3" fill="${hi ? '#3a2a0a' : '#1e2638'}" stroke="${hi ? '#ffd36b' : '#3a4a6a'}" stroke-width="${hi ? 2 : 1}"/><circle cx="${x + w / 2}" cy="${y + w * .42}" r="${w * .2}" fill="${hi ? '#ffd36b' : c}" opacity=".9"/><path d="M${x + w * .2} ${y + w * .9} Q${x + w / 2} ${y + w * .52} ${x + w * .8} ${y + w * .9} Z" fill="${hi ? '#ffd36b' : c}" opacity=".9"/>`;
  // Huf mit Aermel (fuer Handschlag & Co.), zeigt nach rechts; flip spiegelt
  const hoof = (x, y, rot, sleeve, flip = false) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${flip ? -1 : 1} 1)"><path d="M-40 -9 H-8 V9 H-40 Z" fill="${sleeve}" stroke="#0a0e1a" stroke-width="1.8"/><path d="M-12 -9 V9" stroke="#ffd36b" stroke-width="2.4"/><path d="M-40 -4 H-12" stroke="#fff" stroke-width="1.4" opacity=".25"/>
    <path d="M-8 -7 H8 C12 -7 14 -3 14 0 C14 3 12 7 8 7 H-8 Z" fill="#e8c48c" stroke="rgba(0,0,0,.4)" stroke-width="1.4"/><path d="M8 -7 C13 -7 16 -3 16 0 C16 3 13 7 8 7 Z" fill="#4a3020" stroke="#1a0e06" stroke-width="1.2"/><path d="M-6 -4 H6" stroke="#fff" stroke-width="1.4" opacity=".3"/></g>`;
  const cloud = (x, y, s = 1, c = '#fff', o = .9) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="16" ry="8" fill="${c}"/><ellipse cx="-10" cy="2" rx="10" ry="6" fill="${c}"/><ellipse cx="11" cy="2" rx="11" ry="6.5" fill="${c}"/><ellipse cx="2" cy="-6" rx="9" ry="7" fill="${c}"/></g>`;
  const heart = (x, y, s = 1, c = '#ff5a8a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -4 C-6 -14 -20 -6 0 12 C20 -6 6 -14 0 -4 Z" fill="${c}" stroke="#fff" stroke-width="2"/><path d="M-9 -8 C-11 -8 -12 -5 -11 -3" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/></g>`;
  const bolt = (x, y, s = 1, c = '#ffe46b') => `<path transform="translate(${x} ${y}) scale(${s})" d="M4 -16 L-8 2 H-1 L-5 16 L8 -3 H1 Z" fill="${c}" stroke="#fff6c8" stroke-width="1.2" stroke-linejoin="round"/>`;
  const card = (x, y, w, h, rot, c, inner) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-w / 2 + 2}" y="${-h / 2 + 3}" width="${w}" height="${h}" rx="5" fill="#000" opacity=".35"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="5" fill="#141a30" stroke="${c}" stroke-width="2.4"/><rect x="${-w / 2 + 3}" y="${-h / 2 + 3}" width="${w - 6}" height="${h - 6}" rx="3" fill="${c}" opacity=".18"/>${inner}</g>`;

  // ---------- Die 50 Motive ----------
  const ART = {
    // ===== Animated Rare: Hintergrund hier, Figur als Hologramm-Ebene (POP) =====
    // Hommage an den "Unkillable Demon King": Finsternis-Ring, Thron-Silhouette, Mid-Lane als Diagonale, ruhige Bedrohung
    'unkillable-demon-king': () => `${bg('#0c0206', '#2a0610')}${D.hex('#ff8a6a', .03)}
      <path d="M-6 126 L126 -6" stroke="#3a0c0c" stroke-width="14" opacity=".8"/><path d="M-6 126 L126 -6" stroke="#ffd36b" stroke-width="1.2" stroke-dasharray="5 5" opacity=".45"/>
      ${rays(60, 46, '#ff9a6a', 18, .09, 95, 'a-spin')}<g class="a-pulse" style="transform-origin:60px 46px">${glow(60, 46, 56, '#ff1e2e', .6)}</g>
      <circle cx="60" cy="46" r="38" fill="#ff5a3a" opacity=".14"/><circle cx="60" cy="46" r="34" fill="#080104" stroke="#e2b23c" stroke-width="2"/><circle cx="60" cy="46" r="29" fill="none" stroke="#ff3a3a" stroke-width=".8" stroke-dasharray="2 3" opacity=".7"/>
      <path d="M24 120 V58 L30 46 L36 56 V44 L46 28 L60 12 L74 28 L84 44 V56 L90 46 L96 58 V120 Z" fill="#12040a" stroke="#7a1a14" stroke-width="1.4" stroke-linejoin="round"/><path d="M60 16 L60 120" stroke="#2a080e" stroke-width="2"/>
      ${[[30, 46], [60, 12], [90, 46]].map(([x, y]) => `<path d="M${x} ${y - 4} l3 4 -3 4 -3 -4 Z" fill="#e2b23c"/>`).join('')}
      <path d="M8 120 L16 106 H104 L112 120 Z" fill="#1a0408" stroke="#e2b23c" stroke-width="1.2" stroke-opacity=".8"/><path d="M16 106 H104" stroke="#ff5a3a" stroke-width=".8" opacity=".5"/>
      <path d="M60 108 l5 5.4 -5 5.4 -5 -5.4 Z" fill="#2a080e" stroke="#e2b23c" stroke-width="1"/>${txt('1', 60, 116.4, 7, '#ffd36b', 'none', 0)}
      ${[[12, 70], [22, 92], [100, 80], [110, 56], [96, 100], [14, 40], [104, 24], [40, 100], [82, 98]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><circle class="a-twinkle d${i % 4}" r="${1.1 + (i % 3) * .5}" fill="${i % 2 ? '#ffd36b' : '#ff5a3a'}"/></g>`).join('')}
      ${sparks([[10, 12, .55], [112, 110, .45]], 'a-twinkle', '#ffd36b')}`,
    'summoners-cup': () => `${bg('#081030', '#1a2a64')}${D.beams('#9ab8ff', .07)}${rays(60, 40, '#ffe9b0', 18, .1, 95, 'a-spin')}<g class="a-pulse" style="transform-origin:56px 36px">${glow(56, 36, 46, '#ffd36b', .55)}</g>
      ${spot(14, 40, 16, '#9ab8ff', .22)}${spot(106, 80, 16, '#ffb4e0', .22)}${floor(100)}${confetti(30, 3, 'a-twinkle')}
      ${[[18, 16], [100, 20], [108, 74]].map(([x, y], i) => `<g class="a-twinkle d${i}">${spark(x, y, .7, 1, '', '#fff6c8')}</g>`).join('')}`,
    'grand-final': () => `${bg('#05061a', '#140a36')}${D.grid('#6a7aff', .04)}
      <rect x="10" y="8" width="100" height="34" rx="3" fill="#0a0e2a" stroke="#3a4a8a" stroke-width="1.6"/><rect x="13" y="11" width="94" height="28" rx="2" fill="#1a1450"/>${glow(60, 25, 40, '#b98cff', .35, 'a-pulse')}
      ${[...Array(9)].map((_, i) => `<path d="M${16 + i * 11} 11 V39" stroke="#000" stroke-width=".6" opacity=".35"/>`).join('')}${txt('GRAND FINAL', 60, 30, 11, '#ffd36b', '#0a0e2a', 2.4)}
      ${spot(18, 30, 20, '#9ab8ff', .3, 'a-pulse')}${spot(102, 90, 20, '#ff9ad8', .3, 'a-pulse')}${spot(60, 60, 14, '#fff', .16)}
      <path d="M6 98 L18 82 H102 L114 98 Z" fill="#141c40" stroke="#c8a96e" stroke-width="1.4"/><path d="M6 98 H114 V103 H6 Z" fill="#0a0e24"/>${[...Array(12)].map((_, i) => `<g transform="translate(${11 + i * 9} 100.5)"><circle class="a-twinkle d${i % 4}" r="1.2" fill="${i < 6 ? '#6bc8ff' : '#ff6a6a'}"/></g>`).join('')}
      ${crowd(110, '#03040f', ['#6bc8ff', '#ffd36b', '#ff6ab4'], 'a-twinkle')}`,

    // ===== Holo Rare =====
    'world-champion': () => `${bg('#0a0e28', '#1e2450', '#ffd36b')}${D.hex('#ffe9b0', .045)}${rays(60, 50, '#ffe9b0', 20, .1)}
      ${glow(90, 50, 30, '#fff', .3)}${cup(92, 94, 1.02)}${D.shadow(48, 98, 30)}
      ${P({ x: 6, y: 22, s: .64, eye: 'closed' }, ACC.cape(), ACC.medal())}
      <path d="M4 102 L16 98 L16 116 L4 112 L9 107 Z M116 102 L104 98 L104 116 L116 112 L111 107 Z" fill="#a87a14" stroke="#4a3004" stroke-width="1.2"/><path d="M14 96 H106 V114 H14 Z" fill="#e2b23c" stroke="#4a3004" stroke-width="1.6"/><path d="M14 98 H106" stroke="#fff6c8" stroke-width="1.2" opacity=".7"/>
      ${txt('CHAMPION', 60, 109, 10, '#3a2404', '#fff2b0', 1)}${sparks([[14, 18, .8], [104, 16, .9], [108, 66, .6], [12, 70, .5]], '', '#fff6c8')}${D.motes('#ffe9b0')}`,
    'finals-mvp': () => `${bg('#1a0a2a', '#3a1a5a', '#ffd36b')}${D.hatch('#ffd6f1', .04)}${rays(70, 60, '#ffe9b0', 16, .1)}
      ${txt('MVP', 66, 26, 24, '#ffd36b', '#2a0a3a', 3.4)}<path d="M38 30 H94" stroke="#ffd36b" stroke-width="1.2" opacity=".6"/>
      ${D.shadow(72, 104, 28)}${P({ x: 38, y: 32, s: .62, eye: 'star' }, ACC.jersey('#5a1a8a', '#ffd36b'))}
      <path d="M12 0 L22 66 M34 0 L24 66" stroke="#2a5ad8" stroke-width="7"/><path d="M12 0 L22 66 M34 0 L24 66" stroke="#d83a4a" stroke-width="2"/>
      ${glow(23, 82, 22, '#ffd36b', .55)}<circle cx="23" cy="82" r="16" fill="#e2b23c" stroke="#6a4508" stroke-width="2"/><circle cx="23" cy="82" r="11.5" fill="none" stroke="#fff2b0" stroke-width="1.2"/>
      <path d="M23 72 l3 6.4 7 .6 -5.4 4.6 1.8 6.8 -6.4 -3.8 -6.4 3.8 1.8 -6.8 -5.4 -4.6 7 -.6 Z" fill="#fff6c8" stroke="#8a5a08" stroke-width=".8"/><path d="M13 76 Q16 70 22 69" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/>
      ${sparks([[104, 14, .7], [10, 110, .5], [110, 100, .6]], '', '#fff2b0')}${D.motes('#ffd6f1', 7)}`,
    'the-outplay': () => `${bg('#04121c', '#0e3a4a', '#6bffd8')}${D.hatch('#9affe8', .05)}
      ${[0, 1, 2, 3, 4].map(i => `<path d="M${-4} ${30 + i * 16} H${30 - (i % 2) * 10}" stroke="#9affe8" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>`).join('')}
      <ellipse cx="22" cy="96" rx="20" ry="7" fill="#ff3a4a" opacity=".22" stroke="#ff5a6a" stroke-width="1.6" stroke-dasharray="4 3"/>
      <path d="M124 14 L-4 24" stroke="#ff2a3a" stroke-width="7" opacity=".3"/><path d="M124 14 L-4 24" stroke="#ffb0b0" stroke-width="2"/><path d="M124 108 L40 116" stroke="#ff2a3a" stroke-width="7" opacity=".3"/><path d="M124 108 L40 116" stroke="#ffb0b0" stroke-width="2"/>
      <g opacity=".18">${P({ x: 6, y: 40, s: .56, eye: 'angry' })}</g><g opacity=".35">${P({ x: 20, y: 34, s: .56, eye: 'angry' })}</g>
      <path d="M14 102 C24 70 40 50 70 46" stroke="#9affe8" stroke-width="2" stroke-dasharray="4 3" fill="none"/>${P({ x: 36, y: 28, s: .58, eye: 'angry' }, ACC.headset('#0e2a3a', '#6bffd8'))}
      ${txt('1v3', 100, 66, 14, '#6bffd8', '#04121c', 2.6)}${sparks([[100, 40, .7], [16, 10, .5], [108, 92, .6]], '', '#c8fff0')}${D.motes('#9affe8', 7)}`,
    'base-race': () => `${bg('#0a1020', '#1a1a3a')}<path d="M0 120 L0 0 L120 120 Z" fill="#2a5ad8" opacity=".12"/><path d="M0 0 H120 V120 Z" fill="#d83a4a" opacity=".12"/>${D.grid('#fff', .04)}
      <path d="M14 104 L104 18" stroke="#1a1430" stroke-width="18" stroke-linecap="round"/><path d="M14 104 L104 18" stroke="#3a2e50" stroke-width="12" stroke-linecap="round"/>
      ${nexus(20, 104, .66, '#6bc8ff', '#2a6ad8')}${nexus(100, 36, .66, '#ff7a7a', '#b8202e')}
      <rect x="4" y="74" width="32" height="5" rx="2.5" fill="#0a0e1a" stroke="#000" stroke-width="1"/><rect x="5" y="75" width="5" height="3" rx="1.5" fill="#6bc8ff"/><rect x="84" y="6" width="32" height="5" rx="2.5" fill="#0a0e1a" stroke="#000" stroke-width="1"/><rect x="85" y="7" width="4" height="3" rx="1.5" fill="#ff5a5a"/>
      ${minion(36, 86, '#d83a4a', .7)}${minion(30, 94, '#d83a4a', .62)}
      ${[0, 1, 2].map(i => `<path d="M${30 - i * 6} ${56 + i * 8} H${42 - i * 4}" stroke="#ffe46b" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`).join('')}${P({ x: 42, y: 34, s: .4, eye: 'angry', flip: true }, ACC.jersey('#2a5ad8', '#ffd36b'))}
      ${txt('42:17', 28, 22, 11, '#e8eef8', '#0a1020', 2.4)}${sparks([[106, 64, .5], [70, 100, .5]], '', '#ffe46b')}`,
    'reverse-sweep': () => `${bg('#1a0a06', '#4a1a0a', '#ffb43a')}${D.hex('#ffd08a', .04)}${rays(80, 70, '#ffd08a', 16, .1)}
      ${txt('0-2', 30, 30, 15, '#8a7a7a', '#1a0a06', 2.4)}<path d="M12 25 L48 22" stroke="#ff3a3a" stroke-width="3" stroke-linecap="round"/>
      <path d="M30 38 C26 70 50 84 64 80" stroke="#000" stroke-width="7" fill="none" opacity=".3"/><path d="M30 38 C26 70 50 84 64 80" stroke="#ffd36b" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M58 72 L68 79 L58 87 Z" fill="#ffd36b"/>
      ${glow(84, 66, 28, '#ffd36b', .5)}${txt('3-2', 86, 76, 30, '#ffe46b', '#3a1404', 3.4)}
      <g transform="translate(18 92) rotate(-58)"><rect x="-2" y="-38" width="4.4" height="40" rx="2" fill="#8a5a2a" stroke="#3a1a08" stroke-width="1.2"/><path d="M-9 2 H11 L15 24 H-13 Z" fill="#e2b23c" stroke="#6a4508" stroke-width="1.4"/>${[-8, -3, 2, 7].map(x => `<path d="M${x} 6 L${x * 1.3} 22" stroke="#8a5a08" stroke-width="1"/>`).join('')}<rect x="-10" y="0" width="22" height="5" rx="1.5" fill="#c8202e" stroke="#3a0408" stroke-width="1"/></g>
      ${[[44, 104], [56, 110], [36, 112]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${4 - i}" fill="#c8a07a" opacity=".45"/>`).join('')}${sparks([[106, 26, .8], [70, 104, .5], [110, 104, .6]], '', '#fff2b0')}`,
    'caster-hype': () => `${bg('#08142e', '#1a3a6a', '#6bc8ff')}${D.grid('#9ae4ff', .05)}
      ${P({ x: 2, y: 28, s: .6, eye: 'wide' }, ACC.suit(), ACC.headset('#d8dee8', '#ff5a5a'), ACC.mouth())}
      ${[0, 1, 2].map(i => `<path d="M${4 - i * 1} ${54 + i * 8} q-4 -2 -6 -6" stroke="#9ae4ff" stroke-width="1.6" fill="none" opacity="${.7 - i * .2}"/>`).join('')}
      <path d="M0 96 H120 V120 H0 Z" fill="#101a34"/><path d="M0 96 H120" stroke="#c8a96e" stroke-width="2"/><path d="M0 101 H120" stroke="#6bc8ff" stroke-width="1" opacity=".5"/>
      <path d="${[...Array(16)].map((_, i) => { const a = i / 16 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 20 : 30; return `${i ? 'L' : 'M'}${(88 + Math.cos(a) * r * 1.05).toFixed(1)} ${(40 + Math.sin(a) * r * .9).toFixed(1)}`; }).join(' ')} Z" fill="#ffe46b" stroke="#3a2a04" stroke-width="2" stroke-linejoin="round"/>
      ${txt('WHAT A', 88, 38, 8, '#c8202e', 'none', 0)}${txt('PLAY!!', 88, 49, 10, '#c8202e', '#fff6c8', 1)}${sparks([[60, 14, .6], [114, 82, .5]], '', '#c8f2ff')}`,
    'anthem': () => `${bg('#0a0624', '#2a0e4a', '#b98cff')}${rays(60, 10, '#d8c8ff', 18, .08, 130)}${spot(60, 54, 30, '#fff2d8', .32)}${D.motes('#e8d8ff', 10)}
      <path d="M0 98 Q60 90 120 98 V120 H0 Z" fill="#160a30"/><path d="M0 98 Q60 90 120 98" stroke="#b98cff" stroke-width="1.4" opacity=".7"/>
      ${[[14, 104, 22], [52, 110, 30], [96, 104, 26]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .25}" fill="#fff" opacity=".12"/>`).join('')}
      ${D.shadow(56, 100, 26)}${P({ x: 30, y: 30, s: .58, eye: 'closed', mane: '#5a2a8a' }, ACC.jersey('#3a1a6a', '#d8c8ff'))}${mic(30, 72, -38, .8)}
      ${note(16, 40, 1, '#ffd36b')}${note(102, 28, 1.2, '#ffe9b0')}${note(98, 72, .9, '#d8c8ff')}${note(22, 14, .8, '#d8c8ff')}${sparks([[60, 10, .7], [10, 76, .5]], '', '#fff6e0')}`,

    // ===== Uncommon =====
    'opening-ceremony': () => `${bg('#040818', '#141a40')}${D.motes('#fff', 10)}${burst(30, 32, 20, '#ffd36b')}${burst(88, 24, 23, '#ff6ab4')}${burst(66, 54, 12, '#6bc8ff')}
      <path d="M0 120 V96 L16 90 H104 L120 96 V120 Z" fill="#0a0e24"/><path d="M16 90 H104" stroke="#c8a96e" stroke-width="1.4"/>${[...Array(10)].map((_, i) => `<circle cx="${18 + i * 9.4}" cy="94" r="1.1" fill="${['#6bc8ff', '#ffd36b', '#ff6ab4'][i % 3]}"/>`).join('')}
      ${flame(12, 80, .38)}${flame(108, 80, .38)}<rect x="6" y="88" width="12" height="8" fill="#2a3040" stroke="#0a0e16" stroke-width="1"/><rect x="102" y="88" width="12" height="8" fill="#2a3040" stroke="#0a0e16" stroke-width="1"/>${crowd(112, '#02030c')}`,
    'draft-phase': () => `${bg('#0a1020', '#161e38')}${D.grid('#9ab8ff', .05)}
      ${[0, 1, 2, 3, 4].map(i => portrait(5, 12 + i * 19, 16, i === 2, '#3a6ad8')).join('')}${[0, 1, 2, 3, 4].map(i => portrait(99, 12 + i * 19, 16, false, '#b83a4a')).join('')}
      <path d="M3 8 V110" stroke="#3a8ad8" stroke-width="2"/><path d="M117 8 V110" stroke="#d83a4a" stroke-width="2"/>
      <circle cx="60" cy="20" r="11" fill="#0a1020" stroke="#ffd36b" stroke-width="2"/><path d="M60 9 A11 11 0 0 1 70 25" stroke="#ff6a6a" stroke-width="2.4" fill="none"/>${txt('27', 60, 24, 10, '#fff', 'none', 0)}
      <rect x="37" y="36" width="46" height="50" rx="4" fill="#1a2440" stroke="#ffd36b" stroke-width="2"/>${glow(60, 60, 26, '#ffd36b', .25)}${P({ x: 40, y: 40, s: .4, eye: 'normal' })}
      ${[0, 1, 2].map(i => `<rect x="${40 + i * 14}" y="92" width="11" height="11" rx="2" fill="#2a1418" stroke="#6a2a30" stroke-width="1"/><path d="M${42 + i * 14} 94 l7 7 M${49 + i * 14} 94 l-7 7" stroke="#ff4a5a" stroke-width="1.8" stroke-linecap="round"/>`).join('')}${txt('BANS', 60, 113, 7, '#ff9aa0', '#0a1020', 1.6)}`,
    'first-pick': () => `${bg('#06142e', '#0e2a5a', '#6bc8ff')}${rays(60, 50, '#9ae4ff', 16, .08)}
      <rect x="34" y="16" width="56" height="72" rx="6" fill="#000" opacity=".35"/><rect x="31" y="12" width="56" height="72" rx="6" fill="#141e3a" stroke="#ffd36b" stroke-width="2.6"/>${glow(59, 44, 28, '#6bc8ff', .35)}
      ${P({ x: 34, y: 18, s: .48, eye: 'happy' })}<rect x="34" y="70" width="50" height="11" rx="2" fill="#0a1020" opacity=".8"/>${txt('PICK 1', 59, 79, 8, '#ffd36b', 'none', 0)}
      <circle cx="31" cy="13" r="11" fill="#e2b23c" stroke="#5a3a06" stroke-width="2"/>${txt('1ST', 31, 16.5, 7.5, '#3a2404', 'none', 0)}
      <rect x="30" y="94" width="58" height="16" rx="8" fill="#e2b23c" stroke="#fff2b0" stroke-width="1.6"/>${txt('LOCK IN', 59, 105.5, 9, '#2a1a04', 'none', 0)}${sparks([[100, 24, .7], [16, 60, .5], [104, 80, .5]], '', '#c8f2ff')}`,
    'counter-pick': () => `${bg('#14081e', '#2a1030')}${D.hatch('#ff9ac8', .04)}
      ${card(32, 56, 38, 54, -10, '#d83a4a', sword(0, 14, 28, 0, '#e4ebf5', '#c8a96e'))}
      ${glow(84, 54, 32, '#6bc8ff', .45)}${card(84, 54, 42, 60, 8, '#6bc8ff', `<path d="M0 -20 L16 -14 C16 4 10 14 0 20 C-10 14 -16 4 -16 -14 Z" fill="#3a7ab8" stroke="#c8f2ff" stroke-width="2.4"/><path d="M0 -12 V12 M-9 -2 H9" stroke="#ffd36b" stroke-width="3" stroke-linecap="round"/>`)}
      <path d="M52 34 L60 46 L54 48 L64 62" stroke="#fff" stroke-width="2.6" fill="none" stroke-linejoin="round"/><path d="M52 34 L60 46 L54 48 L64 62" stroke="#9ae4ff" stroke-width="1" fill="none"/>
      ${txt('COUNTER!', 60, 108, 13, '#c8f2ff', '#14081e', 3)}${sparks([[60, 20, .6], [104, 94, .5]], '', '#c8f2ff')}`,
    'tech-pause': () => `${bg('#141a24', '#283448')}${D.grid('#9ab0c8', .05)}<path d="M0 100 H120 V120 H0 Z" fill="#1a2030"/><path d="M0 100 H120" stroke="#3a4a60" stroke-width="1.6"/>
      ${monitor(6, 18, 58, 42, `<rect x="21" y="9" width="5" height="18" rx="1" fill="#fff"/><rect x="31" y="9" width="5" height="18" rx="1" fill="#fff"/>${txt('PAUSED', 29, 36, 7, '#ffd36b', 'none', 0)}`, '#1a4ab8')}
      <path d="M35 74 C34 86 40 94 52 98" stroke="#1a1e2a" stroke-width="3" fill="none"/><path d="M58 102 C70 106 74 100 70 94" stroke="#1a1e2a" stroke-width="3" fill="none"/><rect x="48" y="95" width="8" height="5" rx="1" fill="#4a5060"/><rect x="66" y="90" width="7" height="5" rx="1" fill="#4a5060"/>
      ${spark(61, 97, .45, 1, '', '#ffe46b')}${P({ x: 64, y: 44, s: .48, eye: 'tired' }, ACC.headset('#2a3048', '#ff5a5a'))}
      ${txt('?', 106, 34, 16, '#ffd36b', '#141a24', 2.4)}`,
    'shotcaller': () => `${bg('#0a1a14', '#143a2a', '#5fd08a')}${D.hex('#9affb8', .04)}
      <g transform="translate(58 54)"><rect width="56" height="56" rx="5" fill="#1e4a2a" stroke="#c8a96e" stroke-width="2"/><path d="M6 50 L50 6" stroke="#8a7a5a" stroke-width="3" opacity=".7"/><path d="M6 50 V6 H50 M6 50 H50 V6" stroke="#8a7a5a" stroke-width="2.4" fill="none" opacity=".6"/><path d="M4 52 C20 36 36 20 52 4" stroke="#2a6ab8" stroke-width="6" opacity=".55" fill="none"/>
        <circle cx="6" cy="50" r="5" fill="#3a7ad8" stroke="#fff" stroke-width="1.2"/><circle cx="50" cy="6" r="5" fill="#d83a4a" stroke="#fff" stroke-width="1.2"/><path d="M14 40 L34 22" stroke="#ffe46b" stroke-width="2.6" stroke-dasharray="3 2"/><path d="M38 18 L30 20 L36 26 Z" fill="#ffe46b"/>${[[36, 18], [22, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="#ffe46b" stroke-width="1.2"/>`).join('')}</g>
      ${P({ x: 0, y: 30, s: .56, eye: 'angry' }, ACC.headset('#1a2a20', '#5fd08a'), ACC.mouth())}
      <path d="M58 8 H112 Q118 8 118 14 V36 Q118 42 112 42 H74 L64 50 L66 42 H58 Q52 42 52 36 V14 Q52 8 58 8 Z" fill="#f6efe2" stroke="#0a1a14" stroke-width="2"/>${txt('GO NOW!', 85, 30, 11, '#c8202e', 'none', 0)}`,
    'head-coach': () => `${bg('#101a2a', '#22324a')}${D.grid('#c8d8ff', .04)}
      <g transform="translate(66 22) rotate(6)"><rect x="0" y="0" width="46" height="78" rx="4" fill="#8a5a2a" stroke="#3a1a08" stroke-width="2"/><rect x="4" y="8" width="38" height="66" rx="1.5" fill="#f6efe2"/><rect x="14" y="-4" width="18" height="9" rx="2" fill="#c8d0dc" stroke="#3a4250" stroke-width="1.4"/>
        ${[[12, 22, 'X'], [30, 30, 'X'], [14, 52, 'O'], [32, 58, 'O']].map(([x, y, t]) => txt(t, x, y, 9, t === 'X' ? '#c8202e' : '#2a5ad8', 'none', 0)).join('')}<path d="M16 48 C20 38 26 36 28 32" stroke="#2a5ad8" stroke-width="1.6" fill="none" stroke-dasharray="2 2"/><path d="M26 30 L30 30 L29 35" stroke="#2a5ad8" stroke-width="1.6" fill="none"/><path d="M34 56 C38 46 36 40 32 36" stroke="#2a5ad8" stroke-width="1.6" fill="none"/></g>
      ${D.shadow(30, 106, 26)}${P({ x: -2, y: 30, s: .62, eye: 'normal' }, `<path d="M38 112 C40 94 52 86 68 86 C88 84 102 94 106 112 Z" fill="#2a3a5a" stroke="#0a0e1a" stroke-width="2"/><path d="M56 87 L64 96 L70 86 L76 96 L84 87" fill="#f6efe2" stroke="#0a0e1a" stroke-width="1.2"/>`, ACC.whistle(), ACC.cap('#c8202e', '#fff'))}`,
    'analyst-desk': () => `${bg('#0a1222', '#1a2440')}${D.grid('#6bc8ff', .05)}
      ${monitor(4, 10, 36, 26, `${[0, 1, 2, 3].map(i => `<rect x="${6 + i * 7}" y="${20 - i * 3}" width="5" height="${4 + i * 3}" fill="${['#6bc8ff', '#5fd08a', '#ffd36b', '#ff6a8a'][i]}"/>`).join('')}`)}
      ${monitor(42, 6, 36, 28, `<path d="M5 22 L12 16 L18 19 L25 9 L31 12" stroke="#5fd08a" stroke-width="1.8" fill="none"/><path d="M5 18 L12 20 L18 14 L25 17 L31 8" stroke="#ff6a8a" stroke-width="1.4" fill="none" opacity=".8"/>`)}
      ${monitor(80, 10, 36, 26, `<circle cx="18" cy="13" r="8" fill="#6bc8ff"/><path d="M18 13 V5 A8 8 0 0 1 25 16 Z" fill="#ffd36b"/><path d="M18 13 L25 16 A8 8 0 0 1 14 20 Z" fill="#ff6a8a"/>`)}
      ${P({ x: 30, y: 50, s: .46, eye: 'normal' }, ACC.suit('#2a3a5a', '#2a5ad8'), ACC.glasses())}
      <path d="M0 96 H120 V120 H0 Z" fill="#2a1e14"/><path d="M0 96 H120" stroke="#6a4a2a" stroke-width="2.4"/><path d="M0 99 H120" stroke="#fff" stroke-width=".6" opacity=".15"/>
      <path d="M92 82 h14 v12 q0 6 -7 6 q-7 0 -7 -6 z" fill="#f6efe2" stroke="#3a2a1a" stroke-width="1.6"/><path d="M106 85 q6 0 4 6 q-1 3 -4 3" stroke="#3a2a1a" stroke-width="1.6" fill="none"/><path d="M96 78 q2 -4 0 -8 M101 78 q2 -4 0 -8" stroke="#c8b8a8" stroke-width="1.4" fill="none"/>
      <rect x="8" y="88" width="26" height="8" rx="1" fill="#f6efe2" transform="rotate(-6 21 92)"/><path d="M11 90 H30 M11 93 H24" stroke="#8a8270" stroke-width="1" transform="rotate(-6 21 92)"/>`,
    'swiss-stage': () => {
      const N = [[14, 60, '0-0'], [40, 42, '1-0'], [40, 78, '0-1'], [66, 26, '2-0'], [66, 60, '1-1'], [66, 94, '0-2'], [96, 14, '3-0'], [96, 44, '2-1'], [96, 76, '1-2'], [96, 106, '0-3']];
      const L = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [3, 7], [4, 7], [4, 8], [5, 8], [5, 9]];
      const gold = [0, 1, 3, 6];
      return `${bg('#0e1028', '#1e2050')}${D.grid('#9ab8ff', .05)}
      ${L.map(([a, b]) => `<path d="M${N[a][0] + 11} ${N[a][1]} C${N[a][0] + 18} ${N[a][1]} ${N[b][0] - 18} ${N[b][1]} ${N[b][0] - 11} ${N[b][1]}" stroke="${gold.includes(a) && gold.includes(b) ? '#ffd36b' : '#3a4a7a'}" stroke-width="${gold.includes(a) && gold.includes(b) ? 2.4 : 1.4}" fill="none"/>`).join('')}
      ${N.map(([x, y, t], i) => `${i === 6 ? glow(x, y, 16, '#ffd36b', .5) : ''}<rect x="${x - 11}" y="${y - 6}" width="22" height="12" rx="6" fill="${i === 6 ? '#e2b23c' : i === 9 ? '#5a1a24' : '#1a2448'}" stroke="${gold.includes(i) ? '#ffd36b' : i === 9 ? '#d83a4a' : '#4a5a8a'}" stroke-width="1.4"/>${txt(t, x, y + 2.6, 7, i === 6 ? '#2a1a04' : '#e8eef8', 'none', 0)}`).join('')}
      ${spark(110, 8, .4, 1, '', '#fff2b0')}${txt('SWISS', 26, 18, 9, '#9ab8ff', '#0e1028', 2)}`;
    },
    'quarterfinals': () => {
      const side = (x0, dir) => [0, 1, 2, 3].map(i => { const y = [14, 34, 66, 86][i]; return `<rect x="${dir > 0 ? x0 : x0 - 28}" y="${y}" width="28" height="12" rx="3" fill="#1a2048" stroke="${i === 0 && dir > 0 ? '#ffd36b' : '#4a5a8a'}" stroke-width="1.4"/><rect x="${dir > 0 ? x0 + 2 : x0 - 26}" y="${y + 2}" width="8" height="8" rx="1.5" fill="${['#3a8ad8', '#5fd08a', '#ff8a3a', '#b98cff', '#ff5a8a', '#6bd8ff', '#ffd36b', '#d83a4a'][i + (dir > 0 ? 0 : 4)]}"/><path d="M${dir > 0 ? x0 + 13 : x0 - 13} ${y + 6} h${dir > 0 ? 12 : -12}" stroke="#8a9ac8" stroke-width="2" stroke-linecap="round" opacity=".6"/>`; }).join('') +
        [[20, 40], [72, 92]].map(([a, b]) => `<path d="M${x0 + dir * 28} ${a} H${x0 + dir * 34} V${b} H${x0 + dir * 28} M${x0 + dir * 34} ${(a + b) / 2} H${x0 + dir * 40}" stroke="#6a7aaa" stroke-width="1.6" fill="none"/>`).join('') +
        `<path d="M${x0 + dir * 40} 30 H${x0 + dir * 44} V82 H${x0 + dir * 40} M${x0 + dir * 44} 56 H${x0 + dir * 50}" stroke="#6a7aaa" stroke-width="1.6" fill="none"/>`;
      return `${bg('#0a0e24', '#1a1c44')}${D.grid('#9ab8ff', .04)}${side(4, 1)}${side(116, -1)}${glow(60, 56, 16, '#ffd36b', .5)}${cup(60, 66, .24)}
      ${txt('QF', 60, 112, 16, '#ffd36b', '#0a0e24', 3)}`;
    },
    'semifinals': () => `${bg('#120a24', '#2a1440', '#ffd36b')}${D.hex('#ffe9b0', .04)}
      ${[14, 40, 66, 92].map((x, i) => `<rect x="${x}" y="94" width="20" height="14" rx="3" fill="#1a1838" stroke="#4a4a7a" stroke-width="1.2"/><rect x="${x + 3}" y="97" width="8" height="8" rx="1.5" fill="${['#3a8ad8', '#5fd08a', '#ff8a3a', '#d83a4a'][i]}" opacity="${i % 2 ? .4 : 1}"/>`).join('')}
      ${[[24, 50, 37], [76, 102, 89]].map(([a, b, m]) => `<path d="M${a} 94 V88 H${b} V94 M${m} 88 V82" stroke="#8a7aaa" stroke-width="1.4" fill="none"/>`).join('')}
      ${[[22, '#3a8ad8'], [74, '#ff8a3a']].map(([x, c]) => `${glow(x + 15, 70, 20, '#ffd36b', .3)}<rect x="${x}" y="58" width="30" height="24" rx="4" fill="#2a1e40" stroke="#ffd36b" stroke-width="2"/><rect x="${x + 4}" y="62" width="12" height="12" rx="2" fill="${c}"/><path d="M${x + 19} 66 h7 M${x + 19} 71 h5" stroke="#e8dcc6" stroke-width="1.6" stroke-linecap="round"/>`).join('')}
      ${txt('VS', 60, 74, 10, '#fff2a8', '#120a24', 2.4)}<path d="M37 58 V50 H89 V58 M60 50 V44" stroke="#ffd36b" stroke-width="1.6" fill="none"/>
      <rect x="42" y="8" width="36" height="36" rx="6" fill="#1a1030" stroke="#ffd36b" stroke-width="1.6" stroke-dasharray="4 3"/>${glow(60, 26, 22, '#ffd36b', .45)}${cup(60, 40, .4)}${txt('SEMIS', 18, 16, 8, '#ffd36b', '#120a24', 2)}`,
    'upset': () => `${bg('#1a0606', '#3a0e0e', '#ff6a3a')}${D.hatch('#ff9a6a', .05)}
      <g transform="translate(-6 0) rotate(16 82 66)"><path d="M82 24 L110 34 C110 64 100 84 82 96 C64 84 54 64 54 34 Z" fill="#c8a96e" stroke="#4a3208" stroke-width="3"/><path d="M82 30 L104 38 C104 62 96 78 82 88 C68 78 60 62 60 38 Z" fill="#e2b23c"/>${txt('#1', 82, 68, 20, '#4a3208', 'none', 0)}
        <path d="M82 24 L78 40 L88 50 L76 62 L84 74 L80 96" stroke="#1a0606" stroke-width="2.4" fill="none" stroke-linejoin="round"/><path d="M88 50 L100 46 M76 62 L64 60" stroke="#1a0606" stroke-width="1.6"/></g>
      ${[[64, 104, 20], [100, 108, -30], [112, 96, 60]].map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-5 -3 L4 -4 L5 3 L-3 4 Z" fill="#c8a96e" stroke="#4a3208" stroke-width="1"/>`).join('')}
      ${D.shadow(28, 108, 20)}${P({ x: 2, y: 58, s: .44, eye: 'star' }, ACC.jersey('#5fd08a', '#fff'))}${txt('UPSET!', 38, 30, 17, '#ffd36b', '#3a0a04', 3.4)}${sparks([[60, 50, .7], [10, 50, .5]], '', '#ffe46b')}`,
    'fan-sign': () => `${bg('#1a0a24', '#3a1440')}${[[16, 20, 10, '#ff6ab4'], [100, 16, 14, '#6bc8ff'], [70, 30, 8, '#ffd36b'], [30, 50, 6, '#b98cff']].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".18"/>`).join('')}
      <path d="M36 66 L40 108 M84 66 L80 108" stroke="#8a5a2a" stroke-width="3.4"/>
      <g transform="rotate(-5 60 46)"><rect x="18" y="20" width="84" height="50" rx="3" fill="#000" opacity=".3" transform="translate(2 3)"/><rect x="18" y="20" width="84" height="50" rx="3" fill="#fff6fb" stroke="#ff6ab4" stroke-width="2.4"/>
        ${txt('GO', 44, 46, 18, '#ff3a8a', 'none', 0)}${txt('PONY!', 60, 64, 15, '#2a5ad8', 'none', 0)}<path d="M78 34 C74 28 66 32 78 42 C90 32 82 28 78 34 Z" fill="#ff5a8a"/><path d="M90 48 C88 45 84 47 90 52 C96 47 92 45 90 48 Z" fill="#ffd36b"/>${spark(26, 28, .45, 1, '', '#ffd36b')}</g>
      ${crowd(108, '#0a0414', ['#ff6ab4', '#ffd36b'])}`,
    'cosplayer': () => `${bg('#0a1a2a', '#1a3a4a', '#9ae4ff')}${D.hex('#c8f2ff', .04)}
      ${[[16, 22], [102, 30], [92, 96]].map(([x, y], i) => `${glow(x, y, 14, '#fff', .5)}${spark(x, y, .9 - i * .15, 1, '', '#fff')}`).join('')}
      <g transform="translate(84 78) rotate(-38)"><path d="M-5 0 L-7 -70 L0 -82 L7 -70 L5 0 Z" fill="#6bd8ff" stroke="#1a4a6a" stroke-width="2"/>${[-60, -46, -32, -18].map(y => `<path d="M-6 ${y} L-11 ${y + 5} L-5 ${y + 6} M6 ${y} L11 ${y + 5} L5 ${y + 6}" fill="#ff7ad9" stroke="#1a4a6a" stroke-width="1"/>`).join('')}<path d="M0 -76 V-4" stroke="#fff" stroke-width="1.6" opacity=".6"/><rect x="-14" y="0" width="28" height="6" rx="2" fill="#ffd36b" stroke="#6a4508" stroke-width="1.4"/><rect x="-3" y="6" width="6" height="14" rx="2" fill="#7a3aa8"/></g>
      ${D.shadow(46, 106, 28)}${P({ x: 8, y: 26, s: .62, eye: 'happy', mane: '#b05aff' }, `<path d="M38 112 C40 94 52 86 68 86 C88 84 102 94 106 112 Z" fill="#7a3aa8" stroke="#1a0a2a" stroke-width="2"/><path d="M58 90 C68 70 100 70 112 90 L106 104 C96 94 78 94 66 100 Z" fill="#c8d0dc" stroke="#2a3040" stroke-width="2"/><path d="M64 88 C74 76 96 76 106 88" stroke="#ffd36b" stroke-width="2.4" fill="none"/><path d="M84 74 L88 60 L92 75 Z" fill="#ffd36b" stroke="#6a4508" stroke-width="1"/><path d="M36 22 C44 14 66 12 80 20 L78 26 C66 20 48 20 38 26 Z" fill="#ffd36b" stroke="#6a4508" stroke-width="1.2"/><path d="M57 11 l4 6 -4 6 -4 -6 Z" fill="#ff7ad9" stroke="#fff" stroke-width="1"/>`)}`,
    'confetti': () => `${bg('#0a0a2a', '#2a1450', '#ff9ad8')}${rays(60, 60, '#ffe9b0', 14, .07)}
      ${[0, 1, 2].map(i => `<path d="M${18 + i * 38} -4 C${30 + i * 38} 20 ${6 + i * 38} 40 ${22 + i * 38} 64" stroke="${['#ffd36b', '#ff6ab4', '#6bc8ff'][i]}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}
      ${confetti(46, 5)}
      ${[[10, 112, -30], [110, 112, 30]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-7" y="-26" width="14" height="28" rx="2" fill="#c8202e" stroke="#3a0408" stroke-width="1.6"/><rect x="-8" y="-28" width="16" height="5" rx="1.5" fill="#e2b23c" stroke="#5a3a06" stroke-width="1"/><path d="M-4 -20 V-2" stroke="#fff" stroke-width="1.6" opacity=".35"/></g>`).join('')}
      ${glow(60, 60, 30, '#fff2d8', .3)}${sparks([[60, 50, 1], [30, 76, .5], [90, 40, .6]], '', '#fff6c8')}`,

    // ===== Common =====
    'stage-lights': () => `${bg('#06081a', '#141a3a')}${[[18, 30, '#6bc8ff'], [46, 80, '#ff6ab4'], [74, 40, '#ffd36b'], [102, 90, '#7bffb4']].map(([x, tx, c]) => spot(x, tx, 14, c, .32)).join('')}
      <rect x="0" y="6" width="120" height="8" fill="#2a3040" stroke="#0a0e16" stroke-width="1"/>${[...Array(12)].map((_, i) => `<path d="M${i * 10} 6 L${i * 10 + 10} 14 M${i * 10 + 10} 6 L${i * 10} 14" stroke="#4a5466" stroke-width="1"/>`).join('')}
      ${[[18, '#6bc8ff', 18], [46, '#ff6ab4', 18], [74, '#ffd36b', -18], [102, '#7bffb4', -18]].map(([x, c, r]) => `<g transform="translate(${x} 20) rotate(${r})"><rect x="-6" y="-6" width="12" height="12" rx="3" fill="#1a1e2a" stroke="#06080e" stroke-width="1.4"/><circle cy="4" r="4" fill="${c}" stroke="#fff" stroke-width="1"/></g>`).join('')}
      ${floor(100, '#0a0e24')}${[[30, 104], [80, 108], [104, 102]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="3" fill="${['#6bc8ff', '#ff6ab4', '#7bffb4'][i]}" opacity=".3"/>`).join('')}`,
    'headset': () => `${bg('#0e1428', '#1e2a4a', '#6bc8ff')}${D.grid('#9ab8ff', .04)}${D.shadow(60, 104, 40)}
      <path d="M28 64 C24 18 96 18 92 64" stroke="#06080e" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M28 64 C24 18 96 18 92 64" stroke="#2a3048" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M34 40 C42 26 78 26 86 40" stroke="#6bc8ff" stroke-width="2" fill="none" opacity=".6"/>
      ${[[28, 1], [92, -1]].map(([x, d]) => `<rect x="${x - 13}" y="56" width="26" height="34" rx="12" fill="#1c2236" stroke="#06080e" stroke-width="2"/><rect x="${x - 9 + d * 4}" y="60" width="18" height="26" rx="9" fill="#3a4466"/><circle cx="${x}" cy="73" r="4" fill="#6bc8ff"/>${glow(x, 73, 10, '#6bc8ff', .5)}`).join('')}
      <path d="M22 84 C18 100 34 106 50 102" stroke="#06080e" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M22 84 C18 100 34 106 50 102" stroke="#2a3048" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="53" cy="101" rx="5" ry="4" fill="#06080e"/>
      <path d="M92 90 C96 104 110 104 116 116" stroke="#2a3048" stroke-width="2" fill="none"/>${txt('7.1', 92, 18, 9, '#9ae4ff', '#0e1428', 2)}`,
    'gaming-chair': () => `${bg('#141024', '#2a1e44')}${D.hatch('#c8b8ff', .04)}${D.shadow(60, 112, 30)}
      <path d="M38 12 C38 4 82 4 82 12 L86 66 H34 Z" fill="#1a1e30" stroke="#06080e" stroke-width="2"/><path d="M46 14 C46 10 74 10 74 14 L76 62 H44 Z" fill="#c8202e"/><path d="M50 18 V58 M70 18 V58" stroke="#ffd36b" stroke-width="1.6" opacity=".8"/>
      <path d="M30 18 L38 12 L36 60 L30 56 Z M90 18 L82 12 L84 60 L90 56 Z" fill="#2a2e44" stroke="#06080e" stroke-width="1.4"/><rect x="48" y="16" width="24" height="10" rx="5" fill="#2a2e44" stroke="#06080e" stroke-width="1.2"/>
      <rect x="48" y="38" width="24" height="12" rx="6" fill="#ffd36b" opacity=".9"/><path d="M36 66 H84 L88 76 H32 Z" fill="#1a1e30" stroke="#06080e" stroke-width="2"/>
      ${[[26, 58], [94, 58]].map(([x, y]) => `<rect x="${x - 4}" y="${y}" width="8" height="18" rx="2" fill="#2a2e44" stroke="#06080e" stroke-width="1.2"/><rect x="${x - 7}" y="${y - 3}" width="14" height="5" rx="2" fill="#3a3e58" stroke="#06080e" stroke-width="1.2"/>`).join('')}
      <rect x="57" y="76" width="6" height="16" fill="#8a96aa" stroke="#2a3040" stroke-width="1.2"/><path d="M60 92 L34 104 M60 92 L86 104 M60 92 L60 108 M60 92 L44 110 M60 92 L76 110" stroke="#2a2e44" stroke-width="4" stroke-linecap="round"/>${[[34, 106], [86, 106], [60, 110], [44, 112], [76, 112]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#06080e"/>`).join('')}`,
    'team-jersey': () => `${bg('#0a1430', '#1a2a5a')}${D.hex('#9ab8ff', .04)}<path d="M60 6 V14" stroke="#8a96aa" stroke-width="2"/><path d="M60 6 a4 4 0 1 1 4 -4" stroke="#8a96aa" stroke-width="2" fill="none"/><path d="M60 14 L30 26 M60 14 L90 26" stroke="#8a96aa" stroke-width="2.4"/>
      <path d="M44 22 L28 28 L12 50 L26 60 L34 50 L34 108 H86 V50 L94 60 L108 50 L92 28 L76 22 C72 30 48 30 44 22 Z" fill="#2a5ad8" stroke="#06101e" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M44 22 C48 30 72 30 76 22" stroke="#ffd36b" stroke-width="3" fill="none"/><path d="M14 48 L26 58 M106 48 L94 58" stroke="#ffd36b" stroke-width="3"/><path d="M34 100 H86" stroke="#ffd36b" stroke-width="2.4"/><path d="M40 34 V96" stroke="#fff" stroke-width="3" opacity=".12"/>
      ${txt('PONY', 60, 52, 10, '#fff', 'none', 0)}${txt('3', 60, 88, 32, '#ffd36b', '#06101e', 2.6)}`,
    'team-banner': () => `${bg('#120a20', '#2a1a3a')}${D.beams('#ffe9b0', .05)}<rect x="18" y="8" width="84" height="6" rx="3" fill="#8a5a2a" stroke="#3a1a08" stroke-width="1.4"/><circle cx="18" cy="11" r="5" fill="#ffd36b" stroke="#6a4508" stroke-width="1.4"/><circle cx="102" cy="11" r="5" fill="#ffd36b" stroke="#6a4508" stroke-width="1.4"/>
      <path d="M28 14 H92 V102 L60 90 L28 102 Z" fill="#1a3a8a" stroke="#06101e" stroke-width="2"/><path d="M28 14 H92 V22 H28 Z" fill="#ffd36b" opacity=".85"/><path d="M33 26 V92" stroke="#fff" stroke-width="2.4" opacity=".12"/>
      <circle cx="60" cy="52" r="22" fill="#0a1a4a" stroke="#ffd36b" stroke-width="2.4"/>${P({ x: 45, y: 36, s: .3, eye: 'normal' })}${[0, 1, 2].map(i => `<path d="M${50 + i * 10} 78 l2 4 4 .4 -3 2.6 1 4 -4 -2 -4 2 1 -4 -3 -2.6 4 -.4 Z" fill="#ffd36b"/>`).join('')}`,
    'scoreboard': () => `${bg('#0a0e1a', '#161e30')}${D.grid('#9ab8ff', .04)}
      <rect x="4" y="18" width="112" height="44" rx="5" fill="#0a0e1a" stroke="#c8a96e" stroke-width="1.6"/><path d="M60 22 V58" stroke="#2a3450" stroke-width="1.4"/>
      ${txt('14', 34, 46, 22, '#6bc8ff', 'none', 0)}${txt('9', 86, 46, 22, '#ff6a6a', 'none', 0)}<path d="M54 34 L66 46 M66 34 L54 46" stroke="#c8a96e" stroke-width="2.4" stroke-linecap="round"/>
      ${txt('52.1k', 34, 58, 7, '#ffd36b', 'none', 0)}${txt('47.8k', 86, 58, 7, '#ffd36b', 'none', 0)}
      <rect x="42" y="8" width="36" height="13" rx="3" fill="#1a2440" stroke="#c8a96e" stroke-width="1.2"/>${txt('31:08', 60, 18, 8, '#e8eef8', 'none', 0)}
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${10 + i * 9}" y="72" width="6" height="8" rx="1" fill="${i < 4 ? '#3a8ad8' : '#2a3450'}"/><rect x="${66 + i * 9}" y="72" width="6" height="8" rx="1" fill="${i < 2 ? '#d83a4a' : '#2a3450'}"/>`).join('')}
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${8 + i * 10}" y="88" width="9" height="9" rx="1.5" fill="#1e2a48" stroke="#3a6ad8" stroke-width="1"/><rect x="${63 + i * 10}" y="88" width="9" height="9" rx="1.5" fill="#3a1e28" stroke="#b83a4a" stroke-width="1"/>`).join('')}${txt('LIVE', 60, 112, 8, '#ff5a5a', '#0a0e1a', 1.6)}<circle cx="46" cy="109" r="2.4" fill="#ff3a3a"/>`,
    'game-five': () => `${bg('#0a0e1e', '#1a1030')}<path d="M0 0 H60 V120 H0 Z" fill="#2a5ad8" opacity=".14"/><path d="M60 0 H120 V120 H60 Z" fill="#d83a4a" opacity=".14"/>${D.hatch('#fff', .03)}
      ${txt('GAME', 60, 22, 12, '#e8eef8', '#0a0e1e', 2.4)}${glow(60, 50, 26, '#ffd36b', .4)}${txt('5', 60, 70, 46, '#ffd36b', '#2a1a04', 3.4)}
      ${txt('2', 24, 64, 20, '#6bc8ff', '#0a0e1e', 2.4)}${txt('2', 96, 64, 20, '#ff7a7a', '#0a0e1e', 2.4)}
      ${P({ x: 34, y: 76, s: .36, eye: 'wide' }, ACC.sweat())}`,
    'blue-side': () => `${bg('#04102a', '#0e2a5a', '#3a8ad8')}${D.hex('#9ae4ff', .05)}
      ${[[10, '#2a5ad8'], [100, '#2a5ad8']].map(([x, c]) => `<path d="M${x} 0 h12 v44 l-6 -6 -6 6 Z" fill="${c}" stroke="#06101e" stroke-width="1.4"/><path d="M${x + 6} 14 l3 5 -3 5 -3 -5 Z" fill="#ffd36b"/>`).join('')}
      ${nexus(32, 104, .82, '#6bc8ff', '#2a6ad8')}${D.shadow(80, 106, 22)}${P({ x: 56, y: 44, s: .5, eye: 'happy', flip: true }, ACC.jersey('#2a5ad8', '#9ae4ff'))}${txt('BLUE', 60, 20, 12, '#9ae4ff', '#04102a', 2.4)}`,
    'red-side': () => `${bg('#2a0408', '#5a0e16', '#d83a4a')}${D.hex('#ffb0b0', .05)}
      ${[[10, '#b8202e'], [100, '#b8202e']].map(([x, c]) => `<path d="M${x} 0 h12 v44 l-6 -6 -6 6 Z" fill="${c}" stroke="#1e0206" stroke-width="1.4"/><path d="M${x + 6} 14 l3 5 -3 5 -3 -5 Z" fill="#ffd36b"/>`).join('')}
      ${nexus(88, 104, .82, '#ff7a7a', '#b8202e')}${D.shadow(40, 106, 22)}${P({ x: 14, y: 44, s: .5, eye: 'angry' }, ACC.jersey('#b8202e', '#ffb0b0'))}${txt('RED', 60, 20, 12, '#ffb0b0', '#2a0408', 2.4)}`,
    'gg-handshake': () => `${bg('#0e2418', '#1e4a34', '#5fd08a')}${rays(60, 66, '#c8ffd8', 14, .08)}
      ${hoof(54, 74, -14, '#2a5ad8')}${hoof(66, 74, 14, '#d83a4a', true)}${glow(60, 72, 16, '#fff', .45)}${spark(60, 64, .7)}
      ${txt('GG', 60, 44, 30, '#f6efe2', '#0e2418', 3.4)}${sparks([[22, 22, .6], [100, 26, .7], [104, 100, .5]], '', '#c8ffd8')}`,
    'press-room': () => `${bg('#1a1e2a', '#2a3044')}<rect width="120" height="80" fill="#202838"/>${[...Array(5)].map((_, r) => [...Array(6)].map((_, c) => `<path d="M${10 + c * 20 + (r % 2) * 10} ${8 + r * 16} l2.4 5 5.4 .4 -4 3.6 1.4 5.2 -4.8 -2.8 -4.8 2.8 1.4 -5.2 -4 -3.6 5.4 -.4 Z" fill="#c8a96e" opacity=".22"/>`).join('')).join('')}
      ${[[20, 26], [100, 20]].map(([x, y]) => `${glow(x, y, 12, '#fff', .55)}${spark(x, y, .7)}`).join('')}
      ${P({ x: 34, y: 24, s: .54, eye: 'normal' }, ACC.suit('#1a2238', '#2a5ad8'))}
      <path d="M0 84 H120 V120 H0 Z" fill="#0e1424"/><path d="M0 84 H120" stroke="#c8a96e" stroke-width="2"/>
      ${[[36, -18, '#c8202e'], [48, -6, '#2a5ad8'], [62, 6, '#5fd08a'], [74, 16, '#ffd36b']].map(([x, r, c]) => `<g transform="translate(${x} 84) rotate(${r})"><rect x="-1.2" y="-10" width="2.4" height="10" fill="#2a2e38"/><rect x="-4" y="-10" width="8" height="6" rx="1" fill="${c}"/><ellipse cy="-13" rx="3.4" ry="4.4" fill="#3a3e48" stroke="#06080e" stroke-width="1"/></g>`).join('')}
      <rect x="30" y="94" width="60" height="14" rx="2" fill="#f6efe2" stroke="#8a8270" stroke-width="1.2"/>${txt('PONY', 60, 104.5, 9, '#1a2238', 'none', 0)}`,
    'post-game-interview': () => `${bg('#102030', '#1e3a52')}${D.beams('#c8e8ff', .06)}
      ${D.shadow(38, 108, 26)}${P({ x: 4, y: 30, s: .62, eye: 'happy' }, ACC.jersey('#2a5ad8', '#ffd36b'))}
      <path d="M124 92 C110 90 98 84 90 76" stroke="#e8c48c" stroke-width="10" stroke-linecap="round" fill="none"/>${mic(82, 66, -60, 1.2, 'TTP')}
      <path d="M70 10 H112 Q118 10 118 16 V34 Q118 40 112 40 H86 L78 48 L80 40 H70 Q64 40 64 34 V16 Q64 10 70 10 Z" fill="#f6efe2" stroke="#102030" stroke-width="2"/>${txt('GG WP', 91, 30, 11, '#2a5ad8', 'none', 0)}`,
    'scrims': () => `${bg('#0a0a18', '#1a1a30')}${D.grid('#9ab8ff', .04)}${glow(40, 44, 40, '#3a6ad8', .35)}
      ${monitor(8, 14, 64, 44, `<rect x="4" y="4" width="56" height="36" fill="#1e4a2a"/><path d="M8 36 L56 6" stroke="#8a7a5a" stroke-width="2.4" opacity=".6"/>${minion(22, 28, '#4a7ad8', .5)}${minion(30, 24, '#4a7ad8', .5)}${minion(40, 18, '#d83a4a', .5)}<rect x="4" y="4" width="22" height="7" fill="#000" opacity=".5"/>${txt('SCRIM 4', 15, 9.6, 4.6, '#ffd36b', 'none', 0)}`)}
      <path d="M0 92 H120 V120 H0 Z" fill="#1a1420"/><path d="M0 92 H120" stroke="#3a2a40" stroke-width="2"/>
      <g transform="translate(80 54) rotate(8)"><rect width="34" height="44" rx="2" fill="#f6efe2" stroke="#8a8270" stroke-width="1.2"/>${[0, 1, 2, 3, 4].map(i => `<path d="M4 ${8 + i * 7} H30" stroke="#c8d8e8" stroke-width=".8"/>`).join('')}${['W', 'L', 'W', 'W'].map((t, i) => txt(t, 8 + i * 7, 14, 6, t === 'W' ? '#2a8a4a' : '#c0392b', 'none', 0)).join('')}<path d="M5 24 h4 M5 24 m0 3 h4 M12 23 v6 M15 23 v6 M18 23 v6 M21 23 v6 M10 22 L24 30" stroke="#3a2a1a" stroke-width="1"/></g>
      <path d="M14 98 L44 100" stroke="#06080e" stroke-width="7" stroke-linecap="round"/><path d="M14 97 L44 99" stroke="#2a3048" stroke-width="5" stroke-linecap="round"/>${txt('2:13 AM', 40, 114, 8, '#9ab8ff', '#0a0a18', 1.6)}`,
    'bootcamp': () => `${bg('#06081e', '#16204a')}${D.motes('#fff', 12)}<circle cx="96" cy="20" r="10" fill="#fff2d8"/><circle cx="100" cy="17" r="9" fill="#06081e" opacity=".9"/>
      <path d="M14 104 V56 L50 30 L86 56 V104 Z" fill="#1a1e34" stroke="#06080e" stroke-width="2"/><path d="M8 58 L50 26 L92 58" stroke="#3a2e48" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${[[24, 62], [56, 62], [24, 82], [56, 82]].map(([x, y], i) => `${glow(x + 7, y + 6, 12, '#6bc8ff', .4)}<rect x="${x}" y="${y}" width="14" height="12" rx="1" fill="${i === 3 ? '#ffd36b' : '#6bc8ff'}" stroke="#06080e" stroke-width="1.4"/><path d="M${x + 7} ${y} V${y + 12} M${x} ${y + 6} H${x + 14}" stroke="#06080e" stroke-width="1"/>`).join('')}
      <path d="M0 104 H120 V120 H0 Z" fill="#0a0e1e"/>
      <g transform="translate(92 92)"><rect x="0" y="0" width="22" height="16" rx="3" fill="#c8202e" stroke="#3a0408" stroke-width="1.4"/><path d="M7 0 V-4 H15 V0" stroke="#3a0408" stroke-width="1.6" fill="none"/><path d="M0 7 H22" stroke="#ffd36b" stroke-width="1.4"/></g>
      <g transform="translate(100 78)"><rect x="0" y="0" width="16" height="14" rx="3" fill="#2a5ad8" stroke="#06101e" stroke-width="1.4"/><path d="M5 0 V-3 H11 V0" stroke="#06101e" stroke-width="1.4" fill="none"/></g>
      ${txt('BOOTCAMP', 50, 116, 8, '#9ab8ff', '#06081e', 1.6)}`,
    'jet-lag': () => `${bg('#1a1430', '#3a2a5a')}${cloud(20, 30, 1)}${cloud(96, 64, .8)}
      <path d="M8 22 C40 26 70 18 94 12" stroke="#fff" stroke-width="2" stroke-dasharray="4 3" opacity=".5" fill="none"/>
      <g transform="translate(102 12) rotate(-12)"><path d="M-12 0 H12 Q16 0 16 2 Q16 4 12 4 H-12 Z" fill="#e8eef8" stroke="#2a3040" stroke-width="1"/><path d="M-2 2 L-8 12 H-4 L4 2 M-2 2 L-8 -8 H-4 L4 2 M-12 2 L-15 -4 H-12 L-8 2" fill="#c8d0dc" stroke="#2a3040" stroke-width="1"/></g>
      ${P({ x: 10, y: 40, s: .6, eye: 'tired' }, ACC.sleepmask())}${['Z', 'Z', 'Z'].map((z, i) => txt(z, 80 + i * 10, 64 - i * 12, 10 + i * 3, '#d8c8ff', '#1a1430', 2)).join('')}
      <circle cx="98" cy="96" r="13" fill="#f6efe2" stroke="#3a2a1a" stroke-width="2.4"/><path d="M98 96 V87 M98 96 L91 100" stroke="#3a2a1a" stroke-width="2" stroke-linecap="round"/>${txt('+9h', 98, 118, 8, '#ffd36b', '#1a1430', 1.6)}`,
    'finals-ticket': () => `${bg('#1a0e24', '#3a1a40')}${D.hatch('#ffd6f1', .04)}<g transform="rotate(-10 60 60)"><rect x="10" y="34" width="100" height="50" rx="5" fill="#000" opacity=".35" transform="translate(2 4)"/>
      <path d="M10 34 H110 V52 A6 6 0 0 0 110 64 V84 H10 V64 A6 6 0 0 0 10 52 Z" fill="#f6e2b0" stroke="#6a4508" stroke-width="2"/><path d="M84 36 V82" stroke="#6a4508" stroke-width="1.4" stroke-dasharray="3 3"/>
      <rect x="14" y="38" width="66" height="42" rx="3" fill="none" stroke="#c8941c" stroke-width="1"/>${txt('FINALS', 47, 56, 14, '#1a2a6a', 'none', 0)}${txt('ADMIT ONE', 47, 66, 6.4, '#8a5a08', 'none', 0)}${txt('SEC 3 · ROW 3', 47, 76, 5, '#6a4508', 'none', 0)}
      ${[...Array(10)].map((_, i) => `<rect x="${88 + i * 2}" y="44" width="${i % 3 ? 1 : 1.6}" height="20" fill="#2a1a04"/>`).join('')}<circle cx="97" cy="74" r="5" fill="#e2b23c" stroke="#6a4508" stroke-width="1"/><path d="M97 71 l1 2 2 .2 -1.6 1.4 .6 2 -2 -1.2 -2 1.2 .6 -2 -1.6 -1.4 2 -.2 Z" fill="#fff6c8"/></g>${sparks([[18, 20, .6], [104, 100, .6]], '', '#ffe9b0')}`,
    'merch-stand': () => `${bg('#141a2a', '#26304a')}<rect x="8" y="34" width="104" height="70" fill="#2a1e14" stroke="#0a0604" stroke-width="2"/>
      <path d="M4 22 H116 L112 36 H8 Z" fill="#c8202e" stroke="#3a0408" stroke-width="1.6"/>${[...Array(7)].map((_, i) => `<path d="M${8 + i * 15} 36 Q${15.5 + i * 15} 44 ${23 + i * 15} 36" fill="${i % 2 ? '#c8202e' : '#f6efe2'}" stroke="#3a0408" stroke-width="1"/><path d="M${10 + i * 15} 22 L${10 + i * 15 + 4} 36" stroke="#f6efe2" stroke-width="5" opacity="${i % 2 ? .0 : .7}"/>`).join('')}
      ${[[30, '#2a5ad8'], [60, '#1a1e30'], [90, '#d83a4a']].map(([x, c]) => `<path d="M${x} 46 V50" stroke="#8a96aa" stroke-width="1.4"/><path d="M${x - 6} 50 L${x - 14} 54 L${x - 18} 62 L${x - 12} 65 L${x - 10} 62 V84 H${x + 10} V62 L${x + 12} 65 L${x + 18} 62 L${x + 14} 54 L${x + 6} 50 C${x + 4} 54 ${x - 4} 54 ${x - 6} 50 Z" fill="${c}" stroke="#06080e" stroke-width="1.4"/><path d="M${x - 5} 70 H${x + 5}" stroke="#ffd36b" stroke-width="2"/>`).join('')}
      <path d="M0 96 H120 V120 H0 Z" fill="#3a2a1a"/><path d="M0 96 H120" stroke="#8a5a2a" stroke-width="2.4"/>
      ${[[24, '#2a5ad8'], [50, '#ffd36b']].map(([x, c]) => `<path d="M${x - 9} 96 C${x - 9} 84 ${x + 9} 84 ${x + 9} 96 Z" fill="${c}" stroke="#06080e" stroke-width="1.2"/><path d="M${x + 6} 96 H${x + 16}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`).join('')}
      <g transform="translate(88 100) rotate(-8)"><rect width="22" height="12" rx="2" fill="#ffd36b" stroke="#6a4508" stroke-width="1.2"/>${txt('$30', 11, 9, 7, '#3a2404', 'none', 0)}</g>`,
    'pickem': () => `${bg('#0e1630', '#1e2a56')}${D.grid('#9ab8ff', .04)}<g transform="rotate(-4 56 60)"><rect x="14" y="10" width="80" height="100" rx="4" fill="#f6efe2" stroke="#3a4a6a" stroke-width="2"/>${txt("PICK'EM", 54, 24, 9, '#1a2a6a', 'none', 0)}
      ${[0, 1, 2, 3, 4].map(i => `<rect x="22" y="${32 + i * 15}" width="11" height="9" rx="1.5" fill="${['#3a8ad8', '#d83a4a', '#5fd08a', '#b98cff', '#ff8a3a'][i]}"/><path d="M38 ${36.5 + i * 15} H66" stroke="#b8b0a0" stroke-width="2" stroke-linecap="round"/>${i === 2 ? `<path d="M74 ${32 + i * 15} l8 8 M82 ${32 + i * 15} l-8 8" stroke="#c0392b" stroke-width="2.4" stroke-linecap="round"/>` : `<path d="M73 ${37 + i * 15} l3 3 l6 -7" stroke="#2a8a4a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`}`).join('')}
      ${txt('4/5', 30, 106, 8, '#2a8a4a', 'none', 0)}</g>
      <g transform="translate(98 74) rotate(30)"><rect x="-3.4" y="-36" width="6.8" height="40" fill="#ffd36b" stroke="#6a4508" stroke-width="1"/><rect x="-3.4" y="-42" width="6.8" height="6" fill="#ff8aa0" stroke="#6a4508" stroke-width="1"/><path d="M-3.4 4 L0 12 L3.4 4 Z" fill="#f6dcb0" stroke="#6a4508" stroke-width="1"/><path d="M-1 9 L0 12 L1 9 Z" fill="#1a1a1a"/></g>`,
    'lightstick': () => `${bg('#120a2a', '#2a1450', '#ff6ab4')}${D.motes('#ffd6f1', 12)}${[[18, 30, '#6bc8ff'], [100, 24, '#ffd36b'], [92, 90, '#7bffb4'], [14, 86, '#ff6ab4']].map(([x, y, c]) => `${glow(x, y, 8, c, .6)}<circle cx="${x}" cy="${y}" r="2" fill="${c}"/>`).join('')}
      <g transform="rotate(14 60 70)">${glow(60, 40, 34, '#ff9ad8', .6)}<rect x="54" y="62" width="12" height="54" rx="4" fill="#1a1e30" stroke="#06080e" stroke-width="1.6"/><rect x="56" y="70" width="3" height="40" rx="1.5" fill="#fff" opacity=".2"/><circle cx="60" cy="84" r="2.6" fill="#ff6ab4"/>
        <rect x="52" y="58" width="16" height="7" rx="2" fill="#e2b23c" stroke="#6a4508" stroke-width="1.2"/><circle cx="60" cy="38" r="20" fill="#ffd6f1" fill-opacity=".85" stroke="#fff" stroke-width="2"/><circle cx="60" cy="38" r="14" fill="#ff9ad8" opacity=".55"/>${P({ x: 49, y: 26, s: .22, eye: 'happy', body: '#fff', shade: '#ffc8e8', mane: '#ff5ab4' })}<path d="M46 28 Q52 22 60 22" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`,
    'crowd-roar': () => `${bg('#120818', '#2a1030', '#ff6a3a')}${[0, 1, 2].map(i => `<path d="M${20 - i * 8} ${40 - i * 10} Q60 ${10 - i * 14} ${100 + i * 8} ${40 - i * 10}" stroke="#ffd36b" stroke-width="${2.4 - i * .5}" fill="none" opacity="${.6 - i * .15}"/>`).join('')}
      ${txt('WOOO!', 60, 44, 20, '#ffd36b', '#3a0a04', 3.4)}
      ${[...Array(9)].map((_, i) => { const x = 6 + i * 13.5, h = (i * 7) % 6; return `<path d="M${x - 3} ${82 - h} L${x - 8} ${62 - h} M${x + 3} ${82 - h} L${x + 7} ${64 - h}" stroke="#06020a" stroke-width="3.4" stroke-linecap="round"/><circle cx="${x}" cy="${84 - h}" r="5.4" fill="#06020a"/><path d="M${x - 8} 120 C${x - 8} ${90 - h} ${x + 8} ${90 - h} ${x + 8} 120 Z" fill="#06020a"/>`; }).join('')}
      ${[[12, 60], [62, 58], [104, 62]].map(([x, y]) => `${glow(x, y, 6, '#ffd36b', .7)}`).join('')}`,
    'camera-cut': () => `${bg('#0e1220', '#1e2438')}${D.grid('#9ab8ff', .04)}
      <path d="M26 66 L12 116 M26 66 L26 116 M26 66 L40 116" stroke="#2a3040" stroke-width="3"/><rect x="4" y="44" width="40" height="24" rx="3" fill="#1a1e2a" stroke="#06080e" stroke-width="1.8"/><rect x="40" y="48" width="12" height="16" rx="2" fill="#2a3040" stroke="#06080e" stroke-width="1.4"/><circle cx="52" cy="56" r="6" fill="#0a0e1a" stroke="#4a5466" stroke-width="1.6"/><circle cx="53" cy="54" r="2" fill="#6bc8ff" opacity=".7"/><rect x="10" y="38" width="16" height="7" rx="1.5" fill="#2a3040"/><circle cx="12" cy="50" r="2" fill="#ff3a3a"/>
      <path d="M58 56 L68 30 M58 56 L68 92" stroke="#fff" stroke-width=".8" opacity=".3"/>
      <rect x="66" y="26" width="50" height="68" rx="2" fill="#0a1430" opacity=".6"/>${P({ x: 70, y: 40, s: .42, eye: 'happy' }, ACC.jersey('#2a5ad8', '#ffd36b'))}
      ${[[68, 28, 1, 1], [114, 28, -1, 1], [68, 92, 1, -1], [114, 92, -1, -1]].map(([x, y, dx, dy]) => `<path d="M${x} ${y + dy * 8} V${y} H${x + dx * 8}" stroke="#fff" stroke-width="2" fill="none"/>`).join('')}<circle cx="76" cy="36" r="2.4" fill="#ff3a3a"/>${txt('REC', 88, 39, 6, '#ff3a3a', 'none', 0)}${txt('CAM 3', 92, 106, 8, '#9ab8ff', '#0e1220', 1.6)}`,
    'energy-drink': () => `${bg('#06200e', '#0e3a1a', '#7bffb4')}${D.hatch('#9affb8', .05)}${D.shadow(60, 106, 24)}
      <rect x="40" y="18" width="40" height="88" rx="6" fill="#141a20" stroke="#06080e" stroke-width="2"/><path d="M42 18 H78 L76 12 H44 Z" fill="#c8d0dc" stroke="#3a4250" stroke-width="1.4"/><path d="M40 100 H80" stroke="#8a96aa" stroke-width="2"/><rect x="40" y="100" width="40" height="6" rx="3" fill="#c8d0dc"/>
      <path d="M40 40 L80 30 V76 L40 86 Z" fill="#7bffb4"/>${bolt(60, 58, 1.3, '#141a20')}<path d="M46 22 V96" stroke="#fff" stroke-width="3" opacity=".15"/>${txt('MANA', 60, 96, 9, '#7bffb4', 'none', 0)}
      ${[[36, 30], [84, 50], [34, 70], [86, 88], [38, 92]].map(([x, y], i) => `<path d="M${x} ${y} c-2 3 -2 5 0 5 c2 0 2 -2 0 -5 Z" fill="#c8fff0" opacity="${.5 + (i % 2) * .3}"/>`).join('')}${sparks([[18, 20, .6], [104, 24, .5]], '', '#c8fff0')}`,
    'stream-chat': () => `${bg('#120a24', '#221440')}<rect x="10" y="8" width="100" height="104" rx="6" fill="#0a0614" stroke="#6a4ab8" stroke-width="2"/><rect x="10" y="8" width="100" height="14" rx="6" fill="#2a1a50"/>${txt('CHAT', 26, 18.5, 7, '#d8c8ff', 'none', 0)}<circle cx="100" cy="15" r="2.4" fill="#ff3a3a"/>
      ${[['ponyfan', '#ff6ab4', 'LETS GO'], ['mid_main', '#6bc8ff', 'W'], ['xX3trickXx', '#ffd36b', 'GG'], ['jgdiff', '#7bffb4', 'OMG'], ['cupkid', '#ff8a3a', 'WORLDS!!']].map(([n, c, m], i) => `${txt(n + ':', 16, 34 + i * 15, 6.4, c, 'none', 0, 'start')}${txt(m, 18 + n.length * 4.7, 34 + i * 15, 6.4, '#e8e0f8', 'none', 0, 'start')}`).join('')}
      ${[[80, 44], [92, 74]].map(([x, y]) => P({ x, y, s: .14, eye: 'happy' })).join('')}<path d="M86 96 C83 92 78 95 86 102 C94 95 89 92 86 96 Z" fill="#ff5a8a"/>
      <rect x="14" y="98" width="60" height="9" rx="3" fill="#1a1230" stroke="#4a3a7a" stroke-width="1"/>${txt('send a message', 18, 104.6, 5, '#6a5a9a', 'none', 0, 'start')}`,
    'instant-replay': () => `${bg('#0a1020', '#1a2440')}<rect x="8" y="16" width="104" height="72" rx="8" fill="#1a1e2a" stroke="#06080e" stroke-width="2.4"/><rect x="14" y="22" width="92" height="60" rx="4" fill="#1e3a5a"/>
      ${P({ x: 34, y: 28, s: .46, eye: 'star' }, ACC.jersey('#d83a4a', '#ffd36b'))}${[...Array(10)].map((_, i) => `<path d="M14 ${25 + i * 6} H106" stroke="#000" stroke-width="1" opacity=".2"/>`).join('')}
      <rect x="18" y="26" width="34" height="10" rx="2" fill="#c8202e"/>${txt('REPLAY', 35, 33.6, 7, '#fff', 'none', 0)}<path d="M98 28 L92 32 L98 36 Z M92 28 L86 32 L92 36 Z" fill="#fff"/>${txt('0.25x', 92, 50, 7, '#ffd36b', '#06080e', 1.6)}
      <path d="M44 88 L38 104 M76 88 L82 104" stroke="#2a3040" stroke-width="4"/><rect x="30" y="102" width="60" height="6" rx="3" fill="#2a3040"/>`,
    'trophy-case': () => `${bg('#1a1208', '#3a2814', '#ffd36b')}<rect x="14" y="8" width="92" height="104" rx="4" fill="#4a2e16" stroke="#1a0e04" stroke-width="2"/><rect x="20" y="14" width="80" height="92" fill="#1a1420"/>
      ${[42, 72, 102].map(y => `<rect x="20" y="${y}" width="80" height="4" fill="#6a4420"/>`).join('')}
      ${cup(40, 42, .3)}<g transform="translate(64 42)"><rect x="-6" y="-4" width="12" height="4" fill="#8a5a2a"/><path d="M-5 -4 L-7 -22 H7 L5 -4 Z" fill="#e2b23c" stroke="#6a4508" stroke-width="1"/><path d="M-7 -20 C-12 -20 -12 -12 -5 -11 M7 -20 C12 -20 12 -12 5 -11" stroke="#e2b23c" stroke-width="2" fill="none"/></g><g transform="translate(86 42)"><circle cy="-12" r="8" fill="#c8d0dc" stroke="#3a4250" stroke-width="1.2"/><path d="M-4 -24 L0 -18 L4 -24" stroke="#2a5ad8" stroke-width="3" fill="none"/><path d="M-6 0 H6 L4 -4 H-4 Z" fill="#6a4420"/></g>
      ${[[34, 72], [60, 72], [84, 72]].map(([x, y], i) => `<rect x="${x - 9}" y="${y - 22}" width="18" height="22" rx="2" fill="${['#c8945a', '#5a6478', '#e2b23c'][i]}" stroke="#1a0e04" stroke-width="1.2"/><circle cx="${x}" cy="${y - 13}" r="5" fill="#fff2b0" opacity=".8"/>`).join('')}
      ${[[30, 102, '#ffd36b'], [48, 102, '#c8d0dc'], [66, 102, '#c8945a'], [84, 102, '#ffd36b']].map(([x, y, c]) => `<path d="M${x} ${y - 20} L${x + 4} ${y - 4} H${x - 4} Z" fill="${c}" stroke="#1a0e04" stroke-width="1"/><rect x="${x - 6}" y="${y - 4}" width="12" height="4" fill="#3a2a1a"/>`).join('')}
      <path d="M24 16 L44 104 M36 16 L52 80" stroke="#fff" stroke-width="3" opacity=".08"/><rect x="20" y="14" width="80" height="92" fill="none" stroke="#c8d8e8" stroke-width="1" opacity=".35"/><circle cx="96" cy="60" r="2" fill="#c8a96e"/>`
  };

  // Hologramm-Figuren der Animated Rares (eigene Ebene, schwebt ueber der Karte)
  const POP = {
    'unkillable-demon-king': () => `<g class="a-float">${P({ x: 16, y: 26, s: .66, eye: 'normal', mane: '#160a12', shade: '#a06a18' }, ACC.mantle(), ACC.calm(), ACC.glasses(), ACC.demon())}</g>`,
    'summoners-cup': () => `<g class="a-float">${P({ x: 20, y: 50, s: .56, eye: 'happy' }, ACC.jersey('#2a5ad8', '#ffd36b', '3'))}${cup(56, 60, .7)}${[0, 1].map(i => `<path d="M${22 - i * 6} ${36 + i * 8} q-6 -4 -4 -12 M${90 + i * 6} ${36 + i * 8} q6 -4 4 -12" stroke="#fff6c8" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}</g>`,
    'grand-final': () => `<g class="a-float">${P({ x: -2, y: 38, s: .5, eye: 'angry' }, ACC.jersey('#2a5ad8', '#9ae4ff'), ACC.headset('#1c2236', '#6bc8ff'))}${P({ x: 70, y: 38, s: .5, eye: 'angry', flip: true, body: '#d8b48c', shade: '#9a6a28', mane: '#3a1a10' }, ACC.jersey('#c8202e', '#ffb0b0'), ACC.headset('#2a1418', '#ff6a6a'))}${txt('VS', 60, 66, 15, '#ffd36b', '#140a36', 3)}</g>`
  };

  // ---------- Full Arts (Nutzerwahl: #1, 7, 11, 19, 20, 23, 33, 34, 44, 48) ----------
  // Szene 120x168 (Hochformat, randlos), Mittelebene schwebt auf ~45 % Hoehe,
  // Hologramm-Figur (120x120) liegt oben auf der Karte (left/right 4 %, top 7 %).
  // In 3D-Ebenen (MID/POP) keine weichen Leuchtflecken - die wachsen in den Schichten mit.
  const fbg = (top, mid, bottom) => { const a = U('wfb'); return `<defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="120" height="168" fill="url(#${a})"/>`; };
  const fvig = (op = .5) => { const v = U('wfv'); return `<defs><radialGradient id="${v}" cx=".5" cy=".42" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${op}"/></radialGradient></defs><rect width="120" height="168" fill="url(#${v})"/>`; };
  const fmotes = (c = '#fff', n = 12) => [...Array(n)].map((_, i) => `<circle cx="${(i * 37 + 11) % 112 + 4}" cy="${(i * 53 + 7) % 150 + 6}" r="${.7 + (i % 3) * .45}" fill="${c}" opacity="${.35 + (i % 4) * .12}"/>`).join('');
  const fgrid = (c = '#fff', op = .05) => { const p = U('wfg'); return `<defs><pattern id="${p}" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 H0 V10" fill="none" stroke="${c}" stroke-width=".6"/></pattern></defs><rect width="120" height="168" fill="url(#${p})" opacity="${op}"/>`; };
  const fhex = (c = '#fff', op = .05) => { const p = U('wfh'); return `<defs><pattern id="${p}" width="12" height="10.4" patternUnits="userSpaceOnUse"><path d="M3 0 H9 L12 5.2 L9 10.4 H3 L0 5.2 Z" fill="none" stroke="${c}" stroke-width=".7"/></pattern></defs><rect width="120" height="168" fill="url(#${p})" opacity="${op}"/>`; };
  const fspot = (x, tx, w, c = '#fff', op = .3, cls = '') => { const g = U('wfs'); return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="${op}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs><path class="${cls}" d="M${x - 2.5} -2 L${x + 2.5} -2 L${tx + w} 170 L${tx - w} 170 Z" fill="url(#${g})"/>`; };
  // dichtes Publikum in zwei Reihen mit Leuchtstaeben
  const fcrowd = (y, c = '#04030c', lights = ['#ffd36b', '#ff6ab4', '#6bc8ff'], cls = 'a-twinkle') => `${crowd(y, c, lights, cls)}<g transform="translate(4 14)">${crowd(y, c, lights.slice().reverse(), cls)}</g>`;
  const pill = (x, y, t, k = 0, w = 24) => `<rect x="${x - w / 2}" y="${y - 6.5}" width="${w}" height="13" rx="6.5" fill="${k === 1 ? '#e2b23c' : k === 2 ? '#5a1a24' : '#1a2448'}" stroke="${k === 1 ? '#fff2b0' : k === 2 ? '#d83a4a' : '#6a7aaa'}" stroke-width="1.6"/>${txt(t, x, y + 2.8, 7.4, k === 1 ? '#2a1a04' : '#e8eef8', 'none', 0)}`;
  const flag = (x, y, c, c2) => `<g transform="translate(${x} ${y})"><rect x="-1.6" y="0" width="3.2" height="96" rx="1.4" fill="#c8d0dc" stroke="#2a3040" stroke-width="1"/><circle cy="-2" r="3.4" fill="#e2b23c" stroke="#5a3a06" stroke-width="1"/>
    <path d="M1.6 4 C10 0 18 8 28 4 C24 12 26 20 30 28 C20 32 12 24 1.6 28 Z" fill="${c}" stroke="#06080e" stroke-width="1.4"/><path d="M1.6 10 C10 6 18 14 27 10" stroke="${c2}" stroke-width="2" fill="none"/><path d="M14 13 l2 4 4 .4 -3 2.6 1 4 -4 -2 -4 2 1 -4 -3 -2.6 4 -.4 Z" fill="${c2}"/></g>`;
  const ring = (cx, cy, rr, c = '#e2b23c', n = 8) => [...Array(n)].map((_, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2, x = (cx + Math.cos(a) * rr).toFixed(1), y = (cy + Math.sin(a) * rr).toFixed(1); return `<path transform="translate(${x} ${y}) rotate(${(a * 180 / Math.PI + 90).toFixed(0)})" d="M0 -6 L3 0 L0 6 L-3 0 Z" fill="${c}" stroke="#2a0606" stroke-width=".8"/>`; }).join('');

  const FA_ART = {
    // #1 Unkillable Demon King: Thronsaal unter rotem Finsternis-Ring, Mid-Lane laeuft auf den Betrachter zu
    'unkillable-demon-king': () => `${fbg('#080104', '#260610', '#050103')}${fhex('#ff8a6a', .03)}${rays(60, 58, '#ff9a6a', 22, .07, 150, 'a-spin')}
      <g class="a-pulse" style="transform-origin:60px 58px">${glow(60, 58, 74, '#ff1e2e', .6)}</g><circle cx="60" cy="58" r="50" fill="#ff5a3a" opacity=".12"/>
      <circle cx="60" cy="58" r="45" fill="#060103" stroke="#e2b23c" stroke-width="2.4"/><circle cx="60" cy="58" r="40" fill="none" stroke="#ff3a3a" stroke-width=".9" stroke-dasharray="2 3" opacity=".8"/><circle cx="60" cy="58" r="49" fill="none" stroke="#ff7a4a" stroke-width="5" opacity=".2"/>
      ${[[8, 6, 40], [100, 6, 40]].map(([x, y, h]) => `<path d="M${x} ${y} h12 v${h} l-6 -6 -6 6 Z" fill="#7a0a14" stroke="#e2b23c" stroke-width="1.2"/><path d="M${x + 6} ${y + 12} l3 4 -3 4 -3 -4 Z" fill="#e2b23c"/>`).join('')}
      <path d="M20 140 V66 L28 52 L34 64 V48 L46 30 L60 12 L74 30 L86 48 V64 L92 52 L100 66 V140 Z" fill="#100308" stroke="#7a1a14" stroke-width="1.6" stroke-linejoin="round"/><path d="M60 18 V140 M34 64 H86" stroke="#26070c" stroke-width="2"/>
      ${[[28, 52], [60, 12], [92, 52]].map(([x, y]) => `<path d="M${x} ${y - 5} l3.6 5 -3.6 5 -3.6 -5 Z" fill="#e2b23c"/>`).join('')}
      <path d="M0 168 V138 L14 130 H106 L120 138 V168 Z" fill="#16040a"/><path d="M14 130 H106" stroke="#e2b23c" stroke-width="1.4"/><path d="M6 142 H114" stroke="#e2b23c" stroke-width=".8" opacity=".5"/>
      <path d="M46 168 L54 130 H66 L74 168 Z" fill="#3a0c0c"/><path d="M60 132 V168" stroke="#ffd36b" stroke-width="1.4" stroke-dasharray="4 4" opacity=".8"/>
      ${[[8, 90], [16, 120], [104, 98], [112, 70], [100, 126], [12, 64], [108, 30], [30, 148], [90, 150], [20, 26], [64, 150]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><circle class="a-twinkle d${i % 4}" r="${1.1 + (i % 3) * .55}" fill="${i % 2 ? '#ffd36b' : '#ff5a3a'}"/></g>`).join('')}
      ${fmotes('#ff9a6a', 10)}${fvig(.6)}`,
    // #7 Base Race: diagonale Lane, Fluss quer, Minions greifen beide Basen an
    'base-race': () => `${fbg('#0a1024', '#140e2c', '#06040e')}<path d="M0 0 L0 168 L120 168 Z" fill="#2a5ad8" opacity=".14"/><path d="M0 0 H120 V168 Z" fill="#d83a4a" opacity=".14"/>${fgrid('#fff', .04)}
      <path d="M0 70 C40 86 80 104 120 120" stroke="#0e2a4a" stroke-width="18" fill="none"/><path d="M0 70 C40 86 80 104 120 120" stroke="#4a9ad8" stroke-width="2" stroke-dasharray="6 5" fill="none" opacity=".5"/>
      <path d="M12 160 L108 18" stroke="#120e22" stroke-width="22" stroke-linecap="round"/><path d="M12 160 L108 18" stroke="#3a2e50" stroke-width="15" stroke-linecap="round"/><path d="M12 160 L108 18" stroke="#ffd36b" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>
      ${glow(96, 46, 30, '#ff5a5a', .55)}${glow(22, 116, 30, '#6bc8ff', .55)}
      ${minion(40, 134, '#d83a4a', .7)}${minion(32, 142, '#d83a4a', .62)}${minion(48, 128, '#d83a4a', .55)}${minion(82, 52, '#4a7ad8', .62)}${minion(90, 44, '#4a7ad8', .55)}
      ${[[20, 120], [100, 80]].map(([x, y]) => `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" fill="#8a96aa" stroke="#fff" stroke-width=".8" transform="rotate(45 ${x} ${y})" opacity=".7"/>`).join('')}
      ${txt('42:17', 26, 18, 11, '#e8eef8', '#0a1024', 2.4)}${fmotes('#ffe46b', 8)}${fvig(.5)}`,
    // #11 Opening Ceremony: Nachthimmel voller Feuerwerk ueber der Buehne
    'opening-ceremony': () => `${fbg('#02030c', '#0a1030', '#03040c')}${fmotes('#fff', 16)}
      ${burst(24, 28, 20, '#ffd36b', 'a-pulse')}${burst(94, 20, 24, '#ff6ab4', 'a-pulse')}${burst(64, 58, 13, '#6bc8ff')}${burst(14, 78, 11, '#7bffb4', 'a-pulse')}${burst(106, 74, 13, '#ffd36b')}${burst(46, 8, 9, '#b98cff')}
      ${fspot(8, 40, 18, '#9ab8ff', .22)}${fspot(112, 80, 18, '#ffb4e0', .22)}
      <path d="M0 168 V132 L14 124 H106 L120 132 V168 Z" fill="#0a0e24"/><path d="M14 124 H106" stroke="#c8a96e" stroke-width="1.4"/>${[...Array(10)].map((_, i) => `<g transform="translate(${18 + i * 9.4} 128)"><circle class="a-twinkle d${i % 4}" r="1.2" fill="${['#6bc8ff', '#ffd36b', '#ff6ab4'][i % 3]}"/></g>`).join('')}
      <g class="a-pulse">${flame(10, 112, .5)}</g><g class="a-pulse">${flame(110, 112, .5)}</g><rect x="2" y="122" width="16" height="10" fill="#2a3040" stroke="#0a0e16" stroke-width="1"/><rect x="102" y="122" width="16" height="10" fill="#2a3040" stroke="#0a0e16" stroke-width="1"/>
      ${fcrowd(144, '#02030c')}${fvig(.45)}`,
    // #19 Swiss Stage: riesige LED-Wand mit dem Swiss-Gitter
    'swiss-stage': () => `${fbg('#05061a', '#10183c', '#04050e')}
      <rect x="6" y="6" width="108" height="118" rx="4" fill="#0a0e2a" stroke="#3a4a8a" stroke-width="1.6"/>${fgrid('#6a7aff', .06)}
      ${[[16, 64, 40, 40], [16, 64, 40, 88], [40, 40, 66, 22], [40, 40, 66, 58], [40, 88, 66, 58], [40, 88, 66, 106], [66, 22, 96, 12], [66, 22, 96, 40], [66, 58, 96, 40], [66, 58, 96, 76], [66, 106, 96, 76], [66, 106, 96, 116]].map(([a, b, c, d], i) => `<path d="M${a} ${b} C${a + 14} ${b} ${c - 14} ${d} ${c} ${d}" stroke="${[0, 2, 6].includes(i) ? '#ffd36b' : '#2a3a7a'}" stroke-width="${[0, 2, 6].includes(i) ? 2.4 : 1.4}" fill="none" opacity=".8"/>`).join('')}
      ${fspot(14, 30, 16, '#9ab8ff', .25, 'a-pulse')}${fspot(106, 90, 16, '#ffd36b', .22, 'a-pulse')}
      <path d="M0 168 V132 H120 V168 Z" fill="#0a0e24"/><path d="M0 132 H120" stroke="#c8a96e" stroke-width="1.4"/>${fcrowd(148, '#03040e', ['#6bc8ff', '#ffd36b'])}${fmotes('#9ab8ff', 8)}${fvig(.45)}`,
    // #20 Quarterfinals: Turnierbaum auf der Leinwand, Arena darunter
    'quarterfinals': () => `${fbg('#06081c', '#141640', '#04050e')}${fgrid('#9ab8ff', .04)}
      <rect x="8" y="6" width="104" height="44" rx="3" fill="#0a0e2a" stroke="#3a4a8a" stroke-width="1.4"/>
      ${[0, 1, 2, 3].map(i => `<rect x="12" y="${10 + i * 9.6}" width="18" height="6.4" rx="1.6" fill="#1a2048"/><rect x="90" y="${10 + i * 9.6}" width="18" height="6.4" rx="1.6" fill="#1a2048"/>`).join('')}
      <path d="M30 13 H36 V22 H30 M36 18 H42 M30 32 H36 V42 H30 M36 37 H42 M42 18 V37 M42 28 H50 M90 13 H84 V22 H90 M84 18 H78 M90 32 H84 V42 H90 M84 37 H78 M78 18 V37 M78 28 H70" stroke="#6a7aaa" stroke-width="1.2" fill="none"/>${glow(60, 28, 12, '#ffd36b', .6)}${cup(60, 38, .22)}
      ${fspot(20, 40, 18, '#9ab8ff', .22)}${fspot(100, 80, 18, '#ff9ad8', .22)}${fspot(60, 60, 14, '#fff', .14)}
      <path d="M4 140 L16 126 H104 L116 140 Z" fill="#141c40" stroke="#c8a96e" stroke-width="1.4"/>${fcrowd(150, '#03040e')}${fmotes('#fff', 8)}${fvig(.45)}`,
    // #23 Fan Sign: Arena-Publikum im Buehnenlicht
    'fan-sign': () => `${fbg('#10051c', '#2a0c3a', '#08030e')}${glow(60, 0, 70, '#ff6ab4', .4)}${fspot(30, 20, 18, '#ffb4e0', .2)}${fspot(90, 104, 18, '#9ab8ff', .2)}
      ${[[16, 30, 12, '#ff6ab4'], [102, 22, 16, '#6bc8ff'], [76, 48, 9, '#ffd36b'], [24, 70, 8, '#b98cff'], [104, 84, 10, '#ff6ab4'], [60, 18, 7, '#7bffb4']].map(([x, y, rr, c]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${c}" opacity=".16"/>`).join('')}
      ${fcrowd(126, '#0a0414', ['#ff6ab4', '#ffd36b', '#6bc8ff'])}<g transform="translate(-3 30)">${crowd(126, '#05020a', ['#ffd36b', '#ff6ab4'], 'a-twinkle')}</g>${fvig(.5)}`,
    // #33 Blue Side: blaue Basis mit Bannern und Plattform
    'blue-side': () => `${fbg('#020a20', '#0a2a5a', '#020814')}${fhex('#9ae4ff', .05)}${D.beams('#9ae4ff', .08)}
      ${[[6, 0], [102, 0], [26, 0]].map(([x], i) => `<path d="M${x} 0 h12 v${i === 2 ? 34 : 58} l-6 -6 -6 6 Z" fill="${i === 2 ? '#1a4aa8' : '#2a5ad8'}" stroke="#06101e" stroke-width="1.4"/><path d="M${x + 6} 16 l3 5 -3 5 -3 -5 Z" fill="#ffd36b"/>`).join('')}
      <ellipse cx="60" cy="146" rx="62" ry="18" fill="#0e2a5a" stroke="#6bc8ff" stroke-width="1.6"/><ellipse cx="60" cy="144" rx="48" ry="11" fill="#6bc8ff" opacity=".22"/>${[0, 1].map(i => `<ellipse cx="60" cy="144" rx="${30 + i * 14}" ry="${7 + i * 3}" fill="none" stroke="#c8f2ff" stroke-width="1" stroke-dasharray="4 3" opacity="${.6 - i * .2}"/>`).join('')}
      <g class="a-pulse" style="transform-origin:92px 104px">${glow(92, 104, 34, '#6bc8ff', .6)}</g>
      ${[[10, 60], [14, 100], [110, 50], [40, 30], [76, 22]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><circle class="a-twinkle d${i % 4}" r="1.6" fill="#c8f2ff"/></g>`).join('')}${fmotes('#c8f2ff', 10)}${fvig(.5)}`,
    // #34 Red Side: rote Basis, Glut und Funken
    'red-side': () => `${fbg('#200206', '#5a0c14', '#140204')}${fhex('#ffb0b0', .05)}${D.beams('#ffb0a0', .07)}
      ${[[6, 0], [102, 0], [86, 0]].map(([x], i) => `<path d="M${x} 0 h12 v${i === 2 ? 34 : 58} l-6 -6 -6 6 Z" fill="${i === 2 ? '#8a1420' : '#b8202e'}" stroke="#1e0206" stroke-width="1.4"/><path d="M${x + 6} 16 l3 5 -3 5 -3 -5 Z" fill="#ffd36b"/>`).join('')}
      <ellipse cx="60" cy="146" rx="62" ry="18" fill="#4a0a10" stroke="#ff6a5a" stroke-width="1.6"/><ellipse cx="60" cy="144" rx="48" ry="11" fill="#ff6a5a" opacity=".2"/>${[0, 1].map(i => `<ellipse cx="60" cy="144" rx="${30 + i * 14}" ry="${7 + i * 3}" fill="none" stroke="#ffd0c0" stroke-width="1" stroke-dasharray="4 3" opacity="${.6 - i * .2}"/>`).join('')}
      <g class="a-pulse" style="transform-origin:28px 104px">${glow(28, 104, 34, '#ff5a3a', .6)}</g>
      <g class="a-pulse">${flame(108, 150, .4)}</g><g class="a-pulse">${flame(10, 156, .32)}</g>
      ${[[110, 60], [106, 100], [10, 50], [80, 30], [44, 22], [96, 128]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><circle class="a-twinkle d${i % 4}" r="${1.2 + (i % 2) * .6}" fill="${i % 2 ? '#ffd36b' : '#ff7a4a'}"/></g>`).join('')}${fmotes('#ffb48a', 10)}${fvig(.5)}`,
    // #44 Lightstick: Meer aus Leuchtstaeben in der dunklen Arena
    'lightstick': () => `${fbg('#08031a', '#1a0a36', '#05020c')}${glow(60, 4, 64, '#ff9ad8', .35)}${fspot(24, 40, 16, '#ffb4e0', .2)}${fspot(96, 76, 16, '#9ab8ff', .2)}
      ${[...Array(6)].map((_, row) => [...Array(13)].map((_, i) => { const x = i * 10 + (row % 2) * 5 - 2, y = 90 + row * 13, c = ['#ff6ab4', '#ffd36b', '#6bc8ff', '#7bffb4', '#b98cff'][(i + row * 2) % 5], rr = 1.2 + row * .3; return `<circle cx="${x}" cy="${y}" r="${rr * 2.6}" fill="${c}" opacity=".18"/><g transform="translate(${x} ${y})"><circle class="${(i + row) % 3 === 0 ? `a-twinkle d${i % 4}` : ''}" r="${rr}" fill="${c}"/></g>`; }).join('')).join('')}
      ${[...Array(3)].map((_, row) => `<g opacity=".9">${crowd(112 + row * 20, '#05020c')}</g>`).join('')}${fmotes('#ffd6f1', 12)}${fvig(.5)}`,
    // #48 Stream Chat: Stream-Layout - Spielbild oben, Chat-Spalte unten
    'stream-chat': () => `${fbg('#0c0620', '#1a0e38', '#06030f')}
      <rect x="6" y="6" width="108" height="70" rx="4" fill="#1e4a2a" stroke="#6a4ab8" stroke-width="1.6"/><path d="M14 70 L106 12" stroke="#8a7a5a" stroke-width="5" opacity=".5"/><path d="M8 40 C40 46 80 30 112 50" stroke="#1a4a7a" stroke-width="8" opacity=".7" fill="none"/>
      ${minion(30, 58, '#4a7ad8', .6)}${minion(40, 52, '#4a7ad8', .6)}${minion(84, 26, '#d83a4a', .6)}${minion(92, 20, '#d83a4a', .6)}<rect x="6" y="6" width="108" height="70" rx="4" fill="#000" opacity=".25"/>
      ${txt('12.4k watching', 12, 16.4, 6, '#e8e0f8', '#000', 1.2, 'start')}
      <rect x="6" y="80" width="108" height="82" rx="4" fill="#0a0614" stroke="#6a4ab8" stroke-width="1.6"/>
      ${[['ponyfan', '#ff6ab4', 'LETS GOOO'], ['mid_main', '#6bc8ff', 'W W W'], ['xX3trickXx', '#ffd36b', 'GG EZ'], ['jgdiff', '#7bffb4', 'OMG THAT PLAY'], ['cupkid', '#ff8a3a', 'WORLDS!!']].map(([n, c, m], i) => `${txt(n + ':', 12, 92 + i * 10, 5.6, c, 'none', 0, 'start')}${txt(m, 14 + n.length * 4.1, 92 + i * 10, 5.6, '#e8e0f8', 'none', 0, 'start')}`).join('')}
      ${fmotes('#d8c8ff', 8)}${fvig(.45)}`
  };
  // Mittlere Ebene: Teile der Szene schweben zwischen Szene und Figur
  const FA_MID = {
    // abgehobener Gold-Ring der Finsternis mit vier Zacken
    'unkillable-demon-king': () => `<circle cx="60" cy="58" r="50" fill="none" stroke="#e2b23c" stroke-width="2.2"/><circle cx="60" cy="58" r="50" fill="none" stroke="#fff2b0" stroke-width=".7" opacity=".7"/>${ring(60, 58, 50, '#e2b23c', 4)}`,
    'base-race': () => `${nexus(96, 58, .9, '#ff7a7a', '#b8202e', false)}${nexus(22, 128, .8, '#6bc8ff', '#2a6ad8', false)}
      <rect x="80" y="10" width="32" height="6" rx="3" fill="#0a0e1a" stroke="#000" stroke-width="1"/><rect x="81.4" y="11.4" width="5" height="3.2" rx="1.6" fill="#ff5a5a"/><rect x="6" y="84" width="32" height="6" rx="3" fill="#0a0e1a" stroke="#000" stroke-width="1"/><rect x="7.4" y="85.4" width="6" height="3.2" rx="1.6" fill="#6bc8ff"/>`,
    'opening-ceremony': () => `${[[18, 130, 10, 60, '#ffd36b'], [102, 130, 110, 54, '#ff6ab4'], [40, 132, 32, 90, '#6bc8ff'], [80, 132, 90, 96, '#7bffb4']].map(([x1, y1, x2, y2, c]) => `<path d="M${x1} ${y1} Q${(x1 + x2) / 2 + 6} ${(y1 + y2) / 2} ${x2} ${y2}" stroke="${c}" stroke-width="1.8" fill="none" stroke-dasharray="1 3" stroke-linecap="round"/>${spark(x2, y2, .7, 1, '', '#fff')}`).join('')}${confetti(14, 9, '', [4, 96, 112, 30])}`,
    'swiss-stage': () => `${pill(18, 30, '0-0')}${pill(16, 64, '1-0')}${pill(20, 98, '1-1')}${pill(104, 70, '2-1')}${pill(102, 104, '1-2')}${pill(100, 124, '0-3', 2)}${pill(18, 120, '2-0')}`,
    'quarterfinals': () => `${[0, 1, 2, 3].map(i => { const y = 64 + i * 17, c1 = ['#3a8ad8', '#5fd08a', '#ff8a3a', '#b98cff'][i], c2 = ['#ff5a8a', '#6bd8ff', '#ffd36b', '#d83a4a'][i]; return `<rect x="2" y="${y}" width="24" height="12" rx="3" fill="#1a2048" stroke="${i === 0 ? '#ffd36b' : '#6a7aaa'}" stroke-width="1.4"/><rect x="4.4" y="${y + 2.4}" width="7.2" height="7.2" rx="1.4" fill="${c1}"/><path d="M14 ${y + 6} h9" stroke="#8a9ac8" stroke-width="2" stroke-linecap="round"/><rect x="94" y="${y}" width="24" height="12" rx="3" fill="#1a2048" stroke="#6a7aaa" stroke-width="1.4"/><rect x="108.4" y="${y + 2.4}" width="7.2" height="7.2" rx="1.4" fill="${c2}"/><path d="M97 ${y + 6} h9" stroke="#8a9ac8" stroke-width="2" stroke-linecap="round"/>`; }).join('')}`,
    'fan-sign': () => `<path d="M14 120 L17 132 M104 118 L102 132" stroke="#8a5a2a" stroke-width="2.6"/>
      <g transform="rotate(-12 16 112)"><rect x="2" y="98" width="28" height="26" rx="2" fill="#fff8d8" stroke="#ffd36b" stroke-width="2"/>${txt('W', 16, 117, 16, '#2a8a4a', 'none', 0)}</g>
      <g transform="rotate(10 98 108)"><rect x="82" y="94" width="32" height="26" rx="2" fill="#e8f4ff" stroke="#6bc8ff" stroke-width="2"/>${txt('3 TRICK', 98, 105, 6.6, '#c8202e', 'none', 0)}${txt('PONY', 98, 115, 7, '#2a5ad8', 'none', 0)}</g>`,
    'blue-side': () => `${nexus(92, 126, 1, '#6bc8ff', '#2a6ad8', false)}`,
    'red-side': () => `${nexus(28, 126, 1, '#ff7a7a', '#b8202e', false)}`,
    'lightstick': () => `${[[12, 98, -24, '#6bc8ff'], [108, 92, 22, '#ffd36b'], [22, 124, -8, '#7bffb4']].map(([x, y, rr, c]) => `<g transform="translate(${x} ${y}) rotate(${rr})"><rect x="-3" y="0" width="6" height="18" rx="2" fill="#1a1e30" stroke="#06080e" stroke-width="1.2"/><rect x="-4" y="-3" width="8" height="4" rx="1" fill="#c8d0dc"/><circle cy="-10" r="9" fill="${c}" stroke="#fff" stroke-width="1.6"/><circle cx="-3" cy="-13" r="2.6" fill="#fff" opacity=".7"/></g>`).join('')}`,
    'stream-chat': () => `${[[16, 34, 'W', '#2a8a4a'], [102, 30, 'GG', '#2a5ad8'], [104, 112, 'POG', '#c8202e'], [16, 120, '!!!', '#b8202e']].map(([x, y, t, c], i) => `<g transform="rotate(${i % 2 ? 8 : -8} ${x} ${y})"><rect x="${x - 13}" y="${y - 9}" width="26" height="16" rx="5" fill="#f6efe2" stroke="#1a0e30" stroke-width="1.6"/><path d="M${x - 4} ${y + 7} l-3 6 8 -6" fill="#f6efe2" stroke="#1a0e30" stroke-width="1.4"/>${txt(t, x, y + 3, 8, c, 'none', 0)}</g>`).join('')}${heart(104, 92, .7)}${heart(14, 84, .45, '#ff9ab8')}`
  };
  // Bewegte 3D-Ebene (ein flaches Blatt, dreht sich scharf)
  const FA_FX = {
    'unkillable-demon-king': () => `<g transform="translate(60 58)"><g class="a-spin" style="transform-box: fill-box; transform-origin: center; animation-duration: 24s"><circle r="57" fill="none" stroke="#ffd36b" stroke-width=".9" stroke-dasharray="1 6" opacity=".9"/>${[0, 1, 2, 3, 4, 5].map(i => { const a = i / 6 * Math.PI * 2; return `<circle cx="${(Math.cos(a) * 57).toFixed(1)}" cy="${(Math.sin(a) * 57).toFixed(1)}" r="2" fill="#ff5a3a" stroke="#ffd36b" stroke-width=".8"/>`; }).join('')}</g></g>`,
    'opening-ceremony': () => `${[[30, 100], [90, 92], [60, 112]].map(([x, y], i) => `<g class="a-twinkle d${i}">${spark(x, y, .8, 1, '', '#fff6c8')}</g>`).join('')}`
  };
  // Hologramm-Figuren (120x120)
  const FA_POP = {
    'unkillable-demon-king': () => `<g class="a-float">${P({ x: 12, y: 14, s: .76, eye: 'normal', mane: '#160a12', shade: '#a06a18' }, ACC.mantle(), ACC.calm(), ACC.glasses(), ACC.demon())}</g>`,
    'base-race': () => `<g class="a-float">${[0, 1, 2, 3].map(i => `<path d="M${4 + i * 2} ${54 + i * 9} H${24 - i * 3}" stroke="#ffe46b" stroke-width="2.4" stroke-linecap="round"/>`).join('')}${P({ x: 22, y: 30, s: .6, eye: 'angry', flip: true }, ACC.jersey('#2a5ad8', '#ffd36b', '7'), ACC.headset('#1c2236', '#6bc8ff'))}</g>`,
    'opening-ceremony': () => `<g class="a-float">${flag(88, 6, '#1a2a6a', '#ffd36b')}${P({ x: 4, y: 30, s: .62, eye: 'happy' }, `<path d="M38 112 C40 94 52 86 68 86 C88 84 102 94 106 112 Z" fill="#f6efe2" stroke="#6a4508" stroke-width="2"/><path d="M56 87 L66 98 L80 86" fill="none" stroke="#e2b23c" stroke-width="3.2"/>${[0, 1, 2].map(i => `<circle cx="${70 + i * 1}" cy="${100 + i * 4}" r="1.6" fill="#e2b23c"/>`).join('')}<path d="M88 88 C96 92 102 98 104 106" stroke="#e2b23c" stroke-width="4" fill="none"/><path d="M90 92 L98 90 M94 98 L102 96" stroke="#ffd36b" stroke-width="1.6"/>`)}</g>`,
    'swiss-stage': () => `<g class="a-float">${P({ x: 10, y: 30, s: .62, eye: 'happy' }, ACC.jersey('#1a2a6a', '#ffd36b'), ACC.headset('#1c2236', '#ffd36b'))}<g transform="rotate(-8 92 22)"><rect x="70" y="12" width="44" height="22" rx="11" fill="#e2b23c" stroke="#fff2b0" stroke-width="2.4"/>${txt('3-0', 92, 29, 15, '#2a1a04', 'none', 0)}</g>${spark(112, 42, .5, 1, '', '#fff6c8')}</g>`,
    'quarterfinals': () => `<g class="a-float">${P({ x: 18, y: 18, s: .62, eye: 'angry' }, ACC.jersey('#c8202e', '#ffd36b'), ACC.headset('#2a1418', '#ff6a6a'))}${txt('QF', 60, 116, 24, '#ffd36b', '#1a0a04', 3.4)}</g>`,
    'fan-sign': () => `<g class="a-float"><path d="M34 70 L38 118 M86 70 L82 118" stroke="#8a5a2a" stroke-width="4"/><path d="M34 70 L38 118 M86 70 L82 118" stroke="#c88a4a" stroke-width="1.4"/>
      <g transform="rotate(-6 60 44)"><rect x="8" y="12" width="104" height="62" rx="4" fill="#fff6fb" stroke="#ff6ab4" stroke-width="3"/><rect x="12" y="16" width="96" height="54" rx="2" fill="none" stroke="#ffd36b" stroke-width="1.2" stroke-dasharray="3 2"/>
        ${txt('GO', 40, 44, 24, '#ff3a8a', 'none', 0)}${txt('PONY!', 52, 66, 19, '#2a5ad8', 'none', 0)}${P({ x: 70, y: 18, s: .3, eye: 'happy' })}${heart(98, 60, .55)}${heart(18, 22, .35, '#ffd36b')}</g></g>`,
    'blue-side': () => `<g class="a-float">${P({ x: 2, y: 22, s: .66, eye: 'happy', flip: true }, ACC.jersey('#2a5ad8', '#9ae4ff', '1'), ACC.headset('#1c2236', '#6bc8ff'))}</g>`,
    'red-side': () => `<g class="a-float">${P({ x: 42, y: 22, s: .66, eye: 'angry' }, ACC.jersey('#b8202e', '#ffb0b0', '2'), ACC.headset('#2a1418', '#ff6a6a'))}</g>`,
    'lightstick': () => `<g class="a-float"><g transform="rotate(12 60 64)"><rect x="52" y="64" width="16" height="56" rx="5" fill="#1a1e30" stroke="#06080e" stroke-width="2"/><rect x="55" y="72" width="3.4" height="42" rx="1.7" fill="#fff" opacity=".2"/><circle cx="60" cy="88" r="3" fill="#ff6ab4"/><rect x="56" y="96" width="8" height="4" rx="1" fill="#3a3e58"/>
      <rect x="48" y="58" width="24" height="9" rx="2.6" fill="#e2b23c" stroke="#6a4508" stroke-width="1.4"/><circle cx="60" cy="32" r="30" fill="#ffd6f1" stroke="#fff" stroke-width="2.6"/><circle cx="60" cy="32" r="23" fill="#ff9ad8" opacity=".6"/>${P({ x: 44, y: 14, s: .32, eye: 'happy', body: '#fff', shade: '#ffc8e8', mane: '#ff5ab4' })}<path d="M38 22 Q46 8 60 6" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>${spark(84, 14, .6, 1, '', '#fff')}</g></g>`,
    'stream-chat': () => `<g class="a-float">${P({ x: 18, y: 26, s: .64, eye: 'happy' }, ACC.jersey('#5a3ab8', '#ffd36b'), ACC.headset('#1c2236', '#ff6ab4'), ACC.mouth())}<rect x="84" y="20" width="30" height="13" rx="3" fill="#e01e3a" stroke="#fff" stroke-width="1.6"/><circle cx="91" cy="26.5" r="2.4" fill="#fff"/>${txt('LIVE', 103, 30.4, 8, '#fff', 'none', 0)}</g>`
  };

  const LIST = [
    ['unkillable-demon-king', 'Unkillable Demon King'], ['summoners-cup', 'Summoner\'s Cup'], ['grand-final', 'Grand Final'],
    ['world-champion', 'World Champion'], ['finals-mvp', 'Finals MVP'], ['the-outplay', 'The Outplay'], ['base-race', 'Base Race'], ['reverse-sweep', 'Reverse Sweep'], ['caster-hype', 'Caster Hype'], ['anthem', 'The Anthem'],
    ['opening-ceremony', 'Opening Ceremony'], ['draft-phase', 'Draft Phase'], ['first-pick', 'First Pick'], ['counter-pick', 'Counter Pick'], ['tech-pause', 'Tech Pause'], ['shotcaller', 'Shotcaller'], ['head-coach', 'Head Coach'], ['analyst-desk', 'Analyst Desk'],
    ['swiss-stage', 'Swiss Stage'], ['quarterfinals', 'Quarterfinals'], ['semifinals', 'Semifinals'], ['upset', 'Upset!'], ['fan-sign', 'Fan Sign'], ['cosplayer', 'Cosplayer'], ['confetti', 'Confetti'],
    ['stage-lights', 'Stage Lights'], ['headset', 'Headset'], ['gaming-chair', 'Gaming Chair'], ['team-jersey', 'Team Jersey'], ['team-banner', 'Team Banner'], ['scoreboard', 'Scoreboard'], ['game-five', 'Game Five'], ['blue-side', 'Blue Side'], ['red-side', 'Red Side'], ['gg-handshake', 'GG Handshake'],
    ['press-room', 'Press Room'], ['post-game-interview', 'Interview'], ['scrims', 'Scrims'], ['bootcamp', 'Bootcamp'], ['jet-lag', 'Jet Lag'], ['finals-ticket', 'Finals Ticket'], ['merch-stand', 'Merch Stand'], ['pickem', 'Pick\'Em'], ['lightstick', 'Lightstick'],
    ['crowd-roar', 'Crowd Roar'], ['camera-cut', 'Camera Cut'], ['energy-drink', 'Energy Drink'], ['stream-chat', 'Stream Chat'], ['instant-replay', 'Instant Replay'], ['trophy-case', 'Trophy Case']
  ];
  const rarityOf = n => n <= 3 ? 'anim' : n <= 10 ? 'holo' : n <= 25 ? 'uncommon' : 'common';
  const SET = LIST.map(([id, name], i) => ({ n: i + 1, id, name, r: rarityOf(i + 1) }));
  const { RL, RC } = B;

  // Karten-Front in Set-Farbe (Nutzer): dunkles Graphit mit Silber + Champagner-Gold
  // (Pokal-Silber auf schwarzer Buehne, passend zum Pack-Verlauf); die Raritaet
  // zeigen weiter Rahmen, Effekte und Text (Rahmen-Verlaeufe wie im Base Set)
  const css = document.createElement('style');
  css.textContent = `
  .stk-front.ws.r-common { background: linear-gradient(160deg, #2a2a32, #0c0c10) padding-box, linear-gradient(135deg, #e6ecf5, #7a8496 45%, #d8dee8 70%, #6a7486) border-box; box-shadow: inset 0 0 0 1px rgba(216,196,138,.2); }
  .stk-front.ws.r-uncommon { background: radial-gradient(circle at 50% 35%, #30303a, #0c0c10 70%) padding-box, linear-gradient(135deg, #b8ffd8, #2a8a4a 40%, #8affc0 65%, #1e6a3a) border-box; }
  .stk-front.ws.r-holo { background: linear-gradient(160deg, #34343e, #0a0a0e) padding-box, linear-gradient(var(--hb, 0deg), #ff7ad9, #ffd36b, #7bffb4, #6bc8ff, #b98cff, #ff7ad9) border-box; }
  .stk-front.ws.r-anim { background: radial-gradient(circle at 50% 30%, #3e3c46, #0a0a0e 70%) padding-box, linear-gradient(var(--hb, 0deg), #f4f4f8, #d8c48a, #8a8a96, #fff2c8, #d8c48a, #f4f4f8) border-box; }
  .stk-front.ws.r-common .name { color: #ece6d8; }
  .stk-front.ws .meta { color: #d8c48a; }`;
  document.head.appendChild(css);
  const art = id => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${ART[id]()}</svg>`;
  const popLayers = id => B.popLayersOf(POP[id]);
  const frontHtml = s => `<div class="stk-face stk-front ws r-${s.r}" style="--rc:${RC[s.r]}">
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
      const fl = U('wml');
      out += `<div class="fa-mid slab" style="--i:${k};--shade:${(.3 + k / MID_SLABS * .25).toFixed(2)}">${wrap(`<defs><filter id="${fl}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="1.1"/></filter></defs><g filter="url(#${fl})">${svg}</g>`)}</div>`;
    }
    return out + `<div class="fa-mid" style="--i:${MID_SLABS}">${wrap(svg)}</div>`;
  };
  const faFx = id => FA_FX[id] ? `<div class="fa-fx"><svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${FA_FX[id]()}</svg></div>` : '';
  const faMidFlat = id => FA_MID[id] ? `<svg viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${FA_MID[id]()}</svg>` : '';
  const faPopFlat = id => FA_POP[id] ? `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${FA_POP[id]()}</svg>` : '';
  window.STICKERS_WORLDS = { id: 'worlds', name: 'Worlds Stage', SET, RL, RC, art, frontHtml, square, square3d, TOTAL: SET.length, faArt, faPop, faPopFlat, faMid, faMidFlat, faFx };
  window.STICKER_SETS = window.STICKER_SETS || {};
  window.STICKER_SETS.worlds = window.STICKERS_WORLDS;
})();
