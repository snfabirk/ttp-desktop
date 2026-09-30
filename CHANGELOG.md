# Internal Changelog

## 4.27.1 — 2026-09-30

- `build/installer.nsh` (`build.nsis.include`): `customInit` copies
  `$INSTDIR/resources/app/server/data` to `%APPDATA%/three-trick-pony-desktop/ttp-data`
  (only if that doesn't exist yet) BEFORE the old version is uninstalled.
  4.27.0's own migration in dataPaths.js could never see legacy data on an
  auto-update, because the update (driven by the old app) had already
  wiped it - this closes that gap for anyone updating from <=4.26.5 straight
  to 4.27.1+. Build verified (NSIS compiles); the real upgrade path from an
  old install was not exercised.
- What's New: consecutive versions without `notable` text are merged into
  one block ("v4.26.0 – v4.26.5", date range, combined Refinements/Bug Fixes
  labels). "5 older" / "Load 5 more" now count blocks, not versions; new vs.
  older are grouped separately so a block never spans that boundary.
- (Not a code change) The user's lost challenge (26.09. 17:41 – 30.09.
  09:00 UTC) was restored into their history file: since/until recovered
  from leftover localStorage LevelDB records, trophies recomputed from the
  13 real ranked matches with the app's own engine (current rules v3, so
  e.g. Assassin shows 11/6 instead of the remembered 8/4), start rank
  Plat IV from the dev folder's rank history. Entry flagged `restored: true`.

## 4.27.0 — 2026-09-30

- **Data loss on every auto-update fixed.** `server/data` (challenge
  history, rank history, achievement state) and `server/cache` lived inside
  the install dir, which every auto-update replaces - found when the user
  asked why an old challenge was missing from the history (on disk the
  installed app's `data` folder was recreated at 15:27, 2 min after the
  4.26.5 install). New `server/lib/dataPaths.js` moves both to
  `TTP_USER_DATA_DIR/ttp-data` and `ttp-cache` (not `data`/`cache`:
  Chromium already has a `Cache` dir there, Windows is case-insensitive),
  with a one-time copy from the legacy location if the new one doesn't exist
  yet. Dev mode without Electron keeps using `server/`. Factory reset wipes
  both new and legacy dirs.
- Challenge history entries now store `rulesVersion` (achievements.js
  RULES_VERSION) with every trophy snapshot; `/list` returns
  `currentRulesVersion`. trophies.html marks past entries from another rules
  version as "Older trophy list" (card + banner text) instead of anything
  hiding them. Nothing ever filtered by rules version before - the missing
  challenge was purely the data-loss bug above.
- What's New regrouped (explicit user request): only user-relevant changes
  are listed as text; everything else is a count shown as a "Refinements"
  or "Bug Fixes" label. All existing entries re-sorted into the new scheme.

## 4.26.5 — 2026-09-30

- `index.html`/`style.css`: 4.26.4's right-window-edge spot was still not
  what the user meant - the "Overview →" pill now sits directly beside the
  content grid (absolute child of `.content`, `left: calc(100% + 28px)`,
  vertically centered). Arrow-only below 1180px; between 901-1000px (where
  even the arrow would overflow and cause horizontal scroll) it falls back
  to `position: fixed` at the window edge.

## 4.26.4 — 2026-09-30

- `index.html`/`style.css`: the gold "Overview →" pill moved out of the
  top-right icon row ("da oben ist es fehl am Platz") to the right window
  edge, vertically centered. Still `position: fixed` so it takes no grid
  row (no 70%/80% scroll regression). Below 1100px viewport width the
  label hides and it shrinks to an arrow-only button at `right: 8px` so it
  doesn't cover the 860px grid.

## 4.26.3 — 2026-09-30

