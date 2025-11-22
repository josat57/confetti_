"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface PlanDetailsCardProps {
  planName: string;
  planType: "vendor" | "event_planner";
  amount: number;
  period: string;
}

export default function PlanDetailsCard({
  planName,
  planType,
  amount,
  period,
}: PlanDetailsCardProps) {
  const displayType = planType === "vendor" ? "Vendor" : "Event Planner";
  const isFree = amount === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6 mb-6 shadow-sm"
      role="region"
      aria-label="Selected subscription plan details"
      aria-live="polite"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="bg-purple-600 text-white rounded-full p-1"
              aria-hidden="true"
            >
              <Check className="w-4 h-4" />
            </div>
            <h3
              className="text-lg font-semibold text-gray-900"
              id="plan-details-heading"
            >
              Selected Plan
            </h3>
          </div>
          <p
            className="text-2xl font-bold text-purple-700 mb-1"
            aria-label={`Plan name: ${planName}`}
          >
            {planName}
          </p>
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <span className="font-medium">Account Type:</span>
            <span
              className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium"
              aria-label={`Account type: ${displayType}`}
            >
              {displayType}
            </span>
          </p>
        </div>
        <div className="text-right">
          <div
            className="flex items-baseline justify-end gap-1"
            aria-label={`Price: ${amount} dollars ${period}`}
          >
            <span className="text-4xl font-bold text-purple-600">
              ${amount}
            </span>
            <span className="text-lg text-gray-600">{period}</span>
          </div>
          {isFree && (
            <p
              className="text-sm text-green-600 font-medium mt-1"
              role="status"
              aria-label="This is a free plan, no payment required"
            >
              No payment required
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-purple-200">
        <p className="text-xs text-gray-600 text-center">
          This plan will be activated after you complete registration
          {!isFree && " and payment"}
        </p>
      </div>
    </motion.div>
  );
}
