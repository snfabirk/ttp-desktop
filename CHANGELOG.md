# Internal Changelog

## 5.25.2 — 2026-10-10 (incl. unreleased 5.25.0/5.25.1)

- Pass coins are claimed by hand (user): claimPassRewards puts coin tiers into pass.pendingTiers and 30+ steps into pass.pendingOverflow instead of state.coins (cosmetics stay automatic). POST /api/pass/claim { tier } | { overflow } | { all }. Older months' pending coins are credited automatically in readState (settleOldPasses). Pass grid: pulsing claimable tiles with a "Claim" tag, "Claim all · 🪙 X" next to the balance (2+ pending), "Claim 🪙 X" in the 30+ row; coins fly into the balance (WAAPI) and it counts up. Only the app's own animation setting disables the flight (Windows reports prefers-reduced-motion on this machine).
- Pass cosmetics (tiers 5-30) are claimed by hand too: they wait in pendingTiers (readState no longer auto-adds pending cosmetic tiers), claiming adds them to the inventory and a copy of the tile icon flies to the "Profile" nav tab, which pings (the clone gets the tile icon's size/opacity inline and copies canvas pixels - border icons were unstyled outside .pass-tier and flew invisibly). Claim all label shows coins + item count.
- Challenge page "Closest next": average trophies (AVERAGE_TROPHY_IDS) excluded.
- Shop wording "Active buffs" -> "Active effects" (+ slot/remove messages).

## 5.24.1 — 2026-10-10

- Magma Heart+: rock and lava are shaded separately and blended near the lake surface (smoothstep on the rock hit height) instead of a hard per-pixel rock-or-lava choice - removes the stair edges where the side walls meet the lake.
- Magma Heart / Magma Heart+: cards 78% opaque (was 60%) and a lighter --text-faint, so small labels stay readable in front of the bright lavafall.

## 5.24.0 — 2026-10-10

- 4 daily offers (DAILY_OFFERS, user: more choice = deliberate decision). Same-day shops with fewer slots are topped up without re-rolling the existing ones; daily grid 4 columns (2 below 1000px).
- Unaffordable prices: offers and Daily Goods keep showing the price (goods used to say "Not enough coins") with a red .short style, tooltip "Not enough coins".
- Shop previews of the standing Refined/Basic frames (circuit, kintsugi, origami, carved, mosaic, linen, night) are scaled down like the creature frames (Kintsugi covered its own name); voucher texts stay on one line.

## 5.23.1 — 2026-10-10 (incl. unreleased 5.23.0)

- Profile editor inventory (user design): "Monthly Pass" group = ONLY the running month's pass items; everything else (older pass items, shop, base) grouped by rarity Animated+ > Animated > Fancy > Refined > Basic, owned first then locked. Default/No frame and the 8 base themes lead the Basic group. Empty groups are skipped.
- "Show locked / Hide locked" button next to the collected counter: locked items are HIDDEN by default and it resets every time the editor opens (user); counter row wraps in the narrow panel.

## 5.22.3 — 2026-10-10

- Profile editor inventory: the whole "Shop" group was missing in all three tabs (bought shop items counted in x/y but were not listed). The catalog sends the display label source "Shop", the grouping compared against "shop"; it now groups by !passMonth && !base.

## 5.22.2 — 2026-10-10

- Voucher (user): only for TODAY's daily offers, expires at the next daily reset (granted with expiresAt = nextDailyReset; the "24h from first shop open" logic is gone). Weekly offers no longer show the voucher button; server rejects non-daily ids.
- Pass 30+ row: label is always "30+" (endless), step pills stay; short tooltip on the +5 ticket.

## 5.22.1 — 2026-10-10

- Shop hover previews feel instant when moving from item to item: no second 250 ms delay while a preview is open / was closed <400 ms ago.
- Shader theme live previews (magma, magma+, aurora, lanterns, sky isles): one compiled WebGL context per theme, reused on every hover
  (before: a new context + ~140 ms shader compile on EVERY hover, never released - Chromium started dropping old contexts after ~16).
  Offered themes are pre-drawn once at preview size shortly after the shop loads (requestIdleCallback never fired on this always-animating page).

## 5.22.0 — 2026-10-10

- Voucher (user idea): at pass step 30+5 (once per month, pass.voucherGranted) state.voucher is granted; the 24h start on the first
  /api/shop call after that (expiresAt null until then) so it can't run out while the app sits in the tray. Own slot under the buffs
  (not one of the 3). Redeem: POST /api/shop/buy { id, voucher: true } - Refined/Fancy offers in daily AND weekly, price 0, coupon untouched.
- Pass 30+ row: label shows the current step (30+N), step pills +1..+5 with the ticket on +5 and a status note.

## 5.21.0 — 2026-10-10

- Pass balance (user: "auch mal abschalten können"): PASS_XP_PER_TIER 1500 -> 1200 (tier 30 = 36,000 XP, ~46 pool games / ~32 with quests);
  30+ steps OVERFLOW_XP_FIRST 2500 -> 2000, OVERFLOW_XP_GROWTH 500 -> 300 (30+5 = 13,000 XP). Coins per tier unchanged.
  Players mid-month jump tiers on update; claimPassRewards hands out every skipped tier once.

## 5.20.1 — 2026-10-10

Layout audit of every page in every state (full / empty / long names / API errors / live game) at default, 1280, 1000 and minimum size:
- Main window minWidth 1120 / minHeight 700 (capped to the screen); below that the Setup button overlapped the nav. Settings size sliders now start at the minimum (getWindowInfo returns minWidth/minHeight).
- Overview: status line no longer pushes into the Live card when it is long (single line, ellipsis, full text as tooltip); "Today" shows a message when quests fail to load; flush-column sync without 1px rounding drift; "View profile →" hidden below 1350px so the name is not cut at minimum size (name has a tooltip).
- Pass tile (overview + champion): "Tier x / y | LP Bank" wraps as whole segments instead of running into the card padding.
- Challenge: load error no longer sits on top of the Goal Progress card (fits the 14px gap, tooltip for full text).
- Profile: without profile data shows "–" instead of a fake Level 1 / 0 coins / 0 XP.
- Trophies: load error shows "–" + the message right under the summary instead of "0%" and a line at the very bottom.
- Shop: Animated+ is only offered when it was actually rolled (the "sold out, go one rarity higher" fallback skipped from Animated straight to Animated+).

## 5.20.0 — 2026-10-10

- 28 shop cosmetics ported from theme-lab (shop-cosmetics-2.js, shop-scenes-2.js, loaded by nav.js after the v1 files):
  themes Magma Heart+, Magma Heart, Neon Overdrive (dev), Aurora, Lantern Festival, Sky Isles, Cherry Blossom Night, Arctic Shore;
  borders Optic Scan (dev), Lantern, Hextech Prism, Bubble, Nacre, Sunburst, Bronze;
  frames Spirit Dragon, Kraken, Phoenix, Netrunner HUD (dev), Runic Vines, Circuit Board, Kintsugi, Origami, Carved Wood, Mosaic, Linen, Night.
  Every Animated item has its own click easter egg. Shop pool now 60 items.
- New rarity Animated+ (crimson, flickering glow; prices 2600/3000/4000; daily 0.5%, weekly 2%).
- Developer's Choice badge on homage items (offerView.devChoice).
- Shop: big creature frames preview scaled down so they fit their card.
- Overview: both columns start and end flush (status line floats above, shorter column's last card grows).

## 5.19.1 — 2026-10-09

- Theme hover preview: 460x270 mini app (nav, title, cards in theme colours) over the live scene (TTPThemePreviewLive; starfall/koi run their real scene scaled down, others still images). Fixed a console error when hovering a theme while a frame is equipped.

## 5.19.0 — 2026-10-09

- 33 shop cosmetics (cosmetics.js source 'shop'; designs from theme-lab/shop-*.html):
  5 Animated (Deep Abyss, Neon City, Storm Crown, Obsidian Crown, Arcane Circuit),
  8 Fancy, 14 Refined, 6 Basic. Placeholder SHOP_ITEMS removed; stale offers re-rolled.
- public/shop-cosmetics.js: canvas renderers for shop borders/frames, registered via
  TTPCos.register (cosmetics-fx.js), one shared loop, honours fx-off/fx-paused.
- public/shop-scenes.js: theme scenes registered via TTPThemeFx.register (theme-fx.js);
  TTPThemePreview for small stills. Theme colours appended to style.css.
- Buying: POST /api/shop/buy (only items in your current offers, 20% coupon consumed),
  two-click confirm, live previews in offers, hover preview on your own profile.
- Overview shop tile now links to the shop; editor inventory grouped Pass / Shop / Basic.

## 5.18.2 — 2026-10-09

- Buff removal (user design): ✕ on hover, two-click "Remove? Coins are lost",
  no refund, 24h cooldown (`state.lastBuffDiscardAt`,
  POST /api/shop/buff/discard); during the cooldown the ✕ shows the time left.

## 5.18.1 — 2026-10-09

- Max 3 active buffs (MAX_BUFFS, "Buff slots full"); the buff bar always
  shows 3 slots ("Free slot" placeholders) + "x / 3".
- Daily Goods: empty slot has the same height as a filled one (128px).
- Shop columns are flex columns stretched to equal height, so both end at
  the same line; the left cards share the extra height; preview note moved
  below the whole grid.

## 5.18.0 — 2026-10-09

- Consumables (progression.js CONSUMABLES): 2 daily slots under the wheel
  (30% each empty, no duplicates), bought = used immediately, one buff per
  kind at a time, buffs expire (`state.buffs`, pruned on read):
  Double XP (+100% LEVEL XP only, next 3 games, `ledger.levelBonus`),
  LP Bank Booster (+50% on the next full bank, level + pass), Fresh Stock /
  New Highlights (reroll daily/weekly offers, pity untouched), Bonus Quest /
  Bonus Weekly (`state.bonusQuests`, BONUS_WEEKLY_POOL, rendered as a dashed
  "Bonus" row), 20% Coupon (buff, applied once buying exists), Mystery
  Cosmetic (random unowned, not basic, not the running pass), Try It On
  (24h rental, auto-equipped; rented items usable but not counted as
  collected; /api/theme-access + theme-fx.js revert expired trial themes).
- POST /api/shop/consumable {slot, choice}; two-click "Use now?" confirm.

## 5.17.2 — 2026-10-09

- Shop: the "?" now reads "Prices & rates ?" (like "How to earn XP ?" on the pass page), right-aligned in the Weekly Highlights header.

## 5.17.1 — 2026-10-09

- Shop "?": rates section renamed "Rates", columns "Daily offer" / "Weekly
  highlight" + intro line (user read the old columns as Frame/Theme);
  earlier-pass chance explained as a sentence (any type, priced by rarity).

## 5.17.0 — 2026-10-09

- Quests live (XP only, no coins): runSummaryBatch stores per-game quest
  stats (role, duration, cs, damage, dragons, epic monsters, solo kills,
  vision, control wards, kill participation) in the ledger and calls
  progression.creditQuests; getOverview evaluates + credits too (only with
  role/champion context). questLedger keys `d:<day>:<id>` / `w:<week>:<id>`
  make every quest count once per period; done quests can't be rerolled.
  Older ledger entries have no stats -> stat quests can't be met by them.
- 16 Basic cosmetics (`border-base-<theme>`, `frame-base-<theme>`, base:
  true): owned by everyone (ownsCosmetic/ownedList), simple ring gradient /
  frame in the theme's colours; editor groups Monthly Pass vs Basic.
- Shop "?" (Weekly Highlights header): price table + base chances per
  offer (from /api/shop `prices` / `odds`).

## 5.16.0 — 2026-10-09

- Rarities Basic / Refined / Fancy / Animated (cosmetics.js `rarity`,
  `PRICES`, `priceOf`): border 0/500/1,000/1,600, frame 0/650/1,300/1,900,
  theme 0/900/1,600/2,400. October pass: t5/10/15 refined, t20/25 fancy,
  t30 animated. Colours as --rar-* in cosmetics.css; tags in the editor
  collection and on shop offers.
- Personal shop: offers rolled once per day/week and stored in
  progression state (`shop`), owned items never offered, daily and weekly
  never show the same item; rotation rules are intentionally not
  described anywhere user-facing (see the comment in progression.js).

## 5.15.0 — 2026-10-09

- Collection view (user is a completionist): /api/profile-stats returns the
  full `catalog` (with source text, e.g. "October 2026 Pass · tier 20");
  the editor lists all cosmetics, missing ones greyed out with a lock, not
  clickable (no data-* attribute), tooltip with the source; "Collected x / y"
  bar per tab + x/y in the tab labels (base themes count as owned; default
  border / no frame don't count).

## 5.14.0 — 2026-10-09

- Economy (user decisions): pass 30+ steps grow by 500 XP each
  (2,500 / 3,000 / 3,500 ...; still 100 coins, already claimed steps kept);
  quests give NO coins; placeholder shop prices ~doubled (border 500/1,000,
  frame 650/1,300, theme 900/2,000 simple/fancy).
- Wheel remembers today's result (`wheel.lastIndex`, `todayIndex` in
  /api/shop); the small wheel stays rotated onto it until the next spin.

## 5.13.1 — 2026-10-09

- Small visual tweak on the shop page.

## 5.13.0 — 2026-10-09

- Provisional shop (`public/shop.html`, nav "Shop" now live): daily 3 offers
  (rotate with the quest day, 06:00) + weekly 2 shop-exclusive highlights
  (Monday 06:00), seeded per day/week from placeholder pools in
  progression.js; items not purchasable yet, prices are placeholders.
- Lucky Wheel: small SVG wheel, click -> zooms to the screen centre (overlay),
  one free spin per quest day (server-side `wheel.lastSpinDay`, second spin
  -> 400), placeholder coin segments/weights; result credited to coins.
- One small private extra on the shop page.
- Pass coins per tier: 80 (1-10) / 100 (11-20) / 120 (21-30), total 2,400
  unchanged; already claimed tiers keep what they paid.

## 5.12.1 — 2026-10-09

- Profile identity widget (row sizes): CSS grid, picture always centered in
  the first grid cell, name always starts at the second cell; all borders
  share one picture size (70% of a cell, was up to 100px / 66px for the
  overhanging ones), overhanging borders may spill over the widget edge
  (widget overflow visible, z-index 2); pumpkin side margin disabled there.

## 5.12.0 — 2026-10-09

- Theme Lab designs ported into the app (user-approved demos in theme-lab/).
- `public/theme-fx.js` rewritten: scenes with mount/unmount.
  - hallows: static DOM scene behind content (moon mirrored, bats, hills,
    tree + lantern, graves, fence + cat, candles, pumpkins); cat easter
    egg via position click (5x).
  - haunted: WebGL fog/moon/stars + 2D canvas (lantern hole following the
    mouse, 9 ghosts fleeing the light, dimmed lightning + manor); ghost
    easter egg (5 ghosts -> boss BOO). Clicks on interactive elements
    never count.
  - Container opacity = animation level; old body::before/::after decor
    and .theme-fx-canvas removed.
- New `public/cosmetics-fx.js` (loaded via nav.js): MutationObserver
  decorates every `.cos-border` with its border deco (pumpkin shell +
  candle glow + side margin; Widow's Nest ring/webs/dew + dangling
  spider >=64px + crawler, one shared rAF loop that pauses with
  fx-off/fx-paused). `TTPCos.decorateFrame(wrap, id)` builds Cobweb
  (corner webs, sag thread, draft sway) and Ectoplasm Manor (ecto edge,
  hover/intro vines, subtle 3D tilt off in edit mode).
- Renamed: Haunted Halo -> Widow's Nest, Haunted Manor -> Ectoplasm Manor
  (ids unchanged, so ownership/equipped survive).
- Profile identity widget: smaller picture for the overhanging borders so
  they are no longer clipped top/bottom.

## 5.11.1 — 2026-10-09

- Profile identity widget: "Challenger since" -> "Pony since" (Challenger reads like the LoL rank).

## 5.11.0 — 2026-10-09

- Theme picker removed from Settings; all themes (8 basic + owned pass
  themes) live in the profile editor's inventory, tab order Themes /
  Borders / Frames / Stickers. Settings keeps "Animations" (off / while
  using / always) + ensureOwnedTheme after an account reset; settings
  window 772 -> 750px.
- theme-fx.js also toggles `html.fx-off` / `html.fx-paused`, cosmetics.css
  stops / pauses all border + frame CSS animations accordingly.

## 5.10.0 — 2026-10-09

- New monthly structure (user design): tiers 5/20 = profile picture border
  (simple/fancy), 10/25 = profile frame around the widget board
  (simple/fancy; fancy draws in once on open, pulses on click, optional
  background toggle), 15/30 = app theme (simple accents / animated).
  October 2026 = Halloween: Pumpkin Ring, Cobweb, All Hallows, Haunted
  Halo, Haunted Manor (+ night background), Haunted Night (animated).
  The old test borders are gone; readState re-grants the current
  cosmetic of every already-claimed cosmetic tier (idempotent) and drops
  unknown ids from inventory/equipped.
- `public/theme-fx.js` (loaded via nav.js): canvas at z-index -1 behind the
  content (haunted theme moves the page background to <html>, body
  transparent); ghosts, occasional bat, fog; 30fps; setting
  `ttp_theme_anim` off / active (mouse in window or < 5s since last input)
  / always, smooth fade in/out, nothing while hidden. Deliberately NOT
  tied to OS prefers-reduced-motion (the user's Windows has it on, which
  had silently disabled ALL cosmetic animations, incl. spinning borders).
- Settings: owned pass themes as "Monthly Pass" optgroup (fallback to
  Classic if not owned), "Theme animation" select replaces the hint line;
  settings window 760 -> 772px (fits 735/735).
- Profile editor inventory: Borders / Frames (+ "Show profile background")
  / Themes (personal, applied immediately) / Stickers (soon).
  equip types frame + frameBg. Pass tiles show frame/theme previews.
- Bug: "?" hint popups vanished behind the next glass box (each
  backdrop-filter box is its own stacking context) -> box with an open
  hint gets z-index 40 via :has().

## 5.9.0 — 2026-10-09

- Welcome popup (nav.js `maybeWelcome`): only if `ttp_welcome_seen`,
  `ttp_summoner_name` and `ttp_challenge_start` are all missing (fresh
  install / factory reset clears localStorage; existing users never see
  it). 4 short steps, Setup button glows above the dim overlay with a
  "Setup is always up here" bubble; button "Let's go" (on Setup) or "Go to
  Setup" (elsewhere) sets the flag.

## 5.8.2 — 2026-10-09

- Challenge page Roles & Picks legend: "Fill" -> "Off role / Fill".

## 5.8.1 — 2026-10-09

- Nav pill: when no item is active (Setup page), the pill no longer grows
  from the left edge (left 0 / width 0) to the target - it is placed at the
  target and pops in (opacity + scale 0.7 -> 1). Tab-to-tab still slides.

## 5.8.0 — 2026-10-09

- Nav items now Overview (home: icon + gold ring always) / Profile /
  Challenge / Pass / Trophies / Shop (disabled "soon"). Setup is a separate
  `.setup-btn` text pill top-right (right:188px, left of the changelog
  button). Trophies is top-level (no back link anymore); role/champion keep
  "← Challenge".
- Sliding `.nav-pill` behind the active item: on a nav click the pill
  animates (0.18s) to the target, navigation follows after 170ms; placed
  without animation on load, re-placed on fonts.ready/resize.
- Nav links more compact (padding 11px), static breakpoint raised to
  1640px (overlap with the title measured up to ~1560px).

## 5.7.2 — 2026-10-09

- nav.js global click guard (capture phase): links to the current page do
  nothing (active nav item also gets cursor:default), and once a navigation
  started, further internal link clicks are ignored (reset on pageshow).
  Tested: 4x Pass on Pass = 0 reloads, 4x Overview = 1 navigation.

## 5.7.1 — 2026-10-09

- Activity feed: player name (gameName without #tag, ready for friends) +
  colored won/lost / gained LP.
- nav.js: `PARENTS` map adds a "← Challenge" back link under the nav on
  trophies/role/champion (`.sub-back`).
- Full test pass (all 8 pages + settings window: no JS errors, no failed
  requests; reset+start challenge, changelog panel, quest reroll,
  opponent analysis + search, favorite champion widget, cancel, light
  theme, narrow widths). Fixes from it:
  - Bug: nav overlapped the page title between ~1150 and ~1450px width (and
    the trophies title, which sat over the left column only) -> nav goes
    static above the title below 1460px; trophies h1/subtitle span the
    full header grid.
  - Bug: in profile edit mode the side panels covered the board below
    ~1300px -> board shrinks to fit between the panels.
  - "Champion Selection page" texts renamed to "Setup page".
  - Last Game XP gets a backdrop (unreadable over bright splash art in the
    light theme).
  - Settings "Reset Account Progress" text now mentions coins, borders and
    profile layout (still fits without scrolling: 723/723px).

## 5.7.0 — 2026-10-09

- Old overview.html (pony selector, record, matchups, last 10, Load button
  with cooldown, opponent analysis) moved to `champion.html` (copy with the
  profile card/tile grid removed, null guards, `?champ=<id>` preselect).
  Pony cards on challenge.html link there; nav marks it as Challenge.
- New overview.html written from scratch as home screen: left profile card,
  2x2 tiles, Last Game (+ LP Bank bar); right Live Game, Today (game pips +
  dailies), Activity (own games + LP bank events, friends placeholder).
  Runs the summary scan on open and every quarter hour (W/L, matchups, XP
  credit) + achievements job for the trophy %.
- `GET /api/live-game` (spectator-v5 `getActiveGame`, 404 -> not in game):
  me/allies/enemies with smite flag; overview polls every 60s while visible,
  shows your record vs each enemy from the pony's matchups.

## 5.6.0 — 2026-10-09

- `public/nav.js` + `.top-nav` (style.css): fixed main nav top-left on all
  pages (Setup/Overview/Challenge/Pass/Profile; trophies+role count as
  Challenge). All back-arrow buttons removed. Static below 1150px width.
- challenge.html tabs replaced by views: `challenge.html` (Challenge) and
  `challenge.html?view=pass` (Pass & Quests). Overview grid now Challenge
  (Day N | role), Pass, Trophies, Shop; Roles & Picks card removed, the
  Roles card on the Challenge page links to role.html.
- Profile editor: 21 widgets in 5 groups (Stats, Champions, Progress,
  Personal + identity), many more sizes per widget (identity 6x1/4x1/3x2,
  bio 1x1..6x1/2x2/3x2, ...), live content preview while resizing, new
  widgets are dragged from the left panel (mini grid preview of the
  default size, ghost preview on the board, red if blocked). Size badge
  only on hover. New lifetime stats for widgets: pass, lpBank,
  recentGames, bestWinStreak, poolGames.

## 5.5.0 — 2026-10-09

- profile.html rebuilt as a widget board: 6-column grid (square cells via
  container query units), widget catalog `WIDGETS` with allowed sizes per
  type and size-aware render (identity 6x1 fixed; challenges/games 2x1,3x1,
  6x1; mostPlayed 1x1,2x1,2x2,3x2; rank 1x1,2x1; winrate/level 1x1;
  trophies 1x1,2x1; bio 2x1,3x1,6x1,3x2 with editable text).
- Edit mode ("Edit profile" text button below): slot outlines, drag to move
  (snap, overlap rejected), corner handle snaps to the nearest allowed
  size, x removes; left panel adds widgets / Save / Cancel / reset; right
  panel = cosmetics inventory with tabs (Borders live, Backgrounds/
  Stickers/Themes placeholders). Border equip applied on Save.
- Layout persisted in progression.json `profileLayout` via
  `POST /api/profile/layout` (validated: <=40 widgets, in bounds, bio text
  <=280 chars); returned by /api/profile-stats.

## 5.4.1 — 2026-10-09

- Challenge tab filled (user: looked bare): Goal Progress bar (start snapshot
  from /api/rank-history points[0] -> current -> LP goal), 3 pony cards with
  splash art (byChampion: W/L, KDA, CS/min, lane WR), Roles split (main /
  second / fill from roleBreakdown), Trophies mini card (closest 3 from
  ttp_last_trophy_snapshot, excluding provisional >=100% avg trophies).

## 5.4.0 — 2026-10-09

- challenge.html: tabs "Challenge" (account card + LP graph) / "Pass &
  Quests" (quests, XP, pass); last tab remembered in localStorage
  (`ttp_challenge_tab`). Level row removed (lives on the profile).
- Recent XP + LP Bank merged into one "XP" card.
- Pass bar now shows XP inside the current tier (tier count is visible in
  the grid); full when the pass is complete.
- `coinsForTier`: 50 (1-10) / 100 (11-20) / 150 (21-30), same 2,400 total.

## 5.3.1 — 2026-10-09

- Overview: profile card stays full width, Challenge & Pass / Trophies /
  Roles & Picks / Shop (placeholder, "Coming soon") now a 2x2 tile grid.

## 5.3.0 — 2026-10-09

- Monthly pass (progression.js): `state.passes['YYYY-MM'] = { xp, claimedTier,
  claimedOverflow }`, XP goes to the month of the game (LP bank: month of the
  fill). No challenge reset anymore. Tiers 5/10/../30 = that month's
  cosmetics from the new `server/lib/cosmetics.js` (fallback 300 coins if a
  month has none), other tiers 100 coins, 30+ = 100 coins per 2,500 XP.
  Rewards claimed once per tier per month. Old `passXp` state is migrated
  by rebuilding passes from the ledger + LP bank events.
- Coins, inventory, equipped border in progression state;
  `POST /api/cosmetics/equip`. 6 test borders for October 2026 in
  `public/cosmetics.css` (class `cos-<id>`, wrapper `.cos-border`).
- challenge.html: pass box shows month, ends-in, coin balance, reward per
  tier, 30+ bar; box fills the column height evenly (rows 1fr).
- profile.html: border shown on the profile icon, coin pill, "Borders" list
  to equip; overview profile card shows the equipped border.

## 5.2.2 — 2026-10-09

- Overview "Challenge & Pass" card: tier and LP Bank separated by a thin
  vertical divider instead of a dot (user: dot not enough).
- challenge.html: both progression columns stretch to equal height, the last
  card in each column fills the remaining space.

## 5.2.1 — 2026-10-09

- Level curve: `xpForLevel` = min(4000, 2000 + 100 x (level-1)) instead of
  2000 + 250 x (level-1) without cap (user: far too steep). Level 20 now
  ~85 games instead of ~135, level 50 ~270 instead of ~625. Pass stays
  linear at 1500/tier (user likes that).

## 5.2.0 — 2026-10-09

- profile.html renamed to challenge.html ("Challenge & Pass": account card,
  quests, pass, LP Bank, Recent XP) - user wants everything about the current
  challenge to stay together there. Tightened vertical spacing, right column
  now Recent XP -> LP Bank -> Challenge Pass, explanatory notes moved behind
  "?" hover hints (`.hint` / `.hint-pop`).
- New profile.html = real player profile built from scratch: icon (future
  border slot), name, level bar, lifetime stats from `/api/profile-stats`
  (challenge history + progression ledger), most played, locked cosmetic
  slots placeholder.
- Overview: profile card -> profile.html, new "Challenge & Pass" card below
  it -> challenge.html (shows pass tier + LP Bank).
- Ledger entries now also store champName (for "Most Played").

## 5.1.0 — 2026-10-09

- Games now actually award XP (first real XP source). `progression.creditMatches()`
  is called at the end of every `runSummaryBatch` scan (Overview/Profile/Role
  page + 15-min background refresh) with every non-remake ranked game since
  challenge start. Per game: category XP (pool 500 / main other 300 / second
  250 / off 50) + win 150 + 10 per kill + 5 per assist, halved from game 6
  of the quest day (06:00 reset). Each matchId credited once ever (ledger), so the user's
  pre-existing games since challenge start get their XP retroactively.
- Pass XP resets when the challenge start changes; level XP never does.
- XP multiplier (difficulty x LP distance, v5.0.0) removed completely: it was
  freely chosen at start and boosted every game without having to reach the
  goal (user: abusable). index.html badge, /api/progression/multiplier and
  ttp_xp_multiplier are gone.
- LP Bank (`progression.creditLp`): each scan compares the current comparable
  LP with the last seen value; only gains go into a 0-100 bank, overflow
  carries over, +1000 XP (level + pass) per fill. First run seeds from the
  challenge-start snapshot; account switch = new baseline, no credit. If
  several games happen between scans only their net gain counts.
- Profile: new "Recent XP" card (last 5 credited games, breakdown in tooltip),
  "games today" pips now real, kill/assist rows split. "How to Earn XP" card
  replaced by a hover popup in the Recent XP header; new LP Bank card.
  Quests and trophies still don't award XP.

## 5.0.3 — 2026-10-08

- Removed the temporary pass demo again (`DEMO_PASS_XP` gone). The v5.0.2
  GitHub release + tag were deleted on the user's request ("nicht update
  worthy, nur fuer mich"), and 5.0.2 is gone from the in-app What's New.
  The clearer unlocked/current tier styling from 5.0.2 stays (listed as a
  refinement under 5.0.3). Version continues at 5.0.3 because the user's
  own install already runs 5.0.2.

## 5.0.2 — 2026-10-08 (release deleted)

- TEMPORARY demo (user wants it removed again right after): `DEMO_PASS_XP`
  in server/lib/progression.js forces the pass to tier 15 + 900/1500 XP,
  "· DEMO" next to the tier count. Set it to null to remove.
- Pass grid styling: unlocked tiers stronger (30% gold fill, light text),
  the tier being worked on gets a gold frame/glow + a mini progress bar
  along the bottom (XP into that tier in the tooltip).

## 5.0.1 — 2026-10-08

- XP preview: win bonus added (user: "Sieg-Bonus ja"), placeholder +150 XP
  on top of the per-game XP, any category. Multiplier confirmed to apply
  to ALL XP; label now reads "Multiplier on all XP".

## 5.0.0 — 2026-10-08

- XP system, PROVISIONAL UI preview only (no XP is awarded yet, all at 0).
  `server/lib/progression.js`: placeholder numbers (per game 500/300/250/50
  for pool champ / main role other champ / second role / off-role, 10 per
  kill+assist, 750 per trophy, all XP halved after 5 games/day), level
  curve 2000 + 250*(level-1), pass 30 tiers x 1500 XP, difficulty
  multipliers (easy 1.0 .. majestic 1.5) x LP distance factor
  (1 + min(0.5, (dist-200)/2000)). Daily quests: First Win + Champion of
  the Day (seeded by date from the pool) + 1 role quest (1 reroll/day);
  weeklies: 2 wins with each champ, 3-win streak (any champ), +75 LP.
  Day boundary 06:00 local, week Monday 06:00. State in
  userData/ttp-data/progression/progression.json.
- API: GET /api/progression, POST /api/progression/reroll,
  GET /api/progression/multiplier, POST /api/progression/reset.
- profile.html: level badge + XP bar in the account card, Daily/Weekly
  Quests (progress bars, XP values, games-today pips 1-5 then "5+ · ½ XP"
  with hover explanation), Challenge Pass grid, "How to Earn XP" table and
  the challenge multiplier.
- index.html: "XP ×N" badge top-right in Summoner & Challenge (absolute,
  no extra row - page 1 still fits without scrolling); preview from level +
  LP distance, locked into localStorage `ttp_xp_multiplier` on start,
  removed on reset.
- settings.html: "Reset Account Progress" under the factory reset; window
  height 725 -> 760 so it still doesn't scroll.
- overview.html: "Lv N" pill on the compact profile card; "View profile"
  hidden below 760px width so the name has room.

## 4.29.0 — 2026-10-08

- Profile moved to its own page `public/profile.html` (full account card:
  icon/name/rank-note, W/L, rank, LP since, streak, LP goal, challenge
  timer, LP graph). Loads via /api/account + /api/summary-batch (cached
  matches) + /api/rank-history, like role.html.
- overview.html: account card replaced by a compact clickable card
  (`#profileCard`, trophies-card style): icon, name, W/L right next to
  it, "View profile →". Moved CSS/JS (rank helpers, LP graph, streaks,
  LP goal, challenge timer) removed from overview.html.

## 4.28.9 — 2026-10-05

- Fix: viewing a past challenge on trophies.html showed the role trophies
  of the CURRENT role (user switched Mid -> Jungle; past Mid challenges
  showed empty Jungle trophies, their Mid values had no slots). The grid
  was built once for the current role and `applyAchievementProgress()`
  only fills ids that exist. New `buildTrophyGrid(forRole)` /
  `resetTrophyGrid(forRole)`; past entries are rendered with their own
  role (`entry.role`, or inferred from the snapshot's role-trophy ids for
  old entries), incl. Support variants of universal trophies and the
  tooltip role tag. Role note says "the role this past challenge was
  played in"; restored when going back. History data itself was always
  complete (both Mid entries had all 5 Mid trophies stored).
- Verified in dev Electron with a copy of the user's data (current role
  Jungle, two past Mid challenges) using real mouse clicks.

## 4.28.8 — 2026-09-30

- Roles & Picks placeholder skeleton (`TTPRoleChart.renderSkeleton`),
  shown with no games AND while loading (replaces the empty card with
  "Loading …" / "No ranked games in this challenge yet"): same layout as
  the real chart - gridlines (no axis numbers, the ghost bars have no
  value), 4 dashed ghost bars with "0", role labels, the 3 pool champs
  dimmed under "your 3 picks", "no games yet" in the other columns. Status
  line: "No ranked games yet – your games will show up here" / scan
  progress. Verified in dev Electron with the user's data (0 and 46 games).

## 4.28.7 — 2026-09-30

- index.html: the challenge box heading reads "Your Challenge" instead of
  "Start Challenge" (it also holds timer, Reset and Go to Overview once a
  challenge runs; before that it no longer duplicates the button's text).

## 4.28.6 — 2026-09-30

- index.html: "Go to Overview →" moved into the Start Challenge box, in one
  row with "Reset Challenge" (only visible once a challenge runs). The
  floating gold pill beside the grid (4.26.x) looked foreign: the only
  element outside the grid, aligned to nothing, the only filled/glowing
  control on the page. Now same shape/font/size as the page's other
  buttons, filled with the theme gold as the primary action. Old
  `.overview-nav-btn` CSS removed from style.css; `.content` no longer
  needs position:relative. Same row -> box height unchanged, page still
  fits (1077px). Verified with real mouse click -> overview.html, in
  default/Freljord/Hextech.

## 4.28.5 — 2026-09-30

- Removed the temporary Roles & Picks test hook from 4.28.1 (agreed with
  the user): no more `debug-role-stats.json` override in `runSummaryBatch`,
  no "Simulated test data" badge on role.html, no "TEST DATA" prefix on the
  Overview card. server.js is byte-identical to 4.28.0 again. The test
  file itself was deleted from the user's `ttp-data`.

## 4.28.4 — 2026-09-30

- Overview "Roles & Picks" card: with no games (and before data loads)
  the mini chart shows 4 grey stubs (`TTPRoleChart.emptyMini()`, 10px,
  --text-faint at 75%) instead of the round empty-dot placeholder, so the
  icon always has the same shape (user request).

## 4.28.3 — 2026-09-30

- Bars: only the game count above each bar; win rate is a "NN% WR" badge
  sitting on the win/loss seam, green >50 / red <50 / neutral =50. Edge
  cases handled in role-chart.js with pixel geometry (plot area 228px):
  0 games -> no bar/badge, just "0"; wins-only / losses-only -> badge
  clamped inside the bar at the top/bottom edge; bar shorter than the
  badge (<24px) -> badge above the bar, count above it; "NW"/"NL" labels
  only when the segment is >=16px AND >=18px away from the badge.
  Verified 7 variants (1-game bars, 30 wins only, 200 games, one loss only,
  tiny counts, no games...) in dev Electron: no overlapping/clipped labels,
  no page scroll, no errors.
- Renamed "Role Balance" -> "Roles & Picks" (user disliked the old name);
  on role.html the heading now sits directly above the chart instead of in
  the page header. Overview card shows only the on-plan "NN% WR", colored.

## 4.28.2 — 2026-09-30

- role.html / role-chart.js, per user spec: 3 champs per bar (was 5), then
  "▾ N more"; clicking opens a panel in the same row style attached right
  under the list (visually separated, floating - no layout shift),
  max 10 rows then scrollable, "Show less" / click outside / Esc closes, one
  open at a time. Panel height is capped to the space left in the window;
  it opens downward if >= 5 rows fit, otherwise upward (70% window).
  Closed panels are display:none (a hidden absolute panel still counted
  toward page height and made the page scrollable).
- Each champ column is its own subtle box with wider gaps - the record on
  the right no longer reads as belonging to the neighbour column's champ.
- Chart card is vertically centered in the free area under the header.
- Verified in dev Electron (user data copy + 15-champ column) at 1077px and
  860px window height with real mouse clicks: no page scroll, no errors.

## 4.28.1 — 2026-09-30

- TEMPORARY test hook (user wanted to see the Role Balance chart with ~30
  games before having real ones): if `ttp-data/debug-role-stats.json`
  exists, `runSummaryBatch` replaces `roleStats` with its content and sets
  `roleStatsSimulated: true`; role.html shows a red "Simulated test data"
  badge, the Overview card prefixes "TEST DATA ·". The file only exists on
  the user's machine (written by hand: 30 games, Mid/Fizz-Akali-Anivia,
  Support second role) - inert for everyone else. To remove together with
  the user later: delete the file, then drop the hook in a later version.

## 4.28.0 — 2026-09-30

- Role Balance, designed together with the user: vertical stacked bar
  chart, x-axis = 4 categories (main role + pool champ "Ponys", main role
  + other champ, second role with any champ, off role), bar height = games,
  wins (bottom, --green) / losses (top, --red) stacked; label above each
  bar "games · WR%". Scaling: tallest bar ~full height, axis ends at the
  tallest value rounded up to a nice step (<=5 ticks: 8->8, 23->25,
  200->200) so the chart keeps its size from 8 to 200+ games. Under each
  bar the champs, most played first, "icon Name 5 (4W/1L)", top 5 + "+N
  more" (tooltip lists the rest). Segment labels hidden when <16px tall.
- Server: `runSummaryBatch` now also returns `roleStats` (per category
  wins/losses + sorted champ list with key/id/name/W/L). `roleBreakdown`
  kept for compatibility.
- New shared `public/role-chart.js` (`renderFull`, `renderMini`,
  `summaryText`, `niceAxis`); role.html (was a placeholder) renders the full
  chart via the same `/api/summary-batch` scan (matches are cached);
  overview.html's Role Balance card shows 4 mini stacked bars instead of the
  donut, text "X% on plan · Y% WR there". role.html header now centered.
- Verified in dev Electron with a copy of the user's data (13 and 46
  games) at the user's window size (fits without scrolling), Freljord +
  Hextech + default themes, no errors.

## 4.27.6 — 2026-09-30

- trophies.html: Current Challenge card no longer dashed; it is highlighted
  with `--live-accent` only while the live view is shown, a clicked past
  entry uses `--history-view-accent`. Both are now defined PER THEME in
  style.css (user: every theme has different colors, nothing may get lost) -
  e.g. Freljord's gold is orange (#e8935a, ~ the old fixed amber) -> past
  accent is ice blue there; Hextech's gold is teal (~ green) -> live accent
  is warm yellow, past accent pink. Checked visually in all 8 themes.
- Fix: `.history-entry:hover` (declared later, same specificity) overrode
  the `.active` border color, so the selected card lost its highlight
  while hovered / right after clicking.
- What's New button pulses (`.changelog-btn.has-news`) until What's New is
  opened after an update (same last-seen version as the "New since your
  last update" section). No prefers-reduced-motion opt-out on purpose: the
  user's Windows reports `reduce`, which would have hidden the requested
  blinking entirely; it's a slow color pulse, no motion.
- Verified in dev Electron with the user's data and real mouse events.

## 4.27.5 — 2026-09-30

- Root cause of "Back to current challenge does nothing" (4.27.3 and
  4.27.4): in the grid-stacked `.status-slot`, the hidden `.rules-status`
  (opacity 0 -> own stacking context) was painted ABOVE the non-positioned
  banner and swallowed every real mouse click on the button. My headless
  tests used `el.click()`, which bypasses hit-testing, so they passed.
  Reproduced in an isolated copy of the installed app with CDP
  `Input.dispatchMouseEvent` + `elementFromPoint` (returned `rulesStatus`).
- Per user request the button is gone: the "Current Challenge" card above
  Challenge History is now the way back (`showCurrentChallenge()`), marked
  `.active` while the live view is shown (no more muted/greyed style).
  Hidden slot children get `pointer-events: none`.
- Banner text: "Viewing challenge from X - Y · some numbers may differ"
  (older rules: "· older trophy list, some numbers may differ").
- Verified in dev Electron with a copy of the user's real data and real
  mouse events: past -> current -> past -> current, no errors.

## 4.27.4 — 2026-09-30

- Fix: "Back to current challenge" could leave the past challenge's
  trophies in the grid. `applyAchievementProgress()` only touches trophies
  present in the given data, and 4.27.3's back handler called it with `[]`
  when no live result existed yet (scan still running/failed) - so nothing
  was reset. Now the grid is restored from a pristine snapshot
  (`resetTrophyGrid()`) before EVERY switch (both directions, also fixes
  values leaking between challenges with different trophy sets), and a
  new scan is started if none is running and no live result exists.
- Gold frame now wraps only summary -> grid (`.trophies-frame`), not the
  notes/status lines below; spacing under the grid tightened and the
  bottom status line reserves 1 line instead of 2 (it is the last element,
  nothing below can shift). At the user's window (1796x1116, ~1077px inner
  height) the page was 1103px tall -> scrollable, frame cut off at the
  bottom; now exactly fits (1077), frame fully visible.
- Banner text: "Viewing challenge from X - Y · trophies and stats as they
  were back then" (or "· older trophy list - targets and stats may differ
  from today") instead of "read-only snapshot" wording.
- Verified headless at 1796x1077 inner: live -> past -> back, with and
  without a finished live scan; grid position constant, no exceptions.

## 4.27.3 — 2026-09-30

- trophies.html: switching into / out of a past challenge no longer moves
  anything (user: "das hin und her gespringe sieht so unsauber aus").
  The banner used to expand at the top (max-height animation) and push the
  whole column ~70px down; it now shares a grid-stacked `.status-slot` with
  the "rules status" line under the progress summary and just cross-fades.
  The gold outline now fades in (outline doesn't affect layout anyway).
  "Back to current challenge" used to `location.reload()` (empty re-render,
  full re-scan, jump to top); it now re-renders the cached last live result
  (`lastLiveResult`/`renderLiveResult`) in place. The 15-min auto-refresh
  no longer overwrites the grid while a past challenge is shown - it only
  updates the cache. Verified headless: trophy grid stays at the same page
  offset (484px) in live -> past -> back, no exceptions.

## 4.27.2 — 2026-09-30

- New `POST /api/challenge-history/close` (used by "Reset Challenge" in
  index.html instead of `/update` + `/achievements/clear-state`): recomputes
  the trophies from the matches via the new shared
  `computeAchievementProgress()` (extracted from `runAchievementsBatch`),
  then closes the entry and clears the finalized state. The localStorage
  snapshot is only a fallback if the recompute fails. Before, the closed
  entry got the last snapshot trophies.html happened to save (user's lost
  challenge had Win Streak 4/3 stored vs. 6/3 real), or 0/21 if the Trophies
  page was never opened - which the 0-trophy rule then deleted outright.
- `challengeHistory.startEntry()`: any still-open entry from an earlier
  challenge (reset couldn't close it, e.g. puuid not resolvable) is closed
  at the new start time with its last synced numbers (0-trophy rule applies)
  instead of dangling as "ongoing" forever.
- Tested against an isolated server with the real puuid: stale fallback
  (4/3) was replaced by the recomputed 6/3; safety-net close verified.

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
