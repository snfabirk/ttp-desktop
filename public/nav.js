// Feste Hauptleiste oben links (v5.6.0, Nutzerwunsch 2026-10-09): ersetzt die
// "Zurueck"-Pfeile - die Overview ist die Kernseite, nicht "Seite 2" einer
// Kette. Wird von jeder Seite per <script src="nav.js"> eingebunden und
// markiert die aktive Seite. Unterseiten (Trophies, Roles & Picks, Champion) gehoeren
// zur Challenge.
(function () {
  // Hauptseiten (Nutzerwunsch 2026-10-09): Overview ist die Startseite und
  // immer hervorgehoben, Shop folgt noch. Setup ist KEIN Leisten-Eintrag
  // mehr, sondern ein eigener Text-Knopf oben rechts neben den Patch Notes.
  const ITEMS = [
    { href: 'overview.html', label: 'Overview', home: true, title: 'Home' },
    { href: 'profile.html', label: 'Profile' },
    { href: 'challenge.html', label: 'Challenge', also: ['role.html', 'champion.html'] },
    { href: 'challenge.html?view=pass', label: 'Pass' },
    { href: 'trophies.html', label: 'Trophies' },
    { href: 'shop.html', label: 'Shop' }
  ];

  // Unterseiten bekommen zusaetzlich einen Zurueck-Knopf zur uebergeordneten
  // Seite (Nutzerwunsch: fuehlt sich dort intuitiver an als nur die Leiste).
  const PARENTS = {
    'role.html': { href: 'challenge.html', label: 'Challenge' },
    'champion.html': { href: 'challenge.html', label: 'Challenge' }
  };

  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
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

    // Setup (Challenge starten/aendern) als eigener Knopf oben rechts.
    const setup = document.createElement('a');
    setup.href = 'index.html';
    setup.className = `setup-btn${file === 'index.html' || file === '' ? ' active' : ''}`;
    setup.textContent = 'Setup';
    setup.title = 'Start or change your challenge';
    document.body.appendChild(setup);
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

  // Willkommens-Popup beim allerersten Start bzw. nach einem Werksreset
  // (Nutzerwunsch: "damit man nicht lost ist"). Nur wenn noch nichts
  // eingerichtet ist - bestehende Nutzer sehen es nach einem Update nicht.
  const WELCOME_KEY = 'ttp_welcome_seen';
  function maybeWelcome() {
    let show = false;
    try {
      show = !localStorage.getItem(WELCOME_KEY) &&
        !localStorage.getItem('ttp_summoner_name') &&
        !localStorage.getItem('ttp_challenge_start');
    } catch (e) {}
    if (!show) return;
    const onSetup = file === 'index.html';
    const setupBtn = document.querySelector('.setup-btn');
    if (setupBtn) setupBtn.classList.add('glow');

    const overlay = document.createElement('div');
    overlay.className = 'welcome-overlay';
    overlay.innerHTML = `
      <div class="welcome-card" role="dialog" aria-modal="true" aria-labelledby="welcomeTitle">
        <h2 id="welcomeTitle">Welcome to Three-Trick-Pony!</h2>
        <p>Pick three champions, stick to them and climb. Everything starts in <strong>Setup</strong>:</p>
        <ol>
          <li>Enter your summoner name (Name#Tag)</li>
          <li>Choose up to 3 champions and your roles</li>
          <li>Set a challenge level and an LP goal</li>
          <li>Hit <strong>Start Challenge</strong></li>
        </ol>
        <button type="button" class="welcome-go">${onSetup ? "Let's go" : 'Go to Setup'}</button>
      </div>
      <div class="welcome-hint">Setup is always up here <span aria-hidden="true">↗</span></div>`;
    document.body.appendChild(overlay);

    // Sprechblase genau unter den Setup-Knopf setzen
    const hint = overlay.querySelector('.welcome-hint');
    if (setupBtn) {
      const r = setupBtn.getBoundingClientRect();
      hint.style.top = `${r.bottom + 12}px`;
      hint.style.right = `${Math.max(12, window.innerWidth - r.right)}px`;
    } else {
      hint.remove();
    }

    const close = () => {
      try { localStorage.setItem(WELCOME_KEY, '1'); } catch (e) {}
      overlay.remove();
      if (setupBtn) setupBtn.classList.remove('glow');
      if (!onSetup) location.href = 'index.html';
    };
    overlay.querySelector('.welcome-go').addEventListener('click', close);
    overlay.querySelector('.welcome-go').focus();
  }

  function init() {
    build();
    maybeWelcome();
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
