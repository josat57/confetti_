"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  CreditCard,
  Loader2,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import financialService from "@/services/admin/financial.service";
import { toast } from "react-toastify";

export default function RevenueStatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    revenueByMonth: [] as Array<{ month: string; revenue: number }>,
    revenueByPaymentMethod: [] as Array<{ method: string; revenue: number }>,
    revenueByPlan: [] as Array<{ plan: string; revenue: number }>,
  });
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
    groupBy: "month" as "day" | "week" | "month",
  });

  useEffect(() => {
    // Set default date range (last 12 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    setDateRange({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      groupBy: "month",
    });
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchRevenueStats();
    }
  }, [dateRange]);

  const fetchRevenueStats = async () => {
    try {
      setLoading(true);
      const response = await financialService.getRevenueStats(dateRange);
      setStats(response.stats);
    } catch (err: any) {
      console.error("Error fetching revenue stats:", err);
      toast.error("Failed to load revenue statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const calculateGrowth = () => {
    if (stats.revenueByMonth.length < 2) return 0;
    const current =
      stats.revenueByMonth[stats.revenueByMonth.length - 1]?.revenue || 0;
    const previous =
      stats.revenueByMonth[stats.revenueByMonth.length - 2]?.revenue || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const growth = calculateGrowth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading revenue statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Revenue Statistics
            </h1>
            <p className="text-gray-600 mt-1">
              Track and analyze revenue performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRevenueStats}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => toast.info("Export functionality coming soon")}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group By
            </label>
            <select
              value={dateRange.groupBy}
              onChange={(e) =>
                setDateRange({
                  ...dateRange,
                  groupBy: e.target.value as "day" | "week" | "month",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            {growth !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  growth > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {growth > 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                {Math.abs(growth).toFixed(1)}%
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Monthly Revenue
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.monthlyRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Yearly Revenue
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.yearlyRevenue)}
          </p>
        </div>
      </div>

      {/* Revenue by Month Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue Over Time
        </h2>
        {stats.revenueByMonth.length > 0 ? (
          <div className="space-y-3">
            {stats.revenueByMonth.map((item, index) => {
              const maxRevenue = Math.max(
                ...stats.revenueByMonth.map((r) => r.revenue)
              );
              const percentage = (item.revenue / maxRevenue) * 100;

              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {formatMonth(item.month)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No revenue data available</p>
          </div>
        )}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Payment Method */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Payment Method
          </h2>
          {stats.revenueByPaymentMethod.length > 0 ? (
            <div className="space-y-4">
              {stats.revenueByPaymentMethod.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900 capitalize">
                      {item.method}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">No payment method data</p>
            </div>
          )}
        </div>

        {/* By Plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Plan
          </h2>
          {stats.revenueByPlan.length > 0 ? (
            <div className="space-y-4">
              {stats.revenueByPlan.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-600" />
                    <span className="font-medium text-gray-900 capitalize">
                      {item.plan}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">No plan revenue data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
