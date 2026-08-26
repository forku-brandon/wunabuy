import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  ProductCategory,
  QualityTier,
} from '@wunabuy/types';

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  lat?: number;
  lng?: number;
  radius_km?: number;
  min_price?: number;
  max_price?: number;
  quality_tier?: QualityTier;
  min_rating?: number;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'distance' | 'rating' | 'newest';
  cursor?: string;
  limit?: number;
}

/**
 * Products & Discovery API Module
 */
export function createProductsApi(client: AxiosInstance) {
  return {
    /**
     * Search and filter products with spatial PostGIS geo-ranking.
     */
    getProducts: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
      const res = await client.get<PaginatedResponse<Product>>('/products', { params: filters });
      return res.data;
    },

    /**
     * Fetch a single product by UUID.
     */
    getProductById: async (id: string): Promise<ApiResponse<Product>> => {
      const res = await client.get<ApiResponse<Product>>(`/products/${id}`);
      return res.data;
    },

    /**
     * Create a new product listing (Seller only).
     */
    createProduct: async (payload: Omit<Product, 'id' | 'store_id' | 'rating_avg' | 'total_reviews' | 'distance_km' | 'store' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Product>> => {
      const res = await client.post<ApiResponse<Product>>('/products', payload);
      return res.data;
    },

    /**
     * Update an existing product (Seller only).
     */
    updateProduct: async (id: string, payload: Partial<Product>): Promise<ApiResponse<Product>> => {
      const res = await client.put<ApiResponse<Product>>(`/products/${id}`, payload);
      return res.data;
    },

    /**
     * Delete a product listing (Seller only).
     */
    deleteProduct: async (id: string): Promise<ApiResponse<{ message: string }>> => {
      const res = await client.delete<ApiResponse<{ message: string }>>(`/products/${id}`);
      return res.data;
    },

    /**
     * Fetch personalized Smart Discovery home feed.
     */
    getDiscoveryFeed: async (params?: { lat?: number; lng?: number; limit?: number }): Promise<PaginatedResponse<Product>> => {
      const res = await client.get<PaginatedResponse<Product>>('/discovery/feed', { params });
      return res.data;
    },
  };
}
