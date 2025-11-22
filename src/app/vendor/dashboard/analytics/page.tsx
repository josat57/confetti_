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
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockData: AnalyticsData = {
          profileViews: {
            total: 1247,
            trend: { value: 12.5, direction: "up" },
            daily: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              views: Math.floor(Math.random() * 50) + 20,
            })),
          },
          rating: {
            average: 4.8,
            total: 156,
          },
          eventListings: 12,
          leads: 34,
          bookings: 8,
          reviews: 156,
        };

        setAnalytics(mockData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
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
        />
        <StatsCard
          title="Event Listings"
          value={analytics.eventListings}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Total Leads"
          value={analytics.leads}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Bookings"
          value={analytics.bookings}
          icon={TrendingUp}
          color="purple"
        />
        <StatsCard
          title="Reviews"
          value={analytics.reviews}
          icon={MessageSquare}
          color="blue"
        />
      </div>

      {/* Profile Views Chart */}
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
            {new Date(analytics.profileViews.daily[0].date).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            )}
          </span>
          <span>
            {new Date(
              analytics.profileViews.daily[
                analytics.profileViews.daily.length - 1
              ].date
            ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Rating Breakdown
          </h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const percentage = Math.random() * 100;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-700">
                      {stars}
                    </span>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Events */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Events
          </h2>
          <div className="space-y-3">
            {[
              { name: "Beautiful Garden Wedding", views: 342 },
              { name: "Corporate Gala Event", views: 289 },
              { name: "Birthday Celebration", views: 234 },
            ].map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-900">{event.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {event.views}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
