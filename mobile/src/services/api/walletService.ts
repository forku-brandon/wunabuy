import { api } from './apiClient';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface WalletMetrics {
  wallet_id: string;
  currency: string;
  balance_available: number;
  balance_escrow_locked: number;
  balance_total: number;
  registration_bonus: number;
  balance_withdrawable: number;
  is_active: boolean;
  last_updated_at: string;
  fee_info: WalletFeeInfo;
}

export interface WalletFeeInfo {
  payout_fee_rate: number;
  payout_fee_cap_xaf: number;
  platform_commission: number;
  min_withdrawal_xaf: number;
  min_deposit_xaf: number;
}

export interface WalletBalance {
  balance_available: number;
  balance_escrow_locked: number;
  balance_withdrawable: number;
  currency: string;
  timestamp: string;
}

export interface WalletTransactionItem {
  id: string;
  type: 'credit' | 'debit' | 'escrow_lock' | 'escrow_release' | 'delivery_earning';
  amount: number;
  is_debit: boolean;
  currency: string;
  description: string;
  provider: 'mtn' | 'orange' | 'escrow' | 'wallet_escrow';
  status: 'completed' | 'pending' | 'failed' | 'pending_approval';
  reference: string;
  created_at: string;
}

export interface FundPayload {
  amount: number;
  provider: 'mtn' | 'orange';
  phone: string;
}

export interface FundResponse {
  transaction_id: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  provider: string;
  phone: string;
  amount: number;
  currency: string;
  dial_code: string;
  instruction: string;
  expires_at: string;
  new_balance: number;
  sandbox_mode: boolean;
}

export interface WithdrawPayload {
  amount: number;
  provider: 'mtn' | 'orange';
  phone: string;
}

export interface WithdrawResponse {
  reference: string;
  status: 'completed' | 'pending_approval';
  amount: number;
  fee: number;
  net_amount: number;
  currency: string;
  new_balance: number;
  estimated_arrival: string;
  sandbox_mode: boolean;
}

export interface TransactionStatusResponse {
  reference: string;
  status: 'completed' | 'pending' | 'failed' | 'not_found' | 'pending_approval';
  amount: number;
  provider: string;
  new_balance: number;
}

// ─── Fee helpers (mirrors backend config/payment.php) ──────────────────────

/**
 * Calculate withdrawal fee: min(500 XAF, amount × 1.5%)
 */
export function calculateWithdrawalFee(amount: number): number {
  return Math.min(500, Math.round(amount * 0.015));
}

/**
 * Calculate net withdrawal after fee.
 */
export function calculateNetWithdrawal(amount: number): number {
  return amount - calculateWithdrawalFee(amount);
}

/**
 * Calculate platform commission on subtotal (3.5%).
 */
export function calculatePlatformCommission(subtotal: number): number {
  return Math.round(subtotal * 0.035);
}

/**
 * Calculate seller net payout: subtotal - commission.
 */
export function calculateSellerNet(subtotal: number): number {
  return Math.max(0, subtotal - calculatePlatformCommission(subtotal));
}

/**
 * Full order cost breakdown for display in checkout.
 */
export function calculateOrderBreakdown(subtotal: number, deliveryFee: number) {
  const commission = calculatePlatformCommission(subtotal);
  const sellerNet  = calculateSellerNet(subtotal);
  const total      = subtotal + deliveryFee;
  return { subtotal, deliveryFee, commission, sellerNet, total };
}

// ─── Service ───────────────────────────────────────────────────────────────

/**
 * WalletService — manages wallet balances, top-ups, payouts, and ledger.
 * All fee calculations mirror backend config/payment.php exactly.
 */
export const WalletService = {

  /**
   * Fetch full wallet details including escrow, withdrawable, and fee info.
   */
  async getWallet(): Promise<WalletMetrics> {
    try {
      const res = await api.client.get<{ success: boolean; data: WalletMetrics }>('/wallet');
      if (res.data?.data) return res.data.data;
    } catch { /* network error — return safe zero state */ }
    return {
      wallet_id: '',
      currency: 'XAF',
      balance_available: 0,
      balance_escrow_locked: 0,
      balance_total: 0,
      registration_bonus: 0,
      balance_withdrawable: 0,
      is_active: true,
      last_updated_at: new Date().toISOString(),
      fee_info: {
        payout_fee_rate: 0.015,
        payout_fee_cap_xaf: 500,
        platform_commission: 0.035,
        min_withdrawal_xaf: 100,
        min_deposit_xaf: 100,
      },
    };
  },

  /**
   * Lightweight balance poll — faster than getWallet() for real-time refresh.
   * Use this in CheckoutPaymentScreen and quick balance checks.
   */
  async getBalance(): Promise<WalletBalance> {
    try {
      const res = await api.client.get<{ success: boolean; data: WalletBalance }>('/wallet/balance');
      if (res.data?.data) return res.data.data;
    } catch { /* network error */ }
    return {
      balance_available: 0,
      balance_escrow_locked: 0,
      balance_withdrawable: 0,
      currency: 'XAF',
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Fetch wallet transaction ledger history.
   */
  async getTransactions(params?: {
    type?: 'credit' | 'debit';
    provider?: 'mtn' | 'orange' | 'escrow';
  }): Promise<WalletTransactionItem[]> {
    try {
      const res = await api.client.get<{ success: boolean; data: WalletTransactionItem[] }>(
        '/wallet/transactions', { params }
      );
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Top up wallet via MTN MoMo or Orange Money.
   * - In stub/sandbox mode: immediately credited, status = 'completed'.
   * - In live mode: gateway push initiated, status = 'pending' until webhook confirms.
   *
   * @throws Error on API rejection (insufficient amount, invalid phone, etc.)
   */
  async fundWallet(payload: FundPayload): Promise<FundResponse> {
    const res = await api.client.post<{ success: boolean; data: FundResponse }>(
      '/wallet/fund', payload
    );
    return res.data.data;
  },

  /**
   * Request a withdrawal to MTN MoMo or Orange Money.
   * Includes fee calculation: min(500 XAF, amount × 1.5%).
   *
   * @throws Error on insufficient balance or validation failure
   */
  async withdraw(payload: WithdrawPayload): Promise<WithdrawResponse> {
    const res = await api.client.post<{ success: boolean; data: WithdrawResponse }>(
      '/wallet/withdraw', payload
    );
    return res.data.data;
  },

  /**
   * Poll a transaction until it reaches a terminal state or max attempts.
   * Use after initiating a MoMo push to monitor for async gateway confirmation.
   *
   * @param reference  Transaction reference or ID
   * @param maxAttempts Maximum number of polling attempts (default: 12)
   * @param intervalMs  Polling interval in ms (default: 5000 = 5 seconds)
   */
  async pollTransactionStatus(
    reference: string,
    maxAttempts = 12,
    intervalMs = 5000
  ): Promise<TransactionStatusResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await api.client.get<{ success: boolean; data: TransactionStatusResponse }>(
          `/wallet/transactions/${reference}/status`
        );
        const data = res.data?.data;
        if (data && ['completed', 'failed', 'pending_approval'].includes(data.status)) {
          return data;
        }
      } catch { /* network error — continue polling */ }

      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    // Return a "still pending" state after exhausting attempts
    return {
      reference,
      status: 'pending',
      amount: 0,
      provider: 'unknown',
      new_balance: 0,
    };
  },
};
