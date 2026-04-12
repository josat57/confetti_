"use client";

import { useState, useEffect } from "react";
import {
  AdminActivityLog,
  AdminActivityFilters,
} from "@/types/admin-management";
import adminManagementService from "@/services/admin/admin-management.service";
import {
  Activity,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  FileText,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<AdminActivityFilters>({
    page: 1,
    limit: 50,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await adminManagementService.getActivityLogs(filters);
      setActivities(response.activities);
      setTotal(response.total);
    } catch (err: any) {
      console.error("Error fetching activity logs:", err);
      toast.error("Failed to load activity logs");

      // Mock data
      setActivities([
        {
          _id: "1",
          adminId: "1",
          adminName: "John Doe",
          adminEmail: "john@confetti.com",
          action: "UPDATE",
          resource: "user",
          resourceId: "user123",
          details: "Updated user profile",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0...",
          timestamp: new Date(),
        },
        {
          _id: "2",
          adminId: "2",
          adminName: "Jane Smith",
          adminEmail: "jane@confetti.com",
          action: "DELETE",
          resource: "content",
          resourceId: "content456",
          details: "Removed flagged content",
          ipAddress: "192.168.1.2",
          userAgent: "Mozilla/5.0...",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await adminManagementService.exportActivityLogs(filters);
      window.open(response.downloadUrl, "_blank");
      toast.success("Export started");
    } catch (err: any) {
      console.error("Error exporting logs:", err);
      toast.error("Failed to export logs");
    } finally {
      setExporting(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return "text-green-600 bg-green-50";
      case "UPDATE":
        return "text-blue-600 bg-blue-50";
      case "DELETE":
        return "text-red-600 bg-red-50";
      case "VIEW":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-purple-600 bg-purple-50";
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard/admins"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-600 mt-1">
              Track all admin actions and changes
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search admin..."
              value={filters.adminId || ""}
              onChange={(e) =>
                setFilters({ ...filters, adminId: e.target.value, page: 1 })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.action || ""}
            onChange={(e) =>
              setFilters({ ...filters, action: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="VIEW">View</option>
          </select>

          <select
            value={filters.resource || ""}
            onChange={(e) =>
              setFilters({ ...filters, resource: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Resources</option>
            <option value="user">Users</option>
            <option value="vendor">Vendors</option>
            <option value="content">Content</option>
            <option value="subscription">Subscriptions</option>
            <option value="settings">Settings</option>
          </select>

          <input
            type="date"
            value={
              filters.startDate
                ? new Date(filters.startDate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                startDate: e.target.value
                  ? new Date(e.target.value)
                  : undefined,
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={activity._id} className="relative">
                {index !== activities.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
                )}

                <div className="flex gap-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(
                      activity.action
                    )}`}
                  >
                    <Activity className="w-4 h-4" />
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.adminName}
                          <span className="text-gray-500 font-normal ml-2">
                            {activity.action.toLowerCase()}d
                          </span>
                          <span className="text-gray-900 font-normal ml-1">
                            {activity.resource}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.details}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getActionColor(
                          activity.action
                        )}`}
                      >
                        {activity.action}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {activity.adminEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      <span>IP: {activity.ipAddress}</span>
                      {activity.resourceId && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          ID: {activity.resourceId.substring(0, 8)}...
                        </span>
                      )}
                    </div>

                    {activity.changes && (
                      <details className="mt-3">
                        <summary className="text-sm text-purple-600 cursor-pointer hover:text-purple-700">
                          View changes
                        </summary>
                        <pre className="mt-2 p-3 bg-white rounded border border-gray-200 text-xs overflow-x-auto">
                          {JSON.stringify(activity.changes, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {total > (filters.limit || 50) && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {((filters.page || 1) - 1) * (filters.limit || 50) + 1} to{" "}
              {Math.min((filters.page || 1) * (filters.limit || 50), total)} of{" "}
              {total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setFilters({ ...filters, page: (filters.page || 1) - 1 })
                }
                disabled={(filters.page || 1) === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: (filters.page || 1) + 1 })
                }
                disabled={
                  (filters.page || 1) >=
                  Math.ceil(total / (filters.limit || 50))
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
