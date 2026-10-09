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
    { label: 'Shop', soon: true, title: 'Shop - coming soon' }
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
      nav.querySelectorAll('.top-nav-link.active').forEach(a => a.classList.remove('active'));
      el.classList.add('active');
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

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);

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
