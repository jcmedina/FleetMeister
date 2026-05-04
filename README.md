# Shoe411 — Know Your Kicks

A local web app that connects to your Strava account to track running shoe usage, performance, and help you know when it's time for a new pair.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE) &nbsp; [Changelog](CHANGELOG.md)

## Features

- **Pace trend** — see how your pace has evolved across every run in a shoe
- **Day-of-week heatmap** — discover which days you reach for each pair
- **Distance distribution** — understand whether a shoe is your daily trainer or long-run workhorse
- **Replacement guidance** — mileage progress bar toward the standard 400-mile limit, with color-coded warnings
- **Pace change** — compare your first 5 vs. last 5 runs in a shoe to spot performance decline

---

## Setup

### 1. Create a Strava API app

1. Go to [strava.com/settings/api](https://www.strava.com/settings/api)
2. Create an application (name it anything, e.g. "Shoe411")
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
FRONTEND_URL=http://localhost:5173
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run

Open two terminal tabs:

**Tab 1 — Backend:**
```bash
cd backend
npm run dev
```

**Tab 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How it works

1. Click **Connect with Strava** — you'll be redirected to Strava to authorize read-only access
2. Shoe411 fetches all your registered shoes and every run that has a shoe assigned
3. Analytics are computed entirely in-browser — no data is sent anywhere except Strava's API
4. Sessions persist for 7 days; click **Sign out** to clear your session

## Tips

- Make sure your shoes are registered in Strava at [strava.com/settings/gear](https://www.strava.com/settings/gear)
- For a run to show up in shoe analytics, it must have a shoe selected when logged
- The default replacement threshold is 650 km — you can override this per shoe in the Settings tab, or change the global default (`REPLACEMENT_KM`) in `frontend/src/analytics.js`
- Strava data is cached in your session after the first load. Use the ↻ Refresh button on the dashboard to pull the latest from Strava.

---

## Project structure

```
shoe411/
├── backend/
│   ├── server.js        # Express server, Strava OAuth, API routes, session cache
│   ├── db.js            # SQLite (node:sqlite) — custom shoe settings
│   ├── shoe411.db       # Local database (auto-created on first run)
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
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── CHANGELOG.md
└── LICENSE
```
