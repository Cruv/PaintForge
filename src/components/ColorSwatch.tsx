import React from 'react';
import { View, StyleSheet } from 'react-native';
import { borderRadius } from '../constants/theme';

interface ColorSwatchProps {
  hex?: string;
  size?: number;
}

export function ColorSwatch({ hex, size = 32 }: ColorSwatchProps) {
  if (!hex) return null;

  return (
    <View
      style={[
        styles.swatch,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: hex,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  swatch: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
});
