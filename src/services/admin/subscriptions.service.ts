import axios from "axios";
import {
  Subscription,
  PaymentHistory,
  SubscriptionChange,
  FailedPayment,
  RefundRequest,
  SubscriptionStats,
  BackendSubscriptionStats,
  RevenueReport,
  DiscountCoupon,
  SubscriptionTier,
} from "@/types/subscription-admin";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies for admin authentication
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Authentication failed - redirect to admin login
      console.error("Authentication failed:", error.response?.data?.message);
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

class SubscriptionsService {
  private baseUrl = "/admin/subscriptions";

  /**
   * Get all subscriptions with filtering
   */
  async getSubscriptions(params?: {
    tier?: SubscriptionTier;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    subscriptions: Subscription[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.tier) queryParams.append("tier", params.tier);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await api.get(url);
    // Backend returns { status, data: { subscriptions, pagination } }
    return {
      subscriptions: response.data.data.subscriptions,
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      pages: response.data.data.pagination.pages,
    };
  }

  /**
   * Get subscription details by ID
   */
  async getSubscriptionById(
    subscriptionId: string
  ): Promise<{ subscription: Subscription }> {
    const response = await api.get(`${this.baseUrl}/${subscriptionId}`);
    return response.data;
  }

  /**
   * Get payment history for a subscription
   */
  async getPaymentHistory(
    subscriptionId: string
  ): Promise<{ payments: PaymentHistory[] }> {
    const response = await api.get(
      `${this.baseUrl}/${subscriptionId}/payments`
    );
    // Backend returns { status, data: { payments } }
    return { payments: response.data.data?.payments || [] };
  }

  /**
   * Manually upgrade a subscription
   */
  async upgradeSubscription(
    subscriptionId: string,
    newTier: SubscriptionTier,
    reason?: string
  ): Promise<{
    subscription: Subscription;
    proratedAmount: number;
    message: string;
  }> {
    const response = await api.post(
      `${this.baseUrl}/${subscriptionId}/upgrade`,
      {
        newTier,
        reason,
      }
    );
    // Backend returns { status, data: { subscription, proratedAmount }, message }
    return {
      subscription: response.data.data.subscription,
      proratedAmount: response.data.data.proratedAmount,
      message: response.data.message,
    };
  }

  /**
   * Manually downgrade a subscription
   */
  async downgradeSubscription(
    subscriptionId: string,
    newTier: SubscriptionTier,
    reason?: string
  ): Promise<{
    subscription: Subscription;
    effectiveDate: Date;
    message: string;
  }> {
    const response = await api.post(
      `${this.baseUrl}/${subscriptionId}/downgrade`,
      {
        newTier,
        reason,
      }
    );
    // Backend returns { status, data: { subscription, effectiveDate }, message }
    return {
      subscription: response.data.data.subscription,
      effectiveDate: response.data.data.effectiveDate,
      message: response.data.message,
    };
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    reason: string,
    immediate: boolean = false
  ): Promise<{ subscription: Subscription; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/${subscriptionId}/cancel`,
      {
        reason,
        immediate,
      }
    );
    // Backend returns { status, data: { subscription }, message }
    return {
      subscription: response.data.data.subscription,
      message: response.data.message,
    };
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(
    subscriptionId: string
  ): Promise<{ subscription: Subscription; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/${subscriptionId}/reactivate`
    );
    // Backend returns { status, data: { subscription }, message }
    return {
      subscription: response.data.data.subscription,
      message: response.data.message,
    };
  }

  /**
   * Issue a refund
   */
  async issueRefund(
    refundRequest: RefundRequest
  ): Promise<{ refund: PaymentHistory; message: string }> {
    const response = await api.post(`${this.baseUrl}/refund`, refundRequest);
    return response.data;
  }

