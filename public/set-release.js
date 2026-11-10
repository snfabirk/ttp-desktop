// Three-Trick-Pony - Neues Set erschienen (v6.9.0, Nutzer 2026-11-09).
// Grosse Ankuendigung beim Start, solange es fuer ein neues Set noch Gratis-
// Booster abzuholen gibt (Server: /api/sets/release). "Claim" schreibt die
// Booster gut, die drei Packs fliegen in den Album-Reiter.
// Wird von nav.js nur nachgeladen, wenn wirklich etwas wartet.
(function () {
  if (window.TTPSetRelease) return;
  // Pack-Aussehen je Set (wie im Album; neues Set hier + in album.html SET_STYLE eintragen)
  const STYLE = {
    base: { name: 'BASE SET', band: 'BOOSTER PACK · 7 STICKERS', grad: 'linear-gradient(135deg, #3a1f6e 0%, #1c2f6b 40%, #0f5d6b 70%, #c8a96e 100%)', lib: 'stickers.js' },
    lockin: { name: 'LOCK IN', band: 'BOOSTER PACK · 7 STICKERS', grad: 'linear-gradient(150deg, #1c0306 0%, #4a0c14 38%, #7a1620 70%, #c8a96e 100%)', lib: 'stickers-lockin.js' },
    worlds: { name: 'WORLDS STAGE', band: 'BOOSTER PACK · 7 STICKERS', grad: 'linear-gradient(150deg, #0c0c10 0%, #24242c 40%, #4a4a56 70%, #d8c48a 100%)', lib: 'stickers-worlds.js' },
    ranked: { name: 'RANKED CLIMB', band: 'BOOSTER PACK · 7 STICKERS', grad: 'linear-gradient(150deg, #061214 0%, #0d3436 40%, #17605a 72%, #e0c070 100%)', lib: 'stickers-ranked.js' },
    neon: { name: 'NEON DISTRICT', band: 'SPECIAL BOOSTER · 7 STICKERS', grad: 'linear-gradient(160deg, #07080c 0%, #14161e 38%, #2a0a14 72%, #5a0a1e 100%)', lib: 'stickers-neon.js' }
  };
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const loadFile = (id, file) => new Promise(res => {
    if (window.STICKER_SETS && window.STICKER_SETS[id]) return res(window.STICKER_SETS[id]);
    if (!file) return res(null);
    const s = document.createElement('script');
    s.src = file;
    s.onload = () => res((window.STICKER_SETS || {})[id] || null);
    s.onerror = () => res(null);
    document.head.appendChild(s);
  });
  // alle Sets bauen auf stickers.js (Base) auf - das zuerst
  // (Set ohne eigene Kunst-Datei, z.B. der Test-Platzhalter: Base-Kunst)
  const loadLib = async id => { const base = await loadFile('base', STYLE.base.lib); return id === 'base' || !(STYLE[id] || {}).lib ? base : loadFile(id, STYLE[id].lib); };

  const css = document.createElement('style');
  css.textContent = `
  .srl { position: fixed; inset: 0; z-index: 9000; display: grid; place-items: center; overflow: hidden; opacity: 0; transition: opacity .6s; font-family: Georgia, serif; }
  .srl.on { opacity: 1; }
  .srl-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(40,28,70,.92), rgba(4,6,14,.97) 70%); backdrop-filter: blur(6px); }
  .srl-rays { position: absolute; left: 50%; top: 52%; width: 170vmax; height: 170vmax; margin: -85vmax 0 0 -85vmax; opacity: .22; pointer-events: none;
    background: repeating-conic-gradient(from 0deg, rgba(255,214,120,.5) 0deg 5deg, transparent 5deg 15deg); -webkit-mask: radial-gradient(circle, #000 0, transparent 42%); mask: radial-gradient(circle, #000 0, transparent 42%); animation: srlSpin 60s linear infinite; }
  .srl.special .srl-rays { background: repeating-conic-gradient(from 0deg, rgba(232,212,58,.55) 0deg 4deg, transparent 4deg 10deg, rgba(94,240,240,.4) 10deg 12deg, transparent 12deg 18deg); }
  @keyframes srlSpin { to { transform: rotate(360deg); } }
  .srl-box { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 20px; max-width: 92vw; }
  .srl-kicker { display: flex; align-items: center; gap: 14px; font: 600 .82rem 'Cinzel', Georgia, serif; letter-spacing: .35em; color: #f2d488; opacity: 0; animation: srlUp .6s .2s ease-out forwards; }
  .srl-kicker::before, .srl-kicker::after { content: ''; width: 70px; height: 1px; background: linear-gradient(90deg, transparent, #f2d488); }
  .srl-kicker::after { transform: scaleX(-1); }
  .srl-nw { margin: 10px 0 4px; filter: drop-shadow(0 4px 18px rgba(242,196,90,.35)); opacity: 0; animation: srlName .8s .35s cubic-bezier(.2,.9,.3,1.2) forwards; }
  .srl.special .srl-nw { filter: drop-shadow(-2px 0 0 rgba(94,240,240,.6)) drop-shadow(2px 0 0 rgba(255,42,74,.6)); }
  .srl-name { display: inline-block; font: 700 clamp(2.2rem, 5.4vw, 4rem)/1.1 'Cinzel', Georgia, serif; letter-spacing: .04em;
    background: linear-gradient(180deg, #fff8dc, #f2c45a 55%, #b07a1c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
  .srl.special .srl-name { background: linear-gradient(180deg, #fffbd0, #e8d43a 60%, #a8901a); -webkit-background-clip: text; background-clip: text; }
  .srl-sub { color: #cfc6b4; font-size: .95rem; opacity: 0; animation: srlUp .6s .55s ease-out forwards; }
  .srl-packs { position: relative; height: 290px; width: 520px; max-width: 92vw; margin: 26px 0 14px; }
  .srl-pk { position: absolute; left: 50%; top: 10px; width: 170px; height: 250px; margin-left: -85px; opacity: 0; filter: drop-shadow(0 18px 24px rgba(0,0,0,.6)); }
  .srl-pk .float { width: 100%; height: 100%; animation: srlFloat 3.2s ease-in-out infinite; }
  .srl-pk:nth-child(1) { --tx: -150px; --rot: -12deg; --d: .75s; } .srl-pk:nth-child(1) .float { animation-delay: -1s; }
  .srl-pk:nth-child(2) { --tx: 0px; --rot: 0deg; --d: .9s; z-index: 2; top: -4px; }
  .srl-pk:nth-child(3) { --tx: 150px; --rot: 12deg; --d: 1.05s; } .srl-pk:nth-child(3) .float { animation-delay: -2s; }
  .srl.in .srl-pk { animation: srlDrop .7s var(--d) cubic-bezier(.2,.9,.3,1.15) forwards; }
  @keyframes srlDrop { from { opacity: 0; transform: translate(var(--tx), -120px) rotate(calc(var(--rot) * -1.5)) scale(.8); } to { opacity: 1; transform: translate(var(--tx), 0) rotate(var(--rot)); } }
  @keyframes srlFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes srlUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes srlName { from { opacity: 0; transform: scale(.7); letter-spacing: .3em; } to { opacity: 1; transform: none; } }
  .srl-gift { color: #e8dfcc; font-size: 1.05rem; opacity: 0; animation: srlUp .6s 1.3s ease-out forwards; }
  .srl-gift b { color: #f2d488; font-weight: normal; font-family: 'Cinzel', Georgia, serif; font-size: 1.2rem; }
  .srl-claim { margin-top: 18px; font: 700 1.05rem 'Cinzel', Georgia, serif; letter-spacing: .08em; padding: 13px 38px; border-radius: 26px; cursor: pointer; color: #2a1a00; border: none;
    background: linear-gradient(180deg, #ffe9a0, #e8b84a 60%, #c08a20); box-shadow: 0 6px 22px rgba(232,184,74,.45), inset 0 1px 0 rgba(255,255,255,.6); opacity: 0; animation: srlUp .6s 1.5s ease-out forwards, srlGlow 2.4s 2.1s ease-in-out infinite; transition: transform .15s; }
  .srl-claim:hover:not(:disabled) { transform: translateY(-2px) scale(1.03); }
  .srl-claim:disabled { cursor: default; animation: none; opacity: .6; }
  @keyframes srlGlow { 0%, 100% { box-shadow: 0 6px 22px rgba(232,184,74,.45), inset 0 1px 0 rgba(255,255,255,.6); } 50% { box-shadow: 0 6px 34px rgba(255,214,120,.8), inset 0 1px 0 rgba(255,255,255,.6); } }
  .srl-packs.one { width: 220px; }
  /* (Nutzer) Release-Datum gross hervorgehoben */
  .srl-date { display: flex; flex-direction: column; align-items: center; margin: 12px 0 10px; padding: 10px 34px 9px; border-radius: 14px; border: 1px solid rgba(242,212,136,.55);
    background: linear-gradient(180deg, rgba(242,196,90,.16), rgba(242,196,90,.04)); box-shadow: 0 0 28px rgba(242,196,90,.22), inset 0 1px 0 rgba(255,255,255,.12); opacity: 0; animation: srlUp .6s .5s ease-out forwards; }
  .srl-date .sd-day { font: 600 .8rem 'Cinzel', Georgia, serif; letter-spacing: .32em; color: #f2d488; text-transform: uppercase; }
  .srl-date .sd-date { font: 700 2rem/1.15 'Cinzel', Georgia, serif; color: #fff4d0; text-shadow: 0 2px 14px rgba(242,196,90,.5); }
  .srl-date .sd-cd { font-size: .85rem; color: #cfc6b4; }
  .srl-date .sd-cd b { color: #f2d488; font-weight: normal; font-variant-numeric: tabular-nums; }
  .srl-packs.one .srl-pk { --tx: 0px; --rot: -4deg; --d: .75s; }
  .srl-gift small { display: block; margin-top: 6px; color: #a99f8c; font-size: .82rem; }
  .srl-sub b { color: #f2d488; font-weight: normal; font-variant-numeric: tabular-nums; }
  a.srl-claim { text-decoration: none; display: inline-block; }
  .srl-claim.signed { background: linear-gradient(180deg, #b8f0b0, #5cc46a 60%, #2f8f42); color: #072a10; opacity: 1; }
  .srl-later { margin-top: 10px; background: none; border: 0; color: #a99f8c; font: .9rem Georgia, serif; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; opacity: 0; animation: srlUp .6s 1.7s ease-out forwards; }
  .srl-later:hover { color: #e8dfcc; }
  .srl-err { min-height: 1.2em; margin-top: 8px; color: #ff8a8a; font-size: .85rem; }
  .srl-fly { position: fixed; z-index: 9001; pointer-events: none; }
  /* Mini-Pack (wie album.html .pack) */
  .srl .bp { width: 100%; height: 100%; position: relative; border-radius: 4px; font-size: 11px; overflow: hidden;
    box-shadow: inset 1.2em 0 1.6em -1.1em rgba(255,255,255,.38), inset -1.4em 0 1.8em -1.1em rgba(0,0,0,.55), inset 0 2.4em 2em -2em rgba(255,255,255,.18), inset 0 -2.4em 2em -2em rgba(0,0,0,.35);
    -webkit-mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) top / .9em .5em repeat-x, conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) bottom / .9em .5em repeat-x, linear-gradient(#000 0 0) center / 100% calc(100% - .98em) no-repeat;
    mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) top / .9em .5em repeat-x, conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) bottom / .9em .5em repeat-x, linear-gradient(#000 0 0) center / 100% calc(100% - .98em) no-repeat; }
  .srl .bp::before { content: ''; position: absolute; inset: 0; z-index: 3; pointer-events: none; background: linear-gradient(45deg, transparent 0%, transparent 14%, rgba(255,255,255,.28) 22%, rgba(255,255,255,.04) 30%, transparent 36%, transparent 50%, transparent 64%, rgba(255,255,255,.28) 72%, rgba(255,255,255,.04) 80%, transparent 86%, transparent 100%); background-size: 18em 18em; animation: srlFoil 5s linear infinite; }
  @keyframes srlFoil { from { background-position: 0 0; } to { background-position: 18em 0; } }
  .srl .bp .crimp { position: absolute; left: 0; right: 0; height: 7.5%; z-index: 2; background: repeating-linear-gradient(90deg, rgba(255,255,255,.5) 0 1px, rgba(255,255,255,.12) 1px 3px, rgba(0,0,0,.22) 3px 4px), linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,.05) 60%, rgba(0,0,0,.25)); }
  .srl .bp .crimp.top { top: 0; } .srl .bp .crimp.bot { bottom: 0; transform: scaleY(-1); }
  .srl .bp .band { position: absolute; left: 0; right: 0; bottom: 14.5%; z-index: 1; padding: .3em 0; background: rgba(0,0,0,.32); border-top: 1px solid rgba(255,255,255,.25); border-bottom: 1px solid rgba(255,255,255,.25); font-family: 'Cinzel', Georgia, serif; font-size: .72em; letter-spacing: .18em; color: #ffe9b0; }
  .srl .bp .title { position: absolute; top: 9.5%; left: 0; right: 0; font-family: 'Cinzel', Georgia, serif; color: #fff; letter-spacing: 1px; text-shadow: 0 2px 6px rgba(0,0,0,.6); font-size: 1.35em; }
  .srl .bp .title b { display: block; font-size: 1em; } .srl .bp .title small { font-size: .55em; opacity: .85; letter-spacing: 2px; }
  .srl .bp .logo { position: absolute; top: 25%; left: 0; right: 0; }
  .srl .bp .free { position: absolute; z-index: 4; right: 8%; bottom: 3.5%; padding: 1px 8px; border-radius: 8px; font: bold .8em/1.5 'Cinzel', Georgia, serif; color: #2a1a00; background: linear-gradient(180deg, #ffe9a0, #e8b84a); box-shadow: 0 1px 4px rgba(0,0,0,.5); }
  .srl .pack-fan { position: relative; height: 8.4em; }
  .srl .fan-card { position: absolute; left: 50%; top: .6em; width: 4.9em; height: 4.9em; margin-left: -2.45em; transform-origin: 50% 120%; filter: drop-shadow(0 .3em .5em rgba(0,0,0,.55)); }
  .srl .fan-card .stk-square { border: .14em solid #fff; box-sizing: border-box; border-radius: .7em; clip-path: inset(0 round .7em); }
  .srl .fan-card.f0 { transform: translateX(-1.9em) rotate(-16deg); } .srl .fan-card.f2 { transform: translateX(1.9em) rotate(16deg); } .srl .fan-card.f1 { transform: translateY(-.5em) scale(1.12); z-index: 2; }
  .srl .bp.set-neon .title, .srl .bp.set-neon .band { font-family: Bahnschrift, 'Arial Narrow', sans-serif; font-weight: 700; text-transform: uppercase; }
  .srl .bp.set-neon .title { color: #e8d43a; letter-spacing: .5px; text-shadow: -1px 0 #5ef0f0, 1px 0 #ff2a4a, 0 2px 6px rgba(0,0,0,.7); }
  .srl .bp.set-neon .band { background: #e8d43a; color: #06070b; border-color: #06070b; }
  html.fx-off .srl *, html.fx-paused .srl .srl-rays, html.fx-paused .srl .float, html.fx-paused .srl .bp::before { animation-play-state: paused; }`;
  document.head.appendChild(css);

  function packHtml(id, name, L, free = true) {
    const st = STYLE[id] || { grad: 'linear-gradient(135deg, #5a3a10, #c8a96e)', band: 'BOOSTER PACK · 7 STICKERS' };
    let fan = '';
    if (L) {
      const an = L.SET.filter(s => s.r === 'anim'), cls = an.length === 2 ? ['f0', 'f2'] : ['f0', 'f1', 'f2'];
      fan = `<div class="pack-fan">${an.map((s, i) => `<div class="fan-card ${cls[i] || ''}">${L.square(s)}</div>`).join('')}</div>`;
    }
    return `<div class="bp set-${esc(id)}" style="background:${st.grad}"><div class="crimp top"></div><div class="title"><b>Three-Trick-Pony</b><small>${esc(st.name || String(name).toUpperCase())}</small></div>
      <div class="logo">${fan}</div><div class="band">${esc(st.band)}</div>${free ? '<span class="free">FREE</span>' : ''}<div class="crimp bot"></div></div>`;
  }

  const post = async (url, body) => {
    try { return await (await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json(); }
    catch (e) { return { ok: false, error: 'Could not reach the app server.' }; }
  };
  // Release-Zeitpunkt (Mittwoch 00:00 deutscher Zeit) in der Ortszeit des Nutzers
  const dayName = at => new Date(at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const countdown = at => { let t = Math.max(0, Math.floor((at - Date.now()) / 1000)); const d = Math.floor(t / 86400); t %= 86400; const h = Math.floor(t / 3600); t %= 3600; const m = Math.floor(t / 60); return `${d ? `${d}d ` : ''}${h}h ${m}m`; };
  function overlay(cls, inner) {
    const ov = document.createElement('div');
    ov.className = `srl ${cls}`;
    ov.innerHTML = `<div class="srl-bg"></div><div class="srl-rays"></div><div class="srl-box" role="dialog">${inner}</div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('on', 'in')));
    return ov;
  }
  const closeOv = (ov, done) => { ov.classList.remove('on'); setTimeout(() => { ov.remove(); done(); }, 650); };

  // (v6.10.0, Nutzer) Ankuendigung 1 Woche vorher: so sieht der Booster aus, Termin,
  // und man kann sich fuer die Gratis-Booster "anmelden"
  async function showTeaser(t) {
    const L = await loadLib(t.id);
    const ov = overlay('teaser', `
        <div class="srl-kicker">NEW SET · COMING ${new Date(t.at).getDay() === 3 ? 'WEDNESDAY' : 'SOON'}</div>
        <div class="srl-nw"><span class="srl-name">${esc(t.name)}</span></div>
        <div class="srl-date"><span class="sd-day">${esc(new Date(t.at).toLocaleDateString('en-GB', { weekday: 'long' }))}</span><span class="sd-date">${esc(new Date(t.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }))}</span><span class="sd-cd">in <b class="srl-cd">${countdown(t.at)}</b></span></div>
        <div class="srl-sub">${t.total}+ new stickers to collect</div>
        <div class="srl-packs one"><div class="srl-pk"><div class="float">${packHtml(t.id, t.name, L, false)}</div></div></div>
        <div class="srl-gift">${t.signedUp ? `You are on the list - come back on ${esc(dayName(t.at))} to claim your <b>${t.qty} free boosters</b>` : `Sign up now and get <b>${t.qty} boosters</b> for free on release day`}</div>
        <button type="button" class="srl-claim srl-sign${t.signedUp ? ' signed' : ''}"${t.signedUp ? ' disabled' : ''}>${t.signedUp ? '✓ You are signed up' : `Sign me up for ${t.qty} free boosters`}</button>
        <button type="button" class="srl-later"${t.signedUp ? ' hidden' : ''}>Not now</button>
        <div class="srl-err"></div>`);
    const tick = setInterval(() => { const c = ov.querySelector('.srl-cd'); if (c) c.textContent = countdown(t.at); }, 30000);
    return new Promise(done => {
      const sign = ov.querySelector('.srl-sign');
      sign.addEventListener('click', async () => {
        sign.disabled = true;
        const r = await post('/api/sets/release/signup', { set: t.id });
        if (!r.ok) { ov.querySelector('.srl-err').textContent = r.error || 'Something went wrong.'; sign.disabled = false; return; }
        sign.textContent = '✓ You are signed up';
        sign.classList.add('signed');
        ov.querySelector('.srl-gift').innerHTML = `Done! Come back on ${esc(dayName(t.at))} to claim your <b>${t.qty} free boosters</b>`;
        window.dispatchEvent(new CustomEvent('ttp:release-signup', { detail: { set: t.id } }));
        fadeAway();
      });
      // (Nutzer) kein Close-Knopf nach der Anmeldung: kurz lesen lassen, dann blendet es aus
      let gone = false;
      const finish = async () => { if (gone) return; gone = true; clearInterval(tick); await post('/api/sets/release/seen', { set: t.id, kind: 'teaser' }); closeOv(ov, done); };
      const fadeAway = () => { ov.querySelector('.srl-later').hidden = true; setTimeout(finish, 2000); };
      ov.querySelector('.srl-later').addEventListener('click', finish);
      if (t.signedUp) fadeAway();
    });
  }

  async function show(set) {
    const L = await loadLib(set.id);
    // nicht angemeldet: nur die Neuigkeit, Booster gibt es im Shop
    if (!set.signedUp) {
      const ov = overlay(set.special ? 'special' : '', `
        <div class="srl-kicker">${set.special ? 'NEW SPECIAL SET' : 'NEW SET RELEASED'}</div>
        <div class="srl-nw"><span class="srl-name">${esc(set.name)}</span></div>
        <div class="srl-sub">${set.total}+ new stickers to collect · in your Album</div>
        <div class="srl-packs one"><div class="srl-pk"><div class="float">${packHtml(set.id, set.name, L, false)}</div></div></div>
        <div class="srl-gift">Boosters are in the shop now.<small>You missed the sign-up for free boosters this time - watch out for the next announcement!</small></div>
        <a class="srl-claim" href="shop.html">To the shop</a>
        <button type="button" class="srl-later">Close</button>`);
      return new Promise(done => {
        const seen = () => post('/api/sets/release/seen', { set: set.id, kind: 'release' });
        ov.querySelector('a.srl-claim').addEventListener('click', e => { e.preventDefault(); seen().then(() => { location.href = 'shop.html'; }); });
        ov.querySelector('.srl-later').addEventListener('click', async () => { await seen(); closeOv(ov, done); });
      });
    }
    const ov = overlay(set.special ? 'special' : '', `
        <div class="srl-kicker">${set.special ? 'NEW SPECIAL SET' : 'NEW SET RELEASED'}</div>
        <div class="srl-nw"><span class="srl-name">${esc(set.name)}</span></div>
        <div class="srl-sub">${set.total}+ new stickers to collect${set.special ? ' · in your Special Album' : ' · in your Album'}</div>
        <div class="srl-packs">${[0, 1, 2].slice(0, set.qty).map(() => `<div class="srl-pk"><div class="float">${packHtml(set.id, set.name, L)}</div></div>`).join('')}</div>
        <div class="srl-gift">You signed up - here are your <b>${set.qty} free boosters</b></div>
        <button type="button" class="srl-claim">Claim ${set.qty} boosters</button>
        <button type="button" class="srl-later">Later</button>
        <div class="srl-err"></div>`);
    return new Promise(done => {
      const btn = ov.querySelector('.srl-claim'), laterBtn = ov.querySelector('.srl-later');
      // "Later": nur fuer diese Sitzung weg - abholen geht bis 30 Tage nach Release
      laterBtn.addEventListener('click', () => { later.add(set.id); closeOv(ov, done); });
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        laterBtn.style.visibility = 'hidden';
        const r = await post('/api/sets/release/claim', { set: set.id });
        if (!r.ok) { ov.querySelector('.srl-err').textContent = r.error || 'Something went wrong.'; btn.disabled = false; laterBtn.style.visibility = ''; return; }
        btn.textContent = 'Added to your binder!';
        // Packs fliegen in den Binder (Booster-Slot im Album) bzw. auf den Album-Reiter
        const slot = document.getElementById('pack');
        const toSlot = !!(slot && slot.offsetParent);
        const tab = toSlot ? slot : document.querySelector('a[href="album.html"]');
        const to = tab ? tab.getBoundingClientRect() : { left: innerWidth / 2, top: 0, width: 0, height: 0 };
        const packs = [...ov.querySelectorAll('.srl-pk')];
        await Promise.all(packs.map((pk, i) => new Promise(res => {
          const r0 = pk.getBoundingClientRect();
          const fly = pk.cloneNode(true);
          fly.className = 'srl-fly';
          Object.assign(fly.style, { left: `${r0.left}px`, top: `${r0.top}px`, width: `${r0.width}px`, height: `${r0.height}px` });
          fly.querySelector('.float').style.animation = 'none';
          ov.appendChild(fly);
          pk.style.visibility = 'hidden';
          const dx = to.left + to.width / 2 - (r0.left + r0.width / 2), dy = to.top + to.height / 2 - (r0.top + r0.height / 2);
          const end = toSlot ? Math.max(.2, to.width / r0.width) : .08;
          const a = fly.animate([
            { transform: 'none', opacity: 1 },
            { transform: `translate(${dx * .3}px, ${dy * .3 - 60}px) rotate(${(i - 1) * 20}deg) scale(.75)`, opacity: 1, offset: .35 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${(i - 1) * (toSlot ? 6 : 40)}deg) scale(${end})`, opacity: toSlot ? .9 : .3 }
          ], { duration: 820, delay: i * 160, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' });
          a.onfinish = () => {
            fly.remove();
            if (tab) tab.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 300 });
            res();
          };
        })));
        if (window.TTPNav && window.TTPNav.refreshBoosters) window.TTPNav.refreshBoosters();
        window.dispatchEvent(new CustomEvent('ttp:boosters'));
        closeOv(ov, done);
      });
    });
  }

  const later = new Set();
  let busy = false;
  window.TTPSetRelease = {
    // nav.js ruft das beim Laden, jede Minute und beim Zurueckkommen (Standby/Tray) auf
    async check(d) {
      if (busy || document.hidden) return;
      busy = true;
      try {
        if (!d) { try { d = await (await fetch('/api/sets/release')).json(); } catch (e) { return; } }
        for (const set of ((d && d.pending) || []).filter(x => !later.has(x.id))) await show(set);
        if (d && d.teaser && !d.teaser.seen) await showTeaser(d.teaser);
      } finally { busy = false; }
    }
  };
})();
