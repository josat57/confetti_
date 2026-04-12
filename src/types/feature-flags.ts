// Feature Flags & A/B Testing Types

export interface FeatureFlag {
  _id: string;
  name: string;
  key: string;
  description?: string;
  enabled: boolean;
  type: "boolean" | "rollout" | "experiment";
  status: "active" | "inactive" | "archived";
  targeting: {
    userIds?: string[];
    userGroups?: string[];
    percentage?: number;
    rules?: TargetingRule[];
  };
  rollout?: {
    percentage: number;
    startDate: Date;
    endDate?: Date;
    increments: number;
    currentPercentage: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
  usage: {
    totalChecks: number;
    enabledChecks: number;
    disabledChecks: number;
    uniqueUsers: number;
  };
  metadata?: Record<string, any>;
}

export interface TargetingRule {
  attribute: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "in"
    | "not_in";
  value: any;
}

export interface ABTest {
  _id: string;
  name: string;
  description?: string;
  featureFlagId?: string;
  status: "draft" | "running" | "paused" | "completed" | "archived";
  variants: ABTestVariant[];
  trafficAllocation: {
    [variantId: string]: number; // percentage
  };
  targeting: {
    userIds?: string[];
    userGroups?: string[];
    rules?: TargetingRule[];
  };
  metrics: {
    primary: string;
    secondary?: string[];
  };
  startDate?: Date;
  endDate?: Date;
  duration?: number; // in days
  results?: ABTestResults;
  winner?: string; // variant ID
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description?: string;
  isControl: boolean;
  config?: Record<string, any>;
}

export interface ABTestResults {
  totalParticipants: number;
  variantResults: {
    [variantId: string]: VariantResult;
  };
  statisticalSignificance: number;
  confidenceLevel: number;
  winner?: string;
  recommendation?: string;
}

export interface VariantResult {
  participants: number;
  conversions: number;
  conversionRate: number;
  averageValue?: number;
  standardDeviation?: number;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
}

export interface FeatureUsageAnalytics {
  featureFlagId: string;
  featureName: string;
  adoptionRate: number;
  totalUsers: number;
  activeUsers: number;
  errorRate: number;
  totalErrors: number;
  averageLoadTime?: number;
  userFeedback?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  usageOverTime: {
    date: Date;
    users: number;
    checks: number;
  }[];
}

export interface FeatureFlagFilters {
  status?: "active" | "inactive" | "archived";
  type?: "boolean" | "rollout" | "experiment";
  enabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ABTestFilters {
  status?: "draft" | "running" | "paused" | "completed" | "archived";
  search?: string;
  page?: number;
  limit?: number;
}

export interface FeatureFlagListResponse {
  flags: FeatureFlag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ABTestListResponse {
  tests: ABTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateFeatureFlagRequest {
  name: string;
  key: string;
  description?: string;
  type: "boolean" | "rollout" | "experiment";
  enabled?: boolean;
  targeting?: {
    userIds?: string[];
    userGroups?: string[];
    percentage?: number;
    rules?: TargetingRule[];
  };
  rollout?: {
    percentage: number;
    startDate: Date;
    endDate?: Date;
    increments: number;
  };
}

export interface CreateABTestRequest {
  name: string;
  description?: string;
  featureFlagId?: string;
  variants: {
    name: string;
    description?: string;
    isControl: boolean;
    config?: Record<string, any>;
  }[];
  trafficAllocation: {
    [variantName: string]: number;
  };
  targeting?: {
    userIds?: string[];
    userGroups?: string[];
    rules?: TargetingRule[];
  };
  metrics: {
    primary: string;
    secondary?: string[];
  };
  duration?: number;
}

export interface UpdateFeatureFlagRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
  targeting?: {
    userIds?: string[];
    userGroups?: string[];
    percentage?: number;
    rules?: TargetingRule[];
  };
}

export interface RolloutConfig {
  percentage: number;
  increments: number;
  startDate: Date;
  endDate?: Date;
}