- `index.html`/`style.css`: the 4.26.2 "Overview" icon (a 34px circle
  matching Settings/Updates/What's New) was immediately rejected by the
  user - "das ist der wichtigste Button... da sieht den keine Sau und ist
  auch voellig unintuitiv." As a same-sized, same-style outline circle it
  had zero visual weight relative to the utility icons next to it, even
  though it's the primary way to proceed past this page. Replaced with a
  solid gold pill button with text ("Overview →"), same position (top
  right, still off the grid so it doesn't reintroduce the 70%/80% scroll
  regression from before 4.26.2), but now unmistakably the most visually
  prominent element in that row - full gold fill + glow instead of an
  outline, larger, with a label instead of a bare arrow.

## 4.26.2 — 2026-09-30

Five small user-requested fixes/tweaks in one batch:

- `overview.html`: had two "Three-Trick-Pony" headings after the 4.25.0
  Role Balance work (the static `.subtitle` in the site header, plus the
  new `otpRoleHeading` paragraph above the champion row). Removed the
  second one; the role now merges into the subtitle itself
  (`renderPageSubtitle()`, was `renderOtpRoleHeading()`) - falls back to
  plain "Three-Trick-Pony" when no role is set yet.
- `changelog.js`: `INITIAL_OLDER_COUNT` 3 -> 5.
- `index.html`: removed the full-width "Go to Overview" banner (`.big-nav-btn`,
  its own grid row `"gobtn gobtn"`) that was making the page scroll again
  at the default 70%/80% window size. Replaced with a small arrow icon
  (`.overview-nav-btn`) in the top-right icon row, right of Settings/
  Updates/What's New - permanently gold-tinted (not just on hover) since
  it's this page's primary action, not a utility icon. Reset Challenge
  (`.reset-challenge-link`) restyled from a small underlined text link to
  a proper bordered red button, matching `#factoryResetBtn`'s Danger Zone
  look in settings.html; bumped `#challengeNotStarted`/`#challengeStarted`
  min-height 94px -> 112px to match its new size. Net effect verified live:
  content bottom now ~1044px vs. the ~1114px budget (80% of a 1392px
  screen), around 70px of margin.
- `electron-main.js` `showUpdateWindow()`: `center: true` centers on the
  *screen*, not the `parent` window, even with `parent: mainWn` set.
  Computes x/y from `mainWin.getBounds()` instead, falling back to the old
  screen-centering only if the main window is unavailable. Not verifiable
  via the browser-only test harness (real Electron BrowserWindow behavior) -
  syntax-checked, logic straightforward, but only actually confirmed on
  next real update flow.

## 4.26.1 — 2026-09-30

Comprehensive bug/visual audit of the Second Role + Role Balance work
(explicit user request: "mach eine umfangreiche bug und test analyse").
Two real bugs found and fixed:

- `index.html` `updateRoleButtonStates()`/`updateChampionLockState()`: the
  Main/Second role-conflict lock was ONLY a CSS class
  (`pointer-events:none`), not the native `disabled` attribute - blocked
  mouse clicks but not a keyboard-triggered (Tab+Enter/Space) activation,
  and `updateChampionLockState()` separately set `btn.disabled = locked`
  on the same buttons, which (depending on call order) could silently
  re-enable a conflicting button. Consolidated into one function
  (`updateRoleButtonStates()`) that is the single source of truth for both
  locked-state and conflict-state `disabled`, called from both places.
  Verified via `btn.disabled` checks in a live browser session.
- `overview.html`: the new "Role Balance" card showed no icon at all
  before the first data load (blank gap), unlike the Trophies card next to
  it which always shows its 🏆 emoji regardless of load state. Now shows
  the same neutral empty-ring placeholder used for the "no games yet"
  state, both in the initial HTML and in `renderRoleBreakdownChart(null)`.

Also verified: no console errors on index/overview/trophies/role/settings
pages, no duplicate DOM ids introduced by the recent edits, all modified
JS files pass `node --check`, no leftover debug artifacts
(`console.log`/`debugger`/`TODO`) in the changed files.

## 4.26.0 — 2026-09-30

- `changelog.js` "What's New" panel rework (explicit user request):
  - Added a `date` field to every entry (backfilled for all pre-existing
    entries from real commit dates / `CHANGELOG.md` headers via
    `git log --pretty=format:"%ad|%s" --date=short`), shown small next to
    the version number (`formatChangelogDate()`).
  - New tiered reveal: all entries newer than `ttp_changelog_last_seen_version`
    (a "New since your last update" section, computed via `compareVersions()`
    - a real numeric x.y.z compare, not string compare, so 4.9.0 doesn't
    sort after 4.10.0) are always shown, plus 3 more older ("Earlier"
    section), then a "Load 5 more ↓" button that reveals 5 more per click
    until exhausted.
  - `ttp_changelog_last_seen_version` is stamped with the current
    `app.getVersion()` (new `get-app-version` IPC handler + preload
    exposure) each time the drawer is opened, AFTER computing what counts
    as "new" for that same open - so it doesn't self-clear instantly, but a
    long stretch of un-opened updates all still show up cumulatively next
    time.
  - Verified live: fresh state (no last-seen) shows 0 "new" + top 3 default;
    seeding `ttp_changelog_last_seen_version = '4.20.0'` correctly surfaced
    all 6 versions above it as "new" (including 4.20.1 > 4.20.0, confirming
    the numeric compare works) before falling through to "Earlier".

## 4.25.0 — 2026-09-30

- Champion Selection page: replaced the single pool-wide role picker with
  two - Main Role and Second Role, both required to start a challenge (kept
  optional for one message, then the user corrected it to mandatory in the
  same request). Second Role can never equal Main Role - each picker greys
  out the button matching the other's current selection
  (`updateRoleButtonStates()`).
- Layout swap on the same page: champion search + "Select Champion Pool"
  label moved into the right column (`.selection-list`), directly above the
  3 champion cards; role pickers now live in the left column
  (`.champ-picker`, relabeled "Assign Roles"). Had to trim several
  paddings/margins (grid gap 22px->16px, champ-card padding, checklist gap)
  to keep the page scroll-free at the default 70%/80% window size after
  adding the second role row + checklist item - verified via a live
  browser test with `document.querySelector('.content').getBoundingClientRect()`
  against the actual screen work area.
- `server.js` `runSummaryBatch()`: new Main/Second/Fill role-breakdown
  classification per game (`mainRole`/`secondRole` params, compared against
  each match's `teamPosition`), returned as `roleBreakdown` in the
  `/api/summary-batch` result.
- Overview page: the OTP champion-pool row now shows a "Three-Trick-Pony
  **Mid**-Challenge" heading once above the row (bold role) instead of
  repeating the role on every card; cards show win rate + games played
  instead. New "Role Balance" donut chart card (SVG, `stroke-dasharray`
  segments) using only existing theme CSS variables (gold/green/text-faint)
  for colors - explicit user request to never introduce a separate palette.
  Links to a new `role.html` stub page (placeholder content only, real
  design TBD in a follow-up).

## 4.24.0 — 2026-09-30

- `achievements.js` RATES: `duelist` and `assassin` targets raised 50% on
  all 5 difficulty tiers (explicit user request). RULES_VERSION bumped to 3.

## 4.23.0 — 2026-09-30

- `trophies.html`: provisional (Ø-average) trophies now always render their
  live current/target numbers in the progress label instead of a
  placeholder sentence. Added a small hourglass badge (`position:absolute`,
  zero layout footprint - verified via live browser test with worst-case
  synthetic values) with a native `title` tooltip carrying the short
  explanation that used to live in the label text.

## 4.22.0 — 2026-09-30

- Root cause of a multi-day user report ("15-minute background refresh
  never updates the page"): the background job in `electron-main.js`
  correctly refreshes the server-side cache/rank-history every 15 minutes
  regardless of window state (confirmed via cache file mtimes exactly on
  `:00/:15/:30/:45`), but neither `overview.html` nor `trophies.html` ever
  re-rendered themselves afterward - they only loaded once on page open.
  Added a page-local `scheduleNextPageAutoRefresh()` to both, aligned to
  the same quarter-hour clock with a small buffer, that re-triggers
  `performLoad()`/`loadAchievementProgress()` while the page is open.

## 4.21.0 — 2026-09-30

- `runAchievementsBatch()` in `server.js`: removed the champion-pool/role
  match filter entirely - all 21 trophies now count every ranked solo game
  since challenge start, account-wide, matching the "overall" numbers
  already shown on the Overview page (explicit user request after noticing
  Win Streak stuck at 4/3 despite a real 6-game streak elsewhere).

## 4.20.1 — 2026-09-30

- `trophies.html`: `.trophy-progress-label` is now bold and slightly larger
  (0.6rem -> 0.68rem), using `--text` instead of `--text-dim`, for
  readability (explicit user request).

## 4.20.0 — 2026-09-26

- Challenges closed with `unlockedCount === 0` no longer get saved to
  Challenge History - explicit user request for the exact scenario of
  starting a challenge, immediately deciding to tweak a setting (LP goal,
  difficulty, etc.), and resetting/restarting right away. `updateEntry()`
  (`server/lib/challengeHistory.js`) now removes the entry from the array
  entirely (instead of just closing it with `until` set) when `ended:
  true` AND the final `unlockedCount` is 0. Scoped to only the `ended`
  path - an ongoing challenge legitimately starts at 0/21 and must not be
  deleted just for that.
- Verified via curl: an entry closed with 0 trophies is dropped from the
  list; one closed with ≥1 trophy is kept.
- **Only applies going forward** - doesn't retroactively purge existing
  0-trophy entries already in a user's history file. Found 6 real
  examples of exactly this in the user's own installed-app data while
  verifying the fix (rapid start/reset cycles from earlier the same
  session) - offered to clean them up directly but the auto-mode
  permission classifier blocked editing the real installed app's live
  data file as "irreversible local destruction," which is the right call
  for a change like that outside of an explicit go-ahead. User can delete
  old junk entries manually via the existing "×" button on each history
  card; a retroactive cleanup could be added later if asked (e.g. a
  one-time filter pass in `listEntries()` or a migration on read).


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
