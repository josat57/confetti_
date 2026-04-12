/**
 * Reviews Service
 * Handles all review management related API calls
 */

import api from "@/api/api";
import type {
  Review,
  ReviewCreate,
  ReviewFilters,
  ReviewsResponse,
  ReviewStats,
  ReviewResponseCreate,
  ReviewUpdate,
} from "@/types/review.types";

export const reviewsService = {
  /**
   * Get all reviews with optional filters
   */
  async getAll(params?: ReviewFilters): Promise<ReviewsResponse> {
    const response = await api.get("/vendors/reviews", {
      params,
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get a single review by ID
   */
  async getById(id: string): Promise<Review> {
    const response = await api.get(`/vendors/reviews/${id}`, {
      withCredentials: true,
    });
    return response.data.data.review;
  },

  /**
   * Update a review (admin only)
   */
  async update(id: string, data: ReviewUpdate): Promise<Review> {
    const response = await api.put(`/vendors/reviews/${id}`, data, {
      withCredentials: true,
    });
    return response.data.data.review;
  },

  /**
   * Delete a review
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/vendors/reviews/${id}`, {
      withCredentials: true,
    });
  },

  /**
   * Respond to a review
   */
  async respond(id: string, data: ReviewResponseCreate): Promise<Review> {
    const response = await api.post(`/vendors/reviews/${id}/response`, data, {
      withCredentials: true,
    });
    return response.data.data.review;
  },

  /**
   * Update review response
   */
  async updateResponse(
    id: string,
    data: ReviewResponseCreate
  ): Promise<Review> {
    const response = await api.put(`/vendors/reviews/${id}/response`, data, {
      withCredentials: true,
    });
    return response.data.data.review;
  },

  /**
   * Delete review response
   */
  async deleteResponse(id: string): Promise<Review> {
    const response = await api.delete(`/vendors/reviews/${id}/response`, {
      withCredentials: true,
    });
    return response.data.data.review;
  },

  /**
   * Approve a review
   */
  async approve(id: string): Promise<Review> {
    const response = await api.post(
      `/vendors/reviews/${id}/approve`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.review;
  },

  /**
   * Reject a review
   */
  async reject(id: string, reason?: string): Promise<Review> {
    const response = await api.post(
      `/vendors/reviews/${id}/reject`,
      { reason },
      {
        withCredentials: true,
      }
    );
    return response.data.data.review;
  },

  /**
   * Flag a review
   */
  async flag(id: string, reason: string): Promise<Review> {
    const response = await api.post(
      `/vendors/reviews/${id}/flag`,
      { reason },
      {
        withCredentials: true,
      }
    );
    return response.data.data.review;
  },

  /**
   * Mark review as helpful
   */
  async markHelpful(id: string): Promise<Review> {
    const response = await api.post(
      `/vendors/reviews/${id}/helpful`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.review;
  },

  /**
   * Mark review as not helpful
   */
  async markNotHelpful(id: string): Promise<Review> {
    const response = await api.post(
      `/vendors/reviews/${id}/not-helpful`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.review;
  },

  /**
   * Get review statistics
   */
  async getStats(): Promise<ReviewStats> {
    const response = await api.get("/vendors/reviews/stats", {
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get reviews needing response
   */
  async getNeedingResponse(): Promise<Review[]> {
    const response = await api.get("/vendors/reviews/needs-response", {
      withCredentials: true,
    });
    return response.data.data.reviews;
  },

  /**
   * Get recent reviews
   */
  async getRecent(limit?: number): Promise<Review[]> {
    const response = await api.get("/vendors/reviews/recent", {
      params: { limit },
      withCredentials: true,
    });
    return response.data.data.reviews;
  },

  /**
   * Get reviews by rating
   */
  async getByRating(rating: number): Promise<Review[]> {
    const response = await api.get("/vendors/reviews/by-rating", {
      params: { rating },
      withCredentials: true,
    });
    return response.data.data.reviews;
  },

  /**
   * Export reviews
   */
  async export(format: "csv" | "pdf"): Promise<Blob> {
    const response = await api.get("/vendors/reviews/export", {
      params: { format },
      responseType: "blob",
      withCredentials: true,
    });
    return response.data;
  },
};

export default reviewsService;
