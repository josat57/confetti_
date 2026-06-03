"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Ticket,
  Loader2,
} from "lucide-react";
import MetricCard from "@/components/admin/dashboard/MetricCard";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import { Activity } from "@/types/admin";
import { AdminAPI } from "@/api/adminApi";
import { toast } from "react-toastify";

interface DashboardMetrics {
  users: {
    total: number;
    vendors: number;
    planners: number;
    active: number;
    newThisMonth: number;
  };
  events: {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
  };
  revenue: {
    total: number;
    monthly: number;
  };
  subscriptions: {
    total: number;
    active: number;
  };
  pendingActions: {
    pendingVerifications: number;
    openTickets: number;
    total: number;
  };
  recentActivity: Array<{
    type: string;
    user?: string;
    description: string;
    timestamp: string;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getDashboardStats();

      if (response?.status === "success" && response?.data?.metrics) {
        setMetrics(response.data.metrics);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Convert backend activity to Activity type
  const activities: Activity[] =
    metrics?.recentActivity?.map((activity, index) => ({
      id: index.toString(),
      type: activity.type as any,
      user: activity.user || "System",
      description: activity.description,
      timestamp: new Date(activity.timestamp),
    })) || [];


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics?.users?.total?.toLocaleString() || "0"}
          icon={<Users className="w-5 h-5" />}
        />

        <MetricCard
          title="Total Vendors"
          value={metrics?.users?.vendors?.toLocaleString() || "0"}
          icon={<Building2 className="w-5 h-5" />}
        />

        <MetricCard
          title="Total Events"
          value={metrics?.events?.total?.toLocaleString() || "0"}
          icon={<Calendar className="w-5 h-5" />}
        />

        <MetricCard
          title="Total Revenue"
          value={`₦${((metrics?.revenue?.total || 0) / 1000000).toFixed(1)}M`}
          icon={<DollarSign className="w-5 h-5" />}
        />

        <MetricCard
          title="Pending Verifications"
          value={metrics?.pendingActions?.pendingVerifications || 0}
          trend="neutral"
          icon={<AlertCircle className="w-5 h-5" />}
        />

        <MetricCard
          title="Open Tickets"
          value={metrics?.pendingActions?.openTickets || 0}
          trend="neutral"
          icon={<Ticket className="w-5 h-5" />}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            User Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Event Planners</span>
              <span className="text-sm font-semibold text-gray-900">
                {metrics?.users?.planners || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vendors</span>
              <span className="text-sm font-semibold text-gray-900">
                {metrics?.users?.vendors || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-semibold text-green-600">
                {metrics?.users?.active || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New This Month</span>
              <span className="text-sm font-semibold text-blue-600">
                {metrics?.users?.newThisMonth || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Event Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Upcoming</span>
              <span className="text-sm font-semibold text-blue-600">
                {metrics?.events?.upcoming || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ongoing</span>
              <span className="text-sm font-semibold text-orange-600">
                {metrics?.events?.ongoing || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-semibold text-green-600">
                {metrics?.events?.completed || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Subscriptions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-sm font-semibold text-gray-900">
                {metrics?.subscriptions?.total || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-sm font-semibold text-green-600">
                {metrics?.subscriptions?.active || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Revenue</span>
              <span className="text-sm font-semibold text-purple-600">
                ₦{((metrics?.revenue?.monthly || 0) / 1000).toFixed(0)}K
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={activities} limit={10} />

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/admin/dashboard/vendors")}
              className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
            >
              <span className="font-medium text-purple-900">
                Review Pending Verifications
              </span>
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {metrics?.pendingActions?.pendingVerifications || 0}
              </span>
            </button>

            <button
              onClick={() => router.push("/admin/dashboard/notifications")}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <span className="font-medium text-blue-900">
                View Open Support Tickets
              </span>
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {metrics?.pendingActions?.openTickets || 0}
              </span>
            </button>

            <button
              onClick={() => router.push("/admin/dashboard/analytics")}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <span className="font-medium text-gray-900">
                Generate Analytics Report
              </span>
            </button>

            <button
              onClick={() => router.push("/admin/dashboard/monitoring")}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <span className="font-medium text-gray-900">
                System Health Check
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
