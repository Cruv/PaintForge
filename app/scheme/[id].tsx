import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getEntity, getRecipesForScheme } from '../../src/db/database';
import { useSchemeStore } from '../../src/stores/schemeStore';
import { ColorSwatch } from '../../src/components/ColorSwatch';
import type { Scheme, Paint, Recipe, Model } from '../../src/types';
import { colors, spacing, fontSize, borderRadius } from '../../src/constants/theme';

export default function SchemeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [palettePaints, setPalettePaints] = useState<Paint[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { deleteScheme } = useSchemeStore();
  const router = useRouter();

  useEffect(() => {
    loadScheme();
  }, [id]);

  async function loadScheme() {
    if (!id) return;
    const s = await getEntity<Scheme>(id);
    setScheme(s);
    if (!s) return;

    // Load palette paints
    const paints: Paint[] = [];
    for (const paintId of s.palette) {
      const p = await getEntity<Paint>(paintId);
      if (p) paints.push(p);
    }
    setPalettePaints(paints);

    // Load recipes
    const r = await getRecipesForScheme(id) as Recipe[];
    setRecipes(r);
  }

  if (!scheme) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Scheme',
      `Are you sure you want to delete "${scheme.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteScheme(scheme.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: scheme.name }} />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{scheme.name}</Text>
          {scheme.description ? (
            <Text style={styles.description}>{scheme.description}</Text>
          ) : null}
        </View>

        {/* Palette */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Palette</Text>
          {palettePaints.length === 0 ? (
            <Text style={styles.emptyText}>No paints in palette.</Text>
          ) : (
            palettePaints.map((paint) => (
              <Pressable
                key={paint.id}
                style={styles.paletteItem}
                onPress={() => router.push(`/paint/${paint.id}`)}
              >
                <ColorSwatch hex={paint.hex} size={28} />
                <View style={styles.paintInfo}>
                  <Text style={styles.paintName}>{paint.name}</Text>
                  <Text style={styles.paintBrand}>{paint.brand} · {paint.range}</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Recipes */}
        {recipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recipes</Text>
            {recipes.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={styles.connectionItem}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                <Text style={styles.connectionTitle}>{recipe.area}</Text>
                <Text style={styles.connectionSubtitle}>
                  {recipe.steps.length} steps
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Tags */}
        {scheme.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {scheme.tags.map((tag) => (
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
            <Text style={styles.deleteBtnText}>Delete Scheme</Text>
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
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
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
  paletteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  paintInfo: {
    flex: 1,
    gap: 2,
  },
  paintName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.primary,
  },
  paintBrand: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
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
