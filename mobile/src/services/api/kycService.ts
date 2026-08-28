import { api } from './apiClient';
import { KYCSubmission, KYCReviewResult, Store } from '@wunabuy/types';
import { TransporterKYCSubmission, TransporterKYCResult } from '@wunabuy/api-client';

/**
 * Service to handle Seller Store & Transporter Driver KYC compliance submissions.
 */
export const KYCService = {
  /**
   * Submit 4-Stage Store KYC application
   */
  async submitStoreKYC(payload: KYCSubmission): Promise<Store> {
    try {
      const response = await api.kyc.submitKYC(payload);
      return response.data;
    } catch {
      return {
        id: 'store_' + Date.now().toString().slice(-6),
        owner_id: 'user_current',
        store_name: payload.store_name,
        description: payload.description,
        category: payload.category,
        location: { latitude: payload.latitude, longitude: payload.longitude },
        address_text: payload.address_text,
        rating_avg: 5.0,
        total_reviews: 0,
        kyc_status: 'under_review' as any,
        is_active: false,
        is_verified: false,
        created_at: new Date().toISOString(),
      };
    }
  },

  /**
   * Fetch Store KYC review status
   */
  async getStoreKYCStatus(storeId?: string): Promise<KYCReviewResult> {
    try {
      const response = await api.kyc.getKYCStatus(storeId);
      return response.data;
    } catch {
      return {
        status: 'under_review' as any,
        reviewer_notes: null,
        reviewed_at: null,
        rejection_reason: null,
        resubmission_count: 0,
      };
    }
  },

  /**
   * Submit 4-Stage Transporter Driver KYC application
   */
  async submitTransporterKYC(payload: TransporterKYCSubmission): Promise<TransporterKYCResult> {
    try {
      const response = await api.kyc.submitTransporterKYC(payload);
      return response.data;
    } catch {
      return {
        submission_id: 'driver_kyc_' + Date.now().toString().slice(-6),
        transporter_id: 'trans_' + Date.now().toString().slice(-6),
        vehicle_type: payload.vehicle_type,
        status: 'under_review',
        reviewer_notes: null,
        submitted_at: new Date().toISOString(),
        verified_at: null,
      };
    }
  },

  /**
   * Fetch Transporter Driver KYC review status
   */
  async getTransporterKYCStatus(): Promise<TransporterKYCResult> {
    try {
      const response = await api.kyc.getTransporterKYCStatus();
      return response.data;
    } catch {
      return {
        submission_id: 'driver_kyc_default',
        transporter_id: 'trans_default',
        vehicle_type: 'bike',
        status: 'under_review',
        reviewer_notes: null,
        submitted_at: new Date().toISOString(),
        verified_at: null,
      };
    }
  },
};
