import { apiRequest } from './apiClient';

export interface KYCQueueItem {
  id: string;
  applicant_name: string;
  applicant_type: 'STORE_SELLER' | 'DRIVER_TRANSPORTER';
  entity_title: string;
  phone: string;
  city_quarter: string;
  cni_number: string;
  submitted_at: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  cni_front_url: string;
  cni_back_url: string;
  storefront_or_vehicle_photo: string;
  business_reg_url?: string | null;
  driver_license_url?: string | null;
  vehicle_insurance_url?: string | null;
  vehicle_plate?: string | null;
  vehicle_type?: string | null;
}

export const kycApi = {
  /**
   * Fetch pending merchant & driver KYC verification queue.
   * API Endpoint: GET /api/v1/staff/kyc/queue
   */
  getKYCQueue: async () => {
    return apiRequest<KYCQueueItem[]>('/staff/kyc/queue', {
      method: 'GET',
    });
  },

  /**
   * Submit staff approval or rejection decision for a KYC submission.
   * API Endpoint: POST /api/v1/staff/kyc/{id}/decision
   */
  submitDecision: async (id: string, decision: 'APPROVED' | 'REJECTED', notes?: string) => {
    return apiRequest<KYCQueueItem>(`/staff/kyc/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    });
  },
};

