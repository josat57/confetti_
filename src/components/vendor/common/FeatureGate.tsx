"use client";

import { ReactNode } from "react";
import UpgradePrompt from "./UpgradePrompt";

interface FeatureGateProps {
  feature: string;
  requiredTier: "professional" | "business" | "enterprise";
  currentTier?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

// Tier hierarchy for comparison
const tierHierarchy = {
  basic: 0,
  professional: 1,
  business: 2,
  enterprise: 3,
};

export default function FeatureGate({
  feature,
  requiredTier,
  currentTier = "basic",
  children,
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) {
  // Normalize tier names to lowercase
  const normalizedCurrentTier = currentTier.toLowerCase();
  const normalizedRequiredTier = requiredTier.toLowerCase();

  // Check if user has access to the feature
  const hasAccess =
    tierHierarchy[normalizedCurrentTier as keyof typeof tierHierarchy] >=
    tierHierarchy[normalizedRequiredTier as keyof typeof tierHierarchy];

  // If user has access, render the children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If user doesn't have access, show upgrade prompt or fallback
  if (showUpgradePrompt) {
    return (
      <UpgradePrompt
        feature={feature}
        requiredTier={requiredTier}
        currentTier={normalizedCurrentTier}
      />
    );
  }

  // Return fallback if provided, otherwise return null
  return <>{fallback || null}</>;
}
