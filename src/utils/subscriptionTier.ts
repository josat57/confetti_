// Subscription tier utilities

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

  if (!tierHierarchy[normalizedCurrentTier]) {
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
    basic: "Basic",
    professional: "Professional",
    business: "Business",
    enterprise: "Enterprise",
  };

  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return tierNames[normalizedTier] || "Basic";
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
      "Profile Management",
      "5 Event Listings/month",
      "Basic Analytics",
      "Customer Reviews",
      "Search Visibility",
    ],
    professional: [
      "All Basic Features",
      "Unlimited Event Listings",
      "Booking Calendar",
      "Lead Management",
      "Quote Builder",
      "Advanced Analytics",
      "Email Notifications",
      "Featured in Search",
    ],
    business: [
      "All Professional Features",
      "Team Collaboration (5 members)",
      "Payment Processing",
      "CRM System",
      "Email Marketing",
      "Document Storage (10GB)",
      "Custom Packages",
    ],
    enterprise: [
      "All Business Features",
      "Unlimited Team Members",
      "API Access",
      "White-Label Options",
      "Advanced Security (2FA, SSO)",
      "Multi-Location Management",
      "Advanced Financial Reporting",
      "Dedicated Account Manager",
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
    professional: { amount: 75362, currency: "NGN", period: "month" },
    business: { amount: 152262, currency: "NGN", period: "month" },
    enterprise: { amount: 304524, currency: "NGN", period: "month" },
  };

  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return pricing[normalizedTier] || pricing.basic;
}

/**
 * Get tier limits
 */
export function getTierLimits(tier: string): {
  eventListings: number | "unlimited";
  teamMembers: number | "unlimited";
  storage: string;
} {
  const limits: Record<
    SubscriptionTier,
    {
      eventListings: number | "unlimited";
      teamMembers: number | "unlimited";
      storage: string;
    }
  > = {
    basic: {
      eventListings: 5,
      teamMembers: 1,
      storage: "1GB",
    },
    professional: {
      eventListings: "unlimited",
      teamMembers: 1,
      storage: "5GB",
    },
    business: {
      eventListings: "unlimited",
      teamMembers: 5,
      storage: "10GB",
    },
    enterprise: {
      eventListings: "unlimited",
      teamMembers: "unlimited",
      storage: "unlimited",
    },
  };

  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return limits[normalizedTier] || limits.basic;
}
