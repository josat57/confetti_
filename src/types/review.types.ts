/**
 * Review Types
 * Type definitions for review management
 */

export interface ReviewAuthor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Review {
  _id: string;
  vendor: string;
  author: ReviewAuthor;
  booking?: string;
  rating: number;
  title: string;
  comment: string;
  photos?: string[];
  helpful: number;
  notHelpful: number;
  verified: boolean;
  status: "pending" | "approved" | "rejected" | "flagged";
  response?: ReviewResponse;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  text: string;
  respondedBy: string;
  respondedByName: string;
  respondedAt: string;
}

export interface ReviewCreate {
  bookingId?: string;
  rating: number;
  title: string;
  comment: string;
  photos?: File[];
}

export interface ReviewFilters {
  rating?: number;
  status?: "pending" | "approved" | "rejected" | "flagged";
  verified?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  withResponse: number;
  withoutResponse: number;
  verified: number;
  recentReviews: number;
}

export interface ReviewResponseCreate {
  text: string;
}

export interface ReviewUpdate {
  status?: "pending" | "approved" | "rejected" | "flagged";
  title?: string;
  comment?: string;
}
