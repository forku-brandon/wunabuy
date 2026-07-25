import axios from 'axios';
import { env } from '../../../config/env';
import { PaymentGateway, PaymentResult, VerificationResult, TransferResult, TransferRecipient, Settlement } from './payment-gateway.interface';

const client = axios.create({
  baseURL: 'https://api.flutterwave.com/v3',
  headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
  timeout: 30000,
});

export const flutterwave: PaymentGateway = {
  async chargeMoMo(amount, currency, phone, txRef, orderId): Promise<PaymentResult> {
    const { data } = await client.post('/charges?type=momo', {
      amount, currency, phonenumber: phone,
      tx_ref: txRef,
      redirect_url: `${process.env.BASE_URL || ''}/webhooks/flutterwave`,
      meta: { order_id: orderId },
    });
    return {
      success: data.status === 'success',
      reference: data.data?.flw_ref || txRef,
      status: 'pending',
      message: data.message,
    };
  },

  async chargeCard(amount, currency, customer, txRef, orderId): Promise<PaymentResult> {
    const { data } = await client.post('/charges', {
      amount, currency, tx_ref: txRef, customer,
      redirect_url: `${process.env.BASE_URL || ''}/webhooks/flutterwave`,
      payment_options: 'card',
      meta: { order_id: orderId },
    });
    return {
      success: data.status === 'success',
      reference: data.data?.flw_ref || txRef,
      status: 'pending',
      message: data.message,
      paymentUrl: data.data?.link,
    };
  },

  async verifyTransaction(id): Promise<VerificationResult> {
    const { data } = await client.get(`/transactions/${id}/verify`);
    return {
      status: data.data?.status === 'successful' ? 'successful' : data.data?.status,
      amount: data.data?.amount,
      currency: data.data?.currency,
      reference: data.data?.tx_ref,
      gatewayResponse: data.data,
    };
  },

  async transfer(amount, currency, recipient, reference): Promise<TransferResult> {
    const { data } = await client.post('/transfers', {
      amount, currency,
      bank_code: recipient.bankCode,
      account_number: recipient.accountNumber,
      reference,
      narration: 'Wunabuy store payout',
    });
    return {
      success: data.status === 'success',
      reference: data.data?.reference || reference,
      status: 'processing',
      message: data.message,
    };
  },

  async getSettlements(from, to): Promise<Settlement[]> {
    const { data } = await client.get('/settlements', { params: { from, to } });
    return (data.data || []).map((s: any) => ({
      reference: s.reference,
      amount: s.amount,
      currency: s.currency,
      date: s.date,
      fees: s.fee,
    }));
  },
};
