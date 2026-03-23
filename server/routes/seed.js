import { Router } from 'express';
import { get } from '../db.js';
import { seedIfNeeded } from '../seed.js';

const router = Router();

// GET /api/seed/status
router.get('/status', (req, res) => {
  const row = get(
    "SELECT COUNT(*) as count FROM entities WHERE type = 'paint' AND json_extract(data, '$.is_seed') = 1"
  );
  res.json({ seeded: (row?.count ?? 0) > 0 });
});

// POST /api/seed
router.post('/', (req, res) => {
  seedIfNeeded();
  res.json({ ok: true });
});

export default router;
