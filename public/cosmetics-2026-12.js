// Dezember-Pass 2026 (v6.4.0) - Designs aus theme-lab/2026-12-winter.html und
// theme-lab/2026-12-christmas-3d.html (vom Nutzer abgenommen).
//   Stufe 5  Border "Frost Ring"   - Eisring mit Eisblumen, Eiszapfen, Funkeln
//   Stufe 10 Rahmen "Snowdrift"    - Schnee liegt auf der Oberkante, Eiszapfen, bereifte Ecken
//   Stufe 20 Border "Garland Ring" - Tannenzweige, Lauflicht, Kugeln, Samtschleife
//   Stufe 25 Rahmen "Fireside"     - Kaminschein, Girlande: Lichter + Kugeln nur bei Hover, 3D-Neigung
// CSS steht in cosmetics.css ("Dezember-Pass 2026"); Animationen folgen dort
// der Einstellung "Animations" (html.fx-off / html.fx-paused).
(function () {
  if (!window.TTPCos || window.TTPCos2612) return;
  window.TTPCos2612 = true;
  let uid = 0;
  const fxOff = () => document.documentElement.classList.contains('fx-off');
  const editing = () => document.body.classList.contains('editing');
  const WARM = ['#ffd27a', '#ffb347', '#ff6a4a', '#fff2c4', '#7ad2ff'];

  // ----- Stufe 5: Frost Ring -----
  TTPCos.register('border', 'border-2026-12-frost', el => {
    const n = ++uid;
    const fern = `fr-fern${n}`;
    el.insertAdjacentHTML('beforeend', `<svg class="cos-deco fr-ring" viewBox="-72 -72 144 144" aria-hidden="true">
      <defs>
        <linearGradient id="fr-ring${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#bfe2ff"/><stop offset="1" stop-color="#5e9bd1"/></linearGradient>
        <linearGradient id="fr-ice${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f9ff"/><stop offset="1" stop-color="#9fd0f5" stop-opacity=".15"/></linearGradient>
        <g id="${fern}"><path d="M0 0 L0 -14 M0 -4 L-4 -8 M0 -4 L4 -8 M0 -8 L-3 -11 M0 -8 L3 -11 M0 -11 L-2 -13 M0 -11 L2 -13" stroke="#f4fbff" stroke-width="1.1" stroke-linecap="round" fill="none"/></g>
      </defs>
      <circle r="52" fill="none" stroke="url(#fr-ring${n})" stroke-width="6"/>
      <circle r="55.5" fill="none" stroke="#e8f5ff" stroke-width="1" opacity=".7"/>
      <circle r="48.5" fill="none" stroke="#3e78ad" stroke-width="1.2" opacity=".6"/>
      <g opacity=".95">
        <use href="#${fern}" transform="rotate(-150) translate(0 -50) rotate(20)"/><use href="#${fern}" transform="rotate(-120) translate(0 -51) rotate(-15)"/>
        <use href="#${fern}" transform="rotate(-60) translate(0 -50) rotate(25)"/><use href="#${fern}" transform="rotate(-25) translate(0 -51) rotate(-20)"/>
        <use href="#${fern}" transform="rotate(30) translate(0 -50) rotate(18)"/><use href="#${fern}" transform="rotate(150) translate(0 -51) rotate(-25)"/>
        <use href="#${fern}" transform="rotate(-95) translate(0 -52) scale(1.3)"/>
      </g>
      <g fill="url(#fr-ice${n})" stroke="#e9f6ff" stroke-width=".6">
        <path d="M-26 46 L-23 60 L-20 47 Z"/><path d="M-14 50 L-10 68 L-6 51 Z"/><path d="M-2 52 L1 62 L4 52 Z"/><path d="M8 51 L12 70 L16 50 Z"/><path d="M20 48 L23 58 L26 46 Z"/>
      </g>
      <path class="fr-glint" d="M-40 -34 L-38 -40 L-36 -34 L-30 -32 L-36 -30 L-38 -24 L-40 -30 L-46 -32 Z" fill="#fff"/>
    </svg>`);
  });

  // ----- Stufe 20: Garland Ring -----
  TTPCos.register('border', 'border-2026-12-garland', el => {
    const n = ++uid;
    const f = v => v.toFixed(1);
    let s = `<defs>
      <linearGradient id="gr-n${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3f8f4c"/><stop offset="1" stop-color="#14451f"/></linearGradient>
      <radialGradient id="gr-v${n}" cx=".4" cy=".35"><stop offset="0" stop-color="#ff4a3e"/><stop offset=".6" stop-color="#b8231f"/><stop offset="1" stop-color="#5e0d0b"/></radialGradient></defs><g>`;
    for (let i = 0; i < 46; i++) {
      const a = i / 46 * 6.283, r = 50 + (i % 3) * 2, rot = a * 57.3 + 90 + (i % 2 ? 25 : -25);
      s += `<path d="M0 -11 C3 -6 3 2 0 11 C-3 2 -3 -6 0 -11 Z" fill="url(#gr-n${n})" opacity=".95" transform="translate(${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}) rotate(${f(rot)})"/>`;
    }
    for (let i = 0; i < 30; i++) {
      const a = i / 30 * 6.283 + 0.1, r = 57;
      s += `<path d="M0 -7 L0 7 M-3 -4 L0 0 L3 -4 M-3 2 L0 6 L3 2" stroke="#2a6e36" stroke-width="1" fill="none" transform="translate(${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}) rotate(${f(a * 57.3)})"/>`;
    }
    s += '</g>';
    // Lauflicht: CSS-Animation mit Versatz pro Birne (steht bei "Animations: Off")
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * 6.283, x = f(Math.cos(a) * 54), y = f(Math.sin(a) * 54), c = WARM[i % 4], d = `animation-delay:${(-i * 0.304).toFixed(2)}s`;
      s += `<circle class="gr-halo" cx="${x}" cy="${y}" r="6" fill="${c}" style="${d}"/><circle class="gr-bulb" cx="${x}" cy="${y}" r="2.2" fill="${c}" style="${d}"/>`;
    }
    [[150, '#f2c25a'], [215, '#1f5a8a'], [-30, '#b8231f'], [30, '#f2c25a'], [100, '#b8231f']].forEach(([deg, c]) => {
      const a = deg / 57.3, x = Math.cos(a) * 58, y = Math.sin(a) * 58;
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="7" fill="${c}" stroke="#2a1208" stroke-width="1"/><circle cx="${f(x - 2.4)}" cy="${f(y - 2.4)}" r="2" fill="#fff" opacity=".75"/>`;
    });
    s += `<g transform="translate(0 -58)"><path d="M0 0 C-10 -14 -26 -10 -22 2 C-18 12 -6 8 0 0 C6 8 18 12 22 2 C26 -10 10 -14 0 0 Z" fill="url(#gr-v${n})" stroke="#3a0806" stroke-width="1.2"/>
      <path d="M0 0 L-8 20 L-3 18 L-2 24 Z M0 0 L8 20 L3 18 L2 24 Z" fill="#b8231f" stroke="#3a0806" stroke-width="1"/>
      <circle r="4" fill="#d82a24" stroke="#3a0806" stroke-width="1"/><path d="M-16 -2 C-12 -6 -8 -6 -5 -3" stroke="#ff8a7a" stroke-width="1.2" fill="none" opacity=".7"/></g>`;
    el.insertAdjacentHTML('beforeend', `<svg class="cos-deco gr-ring" viewBox="-80 -80 160 160" aria-hidden="true">${s}</svg>`);
  });

  // ----- Stufe 10: Snowdrift -----
  TTPCos.register('frame', 'frame-2026-12-snowdrift', wrap => {
    const n = ++uid;
    const pile = document.createElement('div');
    pile.className = 'pf-deco sd-pile';
    pile.setAttribute('aria-hidden', 'true');
    wrap.append(pile, Object.assign(document.createElement('div'), { className: 'pf-deco sd-frost l' }), Object.assign(document.createElement('div'), { className: 'pf-deco sd-frost r' }));
    // Pixelgenau (statt gestreckt), damit Eiszapfen auch auf breiten Profilen spitz bleiben
    const layout = () => {
      const W = Math.max(60, pile.offsetWidth || wrap.offsetWidth + 16);
      const bumps = Math.max(3, Math.round(W / 76)), step = W / bumps;
      let top = `M0 26 C${(step * 0.1).toFixed(1)} 14 ${(step * 0.4).toFixed(1)} 12 ${(step * 0.5).toFixed(1)} 16`;
      for (let i = 0; i < bumps; i++) {
        const x0 = i * step + step * 0.5, x1 = x0 + step;
        top += ` C${(x0 + step * 0.25).toFixed(1)} ${6 + (i % 2) * 2} ${(x0 + step * 0.7).toFixed(1)} ${7 + (i % 3)} ${Math.min(W, x1).toFixed(1)} ${14 + (i % 2) * 2}`;
      }
      top += ` L${W} 34`;
      for (let i = bumps * 2; i >= 0; i--) top += ` L${(i / (bumps * 2) * W).toFixed(1)} ${32 + (i % 2) * 2}`;
      top += ' Z';
      let ice = '';
      for (let x = 40, k = 0; x < W - 20; x += 44 + (k % 3) * 9, k++) {
        const w = 3 + (k % 3), h = 8 + ((k * 7) % 11);
        ice += `<path d="M${x - w} 32 L${x} ${32 + h} L${x + w} 32 Z"/>`;
      }
      pile.innerHTML = `<svg width="${W}" height="48" viewBox="0 0 ${W} 48" aria-hidden="true">
        <defs><linearGradient id="sd-p${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e3eef9"/><stop offset="1" stop-color="#b9cfe6"/></linearGradient>
        <linearGradient id="sd-i${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f5ff" stop-opacity=".95"/><stop offset="1" stop-color="#a9d2f5" stop-opacity=".2"/></linearGradient></defs>
        <g class="sd-ice" fill="url(#sd-i${n})">${ice}</g>
        <path d="${top}" fill="url(#sd-p${n})"/>
        <path class="sd-sparkle" d="${top.split(' L')[0]}" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9"/>
      </svg>`;
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    return () => ro.disconnect();
  });

  // ----- Stufe 25: Fireside -----
  TTPCos.register('frame', 'frame-2026-12-fireside', wrap => {
    const n = ++uid;
    const hearth = document.createElement('div');
    hearth.className = 'pf-deco fs-hearth';
    const gar = document.createElement('div');
    gar.className = 'pf-deco fs-garland';
    gar.setAttribute('aria-hidden', 'true');
    wrap.append(hearth, gar);
    const layout = () => {
      const W = Math.max(80, gar.offsetWidth || wrap.offsetWidth + 20);
      const span = W / Math.max(2, Math.round(W / 125)), sag = x => 14 + Math.abs(Math.sin((x / span) * Math.PI)) * 18;
      let d = 'M0 14';
      for (let x = 0; x < W - 1; x += span) d += ` Q${(x + span / 2).toFixed(1)} 36 ${(x + span).toFixed(1)} 14`;
      let s = `<defs><linearGradient id="fs-n${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8a48"/><stop offset="1" stop-color="#123d1c"/></linearGradient></defs>
        <path d="${d}" fill="none" stroke="url(#fs-n${n})" stroke-width="14" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="#5aa864" stroke-width="2" stroke-dasharray="2 5" opacity=".7"/>`;
      let i = 0;
      for (let x = 12; x < W; x += 24, i++) {
        const y = sag(x) + 4, c = WARM[i % 4];
        s += `<g class="fs-light" style="--i:${i}"><circle cx="${x}" cy="${y.toFixed(1)}" r="7" fill="${c}" opacity=".35"/><circle cx="${x}" cy="${y.toFixed(1)}" r="2.8" fill="${c}"/></g>`;
      }
      const ORN = ['#b8231f', '#f2c25a', '#1f5a8a'];
      let k = 0;
      for (let x = span / 2; x < W; x += span / 2, k++) {
        const y = sag(x), c = ORN[k % 3];
        s += `<g class="fs-orn" style="--i:${k}"><line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + 10).toFixed(1)}" stroke="#c9a24a" stroke-width="1.2"/><circle cx="${x.toFixed(1)}" cy="${(y + 17).toFixed(1)}" r="7" fill="${c}" stroke="#2a1208" stroke-width="1"/><circle cx="${(x - 2.4).toFixed(1)}" cy="${(y + 14.6).toFixed(1)}" r="2" fill="#fff" opacity=".75"/></g>`;
      }
      [0, W].forEach(x => { s += `<g transform="translate(${x} 12)"><path d="M0 0 C-8 -10 -20 -7 -17 2 C-14 9 -5 6 0 0 C5 6 14 9 17 2 C20 -7 8 -10 0 0 Z" fill="#c8261f" stroke="#3a0806"/><circle r="3" fill="#e63a2e"/></g>`; });
      gar.innerHTML = `<svg width="${W}" height="56" viewBox="0 0 ${W} 56">${s}</svg>`;
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    // leichte 3D-Neigung (nicht im Bearbeiten-Modus - dort wird gezogen)
    const move = e => {
      if (editing() || fxOff()) { wrap.style.transform = ''; return; }
      const r = wrap.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      // grosse Profilflaeche: schwaecher neigen als im Entwurf
      const k = r.width > 600 ? 2.5 : 6;
      wrap.style.transform = `perspective(1400px) rotateY(${dx * k}deg) rotateX(${-dy * k}deg)`;
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
  });
})();
