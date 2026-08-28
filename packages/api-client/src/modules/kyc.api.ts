import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  KYCSubmission,
  KYCReviewResult,
  Store,
} from '@wunabuy/types';

export interface TransporterKYCSubmission {
  driver_name: string;
  phone: string;
  bio?: string;
  vehicle_type: 'bike' | 'taxi' | 'van' | 'plane';
  license_plate: string;
  base_station_quarter: string;
  city: string;
  cni_number: string;
  id_card_front: string;
  id_card_back: string;
  drivers_license_photo: string;
  carte_grise_photo: string;
  vehicle_assurance_photo: string;
  vehicle_exterior_photo: string;
}

export interface TransporterKYCResult {
  submission_id: string;
  transporter_id: string;
  vehicle_type: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewer_notes?: string | null;
  submitted_at: string;
  verified_at?: string | null;
}

/**
 * Seller & Transporter KYC Verification API Module
 */
export function createKYCApi(client: AxiosInstance) {
  return {
    /**
     * Submit Seller Store KYC application documents.
     */
    submitKYC: async (payload: KYCSubmission): Promise<ApiResponse<Store>> => {
      const res = await client.post<ApiResponse<Store>>('/seller/kyc/submit', payload);
      return res.data;
    },

    /**
     * Fetch current store KYC review status.
     */
    getKYCStatus: async (storeId?: string): Promise<ApiResponse<KYCReviewResult>> => {
      const res = await client.get<ApiResponse<KYCReviewResult>>('/seller/kyc/status', {
        params: storeId ? { store_id: storeId } : undefined,
      });
      return res.data;
    },

    /**
     * Submit Transporter (Driver) KYC application documents.
     */
    submitTransporterKYC: async (payload: TransporterKYCSubmission): Promise<ApiResponse<TransporterKYCResult>> => {
      const res = await client.post<ApiResponse<TransporterKYCResult>>('/transporter/kyc/submit', payload);
      return res.data;
    },

    /**
     * Fetch current transporter KYC review status.
     */
    getTransporterKYCStatus: async (): Promise<ApiResponse<TransporterKYCResult>> => {
      const res = await client.get<ApiResponse<TransporterKYCResult>>('/transporter/kyc/status');
      return res.data;
    },
  };
}
