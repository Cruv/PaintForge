import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useScanStore } from '../src/stores/scanStore';
import { usePaintStore } from '../src/stores/paintStore';
import { BarcodeScanner } from '../src/components/BarcodeScanner';
import { OcrCapture } from '../src/components/OcrCapture';
import { StagedPaintList } from '../src/components/StagedPaintList';
import { PaintPicker } from '../src/components/PaintPicker';
import { colors, spacing, fontSize, borderRadius } from '../src/constants/theme';

export default function ScanScreen() {
  const {
    stagedPaints,
    pendingBarcode,
    scanMode,
    ocrCandidates,
    isProcessing,
    handleBarcodeScan,
    handleOcrResult,
    identifyPaint,
    removeStagedPaint,
    importAll,
    setScanMode,
    dismissPicker,
    reset,
  } = useScanStore();
  const { loadOwnedPaints } = usePaintStore();
  const router = useRouter();

  // Reset scan state when screen mounts
  useEffect(() => {
    reset();
  }, []);

  const onBarcodeDetected = useCallback(async (code: string) => {
    const result = await handleBarcodeScan(code);
    // Could add haptic feedback or sound here for 'found'
  }, [handleBarcodeScan]);

  const onOcrText = useCallback(async (text: string) => {
    await handleOcrResult(text);
  }, [handleOcrResult]);

  const handleImportAll = useCallback(async () => {
    const count = await importAll();
    await loadOwnedPaints();
    Alert.alert(
      'Added to Collection',
      `${count} paint${count !== 1 ? 's' : ''} added to your collection.`,
      [{ text: 'OK', onPress: () => router.back() }],
    );
  }, [importAll, loadOwnedPaints, router]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Scan Paints',
          headerTintColor: colors.primary,
          presentation: 'modal',
        }}
      />

      <View style={styles.container}>
        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modeBtn, scanMode === 'barcode' && styles.modeBtnActive]}
            onPress={() => setScanMode('barcode')}
          >
            <Text style={[styles.modeBtnText, scanMode === 'barcode' && styles.modeBtnTextActive]}>
              Barcode
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, scanMode === 'ocr' && styles.modeBtnActive]}
            onPress={() => setScanMode('ocr')}
          >
            <Text style={[styles.modeBtnText, scanMode === 'ocr' && styles.modeBtnTextActive]}>
              OCR Label
            </Text>
          </Pressable>
        </View>

        {/* Scanner Area */}
        <View style={styles.scannerArea}>
          {scanMode === 'barcode' ? (
            <BarcodeScanner
              onDetected={onBarcodeDetected}
              active={!pendingBarcode}
            />
          ) : (
            <OcrCapture
              onTextDetected={onOcrText}
              active={scanMode === 'ocr'}
            />
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <Text style={styles.processingText}>Identifying...</Text>
            </View>
          )}
        </View>

        {/* Staged Paints */}
        <View style={styles.stagedArea}>
          <StagedPaintList
            paints={stagedPaints}
            onRemove={removeStagedPaint}
            onImportAll={handleImportAll}
          />
        </View>

        {/* Paint Picker Modal (for unknown barcodes / OCR candidates) */}
        <PaintPicker
          visible={pendingBarcode != null || ocrCandidates.length > 0}
          barcode={pendingBarcode}
          candidates={ocrCandidates}
          onSelect={identifyPaint}
          onDismiss={dismissPicker}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  modeToggle: {
    flexDirection: 'row',
    margin: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.md,
    padding: 2,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md - 2,
  },
  modeBtnActive: {
    backgroundColor: colors.bgCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeBtnTextActive: {
    color: colors.text,
  },
  scannerArea: {
    marginHorizontal: spacing.lg,
    height: 300,
    position: 'relative',
  },
  processingOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  processingText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textInverse,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  stagedArea: {
    flex: 1,
    marginTop: spacing.sm,
    backgroundColor: colors.bgCard,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
