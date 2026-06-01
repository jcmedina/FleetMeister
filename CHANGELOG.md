# Changelog

All notable changes to FleetMeister are documented here. Versions loosely follow [Semantic Versioning](https://semver.org/).

---

## [1.9.0] — 2026-06-01

### Neobrutalist redesign — bold borders, hard shadows, signal yellow

The whole app got a new look. The warm-paper-and-Fraunces identity served us well, but FleetMeister felt like it wanted something with more personality and more punch. So we took the design system somewhere completely different.

- **New visual language across every screen** — thick black borders (3px), hard offset shadows (5px 5px 0), no gradients, no rounded corners. Cards push into the page instead of floating above it.
- **New palette** — warm paper background swapped for a slightly cooler off-white. Burnt orange is out; signal yellow (#FDC800) is in as the primary accent. Electric blue (#432DD7) handles lead stats and chart lines. Reds, greens, and ambers stay for danger / good / warning semantics.
- **Inter + JetBrains Mono replace Fraunces** — display copy uses Inter at 800/900 weight; every number on the page is now in JetBrains Mono so stats line up cleanly and read like a dashboard.
- **Tick bars now show their borders** — each of the 20 mileage cells has a thin black outline, so they read as a grid of cells rather than soft segments. Same colour rules — green / amber / red.
- **Cards press in on hover** — instead of lifting, cards now offset further (5→8px shadow) and slide back up to the corner on click. It's tactile in a way the old soft-shadow version wasn't.
- **Memorial view leans into it** — the tombstone is a 300px arch in bold outline with a chunky dirt mound and a dashed ground line underneath. The shoe name is uppercase Inter Black, the epitaph is bracketed by ink bars, and dates live in a small mono plaque. Same emotional beat, more weight.
- **Engineering-grid background** — replaces the old paper-grain dots. Subtle enough to read like graph paper, not loud enough to compete with content.

---

## [1.8.0] — 2026-05-11

### FleetMeister — a new name and a cleaner dashboard

The app has a new name. Shoe411 was always a working title; FleetMeister is what it actually is: a tool for managing your fleet, like a proper Meister would.

- **Renamed to FleetMeister** — browser tab, nav logo, and all the things. Same app, better name.
- **Your Shoes moves to the top** — the shoe cards are now the first thing you see after the header. That's why you're here.
- **Hall of Fame previews first three entries** — the retired shoe section no longer hides behind a click. The first three pairs are visible right away, with a "+ N more" link to expand the rest.
- **"Needs a Run" is now a single strip** — the amber warning block has been replaced with a slim inline row: just a label and a pill per overdue shoe. It was taking up too much real estate for what it was saying.
- **Leaderboard and Awards are now separate sections** — they were always two different things. Now they look like it.
- **Pace sparkline on every shoe card** — a tiny inline chart now sits next to the progress bar showing pace trend across the last 10 runs. More signal, less chrome.
- **dotenv path fix** — the backend now always finds its `.env` file regardless of how PM2 starts the server. No more mysterious Strava "invalid client_id" errors after a restart.

---

## [1.7.0] — 2026-05-06

### In Memoriam — retired shoe memorial view

Every great pair deserves a proper send-off. Retired shoes now get a full memorial page instead of just a stats screen.

- **Tombstone portrait** — a large arch-shaped frame sits at the top of the page. Click it to upload a photo of the shoe. It's their final portrait, so make it count.
- **Centered memorial layout** — "in memoriam" eyebrow, the shoe's name in big italic type, your retirement note displayed as an epitaph, and birth/death dates (first run → last run).
- **A life in numbers** — career stats ledger with months of service, total outings, pace, heart rate, and more.
- **Hall of Fame thumbnails** — the Hall of Fame cards on the dashboard now show a mini tombstone photo if you've uploaded one, so you can recognize each retired pair at a glance.
- **Photo upload infrastructure** — photos are stored locally in `backend/uploads/` and served at `/uploads/`. The SQLite database tracks which photo belongs to each shoe.
- **Fixed photo upload crash** — Express's default JSON body limit (100 KB) was rejecting base64-encoded photos. Raised the limit to 10 MB so uploads actually go through.

---

## [1.6.0] — 2026-05-05

### No more terminal

The biggest quality-of-life improvement yet — you no longer need to keep a terminal window open to use Shoe411.

- **Frontend served from Express** — the React app is now built once (`npm run build`) and served directly from the backend. No more running two separate processes.
- **PM2 background service** — Shoe411 now runs as a proper background service using PM2. It starts automatically when your Mac boots and keeps running after you close the terminal. The app just lives at `http://localhost:3001` whenever your computer is on.
- **Switched to `node:sqlite`** — dropped `better-sqlite3` (which had native compilation issues on Apple Silicon with Node.js v24) in favor of the built-in `node:sqlite` module. Zero installation, zero build steps, same functionality.

---

## [1.5.0] — 2026-05-04

### Performance improvements

After almost a decade of Strava data, fetching all activities on every page load was getting slow — and easy to hit Strava's rate limit during development. This release fixes that.

- **Session caching** — gear and activities are now cached in your session after the first load. Revisiting the app or switching tabs no longer makes a single Strava API call. Hit the ↻ Refresh button when you want fresh data from Strava.
- **Faster settings saves** — saving shoe settings (type, mileage limit, nudge days) now only re-fetches the settings from the local database, not your entire Strava history. Changes feel instant.

---

## [1.4.0] — 2026-05-04

### Custom settings, nudge alerts, and the Hall of Fame

The big one. Shoe411 now remembers things about your shoes beyond what Strava stores.

- **Shoe types** — tag each shoe with what it's actually for: Daily Trainer, Speed / Tempo, Long Run, Race Day, Trail, Recovery, or Other. Shows up as a colored tag on the shoe card.
- **Custom mileage limits** — not every shoe is built the same. Override the default 650 km replacement guide on a per-shoe basis. The progress bar and replacement warnings update accordingly.
- **Nudge alerts** — set a "days without a run" threshold on any shoe. If you go longer than that without lacing them up, a warning banner appears at the top of the dashboard so you don't forget about a pair sitting in the corner.
- **Hall of Fame** — retired shoes now have their own collapsible section at the bottom of the dashboard, complete with career stats and a space to write a retirement note. Every great pair deserves a send-off.
- **Settings tab** — all of the above lives in a new Settings tab inside each shoe's detail view.
- **Data layer** — custom settings are stored locally in a SQLite database (never sent to Strava). Your Strava data is always fetched fresh and never stored.

---

## [1.3.0] — 2026-05-03

### Full design overhaul

Gave the whole app a visual identity. Inspired by Claude Design from Anthropic Labs.

- Warm paper color palette (`#faf7f2` background, burnt orange brand color)
- Fraunces serif font for headings and numbers — gives the stats a editorial, almost printed feel
- Tick-mark progress bars instead of a boring filled bar
- Paper grain texture in the background (subtle, but you'll notice if it's gone)
- Editorial leaderboard section on the dashboard — top 5 fastest shoes, most relaxing by heart rate, and a few awards (Long Run King, Speed Demon, Most Reliable, Freshest Legs)

---

## [1.2.0] — 2026-05-02

### Leaderboard

Added a leaderboard to the dashboard so you can actually compare your shoes against each other.

- Top 5 fastest shoes by median pace
- Top 5 most relaxing by average heart rate
- Awards section: Long Run King, Speed Demon, Most Reliable, and Freshest Legs

---

## [1.1.0] — 2026-05-01

### Metric units and light theme

First round of polish after the initial build.

- Switched everything to metric — distances in km, pace in min/km
- Replaced the dark theme with a clean light one
- Fixed the Strava OAuth scope (`profile:read_all`) so gear actually loads

---

## [1.0.0] — 2026-05-01

### First working version

Built the whole thing from scratch. It started as a simple question: *why don't I know how many kilometres are on my shoes?*

- Strava OAuth login — connects to your account with read-only access
- Fetches all your registered shoes and every run that has a shoe assigned
- Pace trend chart — see how pace evolved across every run in a shoe
- Day-of-week distribution — find out which days you reach for each pair
- Distance distribution — understand whether a shoe is your daily driver or long-run workhorse
- Replacement guidance — mileage progress bar with color-coded warnings (green → amber → red)
- Pace improvement tracking — compares your first 5 vs last 5 runs to catch performance decline
- Longest run, fastest run, average heart rate, and median pace per shoe
