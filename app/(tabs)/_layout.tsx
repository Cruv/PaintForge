import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../../src/constants/theme';

function ScanButton() {
  const router = useRouter();
  return (
    <Pressable
      style={headerStyles.scanBtn}
      onPress={() => router.push('/scan')}
    >
      <Text style={headerStyles.scanBtnText}>Scan</Text>
    </Pressable>
  );
}

const headerStyles = StyleSheet.create({
  scanBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  scanBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textInverse,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.bgElevated,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Collection',
          tabBarLabel: 'Collection',
          headerRight: () => <ScanButton />,
        }}
      />
      <Tabs.Screen
        name="models"
        options={{
          title: 'Models',
          tabBarLabel: 'Models',
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarLabel: 'Recipes',
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Shopping',
          tabBarLabel: 'Shopping',
        }}
      />
    </Tabs>
  );
}
