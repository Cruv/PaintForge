import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

// GET /api/barcodes — list all learned barcode mappings
router.get('/', (req, res) => {
  const rows = all('SELECT * FROM barcode_mappings ORDER BY created DESC');
  res.json(rows);
});

// GET /api/barcodes/:code — look up a barcode, return the associated paint
router.get('/:code', (req, res) => {
  const mapping = get('SELECT * FROM barcode_mappings WHERE barcode = ?', [req.params.code]);
  if (!mapping) return res.status(404).json({ error: 'Barcode not found' });

  const paint = get('SELECT data FROM entities WHERE id = ?', [mapping.paint_id]);
  if (!paint) return res.status(404).json({ error: 'Paint not found for barcode' });

  res.json({
    barcode: mapping.barcode,
    paint: JSON.parse(paint.data),
  });
});

// POST /api/barcodes — save a new barcode → paint mapping
router.post('/', (req, res) => {
  const { barcode, paint_id } = req.body;
  if (!barcode || !paint_id) {
    return res.status(400).json({ error: 'barcode and paint_id required' });
  }
  run(
    'INSERT OR REPLACE INTO barcode_mappings (barcode, paint_id, created) VALUES (?, ?, ?)',
    [barcode, paint_id, new Date().toISOString()]
  );
  res.status(201).json({ ok: true });
});

// DELETE /api/barcodes/:code — remove a barcode mapping
router.delete('/:code', (req, res) => {
  run('DELETE FROM barcode_mappings WHERE barcode = ?', [req.params.code]);
  res.json({ ok: true });
});

export default router;
