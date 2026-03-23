import { create } from 'zustand';
import type { Recipe } from '../types';
import {
  getEntitiesByType,
  insertEntity,
  updateEntity,
  deleteEntity,
  getRecipesForModel,
  getRecipesForPaint,
  getRecipesForScheme,
} from '../db';

interface RecipeStore {
  recipes: Recipe[];
  isLoading: boolean;

  loadRecipes: () => Promise<void>;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (recipeId: string) => Promise<void>;
  getRecipesByModel: (modelId: string) => Promise<Recipe[]>;
  getRecipesByPaint: (paintId: string) => Promise<Recipe[]>;
  getRecipesByScheme: (schemeId: string) => Promise<Recipe[]>;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  isLoading: false,

  loadRecipes: async () => {
    set({ isLoading: true });
    const recipes = await getEntitiesByType<Recipe>('recipe');
    set({ recipes, isLoading: false });
  },

  saveRecipe: async (recipe: Recipe) => {
    await insertEntity(recipe);
    await get().loadRecipes();
  },

  updateRecipe: async (recipe: Recipe) => {
    const updated = { ...recipe, updated: new Date().toISOString() };
    await updateEntity(updated);
    await get().loadRecipes();
  },

  deleteRecipe: async (recipeId: string) => {
    await deleteEntity(recipeId);
    await get().loadRecipes();
  },

  getRecipesByModel: async (modelId: string) => {
    return await getRecipesForModel(modelId) as Recipe[];
  },

  getRecipesByPaint: async (paintId: string) => {
    return await getRecipesForPaint(paintId) as Recipe[];
  },

  getRecipesByScheme: async (schemeId: string) => {
    return await getRecipesForScheme(schemeId) as Recipe[];
  },
}));
