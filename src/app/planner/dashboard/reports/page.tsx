"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import MetricCard from "@/components/planner/reports/MetricCard";
import ChartWidget from "@/components/planner/reports/ChartWidget";
import ReportFilters, {
  FilterValues,
} from "@/components/planner/reports/ReportFilters";
import reportsService, {
  DashboardReport,
} from "@/services/planner/reports.service";

const ReportsDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<DashboardReport | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getDashboardReport(filters);
      setReportData(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      const blob = await reportsService.exportReport("dashboard", format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-report.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // silent
    }
  };

  const cardCls = "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!reportData || !reportData.eventMetrics || reportData.eventMetrics.totalEvents === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Reports & Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View comprehensive insights and performance metrics
            </p>
          </div>
        </div>

        <ReportFilters onFilterChange={setFilters} />

        <div className={cardCls + " text-center py-12"}>
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Report Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start creating events to see your analytics and reports here.
          </p>
          <button
            onClick={() => (window.location.href = "/planner/dashboard/events/new")}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      </div>
    );
  }

  const eventChartData = [
    { name: "Completed", value: reportData.eventMetrics.completedEvents },
    { name: "Active", value: reportData.eventMetrics.activeEvents },
    { name: "Upcoming", value: reportData.eventMetrics.upcomingEvents },
  ];

  const financialChartData = [
    { name: "Revenue", value: reportData.financialMetrics.totalRevenue },
    { name: "Expenses", value: reportData.financialMetrics.totalExpenses },
    { name: "Profit", value: reportData.financialMetrics.profit },
  ];

  const btnCls = "inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => handleExport("pdf")} className={btnCls}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button onClick={() => handleExport("excel")} className={btnCls}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      <ReportFilters onFilterChange={setFilters} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Events"
          value={reportData.eventMetrics.totalEvents}
          trend={10}
          icon={<CalendarIcon className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          label="Total Revenue"
          value={`$${reportData.financialMetrics.totalRevenue.toLocaleString()}`}
          trend={15}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          color="green"
        />
        <MetricCard
          label="Total Clients"
          value={reportData.clientMetrics.totalClients}
          trend={8}
          icon={<UserGroupIcon className="h-6 w-6" />}
          color="purple"
        />
        <MetricCard
          label="Total Vendors"
          value={reportData.vendorMetrics.totalVendors}
          trend={5}
          icon={<BuildingStorefrontIcon className="h-6 w-6" />}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Event Status Distribution"
          type="pie"
          data={eventChartData}
          dataKey="value"
        />
        <ChartWidget
          title="Financial Overview"
          type="bar"
          data={financialChartData}
          dataKey="value"
          xAxisKey="name"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={cardCls}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Event Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {reportData.eventMetrics.completionRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Events</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {reportData.eventMetrics.activeEvents}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {reportData.eventMetrics.upcomingEvents}
              </span>
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Financial Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {reportData.financialMetrics.profitMargin}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Event Budget</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                ${reportData.financialMetrics.averageEventBudget.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Profit</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ${reportData.financialMetrics.profit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Vendor Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {reportData.vendorMetrics.averageRating.toFixed(1)} / 5.0
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Cost</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                ${reportData.vendorMetrics.averageCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Reliability Score</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {reportData.vendorMetrics.reliabilityScore}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
