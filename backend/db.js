const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'shoe411.db'));

// Enable WAL mode for better performance
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS shoe_settings (
    gear_id         TEXT NOT NULL,
    user_id         TEXT NOT NULL,
    type            TEXT,
    custom_limit_km INTEGER,
    nudge_days      INTEGER,
    retirement_note TEXT,
    photo           TEXT,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (gear_id, user_id)
  )
`);

// Add photo column if it doesn't exist yet (for existing databases)
try { db.exec('ALTER TABLE shoe_settings ADD COLUMN photo TEXT'); } catch (_) {}

// Tracks every shoe we've ever seen — so retired shoes (which vanish from
// Strava's athlete endpoint) can still be fetched individually.
db.exec(`
  CREATE TABLE IF NOT EXISTS known_gear (
    gear_id  TEXT NOT NULL,
    user_id  TEXT NOT NULL,
    name     TEXT,
    PRIMARY KEY (gear_id, user_id)
  )
`);

// ─── Queries ─────────────────────────────────────────────────────────────────

const getAllForUser = db.prepare(
  `SELECT * FROM shoe_settings WHERE user_id = ?`
);

const upsertStmt = db.prepare(`
  INSERT INTO shoe_settings (gear_id, user_id, type, custom_limit_km, nudge_days, retirement_note, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  ON CONFLICT(gear_id, user_id) DO UPDATE SET
    type            = excluded.type,
    custom_limit_km = excluded.custom_limit_km,
    nudge_days      = excluded.nudge_days,
    retirement_note = excluded.retirement_note,
    updated_at      = excluded.updated_at
`);

const savePhotoStmt = db.prepare(`
  INSERT INTO shoe_settings (gear_id, user_id, photo, updated_at)
  VALUES (?, ?, ?, datetime('now'))
  ON CONFLICT(gear_id, user_id) DO UPDATE SET
    photo      = excluded.photo,
    updated_at = excluded.updated_at
`);

const saveKnownGear = db.prepare(`
  INSERT INTO known_gear (gear_id, user_id, name)
  VALUES (?, ?, ?)
  ON CONFLICT(gear_id, user_id) DO UPDATE SET name = excluded.name
`);

const getKnownGear = db.prepare(
  `SELECT gear_id, name FROM known_gear WHERE user_id = ?`
);

module.exports = {
  getAllForUser: (userId) => {
    const rows = getAllForUser.all(String(userId));
    return Object.fromEntries(rows.map((r) => [r.gear_id, r]));
  },
  upsert: (userId, gearId, fields) => {
    upsertStmt.run(
      gearId,
      String(userId),
      fields.type            ?? null,
      fields.custom_limit_km ?? null,
      fields.nudge_days      ?? null,
      fields.retirement_note ?? null,
    );
  },
  savePhoto: (userId, gearId, filename) => {
    savePhotoStmt.run(gearId, String(userId), filename);
  },
  saveKnownGear: (userId, shoes) => {
    for (const shoe of shoes) {
      saveKnownGear.run(shoe.id, String(userId), shoe.name);
    }
  },
  getKnownGearIds: (userId) => {
    return getKnownGear.all(String(userId)); // [{ gear_id, name }]
  },
};
