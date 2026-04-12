"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import StatsCard from "@/components/vendor/dashboard/StatsCard";
import ActivityFeed from "@/components/vendor/dashboard/ActivityFeed";
import UpcomingBookings from "@/components/vendor/dashboard/UpcomingBookings";
import QuickActions from "@/components/vendor/dashboard/QuickActions";
import { Eye, Users, Calendar, Star } from "lucide-react";
import { toast } from "react-toastify";
import { activityService } from "@/services/activity.service";
import type { Activity, DashboardStats } from "@/types/activity.types";

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Try to get dashboard summary (stats + activities in one call)
      const summary = await activityService.getDashboardSummary();
      setStats(summary.stats);
      setActivities(summary.activities);
    } catch (error: any) {
      console.error("Error loading dashboard:", error);

      // Fallback: try to load stats and activities separately
      try {
        const [statsData, activitiesData] = await Promise.all([
          activityService.getDashboardStats(),
          activityService.getRecent(10),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (fallbackError: any) {
        console.error("Fallback also failed:", fallbackError);
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user?.username || "Vendor"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Profile Views"
          value={
            stats?.summary?.profileViews || stats?.profileViews?.total || 0
          }
          icon={<Eye className="w-6 h-6" />}
          trend={
            stats?.profileViews?.change
              ? {
                  value: stats.profileViews.change,
                  direction: stats.profileViews.change >= 0 ? "up" : "down",
                }
              : undefined
          }
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="New Inquiries"
          value={stats?.inquiries?.new || stats?.leads?.new || 0}
          icon={<Users className="w-6 h-6" />}
          trend={
            stats?.inquiries?.conversionRate || stats?.leads?.conversionRate
              ? {
                  value:
                    stats?.inquiries?.conversionRate ||
                    stats?.leads?.conversionRate ||
                    0,
                  direction: "up",
                }
              : undefined
          }
          color="blue"
          loading={loading}
          subtitle={`${
            stats?.inquiries?.total || stats?.leads?.total || 0
          } total`}
        />
        <StatsCard
          title="Bookings"
          value={
            stats?.summary?.totalBookings || stats?.bookings?.upcoming || 0
          }
          icon={<Calendar className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Average Rating"
          value={(
            stats?.summary?.averageRating ||
            stats?.reviews?.averageRating ||
            0
          ).toFixed(1)}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
          loading={loading}
          subtitle={`${
            stats?.summary?.totalReviews || stats?.reviews?.total || 0
          } reviews`}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <ActivityFeed activities={activities} maxItems={5} />
        </div>

        {/* Upcoming Bookings */}
        <UpcomingBookings />
      </div>
    </div>
  );
}
