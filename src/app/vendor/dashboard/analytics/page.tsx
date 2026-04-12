"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Eye,
  Star,
  Calendar,
  TrendingUp,
  Users,
  MessageSquare,
} from "lucide-react";
import StatsCard from "@/components/vendor/dashboard/StatsCard";

interface AnalyticsData {
  profileViews: {
    total: number;
    trend: { value: number; direction: "up" | "down" };
    daily: Array<{ date: string; views: number }>;
  };
  rating: {
    average: number;
    total: number;
  };
  eventListings: number;
  leads: number;
  bookings: number;
  reviews: number;
  leadStats?: {
    totalLeads: number;
    conversionRate: number;
    leadsByStatus: Array<{ status: string; count: number; percentage: number }>;
  };
  revenue?: {
    total: number;
    change: number;
  };
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { default: analyticsService } = await import(
          "@/services/analytics.service"
        );

        // Get analytics summary
        const summary = await analyticsService.getSummary();

        // Get lead statistics (optional)
        let leadStats;
        try {
          leadStats = await analyticsService.getLeadStats();
        } catch (error) {
          console.log("Lead stats not available:", error);
        }

        const analyticsData: AnalyticsData = {
          profileViews: {
            total: summary.profileViews?.total || 0,
            trend: {
              value: summary.profileViews?.change || 0,
              direction:
                (summary.profileViews?.change || 0) >= 0 ? "up" : "down",
            },
            daily: [], // Views over time not available from backend
          },
          rating: {
            average: summary.reviews?.averageRating || 0,
            total: summary.reviews?.total || 0,
          },
          eventListings: 0, // Not in summary, would need separate call
          leads: summary.leads?.total || 0,
          bookings: summary.bookings?.total || 0,
          reviews: summary.reviews?.total || 0,
          leadStats: leadStats
            ? {
                totalLeads: leadStats.totalLeads,
                conversionRate: leadStats.conversionRate,
                leadsByStatus: [
                  {
                    status: "new",
                    count: leadStats.newLeads,
                    percentage:
                      (leadStats.newLeads / leadStats.totalLeads) * 100,
                  },
                  {
                    status: "contacted",
                    count: leadStats.contactedLeads,
                    percentage:
                      (leadStats.contactedLeads / leadStats.totalLeads) * 100,
                  },
                  {
                    status: "quoted",
                    count: leadStats.quotedLeads,
                    percentage:
                      (leadStats.quotedLeads / leadStats.totalLeads) * 100,
                  },
                  {
                    status: "negotiating",
                    count: 0, // Not available in LeadStats interface
                    percentage: 0,
                  },
                  {
                    status: "won",
                    count: leadStats.wonLeads,
                    percentage:
                      (leadStats.wonLeads / leadStats.totalLeads) * 100,
                  },
                  {
                    status: "lost",
                    count: leadStats.lostLeads,
                    percentage:
                      (leadStats.lostLeads / leadStats.totalLeads) * 100,
                  },
                ].filter((item) => item.count > 0), // Only show statuses with counts > 0
              }
            : undefined,
          revenue: {
            total: summary.revenue?.total || 0,
            change: summary.revenue?.change || 0,
          },
        };

        setAnalytics(analyticsData);
      } catch (error: any) {
        console.error("Error fetching analytics:", error);
        // Set default analytics data on error
        setAnalytics({
          profileViews: {
            total: 0,
            trend: { value: 0, direction: "up" },
            daily: [],
          },
          rating: {
            average: 0,
            total: 0,
          },
          eventListings: 0,
          leads: 0,
          bookings: 0,
          reviews: 0,
          revenue: {
            total: 0,
            change: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your performance and insights
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {[
            { value: "7d", label: "7 Days" },
            { value: "30d", label: "30 Days" },
            { value: "90d", label: "90 Days" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value as typeof timeRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Profile Views"
          value={analytics.profileViews.total.toLocaleString()}
          icon={Eye}
          trend={analytics.profileViews.trend}
          color="purple"
        />
        <StatsCard
          title="Average Rating"
          value={analytics.rating.average.toFixed(1)}
          icon={Star}
          color="yellow"
          subtitle={`${analytics.rating.total} reviews`}
        />
        <StatsCard
          title="Total Revenue"
          value={`₦${analytics.revenue?.total.toLocaleString() || 0}`}
          icon={TrendingUp}
          trend={
            analytics.revenue
              ? {
                  value: analytics.revenue.change,
                  direction: analytics.revenue.change >= 0 ? "up" : "down",
                }
              : undefined
          }
          color="green"
        />
        <StatsCard
          title="Total Leads"
          value={analytics.leads}
          icon={Users}
          color="blue"
          subtitle={
            analytics.leadStats
              ? `${analytics.leadStats.conversionRate.toFixed(1)}% conversion`
              : undefined
          }
        />
        <StatsCard
          title="Bookings"
          value={analytics.bookings}
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Reviews"
          value={analytics.reviews}
          icon={MessageSquare}
          color="blue"
        />
      </div>

      {/* Profile Views Chart - Only show if we have daily data */}
      {analytics.profileViews.daily.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Views Over Time
          </h2>
          <div className="h-64 flex items-end justify-between gap-1">
            {analytics.profileViews.daily.map((day, index) => {
              const maxViews = Math.max(
                ...analytics.profileViews.daily.map((d) => d.views)
              );
              const height = (day.views / maxViews) * 100;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div
                    className="w-full bg-purple-600 rounded-t hover:bg-purple-700 transition-colors relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.views} views
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            <span>
              {new Date(
                analytics.profileViews.daily[0].date
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>
              {new Date(
                analytics.profileViews.daily[
                  analytics.profileViews.daily.length - 1
                ].date
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      )}

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lead Status Breakdown */}
        {analytics.leadStats && analytics.leadStats.leadsByStatus.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Lead Status Breakdown
            </h2>
            <div className="space-y-3">
              {analytics.leadStats.leadsByStatus.map((status) => (
                <div key={status.status} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                    {status.status}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {status.count} ({status.percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Conversion Rate
                </span>
                <span className="text-lg font-bold text-green-600">
                  {analytics.leadStats.conversionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Lead Status Breakdown
            </h2>
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No lead data available yet</p>
              <p className="text-sm mt-1">
                Start receiving leads to see analytics
              </p>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700">Profile Views</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.profileViews.total.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">Total Leads</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.leads}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Bookings</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.bookings}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-700">Avg Rating</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.rating.average.toFixed(1)} / 5.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
