"use client";

import { EventBudget } from "@/types/planner";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

interface BudgetOverviewProps {
  budget: EventBudget;
}

export default function BudgetOverview({ budget }: BudgetOverviewProps) {
  const spentPercentage = (budget.totalSpent / budget.total) * 100;
  const isOverBudget = budget.totalSpent > budget.total;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: budget.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Budget Overview
      </h2>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Budget */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Total Budget</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(budget.total)}
          </p>
        </div>

        {/* Total Spent */}
        <div
          className={`rounded-lg p-4 ${
            isOverBudget ? "bg-red-50" : "bg-green-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isOverBudget ? (
              <TrendingUp className="w-5 h-5 text-red-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-green-600" />
            )}
            <p
              className={`text-sm font-medium ${
                isOverBudget ? "text-red-900" : "text-green-900"
              }`}
            >
              Total Spent
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isOverBudget ? "text-red-900" : "text-green-900"
            }`}
          >
            {formatCurrency(budget.totalSpent)}
          </p>
          <p
            className={`text-sm mt-1 ${
              isOverBudget ? "text-red-700" : "text-green-700"
            }`}
          >
            {spentPercentage.toFixed(1)}% of budget
          </p>
        </div>

        {/* Remaining */}
        <div
          className={`rounded-lg p-4 ${
            isOverBudget ? "bg-red-50" : "bg-teal-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign
              className={`w-5 h-5 ${
                isOverBudget ? "text-red-600" : "text-teal-600"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                isOverBudget ? "text-red-900" : "text-teal-900"
              }`}
            >
              {isOverBudget ? "Over Budget" : "Remaining"}
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isOverBudget ? "text-red-900" : "text-teal-900"
            }`}
          >
            {formatCurrency(Math.abs(budget.remaining))}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Budget Usage
          </span>
          <span className="text-sm font-medium text-gray-900">
            {spentPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all ${
              isOverBudget
                ? "bg-red-600"
                : spentPercentage > 80
                ? "bg-yellow-500"
                : "bg-teal-600"
            }`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Budget by Category
        </h3>
        <div className="space-y-3">
          {budget.categories.map((category, index) => {
            const categorySpentPercentage =
              (category.spent / category.allocated) * 100;
            const isOverAllocated = category.spent > category.allocated;
            const isNearLimit =
              categorySpentPercentage > 80 && !isOverAllocated;

            return (
              <div
                key={index}
                className="border-b border-gray-100 pb-3 last:border-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {category.category}
                    </span>
                    {isNearLimit && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    {isOverAllocated && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(category.spent)} /{" "}
                      {formatCurrency(category.allocated)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {category.percentage}% of total
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isOverAllocated
                        ? "bg-red-600"
                        : isNearLimit
                        ? "bg-yellow-500"
                        : "bg-teal-600"
                    }`}
                    style={{
                      width: `${Math.min(categorySpentPercentage, 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {budget.categories.some((c) => c.spent / c.allocated > 0.8) && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Budget Alert
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                Some categories are approaching or exceeding their allocated
                budget. Consider adjusting your spending or reallocating funds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
