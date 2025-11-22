"use client";

import { GuestStats } from "@/types/guest";
import { CheckCircle, XCircle, Clock, HelpCircle, Users } from "lucide-react";

interface RSVPTrackerProps {
  stats: GuestStats;
}

export default function RSVPTracker({ stats }: RSVPTrackerProps) {
  const acceptanceRate =
    stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  const rsvpData = [
    {
      label: "Accepted",
      count: stats.accepted,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      percentage: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0,
    },
    {
      label: "Declined",
      count: stats.declined,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      percentage: stats.total > 0 ? (stats.declined / stats.total) * 100 : 0,
    },
    {
      label: "Maybe",
      count: stats.maybe,
      icon: HelpCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      percentage: stats.total > 0 ? (stats.maybe / stats.total) * 100 : 0,
    },
    {
      label: "Pending",
      count: stats.pending,
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      percentage: stats.total > 0 ? (stats.pending / stats.total) * 100 : 0,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">RSVP Tracker</h3>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">
            {stats.total} Total Guests
          </span>
        </div>
      </div>

      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Response Rate
          </span>
          <span className="text-sm font-medium text-gray-900">
            {stats.total > 0
              ? Math.round(
                  ((stats.accepted + stats.declined + stats.maybe) /
                    stats.total) *
                    100
                )
              : 0}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-teal-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${
                stats.total > 0
                  ? ((stats.accepted + stats.declined + stats.maybe) /
                      stats.total) *
                    100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Acceptance Rate */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-800 font-medium">
              Acceptance Rate
            </p>
            <p className="text-3xl font-bold text-green-900 mt-1">
              {acceptanceRate}%
            </p>
          </div>
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <p className="text-sm text-green-700 mt-2">
          {stats.accepted} out of {stats.total} guests accepted
        </p>
      </div>

      {/* RSVP Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">RSVP Breakdown</h4>
        {rsvpData.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${item.bgColor}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {Math.round(item.percentage)}%
                  </span>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    item.label === "Accepted"
                      ? "bg-green-500"
                      : item.label === "Declined"
                      ? "bg-red-500"
                      : item.label === "Maybe"
                      ? "bg-yellow-500"
                      : "bg-gray-400"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Check-in Status */}
      {stats.checkedIn > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Checked In
            </span>
            <span className="text-sm font-semibold text-teal-600">
              {stats.checkedIn} / {stats.accepted}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  stats.accepted > 0
                    ? (stats.checkedIn / stats.accepted) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {stats.accepted + (stats.maybe || 0)}
          </p>
          <p className="text-sm text-gray-600">Expected Attendees</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-600">Awaiting Response</p>
        </div>
      </div>
    </div>
  );
}
