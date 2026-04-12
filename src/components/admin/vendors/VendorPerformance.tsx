"use client";

import { VendorPerformance } from "@/types/vendor-admin";
import { TrendingUp, Star, Clock, CheckCircle, DollarSign } from "lucide-react";

interface VendorPerformanceProps {
  performance: VendorPerformance;
}

export default function VendorPerformanceMetrics({
  performance,
}: VendorPerformanceProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Performance Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Bookings */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Total Bookings
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {performance.totalBookings}
          </p>
        </div>

        {/* Completion Rate */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Completion Rate
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {performance.completionRate}%
          </p>
        </div>

        {/* Average Rating */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">
              Average Rating
            </span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {performance.averageRating.toFixed(1)}
            <span className="text-sm text-yellow-700 ml-1">
              ({performance.totalReviews})
            </span>
          </p>
        </div>

        {/* Total Revenue */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Total Revenue
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            ₦{(performance.totalRevenue / 1000).toFixed(0)}K
          </p>
        </div>

        {/* Response Time */}
        <div className="p-4 bg-teal-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-teal-900">
              Avg Response Time
            </span>
          </div>
          <p className="text-2xl font-bold text-teal-600">
            {performance.responseTime}h
          </p>
        </div>

        {/* Completed Bookings */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {performance.completedBookings}
            <span className="text-sm text-gray-600 ml-1">
              / {performance.totalBookings}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
