"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserAnalytics,
  EventAnalytics,
  FinancialAnalytics,
  DashboardMetrics,
} from "@/types/analytics";
import analyticsService from "@/services/admin/analytics.service";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2,
  Download,
  Filter,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(
    null
  );
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(
    null
  );
  const [financialAnalytics, setFinancialAnalytics] =
    useState<FinancialAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "events" | "financial">(
    "users"
  );
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      const [metricsRes, userRes, eventRes, financialRes] = await Promise.all([
        analyticsService.getDashboardMetrics(dateRange),
        analyticsService.getUserAnalytics(dateRange),
        analyticsService.getEventAnalytics(dateRange),
        analyticsService.getFinancialAnalytics(dateRange),
      ]);

      setMetrics(metricsRes.metrics);
      setUserAnalytics(userRes.analytics);
      setEventAnalytics(eventRes.analytics);
      setFinancialAnalytics(financialRes.analytics);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      toast.error("Failed to load analytics");

      // Mock data for development
      setMetrics({
        users: { total: 1250, change: 12.5, trend: "up" },
        events: { total: 450, change: 8.3, trend: "up" },
        revenue: { total: 125000, change: 15.2, trend: "up" },
        engagement: { rate: 68.5, change: 3.2, trend: "up" },
      });

      setUserAnalytics({
        totalUsers: 1250,
        activeUsers: 856,
        newUsers: 142,
        userGrowthRate: 12.5,
        retentionRate: 68.5,
        churnRate: 4.2,
        usersByRole: { planner: 450, vendor: 320, user: 480 },
        userGrowthData: generateMockGrowthData(),
        retentionData: [],
        topUsers: [],
      });

      setEventAnalytics({
        totalEvents: 450,
        activeEvents: 125,
        completedEvents: 280,
        cancelledEvents: 45,
        completionRate: 86.2,
        averageBudget: 45000,
        totalBudget: 20250000,
        eventsByCategory: [
          { category: "Wedding", count: 180, percentage: 40 },
          { category: "Corporate", count: 135, percentage: 30 },
          { category: "Birthday", count: 90, percentage: 20 },
          { category: "Other", count: 45, percentage: 10 },
        ],
        eventsByMonth: generateMockEventData(),
        averageGuestsPerEvent: 150,
        averageVendorsPerEvent: 5,
        popularEventTypes: [],
      });

      setFinancialAnalytics({
        totalRevenue: 125000,
        totalExpenses: 45000,
        netProfit: 80000,
        profitMargin: 64,
        revenueGrowth: 15.2,
        revenueBySource: [
          { source: "Subscriptions", amount: 65000, percentage: 52 },
          { source: "Bookings", amount: 45000, percentage: 36 },
          { source: "Service Fees", amount: 15000, percentage: 12 },
        ],
        revenueByMonth: generateMockRevenueData(),
        expenseBreakdown: [
          { category: "Operations", amount: 20000, percentage: 44 },
          { category: "Marketing", amount: 15000, percentage: 33 },
          { category: "Support", amount: 10000, percentage: 23 },
        ],
        topRevenueGenerators: [],
        averageTransactionValue: 2500,
        totalTransactions: 50,
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange]); // Include dateRange in dependencies

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]); // Depend on the memoized function

  const handleExport = async () => {
    try {
      const response = await analyticsService.exportReport({
        format: "pdf",
        includeCharts: true,
        dateRange: {
          start: new Date(dateRange.startDate),
          end: new Date(dateRange.endDate),
        },
        metrics: ["users", "events", "financial"],
      });
      window.open(response.downloadUrl, "_blank");
      toast.success("Export started");
    } catch (err: any) {
      console.error("Error exporting report:", err);
      toast.error("Failed to export report");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics & Reporting
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive platform analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span
                className={`text-sm font-medium ${
                  metrics.users.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {metrics.users.trend === "up" ? "↑" : "↓"}{" "}
                {metrics.users.change}%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.users.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              <span
                className={`text-sm font-medium ${
                  metrics.events.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {metrics.events.trend === "up" ? "↑" : "↓"}{" "}
                {metrics.events.change}%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.events.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Events</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span
                className={`text-sm font-medium ${
                  metrics.revenue.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {metrics.revenue.trend === "up" ? "↑" : "↓"}{" "}
                {metrics.revenue.change}%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(metrics.revenue.total)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span
                className={`text-sm font-medium ${
                  metrics.engagement.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {metrics.engagement.trend === "up" ? "↑" : "↓"}{" "}
                {metrics.engagement.change}%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.engagement.rate}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Engagement Rate</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "users"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            User Analytics
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "events"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Event Analytics
          </button>
          <button
            onClick={() => setActiveTab("financial")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "financial"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Financial Analytics
          </button>
        </nav>
      </div>

      {/* User Analytics */}
      {activeTab === "users" && userAnalytics && (
        <div className="space-y-6">
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {userAnalytics.activeUsers}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {(
                  (userAnalytics.activeUsers / userAnalytics.totalUsers) *
                  100
                ).toFixed(1)}
                % of total
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Retention Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {userAnalytics.retentionRate}%
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Churn Rate</p>
              <p className="text-2xl font-bold text-red-600">
                {userAnalytics.churnRate}%
              </p>
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              User Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userAnalytics.userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                  name="Total Users"
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Users by Role */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Users by Role
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Planners",
                      value: userAnalytics.usersByRole.planner,
                    },
                    {
                      name: "Vendors",
                      value: userAnalytics.usersByRole.vendor,
                    },
                    { name: "Users", value: userAnalytics.usersByRole.user },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2].map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Event Analytics */}
      {activeTab === "events" && eventAnalytics && (
        <div className="space-y-6">
          {/* Event Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Active Events</p>
              <p className="text-2xl font-bold text-blue-600">
                {eventAnalytics.activeEvents}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {eventAnalytics.completedEvents}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {eventAnalytics.completionRate}%
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Avg Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(eventAnalytics.averageBudget)}
              </p>
            </div>
          </div>

          {/* Events by Month */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Events by Month
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventAnalytics.eventsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="created" fill="#8B5CF6" name="Created" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="cancelled" fill="#EF4444" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Events by Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Events by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventAnalytics.eventsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) =>
                    `${category}: ${percentage}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {eventAnalytics.eventsByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Financial Analytics */}
      {activeTab === "financial" && financialAnalytics && (
        <div className="space-y-6">
          {/* Financial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(financialAnalytics.totalRevenue)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(financialAnalytics.totalExpenses)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Net Profit</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(financialAnalytics.netProfit)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
              <p className="text-2xl font-bold text-blue-600">
                {financialAnalytics.profitMargin}%
              </p>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue & Profit Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialAnalytics.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue by Source
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={financialAnalytics.revenueBySource}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) =>
                      `${source}: ${percentage}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {financialAnalytics.revenueBySource.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Expense Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={financialAnalytics.expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) =>
                      `${category}: ${percentage}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {financialAnalytics.expenseBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for mock data
function generateMockGrowthData() {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      total: 1000 + (30 - i) * 8,
      new: Math.floor(Math.random() * 10) + 3,
      active: 700 + (30 - i) * 5,
    });
  }
  return data;
}

function generateMockEventData() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month) => ({
    month,
    created: Math.floor(Math.random() * 50) + 50,
    completed: Math.floor(Math.random() * 40) + 40,
    cancelled: Math.floor(Math.random() * 10) + 5,
  }));
}

function generateMockRevenueData() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 30000) + 100000,
    expenses: Math.floor(Math.random() * 15000) + 30000,
    profit: Math.floor(Math.random() * 20000) + 60000,
  }));
}
