import { api } from './apiClient';
import { CartPromoBannerResponse } from '@wunabuy/api-client';

/**
 * Service to fetch dynamic promotional discounts & cart banners.
 */
export const PromotionsService = {
  /**
   * Fetch dynamic cart promo banner
   */
  async getCartBanner(): Promise<CartPromoBannerResponse> {
    try {
      const response = await api.promotions.getCartBanner();
      if (response && response.data) {
        return response.data;
      }
      return { show_banner: false };
    } catch {
      return { show_banner: false };
    }
  },
};

