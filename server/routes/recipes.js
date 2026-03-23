import { Router } from 'express';
import { all } from '../db.js';

const router = Router();

// GET /api/recipes/by-paint/:id
router.get('/by-paint/:id', (req, res) => {
  const rows = all(
    `SELECT e.data FROM entities e, json_each(json_extract(e.data, '$.steps')) AS step
     WHERE e.type = 'recipe'
     AND json_extract(step.value, '$.paint_id') = ?
     GROUP BY e.id`,
    [req.params.id]
  );
  res.json(rows.map((r) => JSON.parse(r.data)));
});

// GET /api/recipes/by-model/:id
router.get('/by-model/:id', (req, res) => {
  const rows = all(
    `SELECT data FROM entities WHERE type = 'recipe' AND json_extract(data, '$.model_id') = ?`,
    [req.params.id]
  );
  res.json(rows.map((r) => JSON.parse(r.data)));
});

// GET /api/recipes/by-scheme/:id
router.get('/by-scheme/:id', (req, res) => {
  const rows = all(
    `SELECT data FROM entities WHERE type = 'recipe' AND json_extract(data, '$.scheme_id') = ?`,
    [req.params.id]
  );
  res.json(rows.map((r) => JSON.parse(r.data)));
});

export default router;
