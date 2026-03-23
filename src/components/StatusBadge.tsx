import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ModelStatus } from '../types';
import { modelStatusColors, modelStatusLabels, borderRadius, fontSize } from '../constants/theme';

interface StatusBadgeProps {
  status: ModelStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = modelStatusColors[status];
  const label = modelStatusLabels[status];

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
