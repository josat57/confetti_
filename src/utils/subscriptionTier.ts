// Subscription tier utilities (vendor plans).
// Internal tier keys stay stable; they map to the plans sold today:
// basic = Listing, professional = Pro, business = Business, enterprise = Venue.
// Limits are enforced by the API (PLAN_LIMIT_REACHED); these are for display.

export type SubscriptionTier =
  | "basic"
  | "professional"
  | "business"
  | "enterprise";

// Tier hierarchy for comparison
const tierHierarchy: Record<SubscriptionTier, number> = {
  basic: 0,
  professional: 1,
  business: 2,
  enterprise: 3,
};

/**
 * Check if a user has access to a feature based on their subscription tier
 */
export function hasFeatureAccess(
  currentTier: string,
  requiredTier: SubscriptionTier
): boolean {
  const normalizedCurrentTier = currentTier.toLowerCase() as SubscriptionTier;

  // basic is level 0, so check membership rather than truthiness
  if (!(normalizedCurrentTier in tierHierarchy)) {
    return false;
  }

  return tierHierarchy[normalizedCurrentTier] >= tierHierarchy[requiredTier];
}

/**
 * Get the tier level number
 */
export function getTierLevel(tier: string): number {
  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return tierHierarchy[normalizedTier] ?? 0;
}

/**
 * Check if a tier is higher than another
 */
export function isTierHigher(tier1: string, tier2: string): boolean {
  return getTierLevel(tier1) > getTierLevel(tier2);
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: string): string {
  const tierNames: Record<SubscriptionTier, string> = {
    basic: "Listing",
    professional: "Pro",
    business: "Business",
    enterprise: "Venue",
  };

  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return tierNames[normalizedTier] || "Listing";
}

/**
 * Get tier color for badges
 */
export function getTierColor(tier: string): string {
  const tierColors: Record<SubscriptionTier, string> = {
    basic: "bg-gray-100 text-gray-800",
    professional: "bg-blue-100 text-blue-800",
    business: "bg-purple-100 text-purple-800",
    enterprise: "bg-yellow-100 text-yellow-800",
  };

  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return tierColors[normalizedTier] || tierColors.basic;
}

/**
 * Get features available for a tier
 */
export function getTierFeatures(tier: string): string[] {
  const features: Record<SubscriptionTier, string[]> = {
    basic: [
      "Profile and 10 portfolio photos",
      "5 lead replies a month",
      "Reviews",
      "5% per booking",
    ],
    professional: [
      "Unlimited leads, quotes and invoices",
      "Availability calendar and CRM",
      "Verified badge after an ID check",
      "Basic analytics",
      "3% per booking",
    ],
    business: [
      "Everything in Pro",
      "Team of up to 5",
      "Featured placement credits",
      "AI proposal writer, advanced analytics",
      "2% per booking",
    ],
    enterprise: [
      "Everything in Business",
      "Venue calendar and booking management",
      "Featured venue listing",
      "Holds and deposit tracking",
      "2% per booking",
    ],
  };


  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return features[normalizedTier] || features.basic;
}

/**
 * Get tier pricing
 */
export function getTierPricing(tier: string): {
  amount: number;
  currency: string;
  period: string;
} {
  const pricing: Record<
    SubscriptionTier,
    { amount: number; currency: string; period: string }
  > = {
    basic: { amount: 0, currency: "NGN", period: "month" },
    professional: { amount: 7500, currency: "NGN", period: "month" },
    business: { amount: 20000, currency: "NGN", period: "month" },
    enterprise: { amount: 30000, currency: "NGN", period: "month" },
  };

  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return pricing[normalizedTier] || pricing.basic;
}

/**
 * Get tier limits
 */
export function getTierLimits(tier: string): {
  portfolioPhotos: number | "unlimited";
  leadRepliesPerMonth: number | "unlimited";
  teamMembers: number | "unlimited";
} {
  const limits: Record<
    SubscriptionTier,
    {
      portfolioPhotos: number | "unlimited";
      leadRepliesPerMonth: number | "unlimited";
      teamMembers: number | "unlimited";
    }
  > = {
    basic: { portfolioPhotos: 10, leadRepliesPerMonth: 5, teamMembers: 0 },
    professional: { portfolioPhotos: "unlimited", leadRepliesPerMonth: "unlimited", teamMembers: 0 },
    business: { portfolioPhotos: "unlimited", leadRepliesPerMonth: "unlimited", teamMembers: 5 },
    enterprise: { portfolioPhotos: "unlimited", leadRepliesPerMonth: "unlimited", teamMembers: 5 },
  };

  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return limits[normalizedTier] || limits.basic;
}
