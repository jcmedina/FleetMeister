require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'shoe411-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ─── Auth Routes ─────────────────────────────────────────────────────────────

// Step 1: Redirect user to Strava for authorization
app.get('/auth/strava', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    redirect_uri: process.env.STRAVA_REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,profile:read_all,activity:read_all',
  });
  res.redirect(`https://www.strava.com/oauth/authorize?${params}`);
});

// Step 2: Exchange authorization code for tokens
app.get('/auth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}?error=access_denied`);
  }

  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_at, athlete } = response.data;

    req.session.tokens = { access_token, refresh_token, expires_at };
    req.session.athlete = {
      id: athlete.id,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      profile: athlete.profile,
      city: athlete.city,
      country: athlete.country,
    };

    res.redirect(`${FRONTEND_URL}?auth=success`);
  } catch (err) {
    console.error('OAuth callback error:', err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
  }
});

// Refresh token if expired
async function getValidToken(session) {
  const { tokens } = session;
  if (!tokens) throw new Error('Not authenticated');

  const now = Math.floor(Date.now() / 1000);
  if (tokens.expires_at > now + 60) {
    return tokens.access_token;
  }

  // Token expired — refresh it
  const response = await axios.post('https://www.strava.com/oauth/token', {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    refresh_token: tokens.refresh_token,
    grant_type: 'refresh_token',
  });

  const { access_token, refresh_token, expires_at } = response.data;
  session.tokens = { access_token, refresh_token, expires_at };
  return access_token;
}

// Auth check middleware
function requireAuth(req, res, next) {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Log out
app.post('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// ─── API Routes ──────────────────────────────────────────────────────────────

// Current athlete profile
app.get('/api/athlete', requireAuth, (req, res) => {
  res.json(req.session.athlete);
});

// Auth status check
app.get('/api/status', (req, res) => {
  if (req.session.tokens && req.session.athlete) {
    res.json({ authenticated: true, athlete: req.session.athlete });
  } else {
    res.json({ authenticated: false });
  }
});

// Athlete's registered gear (shoes)
app.get('/api/gear', requireAuth, async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';

  if (!forceRefresh && req.session.cache?.gear) {
    return res.json(req.session.cache.gear);
  }

  try {
    const token = await getValidToken(req.session);
    const response = await axios.get('https://www.strava.com/api/v3/athlete', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const shoes = (response.data.shoes || []).map((shoe) => ({
      id: shoe.id,
      name: shoe.name,
      brand_name: shoe.brand_name,
      model_name: shoe.model_name,
      description: shoe.description,
      distance: shoe.distance,
      converted_distance: shoe.converted_distance,
      retired: shoe.retired,
      primary: shoe.primary,
    }));

    if (!req.session.cache) req.session.cache = {};
    req.session.cache.gear = shoes;

    res.json(shoes);
  } catch (err) {
    console.error('Gear fetch error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch gear' });
  }
});

// ─── Shoe Settings (SQLite) ──────────────────────────────────────────────────

// Get all custom settings for the current athlete (returns map keyed by gear_id)
app.get('/api/settings', requireAuth, (req, res) => {
  try {
    const settings = db.getAllForUser(req.session.athlete.id);
    res.json(settings);
  } catch (err) {
    console.error('Settings fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Save / update settings for one shoe
app.put('/api/settings/:gear_id', requireAuth, (req, res) => {
  try {
    const { gear_id } = req.params;
    const { type, custom_limit_km, nudge_days, retirement_note } = req.body;
    db.upsert(req.session.athlete.id, gear_id, {
      type:            type            ?? null,
      custom_limit_km: custom_limit_km ? parseInt(custom_limit_km) : null,
      nudge_days:      nudge_days      ? parseInt(nudge_days)      : null,
      retirement_note: retirement_note ?? null,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Settings save error:', err.message);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// All running activities (paginated, runs only)
app.get('/api/activities', requireAuth, async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';

  if (!forceRefresh && req.session.cache?.activities) {
    return res.json(req.session.cache.activities);
  }

  try {
    const token = await getValidToken(req.session);
    const allActivities = [];
    let page = 1;
    const perPage = 200;

    while (true) {
      const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: perPage, page },
      });

      const batch = response.data;
      if (!batch || batch.length === 0) break;

      // Filter to runs with gear only
      const runs = batch
        .filter((a) => a.type === 'Run' && a.gear_id)
        .map((a) => ({
          id: a.id,
          name: a.name,
          gear_id: a.gear_id,
          distance: a.distance,           // meters
          moving_time: a.moving_time,     // seconds
          elapsed_time: a.elapsed_time,
          total_elevation_gain: a.total_elevation_gain,
          start_date: a.start_date,
          start_date_local: a.start_date_local,
          average_speed: a.average_speed, // m/s
          average_heartrate: a.average_heartrate,
          suffer_score: a.suffer_score,
          timezone: a.timezone,
        }));

      allActivities.push(...runs);

      if (batch.length < perPage) break;
      page++;
    }

    if (!req.session.cache) req.session.cache = {};
    req.session.cache.activities = allActivities;

    res.json(allActivities);
  } catch (err) {
    console.error('Activities fetch error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// ─── Serve frontend ──────────────────────────────────────────────────────────

const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Catch-all: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🥾 Shoe411 running on http://localhost:${PORT}`);
});
