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
//   - "upcoming" (Label "Upcoming Content", v6.10.0 Nutzer): Vorbereitungen fuer
//     kommende Inhalte (neue Sets, Release-System) - nie explizit ankuendigen.
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
      version: '6.11.0',
      date: '2026-11-10',
      notable: [
        'New games now show up within about a minute (was every 15 minutes) - Overview, Challenge and Pass update by themselves when one comes in.'
      ],
      refinements: 1
    },
    {
      version: '6.10.1',
      date: '2026-11-10',
      notable: [],
      bugfixes: 2
    },
    {
      version: '6.10.0',
      date: '2026-11-10',
      notable: [
        'Clicking a sticker in the Album now lifts it from its slot into the middle - and it goes back to its place when you close it.',
        'Choosing a booster: hold the mouse button and drag the packs to the side (or use the mouse wheel) to reach every set.'
      ],
      upcoming: 1,
      refinements: 1,
      bugfixes: 1
    },
    {
      version: '6.9.3',
      date: '2026-11-09',
      notable: [
        'Scrolling through the Album is a lot smoother - sticker effects pause for a moment while you scroll.',
        'Dupes and Trades now use the full width; your boosters live in the binder.'
      ],
      refinements: 1,
      bugfixes: 1
    },
    {
      version: '6.9.2',
      date: '2026-11-09',
      notable: [
        'The Album is now an open binder with two pages: your boosters on the left, the set on the right, the rings in the middle - and the pages turn like in a real book.',
        'The binder opens with its cover animation now also on the first start and right after an update.',
        'Collected stickers are shown as a progress bar; the sticker numbers per rarity are behind the "?".',
        'Page turns and switching binders run a lot smoother.'
      ],
      refinements: 5,
      bugfixes: 5
    },
    {
      version: '6.9.1',
      date: '2026-11-09',
      notable: [
        'The Album runs a lot smoother - especially with many animated stickers and Full Arts.'
      ],
      refinements: 2,
      bugfixes: 6
    },
    {
      version: '6.9.0',
      date: '2026-11-09',
      notable: [
        'The Album is now a real binder: it opens when you visit it, and switching sets turns the page.',
        'Two binders: your regular Album and a separate Special Album for special sets - switching closes one binder and opens the other.',
        'The booster on the left now swaps along with the set you are looking at.',
        'Full Arts on your profile now pop out in real 3D, just like in the Album.',
        'Every set has its own colors - card backs while opening a Neon District booster are now black.',
        'Finished sets get a gold star on their tab, Master Sets (with every Full Art) a rainbow star.',
        'Lucky wheel: click the wheel itself to spin it.'
      ],
      refinements: 6,
      bugfixes: 2
    },
    {
      version: '6.8.0',
      date: '2026-11-08',
      notable: [
        'Profile editor: drop a widget onto others and they make room - same-size widgets (or several small ones) swap places, everything else slides down. A faded preview shows where everything lands.',
        'Profile editor: nothing is saved until you click Save - including theme, profile picture and app icon. Save and Cancel now sit in a bar at the bottom.',
        'Switching boosters in the Album: your booster lifts to the middle and the others slide in from the sides. Click one to bring it forward, click again to take it, click next to it to put yours back.',
        'Pass booster tiers now give a booster voucher - redeem it in the Shop for any regular booster you like.',
        'Christmas Eve theme: a small snow button in the bottom left corner - snow on, snow off or a still picture.',
        'Every theme was checked for readability - text on bright themes like Desert, Sky Isles, Arctic and Winter Village is much easier to read now.',
        'When animations are set to run only while you use the app, every looping effect now really pauses.'
      ],
      refinements: 5,
      bugfixes: 3
    },
    {
      version: '6.7.1',
      date: '2026-11-07',
      notable: [
        'Choose which of your summoners your profile stats come from: Edit profile -> "Stats from" at the top of the widget list. Your profile keeps showing that summoner, no matter which one is selected at the top.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '6.7.0',
      date: '2026-11-07',
      notable: [
        'Profile stats now always belong to the summoner selected at the top - games, win rate, KDA, most played, LP and more are never mixed between accounts. Level, coins, pass and your collection stay with your profile.',
        "On a friend's profile you can see which of their accounts the stats belong to."
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '6.6.1',
      date: '2026-11-07',
      notable: [],
      refinements: 0,
      bugfixes: 1
    },
    {
      version: '6.6.0',
      date: '2026-11-07',
      notable: [
        "Trade stickers with friends: make an offer from a friend's profile or the new Trades tab in the Album. Your offered stickers are reserved until they decide. Trade fee: 50 coins per sticker in the trade, paid by each side.",
        'Gift boosters to friends - they see a glowing gift icon right away and collect it with one click.',
        'Duplicates now go to your new Dupes collection: sort by set and rarity, sell them in bulk and keep as many spares as you like for trading.',
        'Full Arts: very rare full-art versions of some cards, now 7 % in the rare slot. Which cards have one is a secret - you only find out when you pull it.',
        'Complete a set for a gold frame around your album, collect every Full Art too for the holo Master Set frame. Two new profile widgets show your Complete Sets and Master Sets.',
        'The Album tab shows how many new boosters you got since your last visit, and your unopened boosters are shown big on the pack.',
        'A full LP Bank now gives 600 XP and a voucher for a regular booster. Buying 5 boosters costs as much as 4.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '6.5.0',
      date: '2026-11-06',
      notable: [
        'New: the first Special Set "Neon District" - 25 cyberpunk stickers, Special Booster 300 coins.',
        'The shop now has Regular and Special Boosters. Special Boosters can only be bought on Saturdays and Sundays - a countdown shows when they are back. You can open them any time.',
        'The album has a tab for every set, and you can put stickers from every set on your profile - pick the set with the new set switcher.',
        "Stickers on profiles (yours and your friends') zoom in when you hover them and tilt with your mouse."
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '6.4.0',
      date: '2026-11-06',
      notable: [
        "December pass is ready: winter on tiers 5-15 (Frost Ring, Snowdrift, Snow Pony, the Winter Village theme) and Christmas on tiers 20-30 (Garland Ring, Yule Steed, Fireside, and Christmas Eve - a real 3D theme).",
        'Both December themes hide an easter egg.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '6.3.0',
      date: '2026-11-06',
      notable: [
        'Challenge page: your quests on the left, and right next to them Trophies, Pass, Roles & Picks and your 3 champions.',
        "Friends' profiles now show their current challenge - champions, roles, start rank, current rank, goal and trophies.",
        "The Activity box also shows level-ups and newly unlocked trophies - yours and your friends'.",
        'The monthly pass now also has profile pictures on tiers 13 and 22 - and its coin tiers give more coins (280 / 340 / 400).',
        'Trophies no longer give XP - they are for bragging rights.'
      ],
      refinements: 2,
      bugfixes: 0
    },
    {
      version: '6.2.1',
      date: '2026-11-06',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '6.2.0',
      date: '2026-11-06',
      notable: [
        "Friends' activity: the Activity box on the home screen now also shows your friends' games and LP Bank fills - click a name to open their profile.",
        'You can add, change or remove your e-mail later on the Account page.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '6.1.0',
      date: '2026-11-06',
      notable: [
        'Friends: the "Friends" tab on the right edge slides out your friend list. Find friends by their TTP username with +, accept requests there, and click a friend to see their whole profile in their own theme.',
        'Profile pictures are a new cosmetic category (Profile -> Edit profile -> Pictures). The first ones arrive in the shop soon.',
        'Changing your password now asks for it twice.'
      ],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '6.0.0',
      date: '2026-11-06',
      notable: [
        'Online accounts: sign in with your own username and password. Your level, coins, cosmetics and pass are saved online - your current progress moves into the account you create.',
        'Your profile now shows your username and a profile picture of its own (a placeholder for now - profile pictures are coming to the shop). Your summoner name and icon only appear in the challenge.',
        'Link up to 5 League accounts and switch between them with the menu top right - every summoner has its own challenge. To link one, just be logged into it in the League client on this PC - or briefly change its profile icon to prove it is yours.',
        'A banner tells you when the online server cannot be reached; your progress is kept on your PC and syncs later.',
        'A newly equipped app icon now also shows on your desktop shortcut, in the start menu and in the taskbar.',
        'Every ranked game now gives account XP and coins, even without a challenge. The monthly pass and quests only progress during a challenge.',
        'Quests are shared across your summoners: a quest slot you finished on one account counts as done on all of them for that day or week.',
        'Every League account keeps its own challenge on the server - it is saved online too, so it shows up on another PC.',
        'The Challenge page is now a compact overview: your fixed challenge settings, your 3 champions with W/L, quests, and tiles for Roles & Picks, Trophies and the Pass.',
        'Quests moved from the Pass page to the Challenge page.',
        'Trophies are only reachable through your challenge now - they left the top bar and the home screen.',
        'Once a challenge is running, its settings are locked and the Setup page is gone - Reset Challenge now lives on the Challenge page.',
        'Daily and weekly resets (quests, games per day, shop, goods, lucky wheel) now happen at midnight German time instead of 06:00.',
        'Profile pictures and champion images always load from the newest Riot data - brand-new profile icons show up right away.'
      ],
      refinements: 6,
      bugfixes: 0
    },
    {
      version: '5.31.0',
      date: '2026-11-04',
      notable: ['Hover a cosmetic in the monthly pass to preview it, just like in the shop - borders and frames on your own profile, themes as a mini version of the whole app.'],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.30.1',
      date: '2026-11-04',
      notable: ['Pass tiers with a cosmetic you already own now show "Owned" - there is nothing to claim there.'],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.30.0',
      date: '2026-11-04',
      notable: ['The Halloween pass rewards are extended: the November pass contains the same 6 cosmetics as October, so you can still earn them this month.'],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.29.8',
      date: '2026-10-11',
      notable: [],
      refinements: 2,
      bugfixes: 0
    },
    {
      version: '5.29.7',
      date: '2026-10-11',
      notable: ['Duplicates now visibly turn into coins while you open boosters - the card greys out and its coins fly into a counter. You own every sticker once, so the album no longer shows counts.', 'The album now starts with the rarest stickers: #1-3 animated, #4-10 holo, then uncommon and common. Your collection was renumbered automatically.'],
      refinements: 4,
      bugfixes: 2
    },
    {
      version: '5.29.0',
      date: '2026-10-11',
      notable: [
        'Stickers! The Base Set has 50 stickers - common, uncommon, holo rare and animated rare. Buy boosters in the shop (new Boosters section) and open them in the new Album tab: tear the pack open and flip through your stickers one by one.',
        'Animated rare stickers float above their card like a hologram - hover or inspect them and tilt the card.',
        'Duplicates turn into coins, and your monthly pass now gives 8 free boosters.',
        "Place your favourite stickers on your profile: in the profile editor, drag them from the new 'Stickers' tab onto your board."
      ],
      refinements: 1,
      bugfixes: 1
    },
    {
      version: '5.28.0',
      date: '2026-10-11',
      notable: ["New in the shop: app icons! 10 skins for your taskbar, window and tray icon (250 / 500 coins). Pick one in your profile under 'Icons' - it changes right away."],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.27.0',
      date: '2026-10-11',
      notable: [
        'Lots more coins: pass coin tiers pay 3x as much (240 / 300 / 360), every 30+ step gives 200, and the lucky wheel pays 3x (up to 750).',
        'Every ranked game now earns coins too: 30, plus 20 more on a win.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.26.0',
      date: '2026-10-11',
      notable: ['Backups: save all your progress (pass, coins, cosmetics, challenges, trophies, settings) into one file in Settings, and load it again on a new PC or after a reinstall.'],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.25.3',
      date: '2026-10-10',
      notable: [],
      refinements: 1,
      bugfixes: 1
    },
    {
      version: '5.25.2',
      date: '2026-10-10',
      notable: [
        "Pass rewards are now collected by hand: ready tiers glow - click them (or 'Claim all') and watch coins fly into your balance and cosmetics fly up to your profile. Anything you didn't collect in an earlier month is added automatically.",
        "'Closest next' on the Challenge page no longer lists the trophies that average over the whole challenge (they only lock in at the end)."
      ],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.24.1',
      date: '2026-10-10',
      notable: [],
      refinements: 2,
      bugfixes: 0
    },
    {
      version: '5.24.0',
      date: '2026-10-10',
      notable: [
        'The daily shop now has 4 offers instead of 3 - more to choose from.',
        "Prices you can't afford yet now show in red instead of 'Not enough coins', so you know what to save for."
      ],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.23.1',
      date: '2026-10-10',
      notable: ["Profile inventory: this month's pass items sit on top, everything else is sorted by rarity (Animated+ down to Basic) with the items you own first. Items you don't own yet are hidden - one click on 'Show locked' brings them in."],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.22.3',
      date: '2026-10-10',
      notable: [],
      refinements: 0,
      bugfixes: 1
    },
    {
      version: '5.22.2',
      date: '2026-10-10',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.22.1',
      date: '2026-10-10',
      notable: [],
      refinements: 1,
      bugfixes: 1
    },
    {
      version: '5.22.0',
      date: '2026-10-10',
      notable: [
        "Pass step 30+5 now gives a free voucher for 1 Refined or Fancy item in that day's daily shop. It expires when the daily shop changes - don't miss it!",
        'The 30+ row in the pass shows your steps and how far the voucher is.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.21.0',
      date: '2026-10-10',
      notable: [
        'The pass is faster: every tier now takes 1,200 XP instead of 1,500, so tier 30 is reachable even with a few days off.',
        'Pass 30+: the first step now takes 2,000 XP and every further one only 300 XP more (2,000, 2,300, 2,600 ...).'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.20.1',
      date: '2026-10-10',
      notable: ['The app window now has a minimum size, so nothing overlaps when it is made very small.'],
      refinements: 3,
      bugfixes: 5
    },
    {
      version: '5.20.0',
      date: '2026-10-10',
      notable: [
        '28 new cosmetics in the shop, including a spirit dragon, a kraken and a phoenix - and each new Animated piece hides its own secret.',
        'New rarity: Animated+. Extremely rare, extremely shiny.',
        "Developer's Choice: homage cosmetics inspired by the developer's favourite games."
      ],
      refinements: 2,
      bugfixes: 0
    },
    {
      version: '5.19.1',
      date: '2026-10-09',
      notable: ['Shop themes now preview as a mini version of the whole app, with their scene running live.'],
      refinements: 0,
      bugfixes: 1
    },
    {
      version: '5.19.0',
      date: '2026-10-09',
      notable: [
        'The shop is open! 33 new cosmetics - themes, borders and profile frames from Basic to Animated - and you can buy them with your coins.',
        'Hover any shop item to preview it on your own profile.',
        'Every Animated cosmetic hides its own secret. Have fun finding them.'
      ],
      refinements: 2,
      bugfixes: 0
    },
    {
      version: '5.18.2',
      date: '2026-10-09',
      notable: [
        'You can remove an active buff (hover it, click the ✕) - the coins are lost, and you can only do this once every 24 hours.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.18.1',
      date: '2026-10-09',
      notable: [
        'You can have at most 3 buffs active at the same time - choose wisely.'
      ],
      refinements: 2,
      bugfixes: 0
    },
    {
      version: '5.18.0',
      date: '2026-10-09',
      notable: [
        'Daily Goods in the shop: two consumables per day, e.g. Double XP, LP Bank Booster, Fresh Stock, Bonus Quests, a 20% coupon, Mystery Cosmetic or Try It On (wear something for 24 hours).',
        'Consumables are used right away - active ones show up as buffs with their remaining time.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.17.2',
      date: '2026-10-09',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.17.1',
      date: '2026-10-09',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.17.0',
      date: '2026-10-09',
      notable: [
        'Quests are live: finished daily and weekly quests now give XP for your level and the pass.',
        'New Basic borders and frames matching each of the 8 basic themes - free for everyone and combinable with any theme.',
        'Shop: the "?" next to Weekly Highlights shows all prices and the chances for each offer.'
      ],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.16.0',
      date: '2026-10-09',
      notable: [
        'Rarities: every cosmetic is now Basic, Refined, Fancy or Animated - shown in your collection and in the shop.',
        'The shop is now personal: your own daily offers and weekly highlights, and it never offers you something you already own.'
      ],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.15.0',
      date: '2026-10-09',
      notable: [
        'Profile editor: see every theme, border and frame that exists - the ones you are still missing are locked, with a collected counter per tab.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.14.0',
      date: '2026-10-09',
      notable: [
        'Pass 30+: still 100 coins per step, but every step now takes 500 XP more than the one before (2,500, 3,000, 3,500 ...).',
        'The Lucky Wheel now stays on the field you won until your next free spin.'
      ],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.13.1',
      date: '2026-10-09',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.13.0',
      date: '2026-10-09',
      notable: [
        'Shop preview: rotating daily offers and weekly highlights (not for sale yet).',
        'Lucky Wheel: one free spin per day for coins - click the wheel to open it.',
        'Pass coin rewards rebalanced: tiers 1-10 now give 80, 11-20 give 100, 21-30 give 120 (still 2,400 per pass).'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.12.1',
      date: '2026-10-09',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.12.0',
      date: '2026-10-09',
      notable: [
        'All October cosmetics got a full makeover: All Hallows now has its own night scene, Haunted Night has drifting fog, a lantern that follows your mouse and ghosts that flee from its light.',
        'Borders and frames reworked: Pumpkin Ring, Cobweb, Widow’s Nest (spiders!) and Ectoplasm Manor (vines grow while you hover).',
        'Some themes hide a little secret. Try clicking around.'
      ],
      refinements: 2,
      bugfixes: 0
    },
    {
      version: '5.11.1',
      date: '2026-10-09',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.11.0',
      date: '2026-10-09',
      notable: [
        'Themes are now cosmetics: pick them in your profile editor under Themes (first tab), together with borders and frames.',
        'The Animations setting now also covers animated borders and profile frames (always, only while you use the app, or off).'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.10.0',
      date: '2026-10-09',
      notable: [
        'The October pass is now a Halloween pass: two profile picture borders, two profile frames (the fancy one draws itself in and comes with a haunted night background) and two app themes.',
        'Haunted Night is the first animated theme - ghosts drift behind your boxes and bats fly by. Choose in Settings whether it animates always, only while you use the app, or never.',
        'Hover hints ("?") no longer disappear behind the next box.'
      ],
      refinements: 0,
      bugfixes: 1
    },
    {
      version: '5.9.0',
      date: '2026-10-09',
      notable: [
        'First start (or after a factory reset): a short welcome popup shows how to get going and points to the Setup button.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.8.2',
      date: '2026-10-09',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.8.1',
      date: '2026-10-09',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.8.0',
      date: '2026-10-09',
      notable: [
        'New top bar: Overview (your home, always highlighted), Profile, Challenge, Pass, Trophies and Shop (coming soon). Setup moved to its own button at the top right.',
        'Switching tabs now slides smoothly, and clicking a link several times no longer reloads the page several times.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.7.2',
      date: '2026-10-09',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.7.1',
      date: '2026-10-09',
      notable: [
        'Sub-pages (Trophies, Roles & Picks, Champion) have a back button to the Challenge page again.',
        'The activity feed shows who did what (your name for now, your friends later) and colors wins and losses.'
      ],
      refinements: 3,
      bugfixes: 2
    },
    {
      version: '5.7.0',
      date: '2026-10-09',
      notable: [
        'The Overview is now your home screen: live game (your record against every enemy, your jungle opponent highlighted), your games and dailies today, your last game and recent activity.',
        'Champion details (record, matchups, last 10 games, opponent analysis) moved to their own page - click a champion card on the Challenge page.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.6.0',
      date: '2026-10-09',
      notable: [
        'New navigation bar at the top: Setup, Overview, Challenge, Pass and Profile are always one click away (the back arrows are gone).',
        'Challenge and Pass are now separate pages with their own tiles on the Overview. Roles & Picks opens from the Challenge page.',
        'Profile editor: 21 widgets, drag them from the side bar onto your profile, many more sizes per widget, and resizing previews what appears or disappears before you let go.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.5.0',
      date: '2026-10-09',
      notable: [
        'Your profile is now a customizable board of widgets. Click "Edit profile" to move widgets, resize them (each widget has its own sizes, bigger shows more), add or remove them and leave gaps.',
        'While editing, your cosmetics open on the right - pick a border and see it live before saving.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.4.1',
      date: '2026-10-09',
      notable: [
        'The Challenge tab now shows your goal progress (start rank to LP goal), a card per pool champion with W/L, KDA, CS/min and lane win rate, your role split and the trophies you are closest to.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.4.0',
      date: '2026-10-09',
      notable: [
        'Challenge & Pass is split into two tabs: "Challenge" (your rank, LP and graph) and "Pass & Quests".',
        'Pass coins now grow with the tier: 50 coins on tiers 1-10, 100 on 11-20 and 150 on 21-30.'
      ],
      refinements: 3,
      bugfixes: 0
    },
    {
      version: '5.3.1',
      date: '2026-10-09',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.3.0',
      date: '2026-10-09',
      notable: [
        'The pass is now a monthly pass: a new one starts every month, and your progress no longer resets when you reset a challenge.',
        'Pass rewards: tiers 5, 10, 15, 20, 25 and 30 unlock this month’s exclusive profile borders (yours forever), all other tiers give coins. After tier 30 you keep earning coins every 2,500 XP.',
        'Equip your borders on your profile - they also show on the Overview.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.2.2',
      date: '2026-10-09',
      notable: [],
      refinements: 2,
      bugfixes: 0
    },
    {
      version: '5.2.1',
      date: '2026-10-09',
      notable: [
        'Profile levels are much cheaper now: each level costs 100 XP more than the last, and from level 21 on every level costs a flat 4,000 XP.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.2.0',
      date: '2026-10-09',
      notable: [
        'New player profile: your level plus lifetime stats across all challenges (challenges, goals reached, trophies, games, win rate, LP gained, most played). Cosmetics will live here later.',
        'The old profile page is now "Challenge & Pass" with everything about your current challenge, quests and the pass - open it from the new card on the Overview.'
      ],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.1.0',
      date: '2026-10-09',
      notable: [
        'Your ranked games now earn XP: based on champion/role, +150 for a win, +10 per kill and +5 per assist. Games since your challenge start are credited retroactively.',
        'New LP Bank: every LP you gain fills a 0-100 bar (losses are ignored). Each time it is full you get +1,000 XP and it starts over, extra LP carry over.',
        'The XP multiplier is gone - difficulty and LP goal no longer change how much XP you earn, so nobody can speed up the pass by picking an extreme goal.',
        'New "Recent XP" box on your profile shows what each game gave you. "How to earn XP" is now a hover popup there.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '5.0.3',
      date: '2026-10-08',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.0.1',
      date: '2026-10-08',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '5.0.0',
      date: '2026-10-08',
      notable: [
        'Preview of the new XP system on your Profile: profile level, daily and weekly quests (with one free reroll a day), a 30-tier Challenge Pass and an overview of how to earn XP. Nothing awards XP yet - this version only shows the layout.',
        'The Champion Selection page shows the XP multiplier for your challenge (difficulty x LP distance to your goal). It is locked in when you start a challenge.',
        'Settings: new "Reset Account Progress" button - resets only level, XP, quests and pass, separate from the factory reset.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.29.0',
      date: '2026-10-08',
      notable: [
        'New Profile page: the Overview now shows a compact card with your icon, name and W/L - click it ("View profile") for rank, LP change, streak, LP goal, challenge timer and the LP graph.'
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.28.9',
      date: '2026-10-05',
      notable: [],
      refinements: 0,
      bugfixes: 1
    },
    {
      version: '4.28.8',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.28.7',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.28.6',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.28.5',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.28.4',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.28.3',
      date: '2026-09-30',
      notable: [],
      refinements: 2,
      bugfixes: 0
    },
    {
      version: '4.28.2',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.28.1',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.28.0',
      date: '2026-09-30',
      notable: [
        "New: Role Balance page - a bar chart of your games in your main role with your 3 picks, main role with other picks, second role and off role, each split into wins and losses, with the champions you played listed below",
        "The Role Balance card on the Overview page now shows a mini version of that chart and how much of your playing is \"on plan\""
      ],
      refinements: 0,
      bugfixes: 0
    },
    {
      version: '4.27.6',
      date: '2026-09-30',
      notable: [],
      refinements: 2,
      bugfixes: 1
    },
    {
      version: '4.27.5',
      date: '2026-09-30',
      notable: [
        "To get back from a past challenge on the Trophies page, click the Current Challenge card above your Challenge History"
      ],
      refinements: 1,
      bugfixes: 1
    },
    {
      version: '4.27.4',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 1
    },
    {
      version: '4.27.3',
      date: '2026-09-30',
      notable: [],
      refinements: 1,
      bugfixes: 0
    },
    {
      version: '4.27.2',
      date: '2026-09-30',
      notable: [
        "Resetting a challenge now saves its real final trophy numbers to your Challenge History - before, it saved whatever the Trophies page showed last (often outdated), and a challenge whose Trophies page you never opened could even be dropped entirely"
      ],
      refinements: 0,
      bugfixes: 1
    },
    {
      version: '4.27.1',
      date: '2026-09-30',
      notable: [
        "Updating from an older version now also keeps your Challenge History - the installer rescues it before replacing the old version"
      ],
      refinements: 1,
      bugfixes: 0
    },
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

    // Wie viele AELTERE Anzeige-Bloecke (unterhalb von "neu seit dem letzten
    // Update") gerade sichtbar sind - startet bei jedem Oeffnen neu bei 5,
    // waechst per "Load more" um je 5 weitere. Gezaehlt werden Bloecke, nicht
    // Versionen: mehrere aufeinanderfolgende Versionen ohne relevante
    // Notizen (nur Refinements/Bug Fixes) sind EIN Block (siehe
    // groupEntries()), damit sie keine Plaetze fuer relevantere Eintraege
    // wegnehmen.
    const LAST_SEEN_KEY = 'ttp_changelog_last_seen_version';
    const INITIAL_OLDER_COUNT = 5;
    const LOAD_MORE_COUNT = 5;
    let visibleOlderCount = INITIAL_OLDER_COUNT;

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

    // Fasst direkt aufeinanderfolgende Versionen OHNE notable-Text zu einem
    // Block zusammen (explizite Nutzeranfrage 2026-09-30: 5x hintereinander
    // nur "Refinements" bringt nichts und verdraengt relevante Notes).
    function groupEntries(entries) {
      const groups = [];
      for (const e of entries) {
        const minor = !e.notable.length;
        const last = groups[groups.length - 1];
        if (minor && last && last.minor) last.entries.push(e);
        else groups.push({ minor, entries: [e] });
      }
      return groups;
    }

    // (v6.10.0, Nutzer) "upcoming": Vorbereitungen fuer kommende Inhalte (z. B. neue Sets) -
    // nur als Label, damit nichts explizit angekuendigt wird
    function minorLabelsHtml(refinements, bugfixes, upcoming) {
      if (!refinements && !bugfixes && !upcoming) return '';
      return `<div class="changelog-minor-labels">${upcoming ? '<span class="changelog-bugfixes-label">Upcoming Content</span>' : ''}${refinements ? '<span class="changelog-bugfixes-label">Refinements</span>' : ''}${bugfixes ? '<span class="changelog-bugfixes-label">Bug Fixes</span>' : ''}</div>`;
    }

    function renderGroupHtml(group) {
      if (group.entries.length === 1) return renderEntryHtml(group.entries[0]);
      const newest = group.entries[0];
      const oldest = group.entries[group.entries.length - 1];
      const newestDate = formatChangelogDate(newest.date);
      const oldestDate = formatChangelogDate(oldest.date);
      const dateText = newestDate === oldestDate ? newestDate : `${oldestDate} – ${newestDate}`;
      const refinements = group.entries.some(e => e.refinements);
      const bugfixes = group.entries.some(e => e.bugfixes);
      const upcoming = group.entries.some(e => e.upcoming);
      return `
        <div class="changelog-version">
          <div class="changelog-version-title">v${oldest.version} – v${newest.version} ${dateText ? `<span class="changelog-date">${dateText}</span>` : ''}</div>
          ${minorLabelsHtml(refinements, bugfixes, upcoming)}
        </div>
      `;
    }

    function renderEntryHtml(v) {
      const dateHtml = v.date ? `<span class="changelog-date">${formatChangelogDate(v.date)}</span>` : '';
      return `
        <div class="changelog-version">
          <div class="changelog-version-title">v${v.version} ${dateHtml}</div>
          ${v.notable.length ? `<ul class="changelog-notable">${v.notable.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}
          ${minorLabelsHtml(v.refinements, v.bugfixes, v.upcoming)}
        </div>
      `;
    }

    function renderBody() {
      const body = drawer.querySelector('.changelog-drawer-body');
      const newCount = countNewSince(getLastSeenVersion());
      // Neu/alt getrennt gruppieren, damit ein Block nie ueber die Grenze
      // "neu seit dem letzten Update" hinweg zusammengefasst wird.
      const newGroups = groupEntries(CHANGELOG.slice(0, newCount));
      const olderGroups = groupEntries(CHANGELOG.slice(newCount));

      let html = '';
      if (newGroups.length) {
        html += `<div class="changelog-section-label">New since your last update</div>`;
        html += newGroups.map(renderGroupHtml).join('');
        if (olderGroups.length) html += `<div class="changelog-section-label">Earlier</div>`;
      }
      html += olderGroups.slice(0, visibleOlderCount).map(renderGroupHtml).join('');
      body.innerHTML = html;

      if (visibleOlderCount < olderGroups.length) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.type = 'button';
        loadMoreBtn.className = 'changelog-load-more';
        loadMoreBtn.innerHTML = 'Load 5 more <span class="changelog-load-more-arrow">↓</span>';
        loadMoreBtn.addEventListener('click', () => {
          visibleOlderCount += LOAD_MORE_COUNT;
          renderBody();
        });
        body.appendChild(loadMoreBtn);
      }
    }

    // "Neues seit dem letzten Update"-Hinweis: der Button pulsiert sanft,
    // bis What's New nach einem Update einmal geoeffnet wurde (explizite
    // Nutzeranfrage 2026-09-30). Gleiche "gesehen"-Logik wie der
    // "New since your last update"-Abschnitt (LAST_SEEN_KEY).
    function refreshNewsHint() {
      const lastSeen = getLastSeenVersion();
      const apply = v => btn.classList.toggle('has-news', Boolean(v) && (!lastSeen || compareVersions(v, lastSeen) > 0));
      if (window.ttpMain && window.ttpMain.getAppVersion) {
        window.ttpMain.getAppVersion().then(apply).catch(() => {});
      } else {
        apply(CHANGELOG[0] && CHANGELOG[0].version);
      }
    }
    refreshNewsHint();

    function openDrawer() {
      visibleOlderCount = INITIAL_OLDER_COUNT; // jedes Oeffnen startet wieder beim Standard-Ausschnitt
      renderBody();
      drawer.classList.add('open');
      overlay.classList.add('visible');
      // Markiert erst NACH dem Rendern als "gesehen" (renderBody() oben hat
      // newCount ja schon anhand des VORHERIGEN Standes berechnet) - sonst
      // waere "neu seit dem letzten Update" bei jedem Oeffnen sofort leer.
      btn.classList.remove('has-news');
      if (window.ttpMain && window.ttpMain.getAppVersion) {
        window.ttpMain.getAppVersion().then(v => { if (v) setLastSeenVersion(v); }).catch(() => {});
      } else if (CHANGELOG[0]) {
        setLastSeenVersion(CHANGELOG[0].version);
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
