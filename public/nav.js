// (v6.11.0) Der Hauptprozess fragt jede Minute neue Spiele ab und meldet sich
// danach ('stats-refreshed'). Seiten melden sich hier an und laden nur neu,
// wenn sich wirklich etwas getan hat (neues Spiel / XP / LP Bank) - sonst
// wuerde jede Minute neu gerendert. Ist das Fenster versteckt (Tray), wird
// das Nachladen aufgehoben, bis es wieder sichtbar ist.
(function () {
  const subs = [];
  let lastSig = null, pending = false, hooked = false;
  const sig = d => JSON.stringify([d.totalXp, (d.recentGames || []).map(g => g.matchId), d.lpBank && d.lpBank.progress, d.lpBank && d.lpBank.fills, d.dailyResetAt, d.weeklyResetAt]);
  const fire = () => { pending = false; subs.forEach(cb => { try { cb(); } catch (e) {} }); };
  async function check() {
    try {
      const s = sig(await (await fetch('/api/progression')).json());
      const changed = lastSig !== null && s !== lastSig;
      lastSig = s;
      if (!changed) return;
      if (document.hidden) pending = true; else fire();
    } catch (e) {}
  }
  window.ttpOnStatsChanged = cb => {
    subs.push(cb);
    if (hooked || !window.ttpMain || !window.ttpMain.onStatsRefreshed) return;
    hooked = true;
    check(); // Ausgangsstand merken
    window.ttpMain.onStatsRefreshed(check);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && pending) fire(); });
  };
})();

// Immer aktuelle Riot-Bilder (v5.32.0, Nutzer: neues Profilbild war blank,
// weil die Data-Dragon-Version fest auf 16.17.1 stand): neueste Version aus
// versions.json, einmal pro Tag geholt und gemerkt. Profilbilder kommen von
// CommunityDragon "latest" - dort sind neue Icons sofort, Data Dragon nur als
// Ersatz, falls ein Bild dort fehlt.
(function () {
  const FALLBACK = '16.22.1';
  let v = FALLBACK;
  try { v = localStorage.getItem('ttp_dd_version') || FALLBACK; } catch (e) {}
  window.TTP_DDRAGON_VERSION = v;
  // Eigenes Profil (v5.33.0): Benutzername statt Summoner-Name, Profilbild
  // vorerst ein Platzhalter (spaeter Shop-Cosmetic).
  window.ttpUsername = () => { try { return localStorage.getItem('ttp_username') || ''; } catch (e) { return ''; } };
  window.ttpAvatar = () => {
    let id = '';
    try { id = localStorage.getItem('ttp_avatar') || ''; } catch (e) {}
    return id ? `avatars/${id}.svg` : 'avatar-placeholder.svg';
  };
  window.ttpProfileIcon = id => `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${id}.jpg`;
  let last = 0;
  try { last = Number(localStorage.getItem('ttp_dd_version_at')) || 0; } catch (e) {}
  if (Date.now() - last > 12 * 3600000) {
    fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then(r => r.json())
      .then(list => {
        if (!Array.isArray(list) || !list[0]) return;
        try { localStorage.setItem('ttp_dd_version', list[0]); localStorage.setItem('ttp_dd_version_at', String(Date.now())); } catch (e) {}
      }).catch(() => {});
  }
  // Bild fehlt bei CommunityDragon -> Data Dragon, fehlt es in einer alten
  // Data-Dragon-Version -> neueste Version versuchen.
  document.addEventListener('error', e => {
    const img = e.target;
    if (!img || img.tagName !== 'IMG' || img.dataset.ddRetry) return;
    const src = img.getAttribute('src') || '';
    const cd = src.match(/communitydragon\.org\/.*\/profile-icons\/(\d+)\.jpg/);
    if (cd) { img.dataset.ddRetry = '1'; img.src = `https://ddragon.leagueoflegends.com/cdn/${window.TTP_DDRAGON_VERSION}/img/profileicon/${cd[1]}.png`; return; }
    const dd = src.match(/^(https:\/\/ddragon\.leagueoflegends\.com\/cdn\/)([\d.]+)(\/.*)$/);
    let latest = '';
    try { latest = localStorage.getItem('ttp_dd_version') || ''; } catch (err) {}
    if (dd && latest && dd[2] !== latest) { img.dataset.ddRetry = '1'; img.src = dd[1] + latest + dd[3]; }
  }, true);
})();

