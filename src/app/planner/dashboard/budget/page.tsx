"use client";

import { DollarSign, TrendingUp, Loader2, Calendar } from "lucide-react";
import { useBudgetOverview } from "@/hooks/usePlannerDashboard";
import Link from "next/link";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

const calcPct = (spent: number, budget: number) =>
  budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

const barColor = (pct: number) =>
  pct > 100 ? "bg-red-600" : pct > 80 ? "bg-yellow-500" : "bg-teal-600";

export default function BudgetOverviewPage() {
  const { data, isLoading } = useBudgetOverview();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No budget data available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create events with budgets to see your overview here
          </p>
        </div>
      </div>
    );
  }

  const totalBudget = data.totalBudget || 0;
  const totalSpent = data.totalSpent || 0;
  const remaining = totalBudget - totalSpent;
  const spentPct = calcPct(totalSpent, totalBudget);

  const cardCls = "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6";

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Budget Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your total budget across all active events
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={cardCls}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{spentPct.toFixed(1)}% of budget</p>
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(remaining)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className={`${cardCls} mb-8`}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Overall Budget Usage</h2>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{spentPct.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${barColor(spentPct)}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
      </div>

      {/* Budget by Event */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Budget by Event</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {!data.byEvent?.length ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No events with budgets yet</p>
            </div>
          ) : (
            data.byEvent.map((ev) => {
              const evBudget = ev.budget || 0;
              const evSpent = ev.spent || 0;
              const evPct = calcPct(evSpent, evBudget);
              const evRemaining = evBudget - evSpent;

              return (
                <Link
                  key={ev.eventId}
                  href={`/planner/dashboard/events/${ev.eventId}/budget`}
                  className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {ev.eventName || "Untitled Event"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatCurrency(evSpent)} of {formatCurrency(evBudget)} spent
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(evRemaining)} remaining
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {evPct.toFixed(1)}% used
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${barColor(evPct)}`}
                      style={{ width: `${evPct}%` }}
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
