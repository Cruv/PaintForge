import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { Model } from '../types';
import { StatusBadge } from './StatusBadge';
import { colors, spacing, fontSize } from '../constants/theme';

interface ModelListItemProps {
  model: Model;
}

export function ModelListItem({ model }: ModelListItemProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push(`/model/${model.id}`)}
    >
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{model.name}</Text>
        <Text style={styles.detail} numberOfLines={1}>
          {[model.faction, model.game_system, model.project].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <StatusBadge status={model.status} />
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
