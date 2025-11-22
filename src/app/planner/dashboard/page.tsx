"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, DollarSign, Briefcase, Plus } from "lucide-react";
import StatCard from "@/components/planner/shared/StatCard";
import EventStatusChart from "@/components/planner/shared/EventStatusChart";
import DeadlinesList from "@/components/planner/shared/DeadlinesList";
import ActivityFeed from "@/components/planner/shared/ActivityFeed";
import {
  dashboardService,
  DashboardMetrics,
  RecentActivity,
  Deadline,
} from "@/services/planner/dashboard.service";

export default function PlannerDashboardHome() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsData, activityData, deadlinesData] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getRecentActivity(),
          dashboardService.getUpcomingDeadlines(),
        ]);

        setMetrics(metricsData);
        setActivity(activityData);
        setDeadlines(deadlinesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => router.push("/planner/dashboard/events/new")}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5 mr-2 text-teal-600" />
            <span className="text-sm font-medium text-gray-700">
              Create Event
            </span>
          </button>
          <button
            onClick={() => router.push("/planner/dashboard/vendors")}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              Find Vendors
            </span>
          </button>
          <button
            onClick={() => router.push("/planner/dashboard/clients")}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-5 h-5 mr-2 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Add Client
            </span>
          </button>
          <button
            onClick={() => router.push("/planner/dashboard/ai-planner")}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              AI Planner
            </span>
          </button>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Event Status Chart */}
        {metrics && <EventStatusChart data={metrics.statusDistribution} />}

        {/* Upcoming Deadlines */}
        <DeadlinesList deadlines={deadlines} />
      </div>

      {/* Recent Activity */}
      <ActivityFeed activity={activity} />
    </div>
  );
}
