import { api } from './apiClient';
import { Wallet, Transaction, PayoutRequest, PayoutResponse, PayoutDestinationType } from '@wunabuy/types';
import { WalletFundPayload, WalletFundResponse } from '@wunabuy/api-client';

export interface WalletMetrics {
  wallet_id: string;
  currency: string;
  balance_available: number;
  balance_escrow_locked: number;
  balance_total: number;
  total_deposited: number;
  total_spent: number;
  is_active: boolean;
}

export interface WalletTransactionItem {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  provider: 'mtn' | 'orange' | 'wallet_escrow';
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  created_at: string;
}

/**
 * Service to manage wallet balances, top-ups, payouts, and transaction ledgers.
 */
export const WalletService = {
  /**
   * Fetch current wallet balances and escrow totals
   */
  async getWallet(): Promise<WalletMetrics> {
    try {
      const response = await api.client.get<{ success: boolean; data: WalletMetrics }>('/wallet');
      if (response.data?.data) {
        return response.data.data;
      }
      return {
        wallet_id: '',
        currency: 'XAF',
        balance_available: 0,
        balance_escrow_locked: 0,
        balance_total: 0,
        total_deposited: 0,
        total_spent: 0,
        is_active: true,
      };
    } catch {
      return {
        wallet_id: '',
        currency: 'XAF',
        balance_available: 0,
        balance_escrow_locked: 0,
        balance_total: 0,
        total_deposited: 0,
        total_spent: 0,
        is_active: true,
      };
    }
  },

  /**
   * Fetch wallet transaction ledger history
   */
  async getTransactions(params?: { type?: 'credit' | 'debit'; provider?: string }): Promise<WalletTransactionItem[]> {
    try {
      const response = await api.client.get<{ success: boolean; data: WalletTransactionItem[] }>('/wallet/transactions', { params });
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Top up wallet via MTN MoMo or Orange Money
   */
  async fundWallet(payload: WalletFundPayload): Promise<WalletFundResponse> {
    const response = await api.wallet.requestFunding(payload);
    return response.data;
  },

  /**
   * Withdraw from wallet to MTN MoMo, Orange Money, or Bank
   */
  async withdrawWallet(payload: PayoutRequest): Promise<PayoutResponse> {
    const response = await api.wallet.requestPayout(payload);
    return response.data;
  },

  /**
   * Withdraw alias method matching WalletScreen UI
   */
  async withdraw(payload: { amount: number; provider: 'mtn' | 'orange'; phone: string }): Promise<PayoutResponse> {
    return this.withdrawWallet({
      amount: payload.amount,
      destination_details: {
        type: PayoutDestinationType.MOMO,
        phone: payload.phone,
        bank_code: null,
        account_number: payload.phone,
      },
    });
  },
};

