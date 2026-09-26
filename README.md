# Three-Trick-Pony

A private Windows desktop app for tracking progress during self-imposed "one-trick-pony" challenges in League of Legends — where a player commits to playing only a small, fixed pool of up to 3 champions (and a chosen role) for a period of time, aiming for a specific rank/LP goal.

This is a personal project built for myself and a small group of friends. It is not publicly distributed or monetized.

## What it does

- **Champion pool selection**: pick up to 3 champions and a single role for your pool (5 role icons: Top, Jungle, Mid, ADC, Support).
- **Challenge Level & LP Goal**: choose a difficulty (Easy / Normal / Hard / Very Hard / Majestic) and set a target rank/division/LP — this drives both the "Expected Games" estimate and every achievement's difficulty scaling.
- **Start Challenge**: records the exact start timestamp as the anchor for all stats below. Once started, the champion pool, role, challenge level, LP goal, and summoner name are locked to keep the challenge honest — only the Riot API key stays editable.
- **Live challenge timer**: days/hours/minutes/seconds since the challenge started.
- **Rank & LP tracking**: current ranked Solo/Duo tier, division and LP, plus the LP change since the challenge started, shown on a graph.
- **Per-champion stats**: win/loss record, winrate, KDA and CS/min for games played on the selected champions since the challenge started.
- **Matchup breakdown**: win/loss record against specific enemy champions, to spot good and bad matchups at a glance.
- **Recent match history & streaks**: last games played and current win/loss streak.
- **Trophies (achievements)**: 21 trophies per challenge (16 universal + 5 specific to your chosen role) plus a separate Platinum trophy for unlocking all of them, each scaled to your Challenge Level and Expected Games. Real-time progress bars per trophy, calculated from your actual match history.
- **Challenge History**: every challenge you've run is kept, with your current one pinned at the top and past ones in a scrollable list below. Each entry shows the champion pool, role, Challenge Level, trophy count, your LP range (start rank → goal) with a checkmark or cross for whether you reached it, and can be clicked to view that challenge's full trophy snapshot as a read-only past view. Challenges abandoned with zero trophies unlocked aren't kept.
- **Settings**: adjustable window size (as a percentage of screen size), a choice of 8 color themes (Classic, Graphite, Light, Hextech, Arcane, Noxus, Freljord, Ionia), "Start with Windows", and manual/automatic update checks.
- **Runs in the background**: minimizes to the system tray instead of quitting, keeps tracking LP and checking for updates even when no window is open.
- **Auto-updates**: the app checks for and installs new versions automatically via GitHub Releases, with a small non-intrusive indicator instead of an interrupting popup.

## How it works

The app is an [Electron](https://www.electronjs.org/) wrapper around a small local [Express](https://expressjs.com/) server. The server talks to the Riot Games API to resolve accounts, fetch ranked stats, pull match history, and compute both the regular stats and the achievement/trophy progress shown in the app. Match results are cached on disk so repeated loads only fetch new games.

**Riot APIs used:** `account-v1`, `summoner-v4`, `league-v4`, `match-v5` (including the Timeline endpoint, used for a couple of role-specific trophies that need per-event match data).

## Installation

Download the latest installer from the [Releases](https://github.com/snfabirk/ttp-desktop/releases) page and run it. You'll need your own [Riot API key](https://developer.riotgames.com/) to use the app — enter it in the Riot API Key field in Settings on first launch.

---

*Three-Trick-Pony isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.*
