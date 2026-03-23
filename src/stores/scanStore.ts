import { create } from 'zustand';
import type { Paint } from '../types';
import {
  lookupBarcode,
  saveBarcode,
  searchEntities,
  updateEntity,
} from '../db';

type ScanMode = 'barcode' | 'ocr';
type ScanResult = 'found' | 'unknown';

interface ScanStore {
  stagedPaints: Paint[];
  pendingBarcode: string | null;
  scanMode: ScanMode;
  isProcessing: boolean;
  ocrCandidates: Paint[];
  lastScannedCode: string | null;

  handleBarcodeScan: (code: string) => Promise<ScanResult>;
  handleOcrResult: (text: string) => Promise<void>;
  identifyPaint: (paint: Paint) => Promise<void>;
  removeStagedPaint: (paintId: string) => void;
  importAll: () => Promise<number>;
  setScanMode: (mode: ScanMode) => void;
  dismissPicker: () => void;
  reset: () => void;
}

export const useScanStore = create<ScanStore>((set, get) => ({
  stagedPaints: [],
  pendingBarcode: null,
  scanMode: 'barcode',
  isProcessing: false,
  ocrCandidates: [],
  lastScannedCode: null,

  handleBarcodeScan: async (code: string): Promise<ScanResult> => {
    // Debounce: don't re-process the same code
    if (code === get().lastScannedCode) return 'found';

    // Don't scan while processing or picker is open
    if (get().isProcessing || get().pendingBarcode) return 'unknown';

    set({ isProcessing: true, lastScannedCode: code });

    try {
      // 1. Check learned barcode mappings
      const paint = await lookupBarcode(code) as Paint | null;
      if (paint) {
        const staged = get().stagedPaints;
        if (!staged.some((p) => p.id === paint.id)) {
          set({ stagedPaints: [...staged, paint] });
        }
        set({ isProcessing: false });
        return 'found';
      }

      // 2. Search by manufacturer code field
      const results = await searchEntities(code, 'paint') as Paint[];
      if (results.length === 1) {
        // Exact match on code — learn the mapping
        await saveBarcode(code, results[0].id);
        const staged = get().stagedPaints;
        if (!staged.some((p) => p.id === results[0].id)) {
          set({ stagedPaints: [...staged, results[0]] });
        }
        set({ isProcessing: false });
        return 'found';
      }

      // 3. Unknown — prompt user to identify
      set({
        pendingBarcode: code,
        ocrCandidates: results.length > 1 ? results.slice(0, 5) : [],
        isProcessing: false,
      });
      return 'unknown';
    } catch (e) {
      console.error('Barcode scan error:', e);
      set({ isProcessing: false });
      return 'unknown';
    }
  },

  handleOcrResult: async (text: string) => {
    set({ isProcessing: true });
    try {
      // Split text and search for matches
      const cleanText = text.replace(/[^a-zA-Z0-9\s.]/g, '').trim();
      if (cleanText.length < 3) {
        set({ isProcessing: false, ocrCandidates: [] });
        return;
      }

      const results = await searchEntities(cleanText, 'paint') as Paint[];

      // Also try individual words for better matching
      const words = cleanText.split(/\s+/).filter((w) => w.length >= 3);
      const additionalResults: Paint[] = [];
      for (const word of words.slice(0, 3)) {
        const wordResults = await searchEntities(word, 'paint') as Paint[];
        for (const r of wordResults) {
          if (!results.some((p) => p.id === r.id) && !additionalResults.some((p) => p.id === r.id)) {
            additionalResults.push(r);
          }
        }
      }

      const combined = [...results, ...additionalResults].slice(0, 5);
      set({ ocrCandidates: combined, isProcessing: false });
    } catch (e) {
      console.error('OCR search error:', e);
      set({ isProcessing: false, ocrCandidates: [] });
    }
  },

  identifyPaint: async (paint: Paint) => {
    const { pendingBarcode, stagedPaints } = get();

    // Save barcode mapping if we have a pending barcode
    if (pendingBarcode) {
      try {
        await saveBarcode(pendingBarcode, paint.id);
      } catch (e) {
        console.error('Failed to save barcode mapping:', e);
      }
    }

    // Add to staged list if not already there
    if (!stagedPaints.some((p) => p.id === paint.id)) {
      set({ stagedPaints: [...stagedPaints, paint] });
    }

    set({ pendingBarcode: null, ocrCandidates: [], lastScannedCode: null });
  },

  removeStagedPaint: (paintId: string) => {
    set({ stagedPaints: get().stagedPaints.filter((p) => p.id !== paintId) });
  },

  importAll: async (): Promise<number> => {
    const { stagedPaints } = get();
    let imported = 0;

    for (const paint of stagedPaints) {
      if (!paint.owned) {
        const updated: Paint = {
          ...paint,
          owned: true,
          stock: { ...paint.stock, status: 'stocked' },
          updated: new Date().toISOString(),
        };
        await updateEntity(updated);
        imported++;
      }
    }

    set({ stagedPaints: [] });
    return imported;
  },

  setScanMode: (mode: ScanMode) => {
    set({ scanMode: mode });
  },

  dismissPicker: () => {
    set({ pendingBarcode: null, ocrCandidates: [], lastScannedCode: null });
  },

  reset: () => {
    set({
      stagedPaints: [],
      pendingBarcode: null,
      scanMode: 'barcode',
      isProcessing: false,
      ocrCandidates: [],
      lastScannedCode: null,
    });
  },
}));
