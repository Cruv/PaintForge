import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal } from 'react-native';
import { SearchBar } from './SearchBar';
import { ColorSwatch } from './ColorSwatch';
import type { Paint } from '../types';
import { searchEntities } from '../db';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface PaintPickerProps {
  visible: boolean;
  barcode?: string | null;
  candidates: Paint[];
  onSelect: (paint: Paint) => void;
  onDismiss: () => void;
}

export function PaintPicker({ visible, barcode, candidates, onSelect, onDismiss }: PaintPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Paint[]>([]);

  const handleSearch = useCallback(async (text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      const results = await searchEntities(text, 'paint') as Paint[];
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, []);

  const displayPaints = searchQuery.length >= 2 ? searchResults : candidates;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>Identify Paint</Text>
              {barcode && (
                <Text style={styles.barcode}>Barcode: {barcode}</Text>
              )}
            </View>
            <Pressable style={styles.closeBtn} onPress={onDismiss}>
              <Text style={styles.closeBtnText}>Skip</Text>
            </Pressable>
          </View>

          {/* Search */}
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search by name, brand, or code..."
            autoFocus
          />

          {/* Candidates / Results */}
          {candidates.length > 0 && searchQuery.length < 2 && (
            <Text style={styles.sectionLabel}>Suggested Matches</Text>
          )}

          <FlatList
            data={displayPaints}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.paintItem, pressed && styles.paintItemPressed]}
                onPress={() => {
                  onSelect(item);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <ColorSwatch hex={item.hex} size={32} />
                <View style={styles.paintInfo}>
                  <Text style={styles.paintName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.paintDetail} numberOfLines={1}>
                    {item.brand} · {item.range}
                    {item.code ? ` · ${item.code}` : ''}
                  </Text>
                </View>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              searchQuery.length >= 2 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No paints found for "{searchQuery}"</Text>
                </View>
              ) : candidates.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Search for a paint to identify this barcode</Text>
                </View>
              ) : null
            }
            style={styles.list}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingBottom: 0,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  barcode: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  closeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
  },
  closeBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  list: {
    flex: 1,
  },
  paintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  paintItemPressed: {
    backgroundColor: colors.borderLight,
  },
  paintInfo: {
    flex: 1,
    gap: 2,
  },
  paintName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  paintDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 32 + spacing.md,
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
