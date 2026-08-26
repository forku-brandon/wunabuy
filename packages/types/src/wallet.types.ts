/**
 * Represents a user's digital wallet.
 */
export interface Wallet {
  /** Funds currently held in escrow pending order completion */
  balance_escrow: number;
  /** Funds available for immediate withdrawal or use */
  balance_available: number;
  /** Total lifetime earnings */
  total_earned: number;
  /** Total lifetime payouts */
  total_payout: number;
  /** Wallet currency */
  currency: 'XAF';
}

/**
 * Categories of wallet transactions.
 */
export enum TransactionType {
  ESCROW_CREDIT = 'escrow_credit',
  ESCROW_RELEASE = 'escrow_release',
  COMMISSION_DEDUCTION = 'commission_deduction',
  PAYOUT = 'payout',
  REFUND = 'refund',
  DELIVERY_FEE_CREDIT = 'delivery_fee_credit',
}

/**
 * Possible statuses of a wallet transaction.
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Represents a single transaction on a user's wallet.
 */
export interface Transaction {
  /** Unique UUID for the transaction */
  id: string;
  /** Classification of the transaction */
  type: TransactionType;
  /** Transaction amount */
  amount: number;
  /** Currency used in the transaction */
  currency: 'XAF';
  /** Status of the transaction processing */
  status: TransactionStatus;
  /** Human-readable description */
  description: string;
  /** External system reference ID */
  reference: string | null;
  /** ISO 8601 timestamp of the transaction */
  created_at: string;
}

/**
 * Supported destination channels for payout requests.
 */
export enum PayoutDestinationType {
  MOMO = 'momo',
  BANK = 'bank',
}

/**
 * Payload to request a wallet payout/withdrawal.
 */
export interface PayoutRequest {
  /** Amount to withdraw */
  amount: number;
  /** Target destination details for the funds */
  destination_details: {
    /** Target channel type */
    type: PayoutDestinationType;
    /** Mobile money phone number, required if type is MOMO */
    phone: string | null;
    /** Bank sorting code, required if type is BANK */
    bank_code: string | null;
    /** Account number or PAN */
    account_number: string;
  };
}

/**
 * Response structure for a successful payout request.
 */
export interface PayoutResponse {
  /** UUID of the registered payout request */
  id: string;
  /** Amount successfully requested */
  amount: number;
  /** Current status of the payout processing */
  status: string;
  /** Channel chosen for the payout */
  destination_type: string;
  /** Expected completion time */
  estimated_arrival: string;
  /** ISO 8601 timestamp of request creation */
  created_at: string;
}
