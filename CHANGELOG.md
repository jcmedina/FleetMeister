# Changelog

All notable changes to Shoe411 are documented here. Versions loosely follow [Semantic Versioning](https://semver.org/).

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
