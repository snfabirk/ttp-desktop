// Aufwendige Cosmetics (v5.12.0) - Designs aus theme-lab/ (vom Nutzer
// abgenommen). Borders bleiben im Markup ein schlichtes
// <span class="cos-border cos-<id>"><img></span>; dieses Script haengt die
// Deko-Elemente (.cos-deco) automatisch an, sobald so ein Element auf der Seite
// auftaucht oder seine Klasse wechselt (MutationObserver) - keine Seite muss
// dafuer etwas tun. Profil-Rahmen baut profile.html ueber
// TTPCos.decorateFrame(wrap, id).
//
// Animationen folgen der Einstellung "Animations" (theme-fx.js setzt
// html.fx-off / html.fx-paused, die CSS-Seite steht in cosmetics.css).
(function () {
  if (window.TTPCos) return;
  let uid = 0;
  const NS = 'http://www.w3.org/2000/svg';
  const fxOff = () => document.documentElement.classList.contains('fx-off');
  const fxPaused = () => document.documentElement.classList.contains('fx-paused');

  const SPIDER = '<g><path class="wn-leg" d="M12 12 Q4 6 1 10"/><path class="wn-leg" d="M12 14 Q3 13 0 17"/><path class="wn-leg" d="M12 16 Q4 19 2 24"/><path class="wn-leg" d="M13 17 Q8 23 7 27"/><path class="wn-leg" d="M16 12 Q24 6 27 10"/><path class="wn-leg" d="M16 14 Q25 13 28 17"/><path class="wn-leg" d="M16 16 Q24 19 26 24"/><path class="wn-leg" d="M15 17 Q20 23 21 27"/><ellipse cx="14" cy="18" rx="5" ry="6" fill="#0d0912"/><path d="M12 16 l2 3 l2 -3" stroke="#ff6a1a" stroke-width=".9" fill="none" opacity=".8"/><circle cx="14" cy="11" r="3.2" fill="#140e1b"/><circle cx="12.9" cy="10.4" r=".85" fill="#ff7a2a" style="filter:drop-shadow(0 0 1.5px #ff7a2a)"/><circle cx="15.1" cy="10.4" r=".85" fill="#ff7a2a" style="filter:drop-shadow(0 0 1.5px #ff7a2a)"/></g>';
  const WIDOW_WEB = '<path d="M51.6 101.6 Q71.0 105.8 86.9 98.6" stroke-opacity="0.48" stroke-width="0.65"/><path d="M89.0 65.8 Q85.9 93.1 87.9 103.0" stroke-opacity="0.47" stroke-width="0.54"/><path d="M53.3 90.2 Q59.7 129.3 64.6 146.5" stroke-opacity="0.19" stroke-width="0.58"/><path d="M82.6 58.7 Q84.4 90.8 82.5 112.5" stroke-opacity="0.23" stroke-width="0.82"/><path d="M80.7 67.8 Q88.0 81.9 100.8 85.0" stroke-opacity="0.50" stroke-width="0.54"/><path d="M125.0 41.4 Q113.4 66.1 98.7 70.8" stroke-opacity="0.39" stroke-width="0.74"/><path d="M47.4 107.2 Q68.2 126.1 84.3 122.2" stroke-opacity="0.33" stroke-width="0.60"/><path d="M76.3 63.0 Q81.7 84.3 92.0 97.1" stroke-opacity="0.45" stroke-width="0.85"/><path d="M84.7 62.1 Q90.7 76.1 95.3 78.6" stroke-opacity="0.39" stroke-width="0.70"/><path d="M55.3 100.5 Q57.4 127.1 58.3 140.1" stroke-opacity="0.29" stroke-width="0.49"/><path d="M45.2 116.1 Q68.4 117.8 89.6 100.6" stroke-opacity="0.51" stroke-width="0.83"/><path d="M71.1 68.0 Q101.5 79.9 131.9 69.6" stroke-opacity="0.32" stroke-width="0.55"/><path d="M140.6 49.3 Q123.6 69.7 106.8 69.7" stroke-opacity="0.49" stroke-width="0.47"/><path d="M60.3 89.7 Q71.6 111.4 84.8 123.9" stroke-opacity="0.51" stroke-width="0.84"/><path d="M120.9 49.5 Q122.2 62.7 120.7 59.6" stroke-opacity="0.19" stroke-width="0.53"/><path d="M134.5 41.3 Q149.5 64.4 163.5 72.7" stroke-opacity="0.49" stroke-width="0.57"/><path d="M88.6 57.0 Q97.3 90.7 100.6 105.5" stroke-opacity="0.19" stroke-width="0.69"/><path d="M104.9 50.8 Q128.0 72.7 145.5 80.0" stroke-opacity="0.52" stroke-width="0.50"/><path d="M53.7 113.7 Q66.9 140.0 75.7 156.0" stroke-opacity="0.42" stroke-width="0.50"/><path d="M90.6 58.9 Q92.6 83.8 98.5 98.1" stroke-opacity="0.32" stroke-width="0.73"/><path d="M91.0 56.2 Q81.1 91.2 67.7 105.9" stroke-opacity="0.18" stroke-width="0.64"/><path d="M51.0 117.9 Q65.7 114.0 78.0 98.2" stroke-opacity="0.30" stroke-width="0.47"/><path d="M69.4 70.5 Q78.4 97.9 86.8 109.2" stroke-opacity="0.53" stroke-width="0.49"/><path d="M98.1 52.1 Q102.8 64.9 105.1 64.7" stroke-opacity="0.37" stroke-width="0.67"/><path d="M43.2 115.9 Q69.6 115.0 90.0 101.1" stroke-opacity="0.22" stroke-width="0.48"/><path d="M45.7 114.9 Q64.1 115.7 88.3 98.4" stroke-opacity="0.42" stroke-width="0.63"/><path d="M79.9 71.4 Q93.2 67.7 106.4 57.6" stroke-opacity="0.40" stroke-width=".6"/><path d="M55.1 93.9 Q68.1 82.8 81.1 61.2" stroke-opacity="0.33" stroke-width=".6"/><path d="M66.7 80.8 Q78.6 71.6 90.5 55.5" stroke-opacity="0.42" stroke-width=".6"/><path d="M73.3 68.8 Q91.1 63.1 108.8 45.2" stroke-opacity="0.52" stroke-width=".6"/><path d="M92.6 57.6 Q114.2 54.8 135.9 43.5" stroke-opacity="0.57" stroke-width=".6"/><path d="M64.8 79.2 Q78.8 73.2 92.9 51.3" stroke-opacity="0.25" stroke-width=".6"/><path d="M64.0 89.8 Q74.3 86.3 84.5 71.4" stroke-opacity="0.28" stroke-width=".6"/><path d="M59.5 88.3 Q77.1 75.7 94.8 56.1" stroke-opacity="0.58" stroke-width=".6"/><path d="M98.7 59.6 Q110.2 61.4 121.8 50.3" stroke-opacity="0.34" stroke-width=".6"/><path d="M80.3 71.1 Q93.9 75.1 107.4 69.6" stroke-opacity="0.16" stroke-width=".5"/><path d="M68.4 84.2 Q83.5 82.2 98.6 72.7" stroke-opacity="0.23" stroke-width=".5"/><path d="M61.5 96.5 Q77.3 99.2 93.2 90.2" stroke-opacity="0.13" stroke-width=".5"/><path d="M66.1 76.6 Q89.3 81.4 112.5 81.9" stroke-opacity="0.23" stroke-width=".5"/><path d="M75.6 76.6 Q88.3 80.9 101.0 78.6" stroke-opacity="0.20" stroke-width=".5"/><path d="M79.5 71.1 Q96.8 73.6 114.1 67.8" stroke-opacity="0.13" stroke-width=".5"/><path d="M56.4 101.5 Q76.6 100.1 96.8 88.0" stroke-opacity="0.29" stroke-width=".5"/><path d="M76.5 78.8 Q97.5 83.6 118.5 78.4" stroke-opacity="0.26" stroke-width=".5"/><path d="M57.9 106.6 Q74.5 99.6 91.1 84.8" stroke-opacity="0.26" stroke-width=".5"/><path d="M62.2 93.4 Q80.3 94.9 98.4 85.3" stroke-opacity="0.13" stroke-width=".5"/><path d="M52.6 108.0 Q71.2 104.0 89.9 95.5" stroke-opacity="0.13" stroke-width=".5"/><path d="M59.9 89.3 Q79.4 94.2 99.0 87.6" stroke-opacity="0.22" stroke-width=".5"/>';

  // ===================== Profilbild-Rahmen (Borders) =====================
  const BORDERS = {
    // Stufe 5: Pumpkin Ring - Bild sitzt im ausgeschnittenen Fenster eines Kuerbis
    'border-2026-10-pumpkin'(el) {
      const n = ++uid;
      el.insertAdjacentHTML('afterbegin', `<svg class="cos-deco pk-shell" viewBox="-70 -64 140 128" aria-hidden="true">
        <defs>
          <radialGradient id="pkSeg${n}" cx=".42" cy=".32" r=".75"><stop offset="0" stop-color="#f6a24a"/><stop offset=".55" stop-color="#df701d"/><stop offset="1" stop-color="#9c430b"/></radialGradient>
          <radialGradient id="pkSegD${n}" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#d9681a"/><stop offset=".6" stop-color="#b9540f"/><stop offset="1" stop-color="#7a3307"/></radialGradient>
          <linearGradient id="pkStem${n}" x1="0" x2="1"><stop offset="0" stop-color="#3b2a14"/><stop offset=".5" stop-color="#6b5428"/><stop offset="1" stop-color="#2e2110"/></linearGradient>
        </defs>
        <g stroke="#7a3307" stroke-width="1.1">
          <ellipse cx="-38" cy="1" rx="26" ry="44" fill="url(#pkSegD${n})"/><ellipse cx="38" cy="1" rx="26" ry="44" fill="url(#pkSegD${n})"/>
          <ellipse cx="-22" cy="0" rx="29" ry="51" fill="url(#pkSeg${n})"/><ellipse cx="22" cy="0" rx="29" ry="51" fill="url(#pkSeg${n})"/>
          <ellipse cx="0" cy="0" rx="25" ry="53" fill="url(#pkSeg${n})"/>
        </g>
        <ellipse cx="-6" cy="-36" rx="6" ry="10" fill="#fff" opacity=".08"/>
        <path d="M-4 -49 Q-5 -58 -1 -64 Q3 -66 6 -63 Q3 -57 5 -49 Q0 -46 -4 -49 Z" fill="url(#pkStem${n})"/>
      </svg>`);
      el.insertAdjacentHTML('beforeend', '<span class="cos-deco pk-candle"></span><span class="cos-deco pk-lip"></span>');
      // Der Kuerbis ist breiter als das Bild - seitlich Platz lassen, damit er
      // nichts daneben (Name, Text) verdeckt
      const pad = () => {
        const w = el.getBoundingClientRect().width;
        if (!el.isConnected) return;
        if (!w) { requestAnimationFrame(pad); return; }
        if (el.dataset.cosDeco === 'border-2026-10-pumpkin') el.style.marginInline = `${Math.round(w * 0.3)}px`;
      };
      pad();
    },

    // Stufe 20: Widow's Nest - Ektoplasma-Ring, Dachboden-Spinnweben ueber dem
    // Bild, Spinne seilt sich ab bzw. krabbelt ab und zu um den Ring
    'border-2026-10-haunted'(el) {
      const n = ++uid;
      el.insertAdjacentHTML('beforeend', `<svg class="cos-deco wn-ring" viewBox="0 0 280 280" aria-hidden="true">
        <defs>
          <filter id="wnEcto${n}" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="2" seed="4" result="n">
              <animate class="fx-anim" attributeName="baseFrequency" dur="7s" values="0.03 0.05;0.04 0.07;0.03 0.05" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="B" result="w"/>
            <feGaussianBlur in="w" stdDeviation="2.2" result="g"/>
            <feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="w"/></feMerge>
          </filter>
          <linearGradient id="wnG${n}" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0" stop-color="#ff8a2a"/><stop offset=".5" stop-color="#b44dff"/><stop offset="1" stop-color="#ff8a2a"/>
            <animateTransform class="fx-anim" attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="9s" repeatCount="indefinite"/>
          </linearGradient>
          <radialGradient id="wnHalo${n}"><stop offset=".62" stop-color="#ff8a2a" stop-opacity="0"/><stop offset=".72" stop-color="#ff8a2a" stop-opacity=".22"/><stop offset=".86" stop-color="#7a3cff" stop-opacity=".12"/><stop offset="1" stop-color="#7a3cff" stop-opacity="0"/></radialGradient>
          <linearGradient id="wnRim${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a2a" stop-opacity=".55"/><stop offset=".5" stop-color="#ff8a2a" stop-opacity=".08"/><stop offset="1" stop-color="#7a3cff" stop-opacity=".45"/></linearGradient>
        </defs>
        <circle class="wn-halo" cx="140" cy="140" r="130" fill="url(#wnHalo${n})"/>
        <circle cx="140" cy="140" r="84" fill="none" stroke="#120e17" stroke-width="16"/>
        <circle cx="140" cy="140" r="92" fill="none" stroke="url(#wnG${n})" stroke-width="3.5" filter="url(#wnEcto${n})"/>
        <circle cx="140" cy="140" r="91.5" fill="none" stroke="url(#wnRim${n})" stroke-width="1.5"/>
        <circle cx="140" cy="140" r="76.5" fill="none" stroke="url(#wnRim${n})" stroke-width="1"/>
        <g class="wn-web">${WIDOW_WEB}</g>
        <circle class="wn-dew" cx="70.4" cy="93.0" r="1.5"/><circle class="wn-dew b" cx="104.0" cy="77.6" r="1.3"/><circle class="wn-dew c" cx="121.3" cy="52.0" r="1.1"/>
        <g class="wn-crawler" opacity="0"><g transform="translate(126 42) scale(.8)" class="wn-wiggle">${SPIDER}</g></g>
      </svg>`);
      // Abseil-Spinne nur bei groesseren Bildern (in Mini-Vorschauen waere sie nur ein Punkt)
      if (el.getBoundingClientRect().width >= 64 || el.classList.contains('id-frame')) {
        el.insertAdjacentHTML('beforeend', `<span class="cos-deco wn-dangle"><span class="wn-thread"></span><svg class="wn-spider wn-wiggle" viewBox="0 0 28 28">${SPIDER}</svg></span>`);
      }
      widows.add(el);
      startWidows();
    }
  };

  function borderIdOf(el) {
    for (const c of el.classList) {
      if (c.startsWith('cos-') && BORDERS[c.slice(4)]) return c.slice(4);
    }
    return '';
  }

  function decorate(el) {
    const id = borderIdOf(el);
    if (el.dataset.cosDeco === id && (!id || el.querySelector(':scope > .cos-deco'))) return;
    el.querySelectorAll(':scope > .cos-deco').forEach(d => d.remove());
    el.style.marginInline = '';
    widows.delete(el);
    el.dataset.cosDeco = id;
    if (id) { BORDERS[id](el); syncSmil(); }
  }

  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.classList.contains('cos-border')) decorate(root);
    root.querySelectorAll('.cos-border').forEach(decorate);
  }

  // ----- Spinnen des Widow's Nest (eine gemeinsame Schleife fuer alle) -----
  const widows = new Set();
  const state = new WeakMap();
  let widowRaf = null;
  let lastW = 0;
  const easeIO = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

  function startWidows() {
    if (!widowRaf) { lastW = performance.now(); widowRaf = requestAnimationFrame(widowLoop); }
  }

  function widowLoop(now) {
    widowRaf = null;
    const dt = Math.min(0.05, (now - lastW) / 1000);
    lastW = now;
    widows.forEach(el => { if (!el.isConnected) widows.delete(el); });
    if (!widows.size) return;
    if (fxOff() || fxPaused() || document.hidden) {
      setTimeout(startWidows, 400);
      return;
    }
    widows.forEach(el => stepWidow(el, dt));
    widowRaf = requestAnimationFrame(widowLoop);
  }

  function stepWidow(el, dt) {
    let s = state.get(el);
    if (!s) {
      s = {
        sp: { phase: 'wait', t: 0, wait: 2.5 + Math.random() * 3, len: 0, target: 0 },
        cr: { t: -1, next: 6 + Math.random() * 6 },
        dangle: el.querySelector(':scope > .wn-dangle'),
        crawler: el.querySelector('.wn-crawler')
      };
      if (s.dangle) { s.thread = s.dangle.querySelector('.wn-thread'); s.spider = s.dangle.querySelector('.wn-spider'); }
      state.set(el, s);
    }
    const k = el.getBoundingClientRect().width / 144; // Massstab: Demo-Bild war 144px
    const sp = s.sp;
    if (s.spider && s.k !== k) { s.k = k; s.spider.style.width = s.spider.style.height = `${40 * k}px`; s.spider.style.left = `${-20 * k}px`; }
    sp.t += dt;
    if (s.dangle) {
      if (sp.phase === 'wait' && sp.t > sp.wait) { sp.phase = 'down'; sp.t = 0; sp.target = 70 + Math.random() * 40; }
      if (sp.phase === 'down') { sp.len = sp.target * easeIO(Math.min(1, sp.t / 1.8)); if (sp.t > 1.8) { sp.phase = 'hang'; sp.t = 0; } }
      if (sp.phase === 'hang') { sp.len = sp.target + Math.sin(sp.t * 3) * 3; if (sp.t > 2.6) { sp.phase = 'up'; sp.t = 0; } }
      if (sp.phase === 'up') { sp.len = sp.target * (1 - easeIO(Math.min(1, sp.t / 1.4))); if (sp.t > 1.4) { sp.phase = 'wait'; sp.t = 0; sp.wait = 5 + Math.random() * 5; sp.len = 0; } }
      const sway = sp.phase === 'hang' ? Math.sin(sp.t * 1.6) * 7 : sp.phase === 'down' ? Math.sin(sp.t * 2) * 3 : 0;
      s.dangle.style.transform = `rotate(${sway}deg)`;
      s.thread.style.height = `${sp.len * k}px`;
      s.spider.style.top = `${(sp.len - 9) * k}px`;
      s.spider.style.opacity = sp.len > 2 ? 1 : 0;
      s.spider.classList.toggle('wn-still', !(sp.phase === 'hang' || sp.phase === 'up'));
    }
    const cr = s.cr;
    cr.next -= dt;
    if (cr.t < 0 && cr.next <= 0) cr.t = 0;
    if (cr.t >= 0 && s.crawler) {
      cr.t += dt;
      s.crawler.setAttribute('transform', `rotate(${cr.t / 7 * 360} 140 140)`);
      s.crawler.setAttribute('opacity', Math.max(0, Math.min(1, cr.t * 2, (7 - cr.t) * 2)));
      if (cr.t > 7) { cr.t = -1; cr.next = 10 + Math.random() * 8; s.crawler.setAttribute('opacity', 0); }
    }
  }

  // ===================== Profil-Rahmen (Frames) =====================
  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  // Klassisches Halloween-Eckennetz: Speichen aus der Ecke + durchhaengende Boegen
  function cornerWeb(size, seed, rings) {
    const r = rng(seed), f = v => v.toFixed(1), R = size - 4, n = 6;
    let d = '';
    const ang = [...Array(n)].map((_, i) => i === 0 ? 0 : i === n - 1 ? Math.PI / 2 : (i + (r() - 0.5) * 0.35) / (n - 1) * Math.PI / 2);
    const len = ang.map((a, i) => R * (i === 0 || i === n - 1 ? 1.05 : 0.85 + r() * 0.2));
    ang.forEach((a, i) => { d += `<path d="M0 0 L${f(Math.cos(a) * len[i])} ${f(Math.sin(a) * len[i])}" stroke-width="1.3" stroke-opacity=".8"/>`; });
    for (let k = 1; k <= rings; k++) {
      const rad = R * k / (rings + 0.4);
      const pts = ang.map(a => { const q = rad * (1 + (r() - 0.5) * 0.08); return [Math.cos(a) * q, Math.sin(a) * q]; });
      let path = `M${f(pts[0][0])} ${f(pts[0][1])}`;
      for (let i = 1; i < n; i++) {
        const a = (ang[i - 1] + ang[i]) / 2, sagR = rad * (0.78 + r() * 0.06);
        path += ` Q${f(Math.cos(a) * sagR)} ${f(Math.sin(a) * sagR)} ${f(pts[i][0])} ${f(pts[i][1])}`;
      }
      d += `<path d="${path}" stroke-width="${k === rings ? 1.1 : 1.25}" stroke-opacity="${(0.82 - k * 0.04).toFixed(2)}"/>`;
    }
    return d;
  }

  const FRAMES = {
    // Stufe 10: Cobweb - Eckennetze oben links/rechts (oberste Ebene), durchhaengender Faden
    'frame-2026-10-cobweb'(wrap) {
      wrap.insertAdjacentHTML('beforeend',
        `<svg class="pf-deco cweb l" width="124" height="124" aria-hidden="true"><g>${cornerWeb(124, 21, 5)}</g></svg>` +
        `<svg class="pf-deco cweb r" width="96" height="96" aria-hidden="true"><g>${cornerWeb(96, 7, 4)}</g></svg>` +
        '<svg class="pf-deco csag" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="M12 0 Q30 22 52 0"/></svg>');
    },

    // Stufe 25: Ectoplasm Manor - wabernder Ektoplasma-Rand, Ranken mit
    // Kuerbis-Blueten wachsen nur solange die Maus drauf ist, leichte 3D-Neigung
    'frame-2026-10-manor'(wrap) {
      const n = ++uid;
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'pf-deco mn-edge');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = `<defs>
          <filter id="mnEcto${n}" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="2" result="n">
              <animate class="fx-anim" attributeName="baseFrequency" dur="9s" values="0.012 0.02;0.018 0.028;0.012 0.02" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="B" result="w"/>
            <feGaussianBlur in="w" stdDeviation="2.4" result="g"/>
            <feMerge><feMergeNode in="g"/><feMergeNode in="w"/></feMerge>
          </filter>
          <linearGradient id="mnG${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a2a"/><stop offset=".5" stop-color="#b44dff"/><stop offset="1" stop-color="#ff8a2a"/></linearGradient>
        </defs>
        <rect class="mn-rect" x="22" y="22" rx="18" fill="none" stroke="url(#mnG${n})" stroke-width="4" filter="url(#mnEcto${n})"/>
        <g class="mn-vines"></g>`;
      wrap.appendChild(svg);
      const sheen = document.createElement('div');
      sheen.className = 'pf-deco mn-sheen';
      wrap.appendChild(sheen);

      const layout = () => {
        const w = wrap.offsetWidth, h = wrap.offsetHeight;
        if (!w || !h) return;
        const W2 = w + 44, H2 = h + 44;
        svg.setAttribute('viewBox', `0 0 ${W2} ${H2}`);
        const rect = svg.querySelector('.mn-rect');
        rect.setAttribute('width', w); rect.setAttribute('height', h);
        const vine = (d, cls = '') => `<path class="vine ${cls}" pathLength="1" d="${d}"/>`;
        const bloom = (x, y) => `<g class="bloom"><path d="M${x} ${y - 11} q1 -6 6 -7" stroke="#3f6b2a" stroke-width="2.2" fill="none"/><ellipse cx="${x}" cy="${y}" rx="13" ry="10.5" fill="#e8761c"/><ellipse cx="${x}" cy="${y}" rx="6.5" ry="10.5" fill="#f59a3c"/><path d="M${x - 7} ${y - 2} l3 -4 l3 4 z M${x + 1} ${y - 2} l3 -4 l3 4 z" fill="#2a1208"/><path d="M${x - 7} ${y + 3} q7 6 14 0 l-2 1 l-2 -2 l-2 2 l-2 -2 l-2 2 l-2 -2 z" fill="#2a1208"/><circle cx="${x}" cy="${y}" r="16" fill="#ff8a2a" opacity=".18"/></g>`;
        const leaf = (x, y, rot) => `<path class="bloom" d="M${x} ${y} q8 -10 18 -2 q-8 10 -18 2 z" fill="#5a2a86" transform="rotate(${rot} ${x} ${y})"/>`;
        svg.querySelector('.mn-vines').innerHTML =
          vine(`M14 ${H2 * 0.55} C 10 ${H2 * 0.35}, 30 ${H2 * 0.25}, 18 ${H2 * 0.12} S 40 6, ${W2 * 0.28} 14`) +
          vine(`M22 ${H2 * 0.3} q 18 -6 26 -22`, 'thin') + vine(`M${W2 * 0.16} 18 q 6 16 24 18`, 'thin') +
          vine(`M${W2 - 14} ${H2 * 0.45} C ${W2 - 8} ${H2 * 0.65}, ${W2 - 30} ${H2 * 0.78}, ${W2 - 18} ${H2 * 0.9} S ${W2 - 40} ${H2 - 6}, ${W2 * 0.72} ${H2 - 14}`) +
          vine(`M${W2 - 22} ${H2 * 0.72} q -18 6 -26 22`, 'thin') +
          leaf(16, H2 * 0.4, -40) + leaf(26, H2 * 0.2, 20) + leaf(W2 * 0.2, 12, -10) + leaf(W2 - 16, H2 * 0.6, 140) + leaf(W2 - 26, H2 * 0.8, 200) + leaf(W2 * 0.8, H2 - 12, 170) +
          bloom(W2 * 0.28, 14) + bloom(18, H2 * 0.12) + bloom(W2 * 0.72, H2 - 14) + bloom(W2 - 18, H2 * 0.9);
      };
      layout();
      const ro = new ResizeObserver(layout);
      ro.observe(wrap);

      // leichte 3D-Neigung (nicht im Bearbeiten-Modus - dort wird gezogen)
      const move = e => {
        if (document.body.classList.contains('editing') || fxOff()) { wrap.style.transform = ''; return; }
        const r = wrap.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        wrap.style.transform = `perspective(1600px) rotateY(${(px - 0.5) * 4}deg) rotateX(${(0.5 - py) * 3}deg)`;
        wrap.style.setProperty('--mx', `${px * 100}%`);
        wrap.style.setProperty('--my', `${py * 100}%`);
      };
      const leave = () => { wrap.style.transform = ''; };
      wrap.addEventListener('mousemove', move);
      wrap.addEventListener('mouseleave', leave);
      return () => {
        ro.disconnect();
        wrap.removeEventListener('mousemove', move);
        wrap.removeEventListener('mouseleave', leave);
        wrap.style.transform = '';
      };
    }
  };

  const frameCleanup = new WeakMap();
  function decorateFrame(wrap, id) {
    const old = frameCleanup.get(wrap);
    if (old) { old(); frameCleanup.delete(wrap); }
    wrap.querySelectorAll(':scope > .pf-deco').forEach(d => d.remove());
    if (id && FRAMES[id]) {
      const cleanup = FRAMES[id](wrap);
      if (cleanup) frameCleanup.set(wrap, cleanup);
    }
  }

  // SVG-SMIL-Animationen (Ektoplasma) pausieren mit der Animations-Einstellung
  function syncSmil() {
    const stop = fxOff() || fxPaused();
    document.querySelectorAll('svg.wn-ring, svg.mn-edge').forEach(s => {
      try { if (stop) s.pauseAnimations(); else s.unpauseAnimations(); } catch (e) {}
    });
  }

  // Weitere Cosmetics (z.B. die Shop-Teile aus shop-cosmetics.js) melden sich
  // hier an; schon sichtbare Elemente werden sofort nachdekoriert.
  function register(kind, id, fn) {
    if (kind === 'border') {
      BORDERS[id] = fn;
      if (document.body) document.querySelectorAll(`.cos-border.cos-${id}`).forEach(decorate);
    } else {
      FRAMES[id] = fn;
      if (document.body) document.querySelectorAll(`.pframe-${id}`).forEach(w => { w.dataset.pfDeco = id; decorateFrame(w, id); });
    }
  }

  window.TTPCos = { decorateFrame, scan, register };

  function init() {
    scan(document.body);
    // Profil-Rahmen, die gerendert wurden, bevor dieses Script geladen war
    document.querySelectorAll('.pframe').forEach(wrap => {
      const c = [...wrap.classList].find(x => x.startsWith('pframe-frame-'));
      if (c && !wrap.querySelector(':scope > .pf-deco')) { wrap.dataset.pfDeco = c.slice(7); decorateFrame(wrap, c.slice(7)); }
    });
    new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'attributes') { if (m.target.classList.contains('cos-border')) decorate(m.target); }
        else m.addedNodes.forEach(scan);
      }
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    new MutationObserver(syncSmil).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    syncSmil();
  }
  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
