import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(__dirname, 'data', 'paintforge.db');

let db = null;

export async function initDb() {
  mkdirSync(dirname(DB_PATH), { recursive: true });

  const SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log(`Loaded database from ${DB_PATH}`);
  } else {
    db = new SQL.Database();
    console.log(`Created new database at ${DB_PATH}`);
  }

  db.run('PRAGMA foreign_keys = ON');

  // Create entities table
  db.run(`
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      data JSON NOT NULL,
      created TEXT NOT NULL,
      updated TEXT NOT NULL
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name)');

  // Try FTS5 — may not be available in all sql.js builds
  try {
    db.run(`
      CREATE VIRTUAL TABLE IF NOT EXISTS entities_fts USING fts5(
        name, brand, range_name, code, tags,
        content=entities, content_rowid=rowid,
        tokenize='trigram'
      )
    `);

    // FTS sync triggers
    db.run(`
      CREATE TRIGGER IF NOT EXISTS entities_ai AFTER INSERT ON entities BEGIN
        INSERT INTO entities_fts(rowid, name, brand, range_name, code, tags)
        VALUES (
          new.rowid, new.name,
          COALESCE(json_extract(new.data, '$.brand'), ''),
          COALESCE(json_extract(new.data, '$.range'), ''),
          COALESCE(json_extract(new.data, '$.code'), ''),
          COALESCE(json_extract(new.data, '$.tags'), '')
        );
      END
    `);

    db.run(`
      CREATE TRIGGER IF NOT EXISTS entities_ad AFTER DELETE ON entities BEGIN
        INSERT INTO entities_fts(entities_fts, rowid, name, brand, range_name, code, tags)
        VALUES (
          'delete', old.rowid, old.name,
          COALESCE(json_extract(old.data, '$.brand'), ''),
          COALESCE(json_extract(old.data, '$.range'), ''),
          COALESCE(json_extract(old.data, '$.code'), ''),
          COALESCE(json_extract(old.data, '$.tags'), '')
        );
      END
    `);

    db.run(`
      CREATE TRIGGER IF NOT EXISTS entities_au AFTER UPDATE ON entities BEGIN
        INSERT INTO entities_fts(entities_fts, rowid, name, brand, range_name, code, tags)
        VALUES (
          'delete', old.rowid, old.name,
          COALESCE(json_extract(old.data, '$.brand'), ''),
          COALESCE(json_extract(old.data, '$.range'), ''),
          COALESCE(json_extract(old.data, '$.code'), ''),
          COALESCE(json_extract(old.data, '$.tags'), '')
        );
        INSERT INTO entities_fts(rowid, name, brand, range_name, code, tags)
        VALUES (
          new.rowid, new.name,
          COALESCE(json_extract(new.data, '$.brand'), ''),
          COALESCE(json_extract(new.data, '$.range'), ''),
          COALESCE(json_extract(new.data, '$.code'), ''),
          COALESCE(json_extract(new.data, '$.tags'), '')
        );
      END
    `);

    console.log('FTS5 with trigram tokenizer enabled');
  } catch (e) {
    console.warn('FTS5 not available, falling back to LIKE search:', e.message);
  }

  persist();
}

export function persist() {
  if (!db) return;
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function get(sql, params = []) {
  const rows = all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sql, params = []) {
  db.run(sql, params);
  persist();
  return {
    changes: db.getRowsModified(),
  };
}

export function hasFts() {
  try {
    db.run("SELECT * FROM entities_fts LIMIT 0");
    return true;
  } catch {
    return false;
  }
}
