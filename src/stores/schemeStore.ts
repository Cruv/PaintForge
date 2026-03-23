import { create } from 'zustand';
import type { Scheme } from '../types';
import {
  getEntitiesByType,
  insertEntity,
  updateEntity,
  deleteEntity,
} from '../db/database';

interface SchemeStore {
  schemes: Scheme[];
  isLoading: boolean;

  loadSchemes: () => Promise<void>;
  saveScheme: (scheme: Scheme) => Promise<void>;
  updateScheme: (scheme: Scheme) => Promise<void>;
  deleteScheme: (schemeId: string) => Promise<void>;
}

export const useSchemeStore = create<SchemeStore>((set, get) => ({
  schemes: [],
  isLoading: false,

  loadSchemes: async () => {
    set({ isLoading: true });
    const schemes = await getEntitiesByType<Scheme>('scheme');
    set({ schemes, isLoading: false });
  },

  saveScheme: async (scheme: Scheme) => {
    await insertEntity(scheme);
    await get().loadSchemes();
  },

  updateScheme: async (scheme: Scheme) => {
    const updated = { ...scheme, updated: new Date().toISOString() };
    await updateEntity(updated);
    await get().loadSchemes();
  },

  deleteScheme: async (schemeId: string) => {
    await deleteEntity(schemeId);
    await get().loadSchemes();
  },
}));
