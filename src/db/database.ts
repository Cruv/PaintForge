import * as SQLite from 'expo-sqlite';
import type { Entity, EntityType } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('paintforge.db');
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      data JSON NOT NULL,
      created TEXT NOT NULL,
      updated TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
    CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);

    CREATE TABLE IF NOT EXISTS barcode_mappings (
      barcode TEXT PRIMARY KEY,
      paint_id TEXT NOT NULL,
      created TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_barcode_paint ON barcode_mappings(paint_id);

    CREATE VIRTUAL TABLE IF NOT EXISTS entities_fts USING fts5(
      name,
      brand,
      range_name,
      code,
      tags,
      content=entities,
      content_rowid=rowid,
      tokenize='trigram'
    );

    CREATE TRIGGER IF NOT EXISTS entities_ai AFTER INSERT ON entities BEGIN
      INSERT INTO entities_fts(rowid, name, brand, range_name, code, tags)
      VALUES (
        new.rowid,
        new.name,
        COALESCE(json_extract(new.data, '$.brand'), ''),
        COALESCE(json_extract(new.data, '$.range'), ''),
        COALESCE(json_extract(new.data, '$.code'), ''),
        COALESCE(json_extract(new.data, '$.tags'), '')
      );
    END;

    CREATE TRIGGER IF NOT EXISTS entities_ad AFTER DELETE ON entities BEGIN
      INSERT INTO entities_fts(entities_fts, rowid, name, brand, range_name, code, tags)
      VALUES (
        'delete',
        old.rowid,
        old.name,
        COALESCE(json_extract(old.data, '$.brand'), ''),
        COALESCE(json_extract(old.data, '$.range'), ''),
        COALESCE(json_extract(old.data, '$.code'), ''),
        COALESCE(json_extract(old.data, '$.tags'), '')
      );
    END;

    CREATE TRIGGER IF NOT EXISTS entities_au AFTER UPDATE ON entities BEGIN
      INSERT INTO entities_fts(entities_fts, rowid, name, brand, range_name, code, tags)
      VALUES (
        'delete',
        old.rowid,
        old.name,
        COALESCE(json_extract(old.data, '$.brand'), ''),
        COALESCE(json_extract(old.data, '$.range'), ''),
        COALESCE(json_extract(old.data, '$.code'), ''),
        COALESCE(json_extract(old.data, '$.tags'), '')
      );
      INSERT INTO entities_fts(rowid, name, brand, range_name, code, tags)
      VALUES (
        new.rowid,
        new.name,
        COALESCE(json_extract(new.data, '$.brand'), ''),
        COALESCE(json_extract(new.data, '$.range'), ''),
        COALESCE(json_extract(new.data, '$.code'), ''),
        COALESCE(json_extract(new.data, '$.tags'), '')
      );
    END;
  `);
}

// --- CRUD Operations ---

export async function insertEntity(entity: Entity): Promise<void> {
  const database = await getDatabase();
  const name = getEntityName(entity);
  await database.runAsync(
    'INSERT OR REPLACE INTO entities (id, type, name, data, created, updated) VALUES (?, ?, ?, ?, ?, ?)',
    [entity.id, entity.type, name, JSON.stringify(entity), entity.created, entity.updated]
  );
}

export async function insertEntitiesBatch(entities: Entity[]): Promise<void> {
  const database = await getDatabase();
  await database.withExclusiveTransactionAsync(async (txn) => {
    for (const entity of entities) {
      const name = getEntityName(entity);
      await txn.runAsync(
        'INSERT OR REPLACE INTO entities (id, type, name, data, created, updated) VALUES (?, ?, ?, ?, ?, ?)',
        [entity.id, entity.type, name, JSON.stringify(entity), entity.created, entity.updated]
      );
    }
  });
}

export async function getEntity<T extends Entity>(id: string): Promise<T | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ data: string }>(
    'SELECT data FROM entities WHERE id = ?',
    [id]
  );
  return row ? JSON.parse(row.data) as T : null;
}

export async function getEntitiesByType<T extends Entity>(type: EntityType): Promise<T[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ data: string }>(
    'SELECT data FROM entities WHERE type = ? ORDER BY name ASC',
    [type]
  );
  return rows.map((row) => JSON.parse(row.data) as T);
}

export async function updateEntity(entity: Entity): Promise<void> {
  const database = await getDatabase();
  const name = getEntityName(entity);
  await database.runAsync(
    'UPDATE entities SET name = ?, data = ?, updated = ? WHERE id = ?',
    [name, JSON.stringify(entity), entity.updated, entity.id]
  );
}

export async function deleteEntity(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM entities WHERE id = ?', [id]);
}

// --- Search ---

export async function searchEntities(query: string, type?: EntityType): Promise<Entity[]> {
  const database = await getDatabase();
  const ftsQuery = `"${query.replace(/"/g, '""')}"`;

  let sql: string;
  let params: string[];

  if (type) {
    sql = `
      SELECT e.data FROM entities e
      INNER JOIN entities_fts fts ON e.rowid = fts.rowid
      WHERE entities_fts MATCH ? AND e.type = ?
      ORDER BY rank
      LIMIT 50
    `;
    params = [ftsQuery, type];
  } else {
    sql = `
      SELECT e.data FROM entities e
      INNER JOIN entities_fts fts ON e.rowid = fts.rowid
      WHERE entities_fts MATCH ?
      ORDER BY rank
      LIMIT 50
    `;
    params = [ftsQuery];
  }

  const rows = await database.getAllAsync<{ data: string }>(sql, params);
  return rows.map((row) => JSON.parse(row.data) as Entity);
}