  /**
   * Get failed payments
   */
  async getFailedPayments(params?: {
    resolved?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    failedPayments: FailedPayment[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.resolved !== undefined)
      queryParams.append("resolved", params.resolved.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/failed-payments?${queryString}`
      : `${this.baseUrl}/failed-payments`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Retry a failed payment
   */
  async retryPayment(
    failedPaymentId: string
  ): Promise<{ payment: PaymentHistory; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/failed-payments/${failedPaymentId}/retry`
    );
    return response.data;
  }

  /**
   * Apply a discount to a subscription
   */
  async applyDiscount(
    subscriptionId: string,
    couponCode: string
  ): Promise<{
    subscription: Subscription;
    discount: number;
    message: string;
  }> {
    const response = await api.post(
      `${this.baseUrl}/${subscriptionId}/apply-discount`,
      {
        couponCode,
      }
    );
    return response.data;
  }

  /**
   * Create a discount coupon
   */
  async createCoupon(
    coupon: Omit<DiscountCoupon, "_id" | "usedCount" | "createdAt">
  ): Promise<{ coupon: DiscountCoupon; message: string }> {
    const response = await api.post(`${this.baseUrl}/coupons`, coupon);
    return response.data;
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStatistics(): Promise<{
    statistics: SubscriptionStats;
  }> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    return response.data;
  }

  /**
   * Get subscription statistics (alias for backward compatibility)
   */
  async getSubscriptionStats(): Promise<{ stats: SubscriptionStats }> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    // Backend returns { status, data: { statistics } }
    const backendStats = response.data.data.statistics;

    // Transform backend stats to frontend format
    const statusMap = backendStats.byStatus.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const stats: SubscriptionStats = {
      totalSubscriptions: backendStats.total,
      activeSubscriptions: statusMap.active || 0,
      cancelledSubscriptions: statusMap.cancelled || 0,
      expiredSubscriptions: statusMap.expired || 0,
      trialingSubscriptions: statusMap.trialing || statusMap.trial || 0,
      byTier: {
        free: 0,
        basic: 0,
        professional: 0,
        enterprise: 0,
      },
      monthlyRecurringRevenue: backendStats.revenue.monthly.total || 0,
      annualRecurringRevenue: backendStats.revenue.yearly.total || 0,
      churnRate:
        backendStats.total > 0
          ? ((statusMap.cancelled || 0) / backendStats.total) * 100
          : 0,
      averageLifetimeValue:
        backendStats.total > 0
          ? (backendStats.revenue.yearly.total || 0) / backendStats.total
          : 0,
      totalRevenue: backendStats.revenue.yearly.total || 0,
      revenueByTier: {
        free: 0,
        basic: 0,
        professional: 0,
        enterprise: 0,
      },
      revenueByPaymentMethod: {},
      failedPaymentsCount: statusMap.failed || 0,
      pendingRefunds: 0,
    };

    // Map plan names to tiers
    backendStats.byPlanName.forEach((item: any) => {
      const planName = item._id.planName.toLowerCase();
      if (planName === "starter" || planName === "free") {
        stats.byTier.free += item.count;
      } else if (planName === "basic") {
        stats.byTier.basic += item.count;
      } else if (planName === "professional") {
        stats.byTier.professional += item.count;
      } else if (planName === "business" || planName === "enterprise") {
        stats.byTier.enterprise += item.count;
      }
    });

    // Map revenue by plan to tiers
    backendStats.revenue.byPlan.forEach((item: any) => {
      const planName = item._id.toLowerCase();
      if (planName === "starter" || planName === "free") {
        stats.revenueByTier.free += item.revenue;
      } else if (planName === "basic") {
        stats.revenueByTier.basic += item.revenue;
      } else if (planName === "professional") {
        stats.revenueByTier.professional += item.revenue;
      } else if (planName === "business" || planName === "enterprise") {
        stats.revenueByTier.enterprise += item.revenue;
      }
    });

    return { stats };
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<{ report: RevenueReport }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.groupBy) queryParams.append("groupBy", params.groupBy);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/revenue?${queryString}`
      : `${this.baseUrl}/revenue`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get subscription change history
   */
  async getSubscriptionChanges(
    subscriptionId: string
  ): Promise<{ changes: SubscriptionChange[] }> {
    const response = await api.get(`${this.baseUrl}/${subscriptionId}/changes`);
    // Backend returns { status, data: { changes } }
    return { changes: response.data.data?.changes || [] };
  }

  /**
   * Export subscriptions to CSV
   */
  async exportSubscriptions(params?: {
    tier?: SubscriptionTier;
    status?: string;
  }): Promise<{ downloadUrl: string }> {
    const queryParams = new URLSearchParams();
    if (params?.tier) queryParams.append("tier", params.tier);
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/export?${queryString}`
      : `${this.baseUrl}/export`;

    const response = await api.get(url);
    return response.data;
  }
}

export default new SubscriptionsService();
