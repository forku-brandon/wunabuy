import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Wallet,
  Transaction,
  PayoutRequest,
  PayoutResponse,
} from '@wunabuy/types';

export interface WalletFundPayload {
  provider: 'mtn' | 'orange';
  phone: string;
  amount: number;
  currency?: string;
}

export interface WalletFundResponse {
  transaction_id: string;
  status: string;
  provider: string;
  phone: string;
  amount: number;
  currency: string;
  dial_code?: string;
  instruction?: string;
  expires_at?: string;
}

/**
 * Wallet & Payout API Module (Buyer, Seller & Transporter)
 */
export function createWalletApi(client: AxiosInstance) {
  return {
    /**
     * Get wallet overview balances (escrow vs available).
     */
    getWallet: async (): Promise<ApiResponse<Wallet>> => {
      const res = await client.get<ApiResponse<Wallet>>('/wallet');
      return res.data;
    },

    /**
     * Request wallet top-up funding via Mobile Money.
     */
    requestFunding: async (payload: WalletFundPayload): Promise<ApiResponse<WalletFundResponse>> => {
      const res = await client.post<ApiResponse<WalletFundResponse>>('/wallet/fund', payload);
      return res.data;
    },

    /**
     * Request withdrawal payout to MoMo or Bank account. Accepts Idempotency-Key.
     */
    requestPayout: async (payload: PayoutRequest, idempotencyKey?: string): Promise<ApiResponse<PayoutResponse>> => {
      const res = await client.post<ApiResponse<PayoutResponse>>('/wallet/withdraw', payload, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      });
      return res.data;
    },

    /**
     * Fetch wallet transaction ledger history.
     */
    getTransactions: async (params?: { type?: 'credit' | 'debit'; provider?: string; cursor?: string; limit?: number }): Promise<PaginatedResponse<Transaction>> => {
      const res = await client.get<PaginatedResponse<Transaction>>('/wallet/transactions', { params });
      return res.data;
    },

    /**
     * Check transaction status by ID (polling).
     */
    checkTransactionStatus: async (transactionId: string): Promise<ApiResponse<{ transaction_id: string; status: string; amount: number; new_balance?: number }>> => {
      const res = await client.get<ApiResponse<{ transaction_id: string; status: string; amount: number; new_balance?: number }>>(`/wallet/transactions/${transactionId}/status`);
      return res.data;
    },
  };
}
