import { apiClient } from './apiClient';
import { Product } from '@wunabuy/types';
import { FollowedStoreData } from '../../stores/followedStores.store';
import { FootprintItem } from '../../stores/footprint.store';

export const BuyerService = {
  /**
   * Fetch all stores followed by the authenticated user
   */
  async getFollowedStores(): Promise<FollowedStoreData[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: FollowedStoreData[] }>(
        '/user/followed-stores'
      );
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      // In offline/mock fallback, return empty array so callers can use local cache
      return [];
    }
  },

  /**
   * Follow a store
   */
  async followStore(storeId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/stores/${storeId}/follow`);
      return response.data?.success ?? true;
    } catch {
      return true; // Optimistic fallback
    }
  },

  /**
   * Unfollow a store
   */
  async unfollowStore(storeId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/stores/${storeId}/unfollow`);
      return response.data?.success ?? true;
    } catch {
      return true; // Optimistic fallback
    }
  },

  /**
   * Fetch all favorited wishlist products
   */
  async getFavorites(): Promise<Product[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Product[] }>('/user/favorites');
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Add a product to favorites wishlist
   */
  async addFavorite(productId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/user/favorites/${productId}`);
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Remove a product from favorites wishlist
   */
  async removeFavorite(productId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/user/favorites/${productId}`);
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Fetch user's browsing footprint history
   */
  async getFootprints(): Promise<FootprintItem[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: FootprintItem[] }>('/user/footprints');
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Log a product view footprint
   */
  async recordFootprint(productId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>('/user/footprints', {
        product_id: productId,
        viewed_at: new Date().toISOString(),
      });
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Clear all browsing footprints
   */
  async clearFootprints(): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ success: boolean }>('/user/footprints');
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },
};
