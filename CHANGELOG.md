# Internal Changelog

## 4.19.0 — 2026-09-26

- Fixed a regression from v4.17.0: the goal-reached ✓/✗ icon lived INSIDE
  the LP-range line's HTML, so hiding the range line (when `startRankTier`
  is unknown) also silently hid the icon - even though reached/missed
  status is independently derivable from the `goal-reached` trophy
  regardless of whether the range is known. `formatChallengeExtra()` now
  decouples them: shows the icon + a short fallback text ("Goal reached"/
  "Goal not reached") when the range isn't available, instead of hiding
  everything. User caught this immediately after the v4.17.0 "don't show
  a half-empty range" fix shipped.
- Challenge History list now caps at showing 5 entries (`max-height: 520px`
  on `.history-list`, empirically measured: 5 × ~96px card + 4 × 10px gap)
  and scrolls internally beyond that, regardless of window height (previously
  it just filled however much vertical space the panel had). Added a
  subtle gold down-arrow hint (`.history-scroll-hint`, absolutely
  positioned, opacity-toggled) that appears only when there's unscrolled
  content below, and disappears once scrolled to the bottom (`scroll`
  listener on `#historyList` recomputes on every scroll).
- **Layout gotcha hit while building the above:** the arrow initially
  rendered in the wrong place (invisible, off in blank space below the
  visible cards) because the wrapping `.history-list-wrap` (needed as the
  `position:relative` anchor for the absolutely-positioned arrow) had
  `flex: 1 1 auto`, letting it stretch to fill more of `.history-panel`'s
  available height than `.history-list`'s own (capped) content actually
  used - so the arrow's `bottom: 0` (relative to the taller wrap) landed
  below the list's real visible edge. Fix: removed `flex: 1 1 auto` from
  the wrap so it hugs `.history-list`'s actual rendered height instead.
- **Testing gotcha:** a CDP test that toggles an opacity-transitioned class
  and reads `getComputedStyle(...).opacity` in the exact same synchronous
  tick can report the PRE-transition value (0), even though the class was
  correctly applied - the transition needs at least one animation frame to
  start interpolating. Don't trust an immediate post-toggle opacity read;
  either check `classList.contains(...)` instead (which is real/immediate),
  or add a short delay before checking computed opacity or screenshotting.


## 4.18.0 — 2026-09-26

Backfill for the `startRankTier`/`startRankDivision`/`startRankLp` fields
added in v4.16.0 - user's real, currently-running challenge (started
earlier the same day, before v4.16.0 shipped) had these fields present in
the schema but empty, so the LP-range line correctly stayed hidden
(v4.17.0 fix) but never got a chance to actually show real data. Verified
directly against the real installed app's data file
(`resources/app/server/data/challenge-history/<puuid>.json` - confirmed
`server/data/` genuinely persists across auto-updates in practice, an
earlier data-loss theory floated while investigating this turned out
wrong).

- `server/lib/challengeHistory.js` `updateEntry()`: now also accepts
  `startRankTier`/`startRankDivision`/`startRankLp` and backfills them onto
  an EXISTING entry - but only if that entry's `startRankTier` is currently
  empty. Never overwrites a real, already-known start rank with a later
  (and by definition less accurate) one.
- `server/server.js` `/api/challenge-history/update`: destructures and
  passes the 3 fields through.
- `public/trophies.html` `loadAchievementProgress()`: now also fetches
  `/api/current-rank` (one extra lightweight League-V4 call) right before
  its existing sync call, and includes the result as the backfill fields.
  Wrapped defensively - a failure here (unranked, API hiccup) just means
  the range stays hidden for this sync, doesn't block the sync itself.
