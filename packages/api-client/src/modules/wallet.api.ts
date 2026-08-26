import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Wallet,
  Transaction,
  PayoutRequest,
  PayoutResponse,
} from '@wunabuy/types';

/**
 * Wallet & Payout API Module (Seller & Transporter)
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
     * Request withdrawal payout to MoMo or Bank account. Accepts Idempotency-Key.
     */
    requestPayout: async (payload: PayoutRequest, idempotencyKey?: string): Promise<ApiResponse<PayoutResponse>> => {
      const res = await client.post<ApiResponse<PayoutResponse>>('/wallet/payout', payload, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      });
      return res.data;
    },

    /**
     * Fetch wallet transaction ledger history.
     */
    getTransactions: async (params?: { cursor?: string; limit?: number }): Promise<PaginatedResponse<Transaction>> => {
      const res = await client.get<PaginatedResponse<Transaction>>('/wallet/transactions', { params });
      return res.data;
    },
  };
}

