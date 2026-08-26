/**
 * Indicates the type of entity being reviewed.
 */
export enum ReviewTargetType {
  PRODUCT = 'PRODUCT',
  STORE = 'STORE',
  TRANSPORTER = 'TRANSPORTER',
}

/**
 * Represents a review left by a user.
 */
export interface Review {
  /** Unique UUID of the review */
  id: string;
  /** UUID of the order that this review corresponds to */
  order_id: string;
  /** UUID of the user who authored the review */
  reviewer_id: string;
  /** The classification of the reviewed entity */
  target_type: ReviewTargetType;
  /** The UUID of the reviewed entity */
  target_id: string;
  /** Numeric rating from 1 to 5 */
  rating: number;
  /** Textual feedback, if any */
  review_text: string | null;
  /** Array of URLs pointing to attached photo evidence */
  photos: string[];
  /** ISO 8601 timestamp of review creation */
  created_at: string;
}

/**
 * Payload to create a new review.
 */
export interface CreateReviewPayload {
  /** UUID of the associated order */
  order_id: string;
  /** Type of entity being reviewed */
  target_type: ReviewTargetType;
  /** UUID of the entity being reviewed */
  target_id: string;
  /** Numeric rating given, typically 1 through 5 */
  rating: number;
  /** Optional textual feedback */
  review_text?: string;
  /** Optional array of image URLs to attach */
  photos?: string[];
}
