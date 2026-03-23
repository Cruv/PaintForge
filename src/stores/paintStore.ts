import { create } from 'zustand';
import type { Paint, StockStatus } from '../types';
import {
  getOwnedPaints,
  getEntitiesByType,
  insertEntity,
  updateEntity,
  deleteEntity,
  searchEntities,
  getRecipesForPaint,
  getPaintsNeedingRestock,
  getOnOrderPaints,
} from '../db/database';

interface PaintStore {
  ownedPaints: Paint[];
  shoppingList: Paint[];
  onOrderPaints: Paint[];
  isLoading: boolean;
  searchResults: Paint[];

  loadOwnedPaints: () => Promise<void>;
  loadShoppingList: () => Promise<void>;
  searchPaints: (query: string) => Promise<void>;
  addToCollection: (paint: Paint) => Promise<void>;
  removeFromCollection: (paintId: string) => Promise<void>;
  updateStockStatus: (paintId: string, status: StockStatus) => Promise<void>;
  savePaint: (paint: Paint) => Promise<void>;
  clearSearch: () => void;
}

export const usePaintStore = create<PaintStore>((set, get) => ({
  ownedPaints: [],
  shoppingList: [],
  onOrderPaints: [],
  isLoading: false,
  searchResults: [],

  loadOwnedPaints: async () => {
    set({ isLoading: true });
    const paints = await getOwnedPaints() as Paint[];
    set({ ownedPaints: paints, isLoading: false });
  },

  loadShoppingList: async () => {
    const [needRestock, onOrder] = await Promise.all([
      getPaintsNeedingRestock() as Promise<Paint[]>,
      getOnOrderPaints() as Promise<Paint[]>,
    ]);
    set({ shoppingList: needRestock as Paint[], onOrderPaints: onOrder as Paint[] });
  },

  searchPaints: async (query: string) => {
    if (query.length < 2) {
      set({ searchResults: [] });
      return;
    }
    const results = await searchEntities(query, 'paint') as Paint[];
    set({ searchResults: results });
  },

  addToCollection: async (paint: Paint) => {
    const updated: Paint = {
      ...paint,
      owned: true,
      stock: { ...paint.stock, status: 'stocked' },
      updated: new Date().toISOString(),
    };
    await updateEntity(updated);
    await get().loadOwnedPaints();
  },

  removeFromCollection: async (paintId: string) => {
    // Don't delete seed paints, just mark as not owned
    const paints = await getEntitiesByType<Paint>('paint');
    const paint = paints.find((p) => p.id === paintId);
    if (paint?.is_seed) {
      const updated: Paint = {
        ...paint,
        owned: false,
        stock: { ...paint.stock, status: 'stocked' },
        updated: new Date().toISOString(),
      };
      await updateEntity(updated);
    } else {
      await deleteEntity(paintId);
    }
    await get().loadOwnedPaints();
  },

  updateStockStatus: async (paintId: string, status: StockStatus) => {
    const paints = get().ownedPaints;
    const paint = paints.find((p) => p.id === paintId);
    if (!paint) return;

    const updated: Paint = {
      ...paint,
      stock: {
        ...paint.stock,
        status,
        ordered_date: status === 'on_order' ? new Date().toISOString() : paint.stock.ordered_date,
      },
      updated: new Date().toISOString(),
    };
    await updateEntity(updated);
    await get().loadOwnedPaints();
    await get().loadShoppingList();
  },

  savePaint: async (paint: Paint) => {
    await insertEntity(paint);
    await get().loadOwnedPaints();
  },

  clearSearch: () => set({ searchResults: [] }),
}));
