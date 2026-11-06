// Hover-Vorschau fuer Cosmetics (v5.31.0, vorher nur in shop.html): Borders
// und Rahmen auf dem eigenen Profil, Themes als Mini-App mit laufender Szene
// (shop-scenes*.js / theme-fx.js). Genutzt vom Shop und vom Monats-Pass.
//
//   TTPCosPreview.bind(container, selector, getItem)
//     getItem(el) -> { id, type: 'border'|'frame'|'theme', name, themeKey } oder null
(function () {
  const css = `
  /* Hover-Vorschau: das eigene Profil mit dem Artikel */
  .pv-pop { position: fixed; z-index: 700; width: 320px; height: 200px; border-radius: 14px; overflow: visible; pointer-events: none;
    box-shadow: 0 14px 40px rgba(0,0,0,.55); border: 1px solid var(--border); opacity: 0; transform: translateY(6px); transition: opacity .15s ease, transform .15s ease; }
  .pv-pop.show { opacity: 1; transform: none; }
  .pv-pop .pv-bg { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 14px; }
  .pv-pop .pv-board { position: absolute; left: 34px; right: 34px; top: 30px; bottom: 30px; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; }
  .pv-pop .pv-card { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 9px; border: 1px solid; }
  .pv-pop .pv-card .cos-border { width: 46px; height: 46px; flex-shrink: 0; }
  .pv-pop .pv-card b { display: block; font-family: 'Cinzel', Georgia, serif; font-size: .85rem; letter-spacing: .5px; }
  .pv-pop .pv-card small { font-size: .7rem; }
  .pv-pop .pv-row { display: flex; gap: 8px; flex: 1; }
  .pv-pop .pv-row span { flex: 1; border-radius: 8px; border: 1px solid; }
  /* Theme-Vorschau: Mini-App mit echter Szene */
  .pv-pop.theme { width: 460px; height: 270px; overflow: hidden; }
  .pv-pop.theme .pv-label { bottom: 6px; z-index: 2; text-shadow: 0 1px 3px rgba(0,0,0,.8); }
  .pv-app { position: absolute; inset: 0; padding: 12px 16px; box-sizing: border-box; }
  .pv-app .nav { display: flex; gap: 3px; width: max-content; padding: 2px; border-radius: 10px; border: 1px solid; }
  .pv-app .nav i { font-style: normal; font-family: 'Cinzel', Georgia, serif; font-size: .5rem; padding: 2px 6px; border-radius: 8px; }
  .pv-app h5 { margin: 8px 0 0; text-align: center; font-family: 'Cinzel', Georgia, serif; font-size: 1.05rem; letter-spacing: 1.5px; }
  .pv-app .sub { text-align: center; font-size: .5rem; letter-spacing: 3px; font-style: italic; opacity: .8; }
  .pv-app .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
  .pv-app .box { border-radius: 7px; border: 1px solid; padding: 6px 8px; font-size: .55rem; backdrop-filter: blur(4px); }
  .pv-app .box b { display: block; font-family: 'Cinzel', Georgia, serif; font-size: .58rem; margin-bottom: 3px; }
  .pv-app .box div { display: flex; justify-content: space-between; padding: 1px 0; }
  .pv-app .box div.who { display: flex; align-items: center; justify-content: flex-start; gap: 8px; }
  .pv-app .who .cos-border { width: 22px; height: 22px; }
  .pv-pop .pv-label { position: absolute; left: 0; right: 0; bottom: -22px; text-align: center; font-size: .72rem; color: var(--text-dim); font-style: italic; }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ls = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  // Farben der Themes, die eine Vorschau bekommen koennen (Shop + Paesse)
  const PALETTE = {
    abyss: ['#03111c', '#3fd0c9', '#e2f4f6', '#12455a'], neon: ['#0b0816', '#ff4fb8', '#f2e9ff', '#3a2458'],
    starfall: ['#0a0f2a', '#ffd86b', '#e8ecff', '#2c3a6e'], koi: ['#1b1c1f', '#e0303a', '#f2f2f2', '#5a5d63'],
    desert: ['#2a1424', '#ffb35c', '#f6ece4', '#7a4a2a'], forest: ['#0a1a12', '#7ee08a', '#eaf6ec', '#2c5a38'],
    hallows: ['#0f0e10', '#ff7a18', '#ece6e0', '#3d3530'], haunted: ['#0b0a10', '#ff8a2a', '#efe9f5', '#3a2d45'],
    village: ['#0a1424', '#9fd4ff', '#eaf3ff', '#2c4566'], christmas: ['#12070a', '#f2c25a', '#fbefe2', '#5a2a26'],
    magmaplus: ['#0d0604', '#ff8a3a', '#f6e8dc', '#5a2a14'], magma: ['#0d0604', '#ff8a3a', '#f6e8dc', '#5a2a14'], cyberpunk: ['#07080c', '#e8d43a', '#e8ecf2', '#3a3a22'], aurora: ['#050a12', '#6ef0b4', '#e8f4f8', '#23485a'], lanterns: ['#120c1e', '#ffb560', '#fbefe4', '#6a3a3a'], skyisles: ['#1a2448', '#ffd27a', '#fdf6ea', '#5a6aa0'], cherry: ['#120c2a', '#ffb0cc', '#f6eef6', '#5a3a6a'], arctic: ['#16213a', '#9ad8ff', '#f2f8fc', '#3a6a8a']
  };
  const me = { icon: 'avatar-placeholder.svg', name: 'You', level: 1, border: 'none', frame: null };
  (async () => {
    try { const st = await (await fetch('/api/profile-stats')).json(); me.level = (st.level && st.level.level) || me.level; me.border = (st.equipped && st.equipped.border) || 'none'; me.frame = st.equipped && st.equipped.frame; } catch (e) {}
    // Eigenes Profil (v5.33.0): Benutzername + Profilbild statt Summoner
    if (window.ttpUsername && window.ttpUsername()) me.name = window.ttpUsername();
    if (window.ttpAvatar) me.icon = window.ttpAvatar();
  })();

  let pop = null, popTimer = null, lastPopHiddenAt = 0;
  let stopLive = null;
  function hide() { clearTimeout(popTimer); if (stopLive) { stopLive(); stopLive = null; } if (pop) { const p = pop; pop = null; lastPopHiddenAt = performance.now(); p.classList.remove('show'); setTimeout(() => p.remove(), 160); } }
  // Themes: kleine App-Ansicht mit laufender Szene statt Profil-Ausschnitt
  function themeHtml(o, bg, accent, text, line) {
    const tile = `background:color-mix(in srgb, ${bg} 62%, transparent);border-color:${line};color:${text}`;
    return `<canvas class="pv-bg"></canvas>
      <div class="pv-app">
        <div class="nav" style="border-color:${line};background:color-mix(in srgb, ${bg} 60%, transparent)"><i style="background:${accent};color:${bg}">Overview</i><i style="color:${text}">Profile</i><i style="color:${text}">Pass</i><i style="color:${text}">Shop</i></div>
        <h5 style="color:${accent};text-shadow:0 0 12px color-mix(in srgb, ${accent} 50%, transparent)">League of Legends</h5>
        <div class="sub" style="color:${text}">THREE-TRICK-PONY</div>
        <div class="cols">
          <div class="box" style="${tile}"><div class="who"><span class="cos-border cos-${me.border}"><img src="${me.icon}" alt=""></span><b style="color:${accent};margin:0">${esc(me.name)}</b></div></div>
          <div class="box" style="${tile}"><b style="color:${accent}">Today</b><div><span>First Win</span><span style="color:${accent}">+400 XP</span></div><div><span>Grinder</span><span style="color:${accent}">+250 XP</span></div></div>
        </div>
      </div>
      <div class="pv-label">The whole app in ${esc(o.name)}</div>`;
  }
  function show(anchor, o) {
    hide();
    const theme = o.type === 'theme' ? o.themeKey : null;
    const border = o.type === 'border' ? o.id : me.border;
    const frame = o.type === 'frame' ? o.id : me.frame;
    // Profilbild (v6.3.0): Vorschau mit dem neuen Bild statt des eigenen
    const icon = o.type === 'avatar' ? `avatars/${o.id}.svg` : me.icon;
    const cs = getComputedStyle(document.documentElement);
    const [bg, accent, text, line] = theme && PALETTE[theme] ? PALETTE[theme] : ['--bg', '--gold', '--text', '--border'].map(v => cs.getPropertyValue(v).trim());
    const tile = `background:color-mix(in srgb, ${bg} 70%, transparent);border-color:${line}`;
    const el = document.createElement('div');
    el.className = 'pv-pop' + (theme ? ' theme' : '');
    el.dataset.for = o.id;
    el.style.background = bg;
    if (theme) el.innerHTML = themeHtml(o, bg, accent, text, line);
    else el.innerHTML = `
      <div class="pv-board${frame ? ` pframe pframe-${frame}` : ''}">
        <div class="pv-card" style="${tile};color:${text}">
          <span class="cos-border cos-${border}"><img src="${icon}" alt=""></span>
          <span><b style="color:${accent}">${esc(me.name)}</b><small style="color:${text};opacity:.75">Level ${me.level}</small></span>
        </div>
        <div class="pv-row"><span style="${tile}"></span><span style="${tile}"></span></div>
      </div>
      <div class="pv-label">Your profile with ${esc(o.name)}</div>`;
    document.body.appendChild(el);
    const r = anchor.getBoundingClientRect();
    const pw = theme ? 460 : 320, ph = theme ? 270 : 200;
    let left = r.left + r.width / 2 - pw / 2, top = r.top - ph - 34;
    if (top < 70) top = r.bottom + 14;
    if (top + ph > innerHeight - 10) top = Math.max(10, innerHeight - ph - 10);
    left = Math.max(12, Math.min(innerWidth - pw - 12, left));
    Object.assign(el.style, { left: `${left}px`, top: `${top}px` });
    if (theme && window.TTPThemePreviewLive) stopLive = window.TTPThemePreviewLive(theme, el.querySelector('.pv-bg'));
    const board = el.querySelector('.pv-board');
    if (frame && board && window.TTPCos) window.TTPCos.decorateFrame(board, frame);
    pop = el;
    requestAnimationFrame(() => el.classList.add('show'));
  }

  function bind(container, selector, getItem) {
    container.addEventListener('mouseover', e => {
      const anchor = e.target.closest(selector);
      if (!anchor || (pop && pop.dataset.for === anchor.dataset.pvId)) return;
      const o = getItem(anchor);
      if (!o) return;
      anchor.dataset.pvId = o.id;
      clearTimeout(popTimer);
      // Von Vorschau zu Vorschau springen: sofort statt erneut 250 ms warten
      const warm = pop || performance.now() - lastPopHiddenAt < 400;
      popTimer = setTimeout(() => show(anchor, o), warm ? 0 : 250);
    });
    container.addEventListener('mouseout', e => {
      const anchor = e.target.closest(selector);
      if (anchor && !anchor.contains(e.relatedTarget)) hide();
    });
  }

  window.TTPCosPreview = { bind, show, hide };
})();
