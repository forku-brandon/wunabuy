import { ProductCategory } from './commerce.types';

/**
 * Stages of the Know Your Customer (KYC) verification process.
 */
export enum KYCStatus {
  NOT_SUBMITTED = 'not_submitted',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Represents an uploaded document for KYC purposes.
 */
export interface KYCDocument {
  /** Unique UUID of the document record */
  id: string;
  /** Category of the uploaded document */
  type: 'id_card_front' | 'id_card_back' | 'storefront_photo' | 'business_registration';
  /** Secure URL to access the uploaded file */
  url: string;
  /** ISO 8601 timestamp when the document was uploaded */
  uploaded_at: string;
}

/**
 * Payload containing data and documents for KYC verification.
 */
export interface KYCSubmission {
  /** Name of the business/store */
  store_name: string;
  /** Business description */
  description: string;
  /** Primary category of business */
  category: ProductCategory;
  /** Business location latitude */
  latitude: number;
  /** Business location longitude */
  longitude: number;
  /** Formatted business address text */
  address_text: string;
  /** URL to the front image of the ID card */
  id_card_front: string;
  /** URL to the back image of the ID card */
  id_card_back: string;
  /** URL to the storefront photo */
  storefront_photo: string;
  /** URL to the business registration document or affidavit */
  business_reg_or_affidavit: string;
}

/**
 * Represents the outcome of a KYC review process.
 */
export interface KYCReviewResult {
  /** Final or current status of the KYC review */
  status: KYCStatus;
  /** Internal notes provided by the reviewing administrator */
  reviewer_notes: string | null;
  /** ISO 8601 timestamp when the review took place */
  reviewed_at: string | null;
  /** Specific reason if the KYC was rejected */
  rejection_reason: string | null;
  /** Number of times KYC was submitted for this entity */
  resubmission_count: number;
}
