"use client";

import { AdminUserView, UserActivityRecord } from "@/types/user-admin";
import {
  X,
  Mail,
  Phone,
  Calendar,
  Activity,
  DollarSign,
  Ban,
  Trash2,
  Edit,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserProfileProps {
  user: AdminUserView;
  activities: UserActivityRecord[];
  onClose: () => void;
  onUpdate: (data: Partial<AdminUserView>) => void;
  onSuspend: () => void;
  onDelete: () => void;
}

export default function UserProfile({
  user,
  activities,
  onClose,
  onUpdate,
  onSuspend,
  onDelete,
}: UserProfileProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - User Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {user.phone}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Role</label>
                    <div className="mt-1">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : user.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        } capitalize`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Registered</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {user.lastLogin && (
                    <div>
                      <label className="text-sm text-gray-600">
                        Last Login
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDistanceToNow(new Date(user.lastLogin), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {user.eventsCreated || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Events Created
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {user.bookingsMade || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Bookings Made
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₦{(user.totalSpent || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Total Spent
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activities.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recent activity
                    </p>
                  ) : (
                    activities.map((activity) => (
                      <div
                        key={activity._id}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg"
                      >
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      /* Edit user */
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit User
                  </button>

                  <button
                    onClick={onSuspend}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    {user.status === "suspended"
                      ? "Activate User"
                      : "Suspend User"}
                  </button>

                  <button
                    onClick={onDelete}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </button>
                </div>
              </div>

              {user.subscriptionTier && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Subscription
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">
                        Current Tier
                      </label>
                      <div className="mt-1">
                        <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 capitalize">
                          {user.subscriptionTier}
                        </span>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Manage Subscription
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
