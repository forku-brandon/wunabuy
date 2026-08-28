import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@wunabuy/types';

interface FavoritesState {
  favoriteIds: string[];
  favoriteProducts: Record<string, Product>;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      favoriteProducts: {},

      toggleFavorite: (product: Product) => {
        const { favoriteIds, favoriteProducts } = get();
        const exists = favoriteIds.includes(product.id);

        if (exists) {
          const newIds = favoriteIds.filter((id) => id !== product.id);
          const newProducts = { ...favoriteProducts };
          delete newProducts[product.id];
          set({ favoriteIds: newIds, favoriteProducts: newProducts });
        } else {
          set({
            favoriteIds: [product.id, ...favoriteIds],
            favoriteProducts: {
              ...favoriteProducts,
              [product.id]: product,
            },
          });
        }
      },

      isFavorite: (productId: string) => {
        return get().favoriteIds.includes(productId);
      },

      clearFavorites: () => {
        set({ favoriteIds: [], favoriteProducts: {} });
      },
    }),
    {
      name: 'wunabuy-favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

