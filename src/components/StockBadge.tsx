import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StockStatus } from '../types';
import { stockStatusColors, stockStatusLabels, borderRadius, fontSize } from '../constants/theme';

interface StockBadgeProps {
  status: StockStatus;
  compact?: boolean;
}

export function StockBadge({ status, compact = false }: StockBadgeProps) {
  if (status === 'stocked' && compact) return null;

  const color = stockStatusColors[status];
  const label = stockStatusLabels[status];

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      {!compact && <Text style={[styles.label, { color }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
