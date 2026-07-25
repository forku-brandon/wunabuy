export interface PaymentGateway {
  chargeMoMo(amount: number, currency: string, phone: string, txRef: string, orderId: string): Promise<PaymentResult>;
  chargeCard(amount: number, currency: string, customer: { email: string; phone: string }, txRef: string, orderId: string): Promise<PaymentResult>;
  verifyTransaction(id: string): Promise<VerificationResult>;
  transfer(amount: number, currency: string, recipient: TransferRecipient, reference: string): Promise<TransferResult>;
  getSettlements(from: string, to: string): Promise<Settlement[]>;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  status: 'pending' | 'successful' | 'failed';
  message: string;
  paymentUrl?: string;
}

export interface VerificationResult {
  status: 'successful' | 'failed' | 'pending';
  amount: number;
  currency: string;
  reference: string;
  gatewayResponse: any;
}

export interface TransferRecipient {
  bankCode: string;
  accountNumber: string;
}

export interface TransferResult {
  success: boolean;
  reference: string;
  status: 'processing' | 'completed' | 'failed';
  message: string;
}

export interface Settlement {
  reference: string;
  amount: number;
  currency: string;
  date: string;
  fees: number;
}
