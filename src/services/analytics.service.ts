/**
 * Analytics Service
 * Handles all analytics and reporting API calls
 */

import api from "@/api/api";

export interface AnalyticsSummary {
  profileViews: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  leads: {
    total: number;
    new: number;
    converted: number;
    conversionRate: number;
  };
  bookings: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  reviews: {
    total: number;
    averageRating: number;
    recentReviews: number;
  };
}

export interface ViewsData {
  period: string;
  views: number;
  uniqueVisitors: number;
  date: string;
}

export interface LeadStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  quotedLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageResponseTime: number;
  leadsBySource: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  leadsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface ConversionRates {
  overall: number;
  byEventType: Array<{
    eventType: string;
    rate: number;
    leads: number;
    conversions: number;
  }>;
  bySource: Array<{
    source: string;
    rate: number;
    leads: number;
    conversions: number;
  }>;
  byMonth: Array<{
    month: string;
    rate: number;
    leads: number;
    conversions: number;
  }>;
}

export const analyticsService = {
  /**
   * Get summary stats for dashboard
   */
  async getSummary(): Promise<AnalyticsSummary> {
    const response = await api.get("/vendors/analytics/summary");
    return response.data.data;
  },

  /**
   * Get profile views over time
   */
  async getViews(period: "week" | "month" | "year"): Promise<ViewsData[]> {
    const response = await api.get("/vendors/analytics/views", {
      params: { period },
    });
    return response.data.data.views;
  },

  /**
   * Get lead statistics
   */
  async getLeadStats(): Promise<LeadStats> {
    const response = await api.get("/vendors/analytics/leads");
    return response.data.data;
  },

  /**
   * Get conversion rates
   */
  async getConversionRates(): Promise<ConversionRates> {
    const response = await api.get("/vendors/analytics/conversion");
    return response.data.data;
  },

  /**
   * Get trends over time (Professional+)
   */
  async getTrends(params: { period: string; metric: string }): Promise<any> {
    const response = await api.get("/vendors/analytics/trends", { params });
    return response.data.data;
  },

  /**
   * Get lead sources (Professional+)
   */
  async getLeadSources(): Promise<
    Array<{
      source: string;
      count: number;
      percentage: number;
      conversionRate: number;
    }>
  > {
    const response = await api.get("/vendors/analytics/sources");
    return response.data.data.sources;
  },

  /**
   * Get revenue tracking (Professional+)
   */
  async getRevenue(params?: { startDate?: string; endDate?: string }): Promise<{
    total: number;
    byPeriod: Array<{
      period: string;
      revenue: number;
      bookings: number;
    }>;
    byEventType: Array<{
      eventType: string;
      revenue: number;
      bookings: number;
    }>;
  }> {
    const response = await api.get("/vendors/analytics/revenue", { params });
    return response.data.data;
  },

  /**
   * Get performance metrics (Professional+)
   */
  async getPerformance(): Promise<{
    responseTime: {
      average: number;
      median: number;
      fastest: number;
      slowest: number;
    };
    responseRate: number;
    bookingRate: number;
    customerSatisfaction: number;
    repeatCustomerRate: number;
  }> {
    const response = await api.get("/vendors/analytics/performance");
    return response.data.data;
  },

  /**
   * Export analytics data (Professional+)
   */
  async exportData(format: "csv" | "pdf"): Promise<Blob> {
    const response = await api.get("/vendors/analytics/export", {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },
};

export default analyticsService;
