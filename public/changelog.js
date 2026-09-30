// Runder "Was gibt's Neues"-Button + rechts aufklappbares Update-Log-Panel -
// gemeinsam von index.html/overview.html/trophies.html genutzt, analog zu
// update-indicator.js. Enthaelt nur Versionen ab 4.0.0 (explizit vom Nutzer
// so gewuenscht - "seit heute, also seit 4.0.0"), wird bei jedem Release
// von Hand um den neuesten Eintrag ergaenzt (kein automatischer Abgleich
// mit package.json/Git-Historie).
//
// Kategorisierung (explizite Nutzeranfrage, neu geordnet 2026-09-30): nur
// "notable" wird als Liste mit Text angezeigt - und zwar NUR fuer Dinge, die
// dem Nutzer wirklich etwas bringen (neue Features, geaenderte Trophy-Ziele/
// Zaehlregeln, Verhalten, auf das er sich einstellen muss). Leitfrage: "Ist
// das relevante Information fuer den Nutzer, bringt ihm die Info was?"
// Alles andere ist nur eine Zahl und erscheint als schlichtes Label:
//   - "refinements" (Label "Refinements"): kosmetische/Layout-Anpassungen,
//     Button verschoben/anders gestylt, Texte, Panel-Details, kleine
//     Komfort-Aenderungen.
//   - "bugfixes" (Label "Bug Fixes"): echte Fehlerbehebungen.
// Das genaue "was" steht in CHANGELOG.md (Repo-Root) - ein privates, nicht
// in der App angezeigtes Log fuer Fabian/Claude selbst.
//
// "date" (explizite Nutzeranfrage, 2026-09-30): Erscheinungsdatum dieser
// Version, klein neben der Versionsnummer angezeigt - aus der echten
// Git-Historie/CHANGELOG.md rekonstruiert fuer alle Eintraege vor dieser
// Aenderung, ab jetzt einfach das Datum des jeweiligen Releases.
(function () {
  const CHANGELOG = [
    {
      version: '4.27.0',
      date: '2026-09-30',
      notable: [
        "Challenge History, LP history and trophy progress now survive app updates - until now every update wiped them",
        "Past challenges stay in your Challenge History even after trophy targets get adjusted later - they're shown with the trophy list that applied back then, marked \"Older trophy list\""
      ],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.26.5',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.26.3',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.26.2',
      date: '2026-09-30',
      notable: [],
      refinements: 4,
      bugfixes: 0
    },
    {
      version: '4.26.1',
      date: '2026-09-30',
      notable: [],
      refinements: 0,
      bugfixes: 2
    },
    {
      version: '4.26.0',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.25.0',
      date: '2026-09-30',
      notable: [
        "New: Second Role on the Champion Selection page - pick a backup role alongside your Main Role (both required to start a challenge)",
        "New: Role Balance chart on the Overview page shows your Main/Second/Fill split for this challenge",
        "Overview page now shows each champion's win rate + games played"
      ],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.24.0',
      date: '2026-09-30',
      notable: [
        "Duelist and Assassin (Mid) trophy targets raised 50% across all difficulty levels"
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.23.0',
      date: '2026-09-30',
      notable: [
        "Provisional trophies (Consistency, Mid Diff, and similar) now always show their live current/target numbers, marked with a small hourglass badge"
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.22.0',
      date: '2026-09-30',
      notable: [
        "Overview and Trophies pages now refresh themselves automatically every 15 minutes while open"
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.21.0',
      date: '2026-09-30',
      notable: [
        "Trophies now count every ranked game since your challenge started, not just games on your exact champion pool/role"
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.20.1',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.20.0',
      date: '2026-09-26',
      notable: [
        "Challenges ended with 0 trophies unlocked (e.g. restarted right away after tweaking a setting) no longer get saved to Challenge History"
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.19.0',
      date: '2026-09-26',
      notable: [],
      refinements: 1,
      bugfixes: 1
    },
    {
      version: '4.18.0',
      date: '2026-09-26',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.17.0',
      date: '2026-09-26',
      notable: [],
      refinements: 0,
      bugfixes: 2
    },
    {
      version: '4.16.0',
      date: '2026-09-26',
      notable: [
        "Challenge History now shows the difficulty you played on and your LP range with a ✓/✗ for whether you reached your goal"
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.15.0',
      date: '2026-09-26',
      notable: [],
      refinements: 0,
      bugfixes: 2
    },
    {
      version: '4.14.0',
      date: '2026-09-26',
      notable: [],
      refinements: 0,
      bugfixes: 2
    },
    {
      version: '4.13.0',
      date: '2026-09-26',
      notable: [],
      refinements: 0,
      bugfixes: 2
    },
    {
      version: '4.12.0',
      date: '2026-09-26',
      notable: [],
      refinements: 0,
      bugfixes: 6
    },
    {
      version: '4.11.0',
      date: '2026-09-26',
      notable: [],
      refinements: 1,
      bugfixes: 5
    },
    {
      version: '4.10.0',
      date: '2026-09-26',
      notable: [],
      refinements: 3,
      bugfixes: 1
    },
    {
      version: '4.9.0',
      date: '2026-09-26',
      notable: [
        "New: click an old Challenge History entry to see exactly which trophies you had (and hadn't) unlocked when it ended"
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.8.0',
      date: '2026-09-26',
      notable: [
        "New: a Save button next to your summoner name resolves your current rank immediately",
        "New: LP Goals now need a minimum distance from your current rank (2 divisions, or +100 LP at Master+) so it stays an actual challenge"
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.7.0',
      date: '2026-09-26',
      notable: [],
      refinements: 0,
      bugfixes: 1
    },
    {
      version: '4.6.0',
      date: '2026-09-26',
      notable: [
        "The update icon now shows a small notification when a new update is found"
      ],
      refinements: 0,
      bugfixes: 1
    },
    {
      version: '4.5.0',
      date: '2026-09-26',
      notable: [],
      refinements: 0,
      bugfixes: 1
    },
    {
      version: '4.4.0',
      date: '2026-09-26',
      notable: [
        "Rebalanced Double/Triple/Quadra Kill trophy targets using real match data - Triple and Quadra Kill were up to 5x too high before"
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.3.0',
      date: '2026-09-25',
      notable: [
        "New: Challenge History list on the Trophies page - every challenge you've run, with start/end dates, duration, and trophy count",
        "New: this update log"
      ],
      refinements: 2,
      bugfixes: 0
    },
    {
      version: '4.2.0',
      date: '2026-09-25',
      notable: [],
      refinements: 0,
      bugfixes: 1
    },
    {
      version: '4.1.0',
      date: '2026-09-25',
      notable: [
        "The Trophies page now tells you if your trophy list is still up to date with the current targets"
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.0.0',
      date: '2026-09-25',
      notable: [
        "2 new themes: Freljord & Ionia",
        "Refreshed, more modern look across the whole app"
      ],
      refinements: 0,
      bugfixes: 0
    }
  ];

  // Vergleicht zwei "x.y.z"-Versionsstrings numerisch (nicht als String -
  // "4.9.0" muss z.B. als KLEINER als "4.10.0" gelten). Gibt >0/-0/<0
  // zurueck wie ein normaler Comparator.
  function compareVersions(a, b) {
    const pa = String(a).split('.').map(Number);
    const pb = String(b).split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const diff = (pa[i] || 0) - (pb[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  function formatChangelogDate(iso) {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00`);
    if (isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  }

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
      <div class="changelog-drawer-body"></div>
    `;
    document.body.appendChild(drawer);

    // Wie viele Eintraege (von oben, neueste zuerst) gerade sichtbar sind -
    // startet bei jedem Oeffnen neu bei "alles Neue seit dem letzten Update
    // + 3 weitere aeltere" (siehe renderBody()), waechst dann per "Load
    // more" um je 5 weitere.
    const LAST_SEEN_KEY = 'ttp_changelog_last_seen_version';
    const INITIAL_OLDER_COUNT = 5;
    const LOAD_MORE_COUNT = 5;
    let visibleCount = 0;

    function getLastSeenVersion() {
      try { return localStorage.getItem(LAST_SEEN_KEY) || ''; } catch (e) { return ''; }
    }
    function setLastSeenVersion(v) {
      try { localStorage.setItem(LAST_SEEN_KEY, v); } catch (e) {}
    }

    // Liste ist neueste-zuerst sortiert, also kann beim ersten Eintrag
    // <= lastSeen sofort abgebrochen werden. Ohne bekannte lastSeenVersion
    // (allererstes Oeffnen ueberhaupt) gilt bewusst NICHTS als "neu" - sonst
    // wuerde ein frischer Install sofort die komplette Historie als "neu"
    // aufreissen.
    function countNewSince(lastSeen) {
      if (!lastSeen) return 0;
      let count = 0;
      for (const entry of CHANGELOG) {
        if (compareVersions(entry.version, lastSeen) > 0) count += 1;
        else break;
      }
      return count;
    }

    function renderEntryHtml(v) {
      const dateHtml = v.date ? `<span class="changelog-date">${formatChangelogDate(v.date)}</span>` : '';
      return `
        <div class="changelog-version">
          <div class="changelog-version-title">v${v.version} ${dateHtml}</div>
          ${v.notable.length ? `<ul class="changelog-notable">${v.notable.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}
          ${(v.refinements || v.bugfixes) ? `<div class="changelog-minor-labels">${v.refinements ? '<span class="changelog-bugfixes-label">Refinements</span>' : ''}${v.bugfixes ? '<span class="changelog-bugfixes-label">Bug Fixes</span>' : ''}</div>` : ''}
        </div>
      `;
    }

    function renderBody() {
      const body = drawer.querySelector('.changelog-drawer-body');
      const lastSeen = getLastSeenVersion();
      const newCount = countNewSince(lastSeen);
      const defaultCount = Math.min(CHANGELOG.length, newCount + INITIAL_OLDER_COUNT);
      if (visibleCount < defaultCount) visibleCount = defaultCount;

      let html = '';
      if (newCount > 0) {
        html += `<div class="changelog-section-label">New since your last update</div>`;
        html += CHANGELOG.slice(0, newCount).map(renderEntryHtml).join('');
        if (visibleCount > newCount) {
          html += `<div class="changelog-section-label">Earlier</div>`;
        }
      }
      html += CHANGELOG.slice(newCount, visibleCount).map(renderEntryHtml).join('');
      body.innerHTML = html;

      if (visibleCount < CHANGELOG.length) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.type = 'button';
        loadMoreBtn.className = 'changelog-load-more';
        loadMoreBtn.innerHTML = 'Load 5 more <span class="changelog-load-more-arrow">↓</span>';
        loadMoreBtn.addEventListener('click', () => {
          visibleCount = Math.min(CHANGELOG.length, visibleCount + LOAD_MORE_COUNT);
          renderBody();
        });
        body.appendChild(loadMoreBtn);
      }
    }

    function openDrawer() {
      visibleCount = 0; // jedes Oeffnen startet wieder beim Standard-Ausschnitt
      renderBody();
      drawer.classList.add('open');
      overlay.classList.add('visible');
      // Markiert erst NACH dem Rendern als "gesehen" (renderBody() oben hat
      // newCount ja schon anhand des VORHERIGEN Standes berechnet) - sonst
      // waere "neu seit dem letzten Update" bei jedem Oeffnen sofort leer.
      if (window.ttpMain && window.ttpMain.getAppVersion) {
        window.ttpMain.getAppVersion().then(v => { if (v) setLastSeenVersion(v); }).catch(() => {});
      }
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
