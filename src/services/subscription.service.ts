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
  pendingChange?: {
    planName: string;
    billingCycle?: "monthly" | "yearly";
    effectiveAt: Date;
  };
  cancelAtPeriodEnd?: boolean;
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

export type BillingCycle = "monthly" | "yearly";

export interface PlanPrice {
  currency: string;
  amount: number;
  amountInMinorUnits: number;
}

export interface UsageMeter {
  used: number;
  /** null = unlimited, 0 = not included */
  limit: number | null;
  label: string;
}

export interface UsageSummary {
  planType: "vendor" | "planner" | "client";
  plan: { key: string; displayName: string; level: number; features: Record<string, boolean> } | null;
  subscription: {
    _id: string;
    planName: string;
    status: Subscription["status"];
    billingCycle: BillingCycle;
    endDate: string;
  } | null;
  usage: Record<string, UsageMeter>;
}

export interface ChangePlanResult {
  action: "payment_required" | "scheduled" | "changed";
  subscription: Subscription;
  paymentUrl?: string;
  reference?: string;
  amountDue?: number;
  currency?: string;
  effectiveAt?: string;
  freeUntil?: string;
}

// API: confetti_server routes/subscription.routes.js (my-subscription endpoints)
export const subscriptionService = {
  /**
   * Get current user's subscription
   */
  async getMySubscription(): Promise<Subscription> {
    const response = await api.get("/subscriptions/current");
    return response.data.data.subscription;
  },

  /**
   * Active plans with monthly and yearly prices
   */
  async getPlans(params?: {
    planType?: "vendor" | "planner";
    currency?: string;
  }): Promise<Array<SubscriptionPlan & { yearlyPricing?: Array<PlanPrice | null> }>> {
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
   * Change plan. Upgrades return a paymentUrl (the change applies once paid);
   * cheaper plans are scheduled for the end of the paid period.
   */
  async changePlan(data: {
    planId?: string;
    planName?: string;
    billingCycle?: BillingCycle;
    paymentProvider?: "flutterwave" | "paystack";
    currency?: string;
    couponCode?: string;
  }): Promise<ChangePlanResult> {
    const response = await api.post("/subscriptions/change-plan", data);
    return response.data.data;
  },

  /** Older name for changePlan */
  async upgrade(data: {
    newPlanId: string;
    paymentMethod: "flutterwave" | "paystack";
    billingCycle?: BillingCycle;
  }): Promise<ChangePlanResult> {
    const response = await api.post("/subscriptions/upgrade", data);
    return response.data.data;
  },

  /** Older name for changePlan (cheaper plan, applied at period end) */
  async downgrade(data: { newPlanId: string; reason?: string }): Promise<Subscription> {
    const response = await api.post("/subscriptions/downgrade", data);
    return response.data.data.subscription;
  },

  /**
   * Cancel: the plan stays until the end of the paid period
   */
  async cancel(data: { reason: string; feedback?: string }): Promise<Subscription> {
    const response = await api.post("/subscriptions/cancel", data);
    return response.data.data.subscription;
  },

  /**
   * Undo a cancellation or a scheduled plan change
   */
  async reactivate(): Promise<Subscription> {
    const response = await api.post("/subscriptions/reactivate");
    return response.data.data.subscription;
  },

  /**
   * Plan, limits and current usage
   */
  async getUsage(): Promise<UsageSummary> {
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
