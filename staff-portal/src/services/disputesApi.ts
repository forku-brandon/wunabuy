import { apiRequest } from './apiClient';

export interface EscrowDisputeItem {
  id: string;
  order_code: string;
  buyer_name: string;
  buyer_id?: string;
  buyer_phone?: string;
  seller_name: string;
  seller_id?: string;
  seller_phone?: string;
  transporter_name: string;
  transporter_id?: string;
  transporter_phone?: string;
  dispute_reason: string;
  dispute_description: string;
  escrow_amount: number;
  status:
    | 'OPEN'
    | 'UNDER_REVIEW'
    | 'PENDING_REVIEW'
    | 'RESOLVED_REFUND'
    | 'RESOLVED_RELEASE'
    | 'RESOLVED'
    | 'REFUNDED';
  filed_at: string;
  evidence_photos: string[];
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    image_url?: string | null;
  }>;
}

export const disputesApi = {
  /**
   * Fetch active escrow disputes list.
   * API Endpoint: GET /api/v1/staff/disputes
   */
  getDisputesList: async () => {
    return apiRequest<EscrowDisputeItem[]>('/staff/disputes', {
      method: 'GET',
    });
  },

  /**
   * Execute binding staff escrow ruling on a dispute.
   * API Endpoint: POST /api/v1/staff/disputes/{id}/adjudicate
   */
  adjudicateDispute: async (
    id: string,
    ruling_type: 'BUYER_REFUND' | 'SELLER_RELEASE' | 'SPLIT_50_50',
    rationale: string
  ) => {
    return apiRequest<EscrowDisputeItem>(`/staff/disputes/${id}/adjudicate`, {
      method: 'POST',
      body: JSON.stringify({ ruling_type, rationale }),
    });
  },
};

