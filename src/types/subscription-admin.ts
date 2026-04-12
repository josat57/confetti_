// Subscription & Billing Types for Admin

export type SubscriptionTier = "free" | "basic" | "professional" | "enterprise";

export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "past_due"
  | "trialing"
  | "paused";

export type PaymentStatus =
  | "paid"
  | "pending"
  | "failed"
  | "refunded"
  | "disputed";

export type PaymentMethod =
  | "card"
  | "bank_transfer"
  | "mobile_money"
  | "paystack"
  | "flutterwave";

export interface Subscription {
  _id: string;
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string; // Computed field for display
    role?: string;
  };
  planType: "planner" | "vendor";
  planName: string;
  status: string; // "active" | "pending_payment" | "cancelled" | "expired"
  startDate: string | Date;
  endDate: string | Date;
  paymentProvider: "flutterwave" | "paystack" | "none";
  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  autoRenew: boolean;
  usage: {
    eventsCreated: number;
    photosUploaded: number;
    lastResetDate: string | Date;
  };
  history: Array<{
    planName: string;
    status: string;
    startDate: string | Date;
    endDate: string | Date;
    amount: number;
    changeType: string;
    _id: string;
    createdAt: string | Date;
    proratedAmount?: number;
    reason?: string;
  }>;
  paymentHistory: Array<{
    payment: string;
    amount: number;
    status: string;
    paidAt: string | Date;
    type: string;
    _id: string;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
  __v?: number;
  paymentId?: string;
  currentPaymentId?: any;
  pendingUpgrade?: {
    newPlanName: string;
    amount: number;
    proratedAmount: number;
  };
  // Legacy fields for backward compatibility
  tier?: SubscriptionTier;
  renewalDate?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  price?: number;
  paymentMethod?: PaymentMethod;
  trialEndsAt?: Date;
  features?: string[];
  limits?: {
    events?: number;
    guests?: number;
    vendors?: number;
    storage?: number; // in MB
  };
}

export interface PaymentHistory {
  _id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  gatewayResponse?: any;
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  createdAt: Date;
}

export interface SubscriptionChange {
  _id: string;
  subscriptionId: string;
  userId: string;
  changeType: "upgrade" | "downgrade" | "cancel" | "reactivate" | "pause";
  fromTier?: SubscriptionTier;
  toTier?: SubscriptionTier;
  proratedAmount?: number;
  effectiveDate: Date;
  reason?: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: Date;
}

export interface FailedPayment {
  _id: string;
  subscriptionId: string;
  userId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  failureReason: string;
  retryAttempts: number;
  lastRetryAt?: Date;
  nextRetryAt?: Date;
  failedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface RefundRequest {
  subscriptionId: string;
  paymentId: string;
  amount: number;
  reason: string;
  refundType: "full" | "partial";
}

// Backend statistics response structure
export interface BackendSubscriptionStats {
  total: number;
  byStatus: Array<{ _id: string; count: number }>;
  byPlanType: Array<{ _id: string; count: number }>;
  byPlanName: Array<{
    _id: { planType: string; planName: string };
    count: number;
  }>;
  revenue: {
    monthly: { _id: null; total: number; count: number };
    yearly: { _id: null; total: number; count: number };
    byPlan: Array<{ _id: string; revenue: number; count: number }>;
  };
  expiringSubscriptions: any[];
}

// Frontend statistics structure (computed from backend data)
export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  trialingSubscriptions: number;
  byTier: {
    [key in SubscriptionTier]: number;
  };
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  averageLifetimeValue: number;
  totalRevenue: number;
  revenueByTier: {
    [key in SubscriptionTier]: number;
  };
  revenueByPaymentMethod: {
    [key in PaymentMethod]?: number;
  };
  failedPaymentsCount: number;
  pendingRefunds: number;
}

export interface RevenueReport {
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  revenueByTier: {
    [key in SubscriptionTier]: number;
  };
  revenueByPaymentMethod: {
    [key in PaymentMethod]?: number;
  };
  newSubscriptions: number;
  cancelledSubscriptions: number;
  upgrades: number;
  downgrades: number;
  refunds: number;
  refundAmount: number;
  netRevenue: number;
  growthRate: number;
}

export interface DiscountCoupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  currency?: string;
  applicableTiers: SubscriptionTier[];
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  active: boolean;
  createdBy: string;
  createdAt: Date;
}
