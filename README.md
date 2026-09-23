# Three-Trick-Pony

A private Windows desktop app for tracking progress during self-imposed "one-trick-pony" challenges in League of Legends — where a player commits to playing only a small, fixed pool of up to 3 champions for a period of time.

This is a personal project built for myself and a small group of friends. It is not publicly distributed or monetized.

## What it does

- **Champion pool selection**: pick up to 3 champions (optionally with a preferred role) to form your challenge pool.
- **Start Challenge**: records the exact start timestamp as the anchor for all stats below. Once started, the champion pool, role, and summoner name are locked to keep the challenge honest — only the Riot API key stays editable.
- **Live challenge timer**: days/hours/minutes/seconds since the challenge started.
- **Rank & LP tracking**: current ranked Solo/Duo tier, division and LP, plus the LP change since the challenge started.
- **Per-champion stats**: win/loss record, winrate, KDA and CS/min for games played on the selected champions since the challenge started.
- **Matchup breakdown**: win/loss record against specific enemy champions, to spot good and bad matchups at a glance.
- **Recent match history & streaks**: last games played and current win/loss streak.
- **Settings**: adjustable window size (as a percentage of screen size) and a choice of color themes (Classic, Graphite, Light, Hextech, Arcane, Noxus).
- **Auto-updates**: the app checks for and installs new versions automatically via GitHub Releases.

## How it works

The app is an [Electron](https://www.electronjs.org/) wrapper around a small local [Express](https://expressjs.com/) server. The server talks to the Riot Games API to resolve accounts, fetch ranked stats, and pull match history, then computes and caches the stats shown in the app.

**Riot APIs used:** `account-v1`, `summoner-v4`, `league-v4`, `match-v5`.

## Installation

Download the latest installer from the [Releases](https://github.com/snfabirk/ttp-desktop/releases) page and run it. You'll need your own [Riot API key](https://developer.riotgames.com/) to use the app — enter it in the Riot API Key field on first launch.

---

*Three-Trick-Pony isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.*
