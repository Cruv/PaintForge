import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getDatabase } from '../src/db/database';
import { seedDatabase } from '../src/db/seed';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      await getDatabase();
      await seedDatabase();
      setIsReady(true);
    }
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="paint/[id]"
          options={{
            headerShown: true,
            title: 'Paint Detail',
            headerTintColor: colors.primary,
          }}
        />
        <Stack.Screen
          name="model/[id]"
          options={{
            headerShown: true,
            title: 'Model Detail',
            headerTintColor: colors.primary,
          }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            headerShown: true,
            title: 'Recipe Detail',
            headerTintColor: colors.primary,
          }}
        />
        <Stack.Screen
          name="scheme/[id]"
          options={{
            headerShown: true,
            title: 'Scheme Detail',
            headerTintColor: colors.primary,
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
