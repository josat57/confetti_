"use client";

import React, { useState, useEffect } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import MetricCard from "@/components/planner/reports/MetricCard";
import ChartWidget from "@/components/planner/reports/ChartWidget";
import ReportFilters, {
  FilterValues,
} from "@/components/planner/reports/ReportFilters";
import reportsService from "@/services/planner/reports.service";

const FinancialReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [filters, setFilters] = useState<FilterValues>({});

  useEffect(() => {
    loadFinancialReport();
  }, [filters]);

  const loadFinancialReport = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getFinancialReport(filters);
      setReportData(data);
    } catch (error) {
      console.error("Failed to load financial report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      const blob = await reportsService.exportReport(
        "financial",
        format,
        filters
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-report.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export report:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No financial report data available</p>
      </div>
    );
  }

  const revenueExpenseTrend =
    reportData.trends?.map((t: any) => ({
      name: t.month,
      Revenue: t.revenue,
      Expenses: t.expenses,
    })) || [];

  const profitMarginData =
    reportData.eventProfits?.map((e: any) => ({
      name: e.eventName,
      value: e.profitMargin,
    })) || [];

  const paymentStatusData = [
    { name: "Paid", value: reportData.paymentStatus?.paid || 0 },
    { name: "Pending", value: reportData.paymentStatus?.pending || 0 },
    { name: "Overdue", value: reportData.paymentStatus?.overdue || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Financial Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track revenue, expenses, and profitability
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport("pdf")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters onFilterChange={setFilters} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Revenue"
          value={`$${reportData.totalRevenue?.toLocaleString() || 0}`}
          trend={12}
          color="green"
        />
        <MetricCard
          label="Total Expenses"
          value={`$${reportData.totalExpenses?.toLocaleString() || 0}`}
          trend={-5}
          color="orange"
        />
        <MetricCard
          label="Net Profit"
          value={`$${reportData.netProfit?.toLocaleString() || 0}`}
          trend={18}
          color="blue"
        />
        <MetricCard
          label="Profit Margin"
          value={`${reportData.profitMargin || 0}%`}
          trend={8}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Revenue & Expense Trends"
          type="line"
          data={revenueExpenseTrend}
          dataKey="Revenue"
          xAxisKey="name"
        />
        <ChartWidget
          title="Payment Status"
          type="pie"
          data={paymentStatusData}
          dataKey="value"
        />
      </div>

      {/* Profit Margins by Event */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Profit Margins by Event
        </h3>
        <ChartWidget
          title=""
          type="bar"
          data={profitMarginData}
          dataKey="value"
          xAxisKey="name"
          height={250}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Breakdown
          </h3>
          <div className="space-y-3">
            {reportData.revenueBreakdown?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-gray-600">{item.category}</span>
                <span className="text-sm font-medium text-gray-900">
                  ${item.amount?.toLocaleString() || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expense Breakdown
          </h3>
          <div className="space-y-3">
            {reportData.expenseBreakdown?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-gray-600">{item.category}</span>
                <span className="text-sm font-medium text-gray-900">
                  ${item.amount?.toLocaleString() || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Paid</span>
              <span className="text-sm font-medium text-green-600">
                ${reportData.paymentStatus?.paidAmount?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-medium text-yellow-600">
                $
                {reportData.paymentStatus?.pendingAmount?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Overdue</span>
              <span className="text-sm font-medium text-red-600">
                $
                {reportData.paymentStatus?.overdueAmount?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReportsPage;
