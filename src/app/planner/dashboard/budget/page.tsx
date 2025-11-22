"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Loader2, Calendar } from "lucide-react";
import { budgetService } from "@/services/planner/budget.service";
import Link from "next/link";

interface BudgetOverviewData {
  totalBudget: number;
  totalSpent: number;
  byEvent: Array<{
    eventId: string;
    eventName: string;
    budget: number;
    spent: number;
  }>;
}

export default function BudgetOverviewPage() {
  const [data, setData] = useState<BudgetOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await budgetService.getBudgetOverview();
      setData(response || { totalBudget: 0, totalSpent: 0, byEvent: [] });
    } catch (error) {
      console.error("Error fetching budget overview:", error);
      setData({ totalBudget: 0, totalSpent: 0, byEvent: [] });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    const value = amount || 0;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculatePercentage = (spent: number, budget: number) => {
    if (!budget || budget === 0) return 0;
    return (spent / budget) * 100;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No budget data available
          </h3>
          <p className="text-gray-600">
            Create events with budgets to see your overview here
          </p>
        </div>
      </div>
    );
  }

  const totalBudget = data.totalBudget || 0;
  const totalSpent = data.totalSpent || 0;
  const remaining = totalBudget - totalSpent;
  const spentPercentage = calculatePercentage(totalSpent, totalBudget);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Budget Overview</h1>
        <p className="text-gray-600 mt-1">
          Track your total budget across all active events
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isFinite(spentPercentage) ? spentPercentage.toFixed(1) : "0.0"}
                % of budget
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Overall Budget Usage
        </h2>
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">
              {isFinite(spentPercentage) ? spentPercentage.toFixed(1) : "0.0"}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                spentPercentage > 100
                  ? "bg-red-600"
                  : spentPercentage > 80
                  ? "bg-yellow-500"
                  : "bg-teal-600"
              }`}
              style={{
                width: `${Math.min(
                  isFinite(spentPercentage) ? spentPercentage : 0,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Budget by Event */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Budget by Event
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {data.byEvent?.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No events with budgets yet</p>
            </div>
          ) : (
            data.byEvent?.map((event) => {
              const eventBudget = event.budget || 0;
              const eventSpent = event.spent || 0;
              const eventSpentPercentage = calculatePercentage(
                eventSpent,
                eventBudget
              );
              const eventRemaining = eventBudget - eventSpent;

              return (
                <Link
                  key={event.eventId}
                  href={`/planner/dashboard/events/${event.eventId}/budget`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {event.eventName || "Untitled Event"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatCurrency(eventSpent)} of{" "}
                        {formatCurrency(eventBudget)} spent
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(eventRemaining)} remaining
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isFinite(eventSpentPercentage)
                          ? eventSpentPercentage.toFixed(1)
                          : "0.0"}
                        % used
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        eventSpentPercentage > 100
                          ? "bg-red-600"
                          : eventSpentPercentage > 80
                          ? "bg-yellow-500"
                          : "bg-teal-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          isFinite(eventSpentPercentage)
                            ? eventSpentPercentage
                            : 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