// Feste Hauptleiste oben links (v5.6.0, Nutzerwunsch 2026-10-09): ersetzt die
// "Zurueck"-Pfeile - die Overview ist die Kernseite, nicht "Seite 2" einer
// Kette. Wird von jeder Seite per <script src="nav.js"> eingebunden und
// markiert die aktive Seite. Unterseiten (Trophies, Roles & Picks, Champion) gehoeren
// zur Challenge.
(function () {
  // Hauptseiten (Nutzerwunsch 2026-10-09): Overview ist die Startseite und
  // immer hervorgehoben. Setup ist KEIN Leisten-Eintrag
  // mehr, sondern ein eigener Text-Knopf oben rechts neben den Patch Notes.
  const ITEMS = [
    { href: 'overview.html', label: 'Overview', home: true, title: 'Home' },
    { href: 'profile.html', label: 'Profile' },
    { href: 'album.html', label: 'Album' },
    // Trophies sind challenge-gebunden (v5.32.0) - kein eigener Eintrag mehr,
    // nur ueber die Challenge-Seite erreichbar.
    { href: 'challenge.html', label: 'Challenge', also: ['role.html', 'champion.html', 'trophies.html'] },
    { href: 'challenge.html?view=pass', label: 'Pass' },
    { href: 'shop.html', label: 'Shop' }
  ];

  // Unterseiten bekommen zusaetzlich einen Zurueck-Knopf zur uebergeordneten
  // Seite (Nutzerwunsch: fuehlt sich dort intuitiver an als nur die Leiste).
  const PARENTS = {
    'role.html': { href: 'challenge.html', label: 'Challenge' },
    'champion.html': { href: 'challenge.html', label: 'Challenge' },
    'trophies.html': { href: 'challenge.html', label: 'Challenge' }
  };

  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  // Ohne Anmeldung gibt es nur die Login-Seite (v5.33.0)
  if (file !== 'login.html') {
    let signedIn = false;
    try { signedIn = !!localStorage.getItem('ttp_signed_in'); } catch (e) {}
    if (!signedIn) { location.replace('login.html'); return; }
  }
  const isPass = file === 'challenge.html' && new URLSearchParams(location.search).get('view') === 'pass';

  function isActive(item) {
    if (!item.href) return false;
    if (item.label === 'Pass') return isPass;
    if (item.label === 'Challenge') return (file === 'challenge.html' && !isPass) || item.also.includes(file);
    return item.href === file;
  }

  function build() {
    const nav = document.createElement('nav');
    nav.className = 'top-nav';
    nav.setAttribute('aria-label', 'Main navigation');
    nav.innerHTML = ITEMS.map(item => {
      if (item.soon) return `<span class="top-nav-link soon" title="${item.title}" aria-disabled="true">${item.label}</span>`;
      const cls = `top-nav-link${item.home ? ' home' : ''}${isActive(item) ? ' active' : ''}`;
      return `<a href="${item.href}" class="${cls}"${item.title ? ` title="${item.title}"` : ''}>${item.home ? '<span class="home-ic" aria-hidden="true">⌂</span>' : ''}${item.label}</a>`;
    }).join('');
    document.body.prepend(nav);

    // Album-Reiter: Zahl der NEU hinzugekommenen Booster seit dem letzten
    // Album-Besuch (v6.6.0, Nutzerwunsch). Auf der Album-Seite selbst wird der
    // Zaehler zurueckgesetzt; Shop/Pass rufen TTPNav.refreshBoosters() auf.
    const albumLink = nav.querySelector('a[href="album.html"]');
    if (albumLink) {
      const nb = document.createElement('b');
      nb.className = 'nav-badge'; nb.hidden = true;
      albumLink.appendChild(nb);
      const show = n => { nb.hidden = !n; nb.textContent = n > 99 ? '99+' : `+${n}`; albumLink.title = n ? `${n} new booster${n > 1 ? 's' : ''}` : ''; };
      const refresh = () => fetch(file === 'album.html' ? '/api/boosters/seen' : '/api/boosters/new', file === 'album.html' ? { method: 'POST' } : undefined)
        .then(r => r.json()).then(d => show(d.newBoosters || 0)).catch(() => {});
      window.TTPNav = Object.assign(window.TTPNav || {}, { refreshBoosters: refresh });
      refresh();

      // Neues Set erschienen (v6.9.0): grosse Ankuendigung + Gratis-Booster
      // abholen - das Skript wird nur nachgeladen, wenn wirklich etwas wartet
      // (v6.10.0) + Ankuendigung 1 Woche vorher. Die App laeuft oft tagelang (Tray,
      // Standby) - deshalb jede Minute und beim Zurueckkommen erneut nachsehen
      let relLoading = null;
      const relCheck = () => {
        if (document.hidden) return;
        fetch('/api/sets/release').then(r => r.json()).then(d => {
          const want = d && ((d.pending && d.pending.length) || (d.teaser && !d.teaser.seen));
          if (!want) return;
          if (window.TTPSetRelease) return window.TTPSetRelease.check(d);
          if (relLoading) return;
          relLoading = document.createElement('script');
          relLoading.src = 'set-release.js';
          relLoading.onload = () => window.TTPSetRelease && window.TTPSetRelease.check();
          document.head.appendChild(relLoading);
        }).catch(() => {});
      };
      relCheck();
      setInterval(relCheck, 60000);
      document.addEventListener('visibilitychange', relCheck);
      window.addEventListener('focus', relCheck);

      // Geschenkte Booster (v6.6.0): beim Laden/Fokus abholen (hoechstens alle
      // 30 s), dann ein Hinweisfenster je Absender; zaehlen fuer den Zaehler mit.
      let lastClaim = 0;
      const giftEsc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const showGifts = gifts => {
        const names = { base: 'Base Set', lockin: 'Lock In', worlds: 'Worlds Stage', ranked: 'Ranked Climb', neon: 'Neon District' };
        const byFrom = {};
        gifts.forEach(g => { (byFrom[g.from] = byFrom[g.from] || []).push(g); });
        const lines = Object.entries(byFrom).map(([from, list]) => `<div class="gift-in-line"><b>${giftEsc(from)}</b> sent you ${list.map(g => `${g.qty}× ${giftEsc(g.setName || names[g.set] || g.set)}`).join(', ')} booster${list.reduce((a, g) => a + g.qty, 0) > 1 ? 's' : ''}${list.filter(g => g.message).map(g => `<q>${giftEsc(g.message)}</q>`).join('')}</div>`).join('');
        const ov = document.createElement('div'); ov.className = 'gift-in';
        ov.innerHTML = `<div class="gift-in-box" role="dialog" aria-label="You got a gift"><div class="gift-in-ic">🎁</div><h3>You got a gift!</h3>${lines}
          <div class="gift-in-btns">${file === 'album.html' ? '' : '<a class="gift-in-go" href="album.html">Open Album</a>'}<button type="button" class="gift-in-ok">${file === 'album.html' ? 'Nice!' : 'Later'}</button></div></div>`;
        document.body.appendChild(ov);
        requestAnimationFrame(() => ov.classList.add('on'));
        const close = () => { ov.classList.remove('on'); setTimeout(() => ov.remove(), 250); };
        ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('.gift-in-ok')) close(); });
      };
      // Runder Geschenk-Knopf neben dem Summoner-Umschalter (Nutzerdesign):
      // erscheint + pulsiert wie "What's New", sobald ein Freund etwas schickt
      // (Live ueber /api/events); Klick holt die Geschenke ab.
      // Hinweis-Leiste neben dem Summoner-Umschalter: 🎁 Geschenke, ⇄ Tausch
      // (v6.6.0) - beide erscheinen nur, wenn etwas wartet, und pulsieren.
      const dock = document.createElement('div');
      dock.className = 'notice-dock';
      const mkPill = (icon, cls) => { const b = document.createElement('button'); b.type = 'button'; b.className = `gift-pill ${cls}`; b.hidden = true; b.innerHTML = `<span aria-hidden="true">${icon}</span><b></b>`; dock.appendChild(b); return b; };
      const tradeBtn = mkPill('⇄', 'trade-pill');
      const giftBtn = mkPill('🎁', 'gift-only');
      document.body.appendChild(dock);
      const placeGift = () => {
        const sb = document.querySelector('.summoner-switch .sw-btn');
        if (!sb) return;
        const r = sb.getBoundingClientRect();
        if (r.left > innerWidth / 2) { dock.style.left = ''; dock.style.right = `${innerWidth - r.left + 10}px`; }
        else { dock.style.right = ''; dock.style.left = `${r.right + 10}px`; }
      };
      const setPill = (btn, n, title) => {
        const was = !btn.hidden;
        btn.hidden = !n;
        btn.querySelector('b').textContent = n > 1 ? n : '';
        btn.title = n ? title : '';
        if (n && !was) { placeGift(); btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
      };
      const showPending = n => setPill(giftBtn, n, `${n} gifted booster${n > 1 ? 's' : ''} - click to collect`);
      const showTrades = n => setPill(tradeBtn, n, `${n} trade${n > 1 ? 's' : ''} waiting for you - click to open`);
      tradeBtn.addEventListener('click', () => {
        if (file === 'album.html' && window.TTPAlbum) window.TTPAlbum.showTrades();
        else location.href = 'album.html?view=trades';
      });
      window.addEventListener('resize', placeGift);
      // der Summoner-Umschalter entsteht erst nach der Leiste
      setTimeout(() => { const swEl = document.querySelector('.summoner-switch .sw-btn'); if (swEl && window.ResizeObserver) new ResizeObserver(placeGift).observe(swEl); placeGift(); }, 0);
      try {
        const es = new EventSource('/api/events');
        es.onmessage = ev => {
          try {
            const d = JSON.parse(ev.data);
            showPending(d.gifts || 0); showTrades(d.trades || 0);
            window.dispatchEvent(new CustomEvent('ttp:notices', { detail: d }));
          } catch (e) {}
        };
      } catch (e) {
        fetch('/api/gifts/pending').then(r => r.json()).then(d => showPending(d.pending || 0)).catch(() => {});
      }
      giftBtn.addEventListener('click', () => {
        if (Date.now() - lastClaim < 1500) return;
        lastClaim = Date.now();
        fetch('/api/gifts/claim', { method: 'POST' }).then(r => r.json()).then(d => {
          showPending(0);
          if (!d || !d.gifts || !d.gifts.length) return;
          refresh();
          window.dispatchEvent(new CustomEvent('ttp:gifts', { detail: d.gifts }));
          showGifts(d.gifts);
        }).catch(() => {});
      });
      // auch wenn die Seite lange offen bleibt (Pass-Booster per Hintergrund-Abholung)
      window.addEventListener('focus', refresh);
    }

    // Gleitender Hintergrund unter dem aktiven Eintrag (Nutzerwunsch: beim
    // Klick nicht springen, sondern schnell rueber gleiten).
    const pill = document.createElement('span');
    pill.className = 'nav-pill';
    nav.prepend(pill);
    const placePill = el => {
      if (!el) { pill.style.opacity = '0'; return; }
      pill.style.opacity = '1';
      pill.style.left = `${el.offsetLeft}px`;
      pill.style.width = `${el.offsetWidth}px`;
    };
    const current = () => nav.querySelector('.top-nav-link.active');
    placePill(current());
    // Erst nach dem ersten Platzieren animieren; Schrift kann spaeter laden
    // und die Breiten aendern.
    requestAnimationFrame(() => requestAnimationFrame(() => nav.classList.add('pill-ready')));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placePill(current()));
    window.addEventListener('resize', () => placePill(current()));
    nav.slidePillTo = el => {
      const from = current();
      nav.querySelectorAll('.top-nav-link.active').forEach(a => a.classList.remove('active'));
      el.classList.add('active');
      if (!from) {
        // Kein aktiver Eintrag (z.B. von der Setup-Seite aus): nicht vom
        // linken Rand aus "wachsen", sondern direkt am Ziel einblenden.
        nav.classList.remove('pill-ready');
        pill.style.opacity = '0';
        pill.style.left = `${el.offsetLeft}px`;
        pill.style.width = `${el.offsetWidth}px`;
        pill.classList.add('pop');
        void pill.offsetWidth; // Startzustand festschreiben, bevor die Animation laeuft
        nav.classList.add('pill-ready');
        pill.style.opacity = '1';
        pill.classList.remove('pop');
        return;
      }
      placePill(el);
    };

    // Summoner-Umschalter oben rechts (v5.33.0, ersetzt den Setup-Knopf):
    // zeigt den aktiven Riot-Account, Klick oeffnet die Auswahl. Wird gefuellt,
    // sobald /api/auth/me da ist (initAccount).
    const sw = document.createElement('div');
    sw.className = 'summoner-switch';
    let cachedName = '';
    try { cachedName = localStorage.getItem('ttp_summoner_name') || ''; } catch (e) {}
    sw.innerHTML = `<button type="button" class="setup-btn sw-btn" aria-haspopup="true">${cachedName ? esc(cachedName) : 'Account'} <span class="sw-caret">▾</span></button><div class="sw-menu" hidden></div>`;
    document.body.appendChild(sw);

    // Freundesliste (v6.1.0, Nutzerdesign): "Friends" hochkant am rechten
    // Rand; Klick faehrt eine schmale Liste (60 % Fensterhoehe, mittig) aus,
    // erneuter Klick auf denselben Reiter faehrt sie wieder ein. "+" oeffnet
    // die Suche (nur TTP-Benutzername - Riot-Namen lassen sich aendern).
    const dock = document.createElement('div');
    dock.className = 'friends-dock';
    dock.innerHTML = '<button type="button" class="friends-tab" aria-expanded="false" title="Friends"><span>Friends</span><b class="fr-badge" hidden></b></button>' +
      '<aside class="friends-panel" aria-label="Friends">' +
      '<div class="fp-head"><h3>Friends</h3><button type="button" class="fp-add" title="Add a friend" aria-label="Add a friend">+</button></div>' +
      '<div class="fp-search" hidden><div class="fp-input"><input type="text" maxlength="20" placeholder="TTP username" autocomplete="off"><button type="button" class="fp-clear" title="Clear" aria-label="Clear" hidden>✕</button></div><div class="fp-results"></div></div>' +
      '<div class="fp-body"><div class="friends-empty">Loading …</div></div></aside>';
    document.body.appendChild(dock);
    document.body.classList.add('has-friends-dock');
    initFriends(dock);
    const parent = PARENTS[file];
    if (parent) {
      const back = document.createElement('a');
      back.className = 'sub-back';
      back.href = parent.href;
      back.textContent = `← ${parent.label}`;
      back.title = `Back to ${parent.label}`;
      nav.after(back);
    }
  }

  function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // ===== Profil-Account + Summoner (v5.33.0) / Challenge pro Summoner (v6.0) =====
  // Die laufende Challenge liegt pro Riot-Account auf dem Server
  // (/api/challenge/run, server/lib/challengeRuns.js). Die Seiten lesen
  // weiterhin ihre ttp_*-Schluessel - die werden hier als Spiegel gefuellt.
  const RUN_KEYS = ['ttp_challenge_start', 'ttp_challenge_level', 'ttp_lp_goal_tier', 'ttp_lp_goal_division', 'ttp_lp_goal_lp',
    'ttp_selected_champs', 'ttp_pool_role', 'ttp_pool_second_role'];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function runFromStorage() {
    if (!store.get('ttp_challenge_start')) return null;
    let champions = [];
    try { champions = JSON.parse(store.get('ttp_selected_champs') || '[]'); } catch (e) {}
    return {
      since: store.get('ttp_challenge_start'), level: store.get('ttp_challenge_level') || '',
      lpGoalTier: store.get('ttp_lp_goal_tier') || '', lpGoalDivision: store.get('ttp_lp_goal_division') || '',
      lpGoalLp: Number(store.get('ttp_lp_goal_lp')) || 0, champions,
      mainRole: store.get('ttp_pool_role') || '', secondRole: store.get('ttp_pool_second_role') || ''
    };
  }
  window.ttpRunFromStorage = runFromStorage;
  // Server-Stand in den localStorage spiegeln; true = es hat sich etwas geaendert
  function mirrorRun(run, clearDraft) {
    let changed = false;
    const put = (k, v) => { if (store.get(k) !== v) { store.set(k, v); changed = true; } };
    const drop = k => { if (store.get(k) !== null) { store.del(k); changed = true; } };
    if (run) {
      put('ttp_challenge_start', run.since);
      put('ttp_challenge_level', run.level || '');
      put('ttp_lp_goal_tier', run.lpGoalTier || '');
      put('ttp_lp_goal_division', run.lpGoalDivision || '');
      put('ttp_lp_goal_lp', String(run.lpGoalLp || 0));
      put('ttp_selected_champs', JSON.stringify(run.champions || []));
      put('ttp_pool_role', run.mainRole || '');
      put('ttp_pool_second_role', run.secondRole || '');
    } else {
      drop('ttp_challenge_start');
      if (clearDraft) RUN_KEYS.forEach(drop);
    }
    return changed;
  }
  async function fetchRun(puuid) {
    const res = await fetch(`/api/challenge/run?${new URLSearchParams({ puuid })}`);
    if (!res.ok) throw new Error('run');
    return res.json();
  }
  // Summoner lokal aktiv setzen; die Challenge-Schluessel werden geleert und
  // beim naechsten Laden vom Server gefuellt.
  function swapToSummoner(acc) {
    RUN_KEYS.forEach(store.del);
    store.del('ttp_last_trophy_snapshot');
    if (acc) {
      store.set('ttp_active_puuid', acc.puuid);
      store.set('ttp_summoner_name', `${acc.game_name}#${acc.tag_line}`);
    } else {
      store.del('ttp_active_puuid');
      store.del('ttp_summoner_name');
    }
  }
  window.ttpSyncSummoner = swapToSummoner;
  // Erste Verknuepfung: die bisherige Challenge (von vor den Accounts)
  // gehoert diesem Summoner, wenn der Name passt - sonst sauber leer anfangen.
  // true = Seite muss neu laden.
  function adoptSummoner(acc) {
    const localName = store.get('ttp_summoner_name') || '';
    if (localName.toLowerCase() === `${acc.game_name}#${acc.tag_line}`.toLowerCase()) {
      store.set('ttp_active_puuid', acc.puuid);
      return false;
    }
    swapToSummoner(acc);
    return true;
  }
  window.ttpAdoptSummoner = adoptSummoner;

  // Seiten, die nur fuer eine bestimmte Challenge Sinn ergeben, wechseln nach
  // dem Umschalten auf die Challenge-Uebersicht.
  const CHALLENGE_SUBPAGES = ['index.html', 'champion.html', 'role.html', 'trophies.html'];
  window.ttpSwitchSummoner = async id => {
    const res = await fetch('/api/riot-accounts/active', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not switch.');
    const acc = data.accounts.find(a => a.is_active);
    swapToSummoner(acc);
    if (acc) { try { mirrorRun((await fetchRun(acc.puuid)).run, true); } catch (e) {} }
    if (CHALLENGE_SUBPAGES.includes(file)) location.href = 'challenge.html';
    else location.reload();
  };

  // Spiegel mit dem Server abgleichen. Einmalig: eine Challenge von vor v6.0
  // (nur im localStorage) wird hochgeladen. true = Seite neu laden.
  async function syncRun(puuid) {
    const r = await fetchRun(puuid);
    if (!r.known && !r.run) {
      const local = runFromStorage();
      if (local) {
        await fetch('/api/challenge/run/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ puuid, run: local }) });
        return false;
      }
    }
    if (!mirrorRun(r.run, false)) return false;
    // Schutz gegen Reload-Schleifen: hoechstens 2 Spiegel-Reloads pro Minute
    let hist = [];
    try { hist = JSON.parse(sessionStorage.getItem('ttp_mirror_reloads') || '[]').filter(t => Date.now() - t < 60000); } catch (e) {}
    if (hist.length >= 2) return false;
    hist.push(Date.now());
    try { sessionStorage.setItem('ttp_mirror_reloads', JSON.stringify(hist)); } catch (e) {}
    return true;
  }

  function renderSwitcher(me) {
    const sw = document.querySelector('.summoner-switch');
    if (!sw) return;
    const btn = sw.querySelector('.sw-btn'), menu = sw.querySelector('.sw-menu');
    const accs = me.riotAccounts || [];
    const active = accs.find(a => a.is_active);
    btn.innerHTML = `${active ? esc(`${active.game_name}#${active.tag_line}`) : 'Link a summoner'} <span class="sw-caret">▾</span>`;
    btn.title = `Signed in as ${me.user.username}`;
    menu.innerHTML = `<div class="sw-head">Signed in as <b>${esc(me.user.username)}</b></div>` +
      accs.map(a => `<button type="button" class="sw-item${a.is_active ? ' on' : ''}" data-id="${a.id}" title="${a.is_active ? 'Active summoner' : 'Switch to this summoner'}">${a.is_active ? '● ' : ''}${esc(`${a.game_name}#${a.tag_line}`)}</button>`).join('') +
      (accs.length < 5 ? '<a class="sw-item" href="account.html#link">＋ Link a summoner</a>' : '') +
      '<a class="sw-item" href="account.html">Manage account</a>';
    btn.onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; };
    document.addEventListener('click', e => { if (!sw.contains(e.target)) menu.hidden = true; });
    menu.onclick = async e => {
      const it = e.target.closest('button.sw-item');
      if (!it || it.classList.contains('on')) return;
      it.disabled = true;
      try { await window.ttpSwitchSummoner(it.dataset.id); } catch (err) { it.disabled = false; it.textContent = err.message; }
    };
  }

  // Banner, wenn der Online-Server nicht erreichbar ist (Nutzerwunsch: damit
  // der Entwickler es mitbekommt und die Verbindung wiederherstellt).
  function showConnBanner(status) {
    let el = document.getElementById('connBanner');
    if (status !== 'offline' && status !== 'unreachable') { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div');
      el.id = 'connBanner';
      el.className = 'conn-banner';
      document.body.appendChild(el);
    }
    el.textContent = status === 'offline'
      ? "You're offline - your progress is saved on this PC and syncs when you're back online."
      : '⚠ Online server unreachable - profile sync is paused. The developer needs to restore the server connection.';
  }

  async function initAccount() {
    if (file === 'login.html') return;
    try {
      const me = await (await fetch('/api/auth/me')).json();
      if (!me.user) {
        try { localStorage.removeItem('ttp_signed_in'); } catch (e) {}
        location.replace('login.html');
        return;
      }
      window.ttpAccount = me;
      try {
        localStorage.setItem('ttp_username', me.user.username);
        if (me.user.avatar) localStorage.setItem('ttp_avatar', me.user.avatar); else localStorage.removeItem('ttp_avatar');
      } catch (e) {}
      // Aktiven Summoner mit dem lokalen Stand abgleichen (anderer PC,
      // anderes Profil oder erster Start nach dem Update).
      const active = (me.riotAccounts || []).find(a => a.is_active);
      let localPuuid = null;
      try { localPuuid = localStorage.getItem('ttp_active_puuid'); } catch (e) {}
      if (active && !localPuuid) {
        if (adoptSummoner(active)) { location.reload(); return; }
      } else if (active && active.puuid !== localPuuid) {
        swapToSummoner(active);
        location.reload();
        return;
      } else if (!active && localPuuid) {
        swapToSummoner(null);
        location.reload();
        return;
      }
      if (active) {
        try { if (await syncRun(active.puuid)) { location.reload(); return; } } catch (e) {}
      }
      renderSwitcher(me);
      showConnBanner(me.connection && me.connection.status);
      document.dispatchEvent(new CustomEvent('ttp-account', { detail: me }));
      window.ttpPublishProfile(false);
    } catch (e) {}
    setInterval(async () => {
      try { showConnBanner((await (await fetch('/api/cloud/status')).json()).status); } catch (e) {}
    }, 60000);
  }

  // ===== Freunde (v6.1.0) =====
  const avatarSrc = id => (id ? `avatars/${id}.svg` : 'avatar-placeholder.svg');
  async function friendsApi(url, body) {
    const res = await fetch(url, body === undefined ? undefined : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  }
  function initFriends(dock) {
    const tab = dock.querySelector('.friends-tab'), badge = dock.querySelector('.fr-badge');
    const body = dock.querySelector('.fp-body'), search = dock.querySelector('.fp-search');
    const input = search.querySelector('input'), results = search.querySelector('.fp-results');
    const clearBtn = search.querySelector('.fp-clear');
    // Suche leeren (x in der Leiste, und jedes Mal beim Ein-/Ausfahren)
    const clearSearch = () => { clearTimeout(timer); seq++; input.value = ''; results.innerHTML = ''; clearBtn.hidden = true; };
    clearBtn.addEventListener('click', () => { clearSearch(); input.focus(); });
    let state = null, pollTimer = null;

    const row = (f, actions, clickable) => `<div class="fp-row${clickable ? ' link' : ''}"${clickable ? ` data-open="${f.userId}" title="Open ${esc(f.username)}'s profile"` : ''}>
        <img src="${avatarSrc(f.avatar)}" alt="" onerror="this.src='avatar-placeholder.svg'">
        <span class="fp-name">${esc(f.username)}${f.level ? `<small>Lv ${f.level}</small>` : ''}</span>${actions}</div>`;
    function render() {
      if (!state) return;
      const n = state.incoming.length;
      badge.hidden = !n;
      badge.textContent = n;
      let html = '';
      if (n) html += '<div class="fp-sub">Requests</div>' + state.incoming.map(f => row(f,
        `<button type="button" class="fp-btn ok" data-accept="${f.id}" title="Accept">✓</button><button type="button" class="fp-btn" data-remove="${f.id}" title="Decline">✕</button>`)).join('');
      if (state.friends.length) html += `<div class="fp-sub">Friends · ${state.friends.length}</div>` + state.friends.map(f => row(f,
        `<button type="button" class="fp-btn rm" data-remove="${f.id}" data-confirm="1" title="Remove friend">✕</button>`, true)).join('');
      if (state.outgoing.length) html += '<div class="fp-sub">Sent</div>' + state.outgoing.map(f => row(f,
        `<button type="button" class="fp-btn" data-remove="${f.id}" title="Withdraw request">✕</button>`)).join('');
      body.innerHTML = html || '<div class="friends-empty"><span class="friends-empty-ic" aria-hidden="true">👥</span>No friends yet.<small>Add one with the + above.</small></div>';
    }
    async function load() {
      try { state = await friendsApi('/api/friends'); render(); }
      catch (e) { if (!state) body.innerHTML = `<div class="friends-empty">${esc(e.message)}</div>`; }
    }
    tab.addEventListener('click', () => {
      const open = dock.classList.toggle('open');
      tab.setAttribute('aria-expanded', open ? 'true' : 'false');
      clearSearch();
      search.hidden = true; // Suchleiste beim Ein-/Ausfahren wieder zuklappen (Nutzerwunsch)
      clearInterval(pollTimer);
      if (open) { load(); pollTimer = setInterval(load, 30000); }
    });
    dock.querySelector('.fp-add').addEventListener('click', () => {
      search.hidden = !search.hidden;
      if (!search.hidden) { clearSearch(); input.focus(); }
    });
    let seq = 0, timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      clearBtn.hidden = !input.value;
      const q = input.value.trim();
      if (q.length < 2) { results.innerHTML = q ? '<div class="fp-hint">Type at least 2 letters</div>' : ''; return; }
      const my = ++seq;
      timer = setTimeout(async () => {
        try {
          const r = await friendsApi(`/api/friends/search?${new URLSearchParams({ q })}`);
          if (my !== seq) return;
          const known = new Set(state ? [...state.friends, ...state.incoming, ...state.outgoing].map(f => f.userId) : []);
          results.innerHTML = r.users.length
            ? r.users.map(u => `<div class="fp-row"><img src="${avatarSrc(u.avatar)}" alt="" onerror="this.src='avatar-placeholder.svg'"><span class="fp-name">${esc(u.username)}</span>${known.has(u.id)
              ? '<small class="fp-known">added</small>'
              : `<button type="button" class="fp-btn ok" data-add="${u.id}" title="Send friend request">＋</button>`}</div>`).join('')
            : '<div class="fp-hint">No player with that name</div>';
        } catch (e) { if (my === seq) results.innerHTML = `<div class="fp-hint">${esc(e.message)}</div>`; }
      }, 300);
    });
    dock.addEventListener('click', async e => {
      const add = e.target.closest('[data-add]'), acc = e.target.closest('[data-accept]'), rm = e.target.closest('[data-remove]');
      const open = !add && !acc && !rm && e.target.closest('[data-open]');
      try {
        if (add) { add.disabled = true; state = await friendsApi('/api/friends/request', { userId: add.dataset.add }); add.outerHTML = '<small class="fp-known">sent</small>'; render(); }
        else if (acc) { acc.disabled = true; state = await friendsApi('/api/friends/accept', { id: acc.dataset.accept }); render(); }
        else if (rm) {
          if (rm.dataset.confirm && !rm.classList.contains('armed')) {
            rm.classList.add('armed'); rm.textContent = 'Remove?';
            setTimeout(() => { rm.classList.remove('armed'); rm.textContent = '✕'; }, 3500);
            return;
          }
          rm.disabled = true; state = await friendsApi('/api/friends/remove', { id: rm.dataset.remove }); render();
        } else if (open) location.href = `profile.html?u=${encodeURIComponent(open.dataset.open)}`;
      } catch (err) { body.insertAdjacentHTML('afterbegin', `<div class="fp-hint err">${esc(err.message)}</div>`); }
    });
    // Offene Anfragen als Zahl am Reiter, auch wenn die Liste zu ist
    setTimeout(load, 1500);
  }

  // Eigene Profil-Momentaufnahme fuer Freunde hochladen (hoechstens alle
  // 10 min, nach Profil-Aenderungen sofort: window.ttpPublishProfile(true)).
  window.ttpPublishProfile = force => {
    let last = 0;
    try { last = Number(localStorage.getItem('ttp_pub_at')) || 0; } catch (e) {}
    if (!force && Date.now() - last < 10 * 60 * 1000) return;
    try { localStorage.setItem('ttp_pub_at', String(Date.now())); } catch (e) {}
    let theme = 'classic';
    try { theme = localStorage.getItem('ttp_theme') || 'classic'; } catch (e) {}
    fetch('/api/public-profile/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme }) }).catch(() => {});
  };

  function init() {
    build();
    initAccount();
    // Animierte Pass-Themes (z.B. Haunted Night) - schlaeft, solange kein
    // animiertes Theme aktiv ist.
    const fx = document.createElement('script');
    fx.src = 'theme-fx.js';
    document.head.appendChild(fx);
    // Aufwendige Borders/Rahmen (Spinnen, Kuerbis, Ranken ...)
    const cos = document.createElement('script');
    cos.src = 'cosmetics-fx.js';
    // Shop-Cosmetics melden sich bei cosmetics-fx.js bzw. theme-fx.js an
    cos.onload = () => {
      const c12 = document.createElement('script'); c12.src = 'cosmetics-2026-12.js'; document.head.appendChild(c12);
      const sc = document.createElement('script'); sc.src = 'shop-cosmetics.js';
      sc.onload = () => { const s2 = document.createElement('script'); s2.src = 'shop-cosmetics-2.js'; document.head.appendChild(s2); };
      document.head.appendChild(sc);
    };
    fx.onload = () => {
      const ss = document.createElement('script'); ss.src = 'shop-scenes.js';
      ss.onload = () => { const s2 = document.createElement('script'); s2.src = 'shop-scenes-2.js'; document.head.appendChild(s2); };
      // Dezember-Pass 2026: Winter Village + Christmas Eve (3D)
      const d12 = document.createElement('script'); d12.src = 'theme-2026-12.js'; document.head.appendChild(d12);
      document.head.appendChild(ss);
    };
    document.head.appendChild(cos);
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);

  // Mehrfachklicks abfangen (Nutzerwunsch): ein Link auf die Seite, auf der
  // man schon ist, tut nichts, und sobald eine Navigation laeuft, werden
  // weitere Link-Klicks ignoriert - sonst laedt z.B. 4x "Pass" die Seite
  // 4x neu. Gilt fuer ALLE internen Links (Leiste, Kacheln, Karten, Zurueck).
  let navigating = false;
  window.addEventListener('pageshow', () => { navigating = false; }); // Zurueck-Taste/bfcache
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || a.target) return;
    let url;
    try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    const samePage = url.pathname === location.pathname && url.search === location.search;
    if (samePage && url.hash) return; // Sprungmarken auf derselben Seite erlauben
    if (samePage || navigating) {
      e.preventDefault();
      return;
    }
    navigating = true;
    // Leisten-Eintrag: erst den Hintergrund hinueber gleiten lassen, dann wechseln.
    const nav = a.closest('.top-nav');
    if (nav && nav.slidePillTo && a.classList.contains('top-nav-link')) {
      e.preventDefault();
      nav.slidePillTo(a);
      setTimeout(() => { location.href = a.href; }, 170);
    }
  }, true);
})();
