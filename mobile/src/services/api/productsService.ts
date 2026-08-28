import { api } from './apiClient';
import { Product, ProductCategory, QualityTier } from '@wunabuy/types';
import { MOCK_PRODUCTS } from '../mockProducts';

export interface ProductQueryFilters {
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'distance' | 'rating' | 'newest';
}

/**
 * Service to fetch and manage product catalog data via Backend API
 * with graceful offline fallback to local mock data.
 */
export const ProductsService = {
  /**
   * Fetch paginated products matching filters
   */
  async getProducts(filters?: ProductQueryFilters): Promise<Product[]> {
    try {
      const response = await api.products.getProducts({
        category: filters?.category && filters.category !== 'All' ? (filters.category as ProductCategory) : undefined,
        search: filters?.search,
        min_price: filters?.min_price,
        max_price: filters?.max_price,
        sort_by: filters?.sort_by,
      });

      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
      return filterMockProducts(filters);
    } catch {
      // Offline fallback
      return filterMockProducts(filters);
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
      return MOCK_PRODUCTS.find((p) => p.id === id) || null;
    } catch {
      return MOCK_PRODUCTS.find((p) => p.id === id) || null;
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

function filterMockProducts(filters?: ProductQueryFilters): Product[] {
  let products = [...MOCK_PRODUCTS];

  if (filters?.category && filters.category !== 'All') {
    products = products.filter((p) => {
      if (filters.category === 'Skincare' || filters.category === 'Makeup' || filters.category === 'Fragrance') {
        return p.category === ProductCategory.HEALTH_BEAUTY;
      }
      return p.category === filters.category;
    });
  }

  if (filters?.search) {
    const query = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  return products;
}

