// Shop-Borders und -Profilrahmen II (v5.20.0) - Designs aus theme-lab/ (alle
// vom Nutzer abgenommen): shop-spirit-dragon.html, devchoice-cyberpunk-kit.html,
// shop-fancy-2.html, shop-kraken-phoenix.html, shop-refined-basic-2.html,
// shop-pearl-glass-variants.html, shop-frame-candidates.html.
// Nutzt die Zeichenschleife aus shop-cosmetics.js (window.TTPShopCosKit).
//
// Easter Eggs (Animated):
//   Spirit Lantern - 5x aufs grosse Profilbild: die Geisterflammen werden zu Fuechsen
//   Optic Scan     - 5x aufs grosse Profilbild: Fadenkreuz rastet ein, Scan-Daten tippen sich aus
//   Celestial Dragon - Kopf anklicken: Bruellen, alles glueht golden, Sternenregen
//   Kraken         - Maul anklicken: Arme quetschen die Karte, dann Tinte ueber den ganzen Bildschirm
//   Phoenix        - Phoenix anklicken: verbrennt zu Asche und wird wiedergeboren
//   Netrunner HUD  - blinkenden Chip unten rechts anklicken: Systemueberlastung, Neustart
(function () {
  if (!window.TTPCos || !window.TTPShopCosKit || window.TTPShopCos2) return;
  window.TTPShopCos2 = true;
  const { canvasBorder, canvasFrame, ring, rr, corners, seeded, rand } = window.TTPShopCosKit;
  const mouse = [-9999, -9999];
  addEventListener('mousemove', e => { mouse[0] = e.clientX; mouse[1] = e.clientY; }, { passive: true });
  const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  const editing = () => document.body.classList.contains('editing');

  // Umlaufbahn um die Rahmenkante (abgerundetes Rechteck, im Uhrzeigersinn ab oben links).
  // at(d) -> [x, y, Winkel]; aussen = (sin a, -cos a)
  function perim(P, BW, BH, o, r) {
    const x0 = P - o, y0 = P - o, x1 = P + BW + o, y1 = P + BH + o, per = [];
    const arc = (cx, cy, a0, a1) => { for (let i = 0; i <= 10; i++) { const a = a0 + (a1 - a0) * i / 10; per.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    const line = (ax, ay, bx, by) => { const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 6)); for (let i = 0; i <= n; i++) per.push([ax + (bx - ax) * i / n, ay + (by - ay) * i / n]); };
    line(x0 + r, y0, x1 - r, y0); arc(x1 - r, y0 + r, -Math.PI / 2, 0); line(x1, y0 + r, x1, y1 - r); arc(x1 - r, y1 - r, 0, Math.PI / 2);
    line(x1 - r, y1, x0 + r, y1); arc(x0 + r, y1 - r, Math.PI / 2, Math.PI); line(x0, y1 - r, x0, y0 + r); arc(x0 + r, y0 + r, Math.PI, Math.PI * 1.5);
    let len = 0; per.forEach((p, i) => { if (i) len += Math.hypot(p[0] - per[i - 1][0], p[1] - per[i - 1][1]); p.len = len; });
    const at = d => { d = ((d % len) + len) % len; let lo = 1, hi = per.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (per[m].len >= d) hi = m; else lo = m + 1; } const a = per[lo - 1], b = per[lo], u = (d - a.len) / (b.len - a.len || 1); return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, Math.atan2(b[1] - a[1], b[0] - a[0])]; };
    const topLen = x1 - x0 - 2 * r, sideLen = y1 - y0 - 2 * r, q = Math.PI * r / 2;
    const marks = { topMid: topLen / 2, br: topLen + q + sideLen + q / 2, bl: topLen + q + sideLen + q + topLen + q / 2, bottomMid: topLen + q + sideLen + q + topLen / 2 };
    return { at, len, marks, x0, y0, x1, y1 };
  }
  // Klickposition relativ zur Rahmen-Canvas
  const local = (e, cv) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };

  // ============================== BORDERS ==============================
  // ---- Spirit Lantern (Animated) ----
  const lantern = canvasBorder((c, R, t, dt, st) => {
    const k = R / 48;
    if (!st.petals) st.petals = Array.from({ length: 10 }, () => ({ a: rand(0, 6.28), r: rand(1.15, 1.5), v: rand(.2, .5), rot: rand(0, 6.28), s: rand(.6, 1) }));
    const lglint = (x, y, ph) => { const v = Math.max(0, Math.sin(ph * 2.1) - .85) / .15; if (v <= 0) return; c.strokeStyle = `rgba(255,255,255,${v * .9})`; c.lineWidth = Math.max(.5, k); const z = 8 * v * k; c.beginPath(); c.moveTo(x - z, y); c.lineTo(x + z, y); c.moveTo(x, y - z); c.lineTo(x, y + z); c.stroke(); };
    const lstar = (x, y, r, ph) => { r *= k; const tw = .6 + .4 * Math.sin(ph * 3); const g = c.createRadialGradient(x, y, 0, x, y, r * 4); g.addColorStop(0, `rgba(235,230,255,${.55 * tw})`); g.addColorStop(1, 'rgba(235,230,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 4, 0, 7); c.fill(); c.fillStyle = `rgba(255,255,255,${tw})`; c.beginPath(); c.arc(x, y, r * .7, 0, 7); c.fill(); };
    const flame = (x, y, s, ph, a) => { const fl = Math.sin(t * 7 + ph) * .15; const g = c.createRadialGradient(x, y + s * .2, 0, x, y, s * 1.4); g.addColorStop(0, `rgba(220,240,255,${a})`); g.addColorStop(.35, `rgba(110,170,255,${a * .85})`); g.addColorStop(1, 'rgba(120,80,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - s * .5, y + s * .3); c.quadraticCurveTo(x - s * .6, y - s * .4, x + fl * s, y - s * (1.3 + fl)); c.quadraticCurveTo(x + s * .6, y - s * .4, x + s * .5, y + s * .3); c.quadraticCurveTo(x, y + s * .7, x - s * .5, y + s * .3); c.fill(); };
    const fox = (x, y, s, ang, a) => {
      c.save(); c.translate(x, y); c.rotate(ang); c.globalAlpha = a; c.shadowColor = '#7ab8ff'; c.shadowBlur = s * .8;
      const leg = Math.sin(t * 22) * s * .15; c.fillStyle = 'rgba(190,220,255,.9)';
      c.beginPath(); c.ellipse(0, 0, s * .55, s * .22, 0, 0, 7); c.fill();
      c.beginPath(); c.moveTo(s * .45, -s * .1); c.lineTo(s * .85, -s * .05); c.lineTo(s * .6, s * .12); c.fill();
      c.beginPath(); c.moveTo(s * .45, -s * .15); c.lineTo(s * .5, -s * .45); c.lineTo(s * .62, -s * .18); c.fill();
      c.fillStyle = 'rgba(150,120,255,.8)'; c.beginPath(); c.moveTo(-s * .5, 0); c.quadraticCurveTo(-s, -s * .4 + leg, -s * 1.3, -s * .1); c.quadraticCurveTo(-s * .95, s * .15, -s * .5, s * .08); c.fill();
      c.strokeStyle = 'rgba(190,220,255,.9)'; c.lineWidth = s * .08; c.beginPath(); c.moveTo(s * .3, s * .15); c.lineTo(s * .35 + leg, s * .42); c.moveTo(-s * .3, s * .15); c.lineTo(-s * .35 - leg, s * .42); c.stroke();
      c.restore();
    };
    const halo = c.createRadialGradient(0, 0, R * .9, 0, 0, R * 1.6); halo.addColorStop(0, 'rgba(110,120,255,.3)'); halo.addColorStop(.6, 'rgba(150,100,255,.12)'); halo.addColorStop(1, 'rgba(110,90,255,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(0, 0, R * 1.6, 0, 7); c.fill();
    const rg = c.createLinearGradient(-R, -R, R, R); rg.addColorStop(0, '#dfe4ff'); rg.addColorStop(.5, '#7a80e0'); rg.addColorStop(1, '#c8bcff');
    c.strokeStyle = rg; c.lineWidth = R * .07; c.beginPath(); c.arc(0, 0, R * 1.05, 0, 7); c.stroke();
    // Sternbild-Band wie der Drachenkoerper
    const BN = 28, rIn = R * 1.12, rOut = R * 1.46, rMid = (rIn + rOut) / 2, rot = t * .05;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let j = 0; j < BN; j += 2) { const a = rot + j / BN * Math.PI * 2, x = Math.cos(a) * rMid, y = Math.sin(a) * rMid, u = j / BN, g = c.createRadialGradient(x, y, 0, x, y, R * .36); g.addColorStop(0, `rgba(${90 + u * 70 | 0},${110 - u * 30 | 0},255,.1)`); g.addColorStop(1, 'rgba(80,60,200,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, R * .36, 0, 7); c.fill(); }
    c.restore();
    c.lineWidth = Math.max(.5, k);
    c.strokeStyle = 'rgba(180,190,255,.3)'; [rIn, rOut].forEach(r2 => { c.beginPath(); c.arc(0, 0, r2, 0, 7); c.stroke(); });
    c.strokeStyle = 'rgba(180,190,255,.55)'; c.beginPath(); c.arc(0, 0, rMid, 0, 7); c.stroke();
    c.strokeStyle = 'rgba(180,190,255,.2)'; c.beginPath();
    for (let j = 0; j < BN; j++) { const a = rot + j / BN * Math.PI * 2, b = rot + (j + 1) / BN * Math.PI * 2, r1 = j % 2 ? rIn : rOut, r2 = j % 2 ? rOut : rIn; c.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); c.lineTo(Math.cos(b) * r2, Math.sin(b) * r2); }
    c.stroke();
    for (let j = 0; j < BN; j++) { const a = rot + j / BN * Math.PI * 2;
      if (j % 2 === 0) { const big = j % 6 === 0; lstar(Math.cos(a) * rMid, Math.sin(a) * rMid, big ? 2.8 : 1.8, t + j); if (big) lglint(Math.cos(a) * rMid, Math.sin(a) * rMid, t * .8 + j); }
      else lstar(Math.cos(a) * (j % 4 === 1 ? rIn : rOut), Math.sin(a) * (j % 4 === 1 ? rIn : rOut), 1.1, t * 1.3 + j); }
    // Papierlaternen
    [-.5, 1.6, 3.7].forEach((a, j) => {
      const x = Math.cos(a) * R * 1.12, y = Math.sin(a) * R * 1.12, sw = Math.sin(t * 1.6 + j) * .25;
      c.save(); c.translate(x, y); c.rotate(sw);
      c.strokeStyle = 'rgba(200,200,230,.6)'; c.lineWidth = Math.max(.5, k); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, R * .14); c.stroke();
      const lg = c.createRadialGradient(0, R * .28, 0, 0, R * .28, R * .2); lg.addColorStop(0, '#fffbe8'); lg.addColorStop(.6, '#ffd77a'); lg.addColorStop(1, '#b08a3a');
      c.fillStyle = lg; c.shadowColor = '#ffd86b'; c.shadowBlur = R * .25; c.beginPath(); c.ellipse(0, R * .28, R * .1, R * .14, 0, 0, 7); c.fill(); c.shadowBlur = 0;
      c.fillStyle = '#9aa0d8'; c.fillRect(-R * .06, R * .13, R * .12, R * .03); c.fillRect(-R * .06, R * .41, R * .12, R * .03);
      c.restore();
    });
    // Sternenstaub
    st.petals.forEach(p => { p.a += p.v * dt; p.rot += dt; const x = Math.cos(p.a) * R * p.r, y = Math.sin(p.a) * R * p.r + Math.sin(t + p.rot) * 3 * k; const z = R * .045 * p.s * (.6 + .4 * Math.sin(t * 4 + p.rot * 3)); c.save(); c.translate(x, y); c.rotate(p.rot * .3); c.fillStyle = 'rgba(255,245,220,.85)'; c.beginPath(); c.moveTo(0, -z * 2); c.quadraticCurveTo(0, 0, z * 2, 0); c.quadraticCurveTo(0, 0, 0, z * 2); c.quadraticCurveTo(0, 0, -z * 2, 0); c.quadraticCurveTo(0, 0, 0, -z * 2); c.fill(); c.restore(); });
    // Geisterflammen kreisen (bzw. werden zu Fuechsen)
    const f = st.egg, morph = f ? (f.t < .5 ? f.t / .5 : f.t > 3.3 ? Math.max(0, 1 - (f.t - 3.3) / .5) : 1) : 0;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let j = 0; j < 5; j++) {
      const base = j / 5 * Math.PI * 2; let a = base + t * .6, r2 = R * 1.62;
      if (f) { a += f.lap; r2 = R * (1.62 + .1 * morph); }
      const x = Math.cos(a) * r2, y = Math.sin(a) * r2;
      if (morph < 1) flame(x, y, R * .22, j, 1 - morph);
      if (morph > 0) fox(x, y, R * .46, a + Math.PI / 2, morph);
    }
    c.restore();
    if (f && dt) { f.t += dt; f.lap += dt * (morph > .5 ? 5.5 : 1.5) * morph; if (f.t > 3.9) st.egg = null; }
  }, { bigScale: 2.8, egg(st) { st.egg = { t: 0, lap: 0 }; } });

  // ---- Optic Scan (Animated, Developer's Choice) ----
  const RED = '255, 74, 74', CYAN = '94, 240, 240', YEL = '232, 212, 58', DEEP = '200, 8, 20';
  async function runScan(el, st) {
    const box = document.createElement('div');
    Object.assign(box.style, { position: 'fixed', zIndex: '9600', pointerEvents: 'none', padding: '8px 12px', background: 'rgba(6,8,12,.92)', border: '1px solid rgba(94,240,240,.4)', borderLeft: '3px solid #e8d43a', width: '250px', font: '12px "Share Tech Mono", Consolas, monospace', color: '#5ef0f0', whiteSpace: 'pre', textShadow: '0 0 6px rgba(94,240,240,.6)' });
    const place = () => { const r = el.getBoundingClientRect(); let left = r.right + r.width * .9; if (left + 270 > innerWidth) left = Math.max(8, r.left - r.width * .9 - 270); box.style.left = `${left}px`; box.style.top = `${Math.max(8, r.top - 4)}px`; };
    place(); document.body.appendChild(box); st.scanBox = box;
    let name = 'UNKNOWN'; try { name = ((localStorage.getItem('ttp_summoner_name') || '').split('#')[0] || 'UNKNOWN').toUpperCase(); } catch (e) {}
    const LINES = [['SCANNING', 'b'], [`NAME .......... ${name}`, ''], ['CYBERWARE ..... NONE DETECTED', ''], ['STREET CRED ... OFF THE CHARTS', ''], ['THREAT LEVEL .. ', 'i', 'LEGENDARY']];
    let prev = '';
    await new Promise(r => setTimeout(r, 800));
    for (const [line, cls, extra] of LINES) {
      let txt = '';
      for (const ch of line) { if (!st.egg) return; txt += ch; box.innerHTML = prev + (cls === 'b' ? `<b style="color:#e8d43a;font-weight:normal">${txt}</b>` : txt) + '_'; place(); await new Promise(r => setTimeout(r, 14)); }
      prev += (cls === 'b' ? `<b style="color:#e8d43a;font-weight:normal">${line}</b>` : line) + (extra ? `<i style="color:#ff4a4a;font-style:normal">${extra}</i>` : '') + '\n'; box.innerHTML = prev;
      await new Promise(r => setTimeout(r, 120));
    }
  }
  const optic = canvasBorder((c, R, t, dt, st, el) => {
    const scan = st.egg, lock = scan ? Math.min(1, scan.t / .8) : 0, k = R / 48;
    c.strokeStyle = '#0c0e14'; c.lineWidth = R * .16; c.beginPath(); c.arc(0, 0, R * 1.08, 0, 7); c.stroke();
    c.strokeStyle = `rgba(${YEL}, .9)`; c.lineWidth = Math.max(.6, 1.5 * k); c.beginPath(); c.arc(0, 0, R, 0, 7); c.stroke();
    const step = Math.floor(t * 1.5) * .35 + Math.min(1, (t * 1.5) % 1 * 4) * .35;
    c.save(); c.rotate(step + lock * 2);
    for (let j = 0; j < 12; j++) { const a0 = j / 12 * 6.283 + .04, a1 = a0 + 6.283 / 12 - .14; c.strokeStyle = j % 3 === 0 ? `rgba(${RED}, .8)` : `rgba(${YEL}, .8)`; c.lineWidth = R * .07; c.beginPath(); c.arc(0, 0, R * 1.16, a0, a1); c.stroke(); }
    c.restore();
    c.save(); c.rotate(-t * .25); c.strokeStyle = `rgba(${CYAN}, .55)`; c.lineWidth = Math.max(.5, k);
    for (let j = 0; j < 60; j++) { const a = j / 60 * 6.283, l = j % 5 === 0 ? R * .09 : R * .04; c.beginPath(); c.moveTo(Math.cos(a) * R * 1.27, Math.sin(a) * R * 1.27); c.lineTo(Math.cos(a) * (R * 1.27 + l), Math.sin(a) * (R * 1.27 + l)); c.stroke(); }
    c.restore();
    const pu = (t / 2.6) % 1;
    c.strokeStyle = `rgba(${YEL}, ${(1 - pu) * .7})`; c.lineWidth = R * .05 * (1 - pu) + .5; c.beginPath(); c.arc(0, 0, R * (1.05 + pu * .55), 0, 7); c.stroke();
    const breath = .75 + .25 * Math.sin(t * 2.4);
    const rg = c.createLinearGradient(-R, -R, R, R); rg.addColorStop(0, '#f2e24a'); rg.addColorStop(.5, '#9a8a18'); rg.addColorStop(1, '#e8d43a');
    c.save(); c.shadowColor = `rgba(${YEL}, ${breath})`; c.shadowBlur = R * .3 * breath; c.strokeStyle = rg; c.lineWidth = R * .06; c.beginPath(); c.arc(0, 0, R * 1.04, 0, 7); c.stroke(); c.restore();
    if (R >= 24) {
      if (!st.code) st.code = Array.from({ length: 28 }, () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0'));
      if (dt && Math.random() < .08) st.code[Math.floor(Math.random() * 28)] = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
      c.save(); c.rotate(t * .35); c.font = `${Math.round(R * .13)}px "Share Tech Mono", Consolas, monospace`; c.textAlign = 'center'; c.textBaseline = 'middle';
      st.code.forEach((s, i) => { c.save(); c.rotate(i / 28 * 6.283); c.fillStyle = `rgba(${CYAN}, ${i % 7 === 0 ? .95 : .45})`; c.fillText(s, 0, -R * 1.52); c.restore(); });
      c.restore();
      [[1.66, 1.1, .9, YEL], [1.78, -.7, .6, CYAN], [1.9, .45, 1.3, RED]].forEach(([r2, sp, len, col], j) => {
        c.save(); c.rotate(t * sp + j); c.strokeStyle = `rgba(${col}, .85)`; c.lineWidth = (j === 2 ? 1.2 : 2) * k;
        for (let q = 0; q < 2; q++) { c.beginPath(); c.arc(0, 0, R * r2, q * Math.PI, q * Math.PI + len); c.stroke(); const a = q * Math.PI + len; c.beginPath(); c.moveTo(Math.cos(a) * R * (r2 - .06), Math.sin(a) * R * (r2 - .06)); c.lineTo(Math.cos(a) * R * (r2 + .06), Math.sin(a) * R * (r2 + .06)); c.stroke(); }
        c.restore();
      });
    }
    const img = el.querySelector('img');
    if (dt && !scan && Math.random() < dt * .4) st.gl = .25;
    st.gl = Math.max(0, (st.gl || 0) - dt);
    if (img) { img.style.filter = st.gl > 0 ? `drop-shadow(${3 * k}px 0 rgba(255,74,74,.9)) drop-shadow(${-3 * k}px 0 rgba(94,240,240,.9)) contrast(1.2)` : ''; img.style.transform = st.gl > 0 ? `translateX(${(Math.random() - .5) * 4 * k}px)` : ''; }
    const sa = t * 2.2, sg = c.createRadialGradient(0, 0, R, 0, 0, R * 1.4);
    sg.addColorStop(0, `rgba(${CYAN}, 0)`); sg.addColorStop(.5, `rgba(${CYAN}, .35)`); sg.addColorStop(1, `rgba(${CYAN}, 0)`);
    c.fillStyle = sg; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R * 1.4, sa, sa + .35); c.closePath(); c.fill();
    for (let j = 0; j < 4; j++) { const a = j * 1.57 + .78; if (Math.sin(t * 5 + j * 2) > .3) { c.fillStyle = `rgba(${CYAN}, .9)`; c.fillRect(Math.cos(a) * R * 1.42 - 2 * k, Math.sin(a) * R * 1.42 - 2 * k, 4 * k, 4 * k); } }
    // zur Namensseite (rechts) blenden die aeusseren Elemente weich aus
    if (c.createConicGradient) {
      c.save(); c.beginPath(); c.arc(0, 0, R * 2.3, 0, 7); c.arc(0, 0, R * 1.24, 0, 7, true); c.clip('evenodd');
      c.globalCompositeOperation = 'destination-out';
      const fade = c.createConicGradient(-Math.PI / 2, 0, 0);
      fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(.1, 'rgba(0,0,0,0)'); fade.addColorStop(.2, 'rgba(0,0,0,.92)'); fade.addColorStop(.3, 'rgba(0,0,0,.92)'); fade.addColorStop(.4, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = fade; c.fillRect(-R * 2.4, -R * 2.4, R * 4.8, R * 4.8); c.restore();
    }
    if (scan && dt) {
      scan.t += dt; const s = scan.t, sz = R * (2.4 - 1.3 * lock);
      c.strokeStyle = `rgba(${RED}, ${.9 * Math.min(1, s * 3)})`; c.lineWidth = 2 * k;
      [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([a, b]) => { c.beginPath(); c.moveTo(a * sz, b * sz * .6); c.lineTo(a * sz, b * sz); c.lineTo(a * sz * .6, b * sz); c.stroke(); });
      if (lock >= 1) { c.strokeStyle = `rgba(${YEL}, ${.5 + .5 * Math.sin(s * 12)})`; c.beginPath(); c.moveTo(-R * .25, 0); c.lineTo(R * .25, 0); c.moveTo(0, -R * .25); c.lineTo(0, R * .25); c.stroke(); }
      if (s > 5.5) { st.egg = null; if (st.scanBox) { st.scanBox.remove(); st.scanBox = null; } }
    }
  }, { bigScale: 4.6, egg(st, el) { st.egg = { t: 0 }; runScan(el, st); } });

  // ---- Hextech Prism (Fancy) ----
  const hexPrism = canvasBorder((c, R, t, dt, st) => {
    const hexPath = (x, y, r, rot) => { c.beginPath(); for (let j = 0; j < 6; j++) { const a = rot + j * Math.PI / 3; j ? c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); };
    const brass = (x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#f8e3a4'); g.addColorStop(.35, '#b8862e'); g.addColorStop(.6, '#f0cf7c'); g.addColorStop(1, '#6a4612'); return g; };
    const jag = (ax, ay, bx, by, n, amp) => { const pts = [[ax, ay]]; for (let j = 1; j < n; j++) { const u = j / n; pts.push([ax + (bx - ax) * u + rand(-amp, amp), ay + (by - ay) * u + rand(-amp, amp)]); } pts.push([bx, by]); return pts; };
    const caps = [Math.PI * 1.5 + 2.1, Math.PI * 1.5, Math.PI * 1.5 - 2.1];
    if (st.nextArc === undefined) { st.nextArc = 1; st.holo = 0; st.nextHolo = 3; }
    const pulse = .5 + .5 * Math.sin(t * 2.2);
    const halo = c.createRadialGradient(0, 0, R * .95, 0, 0, R * 1.6); halo.addColorStop(0, `rgba(70,190,255,${.22 + .1 * pulse})`); halo.addColorStop(1, 'rgba(70,190,255,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(0, 0, R * 1.6, 0, 7); c.fill();
    c.save(); c.rotate(t * .12); c.fillStyle = brass(-R, -R, R, R); c.beginPath();
    for (let j = 0; j < 36; j++) { const a0 = j / 36 * Math.PI * 2, a1 = a0 + Math.PI / 36; c.arc(0, 0, R * 1.25, a0, a1); c.arc(0, 0, R * 1.19, a1, a1 + Math.PI / 36); }
    c.closePath(); c.arc(0, 0, R * 1.12, 0, 7, true); c.fill('evenodd'); c.strokeStyle = 'rgba(60,36,8,.55)'; c.lineWidth = .8; c.stroke(); c.restore();
    c.lineWidth = R * .13; c.strokeStyle = brass(-R, R, R, -R); c.beginPath(); c.arc(0, 0, R * 1.07, 0, 7); c.stroke();
    c.lineWidth = R * .05; c.strokeStyle = '#08121c'; c.beginPath(); c.arc(0, 0, R * 1.07, 0, 7); c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let j = 0; j < 3; j++) { const a = t * 1.6 + j * 2.094; for (let s2 = 0; s2 < 14; s2++) { const aa = a - s2 * .045; c.strokeStyle = `rgba(110,220,255,${(1 - s2 / 14) * .8})`; c.lineWidth = R * .035; c.beginPath(); c.arc(0, 0, R * 1.07, aa - .05, aa); c.stroke(); } }
    c.strokeStyle = `rgba(80,190,255,${.25 + .2 * pulse})`; c.lineWidth = R * .02; c.beginPath(); c.arc(0, 0, R * 1.07, 0, 7); c.stroke(); c.restore();
    c.fillStyle = '#f6dc94'; for (let j = 0; j < 12; j++) { const a = j / 12 * 6.28 + .26; c.beginPath(); c.arc(Math.cos(a) * R * 1.01, Math.sin(a) * R * 1.01, R * .022, 0, 7); c.fill(); }
    const capPos = caps.map(a => [Math.cos(a) * R * 1.07, Math.sin(a) * R * 1.07, a]);
    capPos.forEach(([x, y, a], j) => {
      if (j === 1) return;
      c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); c.fillStyle = brass(-R * .1, 0, R * .1, 0);
      c.beginPath(); c.moveTo(-R * .11, R * .02); c.lineTo(-R * .07, -R * .16); c.lineTo(-R * .03, -R * .02); c.lineTo(R * .03, -R * .02); c.lineTo(R * .07, -R * .16); c.lineTo(R * .11, R * .02); c.closePath(); c.fill();
      const cg = c.createLinearGradient(-R * .05, 0, R * .05, 0); cg.addColorStop(0, '#9ee8ff'); cg.addColorStop(.5, '#2a8ad0'); cg.addColorStop(1, '#bff4ff');
      c.fillStyle = cg; c.beginPath(); c.moveTo(0, -R * .2); c.lineTo(R * .05, -R * .08); c.lineTo(R * .035, R * .01); c.lineTo(-R * .035, R * .01); c.lineTo(-R * .05, -R * .08); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(230,250,255,.8)'; c.lineWidth = .7; c.stroke(); c.restore();
    });
    const coreY = -R * 1.12;
    if (dt) { st.nextArc -= dt; if (st.nextArc <= 0) { st.nextArc = rand(1.2, 2.6); const from = capPos[Math.random() < .5 ? 0 : 2]; st.arc = { life: .35, a: [from[0] + Math.cos(from[2]) * R * .12, from[1] + Math.sin(from[2]) * R * .12] }; } }
    if (st.arc) { st.arc.life -= dt; if (st.arc.life <= 0) st.arc = null; else { const pts = jag(st.arc.a[0], st.arc.a[1], 0, coreY, 9, R * .07); c.save(); c.globalCompositeOperation = 'lighter'; c.lineJoin = 'round'; [[R * .06, 'rgba(80,180,255,.35)'], [R * .02, 'rgba(220,245,255,.95)']].forEach(([w, col]) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }); c.restore(); } }
    c.save(); c.translate(0, coreY);
    c.fillStyle = brass(-R * .3, -R * .3, R * .3, R * .3); hexPath(0, 0, R * .27, Math.PI / 6); c.fill(); c.strokeStyle = 'rgba(60,36,8,.6)'; c.lineWidth = 1; c.stroke();
    const core = c.createRadialGradient(-R * .05, -R * .06, 0, 0, 0, R * .2); core.addColorStop(0, '#f0fdff'); core.addColorStop(.35, 'rgba(120,220,255,1)'); core.addColorStop(1, '#0c5a9a');
    c.fillStyle = core; hexPath(0, 0, R * .19, Math.PI / 6); c.fill();
    c.strokeStyle = 'rgba(220,250,255,.55)'; c.lineWidth = .7; for (let j = 0; j < 6; j++) { const a = Math.PI / 6 + j * Math.PI / 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * R * .19, Math.sin(a) * R * .19); c.stroke(); }
    c.globalCompositeOperation = 'lighter';
    const cg2 = c.createRadialGradient(0, 0, 0, 0, 0, R * .5); cg2.addColorStop(0, `rgba(120,220,255,${.35 + .35 * pulse + (st.arc ? .3 : 0)})`); cg2.addColorStop(1, 'rgba(120,220,255,0)'); c.fillStyle = cg2; c.beginPath(); c.arc(0, 0, R * .5, 0, 7); c.fill();
    ['255,80,110', '255,210,80', '90,255,150', '90,170,255', '200,110,255'].forEach((col, ci) => { const a = t * .4 + ci * .12 - Math.PI / 2; c.strokeStyle = `rgba(${col},${.18 + .15 * pulse})`; c.lineWidth = 1.2; c.beginPath(); c.moveTo(Math.cos(a) * R * .2, Math.sin(a) * R * .2); c.lineTo(Math.cos(a) * R * .45, Math.sin(a) * R * .45); c.stroke(); });
    c.restore();
    if (dt) { st.nextHolo -= dt; if (st.nextHolo <= 0) { st.nextHolo = rand(3, 6); st.holo = 1; } }
    if (st.holo > 0 && R >= 24) {
      st.holo = Math.max(0, st.holo - dt * .8);
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(110,220,255,${st.holo * .35 * (Math.random() < .85 ? 1 : .3)})`; c.lineWidth = .7;
      const hr = R * .09; for (let q = -8; q <= 8; q++) for (let r2 = -8; r2 <= 8; r2++) { const x = hr * 1.5 * q, y = hr * Math.sqrt(3) * (r2 + q / 2), d = Math.hypot(x, y); if (d < R * 1.3 || d > R * 1.55) continue; hexPath(x, y, hr * .92, 0); c.stroke(); }
      c.restore();
    }
  });

  // ---- Bubble Ring (Fancy) ----
  const bubble = canvasBorder((c, R, t, dt, st) => {
    const spawn = (a, grow) => ({ a, r: rand(1.08, 1.4), s: rand(.09, .2), g: grow ? 0 : 1, ph: rand(0, 6), v: rand(.08, .16), hue: rand(0, 360), pop: 0 });
    if (!st.bubbles) { st.bubbles = []; for (let j = 0; j < 16; j++) st.bubbles.push(spawn(j / 16 * 6.28 + rand(-.15, .15), false)); st.drops = []; st.nextPop = 1.5; }
    if (c.createConicGradient) { const pr = c.createConicGradient(t * .3, 0, 0); ['#ffd6f0', '#d6f0ff', '#e0ffe8', '#fff3d0', '#ffd6f0'].forEach((col, i) => pr.addColorStop(i / 4, col)); c.strokeStyle = pr; } else c.strokeStyle = '#e8f0ff';
    c.lineWidth = R * .05; c.beginPath(); c.arc(0, 0, R * 1.02, 0, 7); c.stroke();
    if (dt) { st.nextPop -= dt; if (st.nextPop <= 0) { st.nextPop = rand(1.8, 3.5); const live = st.bubbles.filter(b => b.g >= 1 && !b.pop); if (live.length) live[Math.random() * live.length | 0].pop = .001; } }
    for (let i = st.bubbles.length - 1; i >= 0; i--) {
      const b = st.bubbles[i]; b.a += b.v * dt * .3; b.g = Math.min(1, b.g + dt * .6);
      const x = Math.cos(b.a) * R * b.r + Math.sin(t * .9 + b.ph) * R * .03, y = Math.sin(b.a) * R * b.r + Math.cos(t * .7 + b.ph) * R * .03;
      const r2 = R * b.s * (b.g < 1 ? b.g * b.g * (3 - 2 * b.g) : 1);
      if (b.pop) {
        b.pop += dt * 4;
        if (b.pop < .01 + dt * 4) for (let j = 0; j < 8; j++) { const a = j / 8 * 6.28; st.drops.push({ x: x + Math.cos(a) * r2, y: y + Math.sin(a) * r2, vx: Math.cos(a) * rand(20, 45) * R / 60, vy: Math.sin(a) * rand(20, 45) * R / 60, life: 1 }); }
        c.strokeStyle = `rgba(230,240,255,${Math.max(0, 1 - b.pop) * .7})`; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r2 * (1 + b.pop * .6), 0, 7); c.stroke();
        if (b.pop >= 1) st.bubbles[i] = spawn(b.a, true);
        continue;
      }
      const wob = 1 + Math.sin(t * 3 + b.ph) * .04;
      c.save(); c.translate(x, y); c.scale(wob, 2 - wob);
      const body = c.createRadialGradient(0, 0, r2 * .6, 0, 0, r2); body.addColorStop(0, 'rgba(200,225,255,.03)'); body.addColorStop(1, 'rgba(200,225,255,.16)');
      c.fillStyle = body; c.beginPath(); c.arc(0, 0, r2, 0, 7); c.fill();
      if (c.createConicGradient) { const film = c.createConicGradient(t * .8 + b.ph, 0, 0), h = b.hue + t * 40; for (let j = 0; j <= 6; j++) film.addColorStop(j / 6, `hsla(${(h + j * 60) % 360},90%,72%,.75)`); c.strokeStyle = film; } else c.strokeStyle = 'rgba(220,230,255,.7)';
      c.lineWidth = Math.max(1, r2 * .12); c.beginPath(); c.arc(0, 0, r2 * .94, 0, 7); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, r2 * .68, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(r2 * .42, r2 * .42, r2 * .1, 0, 7); c.fill();
      c.restore();
    }
    for (let i = st.drops.length - 1; i >= 0; i--) { const d = st.drops[i]; d.life -= dt * 2.2; if (d.life <= 0) { st.drops.splice(i, 1); continue; } d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 40 * dt; c.fillStyle = `rgba(220,235,255,${d.life * .8})`; c.beginPath(); c.arc(d.x, d.y, 1, 0, 7); c.fill(); }
  });

  // ---- Refined + Basic (stehend) ----
  const staticBorder = fn => canvasBorder((c, R) => fn(c, R), { static: true });
  function pearl(c, x, y, r, tint) {
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x + r * .2, y + r * .35, r * .95, r * .85, 0, 0, 7); c.fill();
    const g = c.createRadialGradient(x - r * .3, y - r * .35, r * .05, x, y, r * 1.05); g.addColorStop(0, '#ffffff'); g.addColorStop(.3, tint[0]); g.addColorStop(.75, tint[1]); g.addColorStop(1, tint[2]);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    const rim = c.createRadialGradient(x + r * .35, y + r * .4, 0, x + r * .35, y + r * .4, r * .7); rim.addColorStop(0, 'rgba(255,235,245,.45)'); rim.addColorStop(1, 'rgba(255,235,245,0)');
    c.fillStyle = rim; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(x - r * .32, y - r * .38, r * .22, r * .13, -.7, 0, 7); c.fill();
  }
  const PEARL_TINT = ['#f8f0f2', '#e2d4dc', '#9c8a98'];
  const BORDERS_STATIC = {
    // Pearl Ring = Variante "Nacre": Perlmutt-Band mit vier eingelassenen Perlen
    'border-shop-pearl': (c, R) => {
      const r0 = R, r1 = R * 1.24;
      c.save(); c.beginPath(); c.arc(0, 0, r1, 0, 7); c.moveTo(r0, 0); c.arc(0, 0, r0, 0, 7, true); c.clip('evenodd');
      if (c.createConicGradient) { const cg = c.createConicGradient(.6, 0, 0); ['#f2ecf6', '#d6e8f2', '#f6e2ec', '#e2f2e8', '#f2ead6', '#dcdcf6', '#f2ecf6'].forEach((col, i, a) => cg.addColorStop(i / (a.length - 1), col)); c.fillStyle = cg; } else c.fillStyle = '#ece6f2';
      c.fillRect(-r1, -r1, r1 * 2, r1 * 2);
      const r = seeded(8);
      for (let j = 0; j < 26; j++) { const rad = r0 + (r1 - r0) * r(); c.strokeStyle = `rgba(${r() < .5 ? '170,150,190' : '150,190,200'},${.15 + r() * .2})`; c.lineWidth = .6; c.beginPath(); c.arc(0, 0, rad, r() * 6, r() * 6 + 1 + r() * 2); c.stroke(); }
      const sh = c.createLinearGradient(-r1, -r1, r1, r1); sh.addColorStop(0, 'rgba(255,255,255,.55)'); sh.addColorStop(.4, 'rgba(255,255,255,0)'); sh.addColorStop(.7, 'rgba(60,40,80,.15)');
      c.fillStyle = sh; c.fillRect(-r1, -r1, r1 * 2, r1 * 2); c.restore();
      [r0, r1].forEach(rad => { const s = c.createLinearGradient(-R, -R, R, R); s.addColorStop(0, '#ffffff'); s.addColorStop(.5, '#8a909c'); s.addColorStop(1, '#e8ecf2'); c.strokeStyle = s; c.lineWidth = Math.max(.8, R * .028); c.beginPath(); c.arc(0, 0, rad, 0, 7); c.stroke(); });
      for (let j = 0; j < 4; j++) { const a = j / 4 * Math.PI * 2 - Math.PI / 2, x = Math.cos(a) * (r0 + r1) / 2, y = Math.sin(a) * (r0 + r1) / 2; c.fillStyle = '#c8ccd4'; c.beginPath(); c.arc(x, y, R * .115, 0, 7); c.fill(); pearl(c, x, y, R * .09, PEARL_TINT); }
    },
    'border-shop-sunburst': (c, R) => {
      const k = R / 46;
      for (let j = 0; j < 32; j++) { const a = j / 32 * Math.PI * 2, long = j % 2 === 0, L = R * (long ? 1.62 : 1.38), wd = long ? .07 : .05;
        const g = c.createLinearGradient(0, 0, Math.cos(a) * L, Math.sin(a) * L); g.addColorStop(.55, '#ffe08a'); g.addColorStop(1, long ? '#c8862a' : '#a86a1e');
        c.fillStyle = g; c.beginPath(); c.moveTo(Math.cos(a - wd) * R, Math.sin(a - wd) * R); c.lineTo(Math.cos(a) * L, Math.sin(a) * L); c.lineTo(Math.cos(a + wd) * R, Math.sin(a + wd) * R); c.fill();
        c.strokeStyle = 'rgba(255,245,210,.6)'; c.lineWidth = .6 * k; c.beginPath(); c.moveTo(Math.cos(a) * R, Math.sin(a) * R); c.lineTo(Math.cos(a) * L, Math.sin(a) * L); c.stroke(); }
      ring(c, R * 1.06, 8 * k, ['#fff2b8', '#d89a2e', '#fff0b0', '#9a6418']);
      ring(c, R * 1.13, Math.max(.5, 1.2 * k), ['#fff6d0', '#c8862a']);
      c.fillStyle = '#fff6d6'; for (let j = 0; j < 16; j++) { const a = j / 16 * Math.PI * 2 + Math.PI / 16; c.beginPath(); c.arc(Math.cos(a) * R * 1.06, Math.sin(a) * R * 1.06, 1.3 * k, 0, 7); c.fill(); }
    },
    'border-shop-bronze': (c, R) => ring(c, R * 1.05, Math.max(1.5, R * .13), ['#e8b878', '#8a5428', '#d8a060', '#6a3a18'])
  };

  TTPCos.register('border', 'border-shop-lantern', lantern);
  TTPCos.register('border', 'border-dev-optic', optic);
  TTPCos.register('border', 'border-shop-hexprism', hexPrism);
  TTPCos.register('border', 'border-shop-bubble', bubble);
  Object.entries(BORDERS_STATIC).forEach(([id, fn]) => TTPCos.register('border', id, staticBorder(fn)));

  // ============================== RAHMEN ==============================
  // ---- Celestial Dragon (Animated) ----
  const dragon = canvasFrame((c, x, y, w, h, t, dt, st, wrap) => {
    const P = x, BW = w, BH = h, dx = c, SEG = 38, GAP = 10;
    if (!st.pm || st.pw !== w || st.ph !== h) { st.pw = w; st.ph = h; st.pm = perim(P, BW, BH, 6, 26); }
    if (st.head === undefined) Object.assign(st, { head: 0, snap: 0, nextSnap: rand(4, 8), glow: 0, shooters: [], nextShoot: rand(2, 5), dust: [], rain: [] });
    const at = st.pm.at, roar = st.egg;
    const L = a => `rgba(${180 + 75 * st.glow | 0},${190 + 30 * st.glow | 0},${255 - 115 * st.glow | 0},${a})`;
    const star = (sx, sy, r, ph, col = '235,230,255') => { const tw = .65 + .35 * Math.sin(ph * 3); const g = dx.createRadialGradient(sx, sy, 0, sx, sy, r * 4); g.addColorStop(0, `rgba(${col},${.6 * tw})`); g.addColorStop(1, `rgba(${col},0)`); dx.fillStyle = g; dx.beginPath(); dx.arc(sx, sy, r * 4, 0, 7); dx.fill(); dx.fillStyle = `rgba(255,255,255,${tw})`; dx.beginPath(); dx.arc(sx, sy, r * .7, 0, 7); dx.fill(); };
    const glint = (gx, gy, ph) => { const v = Math.max(0, Math.sin(ph * 2.1) - .85) / .15; if (v <= 0) return; dx.strokeStyle = `rgba(255,255,255,${v * .9})`; dx.lineWidth = 1; const z = 9 * v; dx.beginPath(); dx.moveTo(gx - z, gy); dx.lineTo(gx + z, gy); dx.moveTo(gx, gy - z); dx.lineTo(gx, gy + z); dx.stroke(); };
    const slow = roar && roar.t < 1.2 ? .15 : 1;
    st.head += 50 * dt * slow;
    const pts = [];
    for (let i = 0; i < SEG; i++) {
      const [px, py, ang] = at(st.head - i * GAP), wave = Math.sin(t * 2.4 - i * .32) * 10 * Math.min(1, .3 + i / 8);
      const nx = -Math.sin(ang), ny = Math.cos(ang), u = i / (SEG - 1), wd = u < .1 ? 9 + u * 30 : u < .72 ? 12 : 12 * (1 - (u - .72) / .28) + 1.5;
      pts.push({ x: px + nx * wave, y: py + ny * wave, nx, ny, ang, w: wd });
    }
    const hp = pts[0], h2 = pts[2], dir = Math.atan2(hp.y - h2.y, hp.x - h2.x);
    if (dt) { st.nextSnap -= dt; if (st.nextSnap <= 0 && !roar) { st.snap = 1; st.nextSnap = rand(5, 9); } st.snap = Math.max(0, st.snap - dt * 2.5); }
    const open = roar ? (roar.t < .35 ? roar.t / .35 : roar.t < 1.2 ? 1 : Math.max(0, 1 - (roar.t - 1.2) / .4)) : Math.sin(st.snap * Math.PI) * .6;
    const headX = hp.x + Math.cos(dir) * 4, headY = hp.y + Math.sin(dir) * 4;
    dx.save(); dx.globalCompositeOperation = 'lighter';
    pts.forEach((p, i) => { if (i % 2) return; const r = p.w * 2.6, u = i / SEG, g = dx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); g.addColorStop(0, `rgba(${90 + u * 70 + st.glow * 120 | 0},${110 - u * 30 + st.glow * 80 | 0},255,${.09 + st.glow * .12})`); g.addColorStop(1, 'rgba(80,60,200,0)'); dx.fillStyle = g; dx.beginPath(); dx.arc(p.x, p.y, r, 0, 7); dx.fill(); });
    dx.restore();
    for (let k = 0; k < 14; k++) { const [px, py] = at(st.head - (SEG - 1 + k) * GAP), a = (1 - k / 14) * .35; dx.fillStyle = L(a); dx.beginPath(); dx.arc(px + rand(-2, 2), py + rand(-2, 2), 1.2 * (1 - k / 14) + .3, 0, 7); dx.fill(); }
    dx.lineWidth = 1;
    for (const side of [1, -1]) { dx.strokeStyle = L(.3); dx.beginPath(); pts.forEach((p, i) => { const qx = p.x + side * p.nx * p.w * .8, qy = p.y + side * p.ny * p.w * .8; i ? dx.lineTo(qx, qy) : dx.moveTo(qx, qy); }); dx.stroke(); }
    dx.strokeStyle = L(.55); dx.beginPath(); pts.forEach((p, i) => i ? dx.lineTo(p.x, p.y) : dx.moveTo(p.x, p.y)); dx.stroke();
    dx.strokeStyle = L(.18); dx.beginPath();
    pts.forEach((p, i) => { if (i % 3) return; const side = (i / 3) % 2 ? 1 : -1, q = pts[Math.min(SEG - 1, i + 3)]; dx.moveTo(p.x + side * p.nx * p.w * .8, p.y + side * p.ny * p.w * .8); dx.lineTo(q.x - side * q.nx * q.w * .8, q.y - side * q.ny * q.w * .8); }); dx.stroke();
    dx.strokeStyle = L(.4);
    pts.forEach((p, i) => { if (i % 4 || i < 3 || i > SEG - 5) return; const fx = Math.cos(p.ang), fy = Math.sin(p.ang), hh = p.w + 6 + Math.sin(t * 3 - i * .4) * 2, tx = p.x - p.nx * hh, ty = p.y - p.ny * hh; dx.beginPath(); dx.moveTo(p.x - p.nx * p.w * .8 - fx * 5, p.y - p.ny * p.w * .8 - fy * 5); dx.lineTo(tx, ty); dx.lineTo(p.x - p.nx * p.w * .8 + fx * 5, p.y - p.ny * p.w * .8 + fy * 5); dx.stroke(); star(tx, ty, 1.2, t + i); });
    [8, 24].forEach((k, li) => { const p = pts[k]; for (const side of [1, -1]) { const step = Math.sin(t * 5 + li * 1.7 + (side > 0 ? 0 : Math.PI)) * 5, fx = Math.cos(p.ang), fy = Math.sin(p.ang);
      const kx = p.x + side * p.nx * (p.w + 8) + fx * step, ky = p.y + side * p.ny * (p.w + 8) + fy * step, ex = kx + side * p.nx * 6 + fx * 6, ey = ky + side * p.ny * 6 + fy * 6;
      dx.strokeStyle = L(.45); dx.beginPath(); dx.moveTo(p.x + side * p.nx * p.w * .8, p.y + side * p.ny * p.w * .8); dx.lineTo(kx, ky); dx.lineTo(ex, ey); dx.stroke(); star(kx, ky, 1.1, t + k);
      for (let q = -1; q <= 1; q++) { const cx2 = ex + fx * 4 + side * p.nx * q * 3, cy2 = ey + fy * 4 + side * p.ny * q * 3; dx.beginPath(); dx.moveTo(ex, ey); dx.lineTo(cx2, cy2); dx.stroke(); star(cx2, cy2, .7, t * 2 + q); } } });
    pts.forEach((p, i) => { if (i % 3 === 0) { const big = (i * 7) % 5 === 0; star(p.x, p.y, big ? 2.3 : 1.5 - i / SEG * .6, t + i, st.glow > .2 ? '255,225,150' : undefined); if (big) glint(p.x, p.y, t * .8 + i); }
      else if (i % 6 === 2) for (const side of [1, -1]) star(p.x + side * p.nx * p.w * .8, p.y + side * p.ny * p.w * .8, .9, t * 1.3 + i + side); });
    const tl = pts[SEG - 1]; if (dt && Math.random() < .6) st.dust.push({ x: tl.x, y: tl.y, vx: rand(-12, 12), vy: rand(-12, 12), life: 1 });
    for (let i = st.dust.length - 1; i >= 0; i--) { const d = st.dust[i]; d.life -= dt * .8; if (d.life <= 0) { st.dust.splice(i, 1); continue; } d.x += d.vx * dt; d.y += d.vy * dt; dx.fillStyle = `rgba(220,210,255,${d.life * .7})`; dx.beginPath(); dx.arc(d.x, d.y, 1.2, 0, 7); dx.fill(); }
    st.glow = roar ? Math.max(0, 1 - roar.t / 2.8) : 0;
    if (dt) { st.nextShoot -= dt; if (st.nextShoot <= 0) { st.nextShoot = rand(4, 9); st.shooters.push({ x: rand(P + 40, P + BW * .7), y: P + rand(10, BH * .5), vx: rand(160, 240), vy: rand(50, 90), life: 1 }); } }
    for (let i = st.shooters.length - 1; i >= 0; i--) { const s = st.shooters[i]; s.life -= dt * 1.6; if (s.life <= 0) { st.shooters.splice(i, 1); continue; } s.x += s.vx * dt; s.y += s.vy * dt; const g = dx.createLinearGradient(s.x, s.y, s.x - s.vx * .25, s.y - s.vy * .25); g.addColorStop(0, `rgba(255,255,255,${s.life * .8})`); g.addColorStop(1, 'rgba(180,190,255,0)'); dx.strokeStyle = g; dx.lineWidth = 1.3; dx.beginPath(); dx.moveTo(s.x, s.y); dx.lineTo(s.x - s.vx * .25, s.y - s.vy * .25); dx.stroke(); }
    // Kopf: Sternbild-Silhouette, Maehne, Hoerner, Barthaare, goldenes Auge
    dx.save(); dx.translate(headX, headY); dx.rotate(dir); dx.scale(1.3, 1.3);
    for (let k = 0; k < 5; k++) { const yy = -8 + k * 4, sw = Math.sin(t * 3.2 + k * .9) * 5, ex = -30 - k % 2 * 6, ey = yy * 1.8 + sw; dx.setLineDash([1.5, 3]); dx.strokeStyle = L(.5); dx.lineWidth = 1; dx.beginPath(); dx.moveTo(-10, yy * .6); dx.quadraticCurveTo(-20, yy + sw * .5, ex, ey); dx.stroke(); dx.setLineDash([]); star(ex, ey, .9, t * 1.5 + k); }
    const S = [[-10, -9], [2, -13], [14, -11], [24, -8], [34, -6 - open * 7], [36, -2 - open * 5], [24, -1], [33, 4 + open * 10], [24, 9 + open * 6], [10, 10], [-4, 11], [-12, 4]];
    const hp2 = new Path2D(); S.forEach(([px, py], i) => i ? hp2.lineTo(px, py) : hp2.moveTo(px, py)); hp2.closePath();
    const hf = dx.createRadialGradient(8, 0, 0, 8, 0, 30); hf.addColorStop(0, `rgba(130,120,255,${.28 + st.glow * .3})`); hf.addColorStop(1, 'rgba(80,60,200,.05)');
    dx.fillStyle = hf; dx.fill(hp2); dx.strokeStyle = L(.75); dx.lineWidth = 1; dx.stroke(hp2);
    dx.beginPath(); dx.moveTo(2, -13); dx.lineTo(12, -6); dx.lineTo(24, -8); dx.moveTo(-12, 4); dx.lineTo(10, 3); dx.lineTo(24, -1); dx.stroke();
    dx.strokeStyle = L(.7); dx.beginPath(); dx.moveTo(-2, -12); dx.quadraticCurveTo(-14, -24, -36, -21); dx.moveTo(6, -13); dx.quadraticCurveTo(-2, -30, -14, -37); dx.stroke();
    [[-14, -21], [-26, -23], [-36, -21], [-1, -26], [-14, -37]].forEach(([px, py], i) => star(px, py, 1.2, t + i * 1.3));
    dx.setLineDash([2, 3]); dx.strokeStyle = L(.55);
    dx.beginPath(); dx.moveTo(33, 3); dx.bezierCurveTo(26, 16, 12 + Math.sin(t * 3) * 6, 22, -4 + Math.sin(t * 2.5) * 6, 30); dx.moveTo(34, -6); dx.bezierCurveTo(28, -18, 14 + Math.cos(t * 3) * 6, -24, -2 + Math.cos(t * 2.5) * 6, -30); dx.stroke(); dx.setLineDash([]);
    star(-4 + Math.sin(t * 2.5) * 6, 30, 1, t * 2); star(-2 + Math.cos(t * 2.5) * 6, -30, 1, t * 2 + 1);
    S.forEach(([px, py], i) => star(px, py, i === 4 || i === 7 ? 1.9 : 1.4, t + i));
    if (open > .1) for (let k = 0; k < 3; k++) star(26 + k * 3, -2 - open * 2 + k, .8, t * 4 + k, '255,240,220');
    star(12, -5, 3, t * 1.7, '255,215,120'); dx.fillStyle = '#1a1000'; dx.beginPath(); dx.ellipse(12.4, -5, .6, 1.8, 0, 0, 7); dx.fill();
    dx.restore();
    st.hit = [headX + Math.cos(dir) * 10, headY + Math.sin(dir) * 10];
    if (roar && dt) {
      roar.t += dt; const r = roar.t;
      if (r < 1.3) { const u = r / 1.3; dx.strokeStyle = `rgba(200,190,255,${1 - u})`; dx.lineWidth = 3 * (1 - u) + .5; dx.beginPath(); dx.arc(headX, headY, 20 + u * 60, 0, 7); dx.stroke(); dx.beginPath(); dx.arc(headX, headY, 10 + u * 40, 0, 7); dx.stroke(); }
      if (r > .3 && r < 2.6 && Math.random() < .7) st.rain.push({ x: rand(P, P + BW), y: P + rand(-10, 20), vx: rand(-15, 15), vy: rand(40, 90), life: 1, s: rand(2, 4.5), ph: rand(0, 6) });
      if (!editing()) wrap.style.translate = r < .9 ? `${rand(-2, 2)}px ${rand(-2, 2)}px` : '';
      if (r > 4.5 && !st.rain.length) { st.egg = null; wrap.style.translate = ''; }
    }
    for (let i = st.rain.length - 1; i >= 0; i--) { const s = st.rain[i]; s.life -= dt * .3; s.x += s.vx * dt; s.y += s.vy * dt; if (s.life <= 0 || s.y > P + BH + 20) { st.rain.splice(i, 1); continue; } const tw = (.6 + .4 * Math.sin(t * 8 + s.ph)) * s.life, z = s.s * tw; dx.fillStyle = `rgba(255,245,220,${tw})`; dx.beginPath(); dx.moveTo(s.x, s.y - z * 2); dx.quadraticCurveTo(s.x, s.y, s.x + z * 2, s.y); dx.quadraticCurveTo(s.x, s.y, s.x, s.y + z * 2); dx.quadraticCurveTo(s.x, s.y, s.x - z * 2, s.y); dx.quadraticCurveTo(s.x, s.y, s.x, s.y - z * 2); dx.fill(); }
  }, { pad: 80, onClick(e, st, wrap, cv) { if (st.egg || !st.hit || editing()) return; const [lx, ly] = local(e, cv); if (Math.hypot(lx - st.hit[0], ly - st.hit[1]) < 34) st.egg = { t: 0 }; } });

  // ---- Kraken (Animated) ----
  function inkVeil() {
    let v = document.getElementById('ttpInkVeil');
    if (!v) { v = document.createElement('div'); v.id = 'ttpInkVeil'; Object.assign(v.style, { position: 'fixed', inset: '0', zIndex: '9700', pointerEvents: 'none', opacity: '0', background: 'radial-gradient(circle at 50% 60%, #07020c 0%, #000 70%)' }); document.body.appendChild(v); }
    return v;
  }
  const kraken = canvasFrame((c, x, y, w, h, t, dt, st, wrap) => {
    const P = x, BW = w, BH = h;
    if (!st.pm || st.pw !== w || st.ph !== h) {
      st.pw = w; st.ph = h; st.pm = perim(P, BW, BH, 3, 16);
      const { len, marks } = st.pm;
      st.tents = [
        { d0: marks.bottomMid + 30, dir: 1, L: len * .37, w: 21, ph: 0 }, { d0: marks.bottomMid - 30, dir: -1, L: len * .39, w: 21, ph: 3.1 },
        { d0: marks.bottomMid + 14, dir: 1, L: len * .15, w: 15, ph: 1.7, peel: 1 }, { d0: marks.bottomMid - 14, dir: -1, L: len * .13, w: 14, ph: 4.4, peel: 1 }
      ].map(T => ({ ...T, L: Math.min(T.L, T.peel ? 220 : 900), barn: Array.from({ length: 16 }, () => ({ s: Math.random() * .85, side: Math.random() * .7 + .1, r: Math.random() * 1.6 + .9 })), scar: Math.random() * .6 + .1 }));
    }
    if (!st.drops) Object.assign(st, { drops: [], ink: [], splash: [], blink: 0, nextBlink: 3 });
    const { at } = st.pm, water = P + BH + 52, head = { x: P + BW / 2, y: water + 4 }, mawY = P + BH + 10, R0 = 36;
    st.hit = [head.x, mawY];
    const egg = st.egg;
    let squeeze = 0;
    if (egg && dt) {
      egg.t += dt; const e = egg.t; squeeze = e < .5 ? e / .5 : e < 1.6 ? 1 : Math.max(0, 1 - (e - 1.6) / .5);
      if (!editing()) { wrap.style.translate = e < 1.6 ? `${rand(-1.5, 1.5) * squeeze}px ${rand(-1.5, 1.5) * squeeze}px` : ''; wrap.style.scale = e < 1.6 ? `${1 - squeeze * .012}` : ''; }
      if (e > .2 && e < 1.5 && Math.random() < .5) for (let k = 0; k < 3; k++) st.splash.push({ x: head.x + rand(-90, 90), y: water, vx: rand(-40, 40), vy: -rand(80, 200), life: 1 });
      if (e > 1.4 && !egg.inked) { egg.inked = true; for (let k = 0; k < 80; k++) { const a = -Math.PI / 2 + rand(-1.6, 1.6), v = rand(120, 420); st.ink.push({ x: head.x, y: head.y - 24, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: rand(10, 30), life: 1 }); } }
      const veil = inkVeil();
      veil.style.opacity = e < 1.45 ? 0 : e < 1.9 ? ease((e - 1.45) / .45) : e < 2.5 ? 1 : 1 - ease((e - 2.5) / 1.3);
      if (e > 4 && !st.ink.length) { st.egg = null; wrap.style.translate = ''; wrap.style.scale = ''; veil.style.opacity = 0; }
    }
    // Tentakel
    st.tents.forEach(T => {
      const N = 130, pts = [];
      for (let i = 0; i <= N; i++) {
        const s2 = i / N, [px, py, a] = at(T.d0 + T.dir * s2 * T.L), nx = Math.sin(a), ny = -Math.cos(a);
        const off = 3 + (T.peel ? s2 * s2 * 46 : 0) + Math.sin(t * 1.2 - s2 * 6 + T.ph) * 11 * s2 + Math.sin(t * 2.1 - s2 * 11 + T.ph) * 3 * s2 - squeeze * 9 * s2;
        pts.push({ x: px + nx * off, y: py + ny * off, a: a + (T.dir < 0 ? Math.PI : 0), s: s2 });
      }
      const last = pts[pts.length - 1], cd = T.dir, ca = last.a, cr = 8 + Math.sin(t * 1.1 + T.ph) * 2 - squeeze * 3;
      const ccx = last.x + Math.cos(ca - cd * Math.PI / 2) * cr, ccy = last.y + Math.sin(ca - cd * Math.PI / 2) * cr;
      for (let k = 1; k <= 14; k++) { const u = k / 14, ang = ca + cd * Math.PI / 2 + cd * u * Math.PI * 1.5, r2 = cr * (1 - u * .6); pts.push({ x: ccx + Math.cos(ang) * r2, y: ccy + Math.sin(ang) * r2, s: 1 + u * .2 }); }
      const W = s2 => T.w * (1 + squeeze * .25) * Math.max(.12, 1 - s2 * .82);
      const Lp = [], Rp = [];
      pts.forEach((p, i) => { const q = pts[Math.min(pts.length - 1, i + 1)], pr = pts[Math.max(0, i - 1)], ang = Math.atan2(q.y - pr.y, q.x - pr.x), nx = -Math.sin(ang), ny = Math.cos(ang), wd = W(p.s); Lp.push([p.x + nx * wd, p.y + ny * wd]); Rp.push([p.x - nx * wd, p.y - ny * wd]); p.n = [nx, ny]; p.w = wd; });
      const body = new Path2D(); Lp.forEach(([px, py], i) => i ? body.lineTo(px, py) : body.moveTo(px, py)); for (let i = Rp.length - 1; i >= 0; i--) body.lineTo(...Rp[i]); body.closePath();
      c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 9; c.shadowOffsetY = 3; c.fillStyle = '#26143a'; c.fill(body); c.restore();
      c.save(); c.clip(body); c.lineCap = 'round';
      [[0, '#3e2260', 1.5], [-.35, '#5e3a86', .9], [-.6, 'rgba(210,170,240,.35)', .25]].forEach(([shift, col, wm]) => { c.strokeStyle = col; for (let i = 1; i < pts.length; i++) { const a2 = pts[i - 1], b2 = pts[i]; c.lineWidth = Math.max(.5, b2.w * wm); c.beginPath(); c.moveTo(a2.x + a2.n[0] * a2.w * shift, a2.y + a2.n[1] * a2.w * shift); c.lineTo(b2.x + b2.n[0] * b2.w * shift, b2.y + b2.n[1] * b2.w * shift); c.stroke(); } });
      c.strokeStyle = '#e2c4d4'; c.lineWidth = 3.5; c.beginPath(); Rp.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke();
      T.barn.forEach(b => { const p = pts[Math.round(b.s * 130)]; if (!p) return; const bx = p.x + p.n[0] * p.w * b.side, by = p.y + p.n[1] * p.w * b.side, br = b.r * (p.w / T.w + .4); c.fillStyle = '#b8b4a0'; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill(); c.fillStyle = '#3a3a30'; c.beginPath(); c.arc(bx, by, br * .4, 0, 7); c.fill(); });
      const sp = pts[Math.round(T.scar * 130)]; c.strokeStyle = 'rgba(200,210,190,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(sp.x + sp.n[0] * sp.w * .8, sp.y + sp.n[1] * sp.w * .8); c.lineTo(sp.x + sp.n[0] * sp.w * .1 + 6, sp.y + sp.n[1] * sp.w * .1 + 2); c.stroke();
      c.restore();
      pts.forEach((p, i) => { if (i % 6 || p.s > 1.05) return; const sx = p.x - p.n[0] * p.w * .6, sy = p.y - p.n[1] * p.w * .6, sr = Math.max(.8, p.w * .3); c.fillStyle = '#f0d6e2'; c.beginPath(); c.arc(sx, sy, sr, 0, 7); c.fill(); c.fillStyle = '#8a5070'; c.beginPath(); c.arc(sx, sy, sr * .45, 0, 7); c.fill(); });
      if (dt && Math.random() < dt * .6) { const p = pts[(Math.random() * pts.length * .8) | 0]; if (p.y < water) st.drops.push({ x: p.x, y: p.y + p.w, vy: 0, life: 1 }); }
    });
    // Mantel mit Augen
    { const g = c.createRadialGradient(head.x, head.y - 30, 10, head.x, head.y, 110); g.addColorStop(0, '#5a3a7a'); g.addColorStop(.6, '#2a1640'); g.addColorStop(1, '#120a1e');
      c.fillStyle = g; c.beginPath(); c.ellipse(head.x, head.y + 6, 104, 50, 0, Math.PI, 0); c.fill();
      [[-64, -12], [70, -8], [-40, -34], [44, -32], [-86, 0], [90, -2]].forEach(([ox, oy]) => { c.fillStyle = '#b8b4a0'; c.beginPath(); c.arc(head.x + ox, head.y + oy, 2.2, 0, 7); c.fill(); c.fillStyle = '#3a3a30'; c.beginPath(); c.arc(head.x + ox, head.y + oy, .9, 0, 7); c.fill(); });
      if (dt) { st.nextBlink -= dt; if (st.nextBlink <= 0) { st.blink = 1; st.nextBlink = rand(3, 6); } st.blink = Math.max(0, st.blink - dt * 6); }
      const rect = wrap.getBoundingClientRect();
      for (const side of [-1, 1]) {
        const ex = head.x + side * 62, ey = head.y - 26, op = (1 - Math.sin(st.blink * Math.PI)) * (1 - .4 * squeeze);
        let lx = mouse[0] - (rect.left - P + ex), ly = mouse[1] - (rect.top - P + ey); const ll = Math.hypot(lx, ly) || 1; lx = lx / ll * Math.min(2.5, ll / 30); ly = ly / ll * Math.min(1.5, ll / 30);
        const gl = c.createRadialGradient(ex, ey, 0, ex, ey, 16); gl.addColorStop(0, `rgba(200,255,120,${.3 + .3 * squeeze})`); gl.addColorStop(1, 'rgba(200,255,120,0)'); c.fillStyle = gl; c.beginPath(); c.arc(ex, ey, 16, 0, 7); c.fill();
        c.save(); c.beginPath(); c.ellipse(ex, ey, 8, 5 * op + .3, side * .25, 0, 7); c.clip(); c.fillStyle = '#d8e830'; c.fillRect(ex - 9, ey - 6, 18, 12); c.fillStyle = '#050805'; c.beginPath(); c.ellipse(ex + lx, ey + ly, 3.5, 1, 0, 0, 7); c.fill(); c.restore();
        c.fillStyle = '#1a0e26'; c.beginPath(); c.moveTo(ex - side * 11, ey - 9); c.quadraticCurveTo(ex, ey - 11, ex + side * 10, ey - 2 - squeeze * 2); c.lineTo(ex + side * 9, ey); c.quadraticCurveTo(ex, ey - 6, ex - side * 10, ey - 5); c.fill();
      } }
    // Wasser
    { const H2 = BH + P * 2, Wc = BW + P * 2, wave = wx => water + Math.sin(wx * .05 + t * 1.6) * 2 + Math.sin(wx * .021 - t * 1.1) * 2.5;
      const g = c.createLinearGradient(0, water, 0, H2); g.addColorStop(0, 'rgba(20,60,70,.92)'); g.addColorStop(1, 'rgba(6,16,26,0)'); c.fillStyle = g;
      for (let wx = 0; wx < Wc; wx += 6) { const edge = Math.min(wx, Wc - wx - 6) / (P * .9); c.globalAlpha = Math.max(0, Math.min(1, edge)); c.beginPath(); c.moveTo(wx, wave(wx)); c.lineTo(wx + 6.5, wave(wx + 6)); c.lineTo(wx + 6.5, H2); c.lineTo(wx, H2); c.closePath(); c.fill(); }
      c.globalAlpha = 1;
      c.strokeStyle = 'rgba(210,235,240,.7)'; c.lineWidth = 1.4; c.beginPath(); for (let wx = P - 30; wx <= P + BW + 30; wx += 6) { const wy = wave(wx); wx === P - 30 ? c.moveTo(wx, wy) : c.lineTo(wx, wy); } c.stroke();
      for (let k = 0; k < 18; k++) { const fx = head.x + Math.sin(k * 2.3 + t * .7) * 70, fy = wave(fx) + Math.sin(k + t * 3) * 1.5; c.fillStyle = `rgba(230,245,250,${.35 + .25 * Math.sin(t * 4 + k)})`; c.beginPath(); c.ellipse(fx, fy, 4 + (k % 3) * 2, 1.2, 0, 0, 7); c.fill(); } }
    // Maul mit Tiefe (Blick leicht von oben, Licht von oben)
    { const hx = head.x, open = (.8 + .08 * Math.sin(t * 1.5)) + squeeze * .35, rIn = R0 * .72 * open, RY = .78;
      const lip = c.createRadialGradient(hx, mawY + 6, rIn, hx, mawY, R0 + 8); lip.addColorStop(0, '#7a2a3a'); lip.addColorStop(.35, '#5a3a6e'); lip.addColorStop(1, '#2a1640');
      c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 12; c.shadowOffsetY = 4; c.fillStyle = lip; c.beginPath(); c.ellipse(hx, mawY, R0 + 7, (R0 + 7) * RY, 0, 0, 7); c.fill(); c.restore();
      c.strokeStyle = 'rgba(16,6,24,.55)'; c.lineWidth = 1.2;
      for (let k = 0; k < 28; k++) { const a2 = k / 28 * 6.283 + Math.sin(t * .5) * .02; c.beginPath(); c.moveTo(hx + Math.cos(a2) * (rIn + 3), mawY + Math.sin(a2) * (rIn + 3) * RY); c.lineTo(hx + Math.cos(a2) * (R0 + 5), mawY + Math.sin(a2) * (R0 + 5) * RY); c.stroke(); }
      c.strokeStyle = 'rgba(210,170,240,.3)'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(hx, mawY, R0 + 5, (R0 + 5) * RY, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      c.save(); c.beginPath(); c.ellipse(hx, mawY, rIn, rIn * RY, 0, 0, 7); c.clip();
      c.fillStyle = '#12020a'; c.fillRect(hx - rIn, mawY - rIn, rIn * 2, rIn * 2);
      const ringAt = k => { const sc = Math.pow(.78, k); return { sc, cy: mawY + k * rIn * .09, rr: rIn * sc }; };
      for (let k = 0; k < 7; k++) { const { cy, rr: r2 } = ringAt(k), shade = 1 - k / 7; const g2 = c.createLinearGradient(0, cy - r2 * RY, 0, cy + r2 * RY); g2.addColorStop(0, `rgb(${170 * shade | 0},${50 * shade | 0},${60 * shade | 0})`); g2.addColorStop(.3, `rgb(${120 * shade | 0},${22 * shade | 0},${40 * shade | 0})`); g2.addColorStop(1, `rgb(${30 * shade | 0},${4 * shade | 0},${10 * shade | 0})`); c.fillStyle = g2; c.beginPath(); c.ellipse(hx, cy, r2, r2 * RY, 0, 0, 7); c.fill(); c.strokeStyle = `rgba(0,0,0,${.35 + k * .06})`; c.lineWidth = 1.4; c.stroke(); }
      for (let k = 2; k >= 0; k--) {
        const { cy, rr: r2 } = ringAt(k * 1.6), n = 16 - k * 3, rot = t * (k % 2 ? -.18 : .14) * (1 + squeeze * 6) + k * .3, Lt = r2 * (.36 - k * .04), wd = 6.283 / n * .42;
        for (let q = 0; q < n; q++) {
          const a2 = rot + q / n * 6.283, ca = Math.cos(a2), sa = Math.sin(a2), lit = .55 + .45 * Math.max(0, -sa);
          const P0 = [hx + Math.cos(a2 - wd) * r2, cy + Math.sin(a2 - wd) * r2 * RY], P1 = [hx + Math.cos(a2 + wd) * r2, cy + Math.sin(a2 + wd) * r2 * RY], tip = [hx + ca * (r2 - Lt), cy + sa * (r2 - Lt) * RY];
          const tg = c.createLinearGradient((P0[0] + P1[0]) / 2, (P0[1] + P1[1]) / 2, tip[0], tip[1]);
          tg.addColorStop(0, `rgb(${150 * lit * (1 - k * .2) | 0},${130 * lit * (1 - k * .2) | 0},${100 * lit * (1 - k * .2) | 0})`); tg.addColorStop(1, `rgb(${255 * lit * (1 - k * .15) | 0},${246 * lit * (1 - k * .15) | 0},${222 * lit * (1 - k * .15) | 0})`);
          c.fillStyle = tg; c.beginPath(); c.moveTo(...P0); c.quadraticCurveTo(hx + Math.cos(a2 - wd * .3) * (r2 - Lt * .6), cy + Math.sin(a2 - wd * .3) * (r2 - Lt * .6) * RY, ...tip); c.quadraticCurveTo(hx + Math.cos(a2 + wd * .3) * (r2 - Lt * .6), cy + Math.sin(a2 + wd * .3) * (r2 - Lt * .6) * RY, ...P1); c.closePath(); c.fill();
          c.strokeStyle = 'rgba(30,10,20,.5)'; c.lineWidth = .6; c.stroke();
        }
      }
      const deep = ringAt(7); c.fillStyle = '#000'; c.beginPath(); c.ellipse(hx, deep.cy, deep.rr, deep.rr * RY, 0, 0, 7); c.fill();
      const sh = c.createLinearGradient(0, mawY + rIn * RY, 0, mawY); sh.addColorStop(0, 'rgba(0,0,0,.7)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sh; c.fillRect(hx - rIn, mawY, rIn * 2, rIn);
      c.restore();
      c.strokeStyle = 'rgba(30,6,20,.85)'; c.lineWidth = 2; c.beginPath(); c.ellipse(hx, mawY, rIn, rIn * RY, 0, 0, 7); c.stroke(); }
    for (let i = st.drops.length - 1; i >= 0; i--) { const d = st.drops[i]; d.vy += 300 * dt; d.y += d.vy * dt; d.life -= dt * .8; if (d.life <= 0 || d.y > water) { st.drops.splice(i, 1); continue; } c.fillStyle = `rgba(170,215,225,${d.life * .7})`; c.beginPath(); c.ellipse(d.x, d.y, 1.3, 2.4, 0, 0, 7); c.fill(); }
    for (let i = st.splash.length - 1; i >= 0; i--) { const d = st.splash[i]; d.vy += 420 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt * .9; if (d.life <= 0 || (d.vy > 0 && d.y > water)) { st.splash.splice(i, 1); continue; } c.fillStyle = `rgba(220,240,245,${d.life})`; c.beginPath(); c.arc(d.x, d.y, 1.8, 0, 7); c.fill(); }
    for (let i = st.ink.length - 1; i >= 0; i--) { const k = st.ink[i]; k.life -= dt * .35; if (k.life <= 0) { st.ink.splice(i, 1); continue; } k.vx *= .94; k.vy *= .94; k.vy += 8 * dt; k.x += k.vx * dt; k.y += k.vy * dt; k.r += dt * 18; const g = c.createRadialGradient(k.x, k.y, 0, k.x, k.y, k.r); g.addColorStop(0, `rgba(6,10,14,${.85 * k.life})`); g.addColorStop(.7, `rgba(12,20,26,${.5 * k.life})`); g.addColorStop(1, 'rgba(12,20,26,0)'); c.fillStyle = g; c.beginPath(); c.arc(k.x, k.y, k.r, 0, 7); c.fill(); }
  }, { pad: 150, onClick(e, st, wrap, cv) { if (st.egg || !st.hit || editing()) return; const [lx, ly] = local(e, cv); if (Math.hypot(lx - st.hit[0], (ly - st.hit[1]) / .8) < 46) st.egg = { t: 0, inked: false }; } });

  // ---- Phoenix (Animated) ----
  const phoenix = canvasFrame((c, x, y, w, h, t, dt, st, wrap) => {
    const P = x, BW = w, BH = h;
    if (!st.pm || st.pw !== w || st.ph !== h) { st.pw = w; st.ph = h; st.pm = perim(P, BW, BH, 3, 16); }
    if (!st.embers) Object.assign(st, { embers: [], ash: [] });
    const { at, len, marks } = st.pm, home = { x: P + BW / 2, y: P - 26 };
    st.hit = [home.x, home.y - 30];
    const flame = (fx, fy, ang, Lf, wf, ph, heat, alpha) => {
      const fl = Math.sin(t * 11 + ph) * .12 + Math.sin(t * 7 + ph * 2) * .08;
      c.save(); c.translate(fx, fy); c.rotate(ang);
      const g = c.createLinearGradient(0, 0, Lf, 0); g.addColorStop(0, `rgba(255,${200 + 55 * heat | 0},${120 + 120 * heat | 0},${alpha})`); g.addColorStop(.45, `rgba(255,${120 + 60 * heat | 0},30,${alpha * .9})`); g.addColorStop(1, 'rgba(220,40,10,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, -wf); c.quadraticCurveTo(Lf * .5, -wf * (1 + fl), Lf * (1 + fl * .3), fl * wf * 2); c.quadraticCurveTo(Lf * .5, wf * (1 - fl), 0, wf); c.closePath(); c.fill();
      c.restore();
    };
    const feather = (fx, fy, ang, Lf, wf, ph, a, tipFire) => {
      const fl = Math.sin(t * 6 + ph) * .06;
      c.save(); c.translate(fx, fy); c.rotate(ang + fl * .3);
      const g = c.createLinearGradient(0, 0, Lf, 0); g.addColorStop(0, `rgba(255,246,210,${a})`); g.addColorStop(.35, `rgba(255,196,70,${a})`); g.addColorStop(.75, `rgba(240,96,24,${a})`); g.addColorStop(1, `rgba(190,30,10,${a * .9})`);
      c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(Lf * .3, -wf, Lf * .75, -wf * .9, Lf, -wf * .15); c.quadraticCurveTo(Lf * 1.02, 0, Lf, wf * .1); c.bezierCurveTo(Lf * .75, wf * .7, Lf * .3, wf * .8, 0, 0); c.fill();
      c.strokeStyle = `rgba(255,240,200,${a * .55})`; c.lineWidth = .8; c.beginPath(); c.moveTo(0, 0); c.lineTo(Lf * .95, -wf * .05); c.stroke();
      if (tipFire) { c.globalCompositeOperation = 'lighter'; const fg = c.createRadialGradient(Lf, 0, 0, Lf, 0, wf * 2.6); fg.addColorStop(0, `rgba(255,180,60,${a * .55})`); fg.addColorStop(1, 'rgba(255,80,10,0)'); c.fillStyle = fg; c.beginPath(); c.arc(Lf, 0, wf * 2.6, 0, 7); c.fill(); }
      c.restore();
    };
    const bird = (s, heat, alpha, pose) => {
      const open = pose.open ?? 1, reveal = pose.reveal ?? 1, lift = pose.lift ?? 0, cry = pose.cry ?? 0, flap = Math.sin(t * 1.8) * .07 * Math.min(1, open);
      c.save(); c.translate(home.x, home.y); c.scale(s, s);
      c.save(); c.globalCompositeOperation = 'lighter'; const au = c.createRadialGradient(0, -20, 4, 0, -20, 120); au.addColorStop(0, `rgba(255,170,60,${.35 * alpha * (.8 + .2 * heat)})`); au.addColorStop(1, 'rgba(255,90,20,0)'); c.fillStyle = au; c.beginPath(); c.arc(0, -20, 120, 0, 7); c.fill(); c.restore();
      for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
        const ang = (side < 0 ? Math.PI : 0) + side * (.03 + k * .05) + Math.sin(t * 1.3 + k + side) * .03, Lf = 130 - k * 28;
        feather(side * 4, 14, ang, Lf, 3.2, k * 2 + side, alpha * .85, false);
        const ex = side * 4 + Math.cos(ang) * Lf, ey = 14 + Math.sin(ang) * Lf;
        c.save(); c.globalCompositeOperation = 'lighter'; const og = c.createRadialGradient(ex, ey, 0, ex, ey, 9); og.addColorStop(0, `rgba(255,250,220,${alpha})`); og.addColorStop(.4, `rgba(255,150,40,${alpha * .8})`); og.addColorStop(1, 'rgba(255,60,10,0)'); c.fillStyle = og; c.beginPath(); c.arc(ex, ey, 9, 0, 7); c.fill(); c.restore();
      }
      for (const side of [-1, 1]) {
        c.save(); c.translate(side * 7, -8); c.rotate(side * (flap + (1 - Math.min(1, open)) * 1.25 - Math.max(0, open - 1) * .55)); c.scale(.35 + .65 * Math.min(1, open), 1);
        const wrist = [side * 70, -46];
        for (let k = 0; k < 10; k++) { const u = k / 9, bx = wrist[0] * u, by = wrist[1] * u - Math.sin(u * Math.PI) * 10, ang = side > 0 ? -1.55 + u * 1.3 : Math.PI + 1.55 - u * 1.3, Lf = 30 + u * 56, rv = Math.max(0, Math.min(1, (reveal - u * .6) / .4)); if (rv > 0) feather(bx, by, ang, Lf * (.5 + .5 * rv), 6 + u * 1.5, k * 1.7 + side, alpha * (.8 + .2 * u) * rv, k > 6); }
        for (let k = 0; k < 8; k++) { const u = k / 7, bx = wrist[0] * u * .95, by = wrist[1] * u * .95 - Math.sin(u * Math.PI) * 10, ang = side > 0 ? -1.4 + u * 1.2 : Math.PI + 1.4 - u * 1.2, rv2 = Math.max(0, Math.min(1, (reveal - .2 - u * .5) / .3)); if (rv2 > 0) feather(bx, by, ang, (20 + u * 16) * rv2, 5, k * 2.3, alpha * rv2, false); }
        c.restore();
      }
      const bg = c.createRadialGradient(-2, -6, 2, 0, 0, 26); bg.addColorStop(0, `rgba(255,252,230,${alpha})`); bg.addColorStop(.45, `rgba(255,200,80,${alpha})`); bg.addColorStop(1, `rgba(230,90,20,${alpha})`);
      c.save(); c.shadowColor = 'rgba(255,150,40,.9)'; c.shadowBlur = 18;
      c.fillStyle = bg; c.beginPath(); c.moveTo(0, -24); c.bezierCurveTo(14, -18, 15, 8, 0, 22); c.bezierCurveTo(-15, 8, -14, -18, 0, -24); c.fill();
      const hx = 10 + lift * 3, hy = -50 + Math.sin(t * 1.4) * 1.2 - lift * 9;
      const ng = c.createLinearGradient(0, -20, hx, hy); ng.addColorStop(0, `rgba(255,200,80,${alpha})`); ng.addColorStop(1, `rgba(255,236,170,${alpha})`);
      c.fillStyle = ng; c.beginPath(); c.moveTo(-6, -18); c.bezierCurveTo(-10, -32, 2, -38, hx - 7, hy + 4); c.lineTo(hx + 5, hy + 6); c.bezierCurveTo(8, -36, 6, -26, 6, -16); c.closePath(); c.fill();
      c.save(); c.translate(hx, hy); c.scale(1.3, 1.3); c.translate(-hx, -hy);
      const hg = c.createLinearGradient(hx - 8, hy - 8, hx + 10, hy + 6); hg.addColorStop(0, `rgba(255,248,215,${alpha})`); hg.addColorStop(.6, `rgba(255,196,80,${alpha})`); hg.addColorStop(1, `rgba(255,120,30,${alpha})`);
      c.fillStyle = hg; c.beginPath(); c.moveTo(hx - 8, hy + 4); c.bezierCurveTo(hx - 10, hy - 6, hx - 2, hy - 11, hx + 5, hy - 9); c.quadraticCurveTo(hx + 10, hy - 7, hx + 11, hy - 3); c.lineTo(hx + 8, hy + 3); c.quadraticCurveTo(hx + 2, hy + 7, hx - 8, hy + 4); c.fill();
      c.restore(); c.restore();
      c.save(); c.globalAlpha = alpha; c.translate(hx, hy); c.scale(1.3, 1.3); c.translate(-hx, -hy);
      const bk = c.createLinearGradient(hx + 9, hy - 5, hx + 19, hy + 3); bk.addColorStop(0, '#ffe58a'); bk.addColorStop(1, '#9a4208');
      c.fillStyle = bk; c.beginPath(); c.moveTo(hx + 9, hy - 5.5); c.quadraticCurveTo(hx + 17, hy - 6, hx + 19, hy + 2.5); c.quadraticCurveTo(hx + 15, hy - 1, hx + 10, hy - .5); c.lineTo(hx + 13, hy + .8); c.lineTo(hx + 8, hy + 1.5); c.closePath(); c.fill();
      if (cry > .02) { c.fillStyle = '#c86a14'; c.beginPath(); c.moveTo(hx + 8, hy + 1); c.lineTo(hx + 17, hy + 3 + cry * 7); c.lineTo(hx + 9, hy + 3 + cry * 2); c.closePath(); c.fill(); c.fillStyle = 'rgba(80,10,0,.9)'; c.beginPath(); c.moveTo(hx + 9, hy - .3); c.lineTo(hx + 16, hy + 1.5 + cry * 4); c.lineTo(hx + 9, hy + 2); c.fill(); }
      c.shadowColor = '#ffffff'; c.shadowBlur = 8; c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(hx + 1.5, hy - 4); c.quadraticCurveTo(hx + 4.5, hy - 6.2, hx + 7.5, hy - 4.6); c.quadraticCurveTo(hx + 4.5, hy - 3, hx + 1.5, hy - 4); c.fill();
      c.shadowBlur = 0; c.strokeStyle = 'rgba(190,70,10,.85)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + .5, hy - 6.8); c.quadraticCurveTo(hx + 5, hy - 7.4, hx + 9, hy - 5.2); c.stroke();
      c.restore();
      c.save(); c.translate(hx, hy); c.scale(1.3, 1.3); c.translate(-hx, -hy);
      for (let k = 0; k < 5; k++) feather(hx - 4, hy - 7, -2.2 - k * .17 + Math.sin(t * 2 + k) * .05, 28 + k * 7, 2.6, k * 3.1, alpha, true);
      c.restore(); c.restore();
    };
    let scale = 1, heat = .4 + .2 * Math.sin(t * 1.7), alpha = 1, trail = 1, nest = 0, ignite = 1, pose = {}, orb = 0, sparks = null, ring2 = -1;
    const back = u => { u = Math.max(0, Math.min(1, u)); const k = 1.7; return 1 + (k + 1) * Math.pow(u - 1, 3) + k * Math.pow(u - 1, 2); };
    const egg = st.egg;
    if (egg) {
      const e = egg.t += dt;
      if (e < .7) { const u = ease(e / .7); pose = { open: 1 + .4 * u, lift: u, cry: u }; heat = .6 + .4 * u; }
      else if (e < 1.3) { const u = ease((e - .7) / .6); pose = { open: 1.4 * (1 - u), lift: 1 - u, cry: 0 }; scale = 1 - .3 * u; heat = 1; orb = u; alpha = 1 - .75 * u; }
      else if (e < 1.6) { const u = (e - 1.3) / .3; alpha = 0; orb = u < .5 ? 1 - u * 1.6 : 0; heat = 1; if (!egg.burst && u >= .5) { egg.burst = true; for (let k = 0; k < 70; k++) { const a = rand(0, 6.283), v = rand(30, 140); st.ash.push({ x: home.x, y: home.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .6 - 20, life: 1, rot: rand(0, 6) }); } } }
      else if (e < 2.6) { alpha = 0; trail = 1 - ease(e - 1.6); nest = ease((e - 1.9) / .5); }
      else if (e < 3.6) { alpha = 0; trail = 0; nest = .55 + .45 * Math.max(0, Math.sin((e - 2.6) * Math.PI * 2 * 1.6)) ** 3; }
      else if (e < 4.6) { alpha = 0; nest = Math.max(0, 1 - (e - 3.6) * 2); ignite = ease(e - 3.6); trail = 1; sparks = ignite; }
      else if (e < 5.0) { alpha = 0; ring2 = (e - 4.6) / .4; orb = ease((e - 4.6) / .4) * .7; }
      else if (e < 6.4) { const u = (e - 5) / 1.4; orb = .7 * (1 - ease(u * 2)); alpha = ease(u * 3); scale = .55 + .45 * back(u * 1.4); pose = { reveal: ease(u * 1.3), open: u < .7 ? 1.45 * ease(u / .7) : 1.45 - .45 * ease((u - .7) / .3), lift: Math.max(0, Math.sin(Math.min(1, (u - .55) / .45) * Math.PI)), cry: Math.max(0, Math.sin(Math.min(1, (u - .6) / .4) * Math.PI)) }; heat = 1; }
      else st.egg = null;
    }
    if (trail > 0) {
      c.save(); c.globalCompositeOperation = 'lighter'; c.shadowColor = 'rgba(255,120,30,.9)'; c.shadowBlur = 14;
      c.strokeStyle = `rgba(255,140,40,${.55 * trail})`; c.lineWidth = 2.2; c.beginPath();
      const fromBottom = d => { const q = Math.abs(((d - marks.bottomMid) % len + len) % len); return Math.min(q, len - q) / (len / 2); };
      let pen = false; for (let i = 0; i <= 240; i++) { const d = i / 240 * len, [px, py] = at(d); if (fromBottom(d) <= ignite) { pen ? c.lineTo(px, py) : c.moveTo(px, py); pen = true; } else pen = false; } c.stroke();
      c.shadowBlur = 0;
      const n = Math.max(150, Math.round(len / 14));
      for (let i = 0; i < n; i++) {
        const d = i / n * len; if (fromBottom(d) > ignite) continue; const [px, py] = at(d), distTop = Math.min(Math.abs(d - marks.topMid), len - Math.abs(d - marks.topMid)) / (len / 2);
        const strength = (1 - distTop * .55) * trail, sway = Math.sin(t * 3 + i * .7) * .25, hh = (8 + 12 * (.5 + .5 * Math.sin(t * 7 + i * 1.9))) * strength;
        flame(px, py + 1, -Math.PI / 2 + sway, hh, 2.6, i * 1.3, .35 * (1 - distTop), .5 * strength);
      }
      c.restore();
    }
    if (dt && trail > .2 && Math.random() < dt * 22) { const [px, py] = at(rand(0, len)); st.embers.push({ x: px, y: py, vx: rand(-6, 6), vy: rand(-30, -12), life: 1 }); }
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = st.embers.length - 1; i >= 0; i--) { const e = st.embers[i]; e.life -= dt * .7; if (e.life <= 0) { st.embers.splice(i, 1); continue; } e.x += (e.vx + Math.sin(t * 3 + i) * 8) * dt; e.y += e.vy * dt; c.fillStyle = `rgba(255,${150 + 80 * e.life | 0},60,${e.life})`; c.beginPath(); c.arc(e.x, e.y, 1.2, 0, 7); c.fill(); }
    c.restore();
    for (let i = st.ash.length - 1; i >= 0; i--) { const a = st.ash[i]; a.life -= dt * .35; a.vy += 20 * dt; a.x += (a.vx + Math.sin(t * 2 + i) * 10) * dt; a.y += a.vy * dt; a.rot += dt * 2; if (a.life <= 0 || a.y > P + BH + 30) { st.ash.splice(i, 1); continue; } c.save(); c.translate(a.x, a.y); c.rotate(a.rot); c.fillStyle = `rgba(150,140,135,${a.life * .8})`; c.fillRect(-2, -1, 4, 2); c.restore(); }
    if (nest > 0) { const nx = P + BW / 2, ny = P + BH + 18, g = c.createRadialGradient(nx, ny, 0, nx, ny, 40); g.addColorStop(0, `rgba(255,150,40,${.8 * nest * (.7 + .3 * Math.sin(t * 8))})`); g.addColorStop(1, 'rgba(255,60,10,0)'); c.fillStyle = g; c.beginPath(); c.arc(nx, ny, 40, 0, 7); c.fill(); c.fillStyle = `rgba(90,80,76,${nest})`; c.beginPath(); c.ellipse(nx, ny + 4, 24, 6, 0, 0, 7); c.fill(); }
    if (sparks !== null) { c.save(); c.globalCompositeOperation = 'lighter'; for (const dir of [1, -1]) { const [px, py] = at(marks.bottomMid + dir * sparks * len / 2), g = c.createRadialGradient(px, py, 0, px, py, 16); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(.3, 'rgba(255,170,60,.8)'); g.addColorStop(1, 'rgba(255,80,10,0)'); c.fillStyle = g; c.beginPath(); c.arc(px, py, 16, 0, 7); c.fill(); } c.restore(); }
    if (orb > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const r = 10 + orb * 22, g = c.createRadialGradient(home.x, home.y - 10, 0, home.x, home.y - 10, r * 2); g.addColorStop(0, `rgba(255,252,230,${orb})`); g.addColorStop(.35, `rgba(255,180,60,${orb * .9})`); g.addColorStop(1, 'rgba(255,70,10,0)'); c.fillStyle = g; c.beginPath(); c.arc(home.x, home.y - 10, r * 2, 0, 7); c.fill(); c.restore(); }
    const ringAt = u => { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,190,80,${1 - u})`; c.lineWidth = 5 * (1 - u) + 1; c.beginPath(); c.arc(home.x, home.y - 10, 16 + u * 190, 0, 7); c.stroke(); c.restore(); };
    if (ring2 >= 0 && ring2 <= 1) ringAt(ring2);
    if (egg && egg.burst && egg.t < 1.9) { const u = (egg.t - 1.45) / .45; if (u > 0 && u < 1) ringAt(u); }
    if (alpha > 0) bird(scale, Math.min(1, heat), alpha, pose);
  }, { pad: 150, onClick(e, st, wrap, cv) { if (st.egg || !st.hit || editing()) return; const [lx, ly] = local(e, cv); if (Math.abs(lx - st.hit[0]) < 60 && Math.abs(ly - st.hit[1]) < 45) st.egg = { t: 0 }; } });

  // ---- Netrunner HUD (Animated, Developer's Choice) ----
  const hexs = () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')).join(' ');
  const netrunner = canvasFrame((c, x, y, w, h, t, dt, st, wrap) => {
    const x0 = x, y0 = y, x1 = x + w, y1 = y + h, BW = w;
    if (!st.stream) Object.assign(st, { stream: Array.from({ length: 14 }, () => ''), nextStream: 0 });
    const over = st.egg, ov = over ? over.t : -1, alarm = ov >= 0 && ov < 2.2, reboot = ov >= 2.2;
    const main = alarm ? DEEP : YEL, acc = alarm ? DEEP : CYAN;
    c.save(); c.translate(alarm ? rand(-4, 4) : 0, 0);
    const cut = 22, bootA = reboot ? Math.min(1, (ov - 2.2) / 1.2) : 1;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - cut, y0); c.lineTo(x1, y0 + cut); c.lineTo(x1, y1); c.lineTo(x0 + cut, y1); c.lineTo(x0, y1 - cut); c.closePath();
    c.lineWidth = 1.5; c.shadowColor = `rgba(${main}, .8)`; c.shadowBlur = alarm ? 18 : 8; c.strokeStyle = `rgba(${main}, ${.85 * (reboot ? (Math.random() < .3 ? .2 : bootA) : 1)})`; c.stroke(); c.shadowBlur = 0;
    c.strokeStyle = `rgba(${acc}, .9)`; c.lineWidth = 3;
    [[x0 - 8, y0 - 8, 1, 1], [x1 + 8, y1 + 8, -1, -1]].forEach(([px, py, sx, sy]) => { c.beginPath(); c.moveTo(px, py + sy * 34); c.lineTo(px, py); c.lineTo(px + sx * 34, py); c.stroke(); });
    c.fillStyle = `rgba(${RED}, .9)`; c.fillRect(x0 + 40, y0 - 4, 70, 2);
    for (let k = 0; k < 2; k++) { const u = (t * .35 + k * .5) % 1, px = x0 + u * (BW - cut), g = c.createLinearGradient(px - 80, 0, px, 0); g.addColorStop(0, `rgba(${acc}, 0)`); g.addColorStop(1, `rgba(${acc}, .9)`); c.fillStyle = g; c.fillRect(px - 80, k ? y1 - 1 : y0 - 1, 80, 2); }
    if (dt) { st.nextStream -= dt; if (st.nextStream <= 0) { st.stream.shift(); st.stream.push(hexs()); st.nextStream = alarm ? .03 : .25; } }
    c.font = '10px "Share Tech Mono", Consolas, monospace'; c.textAlign = 'right';
    st.stream.forEach((s, i) => { c.fillStyle = `rgba(${alarm ? DEEP : CYAN}, ${(i / st.stream.length) * .8 * bootA})`; c.fillText(s, x0 - 12, y0 + 30 + i * 13); });
    c.textAlign = 'left';
    for (let k = 0; k < 6; k++) { const v = alarm ? rand(.7, 1) : .3 + .25 * Math.sin(t * 1.3 + k * 1.1) + .15 * Math.sin(t * 3.7 + k); c.fillStyle = `rgba(${alarm ? DEEP : k > 3 ? RED : CYAN}, ${.7 * bootA})`; c.fillRect(x1 + 14, y0 + 40 + k * 12, Math.max(2, v * 34), 6); }
    c.fillStyle = `rgba(${CYAN}, ${.7 * bootA})`; c.fillText(alarm ? 'NET LOAD 999%' : `NET LOAD ${Math.round(40 + 20 * Math.sin(t))}%`, x1 + 14, y0 + 30);
    const cxp = x1 - 6, cyp = y1 + 18, blink = Math.sin(t * 4) > 0;
    c.fillStyle = '#0c0e14'; c.fillRect(cxp - 22, cyp - 8, 30, 16); c.strokeStyle = `rgba(${YEL}, .8)`; c.lineWidth = 1; c.strokeRect(cxp - 22, cyp - 8, 30, 16);
    for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(${YEL}, .6)`; c.fillRect(cxp - 19 + k * 7, cyp + 8, 2, 4); c.fillRect(cxp - 19 + k * 7, cyp - 12, 2, 4); }
    c.fillStyle = `rgba(${RED}, ${blink ? 1 : .25})`; c.beginPath(); c.arc(cxp, cyp, 3, 0, 7); c.fill();
    st.chip = { x: cxp - 26, y: cyp - 14, w: 38, h: 28 };
    if (over && dt) {
      over.t += dt; const o = over.t;
      if (o < 2.2) {
        for (let k = 0; k < 10; k++) { c.fillStyle = `rgba(${DEEP}, ${rand(.1, .4)})`; c.fillRect(rand(x0, x1 - 100), rand(y0, y1), rand(40, 200), rand(2, 8)); }
        if (Math.sin(o * 14) > -.3) { c.font = 'bold 28px Rajdhani, "Segoe UI", sans-serif'; c.textAlign = 'center'; c.fillStyle = `rgba(${DEEP}, 1)`; c.shadowColor = `rgba(${DEEP}, 1)`; c.shadowBlur = 24; c.fillText('SYSTEM OVERLOAD', (x0 + x1) / 2, y0 - 18); c.shadowBlur = 0; }
        if (!editing()) { wrap.style.filter = `drop-shadow(${rand(-3, 3)}px 0 rgba(200,8,20,.95)) drop-shadow(${rand(-3, 3)}px 0 rgba(94,240,240,.5)) drop-shadow(0 0 18px rgba(200,8,20,.5))`; wrap.style.opacity = Math.random() < .1 ? .4 : 1; }
      } else {
        wrap.style.filter = ''; wrap.style.opacity = '';
        const msg = o < 3 ? 'REBOOTING' + '.'.repeat(1 + Math.floor(o * 4) % 3) : 'SYSTEM ONLINE';
        c.font = '14px "Share Tech Mono", Consolas, monospace'; c.textAlign = 'center'; c.fillStyle = `rgba(${o < 3 ? YEL : CYAN}, ${o > 4 ? Math.max(0, 1 - (o - 4) / .8) : 1})`; c.fillText(msg, (x0 + x1) / 2, y0 - 16);
        if (o > 4.8) st.egg = null;
      }
    }
    c.restore();
  }, { pad: 110, onClick(e, st, wrap, cv) { if (st.egg || !st.chip || editing()) return; const [lx, ly] = local(e, cv), ch = st.chip; if (lx >= ch.x && lx <= ch.x + ch.w && ly >= ch.y && ly <= ch.y + ch.h) st.egg = { t: 0 }; } });

  // ---- Runic Vines (Fancy) ----
  const GLYPHS = [
    [[[0, -1], [0, 1]], [[0, -.5], [.6, -1]], [[0, 0], [.6, -.5]]], [[[0, -1], [0, 1]], [[0, -1], [.6, -.4]], [[.6, -.4], [0, .2]]],
    [[[-.5, -1], [.5, 1]], [[.5, -1], [-.5, 1]]], [[[0, -1], [0, 1]], [[-.6, -.3], [.6, .3]]],
    [[[-.4, -1], [-.4, 1]], [[.4, -1], [.4, 1]], [[-.4, -.2], [.4, .4]]], [[[0, -1], [.6, 0]], [[.6, 0], [0, 1]], [[0, -1], [0, 1]]]
  ];
  const vines = canvasFrame((c, x, y, w, h, t, dt, st) => {
    if (!st.pm || st.pw !== w || st.ph !== h) {
      st.pw = w; st.ph = h; st.pm = perim(x, w, h, 4, 18);
      const len = st.pm.len, nLeaves = Math.round(len / 28);
      st.TW = Math.max(1, Math.round(len * .06 / (Math.PI * 2))) * Math.PI * 2 / len;
      st.leaves = Array.from({ length: nLeaves }, (_, i) => ({ d: i / nLeaves * len + rand(-6, 6), k: i % 2, side: Math.random() < .5 ? -1 : 1, s: rand(4.5, 9.5), ph: rand(0, 6), hue: rand(-12, 14), lobes: Math.random() < .6 ? 5 : 3, tilt: rand(-.4, .4) }));
      st.curls = Array.from({ length: Math.round(len / 140) }, () => ({ d: rand(0, len), k: Math.random() < .5 ? 0 : 1, side: Math.random() < .5 ? -1 : 1, s: rand(5, 8), ph: rand(0, 6) }));
      st.runes = Array.from({ length: 8 }, (_, i) => ({ d: (i / 8 + .06) * len, glow: 0, glyph: (Math.random() * 6) | 0 }));
      st.pulses = []; st.spores = Array.from({ length: Math.round(len / 120) }, () => ({ d: rand(0, len), off: rand(-26, 26), ph: rand(0, 6), v: rand(4, 10) })); st.nextPulse = .5;
    }
    const { at, len } = st.pm;
    const vine = (d, k) => { const [px, py, a] = at(d), off = Math.sin(d * st.TW + k * Math.PI + t * .4) * 6; return [px - Math.sin(a) * off, py + Math.cos(a) * off, a]; };
    const ivy = (s, lobes) => { c.beginPath(); c.moveTo(0, 0);
      if (lobes === 5) { c.bezierCurveTo(-s * .1, -s * .55, s * .25, -s, s * .55, -s * .75); c.bezierCurveTo(s * .7, -s * .95, s * 1.05, -s * .85, s * 1.15, -s * .45); c.bezierCurveTo(s * 1.4, -s * .4, s * 1.85, -s * .2, s * 2.05, 0); c.bezierCurveTo(s * 1.85, s * .2, s * 1.4, s * .4, s * 1.15, s * .45); c.bezierCurveTo(s * 1.05, s * .85, s * .7, s * .95, s * .55, s * .75); c.bezierCurveTo(s * .25, s, -s * .1, s * .55, 0, 0); }
      else { c.bezierCurveTo(s * .1, -s * .8, s * .9, -s * .9, s * 1.2, -s * .4); c.bezierCurveTo(s * 1.5, -s * .3, s * 1.9, -s * .15, s * 2.05, 0); c.bezierCurveTo(s * 1.9, s * .15, s * 1.5, s * .3, s * 1.2, s * .4); c.bezierCurveTo(s * .9, s * .9, s * .1, s * .8, 0, 0); }
      c.closePath(); };
    for (let k = 0; k < 2; k++) {
      const pts = []; for (let d = 0; d <= len; d += 3) pts.push(vine(d, k));
      const thick = d => 2.6 + 1.3 * Math.sin(d * .021 + k * 2) + .6 * Math.sin(d * .07 + k);
      const pass = (ox, oy, wMul, col) => { c.strokeStyle = col; c.lineCap = 'round'; for (let q = 1; q < pts.length; q++) { const [ax, ay] = pts[q - 1], [bx, by] = pts[q]; c.lineWidth = Math.max(.5, thick(q * 3) * wMul); c.beginPath(); c.moveTo(ax + ox, ay + oy); c.lineTo(bx + ox, by + oy); c.stroke(); } };
      pass(1.2, 1.6, 1.1, 'rgba(0,0,0,.45)'); pass(0, 0, 1, '#3a2c1a'); pass(-.4, -.5, .62, '#5e4a2c'); pass(-.8, -1, .22, 'rgba(170,150,100,.55)');
      c.strokeStyle = 'rgba(25,16,8,.7)'; c.lineWidth = .7;
      for (let q = 4; q < pts.length; q += 5) { const [px, py, a] = pts[q], wd = thick(q * 3) * .45; c.beginPath(); c.moveTo(px - Math.sin(a) * wd + Math.cos(a) * 1.2, py + Math.cos(a) * wd + Math.sin(a) * 1.2); c.lineTo(px + Math.sin(a) * wd * .3, py - Math.cos(a) * wd * .3); c.stroke(); }
    }
    st.curls.forEach(cu => { const [px, py, a] = vine(cu.d, cu.k), sway = Math.sin(t * 1.3 + cu.ph) * .2; c.save(); c.translate(px, py); c.rotate(a + cu.side * 1.2 + sway); c.strokeStyle = '#6a8a3a'; c.lineWidth = .9; c.beginPath(); for (let q = 0; q <= 40; q++) { const u = q / 40, r = cu.s * (1 - u * .85), th = u * Math.PI * 3.2, qx = u * cu.s * 1.6 + Math.cos(th) * r * .5, qy = cu.side * Math.sin(th) * r * .5; q ? c.lineTo(qx, qy) : c.moveTo(qx, qy); } c.stroke(); c.restore(); });
    st.leaves.forEach(l => {
      const [px, py, a] = vine(l.d, l.k), ang = a + l.side * (Math.PI / 2.4) + Math.sin(t * 1.4 + l.ph) * .18 + l.tilt;
      c.save(); c.translate(px, py); c.rotate(ang);
      c.strokeStyle = '#4a5a24'; c.lineWidth = .9; c.beginPath(); c.moveTo(0, 0); c.lineTo(l.s * .5, 0); c.stroke(); c.translate(l.s * .45, 0);
      c.save(); c.translate(1.5, 1.8); ivy(l.s, l.lobes); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill(); c.restore();
      ivy(l.s, l.lobes); const lg = c.createLinearGradient(0, -l.s, l.s * 2, l.s); lg.addColorStop(0, `hsl(${100 + l.hue},45%,34%)`); lg.addColorStop(.55, `hsl(${108 + l.hue},50%,26%)`); lg.addColorStop(1, `hsl(${115 + l.hue},55%,17%)`);
      c.fillStyle = lg; c.fill(); c.strokeStyle = 'rgba(20,40,12,.7)'; c.lineWidth = .6; c.stroke();
      c.strokeStyle = 'rgba(200,225,160,.45)'; c.lineWidth = .55; c.beginPath(); c.moveTo(0, 0); c.lineTo(l.s * 1.9, 0);
      if (l.lobes === 5) { c.moveTo(l.s * .2, 0); c.lineTo(l.s * .9, -l.s * .55); c.moveTo(l.s * .2, 0); c.lineTo(l.s * .9, l.s * .55); }
      c.moveTo(l.s * .1, 0); c.lineTo(l.s * .45, -l.s * .5); c.moveTo(l.s * .1, 0); c.lineTo(l.s * .45, l.s * .5); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.ellipse(l.s * .9, -l.s * .25, l.s * .5, l.s * .18, -.3, 0, 7); c.fill();
      c.restore();
    });
    if (dt) { st.nextPulse -= dt; if (st.nextPulse <= 0) { st.nextPulse = rand(.9, 1.8); st.pulses.push({ d: rand(0, len), k: Math.random() < .5 ? 0 : 1, v: rand(60, 95), life: rand(2.5, 4) }); } }
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = st.pulses.length - 1; i >= 0; i--) {
      const p = st.pulses[i]; p.d += p.v * dt; p.life -= dt; if (p.life <= 0) { st.pulses.splice(i, 1); continue; }
      const fade = Math.min(1, p.life);
      for (let k = 0; k < 8; k++) { const [px, py] = vine(p.d - k * 5, p.k); c.fillStyle = `rgba(120,255,200,${(1 - k / 8) * .5 * fade})`; c.beginPath(); c.arc(px, py, 3.2 - k * .3, 0, 7); c.fill(); }
      st.runes.forEach(r => { const dd = ((p.d - r.d) % len + len) % len; if (dd < 6) r.glow = 1; });
    }
    c.restore();
    st.runes.forEach(r => {
      r.glow = Math.max(0, r.glow - dt * .5);
      const [px, py] = at(r.d); c.save(); c.translate(px, py);
      const sg = c.createRadialGradient(-3, -3, 1, 0, 0, 12); sg.addColorStop(0, '#6a7068'); sg.addColorStop(1, '#2a2e2a');
      c.fillStyle = sg; c.beginPath(); c.moveTo(-9, -11); c.lineTo(8, -12); c.lineTo(11, 9); c.lineTo(-10, 11); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1; c.stroke();
      if (r.glow > .02) { const hg = c.createRadialGradient(0, 0, 0, 0, 0, 22); hg.addColorStop(0, `rgba(120,255,200,${.45 * r.glow})`); hg.addColorStop(1, 'rgba(120,255,200,0)'); c.fillStyle = hg; c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fill(); }
      c.strokeStyle = `rgba(${120 + 100 * r.glow | 0},255,${200 + 40 * r.glow | 0},${.25 + .75 * r.glow})`; c.lineWidth = 1.6; c.lineCap = 'round'; c.shadowColor = '#78ffc8'; c.shadowBlur = 8 * r.glow;
      GLYPHS[r.glyph].forEach(([[ax, ay], [bx, by]]) => { c.beginPath(); c.moveTo(ax * 6, ay * 7); c.lineTo(bx * 6, by * 7); c.stroke(); });
      c.shadowBlur = 0; c.restore();
    });
    st.spores.forEach(s => { s.d += s.v * dt; const [px, py, a] = at(s.d), o = s.off + Math.sin(t + s.ph) * 6, qx = px - Math.sin(a) * o, qy = py + Math.cos(a) * o, tw = .4 + .6 * Math.abs(Math.sin(t * 2 + s.ph)); c.fillStyle = `rgba(190,255,170,${tw * .8})`; c.beginPath(); c.arc(qx, qy, 1.3, 0, 7); c.fill(); c.fillStyle = `rgba(190,255,170,${tw * .15})`; c.beginPath(); c.arc(qx, qy, 4, 0, 7); c.fill(); });
  }, { pad: 60 });

  TTPCos.register('frame', 'frame-shop-dragon', dragon);
  TTPCos.register('frame', 'frame-shop-kraken', kraken);
  TTPCos.register('frame', 'frame-shop-phoenix', phoenix);
  TTPCos.register('frame', 'frame-dev-netrunner', netrunner);
  TTPCos.register('frame', 'frame-shop-vines', vines);

  // ---- Refined + Basic Rahmen (stehend) ----
  const rrP = (p, x, y, w, h, r) => { p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); };
  const bandPath = (x0, y0, W, H, b, r0, r1) => { const p = new Path2D(); rrP(p, x0, y0, W, H, r0); rrP(p, x0 + b, y0 + b, W - b * 2, H - b * 2, r1); return p; };
  const bandClip = (c, x0, y0, W2, H2, b, r0, r1) => c.clip(bandPath(x0, y0, W2, H2, b, r0, r1), 'evenodd');
  const sf = fn => canvasFrame((c, x, y, w, h) => fn(c, x, y, w, h), { static: true, pad: 50 });
  const FRAMES_STATIC = {
    'frame-shop-circuit': (c, x, y, w, h) => {
    // gruene Platine als Band, Kupferbahnen mit Loetpunkten, Chips an den Ecken, Goldkontakte unten
    const r = seeded(77), b = 12, x0 = x - 8 - b, y0 = y - 8 - b, W2 = w + 16 + b * 2, H2 = h + 16 + b * 2;
    c.save(); bandClip(c, x0, y0, W2, H2, b, 10, 6);
    const pcb = c.createLinearGradient(x0, y0, x0 + W2, y0 + H2); pcb.addColorStop(0, '#0e5a32'); pcb.addColorStop(1, '#0a3e24'); c.fillStyle = pcb; c.fillRect(x0, y0, W2, H2);
    c.strokeStyle = 'rgba(255, 255, 255, .04)'; c.lineWidth = 1; for (let k = 0; k < W2 + H2; k += 4) { c.beginPath(); c.moveTo(x0 + k, y0); c.lineTo(x0 + k - H2, y0 + H2); c.stroke(); }
    // Bahnen entlang des Bands mit 45-Grad-Knicken
    const trace = (pts) => { c.strokeStyle = '#c88a3a'; c.lineWidth = 1.4; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke();
      [pts[0], pts[pts.length - 1]].forEach(([px, py]) => { c.fillStyle = '#e8b060'; c.beginPath(); c.arc(px, py, 2.2, 0, 7); c.fill(); c.fillStyle = '#0a3e24'; c.beginPath(); c.arc(px, py, .9, 0, 7); c.fill(); }); };
    for (let k = 0; k < 7; k++) { const sx = x0 + 34 + k * (W2 - 68) / 6, l1 = y0 + 3 + (k % 3) * 3; trace([[sx, l1], [sx + 12, l1], [sx + 16, l1 + 4], [sx + 26, l1 + 4]]); trace([[sx + 4, y0 + H2 - 3 - (k % 3) * 3], [sx + 20, y0 + H2 - 3 - (k % 3) * 3], [sx + 24, y0 + H2 - 7]]); }
    for (let k = 0; k < 4; k++) { const sy = y0 + 32 + k * (H2 - 64) / 3; trace([[x0 + 4, sy], [x0 + 4, sy + 10], [x0 + 8, sy + 14], [x0 + 8, sy + 20]]); trace([[x0 + W2 - 4, sy + 4], [x0 + W2 - 4, sy + 18], [x0 + W2 - 8, sy + 22]]); }
    c.restore();
    // Chips an den Ecken
    [[x0 + 3, y0 + 3], [x0 + W2 - 27, y0 + 3], [x0 + W2 - 27, y0 + H2 - 27], [x0 + 3, y0 + H2 - 27]].forEach(([cx2, cy2]) => {
      c.fillStyle = '#c8ccd2'; for (let k = 0; k < 4; k++) { c.fillRect(cx2 + 5 + k * 4, cy2 - 1, 2, 3); c.fillRect(cx2 + 5 + k * 4, cy2 + 22, 2, 3); c.fillRect(cx2 - 1, cy2 + 5 + k * 4, 3, 2); c.fillRect(cx2 + 22, cy2 + 5 + k * 4, 3, 2); }
      const g = c.createLinearGradient(cx2, cy2, cx2 + 24, cy2 + 24); g.addColorStop(0, '#2a2a30'); g.addColorStop(1, '#121216'); c.fillStyle = g; rr(c, cx2 + 1, cy2 + 1, 22, 22, 2); c.fill();
      c.fillStyle = 'rgba(255, 255, 255, .25)'; c.beginPath(); c.arc(cx2 + 6, cy2 + 6, 1.5, 0, 7); c.fill();
      c.fillStyle = 'rgba(255, 255, 255, .35)'; c.font = '5px monospace'; c.fillText('TTP', cx2 + 6, cy2 + 15); });
    // Goldkontakte unten mittig
    for (let k = 0; k < 9; k++) { const g = c.createLinearGradient(0, y0 + H2 - 9, 0, y0 + H2); g.addColorStop(0, '#f6d27a'); g.addColorStop(1, '#a8762a'); c.fillStyle = g; c.fillRect(x0 + W2 / 2 - 40 + k * 9, y0 + H2 - 10, 6, 9); }
    // gruene LED oben
    const lx = x0 + W2 / 2, ly = y0 + 6; const lg = c.createRadialGradient(lx, ly, 0, lx, ly, 10); lg.addColorStop(0, 'rgba(120, 255, 140, .8)'); lg.addColorStop(1, 'rgba(120, 255, 140, 0)'); c.fillStyle = lg; c.beginPath(); c.arc(lx, ly, 10, 0, 7); c.fill();
    c.fillStyle = '#d8ffe0'; c.fillRect(lx - 3, ly - 2, 6, 4);
  },
    'frame-shop-linen': (c, x, y, w, h) => {
  // gewebte Leinenkante: Band mit feinem Kreuzmuster
  const b = 8, x0 = x - 4 - b, y0 = y - 4 - b, W2 = w + 8 + b * 2, H2 = h + 8 + b * 2;
  c.save(); bandClip(c, x0, y0, W2, H2, b, 10, 6);
  c.fillStyle = '#d8ccb4'; c.fillRect(x0, y0, W2, H2);
  c.strokeStyle = 'rgba(120, 100, 70, .25)'; c.lineWidth = 1;
  for (let k = 0; k < W2; k += 2) { c.beginPath(); c.moveTo(x0 + k, y0); c.lineTo(x0 + k, y0 + H2); c.stroke(); }
  c.strokeStyle = 'rgba(255, 255, 255, .25)'; for (let k = 0; k < H2; k += 2) { c.beginPath(); c.moveTo(x0, y0 + k); c.lineTo(x0 + W2, y0 + k); c.stroke(); }
  c.restore();
  c.strokeStyle = 'rgba(140, 120, 90, .7)'; c.lineWidth = 1; c.setLineDash([3, 2]); rr(c, x0 + 3, y0 + 3, W2 - 6, H2 - 6, 8); c.stroke(); c.setLineDash([]);
},
    'frame-shop-night': (c, x, y, w, h) => {
  c.strokeStyle = '#1e2a4a'; c.lineWidth = 6; rr(c, x - 3, y - 3, w + 6, h + 6, 13); c.stroke();
  c.strokeStyle = 'rgba(140, 160, 220, .35)'; c.lineWidth = 1; rr(c, x - 7, y - 7, w + 14, h + 14, 16); c.stroke();
  const r = seeded(13); c.fillStyle = '#e8ecff';
  for (let k = 0; k < 9; k++) { const u = r(), side = (r() * 4) | 0; const [sx, sy] = side === 0 ? [x + u * w, y - 3] : side === 1 ? [x + w + 3, y + u * h] : side === 2 ? [x + u * w, y + h + 3] : [x - 3, y + u * h]; c.beginPath(); c.arc(sx, sy, .7 + r() * .8, 0, 7); c.fill(); }
},
    'frame-shop-kintsugi': (c, x, y, w, h) => {
  const b = 16, x0 = x - 6 - b, y0 = y - 6 - b, W2 = w + 12 + b * 2, H2 = h + 12 + b * 2, band = bandPath(x0, y0, W2, H2, b, 12, 6), r = seeded(41);
  c.save(); c.shadowColor = 'rgba(0, 0, 0, .5)'; c.shadowBlur = 10; c.shadowOffsetY = 3; c.fillStyle = '#1a1a1e'; c.fill(band, 'evenodd'); c.restore();
  c.save(); c.clip(band, 'evenodd');
  // Glasur: tiefes Schwarzblau mit Glanz und feinen Sprenkeln
  const g = c.createLinearGradient(x0, y0, x0 + W2, y0 + H2); g.addColorStop(0, '#2a2e3a'); g.addColorStop(.5, '#14161c'); g.addColorStop(1, '#232632'); c.fillStyle = g; c.fillRect(x0, y0, W2, H2);
  for (let k = 0; k < 220; k++) { c.fillStyle = `rgba(${r() < .5 ? '160, 170, 190' : '90, 100, 120'}, ${r() * .25})`; c.fillRect(x0 + r() * W2, y0 + r() * H2, 1, 1); }
  const sh = c.createLinearGradient(0, y0, 0, y0 + b); sh.addColorStop(0, 'rgba(255, 255, 255, .22)'); sh.addColorStop(1, 'rgba(255, 255, 255, 0)'); c.fillStyle = sh; c.fillRect(x0, y0, W2, b);
  // Goldrisse: verzweigte Zickzack-Linien quer durchs Band, mit Glanz
  const crack = (sx, sy, dx, dy, len, depth) => { let px = sx, py = sy; const pts = [[px, py]];
    for (let k = 0; k < len; k++) { px += dx * 5 + (r() - .5) * 6; py += dy * 5 + (r() - .5) * 6; pts.push([px, py]); if (depth < 2 && r() < .18) crack(px, py, dx + (r() - .5), dy + (r() - .5), len / 2 | 0, depth + 1); }
    [[3.2 - depth, '#7a5418'], [2 - depth * .5, '#e8b64a'], [.7, '#fff2c0']].forEach(([lw, col]) => { c.strokeStyle = col; c.lineWidth = Math.max(.5, lw); c.lineJoin = 'round'; c.beginPath(); pts.forEach(([qx, qy], i) => i ? c.lineTo(qx, qy) : c.moveTo(qx, qy)); c.stroke(); }); };
  // Risse laufen ueberwiegend entlang des Bands (sonst sieht man nur kurze Stummel)
  crack(x0 + W2 * .08, y0 + 4, 1, .25, 22, 0); crack(x0 + W2 * .55, y0 + b - 3, 1, -.2, 18, 0);
  crack(x0 + W2 * .95, y0 + H2 - 5, -1, -.2, 24, 0); crack(x0 + W2 * .4, y0 + H2 - b + 3, -1, .25, 16, 0);
  crack(x0 + 4, y0 + H2 * .15, .2, 1, 18, 0); crack(x0 + W2 - 4, y0 + H2 * .25, -.25, 1, 20, 0);
  c.restore();
  c.strokeStyle = 'rgba(255, 255, 255, .12)'; c.lineWidth = 1; c.stroke(band);
},
    'frame-shop-origami': (c, x, y, w, h) => {
  const b = 15, x0 = x - 6 - b, y0 = y - 6 - b, W2 = w + 12 + b * 2, H2 = h + 12 + b * 2, r = seeded(7);
  const cols = [['#f4ede2', '#d8cdbc'], ['#e85a4a', '#b83a2e'], ['#f4ede2', '#d8cdbc'], ['#2a4a6a', '#1a3048']];
  // Papierstreifen entlang der Seiten, abwechselnd gefaltet (Licht- und Schattenseite der Falte)
  const strip = (ax, ay, bx, by, nx, ny, n) => { for (let k = 0; k < n; k++) { const u0 = k / n, u1 = (k + 1) / n, um = (u0 + u1) / 2, P = u => [ax + (bx - ax) * u, ay + (by - ay) * u];
    const [a0x, a0y] = P(u0), [a1x, a1y] = P(u1), [mx, my] = P(um), col = cols[k % 4];
    c.fillStyle = col[0]; c.beginPath(); c.moveTo(a0x, a0y); c.lineTo(mx, my); c.lineTo(mx + nx * b, my + ny * b); c.lineTo(a0x + nx * b, a0y + ny * b); c.fill();
    c.fillStyle = col[1]; c.beginPath(); c.moveTo(mx, my); c.lineTo(a1x, a1y); c.lineTo(a1x + nx * b, a1y + ny * b); c.lineTo(mx + nx * b, my + ny * b); c.fill();
    c.strokeStyle = 'rgba(0, 0, 0, .18)'; c.lineWidth = .8; c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + nx * b, my + ny * b); c.stroke(); } };
  c.save(); c.shadowColor = 'rgba(0, 0, 0, .45)'; c.shadowBlur = 8; c.shadowOffsetY = 3; c.fillStyle = '#d8cdbc'; c.fill(bandPath(x0, y0, W2, H2, b, 4, 2), 'evenodd'); c.restore();
  strip(x0, y0, x0 + W2, y0, 0, 1, 16); strip(x0, y0 + H2 - b, x0 + W2, y0 + H2 - b, 0, 1, 16);
  strip(x0, y0 + b, x0, y0 + H2 - b, 1, 0, 8); strip(x0 + W2 - b, y0 + b, x0 + W2 - b, y0 + H2 - b, 1, 0, 8);
  // Papierstruktur
  for (let k = 0; k < 300; k++) { const u = r(), s = (r() * 4) | 0, [px, py] = s === 0 ? [x0 + u * W2, y0 + r() * b] : s === 1 ? [x0 + u * W2, y0 + H2 - r() * b] : s === 2 ? [x0 + r() * b, y0 + u * H2] : [x0 + W2 - r() * b, y0 + u * H2]; c.fillStyle = `rgba(0, 0, 0, ${r() * .06})`; c.fillRect(px, py, 1, 1); }
  // Kranich oben rechts
  const kx = x0 + W2 - 34, ky = y0 + 19;
  const tri = (pts, col) => { c.fillStyle = col; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(kx + px, ky + py) : c.moveTo(kx + px, ky + py)); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = .6; c.stroke(); };
  c.save(); c.shadowColor = 'rgba(0, 0, 0, .4)'; c.shadowBlur = 6; c.shadowOffsetY = 2;
  // klassischer Kranich in Seitenansicht: hinterer Fluegel, Koerper-Raute, Hals mit geknicktem Kopf, Schwanz, vorderer Fluegel
  tri([[-2, 1], [4, 1], [-8, -24]], '#a82e24');
  tri([[-12, 4], [0, -2], [0, 10]], '#c8382c'); tri([[0, -2], [12, 4], [0, 10]], '#e04c3e');
  tri([[-8, 4], [-4, 0], [-22, -20]], '#d8443a'); tri([[-22, -20], [-29, -15], [-20.5, -16.5]], '#b83a2e');
  tri([[5, 1], [10, 4], [25, -15]], '#d8443a');
  tri([[-3, 0], [6, 0], [9, -28]], '#f06a58');
  c.restore();
},
    'frame-shop-carved': (c, x, y, w, h) => {
  const b = 18, x0 = x - 6 - b, y0 = y - 6 - b, W2 = w + 12 + b * 2, H2 = h + 12 + b * 2, band = bandPath(x0, y0, W2, H2, b, 10, 6), r = seeded(12);
  c.save(); c.shadowColor = 'rgba(0, 0, 0, .55)'; c.shadowBlur = 10; c.shadowOffsetY = 3; c.fillStyle = '#4a2c18'; c.fill(band, 'evenodd'); c.restore();
  c.save(); c.clip(band, 'evenodd');
  // Nussbaum-Maserung
  const g = c.createLinearGradient(x0, 0, x0 + W2, 0); g.addColorStop(0, '#5a3820'); g.addColorStop(.5, '#6e4628'); g.addColorStop(1, '#4e301a'); c.fillStyle = g; c.fillRect(x0, y0, W2, H2);
  for (let k = 0; k < 70; k++) { const yy = y0 + r() * H2, horiz = r() < .5; c.strokeStyle = `rgba(${r() < .5 ? '30, 16, 8' : '140, 96, 58'}, ${.15 + r() * .2})`; c.lineWidth = .6 + r(); c.beginPath();
    if (horiz) { c.moveTo(x0, yy); for (let xx = x0; xx <= x0 + W2; xx += 20) c.lineTo(xx, yy + Math.sin(xx * .03 + k) * 2); } else { const xx0 = x0 + r() * W2; c.moveTo(xx0, y0); for (let yy2 = y0; yy2 <= y0 + H2; yy2 += 20) c.lineTo(xx0 + Math.sin(yy2 * .03 + k) * 2, yy2); }
    c.stroke(); }
  // geschnitzte Ranke: Kerbe = dunkle Linie + helle Kante darunter (Licht von oben links)
  const carve = (pts, w0) => { [[1, 1, '#f0c890', .5], [0, 0, '#2a160a', 1]].forEach(([ox, oy, col, a]) => { c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = w0; c.lineCap = 'round'; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px + ox, py + oy) : c.moveTo(px + ox, py + oy)); c.stroke(); }); c.globalAlpha = 1; };
  const vine = (ax, ay, bx, by, nx, ny) => { const pts = []; for (let k = 0; k <= 60; k++) { const u = k / 60; pts.push([ax + (bx - ax) * u + nx * Math.sin(u * 18) * 4, ay + (by - ay) * u + ny * Math.sin(u * 18) * 4]); } carve(pts, 1.6);
    for (let k = 1; k < 18; k++) { const u = k / 18, px = ax + (bx - ax) * u, py = ay + (by - ay) * u, s = k % 2 ? 1 : -1, lx = px + nx * s * 6, ly = py + ny * s * 6;
      carve([[px, py], [lx + (bx - ax) / 60, ly + (by - ay) / 60]], 1.1);
      c.fillStyle = '#2a160a'; c.beginPath(); c.ellipse(lx, ly, 3.2, 1.8, Math.atan2(by - ay, bx - ax), 0, 7); c.fill(); c.fillStyle = 'rgba(240, 200, 144, .4)'; c.beginPath(); c.ellipse(lx + .8, ly + .8, 2.4, 1, Math.atan2(by - ay, bx - ax), 0, 7); c.fill(); } };
  vine(x0 + 26, y0 + b / 2, x0 + W2 - 26, y0 + b / 2, 0, 1); vine(x0 + 26, y0 + H2 - b / 2, x0 + W2 - 26, y0 + H2 - b / 2, 0, 1);
  vine(x0 + b / 2, y0 + 26, x0 + b / 2, y0 + H2 - 26, 1, 0); vine(x0 + W2 - b / 2, y0 + 26, x0 + W2 - b / 2, y0 + H2 - 26, 1, 0);
  // Eckrosetten
  [[x0 + b / 2 + 2, y0 + b / 2 + 2], [x0 + W2 - b / 2 - 2, y0 + b / 2 + 2], [x0 + W2 - b / 2 - 2, y0 + H2 - b / 2 - 2], [x0 + b / 2 + 2, y0 + H2 - b / 2 - 2]].forEach(([cx, cy]) => {
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; c.fillStyle = '#2a160a'; c.beginPath(); c.ellipse(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, 4, 1.8, a, 0, 7); c.fill(); }
    c.fillStyle = '#8a5a34'; c.beginPath(); c.arc(cx, cy, 2.6, 0, 7); c.fill(); });
  // Bevel: helle Oberkante, dunkle Unterkante
  const top = c.createLinearGradient(0, y0, 0, y0 + 4); top.addColorStop(0, 'rgba(255, 220, 170, .35)'); top.addColorStop(1, 'rgba(255, 220, 170, 0)'); c.fillStyle = top; c.fillRect(x0, y0, W2, 4);
  c.restore();
  c.strokeStyle = '#2a160a'; c.lineWidth = 1.2; c.stroke(band);
},
    'frame-shop-mosaic': (c, x, y, w, h) => {
  const b = 16, x0 = x - 6 - b, y0 = y - 6 - b, W2 = w + 12 + b * 2, H2 = h + 12 + b * 2, band = bandPath(x0, y0, W2, H2, b, 8, 4), r = seeded(64);
  c.save(); c.shadowColor = 'rgba(0, 0, 0, .5)'; c.shadowBlur = 8; c.shadowOffsetY = 3; c.fillStyle = '#c8c0b0'; c.fill(band, 'evenodd'); c.restore();
  c.save(); c.clip(band, 'evenodd');
  c.fillStyle = '#b8b0a0'; c.fillRect(x0, y0, W2, H2);   // Fugenmoertel
  const S = 5.2;
  for (let yy = y0; yy < y0 + H2; yy += S) for (let xx = x0; xx < x0 + W2; xx += S) {
    const cx = xx + S / 2, cy = yy + S / 2;
    // Wellenmuster: Abstand zum Rand bestimmt die Farbe, Welle laeuft entlang
    const dIn = Math.min(cx - x0, x0 + W2 - cx, cy - y0, y0 + H2 - cy);
    const along = (cy - y0 < b || y0 + H2 - cy < b) ? cx : cy;
    const wave = dIn + Math.sin(along * .09) * 3.5;
    const col = wave < 4 ? [16, 48, 88] : wave < 8 ? [40, 110, 160] : wave < 11 ? [120, 190, 210] : [236, 228, 206];
    const v = (r() - .5) * 28;
    c.fillStyle = `rgb(${col[0] + v | 0}, ${col[1] + v | 0}, ${col[2] + v | 0})`;
    const j = .5 + r() * .5;
    c.beginPath(); c.moveTo(xx + j, yy + r() * .8); c.lineTo(xx + S - .6 - r() * .4, yy + r() * .8); c.lineTo(xx + S - .6, yy + S - .6 - r() * .5); c.lineTo(xx + r() * .8, yy + S - .6); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255, 255, 255, .18)'; c.fillRect(xx + 1, yy + 1, 1.5, 1);
  }
  c.restore();
  c.strokeStyle = '#8a8070'; c.lineWidth = 1.2; c.stroke(band);
},
  };
  Object.entries(FRAMES_STATIC).forEach(([id, fn]) => TTPCos.register('frame', id, sf(fn)));
})();
