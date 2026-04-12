// Plan Management Types for Admin

export type PlanType = "planner" | "vendor";
export type BillingCycle = "monthly" | "yearly";

export interface PlanPricing {
  currency: string;
  amount: number;
  amountInMinorUnits: number;
  _id: string;
}

export interface PlanFeature {
  name: string;
  description?: string;
  enabled: boolean;
  limit?: number | string;
}

// Backend plan structure
export interface Plan {
  _id: string;
  planType: PlanType;
  planName: string;
  displayName: string;
  description: string;
  billingCycle: BillingCycle;
  pricing: PlanPricing[];
  features: string[];
  limitations: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  __v?: number;

  // Legacy fields for backward compatibility
  name?: string;
  price?: number;
  currency?: string;
  limits?: {
    events?: number;
    guests?: number;
    vendors?: number;
    storage?: number;
    teamMembers?: number;
    customBranding?: boolean;
    analytics?: boolean;
    apiAccess?: boolean;
  };
  displayOrder?: number;
  trialDays?: number;
}

export interface CreatePlanRequest {
  planType: PlanType;
  planName: string;
  displayName: string;
  description: string;
  billingCycle: BillingCycle;
  pricing: Array<{
    currency: string;
    amount: number;
    amountInMinorUnits: number;
  }>;
  features: string[];
  limitations: string[];
  isActive: boolean;
  isPopular?: boolean;
  sortOrder: number;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  _id?: string;
}

export interface PlanStats {
  totalPlans: number;
  activePlans: number;
  inactivePlans: number;
  byPlanType: {
    planner: number;
    vendor: number;
  };
  totalSubscribers: number;
  subscribersByPlan: Array<{
    planId: string;
    planName: string;
    count: number;
  }>;
}
