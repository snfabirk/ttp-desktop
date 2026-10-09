// Shop-Borders und -Profilrahmen (v5.19.0) - Designs aus theme-lab/shop-*.html
// (vom Nutzer abgenommen). Jedes Teil zeichnet auf eine eigene Canvas, die
// cosmetics-fx.js ueber das Element legt. Eine gemeinsame Schleife fuer alle;
// Animations-Einstellung: Aus = stehendes Bild, inaktiv = angehalten.
// Animated-Teile haben ein Easter Egg (Storm Crown, Obsidian Crown: 5x aufs
// grosse Profilbild; Arcane Circuit: alle vier Eckkristalle anklicken).
(function () {
  if (!window.TTPCos || window.TTPShopCos) return;
  window.TTPShopCos = true;
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const rand = (a, b) => a + Math.random() * (b - a);
  const fxOff = () => document.documentElement.classList.contains('fx-off');
  const fxPaused = () => document.documentElement.classList.contains('fx-paused');
  function seeded(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ===================== gemeinsame Zeichenschleife =====================
  const items = new Set();
  let raf = null, last = 0, t0 = performance.now();
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  function loop(now) {
    raf = null;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    items.forEach(it => { if (!it.host.isConnected || !it.cv.isConnected) { items.delete(it); if (it.cleanup) it.cleanup(); } });
    if (!items.size) return;
    const off = fxOff(), paused = fxPaused() || document.hidden;
    items.forEach(it => {
      if (!it.sized()) return;
      if (it.static || off) { if (!it.drawnOnce || it.dirty) { it.render(0, 0); it.drawnOnce = true; it.dirty = false; } return; }
      if (paused && it.drawnOnce && !it.busy()) return;
      it.render(t, dt); it.drawnOnce = true;
    });
    raf = requestAnimationFrame(loop);
  }
  setInterval(wake, 1000);

  // ===================== Borders =====================
  // draw(c, R, t, dt, st, el) zeichnet um (0,0); Bildradius R.
  function canvasBorder(draw, opts = {}) {
    return el => {
      const cv = document.createElement('canvas');
      cv.className = 'cos-deco cb-canvas';
      el.appendChild(cv);
      const c = cv.getContext('2d');
      const st = {};
      const it = {
        host: el, cv, static: !!opts.static, drawnOnce: false, dirty: true, S: 0, k: 2,
        busy: () => !!(st.egg),
        sized() {
          const S = el.getBoundingClientRect().width;
          if (!S) return false;
          if (Math.abs(S - it.S) > .5) {
            it.S = S; it.k = opts.bigScale && S >= 64 ? opts.bigScale : 2;
            const C = S * it.k;
            Object.assign(cv.style, { left: `${-(it.k - 1) / 2 * 100}%`, top: `${-(it.k - 1) / 2 * 100}%`, width: `${it.k * 100}%`, height: `${it.k * 100}%` });
            cv.width = Math.round(C * DPR); cv.height = Math.round(C * DPR);
            it.dirty = true;
          }
          return true;
        },
        render(t, dt) {
          const C = it.S * it.k, R = it.S / 2;
          c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, C, C);
          c.save(); c.translate(C / 2, C / 2);
          draw(c, R, t, dt, st, el);
          c.restore();
        }
      };
      if (opts.egg && el.getBoundingClientRect().width >= 64) {
        let n = 0, rs = null;
        it.onClick = () => { if (st.egg) return; n++; clearTimeout(rs); rs = setTimeout(() => { n = 0; }, 3000); if (n >= 5) { n = 0; opts.egg(st, el); wake(); } };
        el.addEventListener('click', it.onClick);
        it.cleanup = () => el.removeEventListener('click', it.onClick);
      }
      items.add(it); wake();
    };
  }
  const ring = (c, r, w, stops) => { const g = c.createLinearGradient(-r, -r, r, r); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); c.strokeStyle = g; c.lineWidth = w; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); };

  // ---- Storm Crown (Animated) ----
  let sky = null;
  function skyCanvas() {
    if (sky && sky.cv.isConnected) return sky;
    const cv = document.createElement('canvas');
    Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '9500' });
    document.body.appendChild(cv);
    sky = { cv, c: cv.getContext('2d') };
    return sky;
  }
  function stormArc(R, big) {
    const a0 = rand(0, Math.PI * 2), span = rand(.35, big ? 1.6 : .9) * (Math.random() < .5 ? 1 : -1);
    const steps = Math.max(6, Math.round(Math.abs(span) * 14)), pts = [];
    for (let i = 0; i <= steps; i++) { const a = a0 + span * i / steps, j = (i === 0 || i === steps) ? 0 : rand(-1, 1) * R * (big ? .16 : .1), rr = R * 1.1 + j; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    const branch = Math.random() < .35 ? (() => { const k = Math.floor(rand(2, pts.length - 2)), [x, y] = pts[k], ang = Math.atan2(y, x), len = R * rand(.2, .45); return [[x, y], [x + Math.cos(ang + rand(-.5, .5)) * len * .5, y + Math.sin(ang + rand(-.5, .5)) * len * .5], [x + Math.cos(ang) * len, y + Math.sin(ang) * len]]; })() : null;
    return { pts, branch, life: 1, decay: rand(2.8, 5) };
  }
  const poly = (c, pts, w, col, blur) => { c.strokeStyle = col; c.lineWidth = w; c.shadowColor = '#7fd4ff'; c.shadowBlur = blur; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.shadowBlur = 0; };
  const storm = canvasBorder((c, R, t, dt, st, el) => {
    st.arcs = st.arcs || []; st.next = st.next || 0; st.flash = st.flash || 0; st.charge = Math.max(0, (st.charge || 0) - dt * .45);
    const small = R < 25, over = st.charge;
    const halo = c.createRadialGradient(0, 0, R * .9, 0, 0, R * 1.6); halo.addColorStop(0, `rgba(80,170,255,${.18 + .3 * over + .25 * st.flash})`); halo.addColorStop(1, 'rgba(80,170,255,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(0, 0, R * 1.6, 0, 7); c.fill();
    ring(c, R * 1.04, Math.max(2, R * .12), ['#2b3a52', '#8aa4c8', '#1a2436', '#4d6a90']);
    c.strokeStyle = `rgba(150,220,255,${.5 + .4 * over})`; c.lineWidth = Math.max(1, R * .025); c.beginPath(); c.arc(0, 0, R * 1.1, 0, 7); c.stroke();
    const prongs = [-2, -1, 0, 1, 2].map(k => { const a = -Math.PI / 2 + k * .36, len = R * (k === 0 ? .42 : Math.abs(k) === 1 ? .32 : .24); return { a, tip: [Math.cos(a) * (R * 1.08 + len), Math.sin(a) * (R * 1.08 + len)] }; });
    prongs.forEach(pg => {
      const w = R * .09, bx = Math.cos(pg.a) * R * 1.06, by = Math.sin(pg.a) * R * 1.06, nx = -Math.sin(pg.a), ny = Math.cos(pg.a);
      const g = c.createLinearGradient(bx, by, pg.tip[0], pg.tip[1]); g.addColorStop(0, '#3a4d6c'); g.addColorStop(.6, '#9fb8da'); g.addColorStop(1, '#e8f4ff');
      c.fillStyle = g; c.beginPath(); c.moveTo(bx + nx * w, by + ny * w); c.lineTo(pg.tip[0], pg.tip[1]); c.lineTo(bx - nx * w, by - ny * w); c.closePath(); c.fill();
      const gl = c.createRadialGradient(pg.tip[0], pg.tip[1], 0, pg.tip[0], pg.tip[1], R * .14); gl.addColorStop(0, `rgba(200,240,255,${.7 + .3 * over})`); gl.addColorStop(1, 'rgba(120,200,255,0)');
      c.fillStyle = gl; c.beginPath(); c.arc(pg.tip[0], pg.tip[1], R * .14, 0, 7); c.fill();
    });
    if (!dt) return; // stehendes Bild (Animationen aus)
    st.next -= dt;
    if (st.next <= 0 && Math.random() < .35) { const k = Math.floor(rand(0, 4)), [x0, y0] = prongs[k].tip, [x1, y1] = prongs[k + 1].tip, pts = [[x0, y0]]; for (let i = 1; i < 6; i++) { const u = i / 6; pts.push([x0 + (x1 - x0) * u + rand(-1, 1) * R * .05, y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * R * .12 + rand(-1, 1) * R * .05]); } pts.push([x1, y1]); st.arcs.push({ pts, branch: null, life: 1, decay: rand(4, 7) }); }
    if (st.next <= 0) { st.arcs.push(stormArc(R, !small)); st.next = over > .1 ? rand(.02, .06) : rand(.05, .2); }
    if (Math.random() < dt * .25) { st.flash = 1; for (let k = 0; k < 3; k++) st.arcs.push(stormArc(R, true)); }
    st.flash = Math.max(0, st.flash - dt * 4);
    c.globalCompositeOperation = 'lighter';
    for (let i = st.arcs.length - 1; i >= 0; i--) {
      const a = st.arcs[i]; a.life -= dt * a.decay; if (a.life <= 0) { st.arcs.splice(i, 1); continue; }
      const al = a.life * (Math.random() < .2 ? .4 : 1);
      poly(c, a.pts, Math.max(1.2, R * .03), `rgba(120,200,255,${.55 * al})`, R * .25);
      poly(c, a.pts, Math.max(.6, R * .012), `rgba(235,248,255,${.95 * al})`, 0);
      if (a.branch) poly(c, a.branch, Math.max(.6, R * .012), `rgba(200,235,255,${.7 * al})`, R * .15);
    }
    if (over > .05) { st.sparks = st.sparks || []; if (Math.random() < over) { const ang = rand(0, 7); st.sparks.push({ x: Math.cos(ang) * R * 1.1, y: Math.sin(ang) * R * 1.1, vx: Math.cos(ang) * rand(30, 90), vy: Math.sin(ang) * rand(30, 90) - 20, life: 1 }); } }
    st.sparks = (st.sparks || []).filter(s => (s.life -= dt * 2) > 0);
    st.sparks.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 120 * dt; c.fillStyle = `rgba(220,240,255,${s.life})`; c.beginPath(); c.arc(s.x, s.y, Math.max(.8, R * .02), 0, 7); c.fill(); });
    c.globalCompositeOperation = 'source-over';
    const img = el.querySelector('img'); if (img) img.style.filter = st.flash || over ? `brightness(${1 + .35 * st.flash + .25 * over}) saturate(${1 - .3 * over})` : '';
    // Easter Egg: Blitz von oben ins Bild
    if (st.egg) {
      const e = st.egg; e.t += dt;
      const sk = skyCanvas(), W = innerWidth, H = innerHeight;
      if (sk.cv.width !== Math.round(W * DPR)) { sk.cv.width = Math.round(W * DPR); sk.cv.height = Math.round(H * DPR); }
      const sc = sk.c; sc.setTransform(DPR, 0, 0, DPR, 0, 0); sc.clearRect(0, 0, W, H);
      const ft = e.t, flash = ft < .08 ? 1 : ft < .16 ? .2 : ft < .24 ? .8 : Math.max(0, .8 - (ft - .24) * 3);
      sc.fillStyle = `rgba(200,225,255,${.22 * flash})`; sc.fillRect(0, 0, W, H);
      const vis = ft < .5 ? (Math.random() < .85 ? 1 : .3) : Math.max(0, 1 - (ft - .5) * 3);
      if (vis > 0) {
        sc.save(); sc.globalCompositeOperation = 'lighter'; sc.lineJoin = 'round';
        const line = (pts, w, col, blur) => { sc.strokeStyle = col; sc.lineWidth = w; sc.shadowColor = '#8fd8ff'; sc.shadowBlur = blur; sc.beginPath(); pts.forEach(([x, y], i) => i ? sc.lineTo(x, y) : sc.moveTo(x, y)); sc.stroke(); };
        line(e.main, 7, `rgba(120,190,255,${.5 * vis})`, 40); line(e.main, 2.5, `rgba(250,252,255,${vis})`, 10);
        e.forks.forEach(f => { line(f, 3, `rgba(120,190,255,${.35 * vis})`, 20); line(f, 1.2, `rgba(240,248,255,${.8 * vis})`, 0); });
        sc.restore();
      }
      if (ft < .1) { st.charge = 1; st.flash = 1; }
      if (ft > 1.2) { st.egg = null; sc.clearRect(0, 0, W, H); }
    }
  }, {
    egg(st, el) {
      const b = el.getBoundingClientRect(), tx = b.left + b.width / 2, ty = b.top + b.height / 2;
      const bolt = (x0, y0, x1, y1, rough) => { const pts = [[x0, y0]]; for (let i = 1; i < 18; i++) { const u = i / 18; pts.push([x0 + (x1 - x0) * u + rand(-1, 1) * rough * (1 - Math.abs(u - .5)), y0 + (y1 - y0) * u]); } pts.push([x1, y1]); return pts; };
      const main = bolt(tx + rand(-120, 120), -20, tx, ty - b.height * .45, 60);
      st.egg = { t: 0, main, forks: [3, 7, 11].map(k => { const [x, y] = main[k]; return bolt(x, y, x + rand(-140, 140), y + rand(60, 160), 25); }) };
    }
  });

  // ---- Obsidian Crown (Animated) ----
  function obsShard(R, k, n, orbit) {
    const L = R * rand(.22, .34) * (orbit ? .8 : 1), Wd = L * rand(.35, .55);
    return { pts: [[L, 0], [L * .2, -Wd * rand(.7, 1)], [-L * rand(.6, .9), -Wd * rand(.2, .5)], [-L, Wd * rand(.1, .3)], [-L * .1, Wd * rand(.7, 1)]], base: k / n * Math.PI * 2 + rand(-.08, .08), rad: R * (orbit ? 1.42 : 1.15) + rand(-1, 1) * R * .04, spin: rand(-1.2, 1.2), rot: rand(0, 6.28), bob: rand(0, 6.28), orbit, dx: 0, dy: 0, vx: 0, vy: 0 };
  }
  function obsDraw(c, s, x, y, ang, light, R, heat, t) {
    const P = s.pts, k = Math.max(.6, R * .012), amb = .25 + .15 * Math.sin(t * 2 + s.bob), L = Math.min(1, light + amb * .15);
    c.save(); c.translate(x, y); c.rotate(ang);
    const path = new Path2D(); P.forEach(([px, py], i) => i ? path.lineTo(px, py) : path.moveTo(px, py)); path.closePath();
    if (L > .3) { c.save(); c.globalCompositeOperation = 'lighter'; c.shadowColor = `rgba(180,100,255,${L})`; c.shadowBlur = R * .35 * L; c.fillStyle = `rgba(120,60,220,${.25 * L})`; c.fill(path); c.restore(); }
    const base = c.createLinearGradient(P[3][0], P[3][1], P[0][0], P[0][1]); base.addColorStop(0, '#030107'); base.addColorStop(.5, `rgb(${22 + 60 * L},${6 + 20 * L},${44 + 110 * L})`); base.addColorStop(1, '#08040f');
    c.fillStyle = base; c.fill(path);
    c.save(); c.clip(path);
    c.beginPath(); c.moveTo(P[0][0], P[0][1]); c.lineTo(P[1][0], P[1][1]); c.lineTo(P[2][0], P[2][1]); c.lineTo(0, 0); c.closePath();
    const f1 = c.createLinearGradient(P[1][0], P[1][1], 0, 0); f1.addColorStop(0, `rgba(${120 + 110 * L},${40 + 120 * L},255,${.18 + .6 * L})`); f1.addColorStop(1, `rgba(70,20,150,${.05 + .25 * L})`); c.fillStyle = f1; c.fill();
    c.beginPath(); c.moveTo(0, 0); c.lineTo(P[2][0], P[2][1]); c.lineTo(P[3][0], P[3][1]); c.lineTo(P[4][0], P[4][1]); c.closePath();
    const f2 = c.createRadialGradient(P[3][0] * .4, P[3][1] * .4, 0, 0, 0, R * .3); f2.addColorStop(0, `rgba(220,60,255,${.1 + .35 * L})`); f2.addColorStop(1, 'rgba(20,8,40,0)'); c.fillStyle = f2; c.fill();
    const gx = Math.sin(t * 1.3 + s.bob) * R * .12, gl = c.createLinearGradient(gx - R * .03, -R * .2, gx + R * .03, R * .2);
    gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.45, 'rgba(255,255,255,0)'); gl.addColorStop(.5, `rgba(250,225,255,${.08 + .7 * L})`); gl.addColorStop(.55, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gl; c.fillRect(-R * .5, -R * .5, R, R);
    c.restore();
    c.strokeStyle = `rgba(200,150,255,${.15 + .55 * L})`; c.lineWidth = k * .8; c.beginPath(); c.moveTo(P[2][0], P[2][1]); c.lineTo(0, 0); c.lineTo(P[0][0], P[0][1]); c.stroke();
    c.strokeStyle = `rgba(${150 + 100 * L},${70 + 150 * L},255,${.45 + .55 * L})`; c.lineWidth = k; c.stroke(path);
    if (heat > .05) { c.strokeStyle = `rgba(255,${90 + 80 * heat},40,${heat * .8})`; c.lineWidth = k * .8; c.beginPath(); c.moveTo(P[2][0] * .5, P[2][1] * .5); c.lineTo(P[0][0] * .6, P[0][1] * .2); c.stroke(); }
    if (light > .55) { const a = (light - .55) / .45, sx = P[0][0] * .9, sy = P[0][1] * .9, sz = R * .1 * a; c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,245,255,${a})`; c.lineWidth = k; c.beginPath(); c.moveTo(sx - sz, sy); c.lineTo(sx + sz, sy); c.moveTo(sx, sy - sz); c.lineTo(sx, sy + sz); c.stroke(); c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.arc(sx, sy, k * 1.2, 0, 7); c.fill(); c.restore(); }
    c.restore();
  }
  const obsidian = canvasBorder((c, R, t, dt, st, el) => {
    if (!st.shards || st.R !== R) { const small = R < 25, nIn = small ? 10 : 16; st.R = R; st.shards = [...Array.from({ length: nIn }, (_, k) => obsShard(R, k, nIn, false)), ...(small ? [] : Array.from({ length: 7 }, (_, k) => obsShard(R, k, 7, true)))]; }
    const b = st.egg; let pull = 0, heatBoost = 0;
    if (b && dt) {
      b.t += dt;
      if (b.t < .7) { pull = b.t / .7; heatBoost = pull; }
      else if (!b.blown) { b.blown = true; st.shards.forEach(s => { const a = s.base + t * (s.orbit ? -.25 : .35), sp = rand(.9, 1.6) * R * 8; s.vx = Math.cos(a) * sp; s.vy = Math.sin(a) * sp; }); }
      if (b.t > 3.6) { st.egg = null; st.shards.forEach(s => { s.dx = 0; s.dy = 0; }); }
    }
    const heat = .35 + .25 * Math.sin(t * 1.7) + heatBoost * .8;
    const halo = c.createRadialGradient(0, 0, R * .9, 0, 0, R * 1.6); halo.addColorStop(0, `rgba(140,60,220,${.22 + .2 * heatBoost})`); halo.addColorStop(1, 'rgba(140,60,220,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(0, 0, R * 1.6, 0, 7); c.fill();
    c.strokeStyle = '#0a0710'; c.lineWidth = R * .14; c.beginPath(); c.arc(0, 0, R * 1.06, 0, 7); c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 9; k++) { const a0 = k / 9 * 6.283 + t * .15, a1 = a0 + .35 + .2 * Math.sin(t + k); c.strokeStyle = `rgba(255,${80 + 60 * Math.sin(t * 2 + k)},30,${heat * (.4 + .3 * Math.sin(t * 3 + k * 2))})`; c.lineWidth = Math.max(.8, R * .025); c.beginPath(); for (let j = 0; j <= 6; j++) { const a = a0 + (a1 - a0) * j / 6, rr = R * 1.06 + Math.sin(j * 2.3 + k) * R * .035; j ? c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.stroke(); }
    c.restore();
    const sweep = (t * .8) % (Math.PI * 2);
    st.shards.forEach(s => {
      const a = s.base + t * (s.orbit ? -.25 : .35);
      let x = Math.cos(a) * s.rad * (1 - pull * .25), y = Math.sin(a) * s.rad * (1 - pull * .25) + Math.sin(t * 1.5 + s.bob) * R * .03;
      if (b && b.blown) {
        if (b.t < 2.2) { s.dx += s.vx * dt; s.dy += s.vy * dt; s.vx *= .93; s.vy *= .93; }
        else { const u = Math.min(1, (b.t - 2.2) / 1.2), e = u * u * (3 - 2 * u); s.dx *= (1 - e * .25); s.dy *= (1 - e * .25); }
        x += s.dx; y += s.dy;
      }
      const d = Math.abs(((a - sweep + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      const light = Math.max(0, 1 - d / .8) + (b && b.t < .9 ? pull * .5 : 0);
      s.rot += s.spin * dt * (b && b.blown && b.t < 2.2 ? 6 : 1);
      obsDraw(c, s, x, y, s.rot + a, Math.min(1, light), R, heat * .7, t);
    });
    if (b && b.blown && b.t < 1.6) {
      const u = (b.t - .7) / .9;
      c.strokeStyle = `rgba(190,130,255,${Math.max(0, 1 - u)})`; c.lineWidth = R * .06 * (1 - u) + 1; c.beginPath(); c.arc(0, 0, R * (1.1 + u * 1.8), 0, 7); c.stroke();
    }
    const img = el.querySelector('img'); if (img) img.style.filter = b && b.t < .9 ? `brightness(${1 + pull * .3}) hue-rotate(${pull * -20}deg)` : '';
  }, { bigScale: 6, egg(st) { st.egg = { t: 0, blown: false }; } });

  // ---- Fancy-Borders ----
  const dragonfire = canvasBorder((c, R, t, dt, st) => {
    st.embers = st.embers || [];
    const flick = .85 + .15 * Math.sin(t * 9) * Math.sin(t * 3.7);
    const halo = c.createRadialGradient(0, 0, R * .9, 0, 0, R * 1.5); halo.addColorStop(0, `rgba(255,110,30,${.35 * flick})`); halo.addColorStop(1, 'rgba(255,60,10,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(0, 0, R * 1.5, 0, 7); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 28; k++) {
      const a = k / 28 * Math.PI * 2, h = R * (.12 + .1 * (.5 + .5 * Math.sin(t * 7 + k * 1.7)) + (Math.sin(a) < 0 ? .1 : 0));
      const bx = Math.cos(a) * R * 1.05, by = Math.sin(a) * R * 1.05, fg = c.createLinearGradient(bx, by, bx, by - h * 1.6);
      fg.addColorStop(0, 'rgba(255,190,80,.55)'); fg.addColorStop(1, 'rgba(255,60,10,0)');
      c.fillStyle = fg; c.beginPath(); c.moveTo(bx - R * .07, by); c.quadraticCurveTo(bx + Math.sin(t * 5 + k) * R * .05, by - h, bx + Math.sin(t * 4 + k) * R * .04, by - h * 1.6); c.quadraticCurveTo(bx + R * .02, by - h * .6, bx + R * .07, by); c.fill();
    }
    c.restore();
    ring(c, R * 1.05, R * .1, ['#ffcf6b', '#e84a10', '#7a1a04']);
    if (dt && Math.random() < dt * 14) { const a = rand(0, 6.28); st.embers.push({ x: Math.cos(a) * R * 1.05, y: Math.sin(a) * R * 1.05, vx: rand(-8, 8), vy: rand(-40, -20) * R / 50, life: 1 }); }
    for (let i = st.embers.length - 1; i >= 0; i--) { const e = st.embers[i]; e.life -= dt * .7; if (e.life <= 0) { st.embers.splice(i, 1); continue; } e.x += (e.vx + Math.sin(t * 3 + i) * 10) * dt; e.y += e.vy * dt; c.fillStyle = `rgba(255,${150 + 80 * e.life},60,${e.life})`; c.beginPath(); c.arc(e.x, e.y, Math.max(.6, R * .026), 0, 7); c.fill(); }
  });
  const gyro = canvasBorder((c, R, t, dt, st, el) => {
    const C = R * 4;
    const rings = [{ tilt: 1.2, spin: t * .9, rr: R * 1.32 }, { tilt: 1.25, spin: -t * .7 + 1.6, rr: R * 1.22 }];
    const N = R < 25 ? 40 : 72;
    const proj = (g, th) => { const x = Math.cos(th) * g.rr, y0 = Math.sin(th) * g.rr, y = y0 * Math.cos(g.tilt), z = y0 * Math.sin(g.tilt); return [x * Math.cos(g.spin) - y * Math.sin(g.spin), x * Math.sin(g.spin) + y * Math.cos(g.spin), z]; };
    const drawRings = (cc, front) => rings.forEach((g, gi) => {
      for (let k = 0; k < N; k++) {
        const a = proj(g, k / N * Math.PI * 2), b = proj(g, (k + 1) / N * Math.PI * 2), z = (a[2] + b[2]) / 2;
        if ((z >= 0) !== front) continue;
        const lit = .5 + .5 * z / g.rr;
        cc.strokeStyle = gi ? `rgba(${200 + 55 * lit},${170 + 60 * lit},${90 + 60 * lit},${.45 + .55 * lit})` : `rgba(${60 + 100 * lit},${200 + 55 * lit},${210 + 45 * lit},${.45 + .55 * lit})`;
        cc.lineWidth = R * (.05 + .035 * lit); cc.beginPath(); cc.moveTo(a[0], a[1]); cc.lineTo(b[0], b[1]); cc.stroke();
      }
      for (let k = 0; k < 3; k++) {
        const p = proj(g, k / 3 * Math.PI * 2 + t * (gi ? -1.4 : 1.1)); if ((p[2] >= 0) !== front) continue;
        const gl = cc.createRadialGradient(p[0], p[1], 0, p[0], p[1], R * .16); gl.addColorStop(0, gi ? 'rgba(255,220,140,.95)' : 'rgba(150,255,245,.95)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
        cc.fillStyle = gl; cc.beginPath(); cc.arc(p[0], p[1], R * .16, 0, 7); cc.fill();
      }
    });
    // hintere Haelften weich hinter dem Bild ausblenden (eigene Ebene)
    const px = Math.round(C * DPR);
    if (!st.back || st.back.width !== px) { st.back = document.createElement('canvas'); st.back.width = px; st.back.height = px; st.bc = st.back.getContext('2d'); }
    const bc = st.bc; bc.setTransform(1, 0, 0, 1, 0, 0); bc.clearRect(0, 0, px, px); bc.setTransform(DPR, 0, 0, DPR, C / 2 * DPR, C / 2 * DPR);
    drawRings(bc, false);
    bc.globalCompositeOperation = 'destination-out';
    const fade = bc.createRadialGradient(0, 0, R * .85, 0, 0, R * 1.22); fade.addColorStop(0, 'rgba(0,0,0,.8)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
    bc.fillStyle = fade; bc.beginPath(); bc.arc(0, 0, R * 1.3, 0, 7); bc.fill(); bc.globalCompositeOperation = 'source-over';
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(st.back, 0, 0); c.restore();
    const sh = c.createRadialGradient(0, 0, R * .98, 0, 0, R * 1.2); sh.addColorStop(0, 'rgba(5,10,20,.7)'); sh.addColorStop(1, 'rgba(5,10,20,0)');
    c.fillStyle = sh; c.beginPath(); c.arc(0, 0, R * 1.2, 0, 7); c.arc(0, 0, R * .98, 0, 7, true); c.fill('evenodd');
    c.strokeStyle = 'rgba(10,200,185,.8)'; c.lineWidth = Math.max(1, R * .04); c.beginPath(); c.arc(0, 0, R * 1.02, 0, 7); c.stroke();
    drawRings(c, true);
  });
  const chemtech = canvasBorder((c, R, t, dt, st) => {
    st.bub = st.bub || [];
    const r0 = R * 1.02, r1 = R * 1.28, mid = (r0 + r1) / 2;
    const glow = c.createRadialGradient(0, 0, R, 0, 0, R * 1.6); glow.addColorStop(0, 'rgba(120,255,60,.22)'); glow.addColorStop(1, 'rgba(120,255,60,0)');
    c.fillStyle = glow; c.beginPath(); c.arc(0, 0, R * 1.6, 0, 7); c.fill();
    c.fillStyle = 'rgba(20,30,20,.55)'; c.beginPath(); c.arc(0, 0, r1, 0, 7); c.arc(0, 0, r0, 0, 7, true); c.fill('evenodd');
    c.save(); c.beginPath(); c.arc(0, 0, r1, 0, 7); c.arc(0, 0, r0, 0, 7, true); c.clip('evenodd');
    const level = -R * .35;
    c.save(); c.rotate(Math.sin(t * 1.3) * .12);
    c.beginPath(); c.moveTo(-r1 * 1.2, level); for (let x = -r1 * 1.2; x <= r1 * 1.2; x += 3) c.lineTo(x, level + Math.sin(x / R * 6 + t * 3) * R * .03 + Math.sin(x / R * 2.5 - t * 2) * R * .02);
    c.lineTo(r1 * 1.2, r1 * 1.2); c.lineTo(-r1 * 1.2, r1 * 1.2); c.closePath();
    const liq = c.createLinearGradient(0, level, 0, r1); liq.addColorStop(0, 'rgba(190,255,90,.95)'); liq.addColorStop(1, 'rgba(40,170,40,.95)');
    c.fillStyle = liq; c.fill(); c.restore();
    if (dt && Math.random() < dt * 9) { const side = Math.random() < .5 ? -1 : 1; st.bub.push({ ang: Math.PI / 2 + side * rand(.1, 1.4), side, r: rand(r0 + R * .04, r1 - R * .04), v: rand(.6, 1.2), size: rand(.02, .05) * R }); }
    for (let i = st.bub.length - 1; i >= 0; i--) { const b = st.bub[i]; b.ang -= b.side * dt * b.v * .6; const x = Math.cos(b.ang) * b.r, y = Math.sin(b.ang) * b.r; if (y < level + 2) { st.bub.splice(i, 1); continue; } c.strokeStyle = 'rgba(230,255,200,.8)'; c.lineWidth = .8; c.beginPath(); c.arc(x, y, Math.max(.6, b.size), 0, 7); c.stroke(); }
    c.restore();
    c.strokeStyle = 'rgba(220,255,230,.55)'; c.lineWidth = Math.max(.6, R * .025); c.beginPath(); c.arc(0, 0, r1, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, r0, 0, 7); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = Math.max(.8, R * .04); c.beginPath(); c.arc(0, 0, mid + R * .05, -2.6, -1.9); c.stroke();
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; c.save(); c.rotate(a); const w = R * .08, g = c.createLinearGradient(0, -w, 0, w); g.addColorStop(0, '#f0c070'); g.addColorStop(1, '#6a4410'); c.fillStyle = g; c.fillRect(r0 - R * .06, -w, r1 - r0 + R * .12, w * 2); c.restore(); }
  });

  // ---- Refined + Basic (stehend) ----
  const staticBorder = fn => canvasBorder((c, R) => fn(c, R), { static: true });
  const REFINED = {
    'border-shop-ember': (c, R) => { const h = c.createRadialGradient(0, 0, R, 0, 0, R * 1.45); h.addColorStop(0, 'rgba(255,110,30,.4)'); h.addColorStop(1, 'rgba(255,60,10,0)'); c.fillStyle = h; c.beginPath(); c.arc(0, 0, R * 1.45, 0, 7); c.fill(); ring(c, R * 1.08, R * .17, ['#ffd27a', '#e85a14', '#7a1a04', '#e85a14', '#ffd27a']); const r = seeded(4); c.fillStyle = 'rgba(255,210,120,.9)'; for (let k = 0; k < 14; k++) { const a = r() * 7, d = R * (1.2 + r() * .2); c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, R * (.02 + r() * .026), 0, 7); c.fill(); } },
    'border-shop-frost': (c, R) => { ring(c, R * 1.07, R * .15, ['#e8f8ff', '#7cc4ef', '#2a6a9a', '#a8dcff']); c.strokeStyle = '#eef9ff'; c.lineWidth = Math.max(.6, R * .03); for (let k = 0; k < 10; k++) { c.save(); c.rotate(k / 10 * 6.283); c.translate(R * 1.18, 0); c.beginPath(); for (let j = 0; j < 3; j++) { c.rotate(Math.PI / 3); c.moveTo(-R * .11, 0); c.lineTo(R * .11, 0); } c.stroke(); c.restore(); } },
    'border-shop-moonlit': (c, R) => { ring(c, R * 1.06, R * .11, ['#2a2440', '#e9dcc0', '#2a2440']); c.save(); c.translate(0, -R * 1.18); c.fillStyle = '#e9dcc0'; c.beginPath(); c.arc(0, 0, R * .24, 0, 7); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(R * .11, -R * .07, R * .2, 0, 7); c.fill(); c.restore(); const r = seeded(9); c.fillStyle = '#fff6dc'; for (let k = 0; k < 9; k++) { const a = Math.PI * (.65 + r() * 1.7), d = R * (1.18 + r() * .14); c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, R * (.017 + r() * .02), 0, 7); c.fill(); } },
    'border-shop-thorn': (c, R) => { ring(c, R * 1.06, R * .11, ['#3e5a2a', '#1e2e14', '#4e6a32']); c.fillStyle = '#2a3a1a'; for (let k = 0; k < 18; k++) { c.save(); c.rotate(k / 18 * 6.283 + (k % 2) * .08); c.beginPath(); c.moveTo(R * 1.08, -R * .065); c.lineTo(R * 1.28, k % 2 ? R * .09 : -R * .09); c.lineTo(R * 1.08, R * .065); c.fill(); c.restore(); } [-.7, 2.3].forEach(a => { c.save(); c.translate(Math.cos(a) * R * 1.1, Math.sin(a) * R * 1.1); for (let k = 0; k < 5; k++) { c.rotate(1.2566); c.fillStyle = '#c8202a'; c.beginPath(); c.ellipse(R * .11, 0, R * .13, R * .09, 0, 0, 7); c.fill(); } c.fillStyle = '#ffd86b'; c.beginPath(); c.arc(0, 0, R * .055, 0, 7); c.fill(); c.restore(); }); },
    'border-shop-runestone': (c, R) => { ring(c, R * 1.12, R * .28, ['#6a6a70', '#3a3a40', '#7a7a80', '#2e2e34']); if (R < 18) return; c.fillStyle = '#7fd4ff'; c.font = `bold ${Math.round(R * .24)}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; const g = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃ'; for (let k = 0; k < 12; k++) { c.save(); c.rotate(k / 12 * 6.283); c.fillText(g[k], 0, -R * 1.12); c.restore(); } },
    'border-shop-compass': (c, R) => { ring(c, R * 1.1, R * .24, ['#f0c878', '#8a5a1e', '#f0c878', '#6a4414']); c.strokeStyle = '#3a2408'; c.lineWidth = Math.max(.5, R * .02); for (let k = 0; k < 48; k++) { const a = k / 48 * 6.283, l = R * (k % 12 === 0 ? .15 : k % 4 === 0 ? .09 : .045); c.beginPath(); c.moveTo(Math.cos(a) * R * 1.04, Math.sin(a) * R * 1.04); c.lineTo(Math.cos(a) * (R * 1.04 + l), Math.sin(a) * (R * 1.04 + l)); c.stroke(); } if (R >= 18) { c.font = `bold ${Math.round(R * .22)}px Cinzel, serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; [['N', -Math.PI / 2, '#a01818'], ['E', 0, '#2a1806'], ['S', Math.PI / 2, '#2a1806'], ['W', Math.PI, '#2a1806']].forEach(([s, a, col]) => { c.fillStyle = col; c.fillText(s, Math.cos(a) * R * 1.18, Math.sin(a) * R * 1.18); }); } c.fillStyle = '#a01818'; c.beginPath(); c.moveTo(0, -R * 1.42); c.lineTo(-R * .11, -R * 1.28); c.lineTo(R * .11, -R * 1.28); c.fill(); },
    'border-shop-plain': (c, R) => ring(c, R * 1.04, Math.max(1.5, R * .09), ['#c8c8cc', '#8a8a90']),
    'border-shop-ash': (c, R) => ring(c, R * 1.04, Math.max(1.5, R * .11), ['#7d7470', '#3a3330', '#7d7470']),
    'border-shop-silver': (c, R) => { ring(c, R * 1.05, Math.max(1.5, R * .11), ['#f2f4f8', '#9aa0aa', '#f2f4f8', '#6a707a']); ring(c, R * 1.13, Math.max(.5, R * .022), ['#c8ccd4', '#c8ccd4']); }
  };

  TTPCos.register('border', 'border-shop-storm', storm);
  TTPCos.register('border', 'border-shop-obsidian', obsidian);
  TTPCos.register('border', 'border-shop-dragonfire', dragonfire);
  TTPCos.register('border', 'border-shop-gyro', gyro);
  TTPCos.register('border', 'border-shop-chemtech', chemtech);
  Object.entries(REFINED).forEach(([id, fn]) => TTPCos.register('border', id, staticBorder(fn)));

  // ===================== Profil-Rahmen =====================
  // draw(c, x, y, w, h, t, dt, st, wrap); Rahmenkante bei (x,y,w,h)
  function canvasFrame(draw, opts = {}) {
    return wrap => {
      const P = opts.pad || 40;
      const cv = document.createElement('canvas');
      cv.className = 'pf-deco cf-canvas';
      Object.assign(cv.style, { left: `-${P}px`, top: `-${P}px`, zIndex: opts.z || '5' });
      wrap.appendChild(cv);
      const c = cv.getContext('2d'), st = {};
      const it = {
        host: wrap, cv, static: !!opts.static, drawnOnce: false, dirty: true, w: 0, h: 0,
        busy: () => !!st.egg,
        sized() {
          const w = wrap.offsetWidth, h = wrap.offsetHeight;
          if (!w || !h) return false;
          if (w !== it.w || h !== it.h) { it.w = w; it.h = h; cv.width = Math.round((w + P * 2) * DPR); cv.height = Math.round((h + P * 2) * DPR); cv.style.width = `${w + P * 2}px`; cv.style.height = `${h + P * 2}px`; it.dirty = true; }
          return true;
        },
        render(t, dt) { c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, it.w + P * 2, it.h + P * 2); draw(c, P, P, it.w, it.h, t, dt, st, wrap); }
      };
      if (opts.onClick) { it.onClick = e => { opts.onClick(e, st, wrap, cv, P); wake(); }; document.addEventListener('click', it.onClick); }
      items.add(it); wake();
      return () => { items.delete(it); if (it.onClick) document.removeEventListener('click', it.onClick); };
    };
  }
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const corners = (x, y, w, h) => [[x, y, 1, 1], [x + w, y, -1, 1], [x + w, y + h, -1, -1], [x, y + h, 1, -1]];

  // ---- Arcane Circuit (Animated) ----
  function arcaneLayout(st, x, y, w, h) {
    if (st.w === w && st.h === h) return;
    st.w = w; st.h = h;
    const o = 9, r = 22, x0 = x - o, y0 = y - o, x1 = x + w + o, y1 = y + h + o, per = [];
    const arc = (cx, cy, a0, a1) => { for (let i = 0; i <= 8; i++) { const a = a0 + (a1 - a0) * i / 8; per.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    per.push([x0 + r, y0]); per.push([x1 - r, y0]); arc(x1 - r, y0 + r, -Math.PI / 2, 0); per.push([x1, y1 - r]); arc(x1 - r, y1 - r, 0, Math.PI / 2); per.push([x0 + r, y1]); arc(x0 + r, y1 - r, Math.PI / 2, Math.PI); per.push([x0, y0 + r]); arc(x0 + r, y0 + r, Math.PI, Math.PI * 1.5);
    let len = 0; per.forEach((p, i) => { if (i) len += Math.hypot(p[0] - per[i - 1][0], p[1] - per[i - 1][1]); p.len = len; });
    st.per = per; st.len = len;
    const rg = seeded(5); st.branches = [];
    const edge = (ax, ay, bx, by, nx, ny, n) => { for (let k = 0; k < n; k++) { const u = .1 + rg() * .8, px = ax + (bx - ax) * u, py = ay + (by - ay) * u, out = 8 + rg() * 16, jog = (rg() - .5) * 30; st.branches.push([[px, py], [px + nx * out, py + ny * out], [px + nx * out + (ny !== 0 ? jog : 0), py + ny * out + (nx !== 0 ? jog : 0)]]); } };
    const nH = Math.max(3, Math.round(w / 90)), nV = Math.max(2, Math.round(h / 120));
    edge(x0 + r, y0, x1 - r, y0, 0, -1, nH); edge(x0 + r, y1, x1 - r, y1, 0, 1, nH); edge(x0, y0 + r, x0, y1 - r, -1, 0, nV); edge(x1, y0 + r, x1, y1 - r, 1, 0, nV);
    st.runes = []; const nr = Math.max(6, Math.round(w / 55));
    for (let k = 0; k < nr; k++) { const u = (k + .5) / nr; st.runes.push({ x: x0 + r + (x1 - x0 - 2 * r) * u, y: y0, top: true, seed: Math.floor(rg() * 1e6), glow: 0 }, { x: x0 + r + (x1 - x0 - 2 * r) * u, y: y1, top: false, seed: Math.floor(rg() * 1e6), glow: 0 }); }
    const old = st.crystals || [];
    st.crystals = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map((p, i) => ({ x: p[0], y: p[1], lit: 0, clicked: (old[i] || {}).clicked || false, i }));
    st.pulses = st.pulses || Array.from({ length: 5 }, (_, i) => ({ d: i * 300, v: rand(110, 170) * (i % 2 ? -1 : 1), teal: i % 2 === 1 }));
  }
  function arcPoint(st, d) { d = ((d % st.len) + st.len) % st.len; const p = st.per; for (let i = 1; i < p.length; i++) if (p[i].len >= d) { const a = p[i - 1], b = p[i], u = (d - a.len) / (b.len - a.len || 1); return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; } return p[0]; }
  const arcane = canvasFrame((c, x, y, w, h, t, dt, st, wrap) => {
    arcaneLayout(st, x, y, w, h);
    const power = st.egg ? Math.max(0, 1 - Math.abs(st.egg.t - 1.2) / 1.2) : 0;
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = `rgba(214,179,106,${.55 + .3 * power})`; c.lineWidth = 1.6; c.beginPath(); st.per.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.stroke();
    c.strokeStyle = `rgba(10,200,185,${.35 + .4 * power})`; c.lineWidth = 1;
    st.branches.forEach(b => { c.beginPath(); b.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); const [ex, ey] = b[b.length - 1]; c.fillStyle = `rgba(120,255,240,${.5 + .5 * power})`; c.beginPath(); c.arc(ex, ey, 2, 0, 7); c.fill(); });
    c.save(); c.globalCompositeOperation = 'lighter';
    st.pulses.forEach(p => {
      p.d += p.v * dt * (1 + 3 * power);
      for (let k = 0; k < 14; k++) { const [px, py] = arcPoint(st, p.d - Math.sign(p.v) * k * 5), a = (1 - k / 14) * .85; c.fillStyle = p.teal ? `rgba(90,255,235,${a})` : `rgba(255,215,130,${a})`; c.beginPath(); c.arc(px, py, 2.6 - k * .14, 0, 7); c.fill(); }
      const [hx, hy] = arcPoint(st, p.d); st.runes.forEach(rn => { if (Math.hypot(rn.x - hx, rn.y - hy) < 26) rn.glow = 1; });
    });
    c.restore();
    st.runes.forEach(rn => {
      rn.glow = Math.max(power, rn.glow - dt * 1.2); const a = .25 + .75 * rn.glow, rg = seeded(rn.seed);
      c.save(); c.translate(rn.x, rn.y + (rn.top ? -11 : 11)); c.strokeStyle = `rgba(120,255,240,${a})`; c.lineWidth = 1.2; c.shadowColor = '#0ac8b9'; c.shadowBlur = 8 * a;
      c.beginPath(); for (let k = 0; k < 3; k++) { const x0 = (rg() - .5) * 8, y0 = (rg() - .5) * 8; c.moveTo(x0, y0); c.lineTo(x0 + (rg() - .5) * 8, y0 + (rg() - .5) * 8); } c.stroke(); c.restore();
    });
    st.crystals.forEach(cr => {
      cr.lit = Math.max(cr.clicked ? .8 : 0, cr.lit - dt);
      const s = 11 + 3 * cr.lit;
      c.save(); c.translate(cr.x, cr.y); c.rotate(Math.PI / 6);
      const glow = c.createRadialGradient(0, 0, 0, 0, 0, s * 3); glow.addColorStop(0, `rgba(80,230,255,${.35 + .25 * Math.sin(t * 2 + cr.i) + .4 * cr.lit + .3 * power})`); glow.addColorStop(1, 'rgba(80,230,255,0)');
      c.fillStyle = glow; c.beginPath(); c.arc(0, 0, s * 3, 0, 7); c.fill();
      const hex = r => { c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); };
      hex(s + 4); c.fillStyle = '#7a5a20'; c.fill(); c.strokeStyle = '#d6b36a'; c.lineWidth = 1.5; c.stroke();
      hex(s); const g = c.createLinearGradient(-s, -s, s, s); g.addColorStop(0, '#bff8ff'); g.addColorStop(.45, '#2cc8e8'); g.addColorStop(1, '#0a4f7a'); c.fillStyle = g; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = .8; c.beginPath(); for (let k = 0; k < 6; k += 2) { const a = k * Math.PI / 3; c.moveTo(0, 0); c.lineTo(Math.cos(a) * s, Math.sin(a) * s); } c.stroke();
      c.restore();
    });
    if (st.egg) {
      const e = st.egg; e.t += dt;
      const cx = x + w / 2, cy = y + h / 2;
      if (e.t < 1.2) { c.save(); c.globalCompositeOperation = 'lighter'; st.crystals.forEach(cr => { for (let k = 0; k < 10; k++) { const u = Math.min(1, e.t / 1 + k * .03) % 1; c.fillStyle = `rgba(120,255,240,${.6 * (1 - k / 10)})`; c.beginPath(); c.arc(cr.x + (cx - cr.x) * u, cr.y + (cy - cr.y) * u, 3 - k * .2, 0, 7); c.fill(); } }); c.restore(); }
      const a = e.t < 1 ? 0 : e.t < 1.6 ? (e.t - 1) / .6 : e.t < 4 ? 1 : Math.max(0, 1 - (e.t - 4) / 1.2);
      if (a > 0) {
        // Siegel hinter dem Board: auf eigener Canvas unter dem Board-Inhalt
        if (!st.seal) { st.seal = document.createElement('canvas'); st.seal.className = 'pf-deco'; Object.assign(st.seal.style, { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: '-1' }); wrap.prepend(st.seal); }
        const S = Math.max(w, h) * 1.15, sc = st.seal;
        if (sc.width !== Math.round(S * DPR)) { sc.width = Math.round(S * DPR); sc.height = sc.width; sc.style.width = sc.style.height = `${S}px`; }
        const s2 = sc.getContext('2d'); s2.setTransform(DPR, 0, 0, DPR, 0, 0); s2.clearRect(0, 0, S, S);
        s2.save(); s2.translate(S / 2, S / 2); s2.globalCompositeOperation = 'lighter';
        const R = S * .44, gl = s2.createRadialGradient(0, 0, 0, 0, 0, R * 1.1); gl.addColorStop(0, `rgba(10,200,185,${.35 * a})`); gl.addColorStop(1, 'rgba(10,200,185,0)');
        s2.fillStyle = gl; s2.beginPath(); s2.arc(0, 0, R * 1.1, 0, 7); s2.fill();
        s2.strokeStyle = `rgba(120,255,240,${.7 * a})`; s2.shadowColor = '#0ac8b9'; s2.shadowBlur = 16; s2.lineWidth = 2; s2.beginPath(); s2.arc(0, 0, R, 0, 7); s2.stroke(); s2.lineWidth = 1; s2.beginPath(); s2.arc(0, 0, R * .9, 0, 7); s2.stroke();
        s2.save(); s2.rotate(t * .4); s2.strokeStyle = `rgba(214,179,106,${.8 * a})`; s2.lineWidth = 2;
        [[.8, 0], [.55, Math.PI / 6]].forEach(([f, off]) => { s2.beginPath(); for (let k = 0; k <= 6; k++) { const an = k * Math.PI / 3 + off; s2[k ? 'lineTo' : 'moveTo'](Math.cos(an) * R * f, Math.sin(an) * R * f); } s2.stroke(); });
        s2.restore();
        s2.save(); s2.rotate(-t * .25); s2.fillStyle = `rgba(120,255,240,${.8 * a})`; s2.font = `${Math.round(R * .07)}px serif`; s2.textAlign = 'center';
        const glyphs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'; for (let k = 0; k < 24; k++) { s2.save(); s2.rotate(k / 24 * Math.PI * 2); s2.fillText(glyphs[k], 0, -R * .93); s2.restore(); }
        s2.restore(); s2.restore();
      }
      if (e.t > 5.3) { st.egg = null; if (st.seal) { st.seal.remove(); st.seal = null; } }
    }
  }, {
    pad: 80, z: '5',
    onClick(e, st, wrap, cv, P) {
      if (st.egg || !st.crystals || document.body.classList.contains('editing')) return;
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const cr = st.crystals.find(k => Math.hypot(k.x - x, k.y - y) < 20); if (!cr) return;
      cr.clicked = true; cr.lit = 1; clearTimeout(cr.reset); cr.reset = setTimeout(() => { cr.clicked = false; }, 6000);
      if (st.crystals.every(k => k.clicked)) { st.egg = { t: 0 }; st.crystals.forEach(k => { k.clicked = false; clearTimeout(k.reset); }); }
    }
  });

  // ---- Fancy-Rahmen ----
  const voidRift = canvasFrame((c, x, y, w, h, t, dt, st) => {
    if (!st.cracks || st.w !== w || st.h !== h) { st.w = w; st.h = h; const rg = seeded(17); st.cracks = corners(x, y, w, h).map(([cx, cy, sx, sy]) => Array.from({ length: 3 }, () => { const pts = [[cx, cy]]; let px = cx, py = cy; const dir = .2 + rg() * 1.1; for (let k = 0; k < 6; k++) { px += Math.cos(dir) * sx * (6 + rg() * 6) + (rg() - .5) * 6; py += Math.sin(dir) * sy * (6 + rg() * 6) + (rg() - .5) * 6; pts.push([px, py]); } return pts; })); st.motes = []; }
    c.strokeStyle = '#3a1a5e'; c.lineWidth = 2; rr(c, x, y, w, h, 14); c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter';
    st.cracks.forEach((set, ci) => set.forEach((pts, k) => { const pu = .5 + .5 * Math.sin(t * 2 + ci + k); c.strokeStyle = `rgba(178,107,255,${.35 + .5 * pu})`; c.shadowColor = '#b26bff'; c.shadowBlur = 10 + 10 * pu; c.lineWidth = 1.6; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); }));
    c.shadowBlur = 0;
    if (dt && Math.random() < dt * 10) { const [cx, cy] = corners(x, y, w, h)[Math.floor(rand(0, 4))]; const a = rand(0, 6.28), d = rand(30, 60); st.motes.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, tx: cx, ty: cy, life: 1 }); }
    for (let i = st.motes.length - 1; i >= 0; i--) { const m = st.motes[i]; m.life -= dt * .8; if (m.life <= 0) { st.motes.splice(i, 1); continue; } m.x += (m.tx - m.x) * dt * 1.5; m.y += (m.ty - m.y) * dt * 1.5; c.fillStyle = `rgba(200,150,255,${m.life * .8})`; c.beginPath(); c.arc(m.x, m.y, 1.4, 0, 7); c.fill(); }
    c.restore();
  });
  const clockwork = canvasFrame((c, x, y, w, h, t) => {
    const bronze = c.createLinearGradient(x, y, x + w, y + h); bronze.addColorStop(0, '#b87a3a'); bronze.addColorStop(.35, '#5e3816'); bronze.addColorStop(.65, '#8a5426'); bronze.addColorStop(1, '#3e2410');
    c.strokeStyle = bronze; c.lineWidth = 7; rr(c, x, y, w, h, 12); c.stroke();
    c.strokeStyle = 'rgba(240,170,100,.35)'; c.lineWidth = 1; rr(c, x - 3, y - 3, w + 6, h + 6, 14); c.stroke();
    c.strokeStyle = 'rgba(20,10,4,.8)'; rr(c, x + 4, y + 4, w - 8, h - 8, 9); c.stroke();
    const rivet = (px, py) => { const g = c.createRadialGradient(px - 1, py - 1, 0, px, py, 3); g.addColorStop(0, '#f2c48a'); g.addColorStop(1, '#4a2a10'); c.fillStyle = g; c.beginPath(); c.arc(px, py, 2.4, 0, 7); c.fill(); };
    for (let px = x + 40; px < x + w - 30; px += 26) { rivet(px, y); rivet(px, y + h); }
    for (let py = y + 36; py < y + h - 30; py += 26) { rivet(x, py); rivet(x + w, py); }
    const py = y + h + 14, pipe = c.createLinearGradient(0, py - 4, 0, py + 4); pipe.addColorStop(0, '#f0a868'); pipe.addColorStop(.5, '#a85a24'); pipe.addColorStop(1, '#4e2610');
    c.fillStyle = pipe; c.fillRect(x + 50, py - 4, w - 100, 8); [x + 50, x + w - 50].forEach(px => { c.fillStyle = '#6a3a16'; c.fillRect(px - 3, py - 6, 6, 12); });
    c.save(); c.translate(x + w * .5, py); c.rotate(t * .8); c.strokeStyle = '#c47a38'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.stroke(); for (let k = 0; k < 4; k++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, 0); c.lineTo(8, 0); c.stroke(); } c.restore();
    const puff = (t * .5) % 1; c.fillStyle = `rgba(230,225,215,${.3 * (1 - puff)})`; c.beginPath(); c.arc(x + w * .5 + 22, py - 8 - puff * 20, 3 + puff * 8, 0, 7); c.fill();
    const mx = x + w * .5, my = y - 12, dial = c.createRadialGradient(mx, my, 0, mx, my, 13); dial.addColorStop(0, '#efe4cc'); dial.addColorStop(.8, '#cbb894'); dial.addColorStop(1, '#5e3816');
    c.fillStyle = dial; c.beginPath(); c.arc(mx, my, 12, 0, 7); c.fill(); c.strokeStyle = '#8a5426'; c.lineWidth = 2.5; c.stroke();
    c.strokeStyle = '#3a2410'; c.lineWidth = 1; for (let k = 0; k < 7; k++) { const a = Math.PI * .8 + k / 6 * Math.PI * 1.4; c.beginPath(); c.moveTo(mx + Math.cos(a) * 8, my + Math.sin(a) * 8); c.lineTo(mx + Math.cos(a) * 10, my + Math.sin(a) * 10); c.stroke(); }
    const na = Math.PI * 1.25 + Math.sin(t * .7) * .5 + Math.sin(t * 9) * .03; c.strokeStyle = '#a01818'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + Math.cos(na) * 9, my + Math.sin(na) * 9); c.stroke();
    const gear = (gx, gy, r, teeth, ang) => {
      c.save(); c.translate(gx, gy); c.rotate(ang); c.beginPath();
      for (let k = 0; k < teeth * 2; k++) { const a = k / (teeth * 2) * Math.PI * 2, rad = k % 2 ? r : r * 1.2; c.lineTo(Math.cos(a - .09) * rad, Math.sin(a - .09) * rad); c.lineTo(Math.cos(a + .09) * rad, Math.sin(a + .09) * rad); }
      c.closePath(); const g = c.createRadialGradient(-r * .3, -r * .3, 0, 0, 0, r * 1.2); g.addColorStop(0, '#d89a5a'); g.addColorStop(.6, '#7a4618'); g.addColorStop(1, '#3e2208');
      c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(80,150,125,.55)'; c.lineWidth = 1.2; c.stroke();
      c.strokeStyle = 'rgba(30,15,4,.9)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, r * .72, 0, 7); c.stroke();
      for (let k = 0; k < 5; k++) { c.rotate(Math.PI * 2 / 5); c.fillStyle = 'rgba(25,12,3,.85)'; c.beginPath(); c.ellipse(r * .45, 0, r * .16, r * .1, 0, 0, 7); c.fill(); }
      c.fillStyle = '#2a1606'; c.beginPath(); c.arc(0, 0, r * .22, 0, 7); c.fill(); c.fillStyle = '#c88a4a'; c.beginPath(); c.arc(0, 0, r * .1, 0, 7); c.fill(); c.restore();
    };
    corners(x, y, w, h).forEach(([cx, cy, sx, sy], i) => { gear(cx, cy, 19, 12, t * .5 * (i % 2 ? -1 : 1)); gear(cx + sx * 26, cy + sy * 14, 10, 8, -t * (i % 2 ? -1 : 1) + .2); });
  });
  const filigree = canvasFrame((c, x, y, w, h, t) => {
    const gold = c.createLinearGradient(x, y, x + w, y + h); gold.addColorStop(0, '#f8e2a0'); gold.addColorStop(.5, '#b8862e'); gold.addColorStop(1, '#f2d27a');
    c.strokeStyle = gold; c.lineWidth = 2; rr(c, x, y, w, h, 14); c.stroke(); c.lineWidth = 1; c.globalAlpha = .5; rr(c, x - 5, y - 5, w + 10, h + 10, 18); c.stroke(); c.globalAlpha = 1;
    corners(x, y, w, h).forEach(([cx, cy, sx, sy]) => {
      c.save(); c.translate(cx, cy); c.scale(sx, sy); c.strokeStyle = gold; c.lineWidth = 1.6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-8, 30); c.bezierCurveTo(-8, 8, 8, -8, 30, -8); c.stroke();
      c.beginPath(); c.moveTo(-2, 14); c.bezierCurveTo(10, 14, 14, 4, 6, 0); c.bezierCurveTo(0, -3, -2, 4, 3, 6); c.stroke();
      c.beginPath(); c.moveTo(14, -2); c.bezierCurveTo(14, 10, 4, 14, 0, 6); c.stroke();
      c.beginPath(); c.moveTo(30, -8); c.bezierCurveTo(40, -16, 50, -6, 44, -2); c.stroke();
      c.beginPath(); c.moveTo(-8, 30); c.bezierCurveTo(-16, 40, -6, 50, -2, 44); c.stroke();
      c.fillStyle = gold; c.beginPath(); c.arc(-6, -6, 3, 0, 7); c.fill(); c.restore();
    });
    const per = 2 * (w + h), d = (t * 160) % per; let gx, gy;
    if (d < w) { gx = x + d; gy = y; } else if (d < w + h) { gx = x + w; gy = y + d - w; } else if (d < 2 * w + h) { gx = x + w - (d - w - h); gy = y + h; } else { gx = x; gy = y + h - (d - 2 * w - h); }
    if (t) { c.save(); c.globalCompositeOperation = 'lighter'; const sg = c.createRadialGradient(gx, gy, 0, gx, gy, 26); sg.addColorStop(0, 'rgba(255,245,210,.75)'); sg.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = sg; c.beginPath(); c.arc(gx, gy, 26, 0, 7); c.fill(); c.restore(); }
  });

  // ---- Refined + Basic Rahmen (stehend) ----
  const sf = fn => canvasFrame((c, x, y, w, h) => fn(c, x, y, w, h), { static: true });
  const FR = {
    'frame-shop-iron': (c, x, y, w, h) => { const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#9a9aa3'); g.addColorStop(.5, '#4a4a52'); g.addColorStop(1, '#8a8a92'); c.strokeStyle = g; c.lineWidth = 6; rr(c, x, y, w, h, 10); c.stroke(); corners(x, y, w, h).forEach(([cx, cy, sx, sy]) => { c.fillStyle = '#5a5a62'; c.fillRect(cx - (sx > 0 ? 3 : 25), cy - (sy > 0 ? 3 : 25), 28, 28); c.fillStyle = '#c8c8d0'; [[8, 8], [20, 8], [8, 20]].forEach(([a, b]) => { c.beginPath(); c.arc(cx + sx * a, cy + sy * b, 2, 0, 7); c.fill(); }); }); },
    'frame-shop-ivy': (c, x, y, w, h) => { c.strokeStyle = '#3a5a2a'; c.lineWidth = 3; rr(c, x, y, w, h, 12); c.stroke(); const r = seeded(11); const leaf = (lx, ly, a) => { c.save(); c.translate(lx, ly); c.rotate(a); c.fillStyle = r() < .5 ? '#4caf7d' : '#2e7d47'; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(5, -6, 11, -2, 12, 0); c.bezierCurveTo(11, 2, 5, 6, 0, 0); c.fill(); c.restore(); }; const n = Math.round((w + h) / 8); for (let k = 0; k < n; k++) { const u = r(), side = Math.floor(r() * 4), [lx, ly] = side === 0 ? [x + u * w, y] : side === 1 ? [x + w, y + u * h] : side === 2 ? [x + u * w, y + h] : [x, y + u * h]; if (u > .25 && u < .75 && r() < .7) continue; leaf(lx, ly, r() * 6.28); } },
    'frame-shop-rune': (c, x, y, w, h) => { c.strokeStyle = '#6a4ab0'; c.lineWidth = 2; rr(c, x, y, w, h, 12); c.stroke(); c.globalAlpha = .4; rr(c, x - 6, y - 6, w + 12, h + 12, 16); c.stroke(); c.globalAlpha = 1; c.fillStyle = '#b088ff'; c.font = '12px serif'; c.textAlign = 'center'; const g = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ', n = Math.max(5, Math.round(w / 60)); for (let k = 0; k < n; k++) { c.fillText(g[k % g.length], x + 30 + k * (w - 60) / (n - 1), y - 1); c.fillText(g[(k + 7) % g.length], x + 30 + k * (w - 60) / (n - 1), y + h + 9); } },
    'frame-shop-gilded': (c, x, y, w, h) => { const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#f6dc8c'); g.addColorStop(.5, '#a8762a'); g.addColorStop(1, '#f2d27a'); c.strokeStyle = g; c.lineWidth = 5; rr(c, x, y, w, h, 12); c.stroke(); c.lineWidth = 1; rr(c, x + 6, y + 6, w - 12, h - 12, 8); c.stroke(); corners(x, y, w, h).forEach(([cx, cy]) => { c.fillStyle = g; c.save(); c.translate(cx, cy); c.rotate(Math.PI / 4); c.fillRect(-6, -6, 12, 12); c.restore(); }); },
    'frame-shop-marble': (c, x, y, w, h) => { c.save(); c.beginPath(); c.rect(x - 7, y - 7, w + 14, h + 14); c.rect(x + 2, y + 2, w - 4, h - 4); c.clip('evenodd'); c.fillStyle = '#ece8e2'; c.fillRect(x - 10, y - 10, w + 20, h + 20); const r = seeded(21); c.strokeStyle = 'rgba(120,110,120,.5)'; c.lineWidth = .8; const n = Math.round(w / 20); for (let k = 0; k < n; k++) { c.beginPath(); let px = x - 10 + r() * (w + 20), py = y - 10; c.moveTo(px, py); for (let j = 0; j < 8; j++) { px += r() * 30 - 15; py += (h + 20) / 8; c.lineTo(px, py); } c.stroke(); } c.restore(); c.strokeStyle = '#c8c0b4'; c.lineWidth = 1; rr(c, x - 7, y - 7, w + 14, h + 14, 16); c.stroke(); },
    'frame-shop-bamboo': (c, x, y, w, h) => { const stalk = (x0, y0, x1, y1) => { const hz = y0 === y1, len = hz ? x1 - x0 : y1 - y0, g = hz ? c.createLinearGradient(0, y0 - 5, 0, y0 + 5) : c.createLinearGradient(x0 - 5, 0, x0 + 5, 0); g.addColorStop(0, '#c8b060'); g.addColorStop(.5, '#e8d488'); g.addColorStop(1, '#8a7430'); c.fillStyle = g; if (hz) c.fillRect(x0, y0 - 5, len, 10); else c.fillRect(x0 - 5, y0, 10, len); c.fillStyle = '#6a5420'; for (let k = 30; k < len - 10; k += 46) { if (hz) c.fillRect(x0 + k, y0 - 5, 2, 10); else c.fillRect(x0 - 5, y0 + k, 10, 2); } }; stalk(x - 8, y, x + w + 8, y); stalk(x - 8, y + h, x + w + 8, y + h); stalk(x, y - 8, x, y + h + 8); stalk(x + w, y - 8, x + w, y + h + 8); c.strokeStyle = '#5a3a1a'; c.lineWidth = 2; corners(x, y, w, h).forEach(([cx, cy]) => { c.beginPath(); c.moveTo(cx - 6, cy - 6); c.lineTo(cx + 6, cy + 6); c.moveTo(cx + 6, cy - 6); c.lineTo(cx - 6, cy + 6); c.stroke(); }); },
    'frame-shop-slate': (c, x, y, w, h) => { c.strokeStyle = '#6e7480'; c.lineWidth = 2; rr(c, x, y, w, h, 12); c.stroke(); },
    'frame-shop-oak': (c, x, y, w, h) => { c.strokeStyle = '#8a6a44'; c.lineWidth = 6; rr(c, x, y, w, h, 10); c.stroke(); c.strokeStyle = 'rgba(40,24,10,.5)'; c.lineWidth = 1; rr(c, x - 2, y - 2, w + 4, h + 4, 12); c.stroke(); },
    'frame-shop-paper': (c, x, y, w, h) => { c.strokeStyle = '#e8e0cc'; c.lineWidth = 3; c.setLineDash([10, 5]); rr(c, x, y, w, h, 12); c.stroke(); c.setLineDash([]); }
  };

  TTPCos.register('frame', 'frame-shop-arcane', arcane);
  TTPCos.register('frame', 'frame-shop-void', voidRift);
  TTPCos.register('frame', 'frame-shop-clock', clockwork);
  TTPCos.register('frame', 'frame-shop-filigree', filigree);
  Object.entries(FR).forEach(([id, fn]) => TTPCos.register('frame', id, sf(fn)));
})();
