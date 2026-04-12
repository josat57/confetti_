"use client";

import { useState, useEffect } from "react";
import {
  ModerationHistory,
  ContentType,
  ModerationAction,
} from "@/types/content-moderation";
import contentModerationService from "@/services/admin/content-moderation.service";
import {
  CheckCircle,
  XCircle,
  Ban,
  AlertTriangle,
  Loader2,
  Filter,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";

export default function ModerationHistoryPage() {
  const [history, setHistory] = useState<ModerationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    contentType: "" as ContentType | "",
    action: "" as ModerationAction | "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await contentModerationService.getAllModerationHistory({
        contentType: filters.contentType || undefined,
        action: filters.action || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });

      setHistory(response.history);
    } catch (err: any) {
      console.error("Error fetching history:", err);
      setError(err.response?.data?.message || "Failed to load history");
      toast.error("Failed to load moderation history");

      // Fallback to mock data
      setHistory([
        {
          _id: "1",
          contentId: "content1",
          contentType: "vendor_profile",
          action: "approve",
          reason: "Content meets community standards",
          performedBy: {
            _id: "admin1",
            name: "Admin User",
            email: "admin@example.com",
          },
          performedAt: new Date("2024-11-26T10:30:00"),
          details: {
            previousStatus: "pending",
            newStatus: "approved",
          },
        },
        {
          _id: "2",
          contentId: "content2",
          contentType: "user_review",
          action: "remove",
          reason: "Contains offensive language and spam",
          performedBy: {
            _id: "admin1",
            name: "Admin User",
            email: "admin@example.com",
          },
          performedAt: new Date("2024-11-26T09:15:00"),
          details: {
            previousStatus: "pending",
            newStatus: "removed",
          },
        },
        {
          _id: "3",
          contentId: "content3",
          contentType: "event_listing",
          action: "ban_user",
          reason: "Repeated violations of community guidelines",
          performedBy: {
            _id: "admin2",
            name: "Senior Admin",
            email: "senior@example.com",
          },
          performedAt: new Date("2024-11-25T16:45:00"),
          details: {
            previousStatus: "pending",
            newStatus: "removed",
            affectedUser: {
              _id: "user123",
              name: "Banned User",
              email: "banned@example.com",
            },
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: ModerationAction) => {
    switch (action) {
      case "approve":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "remove":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "ban_user":
        return <Ban className="w-5 h-5 text-red-600" />;
      case "escalate":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionBadge = (action: ModerationAction) => {
    const styles = {
      approve: "bg-green-100 text-green-800",
      remove: "bg-red-100 text-red-800",
      ban_user: "bg-red-100 text-red-800",
      escalate: "bg-orange-100 text-orange-800",
    };
    return styles[action] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading moderation history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderation History</h1>
        <p className="text-gray-600 mt-1">
          View all moderation actions taken on platform content
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.contentType}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  contentType: e.target.value as ContentType | "",
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Content Types</option>
              <option value="vendor_profile">Vendor Profile</option>
              <option value="event_listing">Event Listing</option>
              <option value="user_review">User Review</option>
              <option value="comment">Comment</option>
              <option value="message">Message</option>
              <option value="portfolio_item">Portfolio Item</option>
            </select>

            <select
              value={filters.action}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  action: e.target.value as ModerationAction | "",
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Actions</option>
              <option value="approve">Approve</option>
              <option value="remove">Remove</option>
              <option value="ban_user">Ban User</option>
              <option value="escalate">Escalate</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Start Date"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No History Found
            </h3>
            <p className="text-gray-600">
              No moderation actions match your filters
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item, index) => (
              <div key={item._id} className="relative">
                {/* Timeline Line */}
                {index < history.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                )}

                {/* History Item */}
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                    {getActionIcon(item.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionBadge(
                              item.action
                            )} capitalize`}
                          >
                            {item.action.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm text-gray-600 capitalize">
                            {item.contentType.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{item.reason}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(item.performedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Performed By */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4" />
                      <span>
                        By: {item.performedBy.name} ({item.performedBy.email})
                      </span>
                    </div>

                    {/* Additional Details */}
                    {item.details && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {item.details.previousStatus && (
                            <div>
                              <span className="text-gray-600">
                                Previous Status:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 capitalize">
                                {item.details.previousStatus}
                              </span>
                            </div>
                          )}
                          {item.details.newStatus && (
                            <div>
                              <span className="text-gray-600">New Status:</span>
                              <span className="ml-2 font-medium text-gray-900 capitalize">
                                {item.details.newStatus}
                              </span>
                            </div>
                          )}
                          {item.details.affectedUser && (
                            <div className="col-span-2">
                              <span className="text-gray-600">
                                Affected User:
                              </span>
                              <span className="ml-2 font-medium text-gray-900">
                                {item.details.affectedUser.name} (
                                {item.details.affectedUser.email})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
