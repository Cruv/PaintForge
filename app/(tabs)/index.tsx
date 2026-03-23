import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { usePaintStore } from '../../src/stores/paintStore';
import { PaintListItem } from '../../src/components/PaintListItem';
import { SearchBar } from '../../src/components/SearchBar';
import { EmptyState } from '../../src/components/EmptyState';
import type { Paint, StockStatus } from '../../src/types';
import { colors, spacing, fontSize, borderRadius, stockStatusLabels } from '../../src/constants/theme';

const STOCK_FILTERS: (StockStatus | 'all')[] = ['all', 'stocked', 'low', 'out', 'on_order'];

export default function CollectionScreen() {
  const { ownedPaints, isLoading, loadOwnedPaints, searchPaints, searchResults, clearSearch, updateStockStatus } = usePaintStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockStatus | 'all'>('all');
  const router = useRouter();

  useEffect(() => {
    loadOwnedPaints();
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      searchPaints(text);
    } else {
      clearSearch();
    }
  }, [searchPaints, clearSearch]);

  const handleStockUpdate = useCallback((paint: Paint) => {
    const options: StockStatus[] = ['stocked', 'low', 'out', 'on_order'];
    Alert.alert(
      'Update Stock',
      paint.name,
      options.map((status) => ({
        text: stockStatusLabels[status],
        onPress: () => updateStockStatus(paint.id, status),
        style: status === paint.stock.status ? 'cancel' : 'default',
      })),
    );
  }, [updateStockStatus]);

  const displayPaints = searchQuery.length >= 2
    ? searchResults.filter((p) => p.owned)
    : ownedPaints;

  const filteredPaints = stockFilter === 'all'
    ? displayPaints
    : displayPaints.filter((p) => p.stock.status === stockFilter);

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search your collection..."
      />

      <View style={styles.filters}>
        {STOCK_FILTERS.map((filter) => (
          <Pressable
            key={filter}
            style={[styles.filterChip, stockFilter === filter && styles.filterChipActive]}
            onPress={() => setStockFilter(filter)}
          >
            <Text style={[styles.filterText, stockFilter === filter && styles.filterTextActive]}>
              {filter === 'all' ? 'All' : stockStatusLabels[filter]}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredPaints}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PaintListItem
            paint={item}
            onLongPress={() => handleStockUpdate(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            title={ownedPaints.length === 0 ? 'No paints yet' : 'No matches'}
            message={
              ownedPaints.length === 0
                ? 'Search for paints to add them to your collection.'
                : 'Try a different search or filter.'
            }
          />
        }
        contentContainerStyle={filteredPaints.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.textInverse,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 40 + spacing.md, // align with text after swatch
  },
  emptyList: {
    flex: 1,
  },
});