// --- Relationship Queries ---

export async function getRecipesForPaint(paintId: string): Promise<Entity[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ data: string }>(
    `SELECT e.data FROM entities e, json_each(json_extract(e.data, '$.steps')) AS step
     WHERE e.type = 'recipe'
     AND json_extract(step.value, '$.paint_id') = ?
     GROUP BY e.id`,
    [paintId]
  );
  return rows.map((row) => JSON.parse(row.data));
}

export async function getRecipesForModel(modelId: string): Promise<Entity[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ data: string }>(
    `SELECT data FROM entities WHERE type = 'recipe' AND json_extract(data, '$.model_id') = ?`,
    [modelId]
  );
  return rows.map((row) => JSON.parse(row.data));
}

export async function getRecipesForScheme(schemeId: string): Promise<Entity[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ data: string }>(
    `SELECT data FROM entities WHERE type = 'recipe' AND json_extract(data, '$.scheme_id') = ?`,
    [schemeId]
  );
  return rows.map((row) => JSON.parse(row.data));
}

export async function getPaintsNeedingRestock(): Promise<Entity[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ data: string }>(
    `SELECT data FROM entities WHERE type = 'paint'
     AND json_extract(data, '$.owned') = 1
     AND json_extract(data, '$.stock.status') IN ('low', 'out')
     ORDER BY json_extract(data, '$.stock.status') ASC, name ASC`
  );
  return rows.map((row) => JSON.parse(row.data));
}

export async function getOnOrderPaints(): Promise<Entity[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ data: string }>(
    `SELECT data FROM entities WHERE type = 'paint'
     AND json_extract(data, '$.owned') = 1
     AND json_extract(data, '$.stock.status') = 'on_order'
     ORDER BY name ASC`
  );
  return rows.map((row) => JSON.parse(row.data));
}

export async function getOwnedPaints(): Promise<Entity[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ data: string }>(
    `SELECT data FROM entities WHERE type = 'paint'
     AND json_extract(data, '$.owned') = 1
     ORDER BY json_extract(data, '$.brand') ASC, name ASC`
  );
  return rows.map((row) => JSON.parse(row.data));
}

export async function getEntityCount(type: EntityType): Promise<number> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM entities WHERE type = ?',
    [type]
  );
  return row?.count ?? 0;
}

export async function hasSeedData(): Promise<boolean> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM entities WHERE type = 'paint' AND json_extract(data, '$.is_seed') = 1`
  );
  return (row?.count ?? 0) > 0;
}

// --- Barcode Mappings ---

export async function lookupBarcode(code: string): Promise<Entity | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ paint_id: string }>(
    'SELECT paint_id FROM barcode_mappings WHERE barcode = ?',
    [code]
  );
  if (!row) return null;
  return getEntity(row.paint_id);
}

export async function saveBarcode(code: string, paintId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO barcode_mappings (barcode, paint_id, created) VALUES (?, ?, ?)',
    [code, paintId, new Date().toISOString()]
  );
}

// --- Helpers ---

function getEntityName(entity: Entity): string {
  switch (entity.type) {
    case 'paint':
      return entity.name;
    case 'model':
      return entity.name;
    case 'recipe':
      return entity.area;
    case 'scheme':
      return entity.name;
  }
}

// --- Adapter ---

import type { DatabaseAdapter } from './types';

export function createSqliteAdapter(): DatabaseAdapter {
  return {
    insertEntity,
    insertEntitiesBatch,
    getEntity,
    getEntitiesByType,
    updateEntity,
    deleteEntity,
    searchEntities,
    getRecipesForPaint,
    getRecipesForModel,
    getRecipesForScheme,
    getPaintsNeedingRestock,
    getOnOrderPaints,
    getOwnedPaints,
    getEntityCount,
    hasSeedData,
    lookupBarcode,
    saveBarcode,
  };
}
