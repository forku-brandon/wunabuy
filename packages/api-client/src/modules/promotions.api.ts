import { AxiosInstance } from 'axios';
import type { ApiResponse } from '@wunabuy/types';

export interface CartPromoBannerResponse {
  show_banner: boolean;
  promo_id?: string | null;
  promo_code?: string;
  headline?: string;
  subtext?: string;
  auto_dismiss_seconds?: number;
  expires_at?: string;
}

/**
 * Promotions & Marketing API Module
 */
export function createPromotionsApi(client: AxiosInstance) {
  return {
    /**
     * Fetch dynamic promotional banner for Cart screen.
     */
    getCartBanner: async (): Promise<ApiResponse<CartPromoBannerResponse>> => {
      const res = await client.get<ApiResponse<CartPromoBannerResponse>>('/promotions/cart-banner');
      return res.data;
    },
  };
}

