// Coupon & Promotion Management Types

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  currency?: string;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit: {
    total?: number;
    perUser?: number;
  };
  usageCount: number;
  targetAudience: CouponTargetAudience;
  startDate: Date;
  expiryDate: Date;
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  analytics?: CouponAnalytics;
}

export interface CouponTargetAudience {
  type: "all" | "tier" | "role" | "custom";
  tiers?: ("free" | "basic" | "professional" | "enterprise")[];
  roles?: ("event-planner" | "vendor" | "user")[];
  userIds?: string[];
}

export interface CouponAnalytics {
  totalUsage: number;
  uniqueUsers: number;
  totalRevenue: number;
  totalDiscount: number;
  revenueImpact: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface Promotion {
  _id: string;
  title: string;
  description: string;
  type: "banner" | "popup" | "badge";
  discountText: string;
  couponCode?: string;
  targetPage: "pricing" | "home" | "dashboard" | "all";
  priority: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
  displaySettings: {
    backgroundColor?: string;
    textColor?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  analytics?: PromotionAnalytics;
}

export interface PromotionAnalytics {
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
}

export interface CreateCouponRequest {
  code?: string;
  name: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  currency?: string;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: {
    total?: number;
    perUser?: number;
  };
  targetAudience: CouponTargetAudience;
  startDate: Date;
  expiryDate: Date;
}

export interface CreatePromotionRequest {
  title: string;
  description: string;
  type: "banner" | "popup" | "badge";
  discountText: string;
  couponCode?: string;
  targetPage: "pricing" | "home" | "dashboard" | "all";
  priority?: number;
  startDate: Date;
  endDate: Date;
  displaySettings?: {
    backgroundColor?: string;
    textColor?: string;
    buttonText?: string;
    buttonLink?: string;
  };
}

export interface CouponFilters {
  active?: boolean;
  discountType?: "percentage" | "fixed";
  targetType?: "all" | "tier" | "role" | "custom";
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PromotionFilters {
  active?: boolean;
  type?: "banner" | "popup" | "badge";
  targetPage?: "pricing" | "home" | "dashboard" | "all";
  page?: number;
  limit?: number;
}

export interface CouponListResponse {
  coupons: Coupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PromotionListResponse {
  promotions: Promotion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUsage: number;
  totalRevenue: number;
  totalDiscount: number;
  averageConversionRate: number;
  topCoupons: Array<{
    code: string;
    usage: number;
    revenue: number;
  }>;
}

export interface ValidateCouponRequest {
  code: string;
  userId?: string;
  orderAmount?: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}
