// Three-Trick-Pony - Promo-Sticker (v6.18.0, Nutzer 2026-11-27).
// AUTOMATISCH aus theme-lab/promo-binder.html erzeugt (scratchpad build-promos.js):
// Kunst + Kartenaufbau der 12 Promos. Gewaehlt: Hall of Gods = Tempel (A),
// Dragon's Hoard = Drache C (Winged Wyrm, Rayquaza-Stil), The Climb = Turm (C).
// Je 4 Promos = 1 grosses Bild (2x2); jede Karte zeigt ihren Ausschnitt.
// Promos gibt es nur durch Erfolge (keine Duplikate, nicht tauschbar).
(function () {
  const style = document.createElement('style');
  style.textContent = "  /* ---------- Promo-Karte (Full Art) ---------- */\n  .promo { position: absolute; inset: 0; container-type: inline-size; transform-style: preserve-3d; border-radius: 7cqw; }\n  .promo .p-scene { position: absolute; inset: 0; border-radius: 7cqw; overflow: hidden; border: 1.6cqw solid transparent;\n    background: #0b1020 padding-box, linear-gradient(135deg, #fff4cc, #c8aa6e 25%, #7a5a20 45%, #f0d9a0 60%, #b08a3a 80%, #fff4cc) border-box; box-shadow: 0 0 6cqw rgba(240,200,120,.25); }\n  .promo svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }\n  .promo .p-foil { position: absolute; inset: 0; pointer-events: none; opacity: .1;\n    background: repeating-linear-gradient(60deg, transparent 0 5cqw, rgba(255,255,255,.5) 5cqw 6cqw), linear-gradient(115deg, #ff9ad5, #ffe08a 20%, #9dffb0 40%, #8fd8ff 60%, #c49bff 80%, #ff9ad5);\n    background-size: auto, 400cqw 100%; animation: prFoil 8s linear infinite; }\n  .promo .p-glint { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,.26) 50%, transparent 62%); background-size: 300cqw 100%; animation: prGlint 4.5s linear infinite; }\n  .promo .p-shade { position: absolute; left: 0; right: 0; bottom: 0; height: 30%; background: linear-gradient(transparent, rgba(0,0,0,.7)); }\n  /* Ebenen: gleicher Ausschnitt wie die Szene, in der 3D-Kette angehoben.\n     Slabs = dunkle, verbreiterte Kopien darunter -> sichtbare Seitenkante */\n  .promo .ly { position: absolute; inset: 1.6cqw; pointer-events: none; }\n  .promo .ly svg { overflow: hidden; border-radius: 5.6cqw; }\n  /* Glatte Kanten beim Kippen (Nutzer v6.18.0: Einzelansicht pixelig): jede 3D-Ebene\n     wird als eigene Textur gezeichnet; liegt die sichtbare Kante genau auf deren Rand,\n     glaettet Chrome sie nicht. Ein transparenter Outline-Rand vergroessert die Textur,\n     die Kante liegt innen und wird geglaettet. */\n  .promo .p-scene, .promo .ly, .promo .p-stamp, .promo .p-label { outline: 1px solid transparent; backface-visibility: hidden; }\n  /* Am Kartenrand sind Figur und Mittelebene abgeschnitten; die Dicke-Schichten stapelten\n     sich dort beim starken Kippen (Einzelansicht) zu einer stufigen Wand. Schichten + Schatten\n     laufen zum Rand hin aus - die Vorderseite bleibt scharf. */\n  .promo .ly.slab, .promo .ly.sh { -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent), linear-gradient(180deg, transparent, #000 5%, #000 95%, transparent); -webkit-mask-composite: source-in; mask-composite: intersect; }\n  .promo .ly.pop { transform: translateZ(calc(var(--lift, 0px) + var(--i, 0) * var(--step, 0px))) scale(var(--comp, 1)); transition: transform .35s ease-out; }\n  .promo .ly.mid { transform: translateZ(calc(var(--lift, 0px) * .45 + var(--i, 0) * var(--step, 0px) * .6)) scale(calc(1 - (1 - var(--comp, 1)) * .45)); transition: transform .35s ease-out; }\n  .promo .ly.slab { filter: brightness(var(--shade, .5)) saturate(1.15) contrast(1.1); }\n  /* Leuchten/Partikel (.pr-ns) haben keine Dicke und keinen Schatten - sonst werden\n     aus halbtransparenten Glows dunkle Scheiben und aus Flocken graue Kaestchen */\n  .promo .ly.slab .pr-ns, .promo .ly.sh .pr-ns { display: none; }\n  .promo .ly.sh { transform: translate(2.5cqw, 4cqw); filter: brightness(0) blur(2cqw); opacity: .45; }\n  .promo .ly.sh.mid-sh { transform: translate(1.4cqw, 2.2cqw); filter: brightness(0) blur(1.4cqw); opacity: .4; }\n  .promo .p-label { position: absolute; left: 0; right: 0; bottom: 4.5cqw; text-align: center; transform: translateZ(calc(var(--lift, 0px) + var(--step, 0px) * 14)) scale(var(--comp, 1)); transition: transform .35s ease-out; }\n  .promo .p-label b { display: block; font-family: Cinzel, Georgia, serif; font-weight: 700; color: #fff; font-size: 9.5cqw; letter-spacing: .3cqw; text-shadow: 0 .5cqw 3cqw #000, 0 0 6cqw rgba(0,0,0,.9); }\n  .promo .p-label span { display: flex; justify-content: space-between; padding: 0 7cqw; margin-top: 1.5cqw; font-size: 5.6cqw; font-weight: bold; letter-spacing: .6cqw; text-shadow: 0 .4cqw 2cqw #000; }\n  .promo .p-label span em { font-style: normal; background: linear-gradient(90deg, #fff4cc, #f0d9a0, #ffe9b0); -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: none; }\n  .promo .p-stamp { position: absolute; top: 5cqw; right: 5cqw; padding: 1.4cqw 3cqw; border-radius: 3cqw; font-family: Cinzel, Georgia, serif; font-weight: 700; font-size: 5.4cqw; letter-spacing: .8cqw; color: #1a1208;\n    background: linear-gradient(135deg, #fff4cc, #c8aa6e 45%, #f0d9a0); box-shadow: 0 .8cqw 2cqw rgba(0,0,0,.6); transform: translateZ(calc(var(--lift, 0px) + var(--step, 0px) * 14)) scale(var(--comp, 1)); transition: transform .35s ease-out; }\n  @keyframes prFoil { from { background-position: 0 0, 0 0; } to { background-position: 0 0, -400cqw 0; } }\n  @keyframes prGlint { from { background-position: 150cqw 0; } to { background-position: -150cqw 0; } }\n  .pr-flicker { animation: prFlicker 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }\n  @keyframes prFlicker { 0%, 100% { transform: scale(1, 1); opacity: 1; } 30% { transform: scale(.92, 1.08); opacity: .9; } 60% { transform: scale(1.05, .94); opacity: 1; } }\n  .pr-twinkle { animation: prTwinkle 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }\n  .pr-twinkle.d1 { animation-delay: .6s; } .pr-twinkle.d2 { animation-delay: 1.2s; } .pr-twinkle.d3 { animation-delay: 1.8s; }\n  @keyframes prTwinkle { 0%, 100% { opacity: .25; transform: scale(.6); } 50% { opacity: 1; transform: scale(1.1); } }\n  .pr-drift { animation: prDrift 9s ease-in-out infinite; }\n  @keyframes prDrift { 0%, 100% { transform: translateY(0); opacity: .5; } 50% { transform: translateY(-6px); opacity: 1; } }\n";
  document.head.appendChild(style);
  // ===================== Bausteine (Bild = 240x336 = 2x2 Karten a 120x168) =====================
  const HEAD = 'M42 4 L48 15 L54 3 L60 18 C74 20 86 30 90 48 C93 62 92 80 92 96 L48 96 C50 84 52 72 50 62 C40 64 28 74 16 75 C8 75 4 69 6 62 C10 52 26 36 37 22 Z';
  const MANE = 'M60 18 L66 9 L69 20 L77 13 L79 26 L87 22 L87 35 L95 35 L91 47 L99 51 L93 59 L99 67 L93 73 L97 81 L92 85 L92 96 C92 80 93 62 90 48 C86 30 74 20 60 18 Z';
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const f1 = n => (+n).toFixed(1);
  const lg = (id, stops, x2 = 0, y2 = 1, x1 = 0, y1 = 0) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
  const rg = (id, stops, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
  const glow = (x, y, r, id) => `<circle class="pr-ns" cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>`;
  const stars = (n, y0, y1, x0 = 0, x1 = 240, tw = 0) => { let s = ''; for (let i = 0; i < n; i++) { const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0), r = .25 + rnd() * .8; s += `<circle${tw && i % 5 === 0 ? ` class="pr-twinkle d${i % 4}"` : ''} cx="${f1(x)}" cy="${f1(y)}" r="${r.toFixed(2)}" fill="#fff" opacity="${(.35 + rnd() * .6).toFixed(2)}"/>`; } return s; };
  const spark = (x, y, s = 1, c = '#fff8e0', cls = '') => `<g class="pr-ns" transform="translate(${x} ${y}) scale(${s})"><path class="${cls}" d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="${c}"/></g>`;
  // Pony-Bueste (Schachfigur-Kopf), Kopf-Box 0..100 x 0..96; extra = Zubehoer in Kopf-Koordinaten
  function bust(x, y, s, { body, shade, mane, rim = 'rgba(255,220,160,.55)', eye = 'carved', id, extra = '', under = '', flip = false }) {
    const eyes = {
      carved: `<path d="M31 33 Q36 30 41 33" stroke="${shade}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".9"/><path d="M30 37 Q36 35 42 37" stroke="rgba(255,255,255,.35)" stroke-width="1" fill="none"/>`,
      open: '<ellipse cx="36" cy="33" rx="4" ry="4.6" fill="#1a1410"/><circle cx="37.3" cy="31.6" r="1.4" fill="#fff"/>',
      happy: '<path d="M31 34 Q36 28 41 34" stroke="#1a1410" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
    };
    const t = flip ? `translate(${x + 100 * s} ${y}) scale(${-s} ${s})` : `translate(${x} ${y}) scale(${s})`;
    return `<g transform="${t}"><defs>${lg(id, [[0, body], [.55, body], [1, shade]], 1, 1)}${lg(id + 'm', [[0, mane], [1, shade]], 1, 1)}</defs>${under}
      <path d="${HEAD}" fill="url(#${id})" stroke="rgba(0,0,0,.45)" stroke-width="1.6"/>
      <path d="M48 96 C50 84 52 72 50 62 C40 64 28 74 16 75 C10 75 6 71 6 66 C14 70 30 66 42 58 C50 54 56 60 56 70 C56 80 54 90 54 96 Z" fill="${shade}" opacity=".35"/>
      <path d="${MANE}" fill="url(#${id}m)" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
      <path d="M66 12 L70 22 M78 16 L80 28 M88 26 L88 36 M94 40 L91 48 M96 56 L93 60 M95 70 L93 74" stroke="rgba(255,255,255,.22)" stroke-width="1.2"/>
      <path d="M60 18 C74 20 86 30 90 48 C93 62 92 80 92 96" stroke="${rim}" stroke-width="2.4" fill="none"/>
      <path d="M14 66 C22 70 30 68 36 64" stroke="rgba(0,0,0,.28)" stroke-width="1.6" fill="none"/>
      <path d="M44 14 C50 30 56 40 70 50" stroke="rgba(255,255,255,.3)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="13" cy="64" rx="2.2" ry="1.6" fill="rgba(0,0,0,.5)"/>${eyes[eye]}${extra}</g>`;
  }
  const coinDefs = `${lg('cG', [[0, '#fff6c0'], [.45, '#f4c440'], [1, '#a8700e']], 1, 1)}${lg('cE', [[0, '#c08a1a'], [1, '#6a4208']])}`;
  const coin = (x, y, r = 4, tilt = .45) => `<ellipse cx="${f1(x)}" cy="${f1(y + r * tilt * .4)}" rx="${r}" ry="${f1(r * tilt)}" fill="url(#cE)"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${r}" ry="${f1(r * tilt)}" fill="url(#cG)" stroke="#6a4208" stroke-width=".5"/><ellipse cx="${f1(x - r * .25)}" cy="${f1(y - r * tilt * .25)}" rx="${f1(r * .35)}" ry="${f1(r * tilt * .25)}" fill="#fffbe0" opacity=".6"/>`;
  const gem = (x, y, s, c1, c2) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-5 -2 L-2 -6 L2 -6 L5 -2 L0 6 Z" fill="${c1}" stroke="#1a0a14" stroke-width=".6"/><path d="M-5 -2 L5 -2 L0 6 Z" fill="${c2}"/><path d="M-2 -6 L-1 -2 L1 -2 L2 -6" fill="#fff" opacity=".45"/></g>`;
  function pile(cx, baseY, w, h, n, s) {
    seed = s;
    let out = `<path d="M${cx - w / 2} ${baseY} C${cx - w * .32} ${baseY - h * .9} ${cx - w * .1} ${baseY - h} ${cx} ${baseY - h} C${cx + w * .12} ${baseY - h} ${cx + w * .32} ${baseY - h * .85} ${cx + w / 2} ${baseY} Z" fill="url(#pileG)"/>
      <path d="M${cx - w * .3} ${baseY - h * .55} C${cx - w * .15} ${baseY - h * .9} ${cx} ${baseY - h * .95} ${cx + w * .1} ${baseY - h * .85}" stroke="#fff6c0" stroke-width="1.4" fill="none" opacity=".5"/>`;
    const pts = [];
    for (let i = 0; i < n; i++) { const t = rnd(), u = rnd(); const x = cx + (t - .5) * w * .92; const top = baseY - h * Math.cos((t - .5) * Math.PI) * .95; pts.push([x, top + u * (baseY - top) * .85, 2 + rnd() * 2.6]); }
    pts.sort((a, b) => a[1] - b[1]).forEach(([x, y, r], i) => { out += i % 9 === 4 ? gem(x, y, r * .2, ['#ff5a7a', '#6bc8ff', '#5fd08a', '#c49bff'][i % 4], 'rgba(0,0,0,.3)') : coin(x, y, r); });
    return out;
  }

  // ===================== 1) Hall of Gods =====================
  // EIN Bild ueber alle 4 Karten (Nutzer: "wirken wie 4 einzelne"): Riot God
  // links und Elder God rechts stehen ueber der Querfuge (Kopf oben, Sockel
  // unten), der goldene Ultimate God thront riesig unten ueber der Laengsfuge,
  // die Krone schwebt oben ueber der Mitte vor dem Rosenfenster.
  const PC = [120, 118], PR = 74;
  function hallScene() {
    seed = 11;
    let rays = ''; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, w = .045; rays += `<path d="M${PC[0]} ${PC[1]} L${f1(PC[0] + Math.cos(a - w) * PR)} ${f1(PC[1] + Math.sin(a - w) * PR)} L${f1(PC[0] + Math.cos(a + w) * PR)} ${f1(PC[1] + Math.sin(a + w) * PR)} Z" fill="#fff2c8" opacity="${i % 2 ? .07 : .15}"/>`; }
    let blocks = ''; for (let y = 20; y < 300; y += 14) for (let x = (y / 14) % 2 ? -14 : 0; x < 240; x += 28) blocks += `<rect x="${x + 1}" y="${y + 1}" width="26" height="12" rx="1" fill="#2a1a36" opacity="${(.25 + rnd() * .5).toFixed(2)}" stroke="#0e0614" stroke-width=".7"/>`;
    let tiles = ''; for (let i = -8; i <= 8; i++) tiles += `<path d="M${120 + i * 8} 301 L${120 + i * 40} 336" stroke="#000" stroke-width=".8" opacity=".3"/>`;
    [306, 314, 326].forEach(y => { tiles += `<path d="M0 ${y} H240" stroke="#000" stroke-width=".7" opacity=".25"/>`; });
    let motes = ''; for (let i = 0; i < 30; i++) motes += `<circle class="pr-drift" style="animation-delay:-${(rnd() * 9).toFixed(1)}s" cx="${f1(50 + rnd() * 140)}" cy="${f1(60 + rnd() * 240)}" r="${(.4 + rnd() * .8).toFixed(2)}" fill="#ffe2a0" opacity=".7"/>`;
    const column = x => `<rect x="${x - 9}" y="18" width="18" height="282" fill="url(#hgCol)"/><path d="M${x - 5} 22 V296 M${x} 22 V296 M${x + 5} 22 V296" stroke="#0e0614" stroke-width=".8" opacity=".5"/>
      <rect x="${x - 12}" y="18" width="24" height="7" fill="#3e2a4c"/><rect x="${x - 12}" y="292" width="24" height="8" fill="#3e2a4c"/>`;
    const torch = (x, y) => `${glow(x, y, 22, 'hgTorch')}<path d="M${x - 4} ${y + 6} L${x + 4} ${y + 6} L${x + 2} ${y + 18} L${x - 2} ${y + 18} Z" fill="#3a2418" stroke="#120804" stroke-width=".6"/><path d="M${x - 5} ${y + 5} H${x + 5}" stroke="#c8aa6e" stroke-width="1.6"/>
      <path class="pr-flicker" d="M${x} ${y - 9} C${x + 5} ${y - 2} ${x + 5} ${y + 3} ${x} ${y + 5} C${x - 5} ${y + 3} ${x - 5} ${y - 2} ${x} ${y - 9} Z" fill="#ffb24a"/><path class="pr-flicker" d="M${x} ${y - 3} C${x + 2.4} ${y} ${x + 2.4} ${y + 3} ${x} ${y + 4.5} C${x - 2.4} ${y + 3} ${x - 2.4} ${y} ${x} ${y - 3} Z" fill="#fff2c0"/>`;
    return `<defs>${lg('hgSky', [[0, '#2a1440'], [.35, '#7a2e58'], [.6, '#d0604a'], [.8, '#f6a656'], [1, '#ffd890']])}
      ${rg('hgSun', [[0, '#fffbe8', 1], [.25, '#ffe9b0', .9], [.6, '#ffc070', .35], [1, '#ff9a5a', 0]])}
      ${lg('hgWall', [[0, '#24162f'], [.5, '#1a1024'], [1, '#100818']])}${rg('hgWallGlow', [[0, '#ff9a5a', .42], [1, '#ff9a5a', 0]])}
      ${lg('hgFloor', [[0, '#6a3644'], [.3, '#34202e'], [1, '#140a12']])}${rg('hgTorch', [[0, '#ffcf80', .55], [1, '#ff9a40', 0]])}
      ${lg('hgBeam', [[0, '#ffd9a0', .3], [1, '#ffd9a0', 0]])}${lg('hgCol', [[0, '#2a1a36'], [.5, '#3e2a4c'], [1, '#22142e']], 1, 0)}<clipPath id="hgWin"><circle cx="${PC[0]}" cy="${PC[1]}" r="${PR}"/></clipPath></defs>
      <rect width="240" height="336" fill="url(#hgWall)"/>${blocks}
      <circle cx="${PC[0]}" cy="${PC[1]}" r="170" fill="url(#hgWallGlow)"/>
      <g clip-path="url(#hgWin)"><rect x="0" y="40" width="240" height="160" fill="url(#hgSky)"/>${stars(24, 46, 90, 46, 194, 1)}
        <path d="M40 150 L62 132 L76 142 L94 124 L114 140 L130 130 L148 142 L170 126 L192 144 L210 136 V200 H40 Z" fill="#7a3048" opacity=".7"/>
        <path d="M40 162 Q90 152 140 160 T210 158 V200 H40 Z" fill="#4a1c3a"/>
        ${glow(PC[0], PC[1], 54, 'hgSun')}${rays}</g>
      ${column(14)}${column(226)}
      <path d="M70 186 L20 300 H220 L170 186 Z" fill="url(#hgBeam)"/>
      <rect x="0" y="300" width="240" height="36" fill="url(#hgFloor)"/>${tiles}
      <ellipse cx="120" cy="308" rx="100" ry="7" fill="#ffd9a0" opacity=".22"/>${motes}
      ${torch(34, 200)}${torch(206, 200)}`;
  }
  function hallMid() {
    let spokes = ''; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; spokes += `<path d="M${f1(PC[0] + Math.cos(a) * 30)} ${f1(PC[1] + Math.sin(a) * 30)} L${f1(PC[0] + Math.cos(a) * PR)} ${f1(PC[1] + Math.sin(a) * PR)}" stroke="url(#hgStone)" stroke-width="3.2"/>`; }
    let petals = ''; for (let i = 0; i < 16; i++) { const a = (i + .5) / 16 * Math.PI * 2; petals += `<circle cx="${f1(PC[0] + Math.cos(a) * 54)}" cy="${f1(PC[1] + Math.sin(a) * 54)}" r="10" fill="none" stroke="url(#hgStone)" stroke-width="2.2"/>`; }
    let beads = ''; for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; beads += `<circle cx="${f1(PC[0] + Math.cos(a) * (PR + 4))}" cy="${f1(PC[1] + Math.sin(a) * (PR + 4))}" r="1.6" fill="#f0d9a0"/>`; }
    let dent = ''; for (let i = 0; i < 24; i++) dent += `<rect x="${i * 10 + 2}" y="5" width="6" height="7" fill="#140a1c"/>`;
    // Stufen-Podest fuer den Thron unten in der Mitte (ueber der Laengsfuge)
    return `<defs>${lg('hgStone', [[0, '#4a3458'], [1, '#22142e']], 1, 1)}${lg('hgLedge', [[0, '#4a3458'], [1, '#22142e']])}${lg('hgGoldR', [[0, '#fff4cc'], [.5, '#c8aa6e'], [1, '#7a5a20']], 1, 1)}</defs>
      ${petals}${spokes}
      <circle cx="${PC[0]}" cy="${PC[1]}" r="30" fill="none" stroke="url(#hgStone)" stroke-width="3.2"/>
      <circle cx="${PC[0]}" cy="${PC[1]}" r="${PR}" fill="none" stroke="url(#hgStone)" stroke-width="8"/>
      <circle cx="${PC[0]}" cy="${PC[1]}" r="${PR + 4}" fill="none" stroke="url(#hgGoldR)" stroke-width="2.6"/>${beads}
      <rect x="0" y="0" width="240" height="18" fill="url(#hgLedge)"/><rect x="0" y="16" width="240" height="3" fill="url(#hgGoldR)"/>${dent}
      <path d="M44 300 L196 300 L190 290 L50 290 Z" fill="url(#hgLedge)" stroke="#0a0610" stroke-width="1"/><path d="M50 290 H190" stroke="#f4b06a" stroke-width="1.2" opacity=".7"/>
      <path d="M58 290 L182 290 L176 280 L64 280 Z" fill="url(#hgLedge)" stroke="#0a0610" stroke-width="1"/><path d="M64 280 H176" stroke="#f4b06a" stroke-width="1.2" opacity=".7"/>
      <rect x="0" y="298" width="240" height="5" fill="url(#hgLedge)"/><rect x="0" y="298" width="240" height="1.4" fill="#f4b06a" opacity=".5"/>`;
  }
  function pedestal(cx, topY, baseY, glyph, c1 = '#4a3458', c2 = '#24162f', gold = '#c8aa6e') {
    return `<path d="M${cx - 28} ${baseY} L${cx + 28} ${baseY} L${cx + 25} ${baseY - 10} L${cx - 25} ${baseY - 10} Z" fill="${c1}" stroke="#0a0610" stroke-width="1"/>
      <path d="M${cx - 25} ${baseY - 10} H${cx + 25}" stroke="${gold}" stroke-width="1.4"/>
      <rect x="${cx - 18}" y="${topY + 7}" width="36" height="${baseY - topY - 17}" fill="${c2}" stroke="#0a0610" stroke-width="1"/>
      <rect x="${cx + 13}" y="${topY + 7}" width="5" height="${baseY - topY - 17}" fill="#f4b06a" opacity=".2"/>
      <rect x="${cx - 12}" y="${topY + 16}" width="24" height="${baseY - topY - 36}" rx="2" fill="none" stroke="${gold}" stroke-width=".8" opacity=".7"/>
      <rect x="${cx - 24}" y="${topY}" width="48" height="7" fill="${c1}" stroke="#0a0610" stroke-width="1"/><path d="M${cx - 24} ${topY} H${cx + 24}" stroke="${gold}" stroke-width="1"/>
      <text x="${cx}" y="${(topY + baseY) / 2 + 2}" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-size="11" font-weight="700" fill="${gold}">${glyph}</text>`;
  }
  function hallPop() {
    return `<defs>${rg('hgHalo', [[.55, '#ffe08a', 0], [.8, '#ffe08a', .5], [1, '#ffe08a', 0]])}${lg('hgWing', [[0, '#fff6d0'], [1, '#c89020']], 1, 0)}
      ${rg('hgCrownGlow', [[0, '#fff2c0', .85], [1, '#ffd070', 0]])}${lg('hgCrown', [[0, '#fff4cc'], [.5, '#e8b848'], [1, '#8a5a10']])}${lg('hgThrone', [[0, '#5a2a4a'], [1, '#24102a']])}
      ${lg('hgBh', [[0, '#d8f0e0'], [1, '#2a6a58']])}${lg('hgCush', [[0, '#c83a4a'], [1, '#5a1020']])}</defs>
      <!-- Riot God (oben links, schaut zur Mitte); Sockel reicht ueber die Querfuge -->
      <path d="M22 44 L20 150" stroke="#c8aa6e" stroke-width="2.4"/><path d="M17 48 L21 34 L26 48 Z" fill="#f0d9a0" stroke="#5a3a08" stroke-width=".8"/><path d="M20 54 C10 58 10 70 20 74 L22 64 Z" fill="#8a2a3a"/>
      ${pedestal(52, 128, 194, 'I')}
      ${bust(18, 58, .72, { flip: true, body: '#f8f4fc', shade: '#9a90b0', mane: '#d8d0e8', rim: 'rgba(255,200,140,.8)', id: 'hgA',
        extra: `<path d="M52 8 C60 2 74 4 82 12" stroke="#c8aa6e" stroke-width="2.2" fill="none"/>${[[54, 7, -30], [60, 4, -15], [67, 3, 0], [74, 5, 15], [80, 9, 30]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.2" transform="rotate(${r} ${x} ${y})" fill="#e8c060" stroke="#6a4a10" stroke-width=".6"/>`).join('')}` })}
      ${spark(100, 62, .7, '#fff8e0', 'pr-twinkle')}
      <!-- Elder God (oben rechts, schaut zur Mitte) -->
      ${pedestal(188, 128, 194, 'II', '#2e4a44', '#162a26', '#8ad0b0')}
      ${[[168, 142], [164, 158], [166, 176], [210, 146], [214, 162], [212, 180]].map(([x, y], i) => `<path d="M${x} ${y} c-5 -2 -6 3 -3 5 c2 1 5 0 3 -5 Z" fill="${i % 2 ? '#3a8a4a' : '#2a6a3a'}"/>`).join('')}
      <path d="M168 136 C162 152 168 166 162 184 M210 138 C216 154 210 170 216 188" stroke="#2a6a3a" stroke-width="1.6" fill="none"/>
      ${bust(150, 58, .72, { body: '#9ae0c0', shade: '#2a6a58', mane: '#1a4a3a', rim: 'rgba(255,200,140,.75)', id: 'hgB',
        under: '<path d="M60 18 C62 2 76 -6 84 -14 C80 0 74 10 70 22 Z M48 15 C46 0 54 -10 58 -18 C58 -4 56 6 56 16 Z" fill="url(#hgBh)" stroke="#0a2018" stroke-width="1"/>' })}
      ${spark(140, 66, .6, '#c8ffe8', 'pr-twinkle d1')}
      <!-- Ultimate God (unten links) auf dem Thron; Fluegel reichen in die Nachbarkarte -->
      <path d="M28 286 L32 214 C32 202 42 196 54 196 H102 C114 196 122 202 122 214 L126 286 Z" fill="url(#hgThrone)" stroke="#0a0610" stroke-width="1.4"/>
      <path d="M36 282 L39 216 C39 208 46 204 54 204 H102 C110 204 115 208 115 216 L118 282" fill="none" stroke="#c8aa6e" stroke-width="1.4"/>
      <circle class="pr-ns" cx="78" cy="232" r="46" fill="url(#hgHalo)"/><circle cx="78" cy="232" r="36" fill="none" stroke="#ffe08a" stroke-width="2.4"/>
      ${[0, 1, 2, 3, 4].map(i => `<path d="M110 ${256 - i * 7} C${136 + i * 6} ${244 - i * 10} ${150 + i * 4} ${230 - i * 9} 156 ${210 - i * 7} C${138 + i} ${224 - i * 7} 122 ${240 - i * 7} 110 ${248 - i * 7} Z" fill="url(#hgWing)" stroke="#7a5010" stroke-width=".6"/>`).join('')}
      ${[0, 1, 2, 3, 4].map(i => `<path d="M44 ${256 - i * 7} C${24 - i * 5} ${244 - i * 10} ${12 - i * 3} ${230 - i * 9} 8 ${212 - i * 7} C${22 - i} ${224 - i * 7} 34 ${240 - i * 7} 44 ${248 - i * 7} Z" fill="url(#hgWing)" stroke="#7a5010" stroke-width=".6"/>`).join('')}
      ${bust(36, 198, .84, { body: '#fff0b0', shade: '#b07a14', mane: '#c08a1a', rim: 'rgba(255,250,220,.85)', id: 'hgC' })}
      ${spark(30, 206, .8, '#fff8e0', 'pr-twinkle d2')}
      <!-- Hall of Gods (unten rechts): Altar mit Kissen und Krone, die drei Goetterlichter -->
      ${glow(184, 232, 40, 'hgCrownGlow')}
      <path d="M150 290 L218 290 L214 280 L154 280 Z" fill="#4a3458" stroke="#0a0610" stroke-width="1"/><path d="M154 280 H214" stroke="#c8aa6e" stroke-width="1.2"/>
      <path d="M158 280 L210 280 L206 260 L162 260 Z" fill="#24162f" stroke="#0a0610" stroke-width="1"/><path d="M166 266 H202 M168 273 H200" stroke="#c8aa6e" stroke-width=".8" opacity=".6"/>
      <path d="M160 260 L208 260 L206 255 L162 255 Z" fill="#c8aa6e" stroke="#5a3a08" stroke-width=".6"/>
      <path d="M166 255 C166 247 202 247 202 255 Z" fill="url(#hgCush)" stroke="#3a0810" stroke-width=".8"/><circle cx="166" cy="254" r="2" fill="#e8c060"/><circle cx="202" cy="254" r="2" fill="#e8c060"/>
      <path d="M165 244 L167 224 L175 235 L184 218 L193 235 L201 224 L203 244 Z" fill="url(#hgCrown)" stroke="#5a3a08" stroke-width="1.3"/>
      <rect x="164" y="243" width="40" height="7" rx="1.6" fill="url(#hgCrown)" stroke="#5a3a08" stroke-width="1"/>
      <circle cx="184" cy="246.5" r="2.6" fill="#ff5a6a"/><circle cx="173" cy="246.5" r="1.8" fill="#6bc8ff"/><circle cx="195" cy="246.5" r="1.8" fill="#5fd08a"/>
      <circle cx="167" cy="223" r="2.2" fill="#fff4cc"/><circle cx="184" cy="217" r="2.8" fill="#fff4cc"/><circle cx="201" cy="223" r="2.2" fill="#fff4cc"/>
      <path class="pr-ns" d="M158 208 Q171 196 184 192 Q197 196 210 208" stroke="#fff4cc" stroke-width=".8" fill="none" opacity=".6" stroke-dasharray="2 3"/>
      <circle cx="158" cy="208" r="4.4" fill="#f8f4fc"/><circle cx="210" cy="208" r="4.4" fill="#9ae0c0"/><circle cx="184" cy="192" r="4.4" fill="#fff0b0"/>
      ${spark(146, 246, .7, '#fff8e0', 'pr-twinkle d3')}${spark(222, 238, .6, '#fff8e0', 'pr-twinkle')}`;
  }

  // ===================== 2) Dragon's Hoard (LP) =====================
  // EIN Goldberg ueber alle 4 Karten, gekroentes Pony auf dem Gipfel genau ueber
  // der Mitte; ein Drache windet sich hinter dem Berg (Mittelebene), sein Kopf
  // liegt rechts auf dem Gold, seine Klaue greift unten rechts hinein.
  function hoardScene() {
    seed = 23;
    let beams = ''; [[84, 30], [120, 46], [156, 28]].forEach(([x, w]) => { beams += `<path d="M${x - 7} 0 L${x + 7} 0 L${x + w} 336 L${x - w} 336 Z" fill="url(#hdBeam)"/>`; });
    let stal = ''; for (let x = -4; x < 244; x += 9 + rnd() * 8) { const h = 10 + rnd() * 28; stal += `<path d="M${f1(x)} 0 L${f1(x + 9)} 0 L${f1(x + 4.5 + rnd() * 2)} ${f1(h)} Z" fill="url(#hdStal)"/>`; }
    let dust = ''; for (let i = 0; i < 46; i++) dust += `<circle class="pr-drift" style="animation-delay:-${(rnd() * 9).toFixed(1)}s" cx="${f1(60 + rnd() * 120)}" cy="${f1(rnd() * 330)}" r="${(.3 + rnd() * .8).toFixed(2)}" fill="#ffe2a0" opacity="${(.3 + rnd() * .5).toFixed(2)}"/>`;
    let far = ''; for (let i = 0; i < 26; i++) { const x = rnd() * 240, y = 150 + rnd() * 60; far += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(1 + rnd() * 1.5)}" ry=".7" fill="#ffd060" opacity="${(.25 + rnd() * .4).toFixed(2)}"/>`; }
    const chain = (x, n) => Array.from({ length: n }, (_, i) => `<ellipse cx="${x}" cy="${8 + i * 7}" rx="${i % 2 ? 1.6 : 3}" ry="3.6" fill="none" stroke="#6a5a48" stroke-width="1.4"/>`).join('');
    return `<defs>${lg('hdBg', [[0, '#0a0604'], [.45, '#1e1208'], [1, '#3a2410']])}${lg('hdBeam', [[0, '#ffe2a0', .24], [1, '#ffe2a0', 0]])}
      ${lg('hdStal', [[0, '#1a1008'], [1, '#080402']])}${rg('hdFar', [[0, '#ffc860', .4], [1, '#ffc860', 0]])}</defs>
      <rect width="240" height="336" fill="url(#hdBg)"/>${glow(120, 230, 150, 'hdFar')}
      <path d="M-10 230 C30 200 70 210 100 200 C140 190 180 206 250 190 V336 H-10 Z" fill="#2a1a0a"/>${far}
      ${beams}${stal}${chain(30, 10)}${chain(214, 7)}
      <path d="M0 0 V336 H14 C22 280 10 230 18 180 C26 130 6 80 20 0 Z" fill="#120a04"/>
      <path d="M240 0 V336 H228 C220 290 234 240 224 190 C216 140 236 90 222 0 Z" fill="#120a04"/>
      ${dust}`;
  }
  // ---------- Drache (Nutzer v4): Rayquaza-Stil = langer Schlangenkoerper, ueberall
  // so breit wie der Hals, windet sich ueber alle 4 Karten. 3 Varianten zum Vergleich:
  //   A Sky Serpent - Sichelflossen paarweise, goldene Ringe, Kopfkamm, kleine Klauenarme
  //   B Eastern Dragon - wehende Maehne, Barthaare, 4 kurze Beine, Haarflamme am Schwanz
  //   C Winged Wyrm - ein eleganter Fluegel (Fingerknochen, Bogen-Flughaut), Vorderbeine
  // Flossen/Maehne/Beine werden entlang des Koerperpfads berechnet (getPointAtLength).
  let DRAGON = 'C'; // Nutzer 2026-11-27: C Winged Wyrm gewaehlt
  const DR_PATH = 'M204 68 C226 72 236 92 222 104 C204 118 164 108 130 100 C96 92 60 84 36 100 C10 118 12 172 40 186 C64 198 100 194 120 206 C140 218 142 240 128 256';
  const DR_TAIL = 'M196 274 C216 264 232 246 232 224 C232 204 220 192 206 194';
  const DR_W = 16;
  const DR_LOOK = {
    A: { b0: '#5ad08a', b1: '#1e7a4a', b2: '#0c3a22', belly: '#f4e6a0', line: '#0a2a18', accent: '#f0c840', head: ['#6ae09a', '#1e7a4a', '#0c3a22'] },
    B: { b0: '#e0503a', b1: '#9a1e1a', b2: '#4a0a0a', belly: '#f8dca0', line: '#2a0606', accent: '#fff0c8', head: ['#e8604a', '#9a1e1a', '#3a0808'] },
    C: { b0: '#9a3824', b1: '#5a1a10', b2: '#2a0a06', belly: '#e8b070', line: '#14040a', accent: '#e8dcc0', head: ['#8a3020', '#4a160e', '#24080a'] }
  };
  let drSvg = null;
  function along(d, n) {
    if (!drSvg) { drSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); drSvg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden'; document.body.appendChild(drSvg); }
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); drSvg.appendChild(p);
    const L = p.getTotalLength(), out = [];
    for (let i = 0; i < n; i++) { const t = i / (n - 1) * L, a = p.getPointAtLength(t), b = p.getPointAtLength(Math.min(L, t + .6)), c = p.getPointAtLength(Math.max(0, t - .6)); out.push({ x: a.x, y: a.y, a: Math.atan2(b.y - c.y, b.x - c.x), t: i / (n - 1) }); }
    p.remove();
    return out;
  }
  const at = (pts, t) => pts[Math.round(t * (pts.length - 1))];
  const deg = r => (r * 180 / Math.PI).toFixed(1);
  // lokales Koordinatensystem an einem Pfadpunkt: +x = Richtung Schwanz, +y = Ruecken
  const local = (p, inner) => `<g transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${deg(p.a)})">${inner}</g>`;
  function drBody(d, w, v, n = 90) {
    const L = DR_LOOK[v], pts = along(d, n);
    // Versatz entlang der Normalen: +k = Ruecken, -k = Bauch
    const off = k => pts.map(p => [p.x - Math.sin(p.a) * k, p.y + Math.cos(p.a) * k]);
    const poly = a => 'M' + a.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L');
    const belly = poly(off(-w * .24)), ridge = poly(off(w * .3));
    let plates = '', rings = '';
    pts.forEach((p, i) => { if (i % 2 === 0) plates += local(p, `<path d="M0 ${f1(-w * .06)} V${f1(-w * .44)}" stroke="${L.line}" stroke-width=".55" opacity=".55"/>`); });
    if (v === 'A') pts.forEach((p, i) => { if (i % 9 === 4) rings += local(p, `<path d="M0 ${f1(-w / 2)} V${f1(w / 2)}" stroke="${L.accent}" stroke-width="2.6"/><path d="M1.4 ${f1(-w / 2)} V${f1(w / 2)}" stroke="#8a6a10" stroke-width=".8"/>`); });
    return `<defs>${lg('drB' + v, [[0, L.b0], [.5, L.b1], [1, L.b2]], 0, 1)}</defs>
      <path d="${d}" stroke="${L.line}" stroke-width="${w + 3}" fill="none" stroke-linecap="round"/>
      <path d="${d}" stroke="url(#drB${v})" stroke-width="${w}" fill="none" stroke-linecap="round"/>
      <path d="${d}" stroke="${L.line}" stroke-width="${f1(w * .9)}" fill="none" stroke-dasharray="1 3.4" opacity=".22"/>
      <path d="${belly}" stroke="${L.belly}" stroke-width="${f1(w * .38)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${plates}
      <path d="${ridge}" stroke="${L.b0}" stroke-width="1.4" fill="none" opacity=".6" stroke-linejoin="round"/>${rings}`;
  }
  // Sichelflosse (A), Rueckenseite +y, schwingt nach hinten
  const finA = (w, s = 1, L) => `<path d="M-7 ${w / 2} C-8 ${w / 2 + 10 * s} -2 ${w / 2 + 24 * s} ${16 * s} ${w / 2 + 32 * s} C${8 * s} ${w / 2 + 22 * s} ${8 * s} ${w / 2 + 12 * s} ${9 * s} ${w / 2} Z" fill="url(#drFin)" stroke="${L.line}" stroke-width=".9"/>
    <path d="M-2 ${w / 2 + 2} C0 ${w / 2 + 12 * s} ${6 * s} ${w / 2 + 22 * s} ${12 * s} ${w / 2 + 28 * s}" stroke="${L.line}" stroke-width=".7" fill="none" opacity=".6"/>`;
  const finAv = (w, s = 1, L) => `<path d="M-4 ${-w / 2} C-4 ${-w / 2 - 8 * s} 2 ${-w / 2 - 16 * s} ${12 * s} ${-w / 2 - 20 * s} C${6 * s} ${-w / 2 - 12 * s} ${6 * s} ${-w / 2 - 6 * s} ${6 * s} ${-w / 2} Z" fill="url(#drFin)" stroke="${L.line}" stroke-width=".8"/>`;
  // kurzer Arm/Bein mit 3 Krallen (Bauchseite -y)
  const limb = (w, L) => {
    const d = `M0 ${-w * .25} C3 ${-w / 2 - 8} 12 ${-w / 2 - 12} 10 ${-w / 2 - 20} C9 ${-w / 2 - 26} 2 ${-w / 2 - 28} -4 ${-w / 2 - 27}`;
    const hx = -4, hy = -w / 2 - 27;
    return `<path d="${d}" stroke="${L.line}" stroke-width="8.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" stroke="url(#drLimb)" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 ${-w / 2 - 4} C6 ${-w / 2 - 9} 10 ${-w / 2 - 12} 10 ${-w / 2 - 16}" stroke="${L.b0}" stroke-width="1.2" fill="none" opacity=".6"/>
      ${[[-120, 9], [-160, 10], [160, 9]].map(([r, l]) => `<path transform="translate(${hx} ${f1(hy)}) rotate(${r})" d="M0 -1.8 C${l * .4} -2.2 ${l * .8} -1 ${l} 1.6 C${l * .7} 1.2 ${l * .35} 1.8 0 1.8 Z" fill="#f4ecd8" stroke="#3a2a1a" stroke-width=".45"/>`).join('')}`;
  };
  // Maehnen-Bueschel (B)
  const tuft = (w, k, L) => `<path d="M-3 ${w / 2 - 1} C0 ${w / 2 + 6 + k} 8 ${w / 2 + 10 + k} 16 ${w / 2 + 8 + k} C10 ${w / 2 + 6 + k} 6 ${w / 2 + 3} 5 ${w / 2 - 1} Z" fill="url(#drMane)" stroke="#8a5a20" stroke-width=".5"/>`;
  function dragonMid(v) {
    const L = DR_LOOK[v], pts = along(DR_PATH, 120), w = DR_W;
    let extra = '', back = '';
    if (v === 'A') {
      [.12, .3, .5, .68].forEach((t, i) => { const p = at(pts, t); back += local(p, finA(w, 1 - i * .1, L)); extra += local(p, finAv(w, .9 - i * .1, L)); });
      extra += local(at(pts, .34), limb(w, L)) + local(at(pts, .44), limb(w, L));
    } else if (v === 'B') {
      for (let i = 1; i < 52; i++) back += local(at(pts, i / 54), tuft(w, (i % 3) * 2, L));
      [.32, .4, .7, .78].forEach(t => { extra += local(at(pts, t), limb(w, L)); });
    } else {
      // Fluegel an der Schulter (t .2), Hinterkante zurueck zum Koerper (t .34)
      const S = at(pts, .3), R = at(pts, .46);
      const E = { x: S.x + 2, y: S.y - 32 }, W = { x: S.x - 20, y: S.y - 54 };
      const F = [{ x: S.x - 98, y: S.y - 40 }, { x: S.x - 88, y: S.y - 76 }, { x: S.x - 54, y: S.y - 92 }, { x: S.x - 12, y: S.y - 90 }];
      const sag = (a, b, k = .32) => ({ x: (a.x + b.x) / 2 + (W.x - (a.x + b.x) / 2) * k, y: (a.y + b.y) / 2 + (W.y - (a.y + b.y) / 2) * k });
      const P = q => `${f1(q.x)} ${f1(q.y)}`;
      const c3 = sag(F[3], F[2]), c2 = sag(F[2], F[1]), c1 = sag(F[1], F[0]), c0 = sag(F[0], R, .45);
      back += `<path d="M${P(S)} L${P(E)} L${P(W)} L${P(F[3])} Q${P(c3)} ${P(F[2])} Q${P(c2)} ${P(F[1])} Q${P(c1)} ${P(F[0])} Q${P(c0)} ${P(R)} Z" fill="url(#drWing)" stroke="${L.line}" stroke-width="1.2"/>`;
      F.forEach((q, i) => { const m = sag(q, i ? F[i - 1] : R, .1); back += `<path d="M${P(W)} Q${P({ x: (W.x + q.x) / 2 + 4, y: (W.y + q.y) / 2 + 4 })} ${P(q)}" stroke="${L.line}" stroke-width="${3 - i * .3}" fill="none" stroke-linecap="round"/><path d="M${P(W)} L${P(m)}" stroke="#a83a20" stroke-width=".6" opacity=".5"/>`; });
      back += `<path d="M${P(S)} L${P(E)} L${P(W)}" stroke="${L.line}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${P(S)} L${P(E)} L${P(W)}" stroke="#c86a3a" stroke-width="1.6" fill="none" opacity=".6" stroke-linejoin="round"/>
        <path d="M${P(W)} l-2 -9 l6 6 Z" fill="${L.accent}" stroke="${L.line}" stroke-width=".5"/>`;
      extra += local(at(pts, .38), limb(w, L)) + local(at(pts, .74), limb(w, L));
    }
    return `<defs>${lg('drFin', [[0, '#fff2b0'], [.5, '#f0c840'], [1, '#a8781a']], 1, 1)}${lg('drLimb', [[0, L.b0], [1, L.b2]], 1, 1)}${lg('drMane', [[0, '#fff6dc'], [1, '#e8c890']], 1, 1)}
      ${lg('drWing', [[0, '#8a2a1c', .94], [.6, '#541410', .92], [1, '#2a0806', .92]], 1, 1)}${lg('hdRock', [[0, '#4a3420'], [.3, '#2e1e10'], [1, '#140a04']])}</defs>
      ${back}${drBody(DR_PATH, w, v)}${extra}
      <path d="M0 336 V312 C20 306 30 310 44 316 C60 306 80 312 96 318 V336 Z" fill="url(#hdRock)"/>`;
  }
  function dragonHead(v) {
    const L = DR_LOOK[v], [h0, h1, h2] = L.head;
    const horns = v === 'A'
      ? `<path d="M-14 -12 C-4 -32 18 -46 48 -52 C30 -38 16 -24 4 -8 Z" fill="url(#drFin)" stroke="${L.line}" stroke-width=".9"/><path d="M-6 -2 C8 -12 26 -16 44 -14 C28 -6 14 0 2 4 Z" fill="url(#drFin)" stroke="${L.line}" stroke-width=".8"/>
         <path d="M-8 14 C2 22 14 30 30 32 C18 24 8 16 2 10 Z" fill="url(#drFin)" stroke="${L.line}" stroke-width=".8"/>`
      : v === 'B'
        ? `<path d="M-6 -12 C0 -24 8 -30 12 -40 M4 -26 L14 -30 M-2 -18 L-10 -26" stroke="#f4e2b0" stroke-width="2.6" fill="none" stroke-linecap="round"/>
           ${[0, 1, 2, 3, 4].map(i => `<path d="M${-2 + i * 2} ${-8 + i * 5} C${8 + i * 3} ${-10 + i * 6} ${18 + i * 2} ${-4 + i * 6} ${24 + i} ${2 + i * 6} C${14 + i * 2} ${2 + i * 5} ${6 + i} ${i * 5} 0 ${-2 + i * 5} Z" fill="url(#drMane)" stroke="#8a5a20" stroke-width=".5"/>`).join('')}`
        : `<path d="M-8 -12 C4 -26 22 -34 44 -38 C28 -28 14 -18 2 -6 Z" fill="url(#hdHorn)" stroke="#3a2a1a" stroke-width=".8"/><path d="M-2 -4 C12 -10 28 -10 42 -4 C28 -2 14 0 2 4 Z" fill="url(#hdHorn)" stroke="#3a2a1a" stroke-width=".8"/>
           <path d="M2 2 L16 0 L8 7 L18 12 L5 12 Z" fill="${L.line}" stroke="${L.line}" stroke-width=".6"/>`;
    const whiskers = v === 'B'
      ? `<path class="pr-ns" d="M-66 6 C-74 18 -60 34 -40 40 C-24 44 -14 52 -12 62" stroke="#f4e2b0" stroke-width="1.6" fill="none" stroke-linecap="round"/><path class="pr-ns" d="M-62 2 C-80 -4 -92 6 -88 20" stroke="#f4e2b0" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
      : '';
    return `<defs>${lg('drHead' + v, [[0, h0], [.6, h1], [1, h2]], 1, 1)}</defs>
      <g transform="translate(202 64) rotate(10)">${horns}
        <path d="M2 -10 C-8 -16 -22 -17 -34 -12 C-46 -8 -58 -4 -70 2 C-73 4 -72 8 -68 9 C-56 10 -44 10 -32 12 C-20 14 -8 14 2 10 Z" fill="url(#drHead${v})" stroke="${L.line}" stroke-width="1.3"/>
        <path d="M-66 9 C-52 12 -38 14 -24 16 C-14 17 -6 15 2 10 C-6 20 -22 22 -36 20 C-48 18 -58 14 -66 9 Z" fill="${h2}" stroke="${L.line}" stroke-width="1"/>
        <path d="M-56 11 L-54 16 L-52 11 Z M-42 12.5 L-40.5 17 L-39 12.5 Z" fill="#f4ecd8"/>
        <path d="M-34 -12 C-26 -19 -14 -21 -4 -17" stroke="${L.line}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M-32 -7 Q-24 -13 -16 -7 Q-24 -3 -32 -7 Z" fill="url(#hdEye)" stroke="#1a0800" stroke-width=".9"/>
        <ellipse cx="-24" cy="-7.4" rx="1" ry="3.4" fill="#120400"/><circle cx="-22" cy="-9" r=".8" fill="#fff"/>
        <ellipse cx="-65" cy="3" rx="2" ry="1" fill="${L.line}" transform="rotate(-18 -65 3)"/>
        <path d="M-62 -1 C-50 -6 -36 -9 -22 -9 M-58 6 C-46 6 -30 7 -16 9" stroke="${h0}" stroke-width=".8" fill="none" opacity=".55"/>
        <path d="M-44 -9 C-30 -15 -12 -17 0 -11" stroke="#fff4d0" stroke-width=".9" fill="none" opacity=".45"/>${whiskers}
      </g>`;
  }
  function dragonTail(v) {
    const L = DR_LOOK[v], pts = along(DR_TAIL, 40), end = pts[pts.length - 1];
    const tip = v === 'A'
      ? local(end, `<path d="M-2 0 C4 -12 16 -18 26 -16 C18 -10 14 -4 12 0 C14 4 18 10 26 16 C16 18 4 12 -2 0 Z" fill="url(#drFin)" stroke="${L.line}" stroke-width=".9"/>`)
      : v === 'B'
        ? local(end, `${[0, 1, 2, 3].map(i => `<path class="pr-drift" d="M-2 0 C6 ${-8 + i * 5} 14 ${-12 + i * 7} 24 ${-10 + i * 7} C16 ${-6 + i * 5} 8 ${-2 + i * 2} 2 0 Z" fill="url(#drMane)" stroke="#8a5a20" stroke-width=".5"/>`).join('')}`)
        : local(end, `<path d="M-2 0 L10 -9 L22 0 L10 9 Z" fill="url(#drHead${v})" stroke="${L.line}" stroke-width="1"/>`);
    return drBody(DR_TAIL, 11, v, 40) + tip;
  }
  function hoardMid() { return dragonMid(DRAGON); }
  const hoardDefs = `<defs>${lg('hdHorn', [[0, '#f4ecd8'], [1, '#8a7a5a']], 1, 0)}${coinDefs}${lg('pileG', [[0, '#fbd868'], [.6, '#c88e1a'], [1, '#6a4208']])}${rg('hdGlow', [[0, '#ffe08a', .55], [1, '#ffe08a', 0]])}${lg('hdWood', [[0, '#8a5228'], [1, '#4a2810']])}
    ${rg('hdEye', [[0, '#fff2a0'], [.4, '#ff9a20'], [1, '#6a1a00']])}${rg('hdEyeGlow', [[0, '#ff9a20', .55], [1, '#ff9a20', 0]])}
    ${lg('drFin', [[0, '#fff2b0'], [.5, '#f0c840'], [1, '#a8781a']], 1, 1)}${lg('drMane', [[0, '#fff6dc'], [1, '#e8c890']], 1, 1)}</defs>`;
  function hoardPop() {
    const v = DRAGON;
    return `${hoardDefs}${glow(120, 270, 116, 'hdGlow')}
      <!-- Goldberg ueber die ganze untere Reihe (verdeckt den Koerper dahinter) -->
      ${pile(116, 336, 232, 120, 110, 13)}${pile(192, 336, 116, 104, 66, 17)}
      <!-- 2000 (unten links): Truhe, Schwert -->
      <path d="M12 304 L58 304 L58 284 L12 284 Z" fill="url(#hdWood)" stroke="#1a0c04" stroke-width="1.2"/><path d="M12 291 H58 M12 298 H58" stroke="#3a1e0a" stroke-width="1"/>
      <path d="M12 284 V304 M58 284 V304 M35 284 V304" stroke="#c8943c" stroke-width="2"/><rect x="31" y="287" width="8" height="8" rx="1" fill="#e8b048" stroke="#3a1e0a" stroke-width=".8"/>
      ${pile(35, 286, 42, 10, 12, 5)}<path d="M10 284 L60 284 L66 260 L16 263 Z" fill="url(#hdWood)" stroke="#1a0c04" stroke-width="1.2"/><path d="M14 276 L62 272 M15 268 L64 265" stroke="#c8943c" stroke-width="2"/>
      <path d="M86 226 L90 274 L94 274 L90 226 Z" fill="#c8d0e0" stroke="#3a4050" stroke-width=".8"/><rect x="80" y="222" width="20" height="4" rx="1" fill="#e8b048"/><rect x="88" y="212" width="4" height="10" fill="#5a2a14"/><circle cx="90" cy="210" r="3.2" fill="#e8b048"/>
      <!-- 5000 (unten rechts): gekroentes Pony, Schwanzspitze ringelt sich darum -->
      ${glow(186, 236, 36, 'hdGlow')}
      ${bust(158, 198, .54, { body: '#fff0b0', shade: '#b07a14', mane: '#c08a1a', rim: 'rgba(255,250,220,.85)', eye: 'happy', id: 'hdPony',
        extra: '<path d="M44 14 L46 -6 L56 4 L64 -10 L72 4 L82 -6 L84 14 Z" fill="url(#cG)" stroke="#6a4208" stroke-width="1.6"/><circle cx="64" cy="4" r="3" fill="#ff5a7a"/><circle cx="52" cy="8" r="2" fill="#6bc8ff"/><circle cx="76" cy="8" r="2" fill="#5fd08a"/>' })}
      <path d="M152 248 L164 212" stroke="#e8b048" stroke-width="2.4"/><circle cx="165" cy="209" r="4" fill="#c83a5a" stroke="#5a3a08" stroke-width="1"/>
      ${dragonTail(v)}
      <!-- 1000 (oben rechts): Kopf -->
      ${glow(170, 66, 26, 'hdEyeGlow')}${dragonHead(v)}
      <path class="pr-ns pr-drift" d="M126 70 C118 68 114 62 116 56 M130 74 C124 76 118 74 116 70" stroke="#c8c0d8" stroke-width="1.2" fill="none" opacity=".45"/>
      ${spark(60, 236, .9, '#fff8e0', 'pr-twinkle')}${spark(120, 240, .7, '#fff8e0', 'pr-twinkle d2')}${spark(214, 250, .7, '#fff8e0', 'pr-twinkle d1')}${spark(150, 160, .5, '#fff8e0', 'pr-twinkle d3')}`;
  }

  // ===================== 3) The Climb (Schwierigkeiten) =====================
  function climbScene() {
    seed = 41;
    const aur = (y, c, o) => `<path d="M-10 ${y} C40 ${y - 30} 80 ${y + 20} 130 ${y - 10} S210 ${y - 26} 250 ${y}" stroke="${c}" stroke-width="16" fill="none" opacity="${o}" stroke-linecap="round"/>`;
    const cloud = (x, y, s, o) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="22" ry="6" fill="#e8d8f0"/><ellipse cx="-8" cy="-4" rx="10" ry="6" fill="#f4e8f8"/><ellipse cx="8" cy="-5" rx="12" ry="7" fill="#f4e8f8"/></g>`;
    let birds = ''; [[150, 150], [160, 144], [172, 152]].forEach(([x, y]) => { birds += `<path d="M${x - 3} ${y} q3 -3 3 0 q0 -3 3 0" stroke="#2a2040" stroke-width=".9" fill="none"/>`; });
    return `<defs>${lg('clSky', [[0, '#070c26'], [.3, '#1a2050'], [.55, '#4a3a78'], [.75, '#c87a8a'], [.9, '#f0b890']])}
      ${lg('clRockL', [[0, '#6a74a0'], [1, '#2a3050']], 1, 1)}${lg('clRockD', [[0, '#3a4064'], [1, '#1a1e36']], 1, 1)}
      ${lg('clSnow', [[0, '#ffffff'], [1, '#b8c8e8']])}${rg('clMoon', [[0, '#fff8e0', .9], [.3, '#fff8e0', .25], [1, '#fff8e0', 0]])}${lg('clFar', [[0, '#3a3a6a'], [1, '#2a2a50']])}</defs>
      <rect width="240" height="336" fill="url(#clSky)"/>${stars(80, 2, 150, 0, 240, 1)}
      ${aur(46, '#5affc8', .16)}${aur(64, '#8a6aff', .12)}${aur(30, '#5affc8', .08)}
      ${glow(196, 44, 42, 'clMoon')}<circle cx="196" cy="44" r="10" fill="#fff8e0"/><circle cx="192" cy="41" r="2" fill="#e8dcc0" opacity=".7"/><circle cx="199" cy="47" r="1.4" fill="#e8dcc0" opacity=".6"/>
      <path d="M-10 262 L14 216 L30 228 L48 198 L70 232 L90 214 L112 246 L130 232 L150 250 V280 H-10 Z" fill="url(#clFar)" opacity=".9"/>
      <path d="M48 198 L55 210 L50 208 L46 212 L41 208 Z M14 216 L19 224 L14 222 L10 226 Z" fill="#c8d4f0" opacity=".8"/>
      <path d="M-10 200 L30 150 L64 24 L110 120 L150 98 L240 210 L240 336 L-10 336 Z" fill="url(#clRockD)"/>
      <path d="M64 24 L110 120 L150 98 L240 210 L240 240 L130 150 L96 170 Z" fill="url(#clRockL)" opacity=".85"/>
      <path d="M64 24 L72 70 L60 96 L48 130 M110 120 L96 170 M150 98 L156 140" stroke="#14182e" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M64 24 L82 66 L74 62 L68 80 L60 64 L50 74 L54 52 Z" fill="url(#clSnow)"/>
      <path d="M150 98 L168 120 L160 118 L156 128 L148 116 L138 120 Z" fill="url(#clSnow)" opacity=".9"/>
      ${cloud(40, 176, 1, .5)}${cloud(200, 196, 1.2, .45)}${cloud(120, 150, .8, .35)}${birds}`;
  }
  function climbMid() {
    seed = 52;
    let pines = ''; for (let i = 0; i < 16; i++) { const x = 124 + i * 7.6 + rnd() * 4, y = 262 + rnd() * 24, h = 20 + rnd() * 16; pines += `<path d="M${f1(x)} ${f1(y - h)} L${f1(x + h * .32)} ${f1(y)} L${f1(x - h * .32)} ${f1(y)} Z" fill="${i % 2 ? '#14301e' : '#1e4228'}"/><path d="M${f1(x)} ${f1(y - h)} L${f1(x + h * .16)} ${f1(y - h * .5)} L${f1(x)} ${f1(y - h * .55)} Z" fill="#c8e0f0" opacity=".25"/>`; }
    let flowers = ''; for (let i = 0; i < 22; i++) { const x = rnd() * 120, y = 296 + rnd() * 34; flowers += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${(1 + rnd()).toFixed(1)}" fill="${['#ffe08a', '#ff9ad5', '#ffffff', '#c49bff'][i % 4]}"/>`; }
    return `<defs>${lg('clMeadow', [[0, '#6aaa5a'], [1, '#2a5a34']])}${lg('clForest', [[0, '#2a5a3a'], [1, '#14301e']])}${lg('clLedge', [[0, '#5a6488'], [1, '#2a3050']])}</defs>
      <path d="M-10 336 L-10 254 C30 240 70 250 110 260 C150 270 200 252 250 240 V336 Z" fill="url(#clForest)"/>${pines}
      <path d="M-10 336 L-10 284 C30 276 70 288 110 302 C130 310 140 322 150 336 Z" fill="url(#clMeadow)"/>
      <path d="M-10 284 C30 276 70 288 110 302 C130 310 140 322 150 336" stroke="#a8e090" stroke-width="1.2" fill="none" opacity=".6"/>${flowers}
      <path d="M244 100 L206 112 L170 116 L146 118 L138 126 L150 134 L176 136 L208 140 L244 146 Z" fill="url(#clLedge)" stroke="#14182e" stroke-width="1"/><path d="M244 100 L206 112 L170 116 L146 118 L150 113 L172 111 L204 106 L244 95 Z" fill="url(#clSnow)"/>
      <path d="M150 134 L156 148 L162 134 M182 136 L188 152 L194 136 M214 140 L220 156 L226 140" fill="#2a3050"/>
      <path d="M244 146 L226 150 L232 180 L244 186 Z" fill="#2a3050" opacity=".8"/>
      <path d="M28 330 C70 320 110 312 150 300 C190 288 210 270 214 240 C216 210 196 196 176 182 C162 172 152 160 148 140 M140 116 C124 104 98 96 84 78 C76 66 70 50 66 34" stroke="#f8e8c8" stroke-width="1.8" fill="none" stroke-dasharray="3 4" opacity=".85"/>`;
  }
  const scarf = c => `<path d="M48 78 C62 86 80 86 94 76 L94 88 C80 96 62 96 48 90 Z" fill="${c}" stroke="rgba(0,0,0,.4)" stroke-width="1"/><path d="M54 88 L50 106 L60 104 L62 90 Z" fill="${c}" stroke="rgba(0,0,0,.4)" stroke-width="1"/>`;
  const climbPops = [
    // Majestic: Krone, Umhang, Flagge, Sternbild
    () => `<defs>${lg('clFlag', [[0, '#fff4cc'], [1, '#c8943c']])}${rg('clCrownGlow', [[0, '#fff2c0', .65], [1, '#fff2c0', 0]])}${lg('clCape', [[0, '#8a2a5a'], [1, '#3a0a24']])}</defs>
      ${glow(56, 46, 34, 'clCrownGlow')}
      <path d="M84 16 V64" stroke="#3a2a1a" stroke-width="2"/><path d="M84 16 C94 12 102 22 112 18 L110 36 C100 40 94 30 84 34 Z" fill="url(#clFlag)" stroke="#6a4a10" stroke-width=".8"/>
      <path d="M93 22 L95 27 L100 27 L96 30 L97.5 35 L93 32 L88.5 35 L90 30 L86 27 L91 27 Z" fill="#8a5a10"/>
      ${bust(30, 28, .42, { body: '#f8f2e8', shade: '#b8a07a', mane: '#ffd36b', rim: 'rgba(255,255,255,.75)', eye: 'happy', id: 'clP0',
        under: '<path d="M50 70 C70 72 96 70 112 96 L50 96 Z" fill="url(#clCape)"/>',
        extra: '<path d="M44 14 L46 -6 L56 4 L64 -10 L72 4 L82 -6 L84 14 Z" fill="url(#clFlag)" stroke="#6a4a10" stroke-width="1.4"/><circle cx="64" cy="4" r="3" fill="#6bc8ff"/>' })}
      <path class="pr-ns" d="M20 20 L34 12 L44 22 L58 8" stroke="#fff8e0" stroke-width=".6" fill="none" opacity=".7"/>${[[20, 20], [34, 12], [44, 22], [58, 8]].map(([x, y], i) => spark(x, y, .45, '#fff8e0', `pr-twinkle d${i}`)).join('')}`,
    // Hard: Schutzbrille, Schal im Wind, Eispickel, Seil
    () => `${bust(160, 72, .42, { body: '#c0c8e0', shade: '#5a6488', mane: '#2a3050', rim: 'rgba(220,230,255,.75)', eye: 'open', id: 'clP1',
        extra: `${scarf('#c83a3a')}<path d="M94 80 C104 78 112 70 120 72 C112 78 106 86 94 88 Z" fill="#c83a3a"/><path d="M26 30 C40 22 60 24 74 30" stroke="#2a2a3a" stroke-width="5" fill="none"/><circle cx="37" cy="30" r="7" fill="#6bc8ff" stroke="#2a2a3a" stroke-width="2.4"/><path d="M33 27 L38 32" stroke="#fff" stroke-width="1.6" opacity=".8"/>` })}
      <path d="M204 118 C208 102 214 92 220 84" stroke="#a87a4a" stroke-width="2" stroke-linecap="round"/><path d="M214 86 C218 80 226 80 228 86 L222 88 Z" fill="#c8d0e8" stroke="#3a4050" stroke-width=".6"/>
      <circle cx="146" cy="122" r="2" fill="#8a8a9a"/>
      ${Array.from({ length: 14 }, (_, i) => `<circle class="pr-drift ns" style="animation-delay:-${i * .6}s" cx="${126 + (i * 37) % 110}" cy="${24 + (i * 53) % 90}" r="${.7 + (i % 3) * .3}" fill="#fff" opacity=".8"/>`).join('')}`,
    // Easy: Wiese, Wegweiser, Rucksack, Schmetterling
    () => `<path d="M90 266 V302" stroke="#5a3a1a" stroke-width="2.6"/><path d="M78 262 L106 262 L112 268 L106 274 L78 274 Z" fill="#8a5a2a" stroke="#3a2210" stroke-width="1"/>
      <text x="93" y="271" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-size="6" font-weight="700" fill="#f8e8c8">SUMMIT</text>
      <path d="M102 278 L78 278 L74 284 L78 290 L102 290 Z" fill="#7a4a22" stroke="#3a2210" stroke-width="1"/><text x="89" y="287" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-size="5.5" font-weight="700" fill="#f8e8c8">CAMP</text>
      ${bust(14, 248, .44, { body: '#ecc890', shade: '#b07d18', mane: '#7a4a20', rim: 'rgba(255,240,200,.65)', eye: 'happy', id: 'clP2',
        under: '<path d="M74 52 C90 50 100 60 98 80 L80 84 C74 72 72 62 74 52 Z" fill="#3a7a4a" stroke="#14301e" stroke-width="1.4"/><path d="M78 60 H96" stroke="#e8c060" stroke-width="2"/>',
        extra: scarf('#e8b048') })}
      <g class="pr-drift ns"><path d="M70 236 c-4 -6 -8 -2 -4 2 c-4 4 0 6 4 0 c4 6 8 4 4 0 c4 -4 0 -8 -4 -2 Z" fill="#ff9ad5" stroke="#5a2040" stroke-width=".5"/></g>`,
    // Normal: Wald, Laterne, Lagerfeuer
    () => `<defs>${rg('clLamp', [[0, '#ffd88a', .7], [1, '#ffd88a', 0]])}${rg('clFire', [[0, '#ffb24a', .7], [1, '#ff7a2a', 0]])}</defs>
      ${glow(150, 296, 26, 'clFire')}<path d="M140 300 L160 300 M142 302 L158 296" stroke="#4a2a14" stroke-width="2.6" stroke-linecap="round"/>
      <path class="pr-flicker" d="M150 282 C156 290 156 296 150 299 C144 296 144 290 150 282 Z" fill="#ff9a3a"/><path class="pr-flicker" d="M150 289 C153 293 153 296 150 298 C147 296 147 293 150 289 Z" fill="#fff2c0"/>
      <path class="pr-drift ns" d="M150 278 C146 270 154 266 150 258" stroke="#c8c0d8" stroke-width="1.4" fill="none" opacity=".5"/>
      ${glow(212, 244, 24, 'clLamp')}
      ${bust(168, 232, .42, { body: '#dcb47e', shade: '#9a6a28', mane: '#5a3418', rim: 'rgba(255,220,150,.75)', eye: 'open', id: 'clP3', extra: scarf('#3a6ac8') })}
      <path d="M212 232 V240" stroke="#3a2a1a" stroke-width="1.2"/><rect x="207" y="240" width="10" height="12" rx="2" fill="#ffd88a" stroke="#5a3a1a" stroke-width="1"/><path class="pr-flicker" d="M212 243 C214 246 214 248 212 249 C210 248 210 246 212 243 Z" fill="#fff"/>`
  ];

  // ===================== Varianten (Nutzer: je 3 Vorschlaege fuer Hall + Climb) =====================
  const laurelX = `<path d="M52 8 C60 2 74 4 82 12" stroke="#c8aa6e" stroke-width="2.2" fill="none"/>${[[54, 7, -30], [60, 4, -15], [67, 3, 0], [74, 5, 15], [80, 9, 30]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.2" transform="rotate(${r} ${x} ${y})" fill="#e8c060" stroke="#6a4a10" stroke-width=".6"/>`).join('')}`;
  const elderHorns = id => `<path d="M60 18 C62 2 76 -6 84 -14 C80 0 74 10 70 22 Z M48 15 C46 0 54 -10 58 -18 C58 -4 56 6 56 16 Z" fill="url(#${id})" stroke="#0a2018" stroke-width="1"/>`;
  const crownX = '<path d="M44 14 L46 -6 L56 4 L64 -10 L72 4 L82 -6 L84 14 Z" fill="url(#cG)" stroke="#6a4208" stroke-width="1.6"/><circle cx="64" cy="4" r="3" fill="#ff5a7a"/><circle cx="52" cy="8" r="2" fill="#6bc8ff"/><circle cx="76" cy="8" r="2" fill="#5fd08a"/>';
  const wingsAt = (cx, cy, s, id) => [-1, 1].map(side => [0, 1, 2, 3, 4].map(i => `<path transform="translate(${cx} ${cy}) scale(${side * s} ${s})" d="M10 ${20 - i * 7} C${30 + i * 6} ${8 - i * 10} ${44 + i * 4} ${-6 - i * 9} 50 ${-26 - i * 7} C${34 + i} ${-12 - i * 7} 22 ${4 - i * 7} 10 ${12 - i * 7} Z" fill="url(#${id})" stroke="#7a5010" stroke-width=".6"/>`).join('')).join('');
  const confetti = (n, x0, x1, y0, y1, s) => { seed = s; let o = ''; for (let i = 0; i < n; i++) o += `<rect class="pr-ns pr-drift" style="animation-delay:-${(rnd() * 9).toFixed(1)}s" x="${f1(x0 + rnd() * (x1 - x0))}" y="${f1(y0 + rnd() * (y1 - y0))}" width="2.4" height="1.3" transform="rotate(${Math.round(rnd() * 180)} ${f1(x0 + (x1 - x0) / 2)} ${f1(y0)})" fill="${['#ffd36b', '#ff7ad9', '#6bc8ff', '#7bffb4', '#fff'][i % 5]}"/>`; return o; };

  // ---------- Climb C: Der Turm ----------
  function climbC() {
    seed = 71;
    const scene = `<defs>${lg('spSky', [[0, '#0c0a2a'], [.5, '#3a2a6a'], [.8, '#8a4a7a'], [1, '#d08a8a']])}${rg('spMoon', [[0, '#fff8e0', .85], [.3, '#fff8e0', .25], [1, '#fff8e0', 0]])}</defs>
      <rect width="240" height="336" fill="url(#spSky)"/>${stars(70, 0, 200, 0, 240, 1)}
      ${glow(36, 40, 34, 'spMoon')}<circle cx="36" cy="40" r="9" fill="#fff8e0"/><circle cx="40" cy="37" r="8" fill="#2a2050"/>
      ${[[34, 170, 1], [208, 200, 1.2], [200, 80, .7]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})" opacity=".7"><path d="M-22 0 H22 L12 10 L4 22 L-6 14 L-14 8 Z" fill="#3a2a5a"/><path d="M-22 0 H22" stroke="#6a5a9a" stroke-width="1.2"/><path d="M-10 0 L-8 -8 L-4 0 M6 0 L9 -10 L12 0" fill="#2a4a3a"/></g>`).join('')}
      <path d="M-10 300 C40 290 80 300 120 294 C160 288 200 298 250 292 V336 H-10 Z" fill="#2a2046"/>
      <path d="M-10 312 C50 304 100 316 150 308 C190 302 220 310 250 306 V336 H-10 Z" fill="#c8b8e8" opacity=".25"/>`;
    let blocks = ''; for (let y = 48; y < 336; y += 9) for (let x = 90 + ((y / 9) % 2) * 8; x < 150; x += 16) blocks += `<rect x="${x}" y="${y}" width="15" height="8" fill="none" stroke="#2a2440" stroke-width=".6" opacity=".7"/>`;
    let stairs = ''; for (let k = 0; k < 7; k++) { const y = 322 - k * 44; stairs += `<path d="M88 ${y} L152 ${y - 24}" stroke="#a898c8" stroke-width="5" stroke-linecap="square"/><path d="M88 ${y + 3} L152 ${y - 21}" stroke="#2a2440" stroke-width="1.2"/>`; }
    let wins = ''; [[104, 300], [130, 252], [108, 200], [134, 154], [104, 106], [130, 70]].forEach(([x, y]) => { wins += `<path d="M${x} ${y} V${y - 8} A4 4 0 0 1 ${x + 8} ${y - 8} V${y} Z" fill="#ffd080" stroke="#2a2440" stroke-width=".8"/>`; });
    const balcony = (x0, x1, y) => `<path d="M${x0} ${y} H${x1} V${y + 6} H${x0} Z" fill="url(#spStone)" stroke="#1a1430" stroke-width="1"/><path d="M${x0 + 4} ${y + 6} L${(x0 + x1) / 2} ${y + 18} L${x1 - 4} ${y + 6}" fill="#3a3058" stroke="#1a1430" stroke-width=".8"/>`;
    const mid = `<defs>${lg('spTower', [[0, '#3a3050'], [.45, '#6a6088'], [1, '#2a2440']], 1, 0)}${lg('spRoof', [[0, '#5a3a8a'], [1, '#2a1a4a']], 1, 0)}${lg('spStone', [[0, '#8a80a8'], [1, '#4a4068']])}</defs>
      <rect x="88" y="44" width="64" height="292" fill="url(#spTower)" stroke="#1a1430" stroke-width="1.2"/>${blocks}${stairs}${wins}
      <path d="M80 46 L120 0 L160 46 Z" fill="url(#spRoof)" stroke="#1a1430" stroke-width="1.2"/><path d="M90 46 L120 10 L150 46" stroke="#8a6ac8" stroke-width=".8" fill="none" opacity=".6"/>
      <path d="M80 46 H160" stroke="#c8aa6e" stroke-width="2"/>
      ${balcony(30, 90, 86)}${balcony(150, 212, 110)}${balcony(150, 212, 248)}${balcony(34, 90, 262)}`;
    const rail = (x0, x1, y) => `<path d="M${x0} ${y - 10} H${x1}" stroke="#c8b8e8" stroke-width="1.6"/>${Array.from({ length: Math.floor((x1 - x0) / 8) + 1 }, (_, i) => `<path d="M${x0 + i * 8} ${y - 10} V${y}" stroke="#c8b8e8" stroke-width="1.2"/>`).join('')}`;
    const pop = () => `<defs>${lg('spFlag', [[0, '#fff4cc'], [1, '#c8943c']])}${coinDefs}${rg('spGlow', [[0, '#fff2c0', .6], [1, '#fff2c0', 0]])}${rg('spLamp', [[0, '#ffd88a', .7], [1, '#ffd88a', 0]])}</defs>
      <path d="M120 0 V-14" stroke="#3a2a1a" stroke-width="1.6"/>
      ${glow(56, 62, 30, 'spGlow')}
      ${bust(34, 46, .42, { flip: true, body: '#f8f2e8', shade: '#b8a07a', mane: '#ffd36b', rim: 'rgba(255,255,255,.8)', eye: 'happy', id: 'spP0', extra: crownX })}
      <path d="M34 86 V40" stroke="#3a2a1a" stroke-width="1.8"/><path d="M34 40 C24 36 18 44 10 42 L12 56 C20 58 26 50 34 54 Z" fill="url(#spFlag)" stroke="#6a4a10" stroke-width=".8"/>
      ${rail(30, 90, 86)}
      ${bust(164, 70, .42, { body: '#c0c8e0', shade: '#5a6488', mane: '#2a3050', rim: 'rgba(220,230,255,.75)', eye: 'open', id: 'spP1', extra: '<path d="M48 78 C62 86 80 86 94 76 L94 88 C80 96 62 96 48 90 Z" fill="#c83a3a"/>' })}${rail(150, 212, 110)}
      ${bust(38, 222, .42, { flip: true, body: '#ecc890', shade: '#b07d18', mane: '#7a4a20', rim: 'rgba(255,240,200,.7)', eye: 'happy', id: 'spP2' })}${rail(34, 90, 262)}
      ${glow(208, 228, 20, 'spLamp')}<rect x="204" y="226" width="8" height="10" rx="1.6" fill="#ffd88a" stroke="#5a3a1a" stroke-width="1"/><path d="M208 220 V226" stroke="#3a2a1a" stroke-width="1"/>
      ${bust(162, 208, .42, { body: '#dcb47e', shade: '#9a6a28', mane: '#5a3418', rim: 'rgba(255,220,150,.75)', eye: 'open', id: 'spP3' })}${rail(150, 212, 248)}
      ${spark(180, 20, .7, '#fff8e0', 'pr-twinkle')}${spark(66, 140, .5, '#fff8e0', 'pr-twinkle d2')}${spark(220, 170, .6, '#fff8e0', 'pr-twinkle d1')}`;
    return { scene, mid, pop };
  }

  const climbFinal = climbC();
  const MOTIFS = [
    { id: 'gods', title: 'Hall of Gods', scene: hallScene(), mid: hallMid(), pops: Array(4).fill(hallPop), names: ['Riot God', 'Elder God', 'Ultimate God', 'Hall of Gods'], ids: ['gods-riot', 'gods-elder', 'gods-ultimate', 'gods-all'] },
    { id: 'hoard', title: "Dragon's Hoard", scene: hoardScene(), mid: hoardMid(), pops: Array(4).fill(hoardPop), names: ['500 LP', '1,000 LP', '2,000 LP', '5,000 LP'], ids: ['lp-500', 'lp-1000', 'lp-2000', 'lp-5000'] },
    { id: 'climb', title: 'The Climb', scene: climbFinal.scene, mid: climbFinal.mid, pops: Array(4).fill(climbFinal.pop), names: ['Majestic', 'Hard', 'Easy', 'Normal'], ids: ['climb-majestic', 'climb-hard', 'climb-easy', 'climb-normal'] }
  ];
  const NUMS = { gods: [1, 2, 3, 4], hoard: [5, 6, 7, 8], climb: [12, 11, 9, 10] };

  // ===================== Karte =====================
  const POP_SLABS = 12, MID_SLABS = 6;
  let uid = 0;
  const popCache = {};
  // slabs: Anzahl Dicke-Schichten der Figur (Mittelebene anteilig). Einzelansicht
  // nutzt mehr, duennere Schichten - sonst sieht man beim starken Kippen die Stufen.
  function cardOf(m, slot, { flat = false, slabs = POP_SLABS } = {}) {
    const midSlabs = Math.max(MID_SLABS, Math.round(slabs * MID_SLABS / POP_SLABS));
    const vx = (slot % 2) * 120, vy = Math.floor(slot / 2) * 168;
    const key = m.id + slot;
    if (!popCache[key]) popCache[key] = m.pops[slot]();
    const pop = popCache[key];
    const svg = (c, inset = 0) => `<svg viewBox="${vx + inset} ${vy + inset} ${120 - inset * 2} ${168 - inset * 2}" preserveAspectRatio="xMidYMid slice">${c}</svg>`;
    // Dicke-Schicht = Seitenwand: Inhalt weichzeichnen (sonst ergeben die Umrisslinien
    // jeder Kopie Nadelstreifen), Kontur ueber die Alpha-Kurve wieder scharf (Nutzer v6.18.0)
    const dil = (c, r) => { const id = `dl${++uid}`; return `<defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="${r}"/><feGaussianBlur stdDeviation=".9"/><feComponentTransfer><feFuncA type="linear" slope="4" intercept="-2"/></feComponentTransfer></filter></defs><g filter="url(#${id})">${c}</g>`; };
    let layers = '';
    if (flat) {
      layers = `<div class="ly mid">${svg(m.mid, 1.6)}</div><div class="ly pop">${svg(pop, 1.6)}</div>`;
    } else {
      layers += `<div class="ly sh mid-sh">${svg(m.mid, 1.6)}</div>`;
      for (let k = 0; k < midSlabs; k++) layers += `<div class="ly mid slab" style="--i:${(k * MID_SLABS / midSlabs).toFixed(3)};--shade:${(.3 + k / midSlabs * .25).toFixed(2)}">${svg(dil(m.mid, .6), 1.6)}</div>`;
      layers += `<div class="ly mid" style="--i:${MID_SLABS}">${svg(m.mid, 1.6)}</div>`;
      layers += `<div class="ly sh">${svg(pop, 1.6)}</div>`;
      for (let k = 0; k < slabs; k++) layers += `<div class="ly pop slab" style="--i:${(k * POP_SLABS / slabs).toFixed(3)};--shade:${(.28 + k / slabs * .3).toFixed(2)}">${svg(dil(pop, .8), 1.6)}</div>`;
      layers += `<div class="ly pop" style="--i:${POP_SLABS}">${svg(pop, 1.6)}</div>`;
    }
    return `<div class="promo" data-m="${m.id}" data-s="${slot}" data-id="${m.ids[slot]}">
      <div class="p-scene">${svg(m.scene)}<div class="p-foil"></div><div class="p-glint"></div><div class="p-shade"></div></div>
      ${layers}
      <div class="p-stamp">PROMO</div>
      <div class="p-label"><b>${m.names[slot]}</b><span><em>${m.title.toUpperCase()}</em><em>P${String(NUMS[m.id][slot]).padStart(2, '0')}</em></span></div>
    </div>`;
  }
  // Tiefe wie stickers.js tiltTo: Hologramm-Abstand ~30 % der Kartenbreite,
  // Schichtabstand ~1 %, Perspektive ~3 Kartenbreiten (hier fuer die Gruppe)
  function depth(z, w, P) {
    const lift = w * .3;
    z.style.setProperty('--lift', `${lift.toFixed(1)}px`);
    z.style.setProperty('--step', `${(w * .0095).toFixed(2)}px`);
    z.style.setProperty('--comp', ((P - lift) / P).toFixed(4));
  }

  // ----- oeffentliche Schnittstelle -----
  const CATALOG = [];
  MOTIFS.forEach(m => m.ids.forEach((id, slot) => CATALOG.push({ id, motif: m.id, slot, name: m.names[slot], title: m.title, num: NUMS[m.id][slot] })));
  const byId = id => CATALOG.find(c => c.id === id);
  const card = (id, opts) => { const c = byId(id); return c ? cardOf(MOTIFS.find(m => m.id === c.motif), c.slot, opts) : ''; };
  window.PROMOS = { MOTIFS: MOTIFS.map(m => ({ id: m.id, title: m.title, ids: m.ids, names: m.names })), CATALOG, byId, card, depth };
})();
