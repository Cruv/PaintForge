import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getEntity, getRecipesForModel } from '../../src/db/database';
import { useModelStore } from '../../src/stores/modelStore';
import { useRecipeStore } from '../../src/stores/recipeStore';
import { StatusBadge } from '../../src/components/StatusBadge';
import type { Model, Recipe, ModelStatus, Paint } from '../../src/types';
import { colors, spacing, fontSize, borderRadius, modelStatusLabels, techniqueLabels } from '../../src/constants/theme';
import { v4 as uuidv4 } from 'uuid';

export default function ModelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [model, setModel] = useState<Model | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { updateModelStatus, updateModel, deleteModel } = useModelStore();
  const { saveRecipe } = useRecipeStore();
  const router = useRouter();

  useEffect(() => {
    loadModel();
  }, [id]);

  async function loadModel() {
    if (!id) return;
    const m = await getEntity<Model>(id);
    setModel(m);
    if (m) {
      const r = await getRecipesForModel(id) as Recipe[];
      setRecipes(r);
    }
  }

  if (!model) return null;

  const handleStatusUpdate = () => {
    const options: ModelStatus[] = ['unbuilt', 'assembled', 'primed', 'wip', 'painted'];
    Alert.alert(
      'Update Status',
      model.name,
      [
        ...options.map((status) => ({
          text: modelStatusLabels[status],
          onPress: async () => {
            await updateModelStatus(model.id, status);
            loadModel();
          },
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  const handleAddRecipe = () => {
    Alert.prompt(
      'New Recipe',
      'What area of the model? (e.g., "armor panels", "skin", "gold trim")',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (area?: string) => {
            if (!area?.trim()) return;
            const now = new Date().toISOString();
            const recipe: Recipe = {
              id: `recipe_${uuidv4()}`,
              type: 'recipe',
              model_id: model.id,
              area: area.trim(),
              steps: [],
              is_template: false,
              tags: [],
              notes: '',
              created: now,
              updated: now,
            };
            await saveRecipe(recipe);
            router.push(`/recipe/${recipe.id}`);
          },
        },
      ],
      'plain-text',
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Model',
      `Are you sure you want to delete "${model.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteModel(model.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: model.name }} />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{model.name}</Text>
            {model.faction && (
              <Text style={styles.subtitle}>{model.faction}</Text>
            )}
            {model.game_system && (
              <Text style={styles.detail}>{model.game_system}</Text>
            )}
          </View>
          <Pressable onPress={handleStatusUpdate}>
            <StatusBadge status={model.status} />
          </Pressable>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          {model.base_size && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Base Size</Text>
              <Text style={styles.detailValue}>{model.base_size}</Text>
            </View>
          )}
          {model.project && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Project</Text>
              <Text style={styles.detailValue}>{model.project}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {model.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{model.notes}</Text>
          </View>
        ) : null}

        {/* Recipes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recipes</Text>
            <Pressable style={styles.addBtn} onPress={handleAddRecipe}>
              <Text style={styles.addBtnText}>+ Add Recipe</Text>
            </Pressable>
          </View>
          {recipes.length === 0 ? (
            <Text style={styles.emptyText}>No recipes yet. Tap + to document a paint technique.</Text>
          ) : (
            recipes.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={styles.connectionItem}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                <Text style={styles.connectionTitle}>{recipe.area}</Text>
                <Text style={styles.connectionSubtitle}>
                  {recipe.steps.length} step{recipe.steps.length !== 1 ? 's' : ''}
                  {recipe.steps.length > 0 && ` · ${recipe.steps.map((s) => techniqueLabels[s.technique] || s.technique).join(' > ')}`}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        {/* Tags */}
        {model.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {model.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Danger zone */}
        <View style={styles.section}>
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete Model</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    backgroundColor: colors.bgCard,
    gap: spacing.lg,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  detail: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  section: {
    padding: spacing.lg,
    backgroundColor: colors.bgCard,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  addBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  addBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textInverse,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  notes: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  connectionItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  connectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.primary,
  },
  connectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight + '30',
  },
  tagText: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
  },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.danger + '15',
  },
  deleteBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.danger,
  },
});
