/**
 * Standard successful API response format.
 * @template T Type of the returned payload data.
 */
export interface ApiResponse<T> {
  /** Indicates a successful request */
  success: boolean;
  /** Core response payload data */
  data: T;
  /** Additional metadata, if any */
  meta: Record<string, unknown> | undefined;
}

/**
 * API response structure for paginated lists.
 * @template T Type of the list items returned.
 */
export interface PaginatedResponse<T> {
  /** Indicates a successful request */
  success: boolean;
  /** Array containing the returned items */
  data: T[];
  /** Metadata containing pagination details */
  meta: {
    pagination: {
      /** Indicates if further pages exist */
      has_more: boolean;
      /** Cursor pointing to the next page of results, or null if at the end */
      next_cursor: string | null;
      /** The number of items returned per page */
      per_page: number;
    };
  };
}

/**
 * Defined API error codes matching backend system responses.
 */
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_ORDER_STATE = 'INVALID_ORDER_STATE',
  ESCROW_LOCKED = 'ESCROW_LOCKED',
  PAYMENT_GATEWAY_ERROR = 'PAYMENT_GATEWAY_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * Standard format for API error responses.
 */
export interface ApiError {
  /** Indicates an unsuccessful request */
  success: false;
  /** Details regarding the error */
  error: {
    /** The categorized error code */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Specific field validation errors mapping field names to error lists */
    details: Record<string, string[]> | undefined;
    /** Trace ID mapping back to server logs for debugging */
    request_id: string;
  };
}
