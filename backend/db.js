const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'mockflow.db'));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS mock_routes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    path         TEXT NOT NULL,
    method       TEXT NOT NULL DEFAULT 'GET',
    statusCode   INTEGER NOT NULL DEFAULT 200,
    responseBody TEXT NOT NULL,
    delay        INTEGER NOT NULL DEFAULT 0,
    matchRules   TEXT NOT NULL DEFAULT '[]',
    createdAt    TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS request_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    path       TEXT NOT NULL,
    method     TEXT NOT NULL,
    headers    TEXT,
    body       TEXT,
    query      TEXT,
    statusCode INTEGER,
    timestamp  TEXT NOT NULL DEFAULT (datetime('now')),
    createdAt  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
