import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@wunabuy/types';

export interface FollowedStoreData {
  id: string;
  name: string;
  category: string;
  rating_avg: number;
  total_reviews: number;
  followers_count: number;
  is_verified: boolean;
  avatar_url: string;
  cover_url: string;
  location: string;
  followedAt: string;
  featured_products: Product[];
}

interface FollowedStoresState {
  followedStoreIds: string[];
  stores: Record<string, FollowedStoreData>;
  toggleFollow: (store: FollowedStoreData) => void;
  isFollowing: (storeId: string) => boolean;
  clearFollowedStores: () => void;
}

export const useFollowedStoresStore = create<FollowedStoresState>()(
  persist(
    (set, get) => ({
      followedStoreIds: [],
      stores: {},

      toggleFollow: (store: FollowedStoreData) => {
        const { followedStoreIds, stores } = get();
        const exists = followedStoreIds.includes(store.id);

        if (exists) {
          const newIds = followedStoreIds.filter((id) => id !== store.id);
          const newStores = { ...stores };
          delete newStores[store.id];
          set({ followedStoreIds: newIds, stores: newStores });
        } else {
          set({
            followedStoreIds: [store.id, ...followedStoreIds],
            stores: {
              ...stores,
              [store.id]: {
                ...store,
                followedAt: new Date().toISOString(),
              },
            },
          });
        }
      },

      isFollowing: (storeId: string) => {
        return get().followedStoreIds.includes(storeId);
      },

      clearFollowedStores: () => {
        set({ followedStoreIds: [], stores: {} });
      },
    }),
    {
      name: 'wunabuy-followed-stores-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

