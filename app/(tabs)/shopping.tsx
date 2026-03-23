import React, { useEffect } from 'react';
import { View, FlatList, SectionList, StyleSheet, Text } from 'react-native';
import { usePaintStore } from '../../src/stores/paintStore';
import { PaintListItem } from '../../src/components/PaintListItem';
import { EmptyState } from '../../src/components/EmptyState';
import type { Paint } from '../../src/types';
import { colors, spacing, fontSize } from '../../src/constants/theme';

interface Section {
  title: string;
  data: Paint[];
}

export default function ShoppingScreen() {
  const { shoppingList, onOrderPaints, loadShoppingList } = usePaintStore();

  useEffect(() => {
    loadShoppingList();
  }, []);

  // Group by supplier/brand
  const groupByBrand = (paints: Paint[]): Section[] => {
    const groups: Record<string, Paint[]> = {};
    for (const paint of paints) {
      const key = paint.cost?.supplier || paint.brand;
      if (!groups[key]) groups[key] = [];
      groups[key].push(paint);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  };

  const sections: Section[] = [
    ...groupByBrand(shoppingList),
    ...(onOrderPaints.length > 0
      ? [{ title: 'On Order', data: onOrderPaints }]
      : []),
  ];

  if (sections.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="All stocked up"
          message="No paints are running low. When you mark paints as low or out, they'll appear here as a shopping list."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PaintListItem paint={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        stickySectionHeadersEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  sectionHeader: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 40 + spacing.md,
  },
});
