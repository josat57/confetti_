"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import MetricCard from "@/components/planner/reports/MetricCard";
import ChartWidget from "@/components/planner/reports/ChartWidget";
import reportsService from "@/services/planner/reports.service";

const EventReportsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    if (eventId) {
      loadEventReport();
    }
  }, [eventId]);

  const loadEventReport = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      const data = await reportsService.getEventReport(eventId);
      setReportData(data);
    } catch (error) {
      console.error("Failed to load event report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      const blob = await reportsService.exportReport("event", format, {
        eventId: eventId || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `event-report-${eventId}.${
        format === "pdf" ? "pdf" : "xlsx"
      }`;
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
        <p className="text-gray-500">No event report data available</p>
      </div>
    );
  }

  const budgetData = [
    { name: "Planned", value: reportData.budget?.planned || 0 },
    { name: "Spent", value: reportData.budget?.spent || 0 },
    { name: "Remaining", value: reportData.budget?.remaining || 0 },
  ];

  const timelineData =
    reportData.timeline?.milestones?.map((m: any) => ({
      name: m.name,
      value: m.completed ? 100 : 0,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Report</h1>
          <p className="mt-1 text-sm text-gray-500">
            {reportData.eventName || "Event Details"}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Budget Adherence"
          value={`${reportData.budgetAdherence || 0}%`}
          trend={reportData.budgetAdherence > 90 ? 5 : -5}
          color="green"
        />
        <MetricCard
          label="Timeline Completion"
          value={`${reportData.timelineCompletion || 0}%`}
          trend={reportData.timelineCompletion > 80 ? 10 : -10}
          color="blue"
        />
        <MetricCard
          label="Client Satisfaction"
          value={`${reportData.clientSatisfaction || 0}/5`}
          trend={reportData.clientSatisfaction > 4 ? 8 : -8}
          color="purple"
        />
        <MetricCard
          label="Tasks Completed"
          value={`${reportData.tasksCompleted || 0}/${
            reportData.totalTasks || 0
          }`}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Budget Overview"
          type="bar"
          data={budgetData}
          dataKey="value"
          xAxisKey="name"
        />
        <ChartWidget
          title="Timeline Progress"
          type="bar"
          data={timelineData}
          dataKey="value"
          xAxisKey="name"
        />
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Budget Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Budget</span>
              <span className="text-sm font-medium text-gray-900">
                ${reportData.budget?.planned?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount Spent</span>
              <span className="text-sm font-medium text-gray-900">
                ${reportData.budget?.spent?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Remaining</span>
              <span className="text-sm font-medium text-green-600">
                ${reportData.budget?.remaining?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Adherence Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {reportData.budgetAdherence || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Event Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-medium text-gray-900">
                {reportData.status || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Event Date</span>
              <span className="text-sm font-medium text-gray-900">
                {reportData.eventDate || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Guest Count</span>
              <span className="text-sm font-medium text-gray-900">
                {reportData.guestCount || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vendors Booked</span>
              <span className="text-sm font-medium text-gray-900">
                {reportData.vendorsBooked || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventReportsPage;
