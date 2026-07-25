import axios from 'axios';
import { PaymentGateway, PaymentResult, VerificationResult, TransferResult, TransferRecipient, Settlement } from './payment-gateway.interface';

const client = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  timeout: 30000,
});

export const paystack: PaymentGateway = {
  async chargeMoMo(amount, currency, phone, txRef, orderId): Promise<PaymentResult> {
    // Paystack mobile money implementation
    const { data } = await client.post('/transaction/initialize', {
      amount: amount * 100, // Paystack uses kobo
      currency,
      reference: txRef,
      channel: 'mobile_money',
      metadata: { order_id: orderId },
    });
    return {
      success: data.status,
      reference: txRef,
      status: 'pending',
      message: 'Payment initialized',
      paymentUrl: data.data?.authorization_url,
    };
  },

  async chargeCard(amount, currency, customer, txRef, orderId): Promise<PaymentResult> {
    const { data } = await client.post('/transaction/initialize', {
      amount: amount * 100,
      currency,
      reference: txRef,
      email: customer.email,
      metadata: { order_id: orderId },
    });
    return {
      success: data.status,
      reference: txRef,
      status: 'pending',
      message: 'Payment initialized',
      paymentUrl: data.data?.authorization_url,
    };
  },

  async verifyTransaction(id): Promise<VerificationResult> {
    const { data } = await client.get(`/transaction/verify/${id}`);
    return {
      status: data.data?.status === 'success' ? 'successful' : data.data?.status,
      amount: data.data?.amount / 100,
      currency: data.data?.currency,
      reference: data.data?.reference,
      gatewayResponse: data.data,
    };
  },

  async transfer(amount, currency, recipient, reference): Promise<TransferResult> {
    // Create transfer recipient first
    const { data: recipientData } = await client.post('/transferrecipient', {
      type: 'nuban',
      name: 'Wunabuy Store',
      account_number: recipient.accountNumber,
      bank_code: recipient.bankCode,
      currency,
    });
    
    const { data } = await client.post('/transfer', {
      source: 'balance',
      amount: amount * 100,
      recipient: recipientData.data.recipient_code,
      reference,
      reason: 'Wunabuy store payout',
    });
    
    return {
      success: data.status,
      reference: data.data?.reference || reference,
      status: 'processing',
      message: data.message,
    };
  },

  async getSettlements(from, to): Promise<Settlement[]> {
    const { data } = await client.get('/settlement', { params: { from, to } });
    return (data.data || []).map((s: any) => ({
      reference: s.reference,
      amount: s.amount / 100,
      currency: s.currency,
      date: s.settlement_date,
      fees: s.fee / 100,
    }));
  },
};
