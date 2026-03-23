import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

function getEntityName(entity) {
  if (entity.type === 'recipe') return entity.area;
  return entity.name;
}

// GET /api/entities?type=:type
router.get('/', (req, res) => {
  const { type } = req.query;
  if (!type) {
    return res.status(400).json({ error: 'type query parameter required' });
  }
  const rows = all('SELECT data FROM entities WHERE type = ? ORDER BY name ASC', [type]);
  res.json(rows.map((r) => JSON.parse(r.data)));
});

// GET /api/entities/count?type=:type
router.get('/count', (req, res) => {
  const { type } = req.query;
  if (!type) {
    return res.status(400).json({ error: 'type query parameter required' });
  }
  const row = get('SELECT COUNT(*) as count FROM entities WHERE type = ?', [type]);
  res.json({ count: row?.count ?? 0 });
});

// GET /api/entities/:id
router.get('/:id', (req, res) => {
  const row = get('SELECT data FROM entities WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(JSON.parse(row.data));
});

// POST /api/entities
router.post('/', (req, res) => {
  const entity = req.body;
  if (!entity?.id || !entity?.type) {
    return res.status(400).json({ error: 'Entity must have id and type' });
  }
  const name = getEntityName(entity);
  run(
    'INSERT OR REPLACE INTO entities (id, type, name, data, created, updated) VALUES (?, ?, ?, ?, ?, ?)',
    [entity.id, entity.type, name, JSON.stringify(entity), entity.created, entity.updated]
  );
  res.status(201).json({ ok: true });
});

// POST /api/entities/batch
router.post('/batch', (req, res) => {
  const { entities } = req.body;
  if (!Array.isArray(entities)) {
    return res.status(400).json({ error: 'entities array required' });
  }
  for (const entity of entities) {
    const name = getEntityName(entity);
    run(
      'INSERT OR REPLACE INTO entities (id, type, name, data, created, updated) VALUES (?, ?, ?, ?, ?, ?)',
      [entity.id, entity.type, name, JSON.stringify(entity), entity.created, entity.updated]
    );
  }
  res.json({ ok: true, count: entities.length });
});

// PUT /api/entities/:id
router.put('/:id', (req, res) => {
  const entity = req.body;
  const name = getEntityName(entity);
  run(
    'UPDATE entities SET name = ?, data = ?, updated = ? WHERE id = ?',
    [name, JSON.stringify(entity), entity.updated, req.params.id]
  );
  res.json({ ok: true });
});

// DELETE /api/entities/:id
router.delete('/:id', (req, res) => {
  run('DELETE FROM entities WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

export default router;
