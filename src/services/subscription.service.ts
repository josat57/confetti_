/**
 * Subscription Service
 * Handles subscription and plan management API calls
 */

import api from "@/api/api";

export interface Subscription {
  _id: string;
  user: string;
  planType: "vendor" | "planner";
  planName: string;
  status: "pending_payment" | "active" | "trial" | "cancelled" | "expired";
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;
  paymentProvider: "flutterwave" | "paystack" | "none";
  paymentId?: string;
  currentPaymentId?: string;
  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  autoRenew: boolean;
  usage: {
    eventsCreated: number;
    photosUploaded: number;
    lastResetDate: Date;
  };
  paymentHistory: Array<{
    payment: string;
    amount: number;
    status: string;
    paidAt: Date;
    type: "initial" | "renewal" | "upgrade" | "downgrade";
  }>;
  history: Array<{
    planName: string;
    status: string;
    startDate: Date;
    endDate: Date;
    amount: number;
    changeType:
      | "created"
      | "activated"
      | "upgrade"
      | "downgrade"
      | "cancellation"
      | "renewal"
      | "expired";
    reason?: string;
    createdAt: Date;
  }>;
  cancellationDetails?: {
    cancelledAt: Date;
    reason: string;
    feedback: string;
  };
  pendingUpgrade?: {
    newPlanName: string;
    amount: number;
    proratedAmount: number;
    paymentReference: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  _id: string;
  planName: string;
  displayName: string;
  planType: "vendor" | "planner";
  pricing: Array<{
    currency: string;
    amount: number;
    amountInMinorUnits: number;
    _id: string;
  }>;
  billingCycle: "monthly" | "yearly";
  features: string[];
  limitations?: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const subscriptionService = {
  /**
   * Get current user's subscription
   */
  async getMySubscription(): Promise<Subscription> {
    const response = await api.get("/subscriptions/current");
    return response.data.data.subscription;
  },

  /**
   * Get all available subscription plans
   */
  async getPlans(params?: {
    planType?: "vendor" | "planner";
    currency?: string;
  }): Promise<SubscriptionPlan[]> {
    const response = await api.get("/subscription-plans", { params });
    return response.data.data?.plans || response.data.plans;
  },

  /**
   * Get specific plan details
   */
  async getPlanById(planId: string): Promise<SubscriptionPlan> {
    const response = await api.get(`/subscription-plans/${planId}`);
    return response.data.data.plan;
  },

  /**
   * Upgrade subscription
   */
  async upgrade(data: {
    newPlanId: string;
    paymentMethod: "flutterwave" | "paystack";
  }): Promise<{
    subscription: Subscription;
    paymentUrl?: string;
    paymentReference?: string;
  }> {
    const response = await api.post("/subscriptions/upgrade", data);
    return response.data.data;
  },

  /**
   * Downgrade subscription
   */
  async downgrade(data: {
    newPlanId: string;
    reason?: string;
  }): Promise<Subscription> {
    const response = await api.post("/subscriptions/downgrade", data);
    return response.data.data.subscription;
  },

  /**
   * Cancel subscription
   */
  async cancel(data: {
    reason: string;
    feedback?: string;
  }): Promise<Subscription> {
    const response = await api.post("/subscriptions/cancel", data);
    return response.data.data.subscription;
  },

  /**
   * Reactivate cancelled subscription
   */
  async reactivate(): Promise<Subscription> {
    const response = await api.post("/subscriptions/reactivate");
    return response.data.data.subscription;
  },

  /**
   * Get subscription usage
   */
  async getUsage(): Promise<{
    eventsCreated: number;
    photosUploaded: number;
    limits: {
      eventsPerMonth: number;
      photosPerEvent: number;
    };
    percentageUsed: {
      events: number;
      photos: number;
    };
  }> {
    const response = await api.get("/subscriptions/usage");
    return response.data.data;
  },

  /**
   * Get subscription history
   */
  async getHistory(): Promise<
    Array<{
      planName: string;
      status: string;
      startDate: Date;
      endDate: Date;
      amount: number;
      changeType: string;
      reason?: string;
      createdAt: Date;
    }>
  > {
    const response = await api.get("/subscriptions/history");
    return response.data.data.history;
  },

  /**
   * Verify payment
   */
  async verifyPayment(data: {
    paymentReference: string;
    provider: "flutterwave" | "paystack";
  }): Promise<{
    verified: boolean;
    subscription: Subscription;
  }> {
    const response = await api.post("/subscriptions/verify-payment", data);
    return response.data.data;
  },
};

export default subscriptionService;
