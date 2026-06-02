"use client";

import { useRouter } from "next/navigation";
import { Calendar, Users, DollarSign, Briefcase, Plus } from "lucide-react";
import StatCard from "@/components/planner/shared/StatCard";
import EventStatusChart from "@/components/planner/shared/EventStatusChart";
import DeadlinesList from "@/components/planner/shared/DeadlinesList";
import ActivityFeed from "@/components/planner/shared/ActivityFeed";
import {
  usePlannerMetrics,
  usePlannerActivity,
  usePlannerDeadlines,
} from "@/hooks/usePlannerDashboard";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-28 mb-4" />
      <div className="h-8 bg-gray-200 rounded w-16" />
    </div>
  );
}

export default function PlannerDashboardHome() {
  const router = useRouter();

  const { data: metrics, isLoading: metricsLoading } = usePlannerMetrics();
  const { data: activity = [] } = usePlannerActivity();
  const { data: deadlines = [] } = usePlannerDeadlines();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your events.
          </p>
        </div>
        <button
          onClick={() => router.push("/planner/dashboard/events/new")}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Active Events"
              value={metrics?.activeEvents || 0}
              icon={Calendar}
              color="teal"
            />
            <StatCard
              title="Upcoming Events"
              value={metrics?.upcomingEvents || 0}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Total Clients"
              value={metrics?.totalClients || 0}
              icon={Users}
              color="green"
            />
            <StatCard
              title="Budget Under Management"
              value={formatCurrency(metrics?.totalBudget || 0)}
              icon={DollarSign}
              color="purple"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => router.push("/planner/dashboard/events/new")}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5 mr-2 text-teal-600" />
            <span className="text-sm font-medium text-gray-700">Create Event</span>
          </button>
          <button
            onClick={() => router.push("/planner/dashboard/vendors")}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Find Vendors</span>
          </button>
          <button
            onClick={() => router.push("/planner/dashboard/clients")}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-5 h-5 mr-2 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Add Client</span>
          </button>
          <button
            onClick={() => router.push("/planner/dashboard/ai-planner")}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">AI Planner</span>
          </button>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {metricsLoading ? (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse h-64" />
        ) : (
          metrics && <EventStatusChart data={metrics.statusDistribution} />
        )}
        <DeadlinesList deadlines={deadlines} />
      </div>

      {/* Recent Activity */}
      <ActivityFeed activity={activity} />
    </div>
  );
}
