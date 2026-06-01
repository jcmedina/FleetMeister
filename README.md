# FleetMeister — Know Your Kicks

A local web app that connects to your Strava account to track running shoe usage, performance, and help you know when it's time for a new pair.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE) &nbsp; [Changelog](CHANGELOG.md)

## Features

- **Pace trend** — see how your pace has evolved across every run in a shoe
- **Day-of-week distribution** — discover which days you reach for each pair
- **Distance distribution** — understand whether a shoe is your daily trainer or long-run workhorse
- **Replacement guidance** — mileage progress bar with color-coded warnings, customizable per shoe
- **Pace change** — compare your first 5 vs. last 5 runs in a shoe to spot performance decline
- **Leaderboard** — compare shoes by pace, heart rate, and earn awards (Long Run King, Speed Demon, and more)
- **Shoe types** — tag each pair with what it's actually for (Daily Trainer, Race Day, Trail, etc.)
- **Nudge alerts** — get reminded when a shoe hasn't been used in a while
- **Hall of Fame** — retired shoes live on with their career stats and a space for a farewell note
- **Memorial view** — each retired shoe gets a full tombstone-style page with a portrait photo, epitaph, b./d. dates, and a career stats ledger

---

## Quick install (Mac)

```bash
git clone https://github.com/your-username/ShoeAnalyzer.git
cd ShoeAnalyzer
bash install.sh
```

The script will check your Node version, install PM2, build the frontend, prompt you for your Strava credentials, and start the background service. Then open [http://localhost:3001](http://localhost:3001).

The only manual step is creating a Strava API app — see step 1 below.

---

## Manual setup

### 1. Create a Strava API app

1. Go to [strava.com/settings/api](https://www.strava.com/settings/api)
2. Create an application (name it anything, e.g. "FleetMeister")
3. Set **Authorization Callback Domain** to `localhost`
4. Note your **Client ID** and **Client Secret**

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:3001/auth/callback
SESSION_SECRET=any_random_string_here
PORT=3001
FRONTEND_URL=http://localhost:3001
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (clean install recommended on Apple Silicon)
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### 4. Build the frontend

```bash
cd frontend
npm run build
```

### 5. Start the backend

```bash
cd backend
node server.js
```

Then open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Running as a background service (recommended)

If you don't want to keep a terminal window open, use PM2 to run Shoe411 as a background service that starts automatically when your Mac boots.

```bash
# Install PM2 (sudo required — it installs to /usr/local/lib)
sudo npm install -g pm2

# Kill any existing PM2 daemon first (avoids stale binary issues after Node upgrades)
pm2 kill

# Start FleetMeister — use the full node path to avoid PATH issues at boot
pm2 start ~/path/to/ShoeAnalyzer/backend/server.js \
  --name fleetmeister \
  --interpreter $(which node) \
  --cwd ~/path/to/ShoeAnalyzer/backend

# Save the process list, then run the sudo command pm2 prints to enable auto-start
pm2 startup
pm2 save
```

> **Note:** If PM2 shows `errored` after a macOS reboot, it's usually because Node was upgraded (e.g. by Homebrew) and PM2's native modules are stale. Fix: `sudo npm install -g pm2 && pm2 kill`, then re-run the start command above.

Useful PM2 commands:

| Task | Command |
|------|---------|
| Check status | `pm2 list` |
| Restart | `pm2 restart fleetmeister` |
| Stop | `pm2 stop fleetmeister` |
| View logs | `pm2 logs fleetmeister` |

After rebuilding the frontend, always run `pm2 restart fleetmeister` to pick up the changes.

---

## How it works

1. Click **Connect with Strava** — you'll be redirected to Strava to authorize read-only access
2. FleetMeister fetches all your registered shoes and every run that has a shoe assigned
3. Analytics are computed entirely in-browser — no data is sent anywhere except Strava's API
4. Custom settings (shoe type, mileage limits, nudge days, retirement notes) are stored in a local SQLite database
5. Sessions persist for 7 days; click **Sign out** to clear your session

## Tips

- Make sure your shoes are registered in Strava at [strava.com/settings/gear](https://www.strava.com/settings/gear)
- For a run to show up in shoe analytics, it must have a shoe selected when logged
- The default replacement threshold is 650 km — override it per shoe in the Settings tab, or change the global default (`REPLACEMENT_KM`) in `frontend/src/analytics.js`
- Strava data is cached in your session after the first load — use the ↻ Refresh button to pull the latest
- On Apple Silicon Macs, always use `rm -rf node_modules package-lock.json && npm install` instead of a plain `npm install` when packages aren't resolving correctly

---

## Project structure

```
shoe411/
├── backend/
│   ├── server.js        # Express server, Strava OAuth, API routes, session cache, static file serving
│   ├── db.js            # SQLite (node:sqlite) — custom shoe settings and photo filenames
│   ├── shoe411.db       # Local database (auto-created on first run)
│   ├── uploads/         # Shoe portrait photos (auto-created, gitignored)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root component, auth + data state
│   │   ├── analytics.js     # All data processing logic
│   │   ├── components/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Dashboard.jsx    # Fleet overview, leaderboard, nudge alerts, Hall of Fame
│   │   │   ├── ShoeCard.jsx     # Per-shoe summary card
│   │   │   ├── ShoeDetail.jsx   # Full analytics + settings tab
│   │   │   ├── Leaderboard.jsx  # Pace rankings and awards
│   │   │   └── LoadingScreen.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── dist/            # Built frontend (served by Express)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── CHANGELOG.md
└── LICENSE
```
