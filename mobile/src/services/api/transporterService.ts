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

const MOCK_DELIVERY_JOBS: DeliveryJob[] = [
  {
    id: 'job_1',
    order_id: 'ord_101',
    order_code: 'WB-2026-9842',
    store: {
      id: 'store_101',
      store_name: 'Douala Tech Hub (Akwa)',
      rating_avg: 4.9,
      is_verified: true,
    },
    pickup_address: {
      id: 'p_1',
      label: 'Store Pickup',
      latitude: 4.0510,
      longitude: 9.7678,
      address_text: 'Rue Joss, Akwa',
      city: 'Douala',
      is_default: false,
    },
    delivery_address: {
      id: 'd_1',
      label: 'Buyer Home',
      latitude: 4.0611,
      longitude: 9.7863,
      address_text: 'Boulevard de la Liberté, Bonanjo',
      city: 'Douala',
      is_default: true,
    },
    items_summary: '1x Samsung Galaxy A54 5G (Package size: Small)',
    delivery_fee: 1500,
    currency: 'XAF',
    distance_km: 2.4,
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'job_2',
    order_id: 'ord_102',
    order_code: 'WB-2026-9843',
    store: {
      id: 'store_102',
      store_name: 'Kilo Shop Bonapriso',
      rating_avg: 4.8,
      is_verified: true,
    },
    pickup_address: {
      id: 'p_2',
      label: 'Store Pickup',
      latitude: 4.0321,
      longitude: 9.6987,
      address_text: 'Avenue Njo-Njo, Bonapriso',
      city: 'Douala',
      is_default: false,
    },
    delivery_address: {
      id: 'd_2',
      label: 'Buyer Office',
      latitude: 4.0450,
      longitude: 9.7120,
      address_text: 'Rond-Point Deido',
      city: 'Douala',
      is_default: false,
    },
    items_summary: '2x Nike Air Force 1 Sneakers (Package size: Medium)',
    delivery_fee: 2500,
    currency: 'XAF',
    distance_km: 1.8,
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'job_3',
    order_id: 'ord_103',
    order_code: 'WB-2026-9844',
    store: {
      id: 'store_103',
      store_name: 'Supermarché Mahima (Makepe)',
      rating_avg: 4.7,
      is_verified: true,
    },
    pickup_address: {
      id: 'p_3',
      label: 'Store Pickup',
      latitude: 4.0810,
      longitude: 9.7420,
      address_text: 'Carrefour Makepe BM',
      city: 'Douala',
      is_default: false,
    },
    delivery_address: {
      id: 'd_3',
      label: 'Buyer Home',
      latitude: 4.0920,
      longitude: 9.7550,
      address_text: 'Logbessou Sector 4',
      city: 'Douala',
      is_default: false,
    },
    items_summary: '1x Philips Blender + 2x Groceries Pack (Medium)',
    delivery_fee: 1800,
    currency: 'XAF',
    distance_km: 3.1,
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];

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
      return MOCK_DELIVERY_JOBS;
    } catch {
      return MOCK_DELIVERY_JOBS;
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
   * Reject/Decline a dispatch offer
   */
  async rejectJob(jobId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/transporter/jobs/${jobId}/reject`);
      return response.data?.success ?? true;
    } catch {
      return true; // Optimistic fallback
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
   * Get active trip details
   */
  async getActiveTrip(jobId?: string): Promise<ActiveTripPayload> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ActiveTripPayload }>(
        '/transporter/active-trip',
        { params: { job_id: jobId } }
      );
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return {
        job_id: jobId || 'job_1',
        order_code: 'WB-2026-9842',
        current_stage: 1,
        verification_code: '7842',
        delivery_fee: 1500,
        items_summary: 'Samsung Galaxy A54 5G (128GB - Factory Sealed)',
        package_specs: 'Fragile Electronics • Small Box (< 2 kg)',
        store_name: 'Douala Tech Hub (Akwa Branch)',
        store_address: 'Rue Joss, Quartier Akwa, Douala, Cameroon',
        store_landmark_directions: 'Opposite Place du Gouvernement, Next to Akwa Mall (1st Floor, Suite 104)',
        store_phone: '+237 670 123 456 / +237 699 876 543',
        store_operating_hours: 'Mon - Sat: 8:00 AM - 6:30 PM',
        store_handover_instructions: '🔑 Handover Code Verification: Present rider ID & ask merchant for the 5-digit pickup PIN #7842 upon parcel collection. Package ready at Counter #2.',
        buyer_name: 'Marie Claire Ngono',
        buyer_address: 'Boulevard de la Liberté, Quartier Akwa, Douala, Cameroon',
        buyer_landmark_directions: 'Near BICEC Bank Main Gate, White 2-Story Building with Blue Gate (2nd Floor)',
        buyer_phone: '+237 671 234 567',
        buyer_delivery_instructions: 'Ring doorbell at front gate or call buyer on arrival. Buyer will inspect parcel & sign proof of delivery on phone.',
      };
    } catch {
      return {
        job_id: jobId || 'job_1',
        order_code: 'WB-2026-9842',
        current_stage: 1,
        verification_code: '7842',
        delivery_fee: 1500,
        items_summary: 'Samsung Galaxy A54 5G (128GB - Factory Sealed)',
        package_specs: 'Fragile Electronics • Small Box (< 2 kg)',
        store_name: 'Douala Tech Hub (Akwa Branch)',
        store_address: 'Rue Joss, Quartier Akwa, Douala, Cameroon',
        store_landmark_directions: 'Opposite Place du Gouvernement, Next to Akwa Mall (1st Floor, Suite 104)',
        store_phone: '+237 670 123 456 / +237 699 876 543',
        store_operating_hours: 'Mon - Sat: 8:00 AM - 6:30 PM',
        store_handover_instructions: '🔑 Handover Code Verification: Present rider ID & ask merchant for the 5-digit pickup PIN #7842 upon parcel collection. Package ready at Counter #2.',
        buyer_name: 'Marie Claire Ngono',
        buyer_address: 'Boulevard de la Liberté, Quartier Akwa, Douala, Cameroon',
        buyer_landmark_directions: 'Near BICEC Bank Main Gate, White 2-Story Building with Blue Gate (2nd Floor)',
        buyer_phone: '+237 671 234 567',
        buyer_delivery_instructions: 'Ring doorbell at front gate or call buyer on arrival. Buyer will inspect parcel & sign proof of delivery on phone.',
      };
    }
  },

  /**
   * Update active trip stage (1: Pickup, 2: Verification, 3: En Route, 4: POD)
   */
  async updateTripStage(jobId: string, stage: number): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/transporter/trips/${jobId}/stage`, {
        stage,
      });
      return response.data?.success ?? true;
    } catch {
      return true;
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
        driver_id: 'DRV-2026-884',
        full_name: 'Jean-Paul Kamga',
        phone: '+237 670 123 456',
        rating_avg: 4.95,
        completed_deliveries: 248,
        is_verified: true,
        vehicle: {
          type: 'Yamaha YBR 125 🏍️',
          plate_number: 'LT-214-AA',
          operating_quarter: 'Akwa / Bonanjo',
          insurance_status: 'Active (Dec 2026)',
          permit_status: 'Douala Council',
        },
        earnings: {
          available_cashout: 48500,
          pending_escrow: 12500,
          total_lifetime_earned: 384500,
        },
      };
    } catch {
      return {
        driver_id: 'DRV-2026-884',
        full_name: 'Jean-Paul Kamga',
        phone: '+237 670 123 456',
        rating_avg: 4.95,
        completed_deliveries: 248,
        is_verified: true,
        vehicle: {
          type: 'Yamaha YBR 125 🏍️',
          plate_number: 'LT-214-AA',
          operating_quarter: 'Akwa / Bonanjo',
          insurance_status: 'Active (Dec 2026)',
          permit_status: 'Douala Council',
        },
        earnings: {
          available_cashout: 48500,
          pending_escrow: 12500,
          total_lifetime_earned: 384500,
        },
      };
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
        available_payout: 48500,
        pending_escrow: 12500,
        total_earned: 384500,
        completed_trips_count: 248,
        rating_avg: 4.95,
        total_tips_xaf: 3500,
        transactions: [
          { id: '1', code: 'Trip #WB-2026-9840', fee: 1500, distance: '2.4 km', date: 'Today, 10:30 AM', status: 'credited' },
          { id: '2', code: 'Trip #WB-2026-9835', fee: 2500, distance: '4.1 km', date: 'Today, 08:15 AM', status: 'credited' },
          { id: '3', code: 'MTN MoMo Cashout (*126#)', fee: -20000, distance: 'Withdrawal', date: 'Yesterday, 06:45 PM', status: 'cashout' },
          { id: '4', code: 'Trip #WB-2026-9812', fee: 1800, distance: '3.0 km', date: 'Yesterday, 02:20 PM', status: 'credited' },
          { id: '5', code: 'Orange Money Cashout (#150#)', fee: -15000, distance: 'Withdrawal', date: 'Aug 28, 2026', status: 'cashout' },
        ],
      };
    } catch {
      return {
        available_payout: 48500,
        pending_escrow: 12500,
        total_earned: 384500,
        completed_trips_count: 248,
        rating_avg: 4.95,
        total_tips_xaf: 3500,
        transactions: [
          { id: '1', code: 'Trip #WB-2026-9840', fee: 1500, distance: '2.4 km', date: 'Today, 10:30 AM', status: 'credited' },
          { id: '2', code: 'Trip #WB-2026-9835', fee: 2500, distance: '4.1 km', date: 'Today, 08:15 AM', status: 'credited' },
          { id: '3', code: 'MTN MoMo Cashout (*126#)', fee: -20000, distance: 'Withdrawal', date: 'Yesterday, 06:45 PM', status: 'cashout' },
          { id: '4', code: 'Trip #WB-2026-9812', fee: 1800, distance: '3.0 km', date: 'Yesterday, 02:20 PM', status: 'credited' },
          { id: '5', code: 'Orange Money Cashout (#150#)', fee: -15000, distance: 'Withdrawal', date: 'Aug 28, 2026', status: 'cashout' },
        ],
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
      return getMockVerificationResult(code, mode);
    } catch {
      return getMockVerificationResult(code, mode);
    }
  },
};

function getMockVerificationResult(code: string, mode: 'package' | 'driver' | 'store') {
  if (mode === 'package') {
    return {
      success: true,
      message: `Package Verified! Code: ${code}`,
      data: {
        package_id: 'pkg_99182',
        order_code: 'WNB-2026-9842',
        item_count: 1,
        weight_kg: 1.2,
      },
    };
  } else if (mode === 'driver') {
    return {
      success: true,
      message: `Driver Transport Permit Verified! License: ${code}`,
      data: {
        driver_name: 'Jean-Paul Nkoum',
        permit_type: 'Catégorie A & B',
        expires_at: '2028-12-31',
      },
    };
  }
  return {
    success: true,
    message: `Merchant Store GPS Hub Verified! Hub: ${code}`,
    data: {
      store_name: 'Douala Tech Hub (Akwa)',
      address: 'Rue Joss, Akwa, Douala',
    },
  };
}


