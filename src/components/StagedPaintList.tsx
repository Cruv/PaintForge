import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { ColorSwatch } from './ColorSwatch';
import type { Paint } from '../types';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface StagedPaintListProps {
  paints: Paint[];
  onRemove: (paintId: string) => void;
  onImportAll: () => void;
}

export function StagedPaintList({ paints, onRemove, onImportAll }: StagedPaintListProps) {
  if (paints.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Scan paint barcodes to add them here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>{paints.length} paint{paints.length !== 1 ? 's' : ''} scanned</Text>
      </View>

      <FlatList
        data={paints}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ColorSwatch hex={item.hex} size={28} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemBrand} numberOfLines={1}>{item.brand} · {item.range}</Text>
            </View>
            <Pressable style={styles.removeBtn} onPress={() => onRemove(item.id)}>
              <Text style={styles.removeBtnText}>x</Text>
            </Pressable>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Pressable style={styles.importBtn} onPress={onImportAll}>
        <Text style={styles.importBtnText}>Add All to Collection</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  count: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    gap: 1,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  itemBrand: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.danger,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 28 + spacing.sm,
  },
  importBtn: {
    margin: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  importBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textInverse,
  },
});
