import type { Entity, EntityType } from '../types';

export interface DatabaseAdapter {
  insertEntity(entity: Entity): Promise<void>;
  insertEntitiesBatch(entities: Entity[]): Promise<void>;
  getEntity<T extends Entity>(id: string): Promise<T | null>;
  getEntitiesByType<T extends Entity>(type: EntityType): Promise<T[]>;
  updateEntity(entity: Entity): Promise<void>;
  deleteEntity(id: string): Promise<void>;
  searchEntities(query: string, type?: EntityType): Promise<Entity[]>;
  getRecipesForPaint(paintId: string): Promise<Entity[]>;
  getRecipesForModel(modelId: string): Promise<Entity[]>;
  getRecipesForScheme(schemeId: string): Promise<Entity[]>;
  getPaintsNeedingRestock(): Promise<Entity[]>;
  getOnOrderPaints(): Promise<Entity[]>;
  getOwnedPaints(): Promise<Entity[]>;
  getEntityCount(type: EntityType): Promise<number>;
  hasSeedData(): Promise<boolean>;
}
