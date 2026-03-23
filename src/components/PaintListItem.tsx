import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { Paint } from '../types';
import { ColorSwatch } from './ColorSwatch';
import { StockBadge } from './StockBadge';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface PaintListItemProps {
  paint: Paint;
  onLongPress?: () => void;
  showStock?: boolean;
}

export function PaintListItem({ paint, onLongPress, showStock = true }: PaintListItemProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push(`/paint/${paint.id}`)}
      onLongPress={onLongPress}
    >
      <ColorSwatch hex={paint.hex} size={40} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{paint.name}</Text>
        <Text style={styles.detail} numberOfLines={1}>
          {paint.brand} · {paint.range}
          {paint.code ? ` · ${paint.code}` : ''}
        </Text>
      </View>
      {showStock && paint.owned && (
        <StockBadge status={paint.stock.status} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
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
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  detail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
