# Internal Changelog

## 4.14.0 — 2026-09-26

Full audit of remaining `display:none`/`hidden`-toggle layout-shift spots
across index.html/overview.html/trophies.html, per explicit user request
to go through "jede Kleinigkeit" (every little thing). Found and fixed:

- `trophies.html` `.rules-status` ("This list reflects the current trophy
  rules" / outdated-rules warning) - was `display:none/block`, now always
  in layout with `min-height: 2.8em` + opacity toggle. This was the one
  the user explicitly reported this round.
- `trophies.html` `.achievements-status` (progress text below the trophy
  grid - cycles through empty → "Loading trophy progress…" → polling
  updates → final "Based on X games…" summary) had NO reservation at all
  before this - added `min-height: 2.8em`.

Audited and deliberately left alone (documented so it isn't
re-"discovered" and re-investigated later):
- `#champSuggestions`/`#enemySuggestions` dropdowns - `position:absolute`
  overlays, don't push sibling layout regardless of shown/hidden.
- `lpGoalDivisionSelect` show/hide (index.html) - changes flex-row width
  only, not height (same-height siblings).
- `#detailSection` (overview.html champion detail) / `#enemyResultSection`
  (opponent analysis result) / `#emptyHint` - "select something to reveal
  its view" pattern, a direct result of an explicit click, not a passive
  load shift. Reserving space for an unselected detail panel would show a
  large empty box by default, which is worse UX than the current reveal.
- `#accountOverviewNoteIcon` (overview.html) - 16px icon in a flex row,
  toggles row width not height.
- `#currentContext` (overview.html) - always set synchronously from
  localStorage at the start of `performLoad()`/`init()`, before any
  `await` - never changes as a side effect of data finishing loading.
- `loadBtn`/`startChallengeBtn`/`summonerSaveBtn` text changing to
  "Loading…"/"Starting…"/"…" - standard button-clicked feedback, width
  change only, and it's the direct/expected result of the exact button
  the user just clicked.
- `.key-error` (settings.html) and the update-window.html download→ready
  transition - real but low-frequency/secondary-window cases, deprioritized
  given the settings window's already-precise scroll-free height tuning
  (v4.10.0) would need re-tuning to add a reservation there; revisit if
  reported.


## 4.13.0 — 2026-09-26

- Fixed the Overview page's "Searching matches …" progress bar (and the
  `#statusMsg` line above it) causing everything below to jump up/down as
  a match search started/finished. `#progressBarWrap` used the `hidden`
  attribute (display:none/flex toggle); now always in layout with a
  reserved `min-height: 20px`, toggled via a `.visible` opacity class
  instead (`showProgressBar()` updated to `classList.toggle` instead of
  setting `.hidden`). `.status-msg` gained `min-height: 2.8em` (reserves
  2 lines - the longest status text, "Start a challenge on the Champion
  Selection page first...", needs both) since it's populated with the
  same search-status text concurrently and was shifting things too.


Private/internal log — **not shown in the app**. The in-app "What's New" drawer
(`public/changelog.js`) is kept short and generic on purpose (explicit user
request: bugfixes there show only as a plain "Bugfixes" label, no
descriptions — the user doesn't care what exactly changed if it doesn't
change a function for them). This file is the detailed reference for
Fabian/Claude to look up exactly what changed and when, going forward from
v4.12.0.

## 4.12.0 — 2026-09-26

- Fixed the champion-search suggestion dropdown (`#champSuggestions`)
  rendering *behind* `#startChallengeBox` instead of in front of it once
  the search input sat lower in a now-more-compact Champion Pool box.
  Root cause: `backdrop-filter` on every `.setup-box`/`.champ-picker`
  panel creates its own CSS stacking context, so the dropdown's
  `z-index: 20` only ever competed within `.champ-picker`'s own context —
  it could never out-rank a later DOM sibling's independent stacking
  context. Fix: `.champ-picker { position: relative; z-index: 5; }` lifts
  the whole box (dropdown included) above later siblings.
- Reduced `.suggestion-list` `max-height` 240px → 190px so the dropdown
  reaches less far down before scrolling internally.
- Page 1 (index.html) was scrollable again after the v4.11.0 layout-shift
  reservations made the Champion Pool row (`.champ-picker`/`.selection-list`)
  taller than before. Trimmed that row specifically (padding 20→14px,
  locked-note reservation 2 lines→1 line equivalent + tighter margins,
  role-icon-btn padding, search input padding/margin, `.champ-picker
  label` size/margin) rather than touching the Summoner/Checklist row
  above it, per explicit user instruction ("mach die 2. Reihe kürzer").
- Dropped the `#selectionError` height reservation added in v4.11.0 (kept
  `#challengeStartError`'s) — champions-locked/max-3-picked errors are rare
  enough that a small one-time shift there is an acceptable trade for a
  shorter box in the common case; `#challengeStartError`'s cases
  ("no champion/summoner/level/LP goal set") were explicitly named by the
  user as ones that must never shift, so that one stays reserved.
- Public changelog.js: bugfix entries no longer render as a description
  list, just a plain "Bugfixes" label (see note in that file's own header
  comment). This file (CHANGELOG.md) is the replacement detail source.

## 4.11.0 — 2026-09-26

- Reorganized the Challenge History panel on trophies.html: the ongoing
  challenge is now a fixed, non-clickable `#currentChallengeBlock` pinned
  above the history list (own heading, divider), instead of being the
  first (clickable) item inside the scrollable list itself. Only past
  entries live in `#historyList` now.
- Fixed `.history-list` not actually scrolling — was missing
  `flex: 1 1 auto; min-height: 0`, so the whole `.history-panel` grew past
  its own `max-height` instead of just the list scrolling internally.
- Added `activeHistoricalEntryId` state: re-clicking the already-active
  history entry is now a no-op (no re-render, no swap-flash replay).
  Drives a new `.history-entry.active` highlight and a `.muted` state on
  the current-challenge card while reviewing.
- `.history-view-banner` no longer hard-toggles `display:none/flex` —
  animates via `max-height`/`opacity`/`padding`/`margin-bottom`/
  `border-width` so entering/leaving the historical view doesn't snap the
  page.
- Fixed trophy card progress bars sitting at different heights depending
  on description line count — `.trophy-name`/`.trophy-desc` now reserve
  `min-height` for 2/3 lines (worst case across all 21 trophies).
- Fixed `overview.html`'s `.site-header` never being `text-align: center`
  (unlike index.html/trophies.html), causing the header to overlap the
  fixed back button at narrow widths.
- Broad layout-shift audit/fix across index.html and overview.html — see
  the `layout-shift-reservation-pattern` memory for the full technique and
  list of elements touched (champ-picker/selection-list flush via shared
  border styling, Start Challenge box states equalized, LP goal
  hint/rank row/locked note/error messages reserve space via opacity
  toggle instead of display:none, summoner overview card's LP graph +
  stats row + extra-stats/form-guide in the champion detail panel all
  reserve their populated-state height).
- Replaced the placeholder example summoner name (was the real dev
  account, Luckshot#796) with ShacoHater#EUW in 3 spots (index.html
  placeholder + 2 error messages).
