"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react";
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user?.role) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.userName || "User"}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your events</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-semibold text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">$24,500</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth</p>
              <p className="text-2xl font-semibold text-gray-900">+12.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="mb-8">
        <SubscriptionStatus />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New event created: Summer Conference 2024
                </p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Team member joined: Sarah Johnson
                </p>
                <p className="text-sm text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Event updated: Tech Meetup
                </p>
                <p className="text-sm text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 