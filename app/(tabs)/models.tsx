import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useModelStore } from '../../src/stores/modelStore';
import { ModelListItem } from '../../src/components/ModelListItem';
import { SearchBar } from '../../src/components/SearchBar';
import { EmptyState } from '../../src/components/EmptyState';
import type { Model, ModelStatus } from '../../src/types';
import { colors, spacing, fontSize, borderRadius, modelStatusLabels } from '../../src/constants/theme';
import { v4 as uuidv4 } from 'uuid';

const STATUS_FILTERS: (ModelStatus | 'all')[] = ['all', 'unbuilt', 'assembled', 'primed', 'wip', 'painted'];

export default function ModelsScreen() {
  const { models, isLoading, loadModels, saveModel } = useModelStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ModelStatus | 'all'>('all');
  const router = useRouter();

  useEffect(() => {
    loadModels();
  }, []);

  const filteredModels = models.filter((m) => {
    const matchesSearch = searchQuery.length < 2 ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.faction?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.game_system?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddModel = useCallback(() => {
    Alert.prompt(
      'New Model',
      'Enter the model name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (name?: string) => {
            if (!name?.trim()) return;
            const now = new Date().toISOString();
            const model: Model = {
              id: `model_${uuidv4()}`,
              type: 'model',
              name: name.trim(),
              status: 'unbuilt',
              schemes: [],
              photos: [],
              notes: '',
              tags: [],
              created: now,
              updated: now,
            };
            await saveModel(model);
          },
        },
      ],
      'plain-text',
    );
  }, [saveModel]);

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search models..."
      />

      <View style={styles.filterRow}>
        <View style={styles.filters}>
          {STATUS_FILTERS.map((filter) => (
            <Pressable
              key={filter}
              style={[styles.filterChip, statusFilter === filter && styles.filterChipActive]}
              onPress={() => setStatusFilter(filter)}
            >
              <Text style={[styles.filterText, statusFilter === filter && styles.filterTextActive]}>
                {filter === 'all' ? 'All' : modelStatusLabels[filter]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredModels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ModelListItem model={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            title={models.length === 0 ? 'No models yet' : 'No matches'}
            message={
              models.length === 0
                ? 'Tap + to add your first miniature.'
                : 'Try a different search or filter.'
            }
          />
        }
        contentContainerStyle={filteredModels.length === 0 ? styles.emptyList : undefined}
      />

      <Pressable style={styles.fab} onPress={handleAddModel}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  filterRow: {
    paddingBottom: spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    flexWrap: 'wrap',
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
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.textInverse,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: colors.textInverse,
    fontWeight: '300',
    marginTop: -2,
  },
});
