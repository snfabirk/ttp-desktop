// Three-Trick-Pony - Special Set #1 "Neon District" (25 Sticker), Entwurf.
// Cyberpunk-Hommage (wie das Developer's-Choice-Kit): abgedunkeltes Gelb als
// Hauptfarbe, Cyan als Zweitfarbe, Rot nur als Akzent, dunkle Neon-Stadt.
// Keine Original-Namen/-Figuren - ueberall unser Pony + League-Bezug.
// Laedt NACH sticker-set.js (nutzt dessen Karten-CSS, Neigung und HEAD).
// App-Kopie: public/stickers-neon.js - nach Aenderungen neu erzeugen
// (.front.cy -> .stk-front.cy, 'face front cy' -> 'stk-face stk-front cy').
// Raritaeten (Nutzer 2026-11-06, halbes Base Set): anim 2, holo 4, uncommon 7, common 12.
(function () {
  const BASE = window.STICKERS;
  let uid = 0;
  const U = p => p + 'cy' + (++uid);
  const f = v => (+v).toFixed(1);
  const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const HEAD = BASE.HEAD;
  const MANE = 'M60 18 L66 9 L69 20 L77 13 L79 26 L87 22 L87 35 L95 35 L91 47 L99 51 L93 59 L99 67 L93 73 L97 81 L92 85 L92 96 C92 80 93 62 90 48 C86 30 74 20 60 18 Z';
  const Y = '#e8d43a', YL = '#fff27a', YD = '#8a7a10', C = '#5ef0f0', CD = '#0e5a66', R = '#ff2a4a', INK = '#06070b';
  const FONT = "Bahnschrift,'Arial Narrow',Arial,sans-serif";

  // ---------- Bausteine ----------
  function glow(cx, cy, r, color, op = .8, cls = '') {
    const g = U('gl');
    return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}" fill="url(#${g})"/>`;
  }
  function cbg(top, bottom, glowC, gx = 60, gy = 52, gr = 54, gop = .4) {
    const a = U('cb');
    return `<defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="120" height="120" fill="url(#${a})"/>${glowC ? glow(gx, gy, gr, glowC, gop) : ''}`;
  }
  // Abschluss: Scanlines + Vignette
  function fin(sl = .14) {
    const v = U('cv'), p = U('cp');
    return `<defs><radialGradient id="${v}" cx=".5" cy=".45" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
      <pattern id="${p}" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity="${sl}"/></pattern></defs>
      <rect width="120" height="120" fill="url(#${p})"/><rect width="120" height="120" fill="url(#${v})"/>`;
  }
  const chromeDef = (id, a = '#f4f6fa', b = '#8a92a2', c = '#e8ecf2', d = '#4a5262', e = '#c8ced8') =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".35" stop-color="${b}"/><stop offset=".5" stop-color="${c}"/><stop offset=".72" stop-color="${d}"/><stop offset="1" stop-color="${e}"/></linearGradient>`;
  // Skyline mit beleuchteten Fenstern, Antennen und roten Warnlichtern
  function skyline(seed, y, col, h0, h1, wins = [Y, C], dens = .3, w0 = 7, w1 = 15) {
    const r = rng(seed); let x = -4, out = '', win = '';
    while (x < 124) {
      const w = w0 + r() * (w1 - w0), h = h0 + r() * (h1 - h0);
      out += `<rect x="${f(x)}" y="${f(y - h)}" width="${f(w)}" height="${f(h + 30)}" fill="${col}"/>`;
      if (r() < .35) out += `<rect x="${f(x + w / 2 - .4)}" y="${f(y - h - 7)}" width=".8" height="7" fill="${col}"/>${r() < .6 ? `<circle cx="${f(x + w / 2)}" cy="${f(y - h - 7)}" r="1" fill="${R}"/>` : ''}`;
      for (let wy = y - h + 3; wy < y - 2; wy += 3.2) for (let wx = x + 1.5; wx < x + w - 2; wx += 2.6)
        if (r() < dens) win += `<rect x="${f(wx)}" y="${f(wy)}" width="1.3" height="1.6" fill="${wins[Math.floor(r() * wins.length)]}" opacity="${f(.45 + r() * .55)}"/>`;
      x += w + r() * 1.5;
    }
    return out + win;
  }
  function rain(seed, n = 40, op = .35, c = '#9fdcff') {
    const r = rng(seed); let o = '';
    for (let i = 0; i < n; i++) { const x = r() * 130 - 5, y = r() * 125 - 5, l = 4 + r() * 8; o += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x - l * .22)}" y2="${f(y + l)}" stroke="${c}" stroke-width=".5" opacity="${f(op * (.35 + r() * .65))}"/>`; }
    return o;
  }
  const neon = (d, c, w = 1.6, fill = 'none') => `<path d="${d}" fill="${fill}" stroke="${c}" stroke-width="${f(w * 3.4)}" opacity=".2" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="${f(w * .35)}" opacity=".7" stroke-linecap="round" stroke-linejoin="round"/>`;
  const ntext = (t, x, y, s, c, a = 'middle', ls = 1, op = 1) => `<g font-family="${FONT}" font-weight="700" font-size="${s}" text-anchor="${a}" letter-spacing="${ls}" opacity="${op}"><text x="${x}" y="${y}" fill="none" stroke="${c}" stroke-width="${f(s * .3)}" opacity=".28">${t}</text><text x="${x}" y="${y}" fill="${c}">${t}</text><text x="${x}" y="${y}" fill="none" stroke="#fff" stroke-width="${f(s * .04)}" opacity=".6">${t}</text></g>`;
  // Glitch-Schrift: Cyan/Rot versetzt hinter der Hauptfarbe
  const gtext = (t, x, y, s, c = Y, a = 'middle', ls = 1) => `<g font-family="${FONT}" font-weight="700" font-size="${s}" text-anchor="${a}" letter-spacing="${ls}"><text x="${f(x - s * .07)}" y="${y}" fill="${C}" opacity=".85">${t}</text><text x="${f(x + s * .07)}" y="${f(y + s * .03)}" fill="${R}" opacity=".85">${t}</text><text x="${x}" y="${y}" fill="${c}" stroke="${INK}" stroke-width="${f(s * .1)}" paint-order="stroke">${t}</text></g>`;
  const hud = (x, y, w, h, c = C, l = 6, sw = 1.2, op = 1) => `<path d="M${x} ${y + l} V${y} H${x + l} M${x + w - l} ${y} H${x + w} V${y + l} M${x + w} ${y + h - l} V${y + h} H${x + w - l} M${x + l} ${y + h} H${x} V${y + h - l}" fill="none" stroke="${c}" stroke-width="${sw}" opacity="${op}"/>`;
  function hazard(x, y, w, h, op = 1, s = 8) {
    const p = U('hz');
    return `<defs><pattern id="${p}" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${s / 2}" height="${s}" fill="${Y}"/><rect x="${s / 2}" width="${s / 2}" height="${s}" fill="#14140c"/></pattern></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${p})" opacity="${op}"/>`;
  }
  // senkrechtes Neon-Schild mit Katakana
  const vsign = (x, y, chars, c, w = 11) => { const h = chars.length * w + 4; return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="#07070d" stroke="${c}" stroke-width="3" opacity=".22"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="#07070d" stroke="${c}" stroke-width="1"/>${[...chars].map((ch, i) => `<text x="${f(x + w / 2)}" y="${f(y + 2 + (i + 1) * w - 2)}" text-anchor="middle" font-size="${f(w * .74)}" font-family="'Yu Gothic','Meiryo',sans-serif" font-weight="700" fill="${c}">${ch}</text>`).join('')}`; };
  const spark = (x, y, s = 1, o = .9, cls = '', c = '#fff') => `<g transform="translate(${x} ${y}) scale(${s})"><path class="${cls}" d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2 Z" fill="${c}" opacity="${o}"/></g>`;
  const sparks = (pts, cls = '', c = '#fff') => pts.map(([x, y, s = 1], i) => spark(x, y, s, .9, cls ? `${cls} d${i % 4}` : '', c)).join('');
  const blocks = (seed, n, area = [0, 0, 120, 120], cols = [C, R, Y], op = .7) => { const r = rng(seed); let o = ''; for (let i = 0; i < n; i++) o += `<rect x="${f(area[0] + r() * area[2])}" y="${f(area[1] + r() * area[3])}" width="${f(2 + r() * 12)}" height="${f(1 + r() * 3)}" fill="${cols[i % cols.length]}" opacity="${f(op * (.4 + r() * .6))}"/>`; return o; };
  const ground = (y, c = '#07070d') => `<rect x="0" y="${y}" width="120" height="${120 - y}" fill="${c}"/>`;
  // Pfuetzen-Spiegelung: weiche, senkrecht verschmierte Lichtflecken
  const puddle = (pts, y) => pts.map(([x, c, w = 8]) => `<rect x="${f(x - w / 2)}" y="${y}" width="${w}" height="${f(120 - y)}" fill="${c}" opacity=".18"/><rect x="${f(x - w / 4)}" y="${y}" width="${f(w / 2)}" height="${f((120 - y) * .6)}" fill="${c}" opacity=".25"/>`).join('');

  // Cyber-Pony: Kopf wie im Base Set + Visor/Optik-Implantat, Chromplatte, Leiterbahnen
  function cpony({ body = '#4a505e', shade = '#181b24', mane = C, x = 16, y = 14, s = .88, flip = false, eye = 'visor', eyeC = C, chrome = true, lines = true, cls = '', extra = '', led = true } = {}) {
    const g = U('cpg'), ch = U('cpc');
    const eyes = {
      visor: `${glow(39, 30, 17, eyeC, .55)}<path d="M21 27.5 L55 23 L57 32 L23 37.5 Z" fill="#061016" stroke="${eyeC}" stroke-width="1.3" stroke-linejoin="round"/><path d="M21 27.5 L55 23 L57 32 L23 37.5 Z" fill="${eyeC}" opacity=".32"/><path d="M25 30.6 L53 26.7" stroke="#f0ffff" stroke-width="2" stroke-linecap="round"/><circle cx="31" cy="31.5" r="1.7" fill="#fff"/><path d="M55 23 L60 21 M57 32 L61 33" stroke="url(#${ch})" stroke-width="2"/>`,
      optic: `${glow(36, 33, 13, eyeC, .65)}<circle cx="36" cy="33" r="6.6" fill="#0c0e14" stroke="url(#${ch})" stroke-width="2.2"/><circle cx="36" cy="33" r="3.8" fill="${eyeC}"/><circle cx="36" cy="33" r="1.5" fill="#fff"/><path d="M27 33 H25 M45 33 H47 M36 24 V22" stroke="${eyeC}" stroke-width="1"/>`,
      normal: '<ellipse cx="36" cy="33" rx="4" ry="4.6" fill="#1a1410"/><circle cx="37.3" cy="31.6" r="1.4" fill="#fff"/>',
      angry: '<ellipse cx="36" cy="34" rx="3.6" ry="4" fill="#1a1410"/><path d="M29 26 L43 31" stroke="#1a1410" stroke-width="3" stroke-linecap="round"/>'
    };
    const plate = chrome ? `<path d="M19 61 L33 52.5 L46 56 L44.5 63.5 L30 70.5 L19.5 71.5 Z" fill="url(#${ch})" stroke="#0a0c10" stroke-width="1"/><path d="M33 52.5 L31 70" stroke="#0a0c10" stroke-width=".8" opacity=".6"/><circle cx="23" cy="65" r=".9" fill="#20242c"/><circle cx="40" cy="58.5" r=".9" fill="#20242c"/><path d="M21.5 68.5 H28" stroke="${eyeC}" stroke-width="1"/>` : '';
    const circ = lines ? `<path d="M58 38 L66 46 L66 62 L74 70 L74 92" stroke="${eyeC}" stroke-width="1.1" fill="none" opacity=".85"/><circle cx="58" cy="38" r="1.6" fill="${eyeC}"/><circle cx="74" cy="92" r="1.6" fill="${eyeC}"/><path d="M53 47 L59 53 L59 76" stroke="${Y}" stroke-width=".9" fill="none" opacity=".75"/><circle cx="59" cy="76" r="1.3" fill="${Y}"/>` : '';
    return `<g class="${cls}" transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})${flip ? ' translate(-100 0)' : ''}">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${body}"/><stop offset="1" stop-color="${shade}"/></linearGradient>${chromeDef(ch)}</defs>
      <path d="${HEAD}" fill="url(#${g})" stroke="#000" stroke-opacity=".55" stroke-width="1.5"/>
      <path d="${MANE}" fill="${mane}" stroke="#000" stroke-opacity=".45" stroke-width="1"/>
      <path d="M62 19 L66 11 L68.5 21 L76.5 15 L78 27 L86 24" fill="none" stroke="#fff" stroke-width=".9" opacity=".45"/>
      <path d="M14 66 C22 70 30 68 36 64" stroke="rgba(0,0,0,.3)" stroke-width="1.6" fill="none"/>
      <path d="M44 14 C50 30 56 40 70 50" stroke="rgba(255,255,255,.16)" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${circ}${plate}<circle cx="13" cy="64" r="2" fill="rgba(0,0,0,.55)"/>${eyes[eye] || eyes.visor}
      ${led ? `<circle cx="51" cy="8.5" r="1.6" fill="${R}"/><circle cx="51" cy="8.5" r="3.4" fill="${R}" opacity=".25"/>` : ''}${extra}
    </g>`;
  }
  const minion = (x, y, s = 1, c = '#3a5aa8', visor = R) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="6" rx="16" ry="19" fill="${c}" stroke="${INK}" stroke-width="1.6"/><path d="M-16 -2 Q0 -26 16 -2 Z" fill="#2a3040" stroke="${INK}" stroke-width="1.6"/><path d="M-13 -1 H13 L11 5 H-11 Z" fill="#0a0c12"/><path d="M-11 2 H11" stroke="${visor}" stroke-width="2.4" stroke-linecap="round"/><path d="M-11 2 H11" stroke="${visor}" stroke-width="6" opacity=".25" stroke-linecap="round"/><path d="M-8 14 Q0 18 8 14" stroke="${INK}" stroke-width="1.4" fill="none"/></g>`;

  // ---------- Die 25 Motive ----------
  const ART = {
    // ===== Animated Rares (Figur kommt aus POP) =====
    'netrunner': () => {
      const r = rng(7); let cols = '';
      const glyph = '01アイウエオカキクケコサシスセソ7F3A';
      for (let x = 6; x < 120; x += 9) {
        const len = 6 + Math.floor(r() * 9), y0 = r() * 120;
        for (let k = 0; k < len; k++) {
          const ch = glyph[Math.floor(r() * glyph.length)], yy = (y0 + k * 8) % 120, op = k === len - 1 ? 1 : .15 + k / len * .55;
          const t = `<text x="${x}" y="${f(yy)}" font-size="6.5" font-family="'Yu Gothic',${FONT}" fill="${k === len - 1 ? '#e8ffff' : C}" opacity="${f(op)}">${ch}</text>`;
          cols += t + t.replace(`y="${f(yy)}"`, `y="${f(yy - 120)}"`);
        }
      }
      return `${cbg('#02050a', '#08202a', C, 60, 58, 58, .35)}<g class="c-rain">${cols}</g>
        <g stroke="${C}" stroke-width=".8" fill="none" opacity=".55"><path d="M0 104 H22 L30 96 H48"/><path d="M120 100 H96 L88 92 H72"/><path d="M0 112 H40 L46 106"/><path d="M120 110 H82"/></g>
        <circle class="c-blink" cx="48" cy="96" r="1.6" fill="${C}"/><circle class="c-blink d2" cx="72" cy="92" r="1.6" fill="${Y}"/><circle class="c-blink d1" cx="46" cy="106" r="1.4" fill="${C}"/>
        ${hud(6, 6, 108, 108, C, 10, 1, .7)}${ntext('JACK-IN', 12, 15, 5, C, 'start', 1, .8)}${ntext('▮▮▮▯ 87%', 108, 15, 5, Y, 'end', .5, .8)}${fin(.16)}`;
    },
    'neon-overdrive': () => {
      const r = rng(31); let lines = '';
      for (let i = 0; i < 16; i++) { const y = 20 + r() * 70, x = r() * 120, l = 14 + r() * 30, c = [Y, C, R, '#fff'][i % 4]; const ln = `<rect x="${f(x)}" y="${f(y)}" width="${f(l)}" height="${f(.6 + r())}" fill="${c}" opacity="${f(.3 + r() * .5)}"/>`; lines += ln + ln.replace(`x="${f(x)}"`, `x="${f(x - 120)}"`); }
      return `${cbg('#07030f', '#3a0a22', R, 60, 74, 60, .35)}${skyline(5, 78, '#14081c', 18, 46, [Y, C, R], .28)}
        <rect x="0" y="76" width="120" height="44" fill="#0a0410"/>
        <g opacity=".7" stroke="${Y}" stroke-width=".7"><path d="M60 78 L-40 120 M60 78 L160 120 M60 78 L20 120 M60 78 L100 120"/></g>
        <path d="M0 86 H120 M0 96 H120 M0 108 H120" stroke="${C}" stroke-width=".5" opacity=".35"/>
        <g class="c-speed">${lines}</g><path d="M30 86 L0 76 L0 100 Z" fill="${YL}" opacity=".16"/>${fin(.14)}`;
    },

    // ===== Holo Rares =====
    'chrome-hoof': () => {
      const ch = U('ch');
      return `${cbg('#0e0c10', '#2a220a', Y, 60, 34, 52, .42)}<defs>${chromeDef(ch)}</defs>
        <g opacity=".14" fill="${Y}">${[...Array(12)].map((_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M60 26 L${f(60 + Math.cos(a - .1) * 90)} ${f(26 + Math.sin(a - .1) * 90)} L${f(60 + Math.cos(a + .1) * 90)} ${f(26 + Math.sin(a + .1) * 90)} Z"/>`; }).join('')}</g>
        ${hazard(0, 100, 120, 20, .95)}<rect x="0" y="98" width="120" height="3" fill="${INK}"/>
        <path d="M44 120 L47 82 L73 82 L76 120 Z" fill="url(#${ch})" stroke="${INK}" stroke-width="1.4"/>
        <rect x="53" y="86" width="4" height="30" rx="1" fill="#2a2e38"/><rect x="54" y="88" width="2" height="18" fill="#9aa2b0"/><path d="M47 100 H73" stroke="${INK}" stroke-width="1" opacity=".5"/><rect x="62" y="104" width="8" height="5" fill="${Y}"/><text x="66" y="108" font-size="3.6" text-anchor="middle" font-family="${FONT}" font-weight="700" fill="${INK}">MK2</text>
        <path d="M50 82 C38 72 42 56 52 50" stroke="${R}" stroke-width="2.4" fill="none"/><path d="M71 82 C82 70 78 56 68 50" stroke="${C}" stroke-width="2.2" fill="none"/><path d="M54 82 C48 72 50 62 56 54" stroke="#2a2e38" stroke-width="2" fill="none"/>
        <circle cx="60" cy="74" r="11.5" fill="url(#${ch})" stroke="${INK}" stroke-width="1.4"/><circle cx="60" cy="74" r="5" fill="#20242c"/><circle cx="60" cy="74" r="2" fill="${C}"/><circle cx="60" cy="74" r="4" fill="${C}" opacity=".3"/>
        <path d="M49.5 66 L51.5 36 L68.5 36 L70.5 66 Z" fill="url(#${ch})" stroke="${INK}" stroke-width="1.4"/>
        <rect x="51" y="45" width="18" height="4.5" fill="${Y}"/><path d="M51 45 h18 M51 49.5 h18" stroke="${INK}" stroke-width=".8"/><path d="M56 38 L55 64 M64 38 L65 64" stroke="${INK}" stroke-width=".7" opacity=".45"/><circle cx="60" cy="58" r="1.2" fill="${R}"/>
        <ellipse cx="60" cy="34" rx="10.5" ry="5" fill="#2a2e38" stroke="${INK}" stroke-width="1.2"/><path d="M50 34 Q60 38 70 34" stroke="${C}" stroke-width="1" fill="none"/>
        <path d="M46 31 L50 12 Q60 5 70 12 L74 31 Z" fill="url(#${ch})" stroke="${INK}" stroke-width="1.5"/><path d="M47.5 25 H72.5" stroke="${INK}" stroke-width="2.5"/><path d="M48 25 H72" stroke="${C}" stroke-width=".9"/><path d="M53 12 Q58 9 62 10" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>
        ${sparks([[34, 30, .8], [88, 20, 1], [92, 56, .6], [28, 60, .55]], '', YL)}<circle cx="38" cy="44" r="1" fill="${YL}"/><circle cx="84" cy="42" r="1.2" fill="${YL}"/>${fin(.12)}`;
    },
    'megacity': () => {
      const t = U('tw'), r = rng(9);
      let cars = ''; for (let i = 0; i < 8; i++) { const x = r() * 110, y = 14 + r() * 46, l = 8 + r() * 12, c = i % 3 ? '#fff' : R; cars += `<rect x="${f(x)}" y="${f(y)}" width="${f(l)}" height=".7" fill="${c}" opacity=".45"/><rect x="${f(x - 1.5)}" y="${f(y - .6)}" width="3" height="1.8" rx=".6" fill="#1a1c26"/><circle cx="${f(x - 1.5)}" cy="${f(y + .3)}" r=".8" fill="${i % 3 ? YL : R}"/>`; }
      return `${cbg('#04030c', '#24092c', C, 60, 26, 60, .26)}${glow(60, 118, 76, R, .38)}
        ${skyline(11, 92, '#1c1634', 30, 62, [C, '#7a6aff'], .16, 6, 11)}
        <defs><linearGradient id="${t}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a0816"/><stop offset=".45" stop-color="#262443"/><stop offset="1" stop-color="#08060f"/></linearGradient></defs>
        <path d="M38 120 V34 L44 30 V20 L52 16 L56 2 H64 L68 16 L76 20 V30 L82 34 V120 Z" fill="url(#${t})" stroke="#000" stroke-width="1"/>
        <path d="M44 30 H76 M38 34 H82" stroke="${Y}" stroke-width="1" opacity=".9"/>
        <rect x="39.5" y="36" width="1.6" height="84" fill="${Y}"/><rect x="78.9" y="36" width="1.6" height="84" fill="${Y}"/><rect x="38" y="36" width="5" height="84" fill="${Y}" opacity=".14"/><rect x="77" y="36" width="5" height="84" fill="${Y}" opacity=".14"/>
        ${[...Array(9)].map((_, j) => [...Array(6)].map((_, i) => r() < .5 ? `<rect x="${45 + i * 5}" y="${74 + j * 5}" width="2.4" height="2" fill="${r() < .7 ? Y : C}" opacity="${f(.4 + r() * .6)}"/>` : '').join('')).join('')}
        <circle cx="60" cy="2" r="1.8" fill="${R}"/><circle cx="60" cy="2" r="5" fill="${R}" opacity=".35"/>
        <rect x="44" y="40" width="32" height="30" rx="1" fill="#05040c" stroke="${C}" stroke-width="1.2"/><rect x="44" y="40" width="32" height="30" rx="1" fill="${C}" opacity=".14"/>
        <path d="${HEAD}" transform="translate(48 43) scale(.25)" fill="${C}" opacity=".85"/><path d="${MANE}" transform="translate(48 43) scale(.25)" fill="${Y}"/>
        ${[...Array(8)].map((_, i) => `<line x1="44" x2="76" y1="${42 + i * 3.6}" y2="${42 + i * 3.6}" stroke="#05040c" stroke-width=".8" opacity=".6"/>`).join('')}
        ${vsign(22, 44, 'ネオン', R, 9)}${vsign(90, 50, 'ビル', Y, 9)}
        ${ntext('TTP CORP', 60, 30, 4.6, Y, 'middle', 1)}${cars}
        ${skyline(23, 108, '#0a0614', 16, 40, [Y, C, R], .32, 8, 16)}
        <rect x="0" y="107" width="120" height="13" fill="#06040c"/><rect x="0" y="107" width="120" height=".8" fill="${R}" opacity=".6"/>${rain(3, 46, .28)}${fin(.12)}`;
    },
    'breach-protocol': () => {
      const codes = ['1C', '55', 'BD', 'E9', '7A'], r = rng(17); let grid = '';
      for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) {
        const x = 26 + i * 17, y = 52 + j * 11.5, c = codes[Math.floor(r() * 5)], sel = i === 2 && j === 3, col = i === 2;
        grid += `${sel ? `<rect x="${x - 7}" y="${y - 7.5}" width="14" height="10" fill="none" stroke="${Y}" stroke-width="1.1"/>` : ''}<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="6.5" fill="${sel ? YL : col ? C : '#b8a82a'}" opacity="${col || sel ? 1 : .7}">${c}</text>`;
      }
      return `${cbg('#030405', '#0c120e', Y, 60, 70, 50, .14)}
        <rect x="9" y="12" width="102" height="96" fill="#07080a" stroke="${Y}" stroke-width="1.2"/><rect x="9" y="12" width="102" height="9" fill="${Y}"/>
        <text x="13" y="19" font-family="${FONT}" font-weight="700" font-size="6" fill="${INK}" letter-spacing="1">BREACH // CODE MATRIX</text><text x="107" y="19" text-anchor="end" font-family="${FONT}" font-weight="700" font-size="6" fill="${INK}">00:14</text>
        <g font-family="${FONT}" font-weight="700" font-size="6" text-anchor="middle">${['1C', 'E9', '55', '--'].map((c, i) => `<rect x="${17 + i * 14}" y="26" width="12" height="9" fill="none" stroke="${i < 3 ? C : '#3a4440'}" stroke-width=".9"/><text x="${23 + i * 14}" y="32.6" fill="${i < 3 ? C : '#3a4440'}">${c}</text>`).join('')}</g>
        <text x="76" y="32.6" font-family="${FONT}" font-size="5" fill="#8a8a5a">BUFFER</text>
        <rect x="52.5" y="43" width="15" height="58" fill="${C}" opacity=".1"/><rect x="52.5" y="43" width="15" height="58" fill="none" stroke="${C}" stroke-width=".5" opacity=".6"/>
        <rect x="17" y="80.5" width="85" height="10" fill="${Y}" opacity=".06"/>${grid}
        <rect x="13" y="103" width="94" height="2" fill="#2a1014"/><rect x="13" y="103" width="58" height="2" fill="${R}"/>${glow(60, 60, 60, Y, .06)}${fin(.18)}`;
    },
    'street-samurai': () => {
      const ch = U('ch');
      return `${cbg('#05050b', '#260a14', R, 70, 46, 56, .45)}<defs>${chromeDef(ch)}</defs>${skyline(41, 104, '#120a16', 30, 70, [R, Y], .16, 9, 16)}
        ${vsign(96, 8, 'サムライ', R, 12)}
        ${cpony({ x: 6, y: 18, s: .8, body: '#2a2d38', shade: '#07080c', mane: '#16181f', eye: 'optic', eyeC: R, chrome: true, lines: false, led: false })}
        <path d="${HEAD}" transform="translate(6 18) scale(.8)" fill="none" stroke="${R}" stroke-width="2" opacity=".9"/><path d="${MANE}" transform="translate(6 18) scale(.8)" fill="none" stroke="${R}" stroke-width="1.6" opacity=".7"/>
        <path d="M24 120 L34 92 L52 82 L80 92 L90 120 Z" fill="#101118" stroke="#000" stroke-width="1.2"/><path d="M34 92 L52 82 L56 104 Z" fill="#1d1f28"/><path d="M80 92 L52 82 L62 106 Z" fill="#171920"/><path d="M34 92 L52 82 L80 92" stroke="${Y}" stroke-width="1.3" fill="none"/><path d="M80 92 L90 120" stroke="${R}" stroke-width="1" opacity=".7"/>
        <g transform="translate(56 76) rotate(-50)">
          <rect x="-40" y="-3.6" width="28" height="7.2" rx="1.6" fill="#0e0e14" stroke="#000" stroke-width=".8"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${-38 + i * 5.2} 0 L${-35.4 + i * 5.2} -3 L${-32.8 + i * 5.2} 0 L${-35.4 + i * 5.2} 3 Z" fill="${Y}"/>`).join('')}
          <rect x="-12" y="-8" width="3.6" height="16" rx="1.4" fill="url(#${ch})" stroke="#000" stroke-width=".7"/>
          <path d="M-8 -3 L62 -3 Q70 -2 73 1.5 L62 3 L-8 3 Z" fill="url(#${ch})" stroke="#000" stroke-width=".6"/><path d="M-8 -1 L62 -1" stroke="#fff" stroke-width=".7" opacity=".7"/>
          <path d="M-8 3 L62 3 L73 1.5" stroke="${R}" stroke-width="7" opacity=".22" fill="none"/><path d="M-8 3 L62 3 L73 1.5" stroke="${R}" stroke-width="1.8" fill="none"/><path d="M-8 2.8 L62 2.8 L73 1.4" stroke="#ffe0e4" stroke-width=".5" fill="none"/>
        </g>
        ${rain(13, 64, .42)}${sparks([[104, 20, .45], [88, 34, .35], [94, 30, .25]], '', '#ffb0bc')}${fin(.12)}`;
    },

    // ===== Uncommon =====
    'noodle-bar': () => `${cbg('#07050c', '#1c0c16', R, 60, 56, 52, .32)}
      <rect x="10" y="14" width="100" height="70" fill="#14101a"/><rect x="10" y="14" width="100" height="70" fill="${Y}" opacity=".05"/>
      <rect x="22" y="16" width="76" height="18" rx="2" fill="#07070d" stroke="${C}" stroke-width="3" opacity=".25"/><rect x="22" y="16" width="76" height="18" rx="2" fill="#07070d" stroke="${C}" stroke-width="1.1"/>
      <text x="60" y="30.5" text-anchor="middle" font-family="'Yu Gothic','Meiryo',sans-serif" font-weight="700" font-size="13" fill="${C}">ラーメン</text>
      <path d="M8 40 H112 L110 50 ${[...Array(10)].map((_, i) => `Q${f(105 - i * 10.2)} 56 ${f(100 - i * 10.2)} 50`).join(' ')} Z" fill="${R}" stroke="#000" stroke-width="1"/>
      ${[0, 2, 4, 6, 8].map(i => `<path d="M${f(110 - i * 10.2)} 40 L${f(110 - i * 10.2 - 10.2)} 40 L${f(110 - i * 10.2 - 10.2)} 50 Q${f(110 - i * 10.2 - 5)} 56 ${f(110 - i * 10.2)} 50 Z" fill="${Y}"/>`).join('')}
      <rect x="10" y="54" width="100" height="22" fill="#0e0a12"/>${glow(60, 66, 34, Y, .25)}
      <rect x="6" y="76" width="108" height="10" fill="#2a1a12" stroke="#000" stroke-width="1"/><rect x="6" y="76" width="108" height="1.6" fill="${Y}" opacity=".85"/>
      <path d="M42 70 Q60 82 78 70 Z" fill="#f4efe6" stroke="#000" stroke-width="1"/><path d="M44 70 Q60 64 76 70" fill="#e8a24a"/><path d="M48 70 q4 -4 8 0 q4 -4 8 0 q4 -4 8 0" stroke="#ffe8a8" stroke-width="1.2" fill="none"/><circle cx="66" cy="68" r="2.6" fill="#fff6e0"/><circle cx="66" cy="68" r="1.2" fill="${Y}"/>
      <path d="M70 72 L92 56 M73 73 L94 59" stroke="#c8a060" stroke-width="1.3" stroke-linecap="round"/>
      ${[50, 60, 70].map((x, i) => `<path d="M${x} 64 q-4 -6 0 -12 q4 -6 0 -12" stroke="#fff" stroke-width="1.4" fill="none" opacity="${.35 - i * .06}"/>`).join('')}
      <g><line x1="16" y1="34" x2="16" y2="42" stroke="#222"/><ellipse cx="16" cy="48" rx="5" ry="7" fill="${R}"/><ellipse cx="16" cy="48" rx="9" ry="11" fill="${R}" opacity=".2"/><path d="M11 48 H21" stroke="#7a0a1a" stroke-width=".8"/></g>
      <g><line x1="104" y1="34" x2="104" y2="42" stroke="#222"/><ellipse cx="104" cy="48" rx="5" ry="7" fill="${R}"/><ellipse cx="104" cy="48" rx="9" ry="11" fill="${R}" opacity=".2"/><path d="M99 48 H109" stroke="#7a0a1a" stroke-width=".8"/></g>
      ${ground(86, '#08060c')}${puddle([[60, Y, 30], [16, R, 8], [104, R, 8], [60, C, 14]], 88)}${rain(21, 46, .4)}${fin()}`,
    'flying-car': () => `${cbg('#050716', '#2a1034', C, 60, 56, 54, .3)}
      ${skyline(51, 112, '#160e2a', 40, 80, [C, Y], .2, 6, 10)}
      <rect x="0" y="0" width="22" height="120" fill="#0c0a16"/><rect x="98" y="0" width="22" height="120" fill="#0c0a16"/>
      ${[...Array(14)].map((_, i) => `<rect x="3" y="${6 + i * 8}" width="15" height="2" fill="${i % 3 ? Y : C}" opacity="${.25 + (i % 4) * .15}"/><rect x="102" y="${10 + i * 8}" width="15" height="2" fill="${i % 4 ? C : R}" opacity="${.2 + (i % 3) * .18}"/>`).join('')}
      <rect x="21" y="0" width="1.4" height="120" fill="${Y}"/><rect x="97.6" y="0" width="1.4" height="120" fill="${C}"/>
      <path d="M100 58 L124 55 M100 61 L124 61 M98 64 L124 67" stroke="${R}" stroke-width="1.1" opacity=".7"/>
      <path d="M22 60 L-2 50 L-2 72 Z" fill="${Y}" opacity=".16"/>
      <path d="M22 62 Q30 52 48 50 L74 48 Q92 48 100 58 L98 66 L26 68 Z" fill="#1c2030" stroke="${INK}" stroke-width="1.4"/>
      <path d="M40 51 Q50 39 64 39.5 Q77 41 83 49 Z" fill="${C}" opacity=".5" stroke="${INK}" stroke-width="1"/><path d="M47 47 Q53 42 60 42" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7"/>
      <path d="M26 62 L98 58.5" stroke="${Y}" stroke-width="1.6"/><path d="M60 50 L60 66" stroke="#000" stroke-width=".8" opacity=".5"/>
      <rect x="23" y="58" width="5" height="3" rx="1" fill="${YL}"/><rect x="96" y="56" width="4" height="3" fill="${R}"/>
      ${[36, 86].map(x => `<ellipse cx="${x}" cy="70" rx="9" ry="3" fill="#0a0c12" stroke="${INK}"/><ellipse cx="${x}" cy="72" rx="8" ry="2.4" fill="${C}"/><ellipse cx="${x}" cy="75" rx="10" ry="6" fill="${C}" opacity=".25"/>`).join('')}
      ${rain(27, 30, .28)}${fin()}`,
    'hologram-ad': () => `${cbg('#04050d', '#101a2c', C, 60, 46, 56, .3)}${skyline(61, 118, '#0a0c18', 22, 44, [C, Y], .2, 8, 14)}
      <path d="M0 96 H120 V120 H0 Z" fill="#0c0e1a"/><rect x="0" y="95" width="120" height="1.4" fill="${Y}" opacity=".6"/>
      <path d="M52 96 L4 6 L116 6 L68 96 Z" fill="${C}" opacity=".07"/>
      <g opacity=".72">${cpony({ x: 16, y: 6, s: .82, body: '#5ef0f0', shade: '#0e5a66', mane: '#d8ffff', eye: 'normal', chrome: false, lines: false, led: false })}</g>
      ${[...Array(28)].map((_, i) => `<line x1="10" x2="110" y1="${6 + i * 3.2}" y2="${6 + i * 3.2}" stroke="#04050d" stroke-width="1" opacity=".55"/>`).join('')}
      <rect x="18" y="44" width="80" height="4" fill="${C}" opacity=".25"/><rect x="24" y="44" width="80" height="4" fill="${R}" opacity=".2"/>
      ${gtext('UPGRADE YOU', 60, 92, 9, Y, 'middle', 1)}
      <path d="M48 98 H72 L68 104 H52 Z" fill="#2a2e38" stroke="${INK}"/><ellipse cx="60" cy="98" rx="7" ry="2" fill="${C}"/><ellipse cx="60" cy="98" rx="12" ry="4" fill="${C}" opacity=".3"/>
      ${fin(.18)}`,
    'back-alley-clinic': () => {
      const ch = U('ch');
      return `${cbg('#050809', '#0e1418', null)}<defs>${chromeDef(ch)}</defs>
      <g stroke="${C}" stroke-width=".4" opacity=".12">${[...Array(13)].map((_, i) => `<line x1="${i * 10}" y1="0" x2="${i * 10}" y2="86"/><line x1="0" y1="${i * 8}" x2="120" y2="${i * 8}"/>`).join('')}</g>
      <path d="M52 0 H68 L96 96 H24 Z" fill="#e8f4ff" opacity=".07"/>${glow(60, 82, 40, '#d8f0ff', .22)}
      <rect x="54" y="0" width="12" height="6" fill="#2a2e38"/><path d="M50 6 H70 L66 12 H54 Z" fill="url(#${ch})" stroke="${INK}"/><ellipse cx="60" cy="12" rx="6" ry="1.6" fill="#fff"/>
      ${neon('M14 22 H22 V14 H30 V22 H38 V30 H30 V38 H22 V30 H14 Z', R, 1.4)}${ntext('CLINIC', 26, 48, 6, R, 'middle', 1)}
      <rect x="86" y="18" width="24" height="16" rx="1.5" fill="#07090c" stroke="#3a4450"/><path d="M88 27 H93 L95 22 L98 32 L100 25 L102 27 H108" stroke="${C}" stroke-width="1" fill="none"/>
      <path d="M0 86 H120 V120 H0 Z" fill="#0a0e12"/><path d="M0 86 H120" stroke="${C}" stroke-width=".6" opacity=".4"/>
      <path d="M26 92 L40 74 L78 72 L96 82 L94 88 L76 80 L44 82 L34 96 Z" fill="url(#${ch})" stroke="${INK}" stroke-width="1.2"/><path d="M40 82 L44 104 M80 80 L82 104" stroke="#2a2e38" stroke-width="3"/><rect x="34" y="102" width="56" height="4" rx="1" fill="#2a2e38"/>
      <path d="M120 30 L98 40 L84 52" stroke="#3a3f4a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M120 30 L98 40 L84 52" stroke="url(#${ch})" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="98" cy="40" r="3.4" fill="#2a2e38" stroke="${Y}" stroke-width="1"/>
      <path d="M84 52 L76 60 M84 52 L80 62" stroke="#9aa2b0" stroke-width="1.6" stroke-linecap="round"/><circle cx="77" cy="61" r="1.6" fill="${C}"/><circle cx="77" cy="61" r="4" fill="${C}" opacity=".3"/>
      <line x1="77" y1="61" x2="62" y2="74" stroke="${R}" stroke-width=".7" opacity=".9"/>${fin()}`;
    },
    'surveillance-drone': () => `${cbg('#05070f', '#170e1e', R, 60, 40, 44, .25)}${skyline(71, 118, '#0c0a16', 22, 50, [Y, C], .22, 8, 14)}
      <path d="M52 50 L24 108 H96 L68 50 Z" fill="${Y}" opacity=".13"/><path d="M52 50 L24 108 M68 50 L96 108" stroke="${Y}" stroke-width=".6" opacity=".55"/>
      <line x1="30" y1="96" x2="90" y2="96" stroke="${Y}" stroke-width="1" opacity=".75"/>
      <ellipse cx="60" cy="108" rx="36" ry="5" fill="none" stroke="${Y}" stroke-width=".8" opacity=".7"/>${hud(48, 98, 24, 16, R, 4, 1)}
      <path d="M60 104 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0" fill="${R}" opacity=".7"/>${ntext('TARGET', 60, 120, 4.5, R, 'middle', 1)}
      ${[[30, 28], [90, 28], [36, 44], [84, 44]].map(([x, y]) => `<line x1="60" y1="36" x2="${x}" y2="${y}" stroke="#2a2e38" stroke-width="3"/><ellipse cx="${x}" cy="${y - 2}" rx="11" ry="2.2" fill="#9aa2b0" opacity=".35"/><circle cx="${x}" cy="${y}" r="2.4" fill="#1a1d24" stroke="${INK}"/>`).join('')}
      <path d="M46 36 L52 28 H68 L74 36 L68 44 H52 Z" fill="#20242e" stroke="${INK}" stroke-width="1.3"/><path d="M52 28 H68" stroke="${Y}" stroke-width="1.2"/>
      <circle cx="60" cy="44" r="5.4" fill="#0a0c12" stroke="#9aa2b0" stroke-width="1.2"/><circle cx="60" cy="44" r="2.8" fill="${R}"/><circle cx="60" cy="44" r="7" fill="${R}" opacity=".25"/><circle cx="59" cy="43" r=".9" fill="#fff"/>
      <circle cx="30" cy="28" r="1" fill="${R}"/><circle cx="90" cy="28" r="1" fill="${C}"/>${fin()}`,
    'overclocked-flash': () => {
      const r = rng(5); let tr = '';
      for (let i = 0; i < 14; i++) { const y = 8 + i * 8, x = r() * 30; tr += `<path d="M0 ${y} H${f(x + 10)} L${f(x + 16)} ${y + 6} H${f(x + 30)}" stroke="${YD}" stroke-width=".8" fill="none" opacity=".6"/><circle cx="${f(x + 30)}" cy="${y + 6}" r="1" fill="${YD}"/>`; }
      return `${cbg('#0a0904', '#262206', Y, 64, 56, 56, .4)}${tr}<g transform="translate(120 0) scale(-1 1)">${tr}</g>
        ${blocks(4, 18, [6, 44, 34, 26], [Y, C, '#fff'], .8)}
        <rect x="38" y="34" width="52" height="52" rx="4" fill="#14140c" stroke="${Y}" stroke-width="1.4"/>
        ${[...Array(7)].map((_, i) => `<rect x="${42 + i * 7}" y="28" width="2.4" height="6" fill="${Y}"/><rect x="${42 + i * 7}" y="86" width="2.4" height="6" fill="${Y}"/><rect x="32" y="${38 + i * 7}" width="6" height="2.4" fill="${Y}"/><rect x="90" y="${38 + i * 7}" width="6" height="2.4" fill="${Y}"/>`).join('')}
        ${glow(64, 60, 30, R, .4)}
        <path d="M64 36 L68 52 L84 46 L72 58 L86 70 L68 66 L64 84 L60 66 L44 72 L56 60 L42 46 L60 52 Z" fill="${Y}" stroke="${YL}" stroke-width="1.2" stroke-linejoin="round"/><path d="M64 46 L66 56 L74 54 L68 60 L74 66 L66 64 L64 74 L62 64 L54 66 L60 60 L54 54 L62 56 Z" fill="#fff"/>
        ${ntext('OC +200%', 64, 104, 7, R, 'middle', 1)}${fin()}`;
    },
    'chrome-baron': () => {
      const ch = U('ch');
      return `${cbg('#08050f', '#200c32', '#9a5af0', 60, 60, 56, .4)}<defs>${chromeDef(ch, '#efe6ff', '#6a4a9a', '#dccff4', '#2a1a44', '#b8a4dc')}</defs>
        <ellipse cx="60" cy="116" rx="58" ry="10" fill="#05030a"/><ellipse cx="60" cy="114" rx="50" ry="6" fill="none" stroke="${C}" stroke-width=".8" opacity=".5"/>
        <path d="M22 120 C20 82 32 48 60 40 C88 34 106 54 102 84 C100 100 98 112 96 120 Z" fill="url(#${ch})" stroke="${INK}" stroke-width="1.6"/>
        ${[0, 1, 2, 3].map(i => `<path d="M${24 + i * 1.5} ${108 - i * 14} Q60 ${96 - i * 16} ${98 - i * 1.2} ${104 - i * 14}" stroke="${INK}" stroke-width="1.4" fill="none" opacity=".6"/><path d="M${24 + i * 1.5} ${109.5 - i * 14} Q60 ${97.5 - i * 16} ${98 - i * 1.2} ${105.5 - i * 14}" stroke="${C}" stroke-width=".6" fill="none" opacity=".5"/>`).join('')}
        <path d="M40 46 L32 22 L48 40 Z M58 40 L58 12 L68 38 Z M78 42 L90 18 L86 46 Z" fill="url(#${ch})" stroke="${INK}" stroke-width="1.2"/>
        <path d="M36 56 Q48 48 56 56 L52 60 Q44 56 38 60 Z" fill="#06030a"/><path d="M38 57 L54 56" stroke="${C}" stroke-width="2.2" stroke-linecap="round"/><path d="M38 57 L54 56" stroke="${C}" stroke-width="6" opacity=".25" stroke-linecap="round"/>
        <path d="M68 55 Q76 47 86 54 L84 59 Q76 55 70 59 Z" fill="#06030a"/><path d="M70 56 L84 55.5" stroke="${C}" stroke-width="2.2" stroke-linecap="round"/><path d="M70 56 L84 55.5" stroke="${C}" stroke-width="6" opacity=".25" stroke-linecap="round"/>
        <path d="M42 70 Q62 92 84 70 Q76 86 62 88 Q48 86 42 70 Z" fill="#14060c" stroke="${INK}" stroke-width="1.2"/>${glow(62, 80, 16, R, .7)}
        ${[46, 52, 58, 64, 70, 76].map((x, i) => `<path d="M${x} ${72 + (i === 0 || i === 5 ? 2 : 4)} l2.6 ${i % 2 ? 6 : 5} l2.6 -${i % 2 ? 6 : 5} Z" fill="#e8ecf2"/>`).join('')}
        <path d="M48 44 Q60 40 70 42" stroke="#fff" stroke-width="2" fill="none" opacity=".55"/>${fin()}`;
    },

    // ===== Common =====
    'neon-sign': () => `${cbg('#0b0507', '#18080e', null)}
      <g fill="none" stroke="#000" stroke-width="1" opacity=".5">${[...Array(16)].map((_, j) => `<line x1="0" x2="120" y1="${j * 8}" y2="${j * 8}"/>${[...Array(7)].map((_, i) => `<line x1="${i * 20 + (j % 2) * 10}" x2="${i * 20 + (j % 2) * 10}" y1="${j * 8}" y2="${j * 8 + 8}"/>`).join('')}`).join('')}</g>
      <rect width="120" height="120" fill="#5a1a1a" opacity=".22"/>${glow(60, 56, 56, R, .3)}
      <path d="M30 18 L30 8 M90 18 L90 8" stroke="#2a2e38" stroke-width="1.4"/>
      <rect x="14" y="18" width="92" height="60" rx="8" fill="#08060a" opacity=".75"/>${neon('M18 22 h84 a4 4 0 0 1 4 4 v48 a4 4 0 0 1 -4 4 h-84 a4 4 0 0 1 -4 -4 v-48 a4 4 0 0 1 4 -4 Z', C, 1.4)}
      ${ntext('OP', 44, 56, 24, R, 'middle', 2)}${ntext('E', 66, 56, 24, R, 'middle', 2, .35)}${ntext('N', 82, 56, 24, R, 'middle', 2)}
      ${ntext('24/7', 60, 72, 11, Y, 'middle', 3)}
      <path d="M100 78 Q106 96 96 112" stroke="#14161c" stroke-width="1.6" fill="none"/>${fin()}`,
    'vending-machine': () => `${cbg('#07070b', '#14141c', Y, 60, 66, 50, .3)}
      <rect x="0" y="104" width="120" height="16" fill="#0a0a0e"/><ellipse cx="60" cy="108" rx="40" ry="5" fill="${Y}" opacity=".18"/>
      <rect x="28" y="8" width="64" height="100" rx="3" fill="#1a1c24" stroke="${INK}" stroke-width="1.6"/><rect x="28" y="8" width="5" height="100" fill="${Y}"/><rect x="87" y="8" width="5" height="100" fill="${Y}" opacity=".6"/>
      <rect x="36" y="12" width="48" height="10" rx="1" fill="#07070b"/>${ntext('SYNTH·COLA', 60, 20, 6.4, R, 'middle', .5)}
      <rect x="36" y="25" width="34" height="56" rx="1" fill="#0b1820" stroke="#000"/>${glow(53, 52, 24, C, .3)}
      ${[0, 1, 2, 3].map(j => [0, 1, 2, 3].map(i => `<rect x="${38.5 + i * 8}" y="${28 + j * 13}" width="5.6" height="9.5" rx="1.4" fill="${[Y, C, R, '#f4f4f4'][(i + j) % 4]}"/><rect x="${39.4 + i * 8}" y="${29.5 + j * 13}" width="1.2" height="6" fill="#fff" opacity=".55"/>`).join('')).join('')}
      <rect x="36" y="38" width="34" height=".8" fill="#2a3a44"/><rect x="36" y="51" width="34" height=".8" fill="#2a3a44"/><rect x="36" y="64" width="34" height=".8" fill="#2a3a44"/>
      <rect x="73" y="25" width="11" height="30" rx="1" fill="#0a0c12" stroke="#000"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${75 + (i % 2) * 4.4}" y="${28 + Math.floor(i / 2) * 6}" width="3" height="3.6" rx=".6" fill="${C}" opacity=".85"/>`).join('')}
      <rect x="74" y="58" width="9" height="3" rx="1" fill="#000"/><rect x="74.5" y="62" width="8" height="6" rx="1" fill="${Y}" opacity=".8"/>
      <rect x="36" y="86" width="48" height="14" rx="1.5" fill="#07070b" stroke="#2a2c34"/><rect x="40" y="90" width="12" height="7" rx="1.5" fill="${R}"/>
      ${ntext('DRINK', 60, 118, 5, Y, 'middle', 2, .7)}${fin()}`,
    'rain-alley': () => {
      const sky = U('as');
      return `${cbg('#05060e', '#0a0c18', null)}
      <defs><linearGradient id="${sky}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a4a"/><stop offset="1" stop-color="#ff2a6a" stop-opacity=".55"/></linearGradient></defs>
      <path d="M40 0 H80 L66 62 H54 Z" fill="url(#${sky})"/>${glow(60, 60, 26, R, .5)}
      <path d="M0 0 H40 L54 62 L54 74 L0 120 Z" fill="#0b0d18"/><path d="M120 0 H80 L66 62 L66 74 L120 120 Z" fill="#0d0b18"/>
      <path d="M54 74 H66 L120 120 H0 Z" fill="#05060b"/>
      ${[0, 1, 2, 3, 4].map(i => `<path d="M0 ${f(10 + i * 22)} L54 ${f(30 + i * 9)}" stroke="#181c2c" stroke-width=".8"/><path d="M120 ${f(10 + i * 22)} L66 ${f(30 + i * 9)}" stroke="#1a182c" stroke-width=".8"/>`).join('')}
      <path d="M4 8 L22 20 M4 8 L4 112" stroke="#22283a" stroke-width="1.4"/><path d="M14 16 L14 104" stroke="#1a1f2e" stroke-width="2.4"/>
      <path d="M26 20 L40 30 L40 66 L26 62 Z" fill="#07060c" stroke="${C}" stroke-width="1.1"/><path d="M26 20 L40 30 L40 66 L26 62 Z" fill="none" stroke="${C}" stroke-width="3.6" opacity=".22"/>
      ${['バ', 'ー', 'ル'].map((c, i) => `<text x="33" y="${38 + i * 11}" text-anchor="middle" font-family="'Yu Gothic','Meiryo',sans-serif" font-weight="700" font-size="9" fill="${C}">${c}</text>`).join('')}
      <path d="M82 28 L98 20 L98 36 L82 42 Z" fill="#0a0610" stroke="${R}" stroke-width="1.1"/><path d="M82 28 L98 20 L98 36 L82 42 Z" fill="none" stroke="${R}" stroke-width="3.6" opacity=".25"/><text x="90" y="34" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="7" fill="${R}" transform="rotate(-24 90 32)">HOTEL</text>
      <path d="M86 52 L100 46 L100 56 L86 61 Z" fill="${Y}" opacity=".9"/><path d="M86 52 L100 46 L100 56 L86 61 Z" fill="none" stroke="${Y}" stroke-width="3" opacity=".3"/><text x="93" y="56.5" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="5" fill="${INK}" transform="rotate(-22 93 55)">24H</text>
      <g transform="translate(55.5 58) scale(.12)"><path d="${HEAD}" fill="#020306"/></g><path d="M58 70 L62 70 L63 76 L57 76 Z" fill="#020306"/>
      <path d="M53 62 Q60 54 67 62 Z" fill="${C}" opacity=".9"/><path d="M60 58 V70" stroke="${C}" stroke-width=".6"/><path d="M53 62 Q60 54 67 62" stroke="${C}" stroke-width="2.4" opacity=".3" fill="none"/>
      ${puddle([[33, C, 10], [90, R, 8], [93, Y, 7], [60, R, 10], [60, C, 4]], 80)}
      <g opacity=".5">${[[30, 96, 14], [80, 104, 18], [52, 112, 10]].map(([x, y, w]) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="1.4" fill="none" stroke="#9fdcff" stroke-width=".5"/>`).join('')}</g>
      ${rain(33, 80, .5)}${fin()}`;
    },
    'data-chip': () => {
      const b = U('db');
      return `${cbg('#050a0c', '#0a1a1e', C, 60, 58, 50, .38)}
      <defs><linearGradient id="${b}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ffcff" stop-opacity=".55"/><stop offset="1" stop-color="#0e5a66" stop-opacity=".75"/></linearGradient></defs>
      ${hud(16, 16, 88, 88, C, 10, 1, .6)}
      <g transform="translate(60 60) rotate(-18)">
        <path d="M-22 -34 H16 L24 -26 V34 H-22 Z" fill="url(#${b})" stroke="#bffcff" stroke-width="1.4"/>
        <path d="M-16 -26 V2 L-8 10 V24 M-4 -28 V-6 L6 4 V18 M8 -24 V-12 L16 -4 V12" stroke="#e8ffff" stroke-width=".9" fill="none" opacity=".75"/>
        <circle cx="-8" cy="24" r="1.6" fill="#fff"/><circle cx="6" cy="18" r="1.6" fill="#fff"/><circle cx="16" cy="12" r="1.6" fill="#fff"/>
        <rect x="-20" y="-32" width="26" height="6" fill="${Y}"/><text x="-7" y="-27.4" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="4.6" fill="${INK}">TTP-0X</text>
        ${[...Array(7)].map((_, i) => `<rect x="${-19 + i * 6}" y="28" width="3.6" height="7" fill="${Y}" stroke="${YD}" stroke-width=".5"/>`).join('')}
        <path d="M-20 -22 L20 -22" stroke="#fff" stroke-width=".6" opacity=".5"/>
      </g>${sparks([[90, 30, .5], [28, 88, .45]], '', '#e8ffff')}${fin()}`;
    },
    'credstick': () => {
      const ch = U('ch');
      return `${cbg('#0a0906', '#201a08', Y, 60, 54, 50, .38)}<defs>${chromeDef(ch)}</defs>
      ${[[20, 26, 1], [96, 22, .8], [92, 92, 1.1], [24, 90, .7]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})" opacity=".55">${ntext('¢', 0, 4, 12, Y, 'middle', 0)}</g>`).join('')}
      <g transform="translate(60 62) rotate(-24)">
        <rect x="-40" y="-11" width="80" height="22" rx="4" fill="url(#${ch})" stroke="${INK}" stroke-width="1.4"/>
        <rect x="-32" y="-6" width="46" height="12" rx="1.5" fill="#07080a" stroke="#000"/>${ntext('¢ 9,999', -9, 3.4, 8, C, 'middle', .5)}
        <rect x="20" y="-6" width="14" height="12" rx="2" fill="${Y}" stroke="${YD}"/><path d="M23 -3 h8 M23 0 h8 M23 3 h8" stroke="${INK}" stroke-width=".9"/>
        <rect x="-40" y="-11" width="5" height="22" rx="2" fill="#2a2e38"/><circle cx="-37.5" cy="0" r="1.2" fill="${R}"/>
        <path d="M-30 -9 H30" stroke="#fff" stroke-width="1.2" opacity=".55"/>
      </g>${fin()}`;
    },
    'synth-coffee': () => `${cbg('#0b0708', '#1e1210', R, 60, 40, 46, .22)}
      <rect x="14" y="12" width="40" height="16" rx="2" fill="#07060a" stroke="${C}" stroke-width="1"/><rect x="14" y="12" width="40" height="16" rx="2" fill="none" stroke="${C}" stroke-width="3" opacity=".22"/>${ntext('CAFÉ', 34, 24, 9, C, 'middle', 2)}
      <rect x="0" y="94" width="120" height="26" fill="#140c0c"/><rect x="0" y="94" width="120" height="1.4" fill="${Y}" opacity=".4"/>
      <ellipse cx="66" cy="96" rx="22" ry="4" fill="#000" opacity=".5"/>
      <path d="M46 40 L50 96 Q66 100 82 96 L86 40 Z" fill="#e4e2dc" stroke="${INK}" stroke-width="1.4"/><path d="M46 40 L50 96 Q54 97 56 97 L52 40 Z" fill="#fff" opacity=".4"/>
      <path d="M44 34 H88 L86 42 H46 Z" fill="#2a2a30" stroke="${INK}" stroke-width="1.2"/><rect x="58" y="30" width="16" height="5" rx="1.5" fill="#1a1a20"/>
      <path d="M47.6 56 L84.4 56 L83.4 76 L48.8 76 Z" fill="${Y}" stroke="${INK}" stroke-width="1"/>
      <g transform="translate(57.5 57) scale(.17)"><path d="${HEAD}" fill="${INK}"/></g>${ntext('SYNTH', 74, 70, 6, INK, 'middle', .5)}
      ${[60, 70].map((x, i) => `<path d="M${x} 28 q-5 -7 0 -13 q5 -6 0 -12" stroke="${i ? C : '#fff'}" stroke-width="1.6" fill="none" opacity="${i ? .55 : .4}"/>`).join('')}
      ${puddle([[66, Y, 18]], 98)}${fin()}`,
    'glitch': () => {
      const bands = [[0, 30, 0], [30, 44, 7], [44, 56, -6], [56, 70, 4], [70, 84, -3], [84, 120, 2]];
      const face = (dx, extra = '') => cpony({ x: 16 + dx, y: 14, s: .88, body: '#e8c48c', shade: '#b07d18', mane: '#7a4a20', eye: 'normal', chrome: false, lines: false, led: false, extra });
      return `${cbg('#05050a', '#141020', null)}
      ${bands.map(([a, b, dx], i) => { const cp = U('gc'); return `<defs><clipPath id="${cp}"><rect x="0" y="${a}" width="120" height="${b - a}"/></clipPath></defs><g clip-path="url(#${cp})"><g opacity=".7" style="mix-blend-mode:screen">${face(dx - 3).replace(/#e8c48c|#b07d18|#7a4a20/g, C)}</g><g opacity=".7">${face(dx + 3).replace(/#e8c48c|#b07d18|#7a4a20/g, R)}</g>${face(dx)}</g>`; }).join('')}
      ${blocks(12, 26, [0, 0, 110, 116], [C, R, Y, '#fff'], .8)}
      <rect x="0" y="43" width="120" height="2" fill="#fff" opacity=".6"/><rect x="0" y="69" width="120" height="1.2" fill="${C}" opacity=".8"/>
      ${gtext('ERR_0x3F', 60, 114, 9, '#fff', 'middle', 1)}${fin(.2)}`;
    },
    'graffiti-tag': () => {
      const gr = U('gg'), r = rng(44);
      let spl = ''; for (let i = 0; i < 40; i++) spl += `<circle cx="${f(r() * 120)}" cy="${f(r() * 120)}" r="${f(.3 + r() * 1)}" fill="${[Y, C, R][i % 3]}" opacity="${f(.2 + r() * .4)}"/>`;
      return `${cbg('#16161a', '#0a0a0e', null)}<g opacity=".25">${[...Array(18)].map((_, i) => `<ellipse cx="${f(r() * 120)}" cy="${f(r() * 120)}" rx="${f(6 + r() * 14)}" ry="${f(3 + r() * 6)}" fill="#000"/>`).join('')}</g>
      <path d="M0 40 H120 M0 80 H120 M40 0 V40 M80 40 V80 M30 80 V120" stroke="#000" stroke-width="1" opacity=".4"/>${spl}
      <defs><linearGradient id="${gr}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${YL}"/><stop offset=".55" stop-color="${Y}"/><stop offset="1" stop-color="${R}"/></linearGradient></defs>
      <g transform="translate(60 66) rotate(-9)" font-family="Impact,'Arial Black',sans-serif" font-size="44" text-anchor="middle" letter-spacing="-2">
        <text x="2" y="3" fill="#000" opacity=".7">TTP</text><text x="0" y="0" fill="url(#${gr})" stroke="${INK}" stroke-width="5" paint-order="stroke">TTP</text><text x="0" y="0" fill="none" stroke="${C}" stroke-width=".9" opacity=".9">TTP</text>
      </g>
      <path d="M30 64 v10 a1.5 1.5 0 0 0 3 0 v-10 M54 70 v14 a1.6 1.6 0 0 0 3.2 0 v-14 M82 60 v8 a1.4 1.4 0 0 0 2.8 0 v-8" fill="${Y}"/>
      <path d="M44 30 l6 -10 l4 8 l6 -10 l4 8 l6 -10 v14 h-26 Z" fill="none" stroke="${C}" stroke-width="2" stroke-linejoin="round"/>
      <g transform="translate(96 96) rotate(24)"><rect x="-6" y="-14" width="12" height="26" rx="3" fill="${R}" stroke="${INK}" stroke-width="1.2"/><rect x="-6" y="-6" width="12" height="6" fill="${Y}"/><rect x="-2.4" y="-19" width="4.8" height="5" fill="#9aa2b0" stroke="${INK}"/></g>
      ${fin(.1)}`;
    },
    'smart-gun': () => {
      const ch = U('ch');
      return `${cbg('#07070b', '#1a0c12', R, 96, 30, 40, .3)}<defs>${chromeDef(ch)}</defs>
      <path d="M78 56 Q96 30 102 22 M78 58 Q104 46 102 24 M78 60 Q88 22 102 22" stroke="${C}" stroke-width=".9" stroke-dasharray="2.4 2" fill="none" opacity=".85"/>
      <circle cx="102" cy="23" r="8" fill="none" stroke="${R}" stroke-width="1.2"/><circle cx="102" cy="23" r="3" fill="${R}" opacity=".5"/><path d="M102 11 V16 M102 30 V35 M90 23 H95 M109 23 H114" stroke="${R}" stroke-width="1.2"/>${ntext('LOCK', 102, 44, 5, R, 'middle', 1)}
      <path d="M14 52 H76 L80 56 V64 H14 Z" fill="url(#${ch})" stroke="${INK}" stroke-width="1.4"/>
      <path d="M18 52 V46 H66 L70 52" fill="#2a2e38" stroke="${INK}" stroke-width="1.2"/><rect x="24" y="47.5" width="30" height="3" rx="1" fill="${C}" opacity=".8"/>
      <path d="M20 56 H72" stroke="${Y}" stroke-width="1.8"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${58 + i * 3.4}" y="58" width="1.6" height="4" fill="#20242c"/>`).join('')}
      <path d="M22 64 L18 96 Q18 100 22 100 H34 Q38 100 38 96 L40 64 Z" fill="#1a1c24" stroke="${INK}" stroke-width="1.4"/>${[0, 1, 2, 3].map(i => `<path d="M${22 - i * .6} ${72 + i * 6} H${38 - i * .3}" stroke="#2e323c" stroke-width="1.6"/>`).join('')}
      <path d="M40 64 Q46 76 54 64" fill="none" stroke="${INK}" stroke-width="2.2"/><path d="M44 64 L46 72" stroke="#9aa2b0" stroke-width="1.6"/>
      <rect x="27" y="80" width="4" height="12" rx="1" fill="${Y}"/><circle cx="29" cy="70" r="1.4" fill="${R}"/>
      <rect x="76" y="57" width="6" height="6" fill="#0a0c12"/><circle cx="80" cy="60" r="2" fill="${C}"/><circle cx="80" cy="60" r="5" fill="${C}" opacity=".3"/>${fin()}`;
    },
    'neon-ward': () => {
      const ch = U('ch');
      return `${cbg('#03070a', '#0a1818', C, 60, 40, 46, .32)}<defs>${chromeDef(ch)}</defs>
      ${skyline(81, 74, '#081214', 14, 34, [C, Y], .22, 8, 14)}<rect x="0" y="72" width="120" height="48" fill="#050c0e"/>
      <g stroke="${C}" stroke-width=".5" opacity=".35"><path d="M60 72 L-30 120 M60 72 L150 120 M60 72 L30 120 M60 72 L90 120"/><path d="M0 84 H120 M0 98 H120 M0 114 H120"/></g>
      <ellipse cx="60" cy="102" rx="44" ry="10" fill="${C}" opacity=".08"/><ellipse cx="60" cy="102" rx="44" ry="10" fill="none" stroke="${C}" stroke-width="1.2" opacity=".8"/><ellipse cx="60" cy="102" rx="28" ry="6" fill="none" stroke="${C}" stroke-width=".7" opacity=".55"/>
      <path d="M56 102 L58 54 H62 L64 102 Z" fill="url(#${ch})" stroke="${INK}" stroke-width="1"/><rect x="57.5" y="70" width="5" height="3" fill="${Y}"/><rect x="57.8" y="80" width="4.4" height="2" fill="${Y}" opacity=".7"/>
      <path d="M48 54 L60 46 L72 54 L60 60 Z" fill="#1a2028" stroke="${INK}" stroke-width="1.2"/>
      <circle cx="60" cy="36" r="13" fill="#071012" stroke="url(#${ch})" stroke-width="2.4"/>${glow(60, 36, 26, C, .55)}
      ${neon('M50 36 Q60 26 70 36 Q60 46 50 36 Z', C, 1.4)}<circle cx="60" cy="36" r="3.4" fill="${C}"/><circle cx="60" cy="36" r="1.4" fill="#fff"/>
      ${[[24, 92], [96, 96], [40, 108], [84, 110]].map(([x, y]) => `<rect x="${x}" y="${y}" width="2" height="2" fill="${C}" opacity=".8"/>`).join('')}${fin()}`;
    },
    'cyber-smite': () => {
      const hx = U('hx');
      return `${cbg('#040818', '#0c1c48', C, 60, 58, 54, .3)}
      <defs><pattern id="${hx}" width="12" height="10.4" patternUnits="userSpaceOnUse"><path d="M3 0 H9 L12 5.2 L9 10.4 H3 L0 5.2 Z" fill="none" stroke="${C}" stroke-width=".4" opacity=".25"/></pattern></defs><rect width="120" height="120" fill="url(#${hx})"/>
      <ellipse cx="60" cy="110" rx="50" ry="8" fill="#040a1c"/>
      <path d="M70 6 L38 62 H58 L46 116 L88 48 H64 L80 6 Z" fill="#0a1430" stroke="${Y}" stroke-width="5" stroke-linejoin="round" opacity=".3"/>
      <path d="M70 6 L38 62 H58 L46 116 L88 48 H64 L80 6 Z" fill="#0a1430" stroke="${Y}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M68 14 L56 36 H64 L54 56 M62 62 L56 86 L66 74 M72 52 H66 L76 34 H70" stroke="${YL}" stroke-width="1.1" fill="none"/>
      <circle cx="54" cy="56" r="1.8" fill="${C}"/><circle cx="66" cy="74" r="1.8" fill="${C}"/><circle cx="70" cy="34" r="1.8" fill="${C}"/><circle cx="56" cy="36" r="1.4" fill="#fff"/>
      <path d="M70 6 L56 34 H66 Z" fill="${Y}" opacity=".45"/>${blocks(2, 10, [18, 20, 84, 80], [C, Y], .7)}
      ${sparks([[20, 30, .8], [98, 24, .7], [100, 82, .8], [16, 86, .6]], '', YL)}${fin()}`;
    },
    'hacked-minion': () => {
      const bd = U('mb');
      return `${cbg('#070910', '#141a26', R, 60, 54, 50, .34)}
      ${blocks(9, 18, [0, 0, 118, 116], [C, R], .55)}
      <defs><radialGradient id="${bd}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#6a8ae8"/><stop offset=".6" stop-color="#3a5aa8"/><stop offset="1" stop-color="#1a2a5a"/></radialGradient></defs>
      <ellipse cx="60" cy="108" rx="30" ry="5" fill="#000" opacity=".5"/>
      <path d="M36 70 Q30 82 34 96 M84 70 Q92 80 88 96" stroke="#1a2440" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M36 70 Q30 82 34 96" stroke="${C}" stroke-width="1.2" fill="none"/>
      <ellipse cx="60" cy="72" rx="26" ry="32" fill="url(#${bd})" stroke="${INK}" stroke-width="2"/>
      <path d="M33 60 Q60 18 87 60 Q60 54 33 60 Z" fill="#232838" stroke="${INK}" stroke-width="2"/><path d="M40 52 Q60 30 80 52" stroke="#4a5266" stroke-width="2" fill="none"/><path d="M60 40 V46" stroke="${Y}" stroke-width="2"/>
      <path d="M36 60 Q60 54 84 60 L82 70 Q60 66 38 70 Z" fill="#05060a" stroke="${INK}" stroke-width="1.2"/>
      <path d="M40 64 Q60 59 80 64" stroke="${R}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M40 64 Q60 59 80 64" stroke="${R}" stroke-width="8" stroke-linecap="round" fill="none" opacity=".25"/><path d="M44 63.4 Q60 59.6 76 63.4" stroke="#ffd0d6" stroke-width=".8" fill="none"/>
      <path d="M48 84 L54 80 L60 84 L66 80 L72 84" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
      <path d="M68 42 L76 20" stroke="#9aa2b0" stroke-width="1.6"/><circle cx="76" cy="19" r="2.4" fill="${R}" class="c-blink"/><circle cx="76" cy="19" r="5.4" fill="${R}" opacity=".3"/>
      <path d="M46 74 L50 80 L46 88 M76 76 L72 82" stroke="${C}" stroke-width="1" fill="none"/><circle cx="46" cy="88" r="1.4" fill="${C}"/>
      <rect x="20" y="62" width="80" height="2.4" fill="${C}" opacity=".35"/><rect x="26" y="80" width="64" height="1.6" fill="${R}" opacity=".35"/>
      <g transform="translate(98 98)"><path d="M0 -10 L10 8 H-10 Z" fill="${Y}" stroke="${INK}" stroke-width="1.2"/><text x="0" y="5.4" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="10" fill="${INK}">!</text></g>
      ${gtext('PWNED', 40, 114, 10, C, 'middle', 1)}${fin(.18)}`;
    }
  };

  // Pop-out-Figuren der Animated Rares (eigene Ebene ueber der Karte)
  const POP = {
    'netrunner': () => `<g class="a-float">
      <path d="M76 98 C78 110 96 112 116 116" stroke="#14161c" stroke-width="4" fill="none"/><path d="M76 98 C78 110 96 112 116 116" stroke="${C}" stroke-width="1.1" fill="none"/>
      <path d="M62 98 C54 110 30 112 6 116" stroke="#14161c" stroke-width="4" fill="none"/><path d="M62 98 C54 110 30 112 6 116" stroke="${Y}" stroke-width="1.1" fill="none"/>
      ${cpony({ x: 14, y: 10, s: .9, body: '#4a505e', shade: '#12151c', mane: C, eye: 'visor', eyeC: C })}
      <rect x="88" y="44" width="7" height="5" rx="1" fill="#2a2e38" stroke="${INK}"/><path d="M95 46.5 Q104 48 106 60" stroke="${R}" stroke-width="1.6" fill="none"/>
      ${[[100, 20, 1], [108, 36, .7], [96, 8, .6]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-5 -3 L0 -6 L5 -3 V3 L0 6 L-5 3 Z" fill="${C}" opacity=".2" stroke="${C}" stroke-width="1"/><circle r="1.4" fill="#e8ffff"/></g>`).join('')}
    </g>`,
    'neon-overdrive': () => `<g class="a-float">
      <ellipse cx="58" cy="102" rx="46" ry="5" fill="${C}" opacity=".45"/><ellipse cx="58" cy="102" rx="30" ry="2.6" fill="#e8ffff" opacity=".7"/>
      ${cpony({ x: 28, y: 14, s: .64, body: '#3a3f4a', shade: '#0e1016', mane: R, eye: 'visor', eyeC: Y, chrome: true, lines: false })}
      <path d="M84 30 L112 26 M86 40 L116 40 M84 50 L110 54" stroke="${R}" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>
      <path d="M6 88 L30 78 L62 74 L96 70 L113 74 L109 86 L84 93 L30 95 Z" fill="#14161e" stroke="${INK}" stroke-width="1.4"/>
      <path d="M10 87 L32 79 L64 75 L70 81 L34 87 Z" fill="${Y}"/><path d="M70 81 L96 72 L105 74 L74 85 Z" fill="${R}"/>
      <path d="M28 79 L42 66 L56 70 L46 77 Z" fill="${C}" opacity=".7" stroke="${INK}"/><path d="M32 77 L42 68" stroke="#fff" stroke-width="1" opacity=".7"/>
      <rect x="108" y="75" width="4" height="7" fill="${R}"/><circle cx="110" cy="78" r="6" fill="${R}" opacity=".3"/>
      <path d="M6 88 L3 89" stroke="${YL}" stroke-width="2"/>
      ${[30, 86].map(x => `<ellipse cx="${x}" cy="96" rx="11" ry="3.4" fill="#0a0c12" stroke="${INK}"/><ellipse cx="${x}" cy="98" rx="9" ry="2.2" fill="${C}"/>`).join('')}
      ${ntext('TTP', 50, 90, 5, INK, 'middle', 1)}
    </g>`
  };


  // ---------- Full Arts (v6.6.0, Nutzerauswahl) ----------
  // Vollbild-Szene 120x168 (Kartenformat) + Hologramm-Figur (120x120).
  const hexP = (cx, cy, r) => 'M' + [0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI / 3 * i - Math.PI / 2; return `${f(cx + Math.cos(a) * r)} ${f(cy + Math.sin(a) * r)}`; }).join(' L') + ' Z';
  const faFin = () => { const v = U('fv'), p = U('fp'); return `<defs><radialGradient id="${v}" cx=".5" cy=".45" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
      <pattern id="${p}" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".14"/></pattern></defs><rect width="120" height="168" fill="url(#${p})"/><rect width="120" height="168" fill="url(#${v})"/>`; };
  const fcb = (top, mid, bottom) => { const a = U('fcb'); return `<defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="120" height="168" fill="url(#${a})"/>`; };
  const errWin = (x, y, w, title, body, c1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect width="${w}" height="22" fill="#07080c" stroke="${c1}" stroke-width="1.1"/><rect width="${w}" height="6" fill="${c1}"/><text x="2" y="4.8" font-family="${FONT}" font-weight="700" font-size="4.4" fill="${INK}">${title}</text><text x="${w / 2}" y="16" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="6.4" fill="${c1}">${body}</text></g>`;
  const miniDrone = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 -2 H12 M-12 -2 L-16 -6 M12 -2 L16 -6" stroke="#2a2e38" stroke-width="2.4"/><ellipse cx="-16" cy="-7" rx="6" ry="1.4" fill="#9aa2b0" opacity=".4"/><ellipse cx="16" cy="-7" rx="6" ry="1.4" fill="#9aa2b0" opacity=".4"/><path d="M-7 -2 L-4 -6 H4 L7 -2 L4 2 H-4 Z" fill="#20242e" stroke="${INK}"/><circle cx="0" cy="2" r="2.2" fill="${R}"/></g>`;
  const FA_ART = {
    'breach-protocol': () => {
      const codes = ['1C', '55', 'BD', 'E9', '7A', 'FF'], r = rng(23); let grid = '';
      for (let j = 0; j < 15; j++) for (let i = 0; i < 6; i++) { const col = i === 2 || i === 3; grid += `<text x="${12 + i * 19.2}" y="${f(14 + j * 10.6)}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="6.4" fill="${col ? C : '#b8a82a'}" opacity="${f((col ? .7 : .35) * (.5 + r() * .5))}">${codes[Math.floor(r() * 6)]}</text>`; }
      return `${fcb('#030405', '#0c120e', '#020302')}${glow(60, 80, 70, Y, .1)}${grid}${blocks(31, 14, [0, 0, 120, 168], [Y, C], .35)}${faFin()}`;
    },
    'street-samurai': () => `${fcb('#05050b', '#2a0a16', '#08030a')}${glow(70, 56, 70, R, .42, 'a-pulse')}${skyline(41, 150, '#120a16', 40, 96, [R, Y], .16, 9, 16)}
      <rect x="0" y="146" width="120" height="22" fill="#07060a"/>${[20, 60, 98].map(x => `<rect x="${x - 6}" y="148" width="12" height="20" fill="${R}" opacity=".12"/>`).join('')}
      <g transform="translate(0 40)">${rain(13, 60, .42)}</g>${rain(17, 40, .35)}${faFin()}`,
    'surveillance-drone': () => `${fcb('#05070f', '#120c1c', '#030308')}${glow(60, 40, 50, R, .25)}${skyline(71, 168, '#0c0a16', 40, 84, [Y, C], .24, 8, 14)}
      <path d="M54 66 L14 168 H106 L66 66 Z" fill="${Y}" opacity=".12"/><path d="M54 66 L14 168 M66 66 L106 168" stroke="${Y}" stroke-width=".6" opacity=".5"/>
      <ellipse cx="60" cy="160" rx="40" ry="6" fill="none" stroke="${Y}" stroke-width=".9" opacity=".7"/>${hud(46, 146, 28, 18, R, 4, 1)}<circle cx="60" cy="156" r="3" fill="${R}" opacity=".7"/>${faFin()}`,
    'rain-alley': () => {
      const sky = U('fas');
      return `${fcb('#05060e', '#0a0c18', '#04050a')}<defs><linearGradient id="${sky}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a4a"/><stop offset="1" stop-color="#ff2a6a" stop-opacity=".55"/></linearGradient></defs>
      <path d="M38 0 H82 L66 92 H54 Z" fill="url(#${sky})"/>${glow(60, 90, 30, R, .5)}
      <path d="M0 0 H38 L54 92 L54 104 L0 168 Z" fill="#0b0d18"/><path d="M120 0 H82 L66 92 L66 104 L120 168 Z" fill="#0d0b18"/><path d="M54 104 H66 L120 168 H0 Z" fill="#05060b"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M0 ${f(8 + i * 24)} L54 ${f(30 + i * 11)}" stroke="#181c2c" stroke-width=".8"/><path d="M120 ${f(8 + i * 24)} L66 ${f(30 + i * 11)}" stroke="#1a182c" stroke-width=".8"/>`).join('')}
      ${[[30, '#5ef0f0'], [60, '#ff2a4a'], [92, '#e8d43a']].map(([x, col]) => `<rect x="${x - 7}" y="140" width="14" height="28" fill="${col}" opacity=".14"/>`).join('')}
      <g transform="translate(0 30)">${rain(29, 60, .45)}</g>${rain(3, 40, .4)}${faFin()}`;
    },
    'smart-gun': () => `${fcb('#07070b', '#1a0a12', '#050307')}${glow(96, 30, 50, R, .3)}${skyline(19, 168, '#100810', 30, 70, [R, Y], .2, 8, 15)}
      ${[[18, 120], [44, 132], [86, 126]].map(([x, y]) => `<g transform="translate(${x} ${y}) scale(.5)" opacity=".6"><path d="${HEAD}" fill="#05060a"/></g>`).join('')}${rain(41, 30, .3)}${faFin()}`,
    'hacked-minion': () => `${fcb('#070910', '#101624', '#04060a')}
      ${[4, 92].map(x => `<rect x="${x}" y="10" width="24" height="150" fill="#0c0f18" stroke="#1a2030" stroke-width="1"/>${[...Array(14)].map((_, i) => `<rect x="${x + 3}" y="${14 + i * 10.4}" width="18" height="7" fill="#141a26"/><circle class="c-blink${i % 3 ? ' d' + (i % 3) : ''}" cx="${x + 18}" cy="${17.5 + i * 10.4}" r="1" fill="${i % 4 ? C : R}"/>`).join('')}`).join('')}
      ${glow(60, 70, 50, R, .3, 'a-pulse')}${blocks(9, 26, [0, 0, 118, 166], [C, R], .5)}${faFin()}`,
    'netrunner': () => {
      const r = rng(11); let cols = '';
      const glyph = '01アイウエオカキクケコサシスセソ7F3A';
      for (let x = 3; x < 120; x += 8) {
        const len = 8 + Math.floor(r() * 12), y0 = r() * 168;
        for (let k = 0; k < len; k++) {
          const ch = glyph[Math.floor(r() * glyph.length)], yy = (y0 + k * 8) % 168, op = k === len - 1 ? 1 : .12 + k / len * .5;
          const t = `<text x="${x}" y="${f(yy)}" font-size="6.5" font-family="'Yu Gothic',${FONT}" fill="${k === len - 1 ? '#e8ffff' : C}" opacity="${f(op)}">${ch}</text>`;
          cols += t + t.replace(`y="${f(yy)}"`, `y="${f(yy - 168)}"`);
        }
      }
      const b = U('fnb');
      return `<defs><linearGradient id="${b}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#01040a"/><stop offset=".55" stop-color="#06202c"/><stop offset="1" stop-color="#020509"/></linearGradient></defs>
        <rect width="120" height="168" fill="url(#${b})"/>
        <g class="c-rain-fa" opacity=".5">${cols}</g>
        <g opacity=".9">${skyline(3, 132, '#06141c', 34, 78, [C, Y], .2)}</g>
        ${glow(60, 74, 64, C, .38, 'a-pulse')}
        <g fill="none" stroke-linecap="round">
          <path d="M22 0 C22 26 40 34 48 52" stroke="#10141c" stroke-width="3.4"/><path d="M22 0 C22 26 40 34 48 52" stroke="${C}" stroke-width=".9"/>
          <path d="M98 0 C98 24 82 36 74 50" stroke="#10141c" stroke-width="3.4"/><path d="M98 0 C98 24 82 36 74 50" stroke="${Y}" stroke-width=".9"/>
          <path d="M60 0 V30" stroke="#10141c" stroke-width="3"/><path d="M60 0 V30" stroke="${R}" stroke-width=".8"/></g>
        <circle class="c-blink" cx="48" cy="52" r="1.6" fill="${C}"/><circle class="c-blink d2" cx="74" cy="50" r="1.6" fill="${Y}"/>
        ${skyline(9, 168, '#020508', 10, 30, [C, Y, R], .3)}
        <g transform="translate(0 48)">${rain(5, 26, .22)}</g>${rain(8, 20, .2)}
        ${hud(5, 5, 110, 158, C, 10, 1, .65)}${ntext('JACK-IN // DEEP DIVE', 10, 13, 4.4, C, 'start', .8, .85)}${ntext('SYNC 99%', 110, 13, 4.4, Y, 'end', .5, .85)}
        ${faFin()}`;
    }
  };
  // Mittlere Ebene (Nutzer): Portal, Schilder und Kabel schweben zwischen Szene und Figur
  const FA_MID = {
    'breach-protocol': () => `<rect x="8" y="8" width="104" height="12" fill="${Y}"/><text x="11" y="16.4" font-family="${FONT}" font-weight="700" font-size="5.4" fill="${INK}" letter-spacing=".6">BREACH // CODE MATRIX</text><text x="109" y="16.4" text-anchor="end" font-family="${FONT}" font-weight="700" font-size="5.4" fill="${INK}">00:14</text>
      <g font-family="${FONT}" font-weight="700" font-size="6" text-anchor="middle">${['1C', 'E9', '55', '--'].map((t, i) => `<rect x="${10 + i * 15}" y="24" width="13" height="10" fill="#07080a" stroke="${i < 3 ? C : '#3a4440'}" stroke-width=".9"/><text x="${16.5 + i * 15}" y="31.2" fill="${i < 3 ? C : '#3a4440'}">${t}</text>`).join('')}</g>
      <rect x="49" y="40" width="22" height="86" fill="none" stroke="${C}" stroke-width="1.2"/><rect x="49" y="40" width="22" height="86" fill="none" stroke="${C}" stroke-width="4" opacity=".2"/>
      <rect x="8" y="131" width="104" height="3" fill="#2a1014"/><rect class="a-pulse" x="8" y="131" width="66" height="3" fill="${R}"/>`,
    'street-samurai': () => `${vsign(102, 10, 'サムライ', R, 12)}${neon('M8 118 Q40 70 112 40', R, 1.8)}
      ${[[20, 30], [30, 60], [100, 120], [88, 136], [14, 100]].map(([x, y], i) => `<path transform="translate(${x} ${y}) rotate(${i * 40})" d="M0 -3 Q3 0 0 3 Q-3 0 0 -3 Z" fill="#ff8ab0" opacity=".85"/>`).join('')}`,
    'surveillance-drone': () => `${miniDrone(18, 26, .8)}${miniDrone(102, 40, .7)}${hud(8, 96, 26, 20, R, 4, 1)}${hud(86, 104, 24, 18, Y, 4, 1)}${ntext('TRACKING', 21, 124, 4.4, R, 'middle', 1)}${ntext('ID: TTP', 98, 128, 4.4, Y, 'middle', 1)}`,
    'rain-alley': () => `<g transform="translate(0 16)">
      <path d="M26 20 L40 30 L40 66 L26 62 Z" fill="#07060c" stroke="${C}" stroke-width="1.1"/><path d="M26 20 L40 30 L40 66 L26 62 Z" fill="none" stroke="${C}" stroke-width="3.6" opacity=".22"/>
      ${['バ', 'ー', 'ル'].map((c, i) => `<text x="33" y="${38 + i * 11}" text-anchor="middle" font-family="'Yu Gothic','Meiryo',sans-serif" font-weight="700" font-size="9" fill="${C}">${c}</text>`).join('')}
      <path d="M82 28 L98 20 L98 36 L82 42 Z" fill="#0a0610" stroke="${R}" stroke-width="1.1"/><path d="M82 28 L98 20 L98 36 L82 42 Z" fill="none" stroke="${R}" stroke-width="3.6" opacity=".25"/><text x="90" y="34" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="7" fill="${R}" transform="rotate(-24 90 32)">HOTEL</text>
      <path d="M86 52 L100 46 L100 56 L86 61 Z" fill="${Y}" opacity=".9"/><path d="M86 52 L100 46 L100 56 L86 61 Z" fill="none" stroke="${Y}" stroke-width="3" opacity=".3"/><text x="93" y="56.5" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="5" fill="${INK}" transform="rotate(-22 93 55)">24H</text>
      </g>`,
    'smart-gun': () => `${[[102, 26], [22, 22], [100, 108]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${R}" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="3" fill="${R}" opacity=".5"/><path d="M${x} ${y - 12} V${y - 7} M${x} ${y + 7} V${y + 12} M${x - 12} ${y} H${x - 7} M${x + 7} ${y} H${x + 12}" stroke="${R}" stroke-width="1.2"/>${ntext('LOCK', x, y + 20, 4.6, R, 'middle', 1)}`).join('')}
      <path d="M80 66 Q96 40 102 26 M80 68 Q50 30 22 22 M80 70 Q104 90 100 108" stroke="${C}" stroke-width="1" stroke-dasharray="2.4 2" fill="none" opacity=".9"/>`,
    'hacked-minion': () => `${errWin(8, 22, 46, 'SYS.ERR', 'ERR_0x3F', R, -6)}${errWin(74, 96, 40, 'ICE', 'PWNED', C, 5)}${errWin(6, 104, 50, 'NET', 'ACCESS DENIED', R, -4)}`,
    'netrunner': () => `
        <g class="a-spin" style="transform-origin:60px 74px">${neon(hexP(60, 74, 47), C, 1.1)}${[0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI / 3 * i - Math.PI / 2; return `<circle cx="${f(60 + Math.cos(a) * 47)}" cy="${f(74 + Math.sin(a) * 47)}" r="1.8" fill="#e8ffff"/>`; }).join('')}</g>
        <g class="a-spin-rev" style="transform-origin:60px 74px">${neon(hexP(60, 74, 37), Y, .8)}<path d="${hexP(60, 74, 29)}" fill="none" stroke="${C}" stroke-width=".6" stroke-dasharray="2 3" opacity=".7"/></g>
        ${vsign(4, 20, 'ネット', C, 10)}${vsign(106, 46, '電脳', Y, 10)}
`
  };
  const FA_POP = {
    'breach-protocol': () => `<g class="a-float">${cpony({ x: 20, y: 24, s: .78, body: '#3a3f4a', shade: '#0e1016', mane: Y, eye: 'optic', eyeC: C })}
      <g transform="translate(6 92) rotate(-8)"><rect width="34" height="18" rx="2" fill="${C}" opacity=".18" stroke="${C}" stroke-width="1"/>${[0, 1, 2].map(i => `<rect x="${4 + i * 10}" y="5" width="7" height="8" fill="none" stroke="${C}" stroke-width=".8"/>`).join('')}</g></g>`,
    'street-samurai': () => { const ch = U('ch'); return `<defs>${chromeDef(ch)}</defs><g class="a-float">
        ${cpony({ x: 6, y: 18, s: .8, body: '#2a2d38', shade: '#07080c', mane: '#16181f', eye: 'optic', eyeC: R, chrome: true, lines: false, led: false })}
        <path d="${HEAD}" transform="translate(6 18) scale(.8)" fill="none" stroke="${R}" stroke-width="2" opacity=".9"/><path d="${MANE}" transform="translate(6 18) scale(.8)" fill="none" stroke="${R}" stroke-width="1.6" opacity=".7"/>
        <path d="M24 120 L34 92 L52 82 L80 92 L90 120 Z" fill="#101118" stroke="#000" stroke-width="1.2"/><path d="M34 92 L52 82 L56 104 Z" fill="#1d1f28"/><path d="M80 92 L52 82 L62 106 Z" fill="#171920"/><path d="M34 92 L52 82 L80 92" stroke="${Y}" stroke-width="1.3" fill="none"/><path d="M80 92 L90 120" stroke="${R}" stroke-width="1" opacity=".7"/>
        <g transform="translate(56 76) rotate(-50)">
          <rect x="-40" y="-3.6" width="28" height="7.2" rx="1.6" fill="#0e0e14" stroke="#000" stroke-width=".8"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${-38 + i * 5.2} 0 L${-35.4 + i * 5.2} -3 L${-32.8 + i * 5.2} 0 L${-35.4 + i * 5.2} 3 Z" fill="${Y}"/>`).join('')}
          <rect x="-12" y="-8" width="3.6" height="16" rx="1.4" fill="url(#${ch})" stroke="#000" stroke-width=".7"/>
          <path d="M-8 -3 L62 -3 Q70 -2 73 1.5 L62 3 L-8 3 Z" fill="url(#${ch})" stroke="#000" stroke-width=".6"/><path d="M-8 -1 L62 -1" stroke="#fff" stroke-width=".7" opacity=".7"/>
          <path d="M-8 3 L62 3 L73 1.5" stroke="${R}" stroke-width="7" opacity=".22" fill="none"/><path d="M-8 3 L62 3 L73 1.5" stroke="${R}" stroke-width="1.8" fill="none"/><path d="M-8 2.8 L62 2.8 L73 1.4" stroke="#ffe0e4" stroke-width=".5" fill="none"/>
        </g>
      </g>`; },
    'surveillance-drone': () => `<g class="a-float"><g transform="translate(60 46) scale(1.12) translate(-60 -38)">
      ${[[30, 28], [90, 28], [36, 44], [84, 44]].map(([x, y]) => `<line x1="60" y1="36" x2="${x}" y2="${y}" stroke="#2a2e38" stroke-width="3"/><ellipse cx="${x}" cy="${y - 2}" rx="11" ry="2.2" fill="#9aa2b0" opacity=".35"/><circle cx="${x}" cy="${y}" r="2.4" fill="#1a1d24" stroke="${INK}"/>`).join('')}
      <path d="M46 36 L52 28 H68 L74 36 L68 44 H52 Z" fill="#20242e" stroke="${INK}" stroke-width="1.3"/><path d="M52 28 H68" stroke="${Y}" stroke-width="1.2"/>
      <circle cx="60" cy="44" r="5.4" fill="#0a0c12" stroke="#9aa2b0" stroke-width="1.2"/><circle cx="60" cy="44" r="2.8" fill="${R}"/><circle cx="60" cy="44" r="7" fill="${R}" opacity=".25"/><circle cx="59" cy="43" r=".9" fill="#fff"/>
      <circle cx="30" cy="28" r="1" fill="${R}"/><circle cx="90" cy="28" r="1" fill="${C}"/>      </g></g>`,
    'rain-alley': () => `<g class="a-float">${cpony({ x: 28, y: 50, s: .62, body: '#2a2d38', shade: '#07080c', mane: C, eye: 'visor', eyeC: C, chrome: false, lines: false, led: false })}
      <g transform="translate(0 -2)"><path d="M62 30 V44" stroke="#9aa2b0" stroke-width="1.8" fill="none"/>
      <path d="M14 34 Q62 -14 110 34 Z" fill="#07060c"/>${neon('M14 34 Q62 -14 110 34', C, 1.4)}<path d="M14 34 Q26 28 38 34 Q50 28 62 34 Q74 28 86 34 Q98 28 110 34" stroke="${C}" stroke-width="1" fill="none"/>
      ${[[16, 44], [38, 46], [86, 46], [108, 44]].map(([x, y]) => `<path d="M${x} ${y} l-1 5" stroke="#9fdcff" stroke-width="1" opacity=".7"/>`).join('')}</g></g>`,
    'smart-gun': () => { const ch = U('ch'); return `<defs>${chromeDef(ch)}</defs><g class="a-float"><g transform="translate(60 64) scale(1.25) rotate(-6) translate(-48 -72)">
      <path d="M14 52 H76 L80 56 V64 H14 Z" fill="url(#${ch})" stroke="${INK}" stroke-width="1.4"/>
      <path d="M18 52 V46 H66 L70 52" fill="#2a2e38" stroke="${INK}" stroke-width="1.2"/><rect x="24" y="47.5" width="30" height="3" rx="1" fill="${C}" opacity=".8"/>
      <path d="M20 56 H72" stroke="${Y}" stroke-width="1.8"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${58 + i * 3.4}" y="58" width="1.6" height="4" fill="#20242c"/>`).join('')}
      <path d="M22 64 L18 96 Q18 100 22 100 H34 Q38 100 38 96 L40 64 Z" fill="#1a1c24" stroke="${INK}" stroke-width="1.4"/>${[0, 1, 2, 3].map(i => `<path d="M${22 - i * .6} ${72 + i * 6} H${38 - i * .3}" stroke="#2e323c" stroke-width="1.6"/>`).join('')}
      <path d="M40 64 Q46 76 54 64" fill="none" stroke="${INK}" stroke-width="2.2"/><path d="M44 64 L46 72" stroke="#9aa2b0" stroke-width="1.6"/>
      <rect x="27" y="80" width="4" height="12" rx="1" fill="${Y}"/><circle cx="29" cy="70" r="1.4" fill="${R}"/>
      <rect x="76" y="57" width="6" height="6" fill="#0a0c12"/><circle cx="80" cy="60" r="2" fill="${C}"/><circle cx="80" cy="60" r="5" fill="${C}" opacity=".3"/>      </g></g>`; },
    'hacked-minion': () => { const bd = U('mb'); return `<defs><radialGradient id="${bd}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#6a8ae8"/><stop offset=".6" stop-color="#3a5aa8"/><stop offset="1" stop-color="#1a2a5a"/></radialGradient></defs><g class="a-float"><g transform="translate(0 -6)">
      <path d="M36 70 Q30 82 34 96 M84 70 Q92 80 88 96" stroke="#1a2440" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M36 70 Q30 82 34 96" stroke="${C}" stroke-width="1.2" fill="none"/>
      <ellipse cx="60" cy="72" rx="26" ry="32" fill="url(#${bd})" stroke="${INK}" stroke-width="2"/>
      <path d="M33 60 Q60 18 87 60 Q60 54 33 60 Z" fill="#232838" stroke="${INK}" stroke-width="2"/><path d="M40 52 Q60 30 80 52" stroke="#4a5266" stroke-width="2" fill="none"/><path d="M60 40 V46" stroke="${Y}" stroke-width="2"/>
      <path d="M36 60 Q60 54 84 60 L82 70 Q60 66 38 70 Z" fill="#05060a" stroke="${INK}" stroke-width="1.2"/>
      <path d="M40 64 Q60 59 80 64" stroke="${R}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M40 64 Q60 59 80 64" stroke="${R}" stroke-width="8" stroke-linecap="round" fill="none" opacity=".25"/><path d="M44 63.4 Q60 59.6 76 63.4" stroke="#ffd0d6" stroke-width=".8" fill="none"/>
      <path d="M48 84 L54 80 L60 84 L66 80 L72 84" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
      <path d="M68 42 L76 20" stroke="#9aa2b0" stroke-width="1.6"/><circle cx="76" cy="19" r="2.4" fill="${R}" class="c-blink"/><circle cx="76" cy="19" r="5.4" fill="${R}" opacity=".3"/>
      <path d="M46 74 L50 80 L46 88 M76 76 L72 82" stroke="${C}" stroke-width="1" fill="none"/><circle cx="46" cy="88" r="1.4" fill="${C}"/>
      </g></g>`; },
    'netrunner': () => POP['netrunner']()
  };

  const LIST = [
    ['netrunner', 'Netrunner Pony'], ['neon-overdrive', 'Neon Overdrive'],
    ['chrome-hoof', 'Chrome Hoof'], ['megacity', 'Megacity'], ['breach-protocol', 'Breach Protocol'], ['street-samurai', 'Street Samurai'],
    ['noodle-bar', 'Neon Noodle Bar'], ['flying-car', 'Flying Car'], ['hologram-ad', 'Hologram Ad'], ['back-alley-clinic', 'Back-Alley Clinic'], ['surveillance-drone', 'Surveillance Drone'], ['overclocked-flash', 'Overclocked Flash'], ['chrome-baron', 'Chrome Baron'],
    ['neon-sign', 'Neon Sign'], ['vending-machine', 'Vending Machine'], ['rain-alley', 'Rain Alley'], ['data-chip', 'Data Chip'], ['credstick', 'Credstick'], ['synth-coffee', 'Synth Coffee'],
    ['glitch', 'Glitch'], ['graffiti-tag', 'Graffiti Tag'], ['smart-gun', 'Smart Gun'], ['neon-ward', 'Neon Ward'], ['cyber-smite', 'Cyber Smite'], ['hacked-minion', 'Hacked Minion']
  ];
  // seltenste zuerst: #1-2 animated, #3-6 holo, #7-13 uncommon, #14-25 common
  const rarityOf = n => n <= 2 ? 'anim' : n <= 6 ? 'holo' : n <= 13 ? 'uncommon' : 'common';
  const SET = LIST.map(([id, name], i) => ({ n: i + 1, id, name, r: rarityOf(i + 1) }));
  const { RL, RC } = BASE;

  const art = id => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${ART[id]()}</svg>`;
  const SLABS = 12;
  const popLayers = (id, src = POP) => {
    const svg = src[id](), wrap = c => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${c}</svg>`;
    let out = `<div class="pop-shadow">${wrap(svg)}</div>`;
    for (let k = 0; k < SLABS; k++) {
      const fl = U('dl');
      out += `<div class="pop slab" style="--i:${k};--shade:${(.28 + k / SLABS * .3).toFixed(2)}">${wrap(`<defs><filter id="${fl}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="1.6"/></filter></defs><g filter="url(#${fl})">${svg}</g>`)}</div>`;
    }
    return out + `<div class="pop" style="--i:${SLABS}">${wrap(svg)}</div>`;
  };
  const frontHtml = s => `<div class="face front cy r-${s.r}" style="--rc:${RC[s.r]}">
      <div class="art">${art(s.id)}</div>
      ${POP[s.id] ? popLayers(s.id) : ''}
      <div class="name">${s.name}</div>
      <div class="meta"><span class="rar">${RL[s.r]}</span><span>ND·${String(s.n).padStart(3, '0')}</span></div>
    </div>`;

  const CSS = `
  /* Special Set: Karte dunkel + Gitter, gelber Datenstreifen oben, technische Schrift */
  .front.cy.r-common { background: linear-gradient(160deg, #141720, #07080c) padding-box, linear-gradient(135deg, #e6ecf5, #7a8496 45%, #d8dee8 70%, #6a7486) border-box; }
  .front.cy.r-uncommon { background: radial-gradient(circle at 50% 35%, #0e2a22, #07080c 70%) padding-box, linear-gradient(135deg, #b8ffd8, #2a8a4a 40%, #8affc0 65%, #1e6a3a) border-box; }
  .front.cy.r-holo { background: linear-gradient(160deg, #1a1626, #07080c) padding-box, linear-gradient(var(--hb, 0deg), #ff7ad9, #ffd36b, #7bffb4, #6bc8ff, #b98cff, #ff7ad9) border-box; }
  .front.cy.r-anim { background: radial-gradient(circle at 50% 30%, #2a0a14, #07080c 70%) padding-box, linear-gradient(var(--hb, 0deg), #ff5ab4, #ffd36b, #ff5ab4, #b98cff, #ff5ab4) border-box; }
  .front.cy::before { content: ''; position: absolute; left: 6%; right: 6%; top: 2.4%; height: 1.6%; background: repeating-linear-gradient(90deg, ${Y} 0 7%, transparent 7% 9%, ${Y} 9% 11%, transparent 11% 14%); opacity: .85; border-radius: 1px; }
  .front.cy .name { font-family: ${FONT}; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-size: .64em; }
  .front.cy .meta { font-family: ${FONT}; letter-spacing: .5px; }
  .c-rain { animation: cRain 5s linear infinite; }
  .c-rain-fa { animation: cRainFa 7s linear infinite; }
  @keyframes cRainFa { from { transform: translateY(0); } to { transform: translateY(168px); } }
  .a-spin-rev { animation: aSpin 10s linear infinite reverse; transform-box: view-box; }
  @keyframes cRain { from { transform: translateY(0); } to { transform: translateY(120px); } }
  .c-speed { animation: cSpeed .9s linear infinite; }
  @keyframes cSpeed { from { transform: translateX(0); } to { transform: translateX(120px); } }
  .c-blink { animation: cBlink 1.4s steps(2, jump-none) infinite; }
  .c-blink.d1 { animation-delay: .35s; } .c-blink.d2 { animation-delay: .7s; }
  @keyframes cBlink { 0% { opacity: 1; } 100% { opacity: .15; } }
  `;
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

  // Nur das Sticker-Quadrat (ohne Traegerkarte) - fuers Profil; CSS dafuer kommt aus der App (stickers.js)
  const square = s => `<div class="stk-square r-${s.r}">${art(s.id)}${POP[s.id] ? `<div class="stk-sq-pop"><svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${POP[s.id]()}</svg></div>` : ''}</div>`;

  // Sticker-Quadrat mit echter Hologramm-Figur wie im Album (v6.5.0): Animated
  // Rares bekommen Schatten + Schichten (popLayers), tiltTo hebt sie an.
  const square3d = s => POP[s.id] ? `<div class="stk-sq3d r-${s.r}"><div class="stk-square r-${s.r}">${art(s.id)}</div>${popLayers(s.id)}</div>` : square(s);
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
  window.STICKERS_CYBER = { id: 'neon', name: 'Neon District', special: true, SET, RL, RC, art, frontHtml, square, square3d, TOTAL: SET.length, faArt, faPop, faPopFlat, faMid, faMidFlat };
  window.STICKER_SETS = window.STICKER_SETS || {};
  window.STICKER_SETS.neon = window.STICKERS_CYBER;
})();