- Net effect: any pre-4.16.0 challenge picks up an approximate start rank
  (whatever rank you're at on your NEXT trophies.html visit/sync) the
  first time this ships, then keeps it forever after. For a challenge that
  just started the same day, this is a very close approximation of the
  real start rank; the drift only matters for older, longer-running
  challenges, which is an acceptable trade-off vs. showing nothing.
- Verified via curl against the real server: seeded an entry with blank
  start rank, synced once (backfilled correctly), synced again with a
  different rank (confirmed NOT overwritten - the guard holds).


## 4.17.0 — 2026-09-26

- **Actually** fixed "Current Challenge" not showing on the first
  trophies.html visit after an app start/update (the v4.15.0 retry fix
  helped but didn't fully solve it). Real root cause: a genuine race, not
  just transient network slowness - `initChallengeHistory()` (fast: 2
  small API calls) can finish and find NO "ongoing" entry simply because
  `loadAchievementProgress()`'s own sync-to-history call (which creates/
  updates that exact entry) is a slower, real match-scan running
  concurrently and hasn't completed yet. No amount of short retrying
  reliably outraces a scan that can take many seconds. Fixed properly by
  making it event-driven: the sync call's `fetch(...).then(() => { ... })`
  now calls `initChallengeHistory()` again once it actually completes,
  guaranteeing a fresh look right after the entry is known to exist/be
  current - regardless of how long the scan took. Kept the v4.15.0 retry
  loop too (still useful for the case where no challenge is running at all,
  or genuine transient errors). Verified via a CDP test simulating exactly
  this race (first list-fetch returns empty, second - after the "sync"
  resolves - returns the entry): confirmed the card is absent after the
  first pass and present after the sync-triggered refresh.
- Challenge History range line ("Start → Goal") no longer shows a
  half-empty `Goal: X` when the start rank isn't known (older/self-healed
  entries) - per explicit user feedback ("goal bringt nichts wenn start
  nicht da auch steht, sonst kennt man die range ja garnicht"), the whole
  line is now omitted unless BOTH ends are known.


## 4.16.0 — 2026-09-26

Challenge History cards (current + past, trophies.html) now show challenge
difficulty, LP range, and a goal-reached ✓/✗ - explicit user request,
answered with a design proposal first ("wie können wir das machen ohne
dass es überladen aussieht") that the user approved before implementing.

- `server/lib/challengeHistory.js` `makeEntry()`: 3 new fields,
  `startRankTier`/`startRankDivision`/`startRankLp` - the rank at the
  moment the challenge was started. Only set at creation (never touched by
  `updateEntry()`), defaults to blank for self-healed entries (pre-existing
  challenges the history feature never saw start, where the historical
  rank can't be reconstructed).
- `server/server.js` `/api/challenge-history/start`: destructures and
  passes the 3 new fields through to `startHistoryEntry()`.
- `public/index.html` Start Challenge handler: `/api/challenge/start`'s
  response already resolves+returns the current rank (`data.current`,
  used there for match-cache seeding) - now also forwarded to
  `/api/challenge-history/start` as the new `startRank*` fields. No new
  API call needed.
- `public/trophies.html`: new `formatTierDivisionH()` (tier+division/LP
  formatting, handles apex tiers showing LP instead of a division) and
  `formatChallengeExtra()` (builds the difficulty label + the "✓/✗ Start →
  Goal" range line, deriving reached/missed from the `goal-reached` trophy
  in the entry's stored `trophies` snapshot). Difficulty folded into the
  existing `.history-meta` line (no new row); range+goal-status is one new
  `.history-range` line per card - kept to exactly one extra line to avoid
  clutter, per the user's explicit ask.
- Ongoing (current) challenge only ever shows ✓ (already reached), never
  ✗ - a still-running challenge hasn't "failed" yet, showing a red X would
  be a premature judgment.
- Graceful degradation: entries without a `trophies` snapshot show the
  range with no icon; entries without a `startRankTier` (pre-4.16.0
  entries, or self-healed ones) show `Goal: <tier>` instead of a
  `Start → Goal` arrow; entries with neither range data show nothing extra.
- Verified via a CDP test seeding 4 fake entries (ongoing+reached,
  past+platinum+reached, past+missed at Master/apex-tier LP formatting,
  past+no-snapshot) and dumping the actual rendered HTML - all 4 variants
  render correctly, confirmed against a screenshot. Also verified the real
  `/api/challenge-history/start` → `/api/challenge-history/list`
  round-trip via curl.


## 4.15.0 — 2026-09-26

- Fixed "Current Challenge" on trophies.html sometimes staying empty the
  first time the page loaded right after app start/an update (only a
  second visit - leave and come back - would show it). `initChallengeHistory()`
  had no retry, so a transient failure (server/network not quite warm yet,
  or the Riot API briefly busy from overview.html's own concurrent batch
  load) gave up permanently instead of just trying again. Added a 2-retry
  loop (500ms, then 1200ms) around the account-resolve + history-list
  fetch. Verified via a CDP test stubbing `fetch` to fail once then
  succeed - confirmed the retry fires exactly once and the card renders.
- Fixed the main window's size/position resetting after an update-triggered
  restart. `ipcMain.on('update-restart-now', ...)` called
  `autoUpdater.quitAndInstall()` without first setting `app.isQuitting =
  true` - since the window's `close` handler intercepts/hides instead of
  closing unless that flag is set (the "X hides to tray" behavior), the
  window never got a clean `close` event before the process died for the
  update, so `electron-window-state`'s final save-on-close likely never
  ran. Now sets `app.isQuitting = true` first, matching the other two
  real-quit call sites (tray Quit item, `app-quit` IPC).


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
