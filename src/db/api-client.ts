import type { Entity, EntityType } from '../types';
import type { DatabaseAdapter } from './types';

const API_BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${msg}`);
  }
  return res.json();
}

export function createApiAdapter(): DatabaseAdapter {
  return {
    async insertEntity(entity: Entity): Promise<void> {
      await apiFetch('/entities', {
        method: 'POST',
        body: JSON.stringify(entity),
      });
    },

    async insertEntitiesBatch(entities: Entity[]): Promise<void> {
      await apiFetch('/entities/batch', {
        method: 'POST',
        body: JSON.stringify({ entities }),
      });
    },

    async getEntity<T extends Entity>(id: string): Promise<T | null> {
      try {
        return await apiFetch<T>(`/entities/${encodeURIComponent(id)}`);
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('404')) return null;
        throw e;
      }
    },

    async getEntitiesByType<T extends Entity>(type: EntityType): Promise<T[]> {
      return apiFetch<T[]>(`/entities?type=${encodeURIComponent(type)}`);
    },

    async updateEntity(entity: Entity): Promise<void> {
      await apiFetch(`/entities/${encodeURIComponent(entity.id)}`, {
        method: 'PUT',
        body: JSON.stringify(entity),
      });
    },

    async deleteEntity(id: string): Promise<void> {
      await apiFetch(`/entities/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },

    async searchEntities(query: string, type?: EntityType): Promise<Entity[]> {
      let path = `/search?q=${encodeURIComponent(query)}`;
      if (type) path += `&type=${encodeURIComponent(type)}`;
      return apiFetch<Entity[]>(path);
    },

    async getRecipesForPaint(paintId: string): Promise<Entity[]> {
      return apiFetch<Entity[]>(`/recipes/by-paint/${encodeURIComponent(paintId)}`);
    },

    async getRecipesForModel(modelId: string): Promise<Entity[]> {
      return apiFetch<Entity[]>(`/recipes/by-model/${encodeURIComponent(modelId)}`);
    },

    async getRecipesForScheme(schemeId: string): Promise<Entity[]> {
      return apiFetch<Entity[]>(`/recipes/by-scheme/${encodeURIComponent(schemeId)}`);
    },

    async getPaintsNeedingRestock(): Promise<Entity[]> {
      return apiFetch<Entity[]>('/paints/restock');
    },

    async getOnOrderPaints(): Promise<Entity[]> {
      return apiFetch<Entity[]>('/paints/on-order');
    },

    async getOwnedPaints(): Promise<Entity[]> {
      return apiFetch<Entity[]>('/paints/owned');
    },

    async getEntityCount(type: EntityType): Promise<number> {
      const result = await apiFetch<{ count: number }>(`/entities/count?type=${encodeURIComponent(type)}`);
      return result.count;
    },

    async hasSeedData(): Promise<boolean> {
      const result = await apiFetch<{ seeded: boolean }>('/seed/status');
      return result.seeded;
    },
  };
}
