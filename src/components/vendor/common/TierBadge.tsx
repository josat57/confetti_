"use client";

import { Crown, Zap, Building, Sparkles } from "lucide-react";
import { getTierDisplayName, getTierColor } from "@/utils/subscriptionTier";

interface TierBadgeProps {
  tier: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export default function TierBadge({
  tier,
  size = "md",
  showIcon = true,
  className = "",
}: TierBadgeProps) {
  const displayName = getTierDisplayName(tier);
  const colorClass = getTierColor(tier);

  // Size classes
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  // Get icon based on tier
  const getIcon = () => {
    const normalizedTier = tier.toLowerCase();
    const iconClass = iconSizeClasses[size];

    switch (normalizedTier) {
      case "professional":
        return <Zap className={iconClass} />;
      case "business":
        return <Building className={iconClass} />;
      case "enterprise":
        return <Crown className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && getIcon()}
      <span>{displayName}</span>
    </span>
  );
}
