import { create } from 'zustand';
import type { Model, ModelStatus } from '../types';
import {
  getEntitiesByType,
  insertEntity,
  updateEntity,
  deleteEntity,
} from '../db/database';

interface ModelStore {
  models: Model[];
  isLoading: boolean;

  loadModels: () => Promise<void>;
  saveModel: (model: Model) => Promise<void>;
  updateModel: (model: Model) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  updateModelStatus: (modelId: string, status: ModelStatus) => Promise<void>;
}

export const useModelStore = create<ModelStore>((set, get) => ({
  models: [],
  isLoading: false,

  loadModels: async () => {
    set({ isLoading: true });
    const models = await getEntitiesByType<Model>('model');
    set({ models, isLoading: false });
  },

  saveModel: async (model: Model) => {
    await insertEntity(model);
    await get().loadModels();
  },

  updateModel: async (model: Model) => {
    const updated = { ...model, updated: new Date().toISOString() };
    await updateEntity(updated);
    await get().loadModels();
  },

  deleteModel: async (modelId: string) => {
    await deleteEntity(modelId);
    await get().loadModels();
  },

  updateModelStatus: async (modelId: string, status: ModelStatus) => {
    const model = get().models.find((m) => m.id === modelId);
    if (!model) return;
    await get().updateModel({ ...model, status });
  },
}));
