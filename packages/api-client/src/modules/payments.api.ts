import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  PaymentChargePayload,
  PaymentChargeResponse,
} from '@wunabuy/types';

/**
 * Payments & Escrow Gateway Integration API Module
 */
export function createPaymentsApi(client: AxiosInstance) {
  return {
    /**
     * Charge Mobile Money or Card via Flutterwave/Paystack.
     */
    chargePayment: async (payload: PaymentChargePayload, idempotencyKey?: string): Promise<ApiResponse<PaymentChargeResponse>> => {
      const res = await client.post<ApiResponse<PaymentChargeResponse>>('/payments/charge', payload, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      });
      return res.data;
    },

    /**
     * Verify payment status using transaction reference.
     */
    verifyPayment: async (ref: string): Promise<ApiResponse<{ status: string; paid_escrow: boolean }>> => {
      const res = await client.get<ApiResponse<{ status: string; paid_escrow: boolean }>>(`/payments/verify/${ref}`);
      return res.data;
    },
  };
}
