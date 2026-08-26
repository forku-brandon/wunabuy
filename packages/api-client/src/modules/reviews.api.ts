import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Review,
  CreateReviewPayload,
  ReviewTargetType,
} from '@wunabuy/types';

/**
 * Reviews & Ratings API Module
 */
export function createReviewsApi(client: AxiosInstance) {
  return {
    /**
     * Submit product, store, or transporter rating & review.
     */
    createReview: async (payload: CreateReviewPayload): Promise<ApiResponse<Review>> => {
      const res = await client.post<ApiResponse<Review>>('/reviews', payload);
      return res.data;
    },

    /**
     * Fetch paginated reviews for a target resource.
     */
    getReviews: async (type: ReviewTargetType, id: string, params?: { cursor?: string; limit?: number }): Promise<PaginatedResponse<Review>> => {
      const res = await client.get<PaginatedResponse<Review>>(`/reviews/${type.toLowerCase()}/${id}`, { params });
      return res.data;
    },
  };
}
