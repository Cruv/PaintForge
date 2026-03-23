import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../../src/stores/recipeStore';
import { SearchBar } from '../../src/components/SearchBar';
import { EmptyState } from '../../src/components/EmptyState';
import type { Recipe } from '../../src/types';
import { colors, spacing, fontSize, borderRadius } from '../../src/constants/theme';
import { techniqueLabels } from '../../src/constants/theme';

function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const router = useRouter();

  const techniqueSummary = recipe.steps
    .map((s) => techniqueLabels[s.technique] || s.technique)
    .join(' > ');

  return (
    <Pressable
      style={({ pressed }) => [styles.recipeItem, pressed && styles.pressed]}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName} numberOfLines={1}>{recipe.area}</Text>
        <Text style={styles.recipeDetail} numberOfLines={1}>
          {recipe.steps.length} step{recipe.steps.length !== 1 ? 's' : ''}
          {recipe.is_template ? ' (Template)' : ''}
        </Text>
        <Text style={styles.recipeTechniques} numberOfLines={1}>{techniqueSummary}</Text>
      </View>
      {recipe.rating != null && (
        <Text style={styles.rating}>
          {'★'.repeat(recipe.rating)}{'☆'.repeat(5 - recipe.rating)}
        </Text>
      )}
    </Pressable>
  );
}

export default function RecipesScreen() {
  const { recipes, isLoading, loadRecipes } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadRecipes();
  }, []);

  const filteredRecipes = recipes.filter((r) => {
    if (searchQuery.length < 2) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.area.toLowerCase().includes(query) ||
      r.tags.some((t) => t.toLowerCase().includes(query)) ||
      r.steps.some((s) => s.technique.toLowerCase().includes(query))
    );
  });

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search recipes by area, tag, or technique..."
      />

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeListItem recipe={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            title={recipes.length === 0 ? 'No recipes yet' : 'No matches'}
            message={
              recipes.length === 0
                ? 'Create recipes from a model\'s detail view to document your paint techniques.'
                : 'Try a different search.'
            }
          />
        }
        contentContainerStyle={filteredRecipes.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgCard,
    gap: spacing.md,
  },
  pressed: {
    backgroundColor: colors.borderLight,
  },
  recipeInfo: {
    flex: 1,
    gap: 2,
  },
  recipeName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  recipeDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  recipeTechniques: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  rating: {
    fontSize: fontSize.sm,
    color: colors.warning,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
});
