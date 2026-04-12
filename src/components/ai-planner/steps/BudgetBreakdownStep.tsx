import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Percent } from "lucide-react";
import { BudgetBreakdownData, EventType } from "@/types/ai-planner";

interface BudgetBreakdownStepProps {
  value?: BudgetBreakdownData;
  onChange: (data: BudgetBreakdownData) => void;
  totalBudget: number;
  eventType: EventType;
  errors: Record<string, string>;
}

const budgetCategories = [
  {
    id: "venue",
    label: "Venue & Space",
    description: "Location rental and setup",
  },
  {
    id: "catering",
    label: "Catering & Food",
    description: "Food, drinks, and service",
  },
  {
    id: "photography",
    label: "Photography",
    description: "Professional photography",
  },
  {
    id: "decoration",
    label: "Decoration",
    description: "Flowers, decor, and styling",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    description: "Music, DJ, or live band",
  },
  {
    id: "transportation",
    label: "Transportation",
    description: "Guest and vendor transport",
  },
];

export default function BudgetBreakdownStep({
  value,
  onChange,
  totalBudget,
  eventType,
  errors,
}: BudgetBreakdownStepProps) {
  const [localData, setLocalData] = useState<BudgetBreakdownData>(() => ({
    totalBudget,
    priorities: ["venue", "catering", "photography"],
    flexibleCategories: ["decoration", "entertainment"],
    fixedCategories: ["venue", "catering"],
    contingencyPercentage: 10,
    paymentPreferences: "installments",
    budgetFlexibility: "moderate",
    ...value,
  }));

  useEffect(() => {
    onChange(localData);
  }, [localData, onChange]);

  useEffect(() => {
    setLocalData((prev) => ({ ...prev, totalBudget }));
  }, [totalBudget]);

  const updateData = (updates: Partial<BudgetBreakdownData>) => {
    setLocalData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      {/* Budget Priorities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Budget Priorities (Drag to reorder)
        </label>
        <div className="space-y-2">
          {budgetCategories.map((category, index) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div>
                  <span className="font-medium text-gray-900">
                    {category.label}
                  </span>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contingency Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contingency Buffer: {localData.contingencyPercentage}%
        </label>
        <input
          type="range"
          min="5"
          max="20"
          value={localData.contingencyPercentage}
          onChange={(e) =>
            updateData({ contingencyPercentage: parseInt(e.target.value) })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>5% (Conservative)</span>
          <span>20% (Safe)</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Contingency amount: $
          {(
            (totalBudget * localData.contingencyPercentage) /
            100
          ).toLocaleString()}
        </p>
      </div>

      {/* Payment Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Preference
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              value: "upfront",
              label: "Full Payment",
              description: "Pay everything upfront",
            },
            {
              value: "installments",
              label: "Installments",
              description: "Split into payments",
            },
            {
              value: "milestone_based",
              label: "Milestone Based",
              description: "Pay as services are delivered",
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                localData.paymentPreferences === option.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentPreferences"
                value={option.value}
                checked={localData.paymentPreferences === option.value}
                onChange={(e) =>
                  updateData({ paymentPreferences: e.target.value as any })
                }
                className="sr-only"
              />
              <span className="font-medium text-gray-900">{option.label}</span>
              <span className="text-sm text-gray-600 mt-1">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Flexibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Budget Flexibility
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              value: "strict",
              label: "Strict",
              description: "Must stay within budget",
            },
            {
              value: "moderate",
              label: "Moderate",
              description: "Up to 10% over if needed",
            },
            {
              value: "flexible",
              label: "Flexible",
              description: "Quality over budget",
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                localData.budgetFlexibility === option.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="budgetFlexibility"
                value={option.value}
                checked={localData.budgetFlexibility === option.value}
                onChange={(e) =>
                  updateData({ budgetFlexibility: e.target.value as any })
                }
                className="sr-only"
              />
              <span className="font-medium text-gray-900">{option.label}</span>
              <span className="text-sm text-gray-600 mt-1">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
