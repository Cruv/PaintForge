import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface OcrCaptureProps {
  onTextDetected: (text: string) => void;
  active: boolean;
}

export function OcrCapture({ onTextDetected, active }: OcrCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [workerReady, setWorkerReady] = useState(false);
  const workerRef = useRef<import('tesseract.js').Worker | null>(null);

  // Initialize camera stream
  useEffect(() => {
    if (Platform.OS !== 'web' || !active) return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to access camera:', err);
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [active]);

  // Lazy-load tesseract worker
  useEffect(() => {
    if (Platform.OS !== 'web' || !active) return;

    async function initWorker() {
      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker('eng');
      workerRef.current = worker;
      setWorkerReady(true);
    }

    initWorker();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        setWorkerReady(false);
      }
    };
  }, [active]);

  const captureAndRecognize = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !workerRef.current || isProcessing) return;

    setIsProcessing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);

      const { data: { text } } = await workerRef.current.recognize(canvas);
      if (text.trim()) {
        onTextDetected(text.trim());
      }
    } catch (err) {
      console.error('OCR error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onTextDetected]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>OCR requires a browser with camera access.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <video
          ref={(el) => { videoRef.current = el; }}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <canvas ref={(el) => { canvasRef.current = el; }} style={{ display: 'none' }} />
      </View>

      <Pressable
        style={[styles.captureBtn, (isProcessing || !workerReady) && styles.captureBtnDisabled]}
        onPress={captureAndRecognize}
        disabled={isProcessing || !workerReady}
      >
        {isProcessing ? (
          <ActivityIndicator color={colors.textInverse} size="small" />
        ) : (
          <Text style={styles.captureBtnText}>
            {workerReady ? 'Capture & Read Label' : 'Loading OCR...'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.sm,
  },
  videoContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: borderRadius.md,
    backgroundColor: '#000',
  },
  captureBtn: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  captureBtnDisabled: {
    opacity: 0.5,
  },
  captureBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textInverse,
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
