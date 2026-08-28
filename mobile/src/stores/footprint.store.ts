import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@wunabuy/types';

export interface FootprintItem {
  id: string;
  product: Product;
  viewedAt: string;
}

interface FootprintState {
  footprints: FootprintItem[];
  recordFootprint: (product: Product) => void;
  removeFootprint: (productId: string) => void;
  clearFootprints: () => void;
}

export const useFootprintStore = create<FootprintState>()(
  persist(
    (set, get) => ({
      footprints: [],

      recordFootprint: (product: Product) => {
        const { footprints } = get();
        const filtered = footprints.filter((f) => f.product.id !== product.id);
        const newItem: FootprintItem = {
          id: `fp_${product.id}_${Date.now()}`,
          product,
          viewedAt: new Date().toISOString(),
        };

        // Keep maximum of 50 recent footprints
        set({ footprints: [newItem, ...filtered].slice(0, 50) });
      },

      removeFootprint: (productId: string) => {
        const { footprints } = get();
        set({ footprints: footprints.filter((f) => f.product.id !== productId) });
      },

      clearFootprints: () => {
        set({ footprints: [] });
      },
    }),
    {
      name: 'wunabuy-footprint-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

