import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  active: boolean;
}

export function BarcodeScanner({ onDetected, active }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null>(null);
  const isRunningRef = useRef(false);

  const startScanner = useCallback(async () => {
    if (Platform.OS !== 'web' || !scannerRef.current || isRunningRef.current) return;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('barcode-reader');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onDetected(decodedText);
        },
        () => {
          // Scan error — expected for frames without barcode
        },
      );
      isRunningRef.current = true;
    } catch (err) {
      console.error('Failed to start barcode scanner:', err);
    }
  }, [onDetected]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && isRunningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        // Ignore stop errors
      }
      isRunningRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (active) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [active, startScanner, stopScanner]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Barcode scanning requires a browser with camera access.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div
        id="barcode-reader"
        ref={(el) => { scannerRef.current = el; }}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: borderRadius.md,
    backgroundColor: '#000',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  fallbackText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
