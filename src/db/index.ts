import { Platform } from 'react-native';
import type { Entity, EntityType } from '../types';
import type { DatabaseAdapter } from './types';

let adapter: DatabaseAdapter | null = null;

export async function initDatabase(): Promise<void> {
  if (adapter) return;

  if (Platform.OS === 'web') {
    const { createApiAdapter } = await import('./api-client');
    adapter = createApiAdapter();
    // Trigger seed on server if needed
    const seeded = await adapter.hasSeedData();
    if (!seeded) {
      await fetch('/api/seed', { method: 'POST' });
    }
  } else {
    const { getDatabase } = await import('./database');
    const { createSqliteAdapter } = await import('./database');
    await getDatabase();
    adapter = createSqliteAdapter();
    const { seedDatabase } = await import('./seed');
    await seedDatabase();
  }
}

function getAdapter(): DatabaseAdapter {
  if (!adapter) throw new Error('Database not initialized. Call initDatabase() first.');
  return adapter;
}

// Re-export all functions, delegating to the resolved adapter
export async function insertEntity(entity: Entity): Promise<void> {
  return getAdapter().insertEntity(entity);
}

export async function insertEntitiesBatch(entities: Entity[]): Promise<void> {
  return getAdapter().insertEntitiesBatch(entities);
}

export async function getEntity<T extends Entity>(id: string): Promise<T | null> {
  return getAdapter().getEntity<T>(id);
}

export async function getEntitiesByType<T extends Entity>(type: EntityType): Promise<T[]> {
  return getAdapter().getEntitiesByType<T>(type);
}

export async function updateEntity(entity: Entity): Promise<void> {
  return getAdapter().updateEntity(entity);
}

export async function deleteEntity(id: string): Promise<void> {
  return getAdapter().deleteEntity(id);
}

export async function searchEntities(query: string, type?: EntityType): Promise<Entity[]> {
  return getAdapter().searchEntities(query, type);
}

export async function getRecipesForPaint(paintId: string): Promise<Entity[]> {
  return getAdapter().getRecipesForPaint(paintId);
}

export async function getRecipesForModel(modelId: string): Promise<Entity[]> {
  return getAdapter().getRecipesForModel(modelId);
}

export async function getRecipesForScheme(schemeId: string): Promise<Entity[]> {
  return getAdapter().getRecipesForScheme(schemeId);
}

export async function getPaintsNeedingRestock(): Promise<Entity[]> {
  return getAdapter().getPaintsNeedingRestock();
}

export async function getOnOrderPaints(): Promise<Entity[]> {
  return getAdapter().getOnOrderPaints();
}

export async function getOwnedPaints(): Promise<Entity[]> {
  return getAdapter().getOwnedPaints();
}

export async function getEntityCount(type: EntityType): Promise<number> {
  return getAdapter().getEntityCount(type);
}

export async function hasSeedData(): Promise<boolean> {
  return getAdapter().hasSeedData();
}
