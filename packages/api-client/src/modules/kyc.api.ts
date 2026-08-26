import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  KYCSubmission,
  KYCReviewResult,
  Store,
} from '@wunabuy/types';

/**
 * Seller KYC Verification API Module
 */
export function createKYCApi(client: AxiosInstance) {
  return {
    /**
     * Submit Seller Store KYC application documents.
     */
    submitKYC: async (payload: KYCSubmission): Promise<ApiResponse<Store>> => {
      const res = await client.post<ApiResponse<Store>>('/stores/kyc', payload);
      return res.data;
    },

    /**
     * Fetch current store KYC review status.
     */
    getKYCStatus: async (storeId: string): Promise<ApiResponse<KYCReviewResult>> => {
      const res = await client.get<ApiResponse<KYCReviewResult>>(`/stores/${storeId}/kyc-status`);
      return res.data;
    },
  };
}

