import { api } from './apiClient';
import { Product, ProductCategory, QualityTier, HomeFeedData } from '@wunabuy/types';

export interface ProductQueryFilters {
  category?: string;
  store_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'distance' | 'rating' | 'newest';
}

/**
 * Service to fetch and manage product catalog data via Backend API.
 */
export const ProductsService = {
  /**
   * Fetch home marketplace feed (hero banners, partners, categories, best sellers)
   */
  async getHomeFeed(): Promise<HomeFeedData> {
    const response = await api.products.getHomeFeed();
    return response.data;
  },

  /**
   * Fetch paginated products matching filters
   */
  async getProducts(filters?: ProductQueryFilters): Promise<Product[]> {
    try {
      const response = await api.products.getProducts({
        category: filters?.category && filters.category !== 'All' ? (filters.category as ProductCategory) : undefined,
        store_id: filters?.store_id,
        search: filters?.search,
        min_price: filters?.min_price,
        max_price: filters?.max_price,
        sort_by: filters?.sort_by,
      });

      if (response && response.data) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await api.products.getProductById(id);
      if (response && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Create new product listing (Seller Store Owner)
   */
  async createProduct(payload: Omit<Product, 'id' | 'store_id' | 'rating_avg' | 'total_reviews' | 'distance_km' | 'store' | 'created_at' | 'updated_at'>): Promise<Product> {
    const response = await api.products.createProduct(payload);
    return response.data;
  },

  /**
   * Update existing product listing
   */
  async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
    const response = await api.products.updateProduct(id, payload);
    return response.data;
  },
};

