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

const DEFAULT_FOLLOWED_STORES: Record<string, FollowedStoreData> = {
  store_101: {
    id: 'store_101',
    name: 'Douala Tech Hub',
    category: 'Electronics',
    rating_avg: 4.9,
    total_reviews: 128,
    followers_count: 1420,
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400',
    cover_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
    location: 'Rue Joss, Akwa, Douala',
    followedAt: new Date().toISOString(),
    featured_products: [
      {
        id: 'prod_1',
        store_id: 'store_101',
        name: 'Samsung Galaxy S24 Ultra 512GB',
        description: 'Brand new sealed in box with 1 Year Warranty.',
        category: 'Electronics' as any,
        price: 650000,
        currency: 'XAF',
        quantity: 5,
        quality_tier: 'new' as any,
        images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800'],
        is_active: true,
        rating_avg: 4.9,
        total_reviews: 128,
        distance_km: 1.8,
        store: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'prod_4',
        store_id: 'store_101',
        name: 'Apple MacBook Pro 14" M3 Pro',
        description: '18GB RAM, 512GB SSD, Space Black.',
        category: 'Electronics' as any,
        price: 1350000,
        currency: 'XAF',
        quantity: 2,
        quality_tier: 'new' as any,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
        is_active: true,
        rating_avg: 5.0,
        total_reviews: 42,
        distance_km: 1.8,
        store: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
  store_103: {
    id: 'store_103',
    name: 'Heritage African Couture',
    category: 'Fashion',
    rating_avg: 5.0,
    total_reviews: 84,
    followers_count: 2890,
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
    cover_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    location: 'Marché Central, Douala',
    followedAt: new Date().toISOString(),
    featured_products: [
      {
        id: 'prod_3',
        store_id: 'store_103',
        name: 'Authentic Bamenda Toghu Robe',
        description: 'Handcrafted traditional royal velvet embroidery.',
        category: 'Fashion' as any,
        price: 65000,
        currency: 'XAF',
        quantity: 8,
        quality_tier: 'new' as any,
        images: ['https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800'],
        is_active: true,
        rating_avg: 5.0,
        total_reviews: 84,
        distance_km: 2.2,
        store: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
};

export const useFollowedStoresStore = create<FollowedStoresState>()(
  persist(
    (set, get) => ({
      followedStoreIds: ['store_101', 'store_103'],
      stores: DEFAULT_FOLLOWED_STORES,

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
