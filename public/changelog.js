// Runder "Was gibt's Neues"-Button + rechts aufklappbares Update-Log-Panel -
// gemeinsam von index.html/overview.html/trophies.html genutzt, analog zu
// update-indicator.js. Enthaelt nur Versionen ab 4.0.0 (explizit vom Nutzer
// so gewuenscht - "seit heute, also seit 4.0.0"), wird bei jedem Release
// von Hand um den neuesten Eintrag ergaenzt (kein automatischer Abgleich
// mit package.json/Git-Historie).
//
// Kategorisierung (ebenfalls explizit so gewuenscht): "notable" ist kurz und
// knackig fuer alles, was fuer den Nutzer wirklich sichtbar/relevant ist
// (neue Themes, UI-Aenderungen, neue Features). "bugfixes" ist ein Sammel-
// becken fuer alles andere, das fuer den Nutzer nicht sonderlich relevant
// ist - auch wenn es kein echter Bugfix war.
(function () {
  const CHANGELOG = [
    {
      version: '4.9.0',
      notable: [
        'New: click an old Challenge History entry to see exactly which trophies you had (and hadn\'t) unlocked when it ended - clearly marked as a read-only past view, with a button to jump back to your current challenge'
      ],
      bugfixes: []
    },
    {
      version: '4.8.0',
      notable: [
        'New: a Save button next to your summoner name resolves your current rank immediately, instead of only after starting a challenge',
        'New: LP Goals now need a minimum distance from your current rank (2 divisions, or +100 LP at Master+) so it stays an actual challenge'
      ],
      bugfixes: []
    },
    {
      version: '4.7.0',
      notable: [],
      bugfixes: [
        'Fixed challenges already running before the Challenge History feature existed never appearing in it'
      ]
    },
    {
      version: '4.6.0',
      notable: [
        'The update icon now shows a small dismissible notification when a new update is found, so it\'s harder to miss'
      ],
      bugfixes: [
        'Fixed the Trophies page header being off-center and the heading text being unreadable in some themes after the Challenge History sidebar was added'
      ]
    },
    {
      version: '4.5.0',
      notable: [],
      bugfixes: [
        'Fixed a rare case where some accounts\' older games weren\'t being counted toward stats/trophies'
      ]
    },
    {
      version: '4.4.0',
      notable: [
        'Rebalanced Double/Triple/Quadra Kill trophy targets using real match data instead of estimates - Triple and Quadra Kill were up to 5x too high before'
      ],
      bugfixes: []
    },
    {
      version: '4.3.0',
      notable: [
        'New: Challenge History list on the Trophies page - every challenge you\'ve run, with start/end dates, duration, and trophy count',
        'New: clean up old challenge entries you abandoned early',
        'New: this update log'
      ],
      bugfixes: [
        'Various small under-the-hood improvements'
      ]
    },
    {
      version: '4.2.0',
      notable: [
        'Resetting a challenge now fully clears its old trophy progress instead of leaving it behind'
      ],
      bugfixes: []
    },
    {
      version: '4.1.0',
      notable: [
        'The Trophies page now tells you if your trophy list is still up to date with the current targets'
      ],
      bugfixes: []
    },
    {
      version: '4.0.0',
      notable: [
        '2 new themes: Freljord & Ionia',
        'Refreshed, more modern look across the whole app'
      ],
      bugfixes: []
    }
  ];

  function init() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'changelogBtn';
    btn.className = 'changelog-btn';
    btn.title = "What's new";
    btn.setAttribute('aria-label', "What's new");
    btn.textContent = '📜';
    document.body.appendChild(btn);

    const overlay = document.createElement('div');
    overlay.className = 'changelog-overlay';
    document.body.appendChild(overlay);

    const drawer = document.createElement('div');
    drawer.className = 'changelog-drawer';
    drawer.innerHTML = `
      <div class="changelog-drawer-header">
        <h2>What's New</h2>
        <button type="button" class="changelog-close-btn" aria-label="Close">×</button>
      </div>
      <div class="changelog-drawer-body">
        ${CHANGELOG.map(v => `
          <div class="changelog-version">
            <div class="changelog-version-title">v${v.version}</div>
            ${v.notable.length ? `<ul class="changelog-notable">${v.notable.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}
            ${v.bugfixes.length ? `<div class="changelog-bugfixes-label">Bugfixes</div><ul class="changelog-bugfixes">${v.bugfixes.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    document.body.appendChild(drawer);

    function openDrawer() {
      drawer.classList.add('open');
      overlay.classList.add('visible');
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('visible');
    }

    btn.addEventListener('click', openDrawer);
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelector('.changelog-close-btn').addEventListener('click', closeDrawer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
