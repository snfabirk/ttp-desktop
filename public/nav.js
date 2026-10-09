// Feste Hauptleiste oben links (v5.6.0, Nutzerwunsch 2026-10-09): ersetzt die
// "Zurueck"-Pfeile - die Overview ist die Kernseite, nicht "Seite 2" einer
// Kette. Wird von jeder Seite per <script src="nav.js"> eingebunden und
// markiert die aktive Seite. Unterseiten (Trophies, Roles & Picks, Champion) gehoeren
// zur Challenge.
(function () {
  const ITEMS = [
    { href: 'index.html', label: 'Setup', title: 'Start or change your challenge' },
    { href: 'overview.html', label: 'Overview' },
    { href: 'challenge.html', label: 'Challenge', also: ['trophies.html', 'role.html', 'champion.html'] },
    { href: 'challenge.html?view=pass', label: 'Pass' },
    { href: 'profile.html', label: 'Profile' }
  ];

  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const isPass = file === 'challenge.html' && new URLSearchParams(location.search).get('view') === 'pass';

  function isActive(item) {
    if (item.label === 'Pass') return isPass;
    if (item.label === 'Challenge') return (file === 'challenge.html' && !isPass) || item.also.includes(file);
    return item.href === file;
  }

  function build() {
    const nav = document.createElement('nav');
    nav.className = 'top-nav';
    nav.setAttribute('aria-label', 'Main navigation');
    nav.innerHTML = ITEMS.map(item =>
      `<a href="${item.href}" class="top-nav-link${isActive(item) ? ' active' : ''}"${item.title ? ` title="${item.title}"` : ''}>${item.label}</a>`
    ).join('');
    document.body.prepend(nav);
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
