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
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
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

module.exports = {
  getAllForUser: (userId) => {
    const rows = getAllForUser.all(String(userId));
    // Return as a map keyed by gear_id for easy lookup
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
};
