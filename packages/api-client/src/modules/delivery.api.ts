import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  DeliveryJob,
  DriverLocation,
  ProofOfDelivery,
} from '@wunabuy/types';

/**
 * Logistics & Delivery API Module (Transporter App Context)
 */
export function createDeliveryApi(client: AxiosInstance) {
  return {
    /**
     * Get nearby available delivery jobs for transporters.
     */
    getAvailableJobs: async (params?: { lat?: number; lng?: number; radius_km?: number }): Promise<PaginatedResponse<DeliveryJob>> => {
      const res = await client.get<PaginatedResponse<DeliveryJob>>('/delivery/jobs', { params });
      return res.data;
    },

    /**
     * Accept a delivery job (Transporter).
     */
    acceptJob: async (jobId: string): Promise<ApiResponse<DeliveryJob>> => {
      const res = await client.post<ApiResponse<DeliveryJob>>(`/delivery/${jobId}/accept`);
      return res.data;
    },

    /**
     * Push background GPS breadcrumb location update (10s intervals during active transit).
     */
    pushGPSBreadcrumb: async (jobId: string, location: Omit<DriverLocation, 'order_id' | 'transporter_id'>): Promise<ApiResponse<{ received: boolean }>> => {
      const res = await client.put<ApiResponse<{ received: boolean }>>(`/delivery/${jobId}/location`, location);
      return res.data;
    },

    /**
     * Upload Proof of Delivery photo and recipient digital signature.
     */
    uploadProofOfDelivery: async (jobId: string, pod: Omit<ProofOfDelivery, 'delivery_id' | 'captured_at'>): Promise<ApiResponse<ProofOfDelivery>> => {
      const res = await client.post<ApiResponse<ProofOfDelivery>>(`/delivery/${jobId}/photo`, pod);
      return res.data;
    },
  };
}
