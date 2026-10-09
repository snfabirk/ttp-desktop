// Animierte Pass-Themes (v5.10.0) - z.B. "Haunted Night" (Oktober-Pass,
// Stufe 30): schwebende Geister, ab und zu eine Fledermaus, Nebel am Boden.
// Gezeichnet auf einer Canvas-Flaeche HINTER dem Inhalt (z-index -1, siehe
// .theme-fx-canvas in style.css), kein Video.
//
// Einstellung (Settings, localStorage 'ttp_theme_anim'):
//   'off'    - nie
//   'active' - nur bei Benutzung: solange die Maus im Fenster ist bzw. bis
//              5 Sekunden nach der letzten Bewegung/Eingabe (Standard)
//   'always' - immer (solange das Fenster sichtbar ist)
// Ein- und Ausblenden passiert immer weich, nie abrupt (Nutzerwunsch).
// Im Tray/minimiert (document.hidden) laeuft nichts.
(function () {
  const ANIM_KEY = 'ttp_theme_anim';
  const IDLE_MS = 5000;
  const FADE_PER_SEC = 1.1;       // ~1s fuer komplettes Ein-/Ausblenden
  const FRAME_MS = 1000 / 30;     // auf 30 Bilder/s begrenzt
  const SCENES = { haunted: hauntedScene };

  let canvas = null;
  let ctx = null;
  let scene = null;
  let sceneKey = null;
  let level = 0;                  // aktuelle Sichtbarkeit 0..1
  let rafId = null;
  let lastFrame = 0;
  let lastInteraction = Date.now();
  let pointerInside = true;

  // Bewusst NICHT an Windows' "Animationen reduzieren" gekoppelt: dafuer gibt
  // es die eigene Einstellung (Aus / Nur bei Benutzung / Immer) - beim Nutzer
  // war die Windows-Option aus und die Animation dadurch nie zu sehen.
  const mode = () => {
    try { return localStorage.getItem(ANIM_KEY) || 'active'; } catch (e) { return 'active'; }
  };
  const currentTheme = () => document.documentElement.getAttribute('data-theme') || '';

  function targetLevel() {
    if (!scene || document.hidden) return 0;
    const m = mode();
    if (m === 'off') return 0;
    if (m === 'always') return 1;
    return (pointerInside || Date.now() - lastInteraction < IDLE_MS) ? 1 : 0;
  }

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.className = 'theme-fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (scene && scene.resize) scene.resize(innerWidth, innerHeight);
  }

  function syncTheme() {
    const key = currentTheme();
    if (key === sceneKey) return;
    sceneKey = key;
    scene = SCENES[key] ? SCENES[key]() : null;
    if (scene) {
      ensureCanvas();
      scene.resize(innerWidth, innerHeight);
    }
    wake();
  }

  function wake() {
    if (!rafId) { lastFrame = 0; rafId = requestAnimationFrame(frame); }
  }

  function frame(now) {
    rafId = null;
    const target = targetLevel();
    if (!scene || (level === 0 && target === 0)) {
      if (canvas) ctx.clearRect(0, 0, innerWidth, innerHeight);
      return; // schlafen bis zur naechsten Aktivitaet / Themeaenderung
    }
    if (now - lastFrame >= FRAME_MS) {
      const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : FRAME_MS / 1000;
      lastFrame = now;
      const step = FADE_PER_SEC * dt;
      level = target > level ? Math.min(target, level + step) : Math.max(target, level - step);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalAlpha = level;
      scene.update(dt, innerWidth, innerHeight);
      scene.draw(ctx, innerWidth, innerHeight);
      ctx.globalAlpha = 1;
    }
    rafId = requestAnimationFrame(frame);
  }

  // ----- Aktivitaet -----
  const touch = () => { lastInteraction = Date.now(); pointerInside = true; wake(); };
  ['mousemove', 'mousedown', 'keydown', 'wheel'].forEach(ev => window.addEventListener(ev, touch, { passive: true }));
  document.addEventListener('mouseleave', () => { pointerInside = false; lastInteraction = Date.now(); });
  document.addEventListener('mouseenter', touch);
  window.addEventListener('blur', () => { pointerInside = false; });
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('resize', resize);
  window.addEventListener('storage', e => { if (e.key === ANIM_KEY || e.key === 'ttp_theme') { setTimeout(syncTheme, 0); wake(); } });
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  // "Nur bei Benutzung": nach 5s ohne Eingabe ausblenden - die Schleife
  // laeuft dabei weiter, bis level 0 erreicht ist, und schlaeft dann.
  setInterval(() => { if (scene) wake(); }, 1000);

  if (document.body) syncTheme();
  else document.addEventListener('DOMContentLoaded', syncTheme);

  // ===================== Szene: Haunted Night =====================
  function hauntedScene() {
    let W = 0;
    let H = 0;
    const ghosts = [];
    const fog = [];
    let bat = null;
    let nextBat = 6 + Math.random() * 10;
    const rand = (a, b) => a + Math.random() * (b - a);

    function spawnGhost(anywhere) {
      return {
        x: rand(0, W),
        y: anywhere ? rand(0, H) : H + 60,
        size: rand(24, 46),
        vx: rand(-9, 9),
        vy: rand(-14, -6),
        phase: rand(0, Math.PI * 2),
        alpha: rand(0.10, 0.22)
      };
    }

    function drawGhost(c, g, t) {
      const s = g.size;
      const x = g.x + Math.sin(t * 0.6 + g.phase) * 12;
      const y = g.y + Math.sin(t * 1.3 + g.phase) * 4;
      c.save();
      c.translate(x, y);
      c.globalAlpha *= g.alpha * 2; // ~0.2-0.45: durchscheinend, nicht wie Sticker
      c.shadowColor = 'rgba(205, 190, 255, 0.55)';
      c.shadowBlur = s * 0.45;
      c.fillStyle = 'rgba(236, 232, 255, 0.85)';
      c.beginPath();
      c.arc(0, 0, s * 0.5, Math.PI, 0);
      const bottom = s * 0.75;
      c.lineTo(s * 0.5, bottom);
      const waves = 4;
      for (let i = 0; i < waves; i++) {
        const x1 = s * 0.5 - (i + 0.5) * (s / waves);
        const x2 = s * 0.5 - (i + 1) * (s / waves);
        const wob = Math.sin(t * 4 + g.phase + i) * s * 0.06;
        c.quadraticCurveTo(x1, bottom - s * 0.16 + wob, x2, bottom);
      }
      c.closePath();
      c.fill();
      c.shadowBlur = 0;
      c.fillStyle = 'rgba(20, 14, 30, 0.85)';
      c.beginPath();
      c.ellipse(-s * 0.17, -s * 0.06, s * 0.07, s * 0.1, 0, 0, Math.PI * 2);
      c.ellipse(s * 0.17, -s * 0.06, s * 0.07, s * 0.1, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    function drawBat(c, b, t) {
      const flap = Math.sin(t * 18) ;
      const s = b.size;
      c.save();
      c.translate(b.x, b.y + Math.sin(t * 3) * 10);
      c.scale(b.dir, 1);
      c.fillStyle = 'rgba(8, 6, 12, 0.9)';
      c.beginPath();
      c.ellipse(0, 0, s * 0.16, s * 0.22, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      const wy = -s * 0.35 * flap;
      c.moveTo(0, -s * 0.05);
      c.quadraticCurveTo(-s * 0.4, wy - s * 0.1, -s * 0.8, wy);
      c.quadraticCurveTo(-s * 0.55, s * 0.05, -s * 0.45, s * 0.12);
      c.quadraticCurveTo(-s * 0.25, 0, 0, s * 0.08);
      c.moveTo(0, -s * 0.05);
      c.quadraticCurveTo(s * 0.4, wy - s * 0.1, s * 0.8, wy);
      c.quadraticCurveTo(s * 0.55, s * 0.05, s * 0.45, s * 0.12);
      c.quadraticCurveTo(s * 0.25, 0, 0, s * 0.08);
      c.fill();
      c.restore();
    }

    let t = 0;
    return {
      resize(w, h) {
        const first = W === 0;
        W = w;
        H = h;
        if (first) {
          for (let i = 0; i < 7; i++) ghosts.push(spawnGhost(true));
          for (let i = 0; i < 3; i++) fog.push({ x: rand(0, W), r: rand(260, 420), vx: rand(-12, 12), a: rand(0.05, 0.09) });
        }
      },
      update(dt) {
        t += dt;
        ghosts.forEach((g, i) => {
          g.x += g.vx * dt;
          g.y += g.vy * dt;
          if (g.y < -80 || g.x < -80 || g.x > W + 80) ghosts[i] = spawnGhost(false);
        });
        fog.forEach(f => {
          f.x += f.vx * dt;
          if (f.x < -f.r) f.x = W + f.r;
          if (f.x > W + f.r) f.x = -f.r;
        });
        nextBat -= dt;
        if (!bat && nextBat <= 0) {
          const dir = Math.random() < 0.5 ? 1 : -1;
          bat = { dir, x: dir > 0 ? -40 : W + 40, y: rand(H * 0.12, H * 0.45), size: rand(22, 32), vx: dir * rand(170, 240) };
        }
        if (bat) {
          bat.x += bat.vx * dt;
          if (bat.x < -80 || bat.x > W + 80) { bat = null; nextBat = rand(16, 34); }
        }
      },
      draw(c) {
        fog.forEach(f => {
          const g = c.createRadialGradient(f.x, H, 0, f.x, H, f.r);
          g.addColorStop(0, `rgba(170, 160, 200, ${f.a})`);
          g.addColorStop(1, 'rgba(170, 160, 200, 0)');
          c.fillStyle = g;
          c.fillRect(f.x - f.r, H - f.r, f.r * 2, f.r);
        });
        ghosts.forEach(g => drawGhost(c, g, t));
        if (bat) drawBat(c, bat, t);
      }
    };
  }
})();
