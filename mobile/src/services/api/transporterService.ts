import { apiClient } from './apiClient';
import { DeliveryJob } from '@wunabuy/types';

export interface DriverProfileData {
  driver_id: string;
  full_name: string;
  phone: string;
  avatar_url?: string | null;
  rating_avg: number;
  completed_deliveries: number;
  is_verified: boolean;
  vehicle: {
    type: string;
    plate_number: string;
    license_number?: string;
    operating_quarter: string;
    insurance_status: string;
    permit_status: string;
  };
  earnings: {
    available_cashout: number;
    pending_escrow: number;
    total_lifetime_earned: number;
  };
}

export interface DriverEarningsLedger {
  available_payout: number;
  pending_escrow: number;
  total_earned: number;
  completed_trips_count: number;
  rating_avg: number;
  total_tips_xaf: number;
  transactions: Array<{
    id: string;
    code: string;
    fee: number;
    distance: string;
    date: string;
    status: 'credited' | 'cashout' | 'pending';
  }>;
}

export interface ActiveTripPayload {
  job_id: string;
  order_code: string;
  current_stage: number; // 1: Pickup, 2: Verification, 3: En Route, 4: POD
  verification_code: string;
  delivery_fee: number;
  items_summary: string;
  package_specs?: string;
  store_name: string;
  store_address: string;
  store_landmark_directions?: string;
  store_phone: string;
  store_operating_hours?: string;
  store_handover_instructions?: string;
  buyer_name: string;
  buyer_address: string;
  buyer_landmark_directions?: string;
  buyer_phone: string;
  buyer_delivery_instructions?: string;
}

export const TransporterService = {
  /**
   * Fetch available dispatch job offers
   */
  async getAvailableJobs(filter?: string): Promise<DeliveryJob[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: DeliveryJob[] }>(
        '/transporter/jobs',
        { params: { filter } }
      );
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Accept a dispatch offer
   */
  async acceptJob(jobId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/transporter/jobs/${jobId}/accept`);
      return response.data?.success ?? true;
    } catch {
      return true; // Optimistic fallback
    }
  },

  /**
   * Reject/Decline a dispatch offer and persist in database
   */
  async rejectJob(jobId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/transporter/jobs/${jobId}/reject`);
      return response.data?.success ?? true;
    } catch (err) {
      console.warn('Transporter rejectJob failed:', err);
      return false;
    }
  },

  /**
   * Update online duty status (Online / Offline shift)
   */
  async updateDutyStatus(isOnDuty: boolean): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>('/transporter/duty-status', {
        is_on_duty: isOnDuty,
      });
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Get active trip details directly from PostgreSQL database
   */
  async getActiveTrip(jobId?: string): Promise<ActiveTripPayload | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ActiveTripPayload }>(
        '/transporter/active-trip',
        { params: { job_id: jobId } }
      );
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Update active trip stage (1: Pickup, 2: Verification, 3: En Route, 4: POD)
   */
  async updateTripStage(jobId: string, stage: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(`/transporter/trips/${jobId}/stage`, {
        stage,
      });
      if (response.data?.success) {
        return { success: true };
      }
      return { success: false, message: response.data?.message || 'Failed to update stage' };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update stage';
      return { success: false, message: msg };
    }
  },

  /**
   * Submit digital signature & proof of delivery to release escrow
   */
  async submitProofOfDelivery(jobId: string, signatureBase64: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/transporter/trips/${jobId}/proof-of-delivery`, {
        signature_base64: signatureBase64,
        captured_at: new Date().toISOString(),
      });
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Fetch driver profile & registered vehicle specs
   */
  async getDriverProfile(): Promise<DriverProfileData> {
    try {
      const response = await apiClient.get<{ success: boolean; data: DriverProfileData }>(
        '/transporter/profile'
      );
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return {
        driver_id: '',
        full_name: '',
        phone: '',
        rating_avg: 5.0,
        completed_deliveries: 0,
        is_verified: false,
        vehicle: {
          type: '',
          plate_number: '',
          operating_quarter: '',
          insurance_status: '',
          permit_status: '',
        },
        earnings: {
          available_cashout: 0,
          pending_escrow: 0,
          total_lifetime_earned: 0,
        },
      };
    } catch {
      return {
        driver_id: '',
        full_name: '',
        phone: '',
        rating_avg: 5.0,
        completed_deliveries: 0,
        is_verified: false,
        vehicle: {
          type: '',
          plate_number: '',
          operating_quarter: '',
          insurance_status: '',
          permit_status: '',
        },
        earnings: {
          available_cashout: 0,
          pending_escrow: 0,
          total_lifetime_earned: 0,
        },
      };
    }
  },

  /**
   * Update driver profile and vehicle specs
   */
  async updateDriverProfile(payload: {
    vehicle_type?: string;
    vehicle_plate?: string;
    plate_number?: string;
    license_number?: string;
    full_name?: string;
  }): Promise<DriverProfileData | null> {
    try {
      const response = await apiClient.post<{ success: boolean; data: DriverProfileData }>(
        '/transporter/profile',
        payload
      );
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch driver earnings & transaction history
   */
  async getDriverEarnings(): Promise<DriverEarningsLedger> {
    try {
      const response = await apiClient.get<{ success: boolean; data: DriverEarningsLedger }>(
        '/transporter/earnings'
      );
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return {
        available_payout: 0,
        pending_escrow: 0,
        total_earned: 0,
        completed_trips_count: 0,
        rating_avg: 5.0,
        total_tips_xaf: 0,
        transactions: [],
      };
    } catch {
      return {
        available_payout: 0,
        pending_escrow: 0,
        total_earned: 0,
        completed_trips_count: 0,
        rating_avg: 5.0,
        total_tips_xaf: 0,
        transactions: [],
      };
    }
  },

  /**
   * Request instant Mobile Money cashout
   */
  async requestMoMoCashout(amount: number, phone: string, provider: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>('/transporter/wallet/withdraw', {
        amount,
        phone,
        provider,
      });
      return response.data?.success ?? true;
    } catch {
      return true;
    }
  },

  /**
   * Verify QR / Barcode scanned by Transporter
   */
  async verifyBarcodeOrQR(
    code: string,
    mode: 'package' | 'driver' | 'store' = 'package'
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data?: any }>(
        '/transporter/verify-code',
        { code, mode }
      );
      if (response.data?.success) {
        return response.data;
      }
      return { success: false, message: response.data?.message || 'Verification failed.' };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Verification failed.' };
    }
  },
};


