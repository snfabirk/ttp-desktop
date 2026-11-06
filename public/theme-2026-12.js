// Dezember-Pass 2026 - Themes (v6.4.0), Designs vom Nutzer abgenommen:
//   village   (Stufe 15, Winter Village): stehende SVG-Szene HINTER dem Inhalt -
//             Mond, Berge, Kirche, Haeuser mit warmen Fenstern + Rauch, Teich,
//             Zaun, Laterne, Tannen, leiser Schneefall (theme-lab/2026-12-winter.html).
//             Easter Egg: 5x auf die Glocke im Kirchturm -> Glocke laeutet,
//             Schallwelle, alle Fenster gehen aus und nacheinander wieder an,
//             der Schnee wird kurz dichter.
//   christmas (Stufe 30, Christmas Eve, animiert): echtes 3D (xmas-scene.js,
//             Three.js), Entwurf theme-lab/2026-12-christmas-3d.html.
//             Easter Egg: 5x auf den Stern auf der Baumspitze.
// Laedt nach theme-fx.js (nav.js).
(function () {
  if (!window.TTPThemeFx || window.TTPTheme2612) return;
  window.TTPTheme2612 = true;
  const INTERACTIVE = window.TTPThemeFx.INTERACTIVE;
  const html = document.documentElement;
  const fxOff = () => html.classList.contains('fx-off');
  const mode = () => { try { return localStorage.getItem('ttp_theme_anim') || 'active'; } catch (e) { return 'active'; } };

  // ===================== Winter Village =====================
  const SMOKE = 'M25 -128 C15 -150 38 -160 26 -186 C40 -168 34 -152 42 -140 Z';
  const VILLAGE_SVG = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
    <defs>
      <radialGradient id="vl-moonG"><stop offset="0" stop-color="#f4f9ff" stop-opacity=".9"/><stop offset=".25" stop-color="#cfe4ff" stop-opacity=".35"/><stop offset="1" stop-color="#cfe4ff" stop-opacity="0"/></radialGradient>
      <linearGradient id="vl-mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a5b80"/><stop offset="1" stop-color="#22395a"/></linearGradient>
      <linearGradient id="vl-hill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9e8f7"/><stop offset="1" stop-color="#8fb0d2"/></linearGradient>
      <linearGradient id="vl-hill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef5fd"/><stop offset="1" stop-color="#a9c3df"/></linearGradient>
      <linearGradient id="vl-ice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc4e8"/><stop offset="1" stop-color="#5f8bb5"/></linearGradient>
      <radialGradient id="vl-winGlow"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>
      <g id="vl-pine"><path d="M0 -120 L30 -70 L16 -72 L44 -28 L26 -30 L56 12 L-56 12 L-26 -30 L-44 -28 L-16 -72 L-30 -70 Z" fill="#0f2238"/>
        <path d="M0 -120 L18 -90 L-4 -86 L-18 -90 Z M-30 -70 L-6 -64 L20 -70 L16 -72 Z M-44 -28 L-10 -20 L30 -26 L26 -30 Z M-56 12 L-14 18 L40 12 Z" fill="#e6f1fb" opacity=".85"/>
        <rect x="-6" y="12" width="12" height="18" fill="#1a1410"/></g>
      <g id="vl-house"><rect x="-50" y="-60" width="100" height="70" fill="#2a3e58"/>
        <path d="M-62 -58 L0 -110 L62 -58 Z" fill="#1c2c42"/><path d="M-66 -56 L0 -114 L66 -56 L58 -52 L0 -100 L-58 -52 Z" fill="#f1f7fd"/>
        <rect x="18" y="-122" width="14" height="34" fill="#22344c"/><rect x="15" y="-126" width="20" height="8" fill="#eef5fd"/></g>
    </defs>
    <g fill="#fff">
      <circle cx="120" cy="80" r="1.5" opacity=".8"/><circle cx="260" cy="150" r="1" opacity=".6"/><circle cx="420" cy="60" r="1.6" opacity=".9"/><circle cx="560" cy="130" r="1" opacity=".5"/>
      <circle cx="700" cy="40" r="1.4" opacity=".8"/><circle cx="880" cy="110" r="1" opacity=".6"/><circle cx="1040" cy="50" r="1.5" opacity=".8"/><circle cx="1180" cy="160" r="1" opacity=".5"/>
      <circle cx="1330" cy="90" r="1.6" opacity=".9"/><circle cx="1480" cy="40" r="1.2" opacity=".7"/><circle cx="1540" cy="170" r="1" opacity=".5"/><circle cx="980" cy="210" r="1" opacity=".5"/>
    </g>
    <circle cx="1260" cy="170" r="150" fill="url(#vl-moonG)"/>
    <circle cx="1260" cy="170" r="44" fill="#f2f8ff"/>
    <g fill="#c8d9ec" opacity=".35"><circle cx="1248" cy="160" r="8"/><circle cx="1274" cy="186" r="5"/><circle cx="1270" cy="152" r="3"/></g>
    <g transform="translate(0 70)"><path d="M0 560 L120 430 L210 500 L330 380 L460 520 L560 440 L700 540 L840 400 L980 520 L1100 450 L1240 540 L1380 420 L1500 500 L1600 460 L1600 900 L0 900 Z" fill="url(#vl-mtn)"/>
    <path d="M330 380 L362 412 L346 410 L330 428 L314 410 L298 414 Z M840 400 L872 432 L856 430 L840 446 L824 430 L808 434 Z M1380 420 L1408 448 L1394 446 L1380 462 L1366 446 L1352 450 Z M120 430 L144 454 L120 466 L98 454 Z" fill="#dbe8f5" opacity=".85"/></g>
    <path d="M0 640 C220 590 420 620 640 600 C860 580 1080 630 1300 600 C1420 584 1520 596 1600 590 L1600 900 L0 900 Z" fill="url(#vl-hill1)"/>
    <g transform="translate(560 612) scale(.78) translate(0 30)">
      <rect x="-70" y="-90" width="140" height="96" fill="#2c425e"/>
      <path d="M-84 -88 L0 -150 L84 -88 Z" fill="#1d2e45"/><path d="M-88 -86 L0 -154 L88 -86 L80 -82 L0 -140 L-80 -82 Z" fill="#f1f7fd"/>
      <rect x="-36" y="-250" width="72" height="170" fill="#31496a"/>
      <path d="M-46 -248 L0 -330 L46 -248 Z" fill="#1d2e45"/><path d="M-50 -246 L0 -334 L50 -246 L42 -242 L0 -318 L-42 -242 Z" fill="#f1f7fd"/>
      <path d="M0 -334 V-362 M-10 -352 H10" stroke="#c9d6e4" stroke-width="4"/>
      <path d="M-22 -232 V-190 H22 V-232 A22 22 0 0 0 -22 -232 Z" fill="#0d1726"/>
      <g class="vl-bell"><path d="M0 -228 V-222" stroke="#8a6a2a" stroke-width="3"/><path d="M-12 -196 C-12 -212 -8 -222 0 -222 C8 -222 12 -212 12 -196 L15 -192 H-15 Z" fill="#d6a948"/><circle cx="0" cy="-189" r="3" fill="#b88a2c"/></g>
      <circle class="vl-ripple" cx="0" cy="-208" r="30" fill="none" stroke="#ffe2a0" stroke-width="2"/>
      <rect class="vl-bell-hit" x="-30" y="-244" width="60" height="64" fill="transparent"/>
      <path d="M-14 6 V-34 A14 14 0 0 1 14 -34 V6 Z" fill="#4a2f1e"/>
      <rect class="vl-win" x="-58" y="-70" width="20" height="34" rx="10" fill="#ffcf7a"/><rect class="vl-win" x="38" y="-70" width="20" height="34" rx="10" fill="#ffcf7a"/>
      <circle cx="0" cy="-130" r="10" fill="#ffcf7a" class="vl-win flick"/>
    </g>
    <g transform="translate(860 640)"><use href="#vl-house"/><rect class="vl-win" x="-34" y="-46" width="20" height="22" fill="#ffcf7a"/><rect class="vl-win flick" x="12" y="-46" width="20" height="22" fill="#ffcf7a"/><path class="vl-smoke" d="${SMOKE}" fill="#cfdcea"/></g>
    <g transform="translate(1010 628) scale(.85)"><use href="#vl-house"/><rect class="vl-win" x="-34" y="-46" width="20" height="22" fill="#ffcf7a"/><rect class="vl-win" x="12" y="-46" width="20" height="22" fill="#ffcf7a"/><path class="vl-smoke b" d="${SMOKE}" fill="#cfdcea"/></g>
    <g transform="translate(1150 650) scale(.72)"><use href="#vl-house"/><rect class="vl-win flick" x="-34" y="-46" width="20" height="22" fill="#ffcf7a"/><rect class="vl-win" x="12" y="-46" width="20" height="22" fill="#ffcf7a"/><path class="vl-smoke c" d="${SMOKE}" fill="#cfdcea"/></g>
    <g transform="translate(330 660) scale(.8)"><use href="#vl-house"/><rect class="vl-win" x="-34" y="-46" width="20" height="22" fill="#ffcf7a"/><rect class="vl-win" x="12" y="-46" width="20" height="22" fill="#ffcf7a"/><path class="vl-smoke b" d="${SMOKE}" fill="#cfdcea"/></g>
    <g opacity=".7"><ellipse cx="860" cy="660" rx="70" ry="14" fill="url(#vl-winGlow)"/><ellipse cx="560" cy="626" rx="90" ry="14" fill="url(#vl-winGlow)"/><ellipse cx="1010" cy="646" rx="56" ry="11" fill="url(#vl-winGlow)"/></g>
    <path d="M0 740 C200 700 380 730 600 716 C820 702 1000 742 1240 720 C1400 706 1520 716 1600 712 L1600 900 L0 900 Z" fill="url(#vl-hill2)"/>
    <ellipse cx="1240" cy="800" rx="220" ry="34" fill="url(#vl-ice)" opacity=".85"/>
    <ellipse cx="1240" cy="796" rx="200" ry="26" fill="none" stroke="#e6f2ff" stroke-width="2" opacity=".5"/>
    <path d="M1150 792 L1200 788 M1260 806 L1320 800" stroke="#eaf5ff" stroke-width="2" opacity=".6"/>
    <ellipse cx="1300" cy="800" rx="26" ry="4" fill="#f2f8ff" opacity=".45"/>
    <g stroke="#3a2a1e" stroke-width="6">
      <line x1="40" y1="760" x2="40" y2="712"/><line x1="110" y1="756" x2="110" y2="708"/><line x1="180" y1="754" x2="180" y2="706"/><line x1="250" y1="752" x2="250" y2="704"/>
      <line x1="30" y1="726" x2="262" y2="718"/><line x1="30" y1="746" x2="262" y2="740"/></g>
    <g fill="#f4f9ff"><rect x="34" y="704" width="12" height="8" rx="4"/><rect x="104" y="700" width="12" height="8" rx="4"/><rect x="174" y="698" width="12" height="8" rx="4"/><rect x="244" y="696" width="12" height="8" rx="4"/>
      <path d="M30 724 Q146 712 262 716 L262 720 Q146 718 30 728 Z"/></g>
    <g transform="translate(420 780)"><rect x="-4" y="-120" width="8" height="120" fill="#1e2734"/><rect x="-14" y="-150" width="28" height="32" rx="4" fill="#26303e"/>
      <rect class="vl-win" x="-9" y="-144" width="18" height="20" fill="#ffd27a"/><circle cx="0" cy="-134" r="46" fill="url(#vl-winGlow)"/><path d="M-18 -152 H18 L0 -168 Z" fill="#eef5fd"/></g>
    <use href="#vl-pine" transform="translate(110 690) scale(1.1)"/><use href="#vl-pine" transform="translate(200 700) scale(.85)"/>
    <use href="#vl-pine" transform="translate(720 640) scale(.7)"/><use href="#vl-pine" transform="translate(1440 700) scale(1.2)"/>
    <use href="#vl-pine" transform="translate(1530 716) scale(.9)"/><use href="#vl-pine" transform="translate(1360 712) scale(.75)"/>
    <use href="#vl-pine" transform="translate(40 820) scale(1.5)"/><use href="#vl-pine" transform="translate(1570 840) scale(1.6)"/>
  </svg>`;
  const VILLAGE_HTML = `${VILLAGE_SVG}<div class="vl-snow"></div><div class="vl-snow b"></div>`;

  function villageScene() {
    let root = null, clicks = 0, resetT = null, busy = false;
    const restart = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };
    function onClick(ev) {
      if (!root || ev.button !== 0) return;
      if (ev.target.closest && ev.target.closest(INTERACTIVE)) return;
      const r = root.querySelector('.vl-bell-hit').getBoundingClientRect();
      if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) return;
      const bell = root.querySelector('.vl-bell');
      if (!fxOff()) restart(bell, 'ring');
      if (busy) return;
      clicks++;
      clearTimeout(resetT);
      resetT = setTimeout(() => { clicks = 0; }, 8000);
      if (clicks < 5) return;
      clicks = 0; busy = true;
      restart(root.querySelector('.vl-ripple'), 'go');
      const wins = [...root.querySelectorAll('.vl-win')];
      const snow = root.querySelector('.vl-snow');
      wins.forEach(w => w.classList.add('off'));
      snow.classList.add('burst');
      setTimeout(() => {
        wins.sort(() => Math.random() - 0.5).forEach((w, i) => setTimeout(() => w.classList.remove('off'), 300 + i * 220));
      }, 1100);
      setTimeout(() => { snow.classList.remove('burst'); busy = false; }, 1400 + wins.length * 220 + 800);
    }
    return {
      animated: false,
      mount() {
        root = document.createElement('div');
        root.className = 'village-fx';
        root.setAttribute('aria-hidden', 'true');
        root.innerHTML = VILLAGE_HTML;
        document.body.appendChild(root);
        document.addEventListener('click', onClick, true);
      },
      unmount() {
        document.removeEventListener('click', onClick, true);
        clearTimeout(resetT);
        if (root) root.remove();
        root = null;
      }
    };
  }

  // ===================== Christmas Eve (Three.js) =====================
  let modP = null;
  const loadXmas = () => modP || (modP = import('./xmas-scene.js').catch(e => { console.warn('[Christmas Eve] 3D konnte nicht geladen werden', e); modP = null; return null; }));

  function christmasScene(ctx) {
    let root = null, canvas = null, warm = null, inst = null, dead = false, lvl = 0, inside = 0;
    const size = () => { if (inst) inst.resize(innerWidth, innerHeight); };
    const input = () => ({ mx: ctx.pointer.x / innerWidth * 2 - 1, my: ctx.pointer.y / innerHeight * 2 - 1, inside: ctx.inside() });
    // Standbild (Animations: Off / nach Groessenaenderung im Ruhezustand)
    const still = () => { if (inst && lvl === 0) inst.render(performance.now() / 1000, input()); };
    function onClick(ev) {
      if (!inst || ev.button !== 0) return;
      if (ev.target.closest && ev.target.closest(INTERACTIVE)) return;
      if (inst.click(ev.clientX, ev.clientY) && lvl === 0) still();
    }
    return {
      animated: true,
      mount() {
        root = document.createElement('div');
        root.className = 'xmas-fx';
        root.setAttribute('aria-hidden', 'true');
        canvas = document.createElement('canvas');
        warm = document.createElement('div');
        warm.className = 'xmas-warm';
        root.append(canvas, warm);
        document.body.appendChild(root);
        document.addEventListener('click', onClick, true);
        loadXmas().then(mod => {
          if (dead || !mod) return;
          try { inst = mod.create(canvas); } catch (e) { console.warn('[Christmas Eve]', e); return; }
          size();
          inst.render(0, input());          // sofort ein Bild (auch bei "Animations: Off")
          root.classList.add('ready');
        });
      },
      unmount() {
        dead = true;
        document.removeEventListener('click', onClick, true);
        if (inst) inst.dispose();
        if (root) root.remove();
        inst = root = canvas = warm = null;
      },
      resize() { size(); setTimeout(still, 0); },
      setLevel(v) { lvl = v; },
      frame(dt, t) {
        if (!inst) return;
        inside += ((ctx.inside() ? 1 : 0) - inside) * Math.min(1, dt * 3);
        if (warm) {
          warm.style.setProperty('--mx', `${ctx.pointer.x}px`);
          warm.style.setProperty('--my', `${ctx.pointer.y}px`);
          warm.style.opacity = (inside * lvl).toFixed(3);
        }
        inst.render(t, input());
      }
    };
  }

  // ===================== Mini-Vorschau (Pass-Hover) =====================
  window.TTPThemeLiveExtra = window.TTPThemeLiveExtra || {};
  window.TTPThemeLiveExtra.village = (cv, W, H) => {
    const d = Math.min(2, devicePixelRatio || 1); cv.width = W * d; cv.height = H * d;
    const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#050b18'); g.addColorStop(0.4, '#0b1a33'); g.addColorStop(0.7, '#16304f'); g.addColorStop(1, '#2a4a6c');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const el = document.createElement('div');
    el.className = 'village-fx pv-mini';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = VILLAGE_HTML;
    cv.after(el);
    return () => el.remove();
  };
  // Christmas Eve: EINE kleine 3D-Szene fuer alle Hovers, ihr Canvas wandert
  // in die jeweilige Vorschau (Aufbau dauert einen Moment - danach sofort da)
  let pv = null, pvCanvas = null, pvP = null;
  window.TTPThemeLiveExtra.christmas = (cv, W, H) => {
    const d = Math.min(2, devicePixelRatio || 1); cv.width = W * d; cv.height = H * d;
    const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#05040c'); g.addColorStop(0.5, '#0f0a1e'); g.addColorStop(0.72, '#2a1a30'); g.addColorStop(1, '#c8d0de');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    let raf = 0, stopped = false;
    if (!pvP) {
      pvP = loadXmas().then(mod => {
        if (!mod) { pvP = null; return null; }
        pvCanvas = document.createElement('canvas');
        pvCanvas.className = 'xmas-pv';
        pv = mod.create(pvCanvas, { small: true });
        return pv;
      });
    }
    pvP.then(p => {
      if (stopped || !p) return;
      pvCanvas.style.width = `${W}px`; pvCanvas.style.height = `${H}px`;
      cv.after(pvCanvas);
      p.resize(W, H);
      const t0 = performance.now() / 1000 - 3;
      const step = now => {
        p.render(now / 1000 - t0, { mx: 0.15 * Math.sin(now / 2400), my: 0, inside: false });
        if (mode() !== 'off') raf = requestAnimationFrame(step);
      };
      step(performance.now());
    });
    return () => { stopped = true; cancelAnimationFrame(raf); if (pvCanvas) pvCanvas.remove(); };
  };

  const R = window.TTPThemeFx.register;
  R('village', villageScene);
  R('christmas', christmasScene);
})();
