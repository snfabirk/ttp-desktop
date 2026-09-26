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
// ist - auch wenn es kein echter Bugfix war. Seit v4.12.0 (explizite
// Nutzeranfrage) wird "bugfixes" NICHT mehr als Liste mit Beschreibungen
// angezeigt, nur noch als schlichtes "Bugfixes"-Label - den Nutzer
// interessiert bei Dingen, die keine Funktion fuer ihn aendern, nicht WAS
// genau, nur DASS ueberhaupt was war. Kann weiterhin ein Array (fuer
// Eintraege vor 4.12.0, deren Inhalt jetzt einfach ignoriert wird) oder ab
// jetzt eine blosse Zahl sein - beides wird nur noch gezaehlt, nie gelistet.
// Das genaue "was" steht stattdessen in CHANGELOG.md (Repo-Root) - ein
// privates, nicht in der App angezeigtes Log fuer Fabian/Claude selbst.
(function () {
  const CHANGELOG = [
    {
      version: '4.15.0',
      notable: [],
      bugfixes: 2
    },
    {
      version: '4.14.0',
      notable: [],
      bugfixes: 2
    },
    {
      version: '4.13.0',
      notable: [],
      bugfixes: 2
    },
    {
      version: '4.12.0',
      notable: [],
      bugfixes: 6
    },
    {
      version: '4.11.0',
      notable: [
        'Challenge History on the Trophies page reorganized: your current challenge now sits in its own fixed spot above the history list, which now scrolls on its own once it gets long'
      ],
      bugfixes: [
        'Fixed the Trophies page history list not scrolling and instead pushing the whole page down once you had several past challenges',
        'Fixed the "viewing a past challenge" banner abruptly shifting the whole page instead of transitioning smoothly',
        'Fixed trophy progress bars sitting at different heights depending on how long each trophy\'s description was',
        'Fixed the Overview page header overlapping the back button',
        'Fixed several spots on the Champion Selection and Overview pages shifting around as data loaded or errors appeared/disappeared (champion pool box, Start Challenge box, summoner stats card, and more)'
      ]
    },
    {
      version: '4.10.0',
      notable: [],
      bugfixes: [
        'Champion Selection page slightly resized to stop it from needing to scroll in most cases',
        'Settings window tidied up so it no longer needs to scroll',
        'Clicking your currently running challenge in the Challenge History list now just takes you back to it, instead of trying to show it as a past snapshot',
        'A brief visual cue now shows when switching between the current and a past challenge view on the Trophies page'
      ]
    },
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
            ${(Array.isArray(v.bugfixes) ? v.bugfixes.length : v.bugfixes) ? `<div class="changelog-bugfixes-label">Bugfixes</div>` : ''}
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
