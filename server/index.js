import express from 'express';
import compression from 'compression';
import { initDb } from './db.js';
import { seedIfNeeded } from './seed.js';
import entitiesRoutes from './routes/entities.js';
import searchRoutes from './routes/search.js';
import paintsRoutes from './routes/paints.js';
import recipesRoutes from './routes/recipes.js';
import seedRoutes from './routes/seed.js';

const PORT = process.env.PORT || 3001;

const app = express();

app.use(compression());
app.use(express.json({ limit: '5mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/entities', entitiesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/paints', paintsRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/seed', seedRoutes);

// Start
async function start() {
  await initDb();
  seedIfNeeded();

  app.listen(PORT, () => {
    console.log(`PaintForge API running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
