import { Router } from 'express';
import { all, hasFts } from '../db.js';

const router = Router();

// GET /api/search?q=:query&type=:type
router.get('/', (req, res) => {
  const { q, type } = req.query;
  if (!q || q.length < 2) {
    return res.json([]);
  }

  let rows;

  if (hasFts()) {
    // Use FTS5 trigram search
    const ftsQuery = `"${q.replace(/"/g, '""')}"`;
    if (type) {
      rows = all(
        `SELECT e.data FROM entities e
         INNER JOIN entities_fts fts ON e.rowid = fts.rowid
         WHERE entities_fts MATCH ? AND e.type = ?
         ORDER BY rank LIMIT 50`,
        [ftsQuery, type]
      );
    } else {
      rows = all(
        `SELECT e.data FROM entities e
         INNER JOIN entities_fts fts ON e.rowid = fts.rowid
         WHERE entities_fts MATCH ?
         ORDER BY rank LIMIT 50`,
        [ftsQuery]
      );
    }
  } else {
    // Fallback to LIKE search
    const pattern = `%${q}%`;
    if (type) {
      rows = all(
        `SELECT data FROM entities
         WHERE type = ? AND (
           name LIKE ? OR
           json_extract(data, '$.brand') LIKE ? OR
           json_extract(data, '$.range') LIKE ? OR
           json_extract(data, '$.code') LIKE ?
         )
         ORDER BY name ASC LIMIT 50`,
        [type, pattern, pattern, pattern, pattern]
      );
    } else {
      rows = all(
        `SELECT data FROM entities
         WHERE name LIKE ? OR
           json_extract(data, '$.brand') LIKE ? OR
           json_extract(data, '$.range') LIKE ? OR
           json_extract(data, '$.code') LIKE ?
         ORDER BY name ASC LIMIT 50`,
        [pattern, pattern, pattern, pattern]
      );
    }
  }

  res.json(rows.map((r) => JSON.parse(r.data)));
});

export default router;
