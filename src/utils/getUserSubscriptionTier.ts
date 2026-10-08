/**
 * Utility to extract subscription tier from user object
 * Handles different possible data structures from backend
 *
 * Backend structure:
 * - user.subscription can be either:
 *   1. ObjectId string (not populated)
 *   2. Populated Subscription object with planName field
 */

export function getUserSubscriptionTier(user: any): string {
  if (!user) return "basic";

  // Check if subscription is populated (object) or just an ID (string)
  if (user.subscription && typeof user.subscription === "object") {
    // Subscription is populated - get planName
    if (user.subscription.planName) {
      return normalizeSubscriptionTier(user.subscription.planName);
    }

    // Fallback to status check
    if (user.subscription.status === "active" && user.subscription.planType) {
      // If we have planType but no planName, return basic for now
      return "basic";
    }
  }

  // Legacy support for old field names (in case they exist)
  if (user.subscriptionTier) {
    return normalizeSubscriptionTier(user.subscriptionTier);
  }

  if (user.subscriptionPlan?.tier) {
    return normalizeSubscriptionTier(user.subscriptionPlan.tier);
  }

  if (user.subscription_tier) {
    return normalizeSubscriptionTier(user.subscription_tier);
  }

  if (user.planName) {
    return normalizeSubscriptionTier(user.planName);
  }

  // Default to basic if nothing found
  return "basic";
}

/**
 * Normalize subscription tier to standard format
 * Handles variations like "Professional", "PROFESSIONAL", "professional_plan", etc.
 */
function normalizeSubscriptionTier(tier: string): string {
  if (!tier) return "basic";

  const normalized = tier.toLowerCase().trim();

  // Map plan names (current and older) to tier keys:
  // Venue/Enterprise → enterprise, Business → business, Pro/Professional → professional,
  // Listing/Basic/Free → basic
  if (normalized.includes("venue") || normalized.includes("enterprise")) return "enterprise";
  if (normalized.includes("business")) return "business";
  if (normalized.includes("professional") || normalized.includes("pro"))
    return "professional";
  if (normalized.includes("listing") || normalized.includes("basic") || normalized.includes("free"))
    return "basic";

  // If it's already a valid tier, return it
  const validTiers = ["basic", "professional", "business", "enterprise"];
  if (validTiers.includes(normalized)) {
    return normalized;
  }

  // Default to basic for unknown tiers
  return "basic";
}

/**
 * Check if user has an active subscription
 */
export function hasActiveSubscription(user: any): boolean {
  if (!user) return false;

  // Check subscription status
  const status =
    user.subscriptionStatus ||
    user.subscription_status ||
    user.subscriptionPlan?.status ||
    user.subscription?.status;

  return status === "active" || status === "Active" || status === "ACTIVE";
}

/**
 * Get subscription expiry date
 */
export function getSubscriptionExpiry(user: any): Date | null {
  if (!user) return null;

  const expiryDate =
    user.subscriptionExpiry ||
    user.subscription_expiry ||
    user.subscriptionPlan?.expiryDate ||
    user.subscription?.expiryDate;

  if (!expiryDate) return null;

  return new Date(expiryDate);
}

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(user: any): boolean {
  const expiry = getSubscriptionExpiry(user);
  if (!expiry) return false;

  return expiry < new Date();
}
