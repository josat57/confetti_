"use client";

import { Lock, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getTierDisplayName,
  getTierFeatures,
  getTierPricing,
} from "@/utils/subscriptionTier";

interface UpgradePromptProps {
  feature: string;
  requiredTier: string;
  currentTier: string;
  variant?: "card" | "banner" | "modal";
}

export default function UpgradePrompt({
  feature,
  requiredTier,
  currentTier,
  variant = "card",
}: UpgradePromptProps) {
  const tierName = getTierDisplayName(requiredTier);
  const features = getTierFeatures(requiredTier).slice(0, 5);
  const pricing = getTierPricing(requiredTier);

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Upgrade to {tierName} to access {feature}
              </p>
              <p className="text-sm text-gray-600">
                Unlock this feature and many more
              </p>
            </div>
          </div>
          <Link
            href="/#pricing"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
          >
            Upgrade Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg border-2 border-purple-200 p-8 text-center max-w-2xl mx-auto"
    >
      {/* Icon */}
      <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
        <Lock className="w-8 h-8 text-purple-600" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Upgrade to {tierName}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6">
        Access <span className="font-semibold">{feature}</span> and unlock
        powerful features to grow your business
      </p>

      {/* Features List */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
        <p className="font-semibold text-gray-900 mb-4">
          What you'll get with {tierName}:
        </p>
        <ul className="space-y-3">
          {features.map((feat, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Starting at</p>
        <p className="text-4xl font-bold text-gray-900">
          ₦{pricing.amount.toLocaleString()}
          <span className="text-lg font-normal text-gray-600">
            /{pricing.period}
          </span>
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/#pricing"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Upgrade to {tierName}
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          href="/#pricing"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Compare Plans
        </Link>
      </div>

      {/* Current Tier Info */}
      <p className="text-sm text-gray-500 mt-6">
        You're currently on the{" "}
        <span className="font-semibold">{getTierDisplayName(currentTier)}</span>{" "}
        plan
      </p>
    </motion.div>
  );
}
