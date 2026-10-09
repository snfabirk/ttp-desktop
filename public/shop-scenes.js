// Shop-Themes mit Szene (v5.19.0) - Designs aus theme-lab/shop-*.html (vom
// Nutzer abgenommen). Melden sich bei theme-fx.js an (TTPThemeFx.register);
// theme-fx.js steuert Ein-/Ausblenden und die Animations-Einstellung.
//   Animated (mit Easter Egg): abyss (Deep Abyss - Koeder anklicken weckt den
//     Anglerfisch), neon (Neon City - kaputtes "OPEN 24/7"-Schild 3x anklicken)
//   Fancy (bewegt): starfall, koi
//   Refined (stehend): desert, forest
(function () {
  if (!window.TTPThemeFx || window.TTPShopScenes) return;
  window.TTPShopScenes = true;

  // ===================== abyss =====================
  function abyssScene(ctx) {
    const listeners = [];
    const on = (target, ev, fn, opt) => { listeners.push([target, ev, fn, opt]); };
    const INTERACTIVE = window.TTPThemeFx.INTERACTIVE;

const cv = document.createElement('canvas'); cv.className = 'shop-scene-cv'; Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: '-1', pointerEvents: 'none', opacity: '0' }); const cx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
on(window, 'resize', resize); resize();
const rand = (a, b) => a + Math.random() * (b - a);
const mouse = { x: -999, y: -999, sx: -999, sy: -999, on: 0, target: 0 };
on(window, 'mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.target = 1; if (mouse.sx < -900) { mouse.sx = mouse.x; mouse.sy = mouse.y; } });
on(document, 'mouseleave', () => { mouse.target = 0; });

// ----- Meeresschnee: langsam sinkende Partikel, leuchten nahe der Maus auf -----
const snow = Array.from({ length: 170 }, () => ({ x: rand(0, W), y: rand(0, H), r: rand(.5, 1.8), vy: rand(4, 14), ph: rand(0, 6.3), a: rand(.15, .45) }));
// ----- Blasen: ab und zu eine kleine Kette von unten -----
const bubbles = [];
let nextBubbles = 2;
// ----- Quallen -----
const HUES = [[120, 230, 255], [170, 140, 255], [255, 140, 210], [110, 255, 220]];
function newJelly(anywhere) {
  const s = rand(26, 58);
  return { x: rand(W * .05, W * .95), y: anywhere ? rand(H * .15, H * .95) : H + s * 3, s, vx: rand(-6, 6), vy: 0, ph: rand(0, 6.3), period: rand(2.6, 4.2), col: HUES[Math.floor(Math.random() * HUES.length)], tent: Math.floor(rand(6, 10)), tilt: 0 };
}
const jellies = Array.from({ length: 7 }, () => newJelly(true));

function drawRays(t) {
  cx.save(); cx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const base = W * (.08 + i * .17) + Math.sin(t * .13 + i * 1.7) * W * .04;
    const spread = W * (.05 + .03 * Math.sin(t * .2 + i));
    const len = H * (.75 + .15 * Math.sin(t * .17 + i * 2.1));
    const g = cx.createLinearGradient(0, 0, 0, len);
    const a = .045 + .025 * Math.sin(t * .4 + i * 1.3);
    g.addColorStop(0, `rgba(150, 230, 255, ${a})`); g.addColorStop(1, 'rgba(150, 230, 255, 0)');
    cx.fillStyle = g;
    cx.beginPath();
    cx.moveTo(base - spread * .25, 0); cx.lineTo(base + spread * .25, 0);
    cx.lineTo(base + spread + W * .06, len); cx.lineTo(base - spread + W * .06, len); cx.closePath(); cx.fill();
  }
  // weiches Gegenlicht der Oberflaeche
  const top = cx.createLinearGradient(0, 0, 0, H * .25);
  top.addColorStop(0, 'rgba(120, 210, 240, .10)'); top.addColorStop(1, 'rgba(120, 210, 240, 0)');
  cx.fillStyle = top; cx.fillRect(0, 0, W, H * .25);
  cx.restore();
}

function drawJelly(j, t) {
  const p = (t / j.period + j.ph) % 1;                 // Pulsphase 0..1
  const squeeze = p < .25 ? Math.sin(p / .25 * Math.PI / 2) : Math.cos((p - .25) / .75 * Math.PI / 2); // zusammenziehen, langsam oeffnen
  const bw = j.s * (1 - .16 * squeeze), bh = j.s * (.62 + .14 * squeeze);
  const [r, g, b] = j.col;
  cx.save(); cx.translate(j.x, j.y); cx.rotate(j.tilt);
  // Tentakel
  cx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < j.tent; k++) {
    const sx = (k / (j.tent - 1) - .5) * bw * 1.4;
    const len = j.s * (1.6 + (k % 3) * .4);
    cx.beginPath(); cx.moveTo(sx, 0);
    for (let s = 1; s <= 8; s++) {
      const yy = len * s / 8;
      cx.lineTo(sx + Math.sin(t * 1.6 + k + s * .7 + j.ph) * (2 + s * 1.3) - j.vx * s * .06, yy);
    }
    cx.strokeStyle = `rgba(${r}, ${g}, ${b}, .16)`; cx.lineWidth = 1.1; cx.stroke();
  }
  // Mundarme (dicker, kurz)
  for (let k = -1; k <= 1; k += 2) {
    cx.beginPath(); cx.moveTo(k * bw * .12, 0);
    cx.quadraticCurveTo(k * bw * .3 + Math.sin(t * 1.2 + j.ph) * 4, j.s * .6, k * bw * .1, j.s * 1.1);
    cx.strokeStyle = `rgba(${r}, ${g}, ${b}, .22)`; cx.lineWidth = 3; cx.stroke();
  }
  // Leuchthof
  const halo = cx.createRadialGradient(0, -bh * .3, 0, 0, -bh * .3, j.s * 1.6);
  halo.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${.16 + .08 * squeeze})`); halo.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  cx.fillStyle = halo; cx.beginPath(); cx.arc(0, -bh * .3, j.s * 1.6, 0, 7); cx.fill();
  // Schirm
  cx.beginPath();
  cx.moveTo(-bw, 0);
  cx.bezierCurveTo(-bw, -bh * 1.35, bw, -bh * 1.35, bw, 0);
  for (let s = 0; s <= 10; s++) cx.lineTo(bw - s / 10 * 2 * bw, Math.sin(s * 1.9 + t * 3) * 1.6 + 2);
  cx.closePath();
  const bell = cx.createRadialGradient(0, -bh * .55, 0, 0, -bh * .3, bw * 1.2);
  bell.addColorStop(0, `rgba(${Math.min(255, r + 80)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 20)}, .55)`);
  bell.addColorStop(.6, `rgba(${r}, ${g}, ${b}, .26)`); bell.addColorStop(1, `rgba(${r}, ${g}, ${b}, .12)`);
  cx.fillStyle = bell; cx.fill();
  cx.strokeStyle = `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 40)}, 255, .55)`; cx.lineWidth = 1.2; cx.stroke();
  // innere Organe: vier zarte Boegen
  cx.globalAlpha = .5;
  for (let k = 0; k < 4; k++) {
    cx.beginPath(); cx.ellipse((k - 1.5) * bw * .28, -bh * .45, bw * .1, bh * .18, 0, 0, 7);
    cx.strokeStyle = `rgba(255, 255, 255, .35)`; cx.lineWidth = .8; cx.stroke();
  }
  cx.restore();
  return squeeze;
}

// ----- Easter Egg: der Koeder des Anglerfischs -----
const lure = { on: 0, target: 0, x: 0, y: 0, next: 6, life: 0 };
let angler = null;
on(window, 'click', e => {
  if (angler || lure.on < .6) return;
  if ((e.target.closest && e.target.closest(INTERACTIVE))) return;
  const lx = lure.x + Math.sin(performance.now() / 700) * 6, ly = lure.y + Math.sin(performance.now() / 500) * 4;
  if (Math.hypot(e.clientX - lx, e.clientY - ly) < 26) cv.style.zIndex = '9000', angler = { t: 0, x: lx, y: ly, dir: lx < W / 2 ? -1 : 1 }; // Fisch kommt von der Seite mit mehr Platz
});

// Anglerfisch v2: plastisch (Licht nur vom Koeder, Hauttextur, Rachen mit
// Tiefe, zwei Zahnreihen) und bedrohlicher: kommt langsam aus dem Dunkel,
// oeffnet das Maul, schnellt dann auf den Betrachter zu - Schwarz.
const SPECK = Array.from({ length: 260 }, () => ({ x: rand(-.9, .55), y: rand(-.5, .35), r: rand(.002, .007), a: rand(.2, 1) }));
const WRINKLES = Array.from({ length: 14 }, (_, k) => ({ x: rand(.05, .42), y: rand(-.32, .2), l: rand(.04, .1), c: rand(-.03, .03) }));
function anglerBody(S, open) {
  const jaw = open * S * .16;
  const head = new Path2D();
  head.moveTo(S * .47, -S * .07);
  head.bezierCurveTo(S * .44, -S * .36, S * .16, -S * .52, -S * .14, -S * .45);
  head.bezierCurveTo(-S * .44, -S * .37, -S * .62, -S * .16, -S * .74, -S * .03);
  head.lineTo(-S * .98, -S * .22); head.quadraticCurveTo(-S * .9, 0, -S * .98, S * .2); head.lineTo(-S * .74, S * .06);
  head.bezierCurveTo(-S * .5, S * .3, -S * .02, S * .36, S * .3, S * .22 + jaw * .45);
  head.lineTo(S * .2, S * .01); head.closePath();
  const lower = new Path2D();                         // massiger, vorstehender Unterkiefer
  lower.moveTo(S * .18, S * .0);
  lower.quadraticCurveTo(S * .42, S * .05 + jaw * .55, S * .6, S * .1 + jaw);
  lower.quadraticCurveTo(S * .58, S * .2 + jaw, S * .4, S * .26 + jaw * .6);
  lower.quadraticCurveTo(S * .1, S * .3, -S * .05, S * .2);
  lower.closePath();
  const mouth = new Path2D();
  mouth.moveTo(S * .47, -S * .07);
  mouth.quadraticCurveTo(S * .3, S * .0, S * .19, S * .01);
  mouth.quadraticCurveTo(S * .42, S * .05 + jaw * .55, S * .6, S * .1 + jaw);
  mouth.closePath();
  return { head, lower, mouth, jaw };
}

function drawAngler(dt) {
  angler.t += dt;
  const a = angler, t = a.t;
  const S = Math.min(W, H) * .55;
  // Ablauf: 0-1.8 auftauchen, 1.8-3.0 Maul oeffnet sich langsam, 3.0-3.3 Satz
  // nach vorn (Richtung Betrachter), 3.3-3.42 beisst zu, dann Schwarz
  const appear = Math.min(1, Math.max(0, (t - .4) / 1.4));
  const open = t < 1.8 ? 0 : t < 3.3 ? Math.min(1, (t - 1.8) / 1.2) : Math.max(0, 1 - (t - 3.3) / .12); // ... und schnappt zu
  const ease = x => x * x * (3 - 2 * x);
  const lunge = t < 3 ? 0 : Math.min(1, (t - 3) / .42);
  const zoom = 1 + .12 * appear + ease(lunge) * 2.2;
  const blackout = t < 3.4 ? 0 : t < 4.2 ? Math.min(1, (t - 3.4) / .12) : Math.max(0, 1 - (t - 4.2) / .9);
  // Erschuetterung beim Zubeissen
  const shake = t > 3.3 && t < 3.5 ? (Math.random() - .5) * S * .03 : 0;
  const dark = Math.min(1, t / .8) * (t > 4.2 ? Math.max(0, 1 - (t - 4.2) / .9) : 1);
  const drift = Math.sin(t * 1.3) * S * .01;

  cx.save();
  cx.fillStyle = `rgba(0, 3, 6, ${dark * .85})`; cx.fillRect(0, 0, W, H);
  if (t < 4.2) {
    const lx = S * .72, ly = -S * .1;               // Koeder relativ zum Fisch
    // Ankerpunkt: der Koeder bleibt, wo man geklickt hat; beim Satz wird um
    // die Maulmitte herangezoomt
    const mx = S * .4, my = S * .05;
    cx.translate(a.x + shake, a.y + drift + shake * .6);
    cx.scale(a.dir, 1);
    cx.translate(-lx, -ly);
    cx.translate(mx, my); cx.scale(zoom, zoom); cx.translate(-mx, -my);
    // Kiefer als Gelenk: Form immer "weit offen", der Unterkiefer dreht sich
    // um das Kiefergelenk - bei open = 0 ist das Maul wirklich zu (Zubeissen)
    const B = anglerBody(S, 1);
    const hx = S * .19, hy = S * .01, jawA = -(1 - open) * .72;
    const rot = (x, y) => { const c = Math.cos(jawA), sn = Math.sin(jawA), dx = x - hx, dy = y - hy; return [hx + dx * c - dy * sn, hy + dx * sn + dy * c]; };
    const jawOn = () => { cx.save(); cx.translate(hx, hy); cx.rotate(jawA); cx.translate(-hx, -hy); };
    const light = (x, y, r, stops) => { const g = cx.createRadialGradient(lx, ly, 0, lx, ly, r); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };

    // Brustflosse hinter dem Koerper, durchscheinend mit Strahlen
    cx.save();
    cx.translate(-S * .12, S * .12); cx.rotate(.35 + Math.sin(t * 2.2) * .12);
    cx.fillStyle = `rgba(30, 55, 60, ${.35 * appear})`;
    cx.beginPath(); cx.moveTo(0, 0); cx.quadraticCurveTo(-S * .12, S * .2, -S * .3, S * .14); cx.quadraticCurveTo(-S * .16, S * .02, 0, 0); cx.fill();
    cx.strokeStyle = `rgba(90, 140, 140, ${.18 * appear})`; cx.lineWidth = 1;
    for (let k = 1; k < 6; k++) { cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(-S * .3 * k / 6 - S * .04, S * (.2 - k * .012)); cx.stroke(); }
    cx.restore();

    // Koerper: Grundfarbe fast schwarz, Licht nur vom Koeder (staerker abfallend)
    const body = light(0, 0, S * .9, [[0, `rgba(78, 112, 112, ${appear})`], [.25, `rgba(30, 48, 50, ${appear})`], [.6, `rgba(8, 14, 16, ${appear})`], [1, `rgba(2, 4, 6, ${appear})`]]);
    cx.fillStyle = body; cx.fill(B.head);
    // Volumen: Bauch und Ruecken dunkler (Woelbung)
    cx.save(); cx.clip(B.head);
    const vol = cx.createLinearGradient(0, -S * .5, 0, S * .35);
    vol.addColorStop(0, 'rgba(0,0,0,.55)'); vol.addColorStop(.35, 'rgba(0,0,0,0)'); vol.addColorStop(.75, 'rgba(0,0,0,.15)'); vol.addColorStop(1, 'rgba(0,0,0,.7)');
    cx.fillStyle = vol; cx.fillRect(-S, -S * .6, S * 1.8, S);
    // Hauttextur: Poren/Warzen, nur sichtbar, wo Licht hinfaellt
    SPECK.forEach(p => {
      const px = p.x * S, py = p.y * S, near = Math.max(0, 1 - Math.hypot(px - lx, py - ly) / (S * .75));
      if (near < .05) return;
      cx.fillStyle = `rgba(150, 190, 185, ${.28 * near * p.a * appear})`; cx.beginPath(); cx.arc(px, py, p.r * S, 0, 7); cx.fill();
      cx.fillStyle = `rgba(0, 0, 0, ${.35 * near * p.a * appear})`; cx.beginPath(); cx.arc(px + p.r * S * .6, py + p.r * S * .6, p.r * S, 0, 7); cx.fill();
    });
    // Falten um Maul und Kiefer
    cx.lineWidth = Math.max(1, S * .003);
    WRINKLES.forEach(w => {
      const wx = w.x * S, wy = w.y * S, near = Math.max(0, 1 - Math.hypot(wx - lx, wy - ly) / (S * .6));
      cx.strokeStyle = `rgba(0, 0, 0, ${.5 * near * appear})`;
      cx.beginPath(); cx.moveTo(wx, wy); cx.quadraticCurveTo(wx + w.l * S * .5, wy + w.c * S, wx + w.l * S, wy); cx.stroke();
    });
    // Kiemenspalt
    cx.strokeStyle = `rgba(0, 0, 0, ${.7 * appear})`; cx.lineWidth = Math.max(1.5, S * .006);
    cx.beginPath(); cx.moveTo(-S * .12, -S * .18); cx.quadraticCurveTo(-S * .2, S * .02, -S * .1, S * .18); cx.stroke();
    cx.restore();

    // Rachen: Tiefe - am Rand rot-braun vom Licht, innen schwarz
    if (open > .02) {
      const J = S * .16, [cxp, cyp] = rot(S * .42, S * .05 + J * .55), [tx, ty] = rot(S * .6, S * .1 + J);
      const mouth = new Path2D();
      mouth.moveTo(S * .47, -S * .07); mouth.quadraticCurveTo(S * .3, 0, hx, hy); mouth.quadraticCurveTo(cxp, cyp, tx, ty); mouth.closePath();
      const throat = cx.createRadialGradient(S * .3, S * .04, 0, S * .42, S * .03, S * .3);
      throat.addColorStop(0, `rgba(0, 0, 0, ${appear})`); throat.addColorStop(.6, `rgba(16, 4, 6, ${appear})`); throat.addColorStop(1, `rgba(60, 22, 24, ${appear})`);
      cx.fillStyle = throat; cx.fill(mouth);
    }

    // Zaehne: hintere Reihe klein + dunkel, vordere lang + hell - gibt Tiefe
    const tooth = (x, y, len, dirY, lean, w, alpha) => {
      const near = Math.max(.12, 1 - Math.hypot(x - lx, y - ly) / (S * .7));
      const g = cx.createLinearGradient(x, y, x + lean, y + dirY * len);
      g.addColorStop(0, `rgba(120, 140, 135, ${alpha * .5 * appear * near})`); g.addColorStop(1, `rgba(235, 245, 240, ${alpha * appear * near})`);
      cx.fillStyle = g;
      cx.beginPath(); cx.moveTo(x - w, y); cx.quadraticCurveTo(x + lean * .3, y + dirY * len * .55, x + lean, y + dirY * len); cx.quadraticCurveTo(x + lean * .3 + w * .4, y + dirY * len * .5, x + w, y); cx.fill();
    };
    for (let k = 0; k < 8; k++) { const u = k / 7; tooth(S * (.22 + u * .24), -S * (.005 + u * .06) + S * .012, S * (.03 + (k % 2) * .015), 1, S * .004, S * .004, .45); }        // oben hinten
    jawOn();
    for (let k = 0; k < 9; k++) { const u = k / 8; tooth(S * (.23 + u * .33), S * .015 + u * (S * .085 + B.jaw * .9), S * (.03 + (k % 2) * .015), -1, -S * .004, S * .004, .45); } // unten hinten
    cx.restore();
    for (let k = 0; k < 7; k++) { const u = k / 6; tooth(S * (.25 + u * .22), -S * (.0 + u * .065), S * (.06 + (k % 3) * .025 + u * .02), 1, S * .01, S * .007, 1); }         // oben vorne
    // Unterkiefer liegt vor allem anderen (dreht sich im Gelenk mit)
    jawOn();
    const jawFill = light(0, 0, S * .8, [[0, `rgba(86, 120, 118, ${appear})`], [.3, `rgba(28, 44, 46, ${appear})`], [.7, `rgba(6, 11, 13, ${appear})`], [1, `rgba(2, 4, 6, ${appear})`]]);
    cx.fillStyle = jawFill; cx.fill(B.lower);
    cx.save(); cx.clip(B.lower);
    const jv = cx.createLinearGradient(0, S * .05, 0, S * .4); jv.addColorStop(0, 'rgba(0,0,0,0)'); jv.addColorStop(1, 'rgba(0,0,0,.75)');
    cx.fillStyle = jv; cx.fillRect(-S * .1, 0, S * .8, S * .5);
    cx.restore();
    for (let k = 0; k < 9; k++) { const u = k / 8; tooth(S * (.24 + u * .35), S * .02 + u * (S * .09 + B.jaw), S * (.07 + (k % 2) * .045 + u * .04), -1, -S * .012, S * .008, 1); } // unten vorne, ragen weit hoch
    const rimJ = light(0, 0, S * .5, [[0, `rgba(150, 230, 215, ${.6 * appear})`], [1, 'rgba(150, 230, 215, 0)']]);
    cx.strokeStyle = rimJ; cx.lineWidth = Math.max(1, S * .004); cx.stroke(B.lower);
    cx.restore();
    // Lichtkante entlang des Kopfs
    const rim = light(0, 0, S * .5, [[0, `rgba(150, 230, 215, ${.6 * appear})`], [1, 'rgba(150, 230, 215, 0)']]);
    cx.strokeStyle = rim; cx.lineWidth = Math.max(1, S * .004); cx.stroke(B.head);

    // Auge: kleine Kugel mit feuchtem Glanz, starrt in Richtung Betrachter
    const ex = S * .17, ey = -S * .24, er = S * .028;
    const eg = cx.createRadialGradient(ex - er * .3, ey - er * .3, 0, ex, ey, er);
    eg.addColorStop(0, `rgba(60, 80, 78, ${appear})`); eg.addColorStop(.7, `rgba(8, 12, 12, ${appear})`); eg.addColorStop(1, `rgba(0, 0, 0, ${appear})`);
    cx.fillStyle = eg; cx.beginPath(); cx.arc(ex, ey, er, 0, 7); cx.fill();
    cx.fillStyle = `rgba(200, 255, 240, ${.9 * appear})`; cx.beginPath(); cx.arc(ex + er * .35, ey - er * .1, er * .22, 0, 7); cx.fill();

    // Angel aus der Stirn zum Koeder
    cx.strokeStyle = `rgba(80, 120, 120, ${.9 * appear})`; cx.lineWidth = Math.max(1.2, S * .006);
    cx.beginPath(); cx.moveTo(S * .1, -S * .45); cx.bezierCurveTo(S * .25, -S * .7, S * .7, -S * .55, lx, ly); cx.stroke();
    // der Koeder selbst haengt am Fisch und kommt beim Satz mit
    cx.save(); cx.globalCompositeOperation = 'lighter';
    const flick = .85 + .15 * Math.sin(t * 7) * Math.sin(t * 3.1);
    const lg = cx.createRadialGradient(lx, ly, 0, lx, ly, 70 / zoom * (1 + (zoom - 1) * .5));
    lg.addColorStop(0, `rgba(210, 255, 240, ${.9 * flick})`); lg.addColorStop(.12, 'rgba(120, 255, 220, .45)'); lg.addColorStop(1, 'rgba(60, 200, 190, 0)');
    cx.fillStyle = lg; cx.beginPath(); cx.arc(lx, ly, 70, 0, 7); cx.fill();
    cx.restore();
  }
  cx.restore();
  if (blackout > 0) { cx.fillStyle = `rgba(0, 0, 0, ${blackout})`; cx.fillRect(0, 0, W, H); }
  if (t > 5.1) { cv.style.zIndex = ''; angler = null; lure.target = 0; lure.on = 0; lure.next = rand(25, 40); }
}

function drawLure(t) {
  if (lure.on < .01 || angler) return; // waehrend des Easter Eggs zeichnet drawAngler den Koeder
  const x = lure.x + Math.sin(t * 1.4) * 6, y = lure.y + Math.sin(t * 2) * 4;
  cx.save(); cx.globalCompositeOperation = 'lighter';
  const flick = .85 + .15 * Math.sin(t * 7) * Math.sin(t * 3.1);
  const g = cx.createRadialGradient(x, y, 0, x, y, 70);
  g.addColorStop(0, `rgba(210, 255, 240, ${.9 * lure.on * flick})`); g.addColorStop(.12, `rgba(120, 255, 220, ${.45 * lure.on})`); g.addColorStop(1, 'rgba(60, 200, 190, 0)');
  cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 70, 0, 7); cx.fill();
  cx.restore();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
  mouse.on += (mouse.target - mouse.on) * Math.min(1, dt * 3);
  mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 8); mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 8);
  cx.clearRect(0, 0, W, H);
  drawRays(t);

  // Meeresschnee + Plankton-Leuchten um die Maus
  cx.save(); cx.globalCompositeOperation = 'lighter';
  snow.forEach(p => {
    p.y += p.vy * dt; p.x += Math.sin(t * .5 + p.ph) * 4 * dt;
    if (p.y > H + 4) { p.y = -4; p.x = rand(0, W); }
    const d = Math.hypot(p.x - mouse.sx, p.y - mouse.sy);
    const glow = mouse.on * Math.max(0, 1 - d / 150);
    const a = p.a * (.7 + .3 * Math.sin(t * 2 + p.ph)) + glow * .9;
    cx.fillStyle = glow > .05 ? `rgba(130, 255, 225, ${a})` : `rgba(200, 225, 235, ${a})`;
    cx.beginPath(); cx.arc(p.x, p.y, p.r + glow * 1.4, 0, 7); cx.fill();
  });
  cx.restore();

  // Blasen
  nextBubbles -= dt;
  if (nextBubbles <= 0) { const bx = rand(W * .05, W * .95); for (let k = 0; k < 6; k++) bubbles.push({ x: bx + rand(-6, 6), y: H + 10 + k * 18, r: rand(1.5, 4), vy: rand(30, 55), ph: rand(0, 6) }); nextBubbles = rand(3, 7); }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i]; b.y -= b.vy * dt; b.x += Math.sin(t * 3 + b.ph) * 12 * dt;
    if (b.y < -10) { bubbles.splice(i, 1); continue; }
    cx.strokeStyle = 'rgba(190, 240, 255, .35)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 7); cx.stroke();
    cx.fillStyle = 'rgba(255, 255, 255, .25)'; cx.beginPath(); cx.arc(b.x - b.r * .3, b.y - b.r * .3, b.r * .3, 0, 7); cx.fill();
  }

  // Quallen: steigen beim Pulsschlag, sinken langsam, weichen der Maus aus
  jellies.forEach((j, i) => {
    const p = (t / j.period + j.ph) % 1;
    if (p < .25) j.vy -= 26 * dt;                       // Stoss nach oben
    j.vy += 3 * dt; j.vy *= .985; j.vx *= .99;
    const d = Math.hypot(j.x - mouse.sx, j.y - mouse.sy) || 1;
    if (d < 170 && mouse.on > .1) { const f = (170 - d) / 170 * 60 * mouse.on; j.vx += (j.x - mouse.sx) / d * f * dt; j.vy += (j.y - mouse.sy) / d * f * dt * .6; }
    if (j.x < W * .05) j.vx += 4 * dt; if (j.x > W * .95) j.vx -= 4 * dt;
    j.x += j.vx * dt; j.y += j.vy * dt;
    j.tilt += ((j.vx * .015) - j.tilt) * Math.min(1, dt * 2);
    if (j.y < -j.s * 3) jellies[i] = newJelly(false);
    drawJelly(j, t);
  });

  // Easter Egg: Koeder taucht ab und zu unten im Dunkeln auf
  if (!angler) {
    lure.next -= dt;
    if (lure.target === 0 && lure.next <= 0) { lure.target = 1; lure.life = 14; lure.x = rand(W * .25, W * .75); lure.y = rand(H * .62, H * .8); }
    if (lure.target === 1) { lure.life -= dt; if (lure.life <= 0) { lure.target = 0; lure.next = rand(25, 40); } }
  }
  lure.on += (lure.target - lure.on) * Math.min(1, dt * 1.2);
  if (angler) drawAngler(dt);
  drawLure(t);

}


    return {
      animated: true,
      mount() { document.body.appendChild(cv); listeners.forEach(([tg, ev, fn, opt]) => tg.addEventListener(ev, fn, opt)); resize(); },
      unmount() { listeners.forEach(([tg, ev, fn, opt]) => tg.removeEventListener(ev, fn, opt)); cv.remove(); },
      resize() { resize(); },
      setLevel(v) { cv.style.opacity = v; },
      frame() { frame(performance.now()); }
    };
  }

  // ===================== neon =====================
  function neonScene(ctx) {
    const listeners = [];
    const on = (target, ev, fn, opt) => { listeners.push([target, ev, fn, opt]); };
    const INTERACTIVE = window.TTPThemeFx.INTERACTIVE;

const cv = document.createElement('canvas'); cv.className = 'shop-scene-cv'; Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: '-1', pointerEvents: 'none', opacity: '0' }); const cx = cv.getContext('2d');
let W = 0, H = 0;
const rand = (a, b) => a + Math.random() * (b - a);
// fester Zufall pro Aufbau, damit die Skyline beim Resize gleich bleibt
function seeded(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const NEON = ['#ff4fb8', '#3ff0ff', '#b46bff', '#ffd23f', '#5dff9a', '#ff6a3d'];
let layers = [], signs = [], ground = 0;

function build() {
  const r = seeded(7);
  ground = H * .86;
  layers = [
    { depth: .25, color: '#170d28', win: .06, minH: .22, maxH: .5, minW: 40, maxW: 90, b: [] },
    { depth: .55, color: '#120a20', win: .12, minH: .18, maxH: .42, minW: 60, maxW: 130, b: [] },
    { depth: 1, color: '#0a0613', win: .2, minH: .12, maxH: .32, minW: 90, maxW: 180, b: [] }
  ];
  layers.forEach(L => {
    let x = -60;
    while (x < W + 60) {
      const w = L.minW + r() * (L.maxW - L.minW), h = H * (L.minH + r() * (L.maxH - L.minH));
      const wins = [];
      for (let wy = 14; wy < h - 10; wy += 14) for (let wx = 8; wx < w - 8; wx += 12) if (r() < L.win) wins.push({ x: wx, y: wy, warm: r() < .7, flick: r() < .04, ph: r() * 6 });
      L.b.push({ x, w, h, wins, antenna: r() < .3, roof: r() < .4 });
      x += w + 2 + r() * 10;
    }
  });
  // Neonschilder an den vorderen Gebaeuden
  const texts = ['ZAUN', 'HEXTECH', 'NOODLES', 'BAR', 'CHEMTECH', 'ARCADE'];
  signs = [];
  const near = layers[2].b.filter(b => b.x > W * .03 && b.x + b.w < W * .97);
  near.forEach((b, i) => {
    if (i % 2) return;
    const vertical = r() < .45;
    const t = texts[signs.length % texts.length];
    signs.push({ b, layer: 2, text: t, vertical, color: NEON[Math.floor(r() * NEON.length)], x: b.x + b.w * (vertical ? .15 : .5), y: ground - b.h + 30 + r() * 40, flick: r() < .3, ph: r() * 6 });
  });
  // das kaputte Schild fuer das Easter Egg - mittig gut sichtbar
  const host = near.reduce((best, b) => Math.abs(b.x + b.w / 2 - W * .62) < Math.abs(best.x + best.w / 2 - W * .62) ? b : best, near[0]);
  signs = signs.filter(sg => sg.b !== host);
  signs.push({ b: host, layer: 2, text: 'OPEN 24/7', vertical: false, color: '#5dff9a', x: host.x + host.w / 2, y: ground - host.h + 34, broken: true, ph: 0 });
}

function resize() {
  const dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  build();
}
on(window, 'resize', resize); resize();

const mouse = { x: .5, y: .5, sx: .5, sy: .5 };
on(window, 'mousemove', e => { mouse.x = e.clientX / W; mouse.y = e.clientY / H; });
const rain = Array.from({ length: 320 }, () => ({ x: rand(0, W), y: rand(0, H), l: rand(10, 22), v: rand(650, 950), a: rand(.12, .32) }));
const splashes = [];
const steam = Array.from({ length: 5 }, () => ({ x: rand(0, W), y: ground + rand(0, H * .1), r: rand(40, 90), ph: rand(0, 6) }));
let glider = null, nextGlider = 4;

// Easter Egg
const egg = { clicks: 0, reset: null, t: -1 };
let power = 1; // 0 = Stromausfall

function signGlow(sg, t) {
  if (sg.broken) {
    // kaputtes Schild: "E" ist dauernd aus, der Rest flackert unregelmaessig
    return (Math.sin(t * 13) > -.2 && Math.sin(t * 2.3 + 1) > -.6) ? 1 : .15;
  }
  if (!sg.flick) return 1;
  const f = Math.sin(t * 7 + sg.ph) * Math.sin(t * 2.1 + sg.ph * 2);
  return f > .85 ? .25 : 1;
}

function drawSign(sg, t, ox) {
  const g = signGlow(sg, t) * power;
  cx.save();
  cx.font = `700 ${sg.vertical ? 16 : 20}px 'Cinzel', serif`;
  cx.textAlign = 'center'; cx.textBaseline = 'middle';
  const x = sg.x + ox, y = sg.y;
  const chars = sg.vertical ? sg.text.split('') : [sg.text];
  const w = sg.vertical ? 28 : cx.measureText(sg.text).width + 26, h = sg.vertical ? chars.length * 20 + 12 : 34;
  // Rahmen
  cx.strokeStyle = sg.color; cx.globalAlpha = .2 + .8 * g; cx.lineWidth = 2;
  cx.shadowColor = sg.color; cx.shadowBlur = 18 * g;
  cx.strokeRect(x - w / 2, y - (sg.vertical ? 6 : h / 2), w, h);
  cx.fillStyle = sg.color;
  if (sg.vertical) chars.forEach((c, i) => cx.fillText(c, x, y + 10 + i * 20));
  else if (sg.broken) {
    // Buchstabe fuer Buchstabe, damit das "E" ausfallen kann
    const full = sg.text; let cxp = x - cx.measureText(full).width / 2;
    for (const ch of full) {
      const cw = cx.measureText(ch).width;
      cx.globalAlpha = ch === 'E' ? .12 : .2 + .8 * g;
      cx.fillText(ch, cxp + cw / 2, y);
      cxp += cw;
    }
  } else cx.fillText(sg.text, x, y);
  cx.restore();
  sg.hit = { x: x - w / 2, y: y - (sg.vertical ? 6 : h / 2), w, h };
}

function drawCity(t, reflect) {
  layers.forEach((L, li) => {
    const ox = (mouse.sx - .5) * -40 * L.depth, oy = (mouse.sy - .5) * -10 * L.depth;
    L.b.forEach(b => {
      const top = ground - b.h + oy;
      cx.fillStyle = L.color; cx.fillRect(b.x + ox, top, b.w, b.h + 2);
      if (b.antenna) { cx.fillRect(b.x + ox + b.w * .5, top - 26, 2, 26); if (Math.sin(t * 3 + b.x) > .6) { cx.fillStyle = `rgba(255, 60, 60, ${.9 * power})`; cx.fillRect(b.x + ox + b.w * .5 - 1, top - 28, 4, 4); } }
      // Fenster
      b.wins.forEach(wn => {
        let a = (wn.warm ? .55 : .45) * power;
        if (wn.flick && Math.sin(t * 5 + wn.ph) > .7) a *= .2;
        cx.fillStyle = wn.warm ? `rgba(255, 200, 120, ${a})` : `rgba(120, 220, 255, ${a})`;
        cx.fillRect(b.x + ox + wn.x, top + wn.y, 5, 7);
      });
    });
    if (li === 2 && !reflect) signs.forEach(sg => drawSign(sg, t, ox));
  });
}

function frame(now) {
  const t = now / 1000;
  const dt = Math.min(.05, t - (frame.last || t)); frame.last = t;
  mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 3); mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 3);
  cx.clearRect(0, 0, W, H);

  // Dunst ueber der Stadt
  const haze = cx.createLinearGradient(0, H * .3, 0, ground);
  haze.addColorStop(0, 'rgba(255, 79, 184, 0)'); haze.addColorStop(1, `rgba(255, 79, 184, ${.16 * power})`);
  cx.fillStyle = haze; cx.fillRect(0, H * .3, W, ground - H * .3);

  drawCity(t, false);

  // Strasse + Pfuetzen-Spiegelung: Stadt gespiegelt, gestaucht, gewellt
  cx.fillStyle = '#07040d'; cx.fillRect(0, ground, W, H - ground);
  cx.save();
  cx.beginPath(); cx.rect(0, ground, W, H - ground); cx.clip();
  cx.globalAlpha = .35;
  cx.translate(0, ground * 2 + Math.sin(t * 2) * 1.5); cx.scale(1, -1);
  drawCity(t, true);
  signs.forEach(sg => { const ox = (mouse.sx - .5) * -40; cx.save(); cx.globalAlpha = .25 * signGlow(sg, t) * power; cx.fillStyle = sg.color; cx.shadowColor = sg.color; cx.shadowBlur = 30; cx.fillRect(sg.x + ox - 30, sg.y - 8, 60, 16); cx.restore(); });
  cx.restore();
  cx.fillStyle = 'rgba(7, 4, 13, .45)'; cx.fillRect(0, ground, W, H - ground);
  // Wellenlinien auf dem Wasser
  cx.strokeStyle = 'rgba(255, 120, 220, .08)'; cx.lineWidth = 1;
  for (let k = 0; k < 6; k++) { const y = ground + 8 + k * (H - ground) / 6; cx.beginPath(); cx.moveTo(0, y); for (let x = 0; x <= W; x += 40) cx.lineTo(x, y + Math.sin(x * .02 + t * 2 + k) * 1.5); cx.stroke(); }

  // Dampf
  steam.forEach(s => {
    const y = s.y - ((t * 14 + s.ph * 30) % 120);
    const g = cx.createRadialGradient(s.x, y, 0, s.x, y, s.r);
    g.addColorStop(0, 'rgba(200, 180, 230, .07)'); g.addColorStop(1, 'rgba(200, 180, 230, 0)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(s.x, y, s.r, 0, 7); cx.fill();
  });

  // Gleiter mit Lichtspur
  nextGlider -= dt;
  if (!glider && nextGlider <= 0) { const dir = Math.random() < .5 ? 1 : -1; glider = { dir, x: dir > 0 ? -80 : W + 80, y: rand(H * .25, H * .55), v: rand(260, 380) * dir }; }
  if (glider) {
    glider.x += glider.v * dt;
    const tr = cx.createLinearGradient(glider.x, 0, glider.x - glider.dir * 160, 0);
    tr.addColorStop(0, 'rgba(255, 240, 200, .7)'); tr.addColorStop(1, 'rgba(255, 79, 184, 0)');
    cx.strokeStyle = tr; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(glider.x, glider.y); cx.lineTo(glider.x - glider.dir * 160, glider.y); cx.stroke();
    cx.fillStyle = '#fff6dc'; cx.shadowColor = '#ffd27a'; cx.shadowBlur = 12; cx.beginPath(); cx.arc(glider.x, glider.y, 2.5, 0, 7); cx.fill(); cx.shadowBlur = 0;
    if (glider.x < -120 || glider.x > W + 120) { glider = null; nextGlider = rand(6, 14); }
  }

  // Regen + Spritzer
  cx.strokeStyle = 'rgba(190, 200, 255, .25)'; cx.lineWidth = 1;
  cx.beginPath();
  rain.forEach(d => {
    d.y += d.v * dt; d.x += d.v * .18 * dt;
    if (d.y > ground + rand(0, H - ground)) { if (Math.random() < .3) splashes.push({ x: d.x, y: d.y, life: 1 }); d.y = rand(-40, 0); d.x = rand(-60, W); }
    cx.moveTo(d.x, d.y); cx.lineTo(d.x - d.l * .18, d.y - d.l);
  });
  cx.stroke();
  for (let i = splashes.length - 1; i >= 0; i--) {
    const s = splashes[i]; s.life -= dt * 3; if (s.life <= 0) { splashes.splice(i, 1); continue; }
    cx.strokeStyle = `rgba(200, 210, 255, ${.3 * s.life})`; cx.beginPath(); cx.ellipse(s.x, s.y, (1 - s.life) * 6, (1 - s.life) * 2, 0, 0, 7); cx.stroke();
  }

  drawEgg(t, dt);

}

// ----- Easter Egg: Stromausfall, dann ein Neon-Pony ueber den Daechern -----
function ponyPath(phase) {
  // Pferd als Neon-Leuchtreklame: Kopf mit Ohr und Maul, geschwungener Hals,
  // Maehne, wehender Schweif, Beine mit Gelenken im Galopp. Hufe auf y = 0.
  const p = new Path2D();
  p.moveTo(-30, -36);
  p.quadraticCurveTo(-10, -40, 12, -36);          // Ruecken bis Widerrist
  p.quadraticCurveTo(22, -44, 27, -56);           // Halsbogen
  p.lineTo(29, -63); p.lineTo(33, -57);           // Ohr
  p.quadraticCurveTo(43, -54, 50, -45);           // Stirn bis Nuester
  p.quadraticCurveTo(51, -40, 45, -40);           // Maul
  p.quadraticCurveTo(36, -43, 31, -40);           // Ganasche
  p.quadraticCurveTo(26, -31, 19, -25);           // Kehle bis Brust
  p.quadraticCurveTo(0, -19, -24, -22);           // Bauch
  p.quadraticCurveTo(-38, -24, -38, -31);         // Hinterhand
  p.closePath();
  // Maehne: drei wehende Straehnen
  for (let k = 0; k < 3; k++) {
    const bx = 25 - k * 5, by = -54 + k * 5;
    p.moveTo(bx, by); p.quadraticCurveTo(bx - 8, by + 2 + Math.sin(phase + k) * 2, bx - 13, by + 8);
  }
  // Schweif
  p.moveTo(-37, -33); p.bezierCurveTo(-48, -36, -54, -26 + Math.sin(phase * .5) * 3, -60, -18 + Math.sin(phase * .5 + 1) * 4);
  // Beine mit Knie: a = Schwungphase
  const leg = (x, y, a, back) => {
    const kx = x + Math.sin(a) * 7, ky = y + 10;
    const hx = kx + Math.sin(a + (back ? -.9 : .9)) * 7, hy = Math.min(0, ky + 12 - Math.max(0, Math.sin(a)) * 3);
    p.moveTo(x, y); p.lineTo(kx, ky); p.lineTo(hx, hy);
  };
  leg(16, -25, phase, false); leg(10, -23, phase + 1.2, false);
  leg(-26, -23, phase + 2.6, true); leg(-32, -25, phase + 3.8, true);
  return p;
}
function drawEgg(t, dt) {
  if (egg.t < 0) { power += (1 - power) * Math.min(1, dt * 2); return; }
  egg.t += dt;
  const e = egg.t;
  // 0-0.9 Flackern + Ausfall, 0.9-1.6 dunkel, ab 1.6 Pony galoppiert ueber die Daecher, 5.5 Strom zurueck
  if (e < .9) power = Math.random() < .5 ? .1 : .6;
  else if (e < 5.2) power = .05;
  if (e > 1.6 && e < 5.4) {
    const u = (e - 1.6) / 3.6;
    const host = layers[2].b;
    const x = -80 + u * (W + 160);
    // Dachhoehe an der aktuellen Position (vordere Ebene)
    const ox = (mouse.sx - .5) * -40;
    const b = host.find(bb => x >= bb.x + ox && x <= bb.x + ox + bb.w);
    const roof = b ? ground - b.h : ground;
    egg.y = egg.y === undefined ? roof : egg.y + (roof - egg.y) * Math.min(1, dt * 8);
    const hop = Math.abs(Math.sin(e * 9)) * 10;
    cx.save();
    cx.translate(x, egg.y - 2 - hop); cx.scale(1.6, 1.6);
    const path = ponyPath(e * 18);
    cx.strokeStyle = '#ff4fb8'; cx.lineWidth = 2.2; cx.lineJoin = 'round'; cx.lineCap = 'round';
    cx.shadowColor = '#ff4fb8'; cx.shadowBlur = 22; cx.stroke(path);
    cx.strokeStyle = '#ffd6f0'; cx.lineWidth = .9; cx.shadowBlur = 6; cx.stroke(path);
    cx.restore();
    // Funkenspur
    for (let k = 0; k < 2; k++) egg.sparks.push({ x: x - 40, y: egg.y - 20 - hop + rand(-6, 6), vx: rand(-60, -20), vy: rand(-30, 30), life: 1 });
  }
  for (let i = egg.sparks.length - 1; i >= 0; i--) {
    const s = egg.sparks[i]; s.life -= dt * 1.5; if (s.life <= 0) { egg.sparks.splice(i, 1); continue; }
    s.x += s.vx * dt; s.y += s.vy * dt;
    cx.fillStyle = `rgba(255, 120, 210, ${s.life * .8})`; cx.beginPath(); cx.arc(s.x, s.y, 1.6, 0, 7); cx.fill();
  }
  if (e > 5.2) power = Math.min(1, power + dt * .9 * (Math.random() < .3 ? 0 : 1)); // flackert wieder an
  if (e > 6.6 && !egg.sparks.length) { egg.t = -1; egg.y = undefined; }
}

on(window, 'click', e => {
  if (egg.t >= 0) return;
  if ((e.target.closest && e.target.closest(INTERACTIVE))) return;
  const sg = signs.find(s => s.broken);
  if (!sg || !sg.hit) return;
  const h = sg.hit;
  if (e.clientX < h.x - 6 || e.clientX > h.x + h.w + 6 || e.clientY < h.y - 6 || e.clientY > h.y + h.h + 6) return;
  egg.clicks++; clearTimeout(egg.reset); egg.reset = setTimeout(() => { egg.clicks = 0; }, 3000);
  if (egg.clicks >= 3) { egg.clicks = 0; egg.t = 0; egg.sparks = []; }
});


    return {
      animated: true,
      mount() { document.body.appendChild(cv); listeners.forEach(([tg, ev, fn, opt]) => tg.addEventListener(ev, fn, opt)); resize(); },
      unmount() { listeners.forEach(([tg, ev, fn, opt]) => tg.removeEventListener(ev, fn, opt)); cv.remove(); },
      resize() { resize(); },
      setLevel(v) { cv.style.opacity = v; },
      frame() { frame(performance.now()); }
    };
  }

  // ===================== Fancy + Refined: einfache Canvas-Szenen =====================
  function simpleScene(animated, setup, draw) {
    return () => {
      const cv = document.createElement('canvas');
      Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: '-1', pointerEvents: 'none', opacity: animated ? '0' : '1' });
      const c = cv.getContext('2d'); let W = 0, H = 0, st = {}, last = performance.now();
      const resize = () => { const d = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0); st = setup(W, H) || {}; if (!animated) draw(c, W, H, 0, 0, st); };
      return {
        animated,
        mount() { document.body.appendChild(cv); addEventListener('resize', resize); resize(); },
        unmount() { removeEventListener('resize', resize); cv.remove(); },
        resize,
        setLevel(v) { cv.style.opacity = v; },
        frame() { const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; draw(c, W, H, now / 1000, dt, st); }
      };
    };
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  function seeded(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  let starfallDraw, koiDraw, desertDraw, forestDraw;
  const starfall = simpleScene(true,
    (W, H) => ({ stars: Array.from({ length: Math.round(W * H / 3500) }, () => ({ x: rand(0, W), y: rand(0, H * .85), r: rand(.3, 1.4), ph: rand(0, 6), sp: rand(.5, 2) })), shoot: null, next: 1.5 }),
    starfallDraw = (c, W, H, t, dt, s) => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#050817'); g.addColorStop(.6, '#0a0f2a'); g.addColorStop(1, '#1a1838');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) { c.beginPath(); for (let x = 0; x <= W; x += 12) { const y = H * (.22 + k * .05) + Math.sin(x * .006 + t * .3 + k) * 28 + Math.sin(x * .015 + t * .2) * 12; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.strokeStyle = `rgba(${k === 1 ? '120, 220, 255' : '170, 140, 255'}, ${.05 + .03 * Math.sin(t * .5 + k)})`; c.lineWidth = 36; c.stroke(); }
      c.restore();
      s.stars.forEach(p => { const a = .35 + .65 * (.5 + .5 * Math.sin(t * p.sp + p.ph)); c.fillStyle = `rgba(255, 250, 230, ${a})`; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); });
      s.next -= dt;
      if (!s.shoot && s.next <= 0) s.shoot = { x: rand(W * .2, W), y: rand(0, H * .3), vx: -rand(500, 700), vy: rand(180, 300), life: 1 };
      if (s.shoot) { const p = s.shoot; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 1.1; const tg = c.createLinearGradient(p.x, p.y, p.x - p.vx * .25, p.y - p.vy * .25); tg.addColorStop(0, `rgba(255, 245, 210, ${p.life})`); tg.addColorStop(1, 'rgba(255, 216, 107, 0)'); c.strokeStyle = tg; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * .25, p.y - p.vy * .25); c.stroke(); if (p.life <= 0) { s.shoot = null; s.next = rand(3, 8); } }
      c.fillStyle = '#05060f'; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H * .88); c.quadraticCurveTo(W * .3, H * .8, W * .55, H * .87); c.quadraticCurveTo(W * .8, H * .92, W, H * .85); c.lineTo(W, H); c.fill();
      c.beginPath(); c.arc(W * .78, H * .885, 22, Math.PI, 0); c.fill(); c.fillRect(W * .78 - 22, H * .885, 44, 16);
    });

  const koi = simpleScene(true,
    (W, H) => ({
      koi: Array.from({ length: Math.max(6, Math.round(W * H / 160000)) }, (_, i) => ({ x: rand(0, W), y: rand(0, H), a: rand(0, 6.28), v: rand(24, 40), turn: 0, len: rand(50, 80), col: i % 3 === 0 ? ['#f4f4f2', '#d0222c'] : i % 3 === 1 ? ['#c81f28', '#f4f4f2'] : ['#ececea', '#1c1c1e'], ph: rand(0, 6) })),
      pads: Array.from({ length: Math.max(7, Math.round(W * H / 120000)) }, () => ({ x: rand(0, W), y: rand(0, H), r: rand(24, 44), rot: rand(0, 6), flower: Math.random() < .35 })),
      ripples: []
    }),
    koiDraw = (c, W, H, t, dt, s) => {
      const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * .7); g.addColorStop(0, '#55595f'); g.addColorStop(1, '#1b1c1f');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      s.koi.forEach(k => {
        k.turn += (rand(-1, 1) * .6 - k.turn) * dt * .5; k.a += k.turn * dt;
        const toC = Math.atan2(H / 2 - k.y, W / 2 - k.x);
        if (k.x < 50 || k.x > W - 50 || k.y < 50 || k.y > H - 50) k.a += Math.sin(toC - k.a) * dt * 2;
        k.x += Math.cos(k.a) * k.v * dt; k.y += Math.sin(k.a) * k.v * dt;
        if (Math.random() < dt * .08) s.ripples.push({ x: k.x, y: k.y, r: 3, life: 1 });
        c.save(); c.translate(k.x, k.y); c.rotate(k.a);
        const L = k.len, wag = Math.sin(t * 6 + k.ph) * .35; c.globalAlpha = .85;
        c.save(); c.translate(-L * .45, 0); c.rotate(wag); c.fillStyle = k.col[0]; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-L * .25, -L * .2, -L * .35, -L * .14); c.quadraticCurveTo(-L * .22, 0, -L * .35, L * .14); c.quadraticCurveTo(-L * .25, L * .2, 0, 0); c.fill(); c.restore();
        c.fillStyle = k.col[0]; c.beginPath(); c.ellipse(0, 0, L * .5, L * .16, 0, 0, 7); c.fill();
        c.fillStyle = k.col[1]; c.beginPath(); c.ellipse(L * .12, -L * .03, L * .16, L * .09, .3, 0, 7); c.fill(); c.beginPath(); c.ellipse(-L * .16, L * .03, L * .11, L * .07, -.2, 0, 7); c.fill();
        c.fillStyle = k.col[0]; c.globalAlpha = .55; c.beginPath(); c.ellipse(L * .18, -L * .17, L * .1, L * .05, -.6 + wag * .3, 0, 7); c.ellipse(L * .18, L * .17, L * .1, L * .05, .6 - wag * .3, 0, 7); c.fill();
        c.restore();
      });
      s.pads.forEach(p => {
        c.save(); c.translate(p.x + Math.sin(t * .3 + p.rot) * 2, p.y); c.rotate(p.rot + Math.sin(t * .2 + p.r) * .05);
        c.fillStyle = '#34363b'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, p.r, .25, Math.PI * 2 - .05); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255, 255, 255, .14)'; c.lineWidth = 1; for (let k = 0; k < 6; k++) { const a = .5 + k; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * p.r * .9, Math.sin(a) * p.r * .9); c.stroke(); }
        if (p.flower) { c.fillStyle = '#f6f6f4'; for (let k = 0; k < 6; k++) { c.save(); c.rotate(k * Math.PI / 3 + t * .05); c.beginPath(); c.ellipse(p.r * .1, 0, p.r * .32, p.r * .12, 0, 0, 7); c.fill(); c.restore(); } c.fillStyle = '#d0222c'; c.beginPath(); c.arc(0, 0, p.r * .12, 0, 7); c.fill(); }
        c.restore();
      });
      for (let i = s.ripples.length - 1; i >= 0; i--) { const r = s.ripples[i]; r.r += dt * 30; r.life -= dt * .7; if (r.life <= 0) { s.ripples.splice(i, 1); continue; } c.strokeStyle = `rgba(245, 245, 245, ${.35 * r.life})`; c.lineWidth = 1; c.beginPath(); c.arc(r.x, r.y, r.r, 0, 7); c.stroke(); }
    });

  const desert = simpleScene(false, () => ({}), desertDraw = (c, W, H) => {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1838'); g.addColorStop(.45, '#a8485a'); g.addColorStop(.7, '#f0905a'); g.addColorStop(1, '#f6c27a');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255, 230, 170, .9)'; c.beginPath(); c.arc(W * .72, H * .7, Math.min(W, H) * .07, 0, 7); c.fill();
    const dune = (y, col, amp, ph) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 8) c.lineTo(x, y + Math.sin(x * .006 + ph) * amp + Math.sin(x * .015 + ph) * amp * .3); c.lineTo(W, H); c.fill(); };
    dune(H * .76, '#b8603c', 22, 0); dune(H * .84, '#8a3e2a', 28, 2); dune(H * .92, '#5a2418', 18, 4);
    const s = Math.min(W, H) / 230;
    c.save(); c.translate(W * .14, H * .8); c.scale(s, s); c.fillStyle = '#3a160e';
    c.fillRect(0, -34, 7, 34); c.fillRect(-9, -26, 9, 5); c.fillRect(-9, -34, 5, 9); c.fillRect(7, -22, 9, 5); c.fillRect(11, -30, 5, 9); c.restore();
    c.fillStyle = '#3a160e'; c.beginPath(); c.moveTo(W * .86, H * .92); c.quadraticCurveTo(W * .9, H * .66, W * .96, H * .92); c.lineTo(W * .945, H * .92); c.quadraticCurveTo(W * .905, H * .75, W * .875, H * .92); c.fill();
  });
  const forest = simpleScene(false, () => ({}), forestDraw = (c, W, H) => {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0e2a1c'); g.addColorStop(1, '#04140c');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let k = 0; k < 5; k++) { const x = W * (.12 + k * .2), lg = c.createLinearGradient(x, 0, x + 120, H); lg.addColorStop(0, 'rgba(200, 255, 190, .1)'); lg.addColorStop(1, 'rgba(200, 255, 190, 0)'); c.fillStyle = lg; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 50, 0); c.lineTo(x + 180, H); c.lineTo(x + 80, H); c.fill(); }
    const r = seeded(3);
    const tree = (x, base, h, col) => { c.fillStyle = col; c.fillRect(x - 4, base - h * .25, 8, h * .25); for (let k = 0; k < 3; k++) { const w = h * (.42 - k * .1), y = base - h * .2 - k * h * .24; c.beginPath(); c.moveTo(x - w, y); c.lineTo(x, y - h * .38); c.lineTo(x + w, y); c.fill(); } };
    const n = Math.round(W / 70);
    for (let k = 0; k < n; k++) tree(r() * W, H * .92, H * (.2 + r() * .14), '#123a24');
    for (let k = 0; k < Math.round(n * .6); k++) tree(r() * W, H * 1.03, H * (.3 + r() * .12), '#08200f');
    for (let k = 0; k < Math.round(W * H / 40000); k++) { const x = r() * W, y = H * (.3 + r() * .6), gl = c.createRadialGradient(x, y, 0, x, y, 7); gl.addColorStop(0, 'rgba(220, 255, 140, .9)'); gl.addColorStop(1, 'rgba(220, 255, 140, 0)'); c.fillStyle = gl; c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill(); }
  });

  // Kleine stehende Vorschau fuer den Shop (canvas[data-theme-pv])
  const PV = {
    starfall: (c, W, H) => { const st = { stars: Array.from({ length: 40 }, () => ({ x: rand(0, W), y: rand(0, H * .8), r: rand(.4, 1.2), ph: rand(0, 6), sp: 1 })), next: 99 }; starfallDraw(c, W, H, 1, 0, st); },
    koi: (c, W, H) => { const st = { koi: [0, 1, 2].map(i => ({ x: W * (.3 + i * .22), y: H * (.35 + (i % 2) * .3), a: i * 2, v: 0, turn: 0, len: W * .32, col: i === 0 ? ['#f4f4f2', '#d0222c'] : i === 1 ? ['#c81f28', '#f4f4f2'] : ['#ececea', '#1c1c1e'], ph: i })), pads: [{ x: W * .22, y: H * .72, r: W * .14, rot: 1, flower: true }, { x: W * .8, y: H * .25, r: W * .1, rot: 3, flower: false }], ripples: [] }; koiDraw(c, W, H, 0, 0, st); },
    desert: (c, W, H) => desertDraw(c, W, H),
    forest: (c, W, H) => forestDraw(c, W, H),
    abyss: (c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#06324a'); g.addColorStop(1, '#01060c'); c.fillStyle = g; c.fillRect(0, 0, W, H); [[.3, .45, '120,230,255'], [.68, .3, '255,140,210'], [.6, .72, '170,140,255']].forEach(([x, y, col]) => { const r = W * .11, gl = c.createRadialGradient(W * x, H * y, 0, W * x, H * y, r * 2); gl.addColorStop(0, `rgba(${col},.5)`); gl.addColorStop(1, `rgba(${col},0)`); c.fillStyle = gl; c.beginPath(); c.arc(W * x, H * y, r * 2, 0, 7); c.fill(); c.fillStyle = `rgba(${col},.7)`; c.beginPath(); c.arc(W * x, H * y, r, Math.PI, 0); c.fill(); c.strokeStyle = `rgba(${col},.5)`; c.lineWidth = 1; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(W * x + k * r * .35, H * y); c.lineTo(W * x + k * r * .35 + 2, H * y + r * 1.6); c.stroke(); } }); },
    neon: (c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0614'); g.addColorStop(.7, '#2a1036'); c.fillStyle = g; c.fillRect(0, 0, W, H); const r = seeded(7); let x = 0; while (x < W) { const w = W * (.12 + r() * .12), h = H * (.3 + r() * .4); c.fillStyle = '#0a0613'; c.fillRect(x, H * .85 - h, w, h); c.fillStyle = 'rgba(255,200,120,.6)'; for (let k = 0; k < 6; k++) c.fillRect(x + r() * (w - 3), H * .85 - h + r() * (h - 4), 2, 3); x += w + 2; } c.fillStyle = '#07040d'; c.fillRect(0, H * .85, W, H * .15); c.strokeStyle = '#ff4fb8'; c.shadowColor = '#ff4fb8'; c.shadowBlur = 8; c.lineWidth = 1.5; c.strokeRect(W * .35, H * .45, W * .3, H * .12); c.shadowBlur = 0; }
  };
  window.TTPThemePreview = (key, cv) => { const fn = PV[key]; if (!fn) return false; const d = Math.min(2, devicePixelRatio || 1), W = cv.clientWidth || 96, H = cv.clientHeight || 96; cv.width = W * d; cv.height = H * d; const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); fn(c, W, H); return true; };

  const R = window.TTPThemeFx.register;
  R('abyss', abyssScene); R('neon', neonScene);
  R('starfall', starfall); R('koi', koi); R('desert', desert); R('forest', forest);
})();
