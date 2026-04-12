/**
 * Activity Types
 * Type definitions for activity feed and tracking
 */

export type ActivityType =
  | "view"
  | "lead"
  | "booking"
  | "review"
  | "message"
  | "payment"
  | "invoice"
  | "quote"
  | "event"
  | "profile_update"
  | "subscription"
  | "other";

export interface Activity {
  _id: string;
  vendor: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: {
    entityId?: string;
    entityType?: string;
    amount?: number;
    currency?: string;
    rating?: number;
    status?: string;
    [key: string]: any;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  read: boolean;
  timestamp: string;
  createdAt: string;
}

export interface ActivityFilters {
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
  read?: boolean;
  limit?: number;
  page?: number;
}

export interface ActivitiesResponse {
  activities: Activity[];
  total: number;
  unread: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: {
    [key in ActivityType]?: number;
  };
}

export interface DashboardStats {
  profileViews?: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    change: number;
  };
  leads?: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
    conversionRate: number;
  };
  bookings?: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    revenue: number;
  };
  reviews?: {
    total: number;
    averageRating: number;
    recent: number;
    needsResponse: number;
  };
  revenue?: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
    outstanding: number;
  };
  // New backend structure
  summary?: {
    profileViews: number;
    totalInquiries: number;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    isFeatured: boolean;
  };
  inquiries?: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    proposal_sent: number;
    negotiating: number;
    won: number;
    lost: number;
    conversionRate: number;
    needingFollowUp: number;
  };
  performance?: {
    profileCompleteness: number;
    responseMetrics: {
      responseTime: number;
      responseRate: number;
    };
    engagement: {
      viewsToInquiryRate: number;
      inquiryToBookingRate: number;
    };
  };
}
