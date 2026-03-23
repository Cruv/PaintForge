import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getEntity, getRecipesForPaint } from '../../src/db';
import { usePaintStore } from '../../src/stores/paintStore';
import { ColorSwatch } from '../../src/components/ColorSwatch';
import { StockBadge } from '../../src/components/StockBadge';
import type { Paint, Recipe, StockStatus } from '../../src/types';
import { colors, spacing, fontSize, borderRadius, stockStatusLabels, techniqueLabels } from '../../src/constants/theme';

export default function PaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paint, setPaint] = useState<Paint | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { updateStockStatus, addToCollection, removeFromCollection } = usePaintStore();
  const router = useRouter();

  useEffect(() => {
    loadPaint();
  }, [id]);

  async function loadPaint() {
    if (!id) return;
    const p = await getEntity<Paint>(id);
    setPaint(p);
    if (p) {
      const r = await getRecipesForPaint(id) as Recipe[];
      setRecipes(r);
    }
  }

  if (!paint) return null;

  const handleStockUpdate = () => {
    const options: StockStatus[] = ['stocked', 'low', 'out', 'on_order'];
    Alert.alert(
      'Update Stock',
      paint.name,
      options.map((status) => ({
        text: stockStatusLabels[status],
        onPress: async () => {
          await updateStockStatus(paint.id, status);
          loadPaint();
        },
        style: status === paint.stock.status ? 'cancel' : 'default',
      })),
    );
  };

  const handleToggleOwned = async () => {
    if (paint.owned) {
      await removeFromCollection(paint.id);
    } else {
      await addToCollection(paint);
    }
    loadPaint();
  };

  return (
    <>
      <Stack.Screen options={{ title: paint.name }} />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ColorSwatch hex={paint.hex} size={64} />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{paint.name}</Text>
            <Text style={styles.brand}>{paint.brand} · {paint.range}</Text>
            {paint.code && <Text style={styles.code}>{paint.code}</Text>}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, paint.owned ? styles.actionBtnDanger : styles.actionBtnPrimary]}
            onPress={handleToggleOwned}
          >
            <Text style={styles.actionBtnText}>
              {paint.owned ? 'Remove from Collection' : 'Add to Collection'}
            </Text>
          </Pressable>

          {paint.owned && (
            <Pressable style={styles.actionBtn} onPress={handleStockUpdate}>
              <View style={styles.stockAction}>
                <Text style={styles.actionBtnText}>Stock: </Text>
                <StockBadge status={paint.stock.status} />
              </View>
            </Pressable>
          )}
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Format</Text>
            <Text style={styles.detailValue}>{paint.format}</Text>
          </View>
          {paint.size_ml && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Size</Text>
              <Text style={styles.detailValue}>{paint.size_ml}ml</Text>
            </View>
          )}
          {paint.hex && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hex</Text>
              <Text style={styles.detailValue}>{paint.hex}</Text>
            </View>
          )}
          {paint.cost?.price && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>
                {paint.cost.currency || '$'}{paint.cost.price}
                {paint.cost.supplier ? ` (${paint.cost.supplier})` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {paint.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{paint.notes}</Text>
          </View>
        ) : null}

        {/* Tags */}
        {paint.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {paint.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Connections: Recipes using this paint */}
        {recipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Used In Recipes</Text>
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
    alignItems: 'center',
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
  brand: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  code: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
  },
  actionBtnDanger: {
    backgroundColor: colors.danger + '15',
  },
  actionBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  stockAction: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
