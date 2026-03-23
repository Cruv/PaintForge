import { Router } from 'express';
import { all } from '../db.js';

const router = Router();

// GET /api/paints/owned
router.get('/owned', (req, res) => {
  const rows = all(
    `SELECT data FROM entities WHERE type = 'paint'
     AND json_extract(data, '$.owned') = 1
     ORDER BY json_extract(data, '$.brand') ASC, name ASC`
  );
  res.json(rows.map((r) => JSON.parse(r.data)));
});

// GET /api/paints/restock
router.get('/restock', (req, res) => {
  const rows = all(
    `SELECT data FROM entities WHERE type = 'paint'
     AND json_extract(data, '$.owned') = 1
     AND json_extract(data, '$.stock.status') IN ('low', 'out')
     ORDER BY json_extract(data, '$.stock.status') ASC, name ASC`
  );
  res.json(rows.map((r) => JSON.parse(r.data)));
});

// GET /api/paints/on-order
router.get('/on-order', (req, res) => {
  const rows = all(
    `SELECT data FROM entities WHERE type = 'paint'
     AND json_extract(data, '$.owned') = 1
     AND json_extract(data, '$.stock.status') = 'on_order'
     ORDER BY name ASC`
  );
  res.json(rows.map((r) => JSON.parse(r.data)));
});

export default router;
