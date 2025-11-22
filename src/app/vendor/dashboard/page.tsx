"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import StatsCard from "@/components/vendor/dashboard/StatsCard";
import ActivityFeed from "@/components/vendor/dashboard/ActivityFeed";
import UpcomingBookings from "@/components/vendor/dashboard/UpcomingBookings";
import QuickActions from "@/components/vendor/dashboard/QuickActions";
import { Eye, Users, Calendar, Star } from "lucide-react";

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    views: 0,
    leads: 0,
    bookings: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<
    Array<{
      id: string;
      type: "view" | "review" | "lead" | "booking" | "message" | "payment";
      title: string;
      description: string;
      timestamp: Date;
    }>
  >([]);

  useEffect(() => {
    // TODO: Fetch real stats from API
    // For now, using mock data
    setStats({
      views: 234,
      leads: 12,
      bookings: 5,
      rating: 4.8,
    });

    // Mock activity data
    setActivities([
      {
        id: "1",
        type: "lead",
        title: "New Lead Received",
        description: "Sarah Johnson inquired about wedding photography",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
      },
      {
        id: "2",
        type: "review",
        title: "New Review",
        description: "Michael Brown left a 5-star review",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: "3",
        type: "booking",
        title: "Booking Confirmed",
        description: "Wedding event on June 15, 2024",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
      {
        id: "4",
        type: "view",
        title: "Profile Viewed",
        description: "Your profile was viewed 23 times today",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
      {
        id: "5",
        type: "message",
        title: "New Message",
        description: "Emma Davis sent you a message",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ]);

    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user?.userName || "Vendor"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Profile Views"
          value={stats.views}
          icon={<Eye className="w-6 h-6" />}
          trend={{ value: 12, direction: "up" }}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="New Leads"
          value={stats.leads}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 8, direction: "up" }}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Bookings"
          value={stats.bookings}
          icon={<Calendar className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Average Rating"
          value={stats.rating.toFixed(1)}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
          loading={loading}
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
