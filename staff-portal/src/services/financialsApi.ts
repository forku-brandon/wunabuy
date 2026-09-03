import { apiRequest } from './apiClient';

export interface PayoutTransactionItem {
  id: string;
  reference_code: string;
  entity_name: string;
  entity_type: 'SELLER' | 'TRANSPORTER';
  payment_method: 'MTN_MOMO' | 'ORANGE_MONEY';
  account_number: string;
  amount: number;
  commission_deducted: number;
  net_payout: number;
  status: 'PENDING_APPROVAL' | 'PROCESSED' | 'FLAGGED';
  requested_at: string;
  risk_score: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const financialsApi = {
  /**
   * Fetch Mobile Money payout reconciliation ledger.
   * API Endpoint: GET /api/v1/staff/financials/payouts
   */
  getPayoutLedger: async () => {
    return apiRequest<PayoutTransactionItem[]>('/staff/financials/payouts', {
      method: 'GET',
    });
  },

  /**
   * Authorize high-value MoMo payout disbursal.
   * API Endpoint: POST /api/v1/staff/financials/payouts/{id}/authorize
   */
  authorizePayout: async (id: string, security_pin: string) => {
    return apiRequest<PayoutTransactionItem>(`/staff/financials/payouts/${id}/authorize`, {
      method: 'POST',
      body: JSON.stringify({ security_pin }),
    });
  },
};
