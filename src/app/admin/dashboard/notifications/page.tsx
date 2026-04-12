"use client";

import { useState, useEffect } from "react";
import { NotificationFilters } from "@/types/notifications";
import notificationsService, {
  Notification,
  NotificationStats,
} from "@/services/admin/notifications.service";
import {
  Bell,
  Send,
  Calendar,
  FileText,
  Megaphone,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  X,
  Loader2,
  Mail,
  MessageSquare,
  Smartphone,
  Eye,
  MousePointer,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const notificationsRes = await notificationsService.getNotifications(
        filters
      );

      setNotifications(notificationsRes.notifications);
      setTotal(notificationsRes.total);

      // Set mock stats for now
      setStats({
        total: 1285,
        sent: 1250,
        scheduled: 15,
        draft: 8,
        failed: 12,
        totalDelivered: 1230,
        totalOpened: 556,
        totalClicked: 158,
        deliveryRate: 98.5,
        openRate: 45.2,
        clickRate: 12.8,
      });
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      toast.error("Failed to load notifications");

      // Mock data
      setStats({
        total: 1285,
        sent: 1250,
        scheduled: 15,
        draft: 8,
        failed: 12,
        totalDelivered: 1230,
        totalOpened: 556,
        totalClicked: 158,
        deliveryRate: 98.5,
        openRate: 45.2,
        clickRate: 12.8,
      });

      setNotifications([
        {
          _id: "1",
          title: "New Feature Announcement",
          message: "We've launched AI Event Planner! Check it out now.",
          type: "info",
          category: "system",
          priority: "high",
          recipients: { type: "all" },
          channels: ["in-app", "email"],
          status: "sent",
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          deliveryStats: {
            total: 1200,
            delivered: 1180,
            failed: 20,
            opened: 850,
            clicked: 320,
          },
          createdBy: {
            _id: "admin1",
            name: "Admin User",
            email: "admin@confetti.com",
          },
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          _id: "2",
          title: "Subscription Renewal Reminder",
          message: "Your subscription expires in 3 days. Renew now!",
          type: "reminder",
          category: "subscription",
          priority: "medium",
          recipients: {
            type: "role",
            roles: ["event-planner", "vendor"],
          },
          channels: ["email"],
          status: "scheduled",
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
          createdBy: {
            _id: "admin2",
            name: "Admin User 2",
            email: "admin2@confetti.com",
          },
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          _id: "3",
          title: "Maintenance Notice",
          message: "Scheduled maintenance on Sunday 2AM-4AM",
          type: "warning",
          category: "system",
          priority: "high",
          recipients: { type: "all" },
          channels: ["in-app"],
          status: "draft",
          createdBy: {
            _id: "admin1",
            name: "Admin User",
            email: "admin@confetti.com",
          },
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (notificationId: string) => {
    if (!confirm("Send this notification now?")) return;

    try {
      setActionLoading(notificationId);
      await notificationsService.sendNotification(notificationId);
      toast.success("Notification sent successfully");
      fetchData();
    } catch (err: any) {
      console.error("Error sending notification:", err);
      toast.error("Failed to send notification");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (notificationId: string) => {
    if (!confirm("Cancel this scheduled notification?")) return;

    try {
      setActionLoading(notificationId);
      await notificationsService.cancelNotification(notificationId);
      toast.success("Notification cancelled");
      fetchData();
    } catch (err: any) {
      console.error("Error cancelling notification:", err);
      toast.error("Failed to cancel notification");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm("Delete this notification?")) return;

    try {
      setActionLoading(notificationId);
      await notificationsService.deleteNotification(notificationId);
      toast.success("Notification deleted");
      fetchData();
    } catch (err: any) {
      console.error("Error deleting notification:", err);
      toast.error("Failed to delete notification");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Bell className="w-4 h-4" />;
      case "success":
        return <TrendingUp className="w-4 h-4" />;
      case "warning":
        return <Bell className="w-4 h-4" />;
      case "error":
        return <Bell className="w-4 h-4" />;
      case "reminder":
        return <Bell className="w-4 h-4" />;
      case "promotion":
        return <Megaphone className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "N/A";
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notification Management
          </h1>
          <p className="text-gray-600 mt-1">
            Send and manage platform notifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/notifications/templates"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-5 h-5" />
            Templates
          </Link>
          <Link
            href="/admin/dashboard/notifications/announcements"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Megaphone className="w-5 h-5" />
            Announcements
          </Link>
          <Link
            href="/admin/dashboard/notifications/create"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            Create Notification
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.sent}</p>
            <p className="text-sm text-gray-600 mt-1">Total Sent</p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.totalDelivered.toLocaleString()} delivered
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.scheduled}
            </p>
            <p className="text-sm text-gray-600 mt-1">Scheduled</p>
            <p className="text-xs text-gray-500 mt-2">{stats.draft} drafts</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.openRate}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg Open Rate</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <MousePointer className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.clickRate}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg Click Rate</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value as any,
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filters.type || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                type: e.target.value as any,
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="in-app">In-App</option>
            <option value="all">All Channels</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div key={notification._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                          notification.status
                        )}`}
                      >
                        {notification.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        {getTypeIcon(notification.type)}
                        {notification.type}
                      </span>
                      <span className="flex items-center gap-1">
                        Channels: {notification.channels.join(", ")}
                      </span>
                      {notification.scheduledFor && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(notification.scheduledFor)}
                        </span>
                      )}
                      {notification.sentAt && (
                        <span className="flex items-center gap-1">
                          <Send className="w-4 h-4" />
                          {formatDate(notification.sentAt)}
                        </span>
                      )}
                    </div>

                    {notification.deliveryStats && (
                      <div className="mt-3 flex items-center gap-6 text-sm">
                        <span className="text-gray-600">
                          Sent:{" "}
                          {notification.deliveryStats.total.toLocaleString()}
                        </span>
                        <span className="text-green-600">
                          Delivered: {notification.deliveryStats.delivered}
                        </span>
                        <span className="text-blue-600">
                          Opened: {notification.deliveryStats.opened}
                        </span>
                        <span className="text-purple-600">
                          Clicked: {notification.deliveryStats.clicked}
                        </span>
                        {notification.deliveryStats.failed > 0 && (
                          <span className="text-red-600">
                            Failed: {notification.deliveryStats.failed}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {notification.status === "draft" && (
                    <button
                      onClick={() => handleSend(notification._id)}
                      disabled={actionLoading === notification._id}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                      title="Send Now"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}

                  {notification.status === "scheduled" && (
                    <button
                      onClick={() => handleCancel(notification._id)}
                      disabled={actionLoading === notification._id}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg disabled:opacity-50"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <Link
                    href={`/admin/dashboard/notifications/${notification._id}`}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(notification._id)}
                    disabled={actionLoading === notification._id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {total > (filters.limit || 20) && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to{" "}
              {Math.min((filters.page || 1) * (filters.limit || 20), total)} of{" "}
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
                  Math.ceil(total / (filters.limit || 20))
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
