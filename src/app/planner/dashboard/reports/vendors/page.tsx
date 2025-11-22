"use client";

import React, { useState, useEffect } from "react";
import { ArrowDownTrayIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import MetricCard from "@/components/planner/reports/MetricCard";
import ChartWidget from "@/components/planner/reports/ChartWidget";
import ReportFilters, {
  FilterValues,
} from "@/components/planner/reports/ReportFilters";
import reportsService from "@/services/planner/reports.service";

const VendorReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [filters, setFilters] = useState<FilterValues>({});

  useEffect(() => {
    loadVendorReport();
  }, [filters]);

  const loadVendorReport = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getVendorReport(filters);
      setReportData(data);
    } catch (error) {
      console.error("Failed to load vendor report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      const blob = await reportsService.exportReport("vendor", format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vendor-report.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export report:", error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="h-4 w-4 text-gray-300" />
          )
        )}
      </div>
    );
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
        <p className="text-gray-500">No vendor report data available</p>
      </div>
    );
  }

  const costComparisonData =
    reportData.vendorCosts?.map((v: any) => ({
      name: v.vendorName,
      value: v.averageCost,
    })) || [];

  const reliabilityData =
    reportData.vendorReliability?.map((v: any) => ({
      name: v.vendorName,
      value: v.reliabilityScore,
    })) || [];

  const categoryDistribution =
    reportData.categoryDistribution?.map((c: any) => ({
      name: c.category,
      value: c.count,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analyze vendor performance and costs
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
          label="Total Vendors"
          value={reportData.totalVendors || 0}
          trend={5}
          color="blue"
        />
        <MetricCard
          label="Average Rating"
          value={`${reportData.averageRating?.toFixed(1) || 0}/5`}
          trend={3}
          color="green"
        />
        <MetricCard
          label="Average Cost"
          value={`$${reportData.averageCost?.toLocaleString() || 0}`}
          trend={-2}
          color="purple"
        />
        <MetricCard
          label="Reliability Score"
          value={`${reportData.reliabilityScore || 0}%`}
          trend={7}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Cost Comparison by Vendor"
          type="bar"
          data={costComparisonData}
          dataKey="value"
          xAxisKey="name"
        />
        <ChartWidget
          title="Vendor Category Distribution"
          type="pie"
          data={categoryDistribution}
          dataKey="value"
        />
      </div>

      {/* Reliability Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Vendor Reliability
        </h3>
        <ChartWidget
          title=""
          type="bar"
          data={reliabilityData}
          dataKey="value"
          xAxisKey="name"
          height={250}
        />
      </div>

      {/* Top Vendors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Performing Vendors
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reliability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Events
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.topVendors?.map((vendor: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vendor.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {vendor.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderStars(Math.round(vendor.rating))}
                      <span className="ml-2 text-sm text-gray-600">
                        {vendor.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${vendor.averageCost.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vendor.reliability}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vendor.eventCount}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                On-Time Delivery Rate
              </span>
              <span className="text-sm font-medium text-gray-900">
                {reportData.onTimeRate || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Response Time (avg)</span>
              <span className="text-sm font-medium text-gray-900">
                {reportData.avgResponseTime || 0} hours
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Repeat Booking Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {reportData.repeatBookingRate || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cost Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Lowest Cost</span>
              <span className="text-sm font-medium text-green-600">
                ${reportData.lowestCost?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Highest Cost</span>
              <span className="text-sm font-medium text-red-600">
                ${reportData.highestCost?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cost Variance</span>
              <span className="text-sm font-medium text-gray-900">
                ${reportData.costVariance?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorReportsPage;
