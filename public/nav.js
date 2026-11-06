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
  window.ttpAvatar = () => 'avatar-placeholder.svg';
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
      try { localStorage.setItem('ttp_username', me.user.username); } catch (e) {}
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
      store.del('ttp_challenge_bundles'); // Zwischenstand aus der Entwicklung von v5.33
      if (active) {
        try { if (await syncRun(active.puuid)) { location.reload(); return; } } catch (e) {}
      }
      renderSwitcher(me);
      showConnBanner(me.connection && me.connection.status);
      document.dispatchEvent(new CustomEvent('ttp-account', { detail: me }));
    } catch (e) {}
    setInterval(async () => {
      try { showConnBanner((await (await fetch('/api/cloud/status')).json()).status); } catch (e) {}
    }, 60000);
  }

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
      const sc = document.createElement('script'); sc.src = 'shop-cosmetics.js';
      sc.onload = () => { const s2 = document.createElement('script'); s2.src = 'shop-cosmetics-2.js'; document.head.appendChild(s2); };
      document.head.appendChild(sc);
    };
    fx.onload = () => {
      const ss = document.createElement('script'); ss.src = 'shop-scenes.js';
      ss.onload = () => { const s2 = document.createElement('script'); s2.src = 'shop-scenes-2.js'; document.head.appendChild(s2); };
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
