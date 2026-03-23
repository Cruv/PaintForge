import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getEntity } from '../../src/db/database';
import { useRecipeStore } from '../../src/stores/recipeStore';
import { ColorSwatch } from '../../src/components/ColorSwatch';
import { StockBadge } from '../../src/components/StockBadge';
import type { Recipe, Paint, Model, Scheme } from '../../src/types';
import { colors, spacing, fontSize, borderRadius, techniqueLabels } from '../../src/constants/theme';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [stepPaints, setStepPaints] = useState<Record<string, Paint>>({});
  const { deleteRecipe } = useRecipeStore();
  const router = useRouter();

  useEffect(() => {
    loadRecipe();
  }, [id]);

  async function loadRecipe() {
    if (!id) return;
    const r = await getEntity<Recipe>(id);
    setRecipe(r);
    if (!r) return;

    // Load related model
    if (r.model_id) {
      const m = await getEntity<Model>(r.model_id);
      setModel(m);
    }

    // Load related scheme
    if (r.scheme_id) {
      const s = await getEntity<Scheme>(r.scheme_id);
      setScheme(s);
    }

    // Load paints for each step
    const paints: Record<string, Paint> = {};
    for (const step of r.steps) {
      if (step.paint_id && !paints[step.paint_id]) {
        const p = await getEntity<Paint>(step.paint_id);
        if (p) paints[step.paint_id] = p;
      }
    }
    setStepPaints(paints);
  }

  if (!recipe) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete the "${recipe.area}" recipe?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRecipe(recipe.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: recipe.area }} />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.area}>{recipe.area}</Text>
          {recipe.rating != null && (
            <Text style={styles.rating}>
              {'★'.repeat(recipe.rating)}{'☆'.repeat(5 - recipe.rating)}
            </Text>
          )}
          {recipe.is_template && (
            <View style={styles.templateBadge}>
              <Text style={styles.templateText}>Template</Text>
            </View>
          )}
        </View>

        {/* Connections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connections</Text>
          {model && (
            <Pressable
              style={styles.connectionItem}
              onPress={() => router.push(`/model/${model.id}`)}
            >
              <Text style={styles.connectionLabel}>Model</Text>
              <Text style={styles.connectionValue}>{model.name}</Text>
            </Pressable>
          )}
          {scheme && (
            <Pressable
              style={styles.connectionItem}
              onPress={() => router.push(`/scheme/${scheme.id}`)}
            >
              <Text style={styles.connectionLabel}>Scheme</Text>
              <Text style={styles.connectionValue}>{scheme.name}</Text>
            </Pressable>
          )}
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Steps ({recipe.steps.length})
          </Text>
          {recipe.steps.length === 0 ? (
            <Text style={styles.emptyText}>No steps added yet.</Text>
          ) : (
            recipe.steps.map((step, index) => {
              const paint = stepPaints[step.paint_id];
              return (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.order}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.technique}>
                        {techniqueLabels[step.technique] || step.technique}
                      </Text>
                    </View>
                    {paint && (
                      <Pressable
                        style={styles.stepPaint}
                        onPress={() => router.push(`/paint/${paint.id}`)}
                      >
                        <ColorSwatch hex={paint.hex} size={20} />
                        <Text style={styles.paintName}>{paint.name}</Text>
                        <Text style={styles.paintBrand}>{paint.brand}</Text>
                        {paint.owned && (
                          <StockBadge status={paint.stock.status} compact />
                        )}
                      </Pressable>
                    )}
                    {step.notes ? (
                      <Text style={styles.stepNotes}>{step.notes}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Notes */}
        {recipe.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{recipe.notes}</Text>
          </View>
        ) : null}

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {recipe.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Delete */}
        <View style={styles.section}>
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete Recipe</Text>
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
    padding: spacing.lg,
    backgroundColor: colors.bgCard,
    gap: spacing.sm,
  },
  area: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  rating: {
    fontSize: fontSize.lg,
    color: colors.warning,
  },
  templateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.info + '20',
    borderWidth: 1,
    borderColor: colors.info,
  },
  templateText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.info,
  },
  section: {
    padding: spacing.lg,
    backgroundColor: colors.bgCard,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  connectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  connectionLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  connectionValue: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.primary,
  },
  stepItem: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textInverse,
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  technique: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  stepPaint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  paintName: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.primary,
  },
  paintBrand: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  stepNotes: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  notes: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
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
