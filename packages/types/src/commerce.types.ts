import { KYCStatus } from './kyc.types';

/**
 * Defines the physical condition/quality of a product.
 */
export enum QualityTier {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
}

/**
 * Categories available for products.
 */
export enum ProductCategory {
  ELECTRONICS = 'Electronics',
  FASHION = 'Fashion',
  FOOD_GROCERIES = 'Food & Groceries',
  HOME_GARDEN = 'Home & Garden',
  HEALTH_BEAUTY = 'Health & Beauty',
  AUTOMOTIVE = 'Automotive',
  SERVICES = 'Services',
  OTHER = 'Other',
}

/**
 * Basic summary of a store, useful for nested references.
 */
export interface StoreSummary {
  /** Unique UUID of the store */
  id: string;
  /** Store name */
  store_name: string;
  /** Average rating out of 5 */
  rating_avg: number;
  /** Indicates if the store is verified */
  is_verified: boolean;
}

/**
 * Detailed representation of a store.
 */
export interface Store extends StoreSummary {
  /** UUID of the user who owns the store */
  owner_id: string;
  /** Detailed description of the store */
  description: string;
  /** Primary category of the store */
  category: ProductCategory;
  /** Location coordinates of the store */
  location: {
    latitude: number;
    longitude: number;
  };
  /** Formatted address of the store */
  address_text: string;
  /** Total number of reviews received */
  total_reviews: number;
  /** KYC verification status */
  kyc_status: KYCStatus;
  /** Indicates if the store is active and visible */
  is_active: boolean;
  /** ISO 8601 date string when store was created */
  created_at: string;
}

/**
 * Represents a single product in the catalog.
 */
export interface Product {
  /** Unique UUID of the product */
  id: string;
  /** UUID of the store selling the product */
  store_id: string;
  /** Name of the product */
  name: string;
  /** Detailed product description */
  description: string;
  /** Category of the product */
  category: ProductCategory;
  /** Price of the product */
  price: number;
  /** Currency of the price */
  currency: 'XAF';
  /** Quantity available in stock */
  quantity: number;
  /** Physical condition of the product */
  quality_tier: QualityTier;
  /** Array of URLs pointing to product images */
  images: string[];
  /** Indicates if the product is active and visible */
  is_active: boolean;
  /** Average user rating, or null if unrated */
  rating_avg: number | null;
  /** Total number of reviews */
  total_reviews: number;
  /** Distance from current user in km, calculated dynamically */
  distance_km: number | null;
  /** Associated store summary */
  store: StoreSummary | null;
  /** ISO 8601 date string when product was created */
  created_at: string;
  /** ISO 8601 date string when product was updated */
  updated_at: string;
}

/**
 * Represents an item in a user's shopping cart.
 */
export interface CartItem {
  /** UUID of the product */
  product_id: string;
  /** UUID of the store selling the product */
  store_id: string;
  /** Name of the product */
  name: string;
  /** Unit price of the product */
  price: number;
  /** Selected quantity */
  quantity: number;
  /** Primary image URL of the product */
  image_url: string;
  /** Maximum allowable quantity based on stock */
  max_quantity: number;
}
