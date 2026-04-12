"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import notificationsService, {
  Notification,
  CreateNotificationRequest,
  NotificationTemplate,
} from "@/services/admin/notifications.service";

// Form data interface that matches the actual form fields
interface NotificationFormData {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "reminder" | "promotion";
  category:
    | "system"
    | "account"
    | "event"
    | "payment"
    | "subscription"
    | "security"
    | "marketing";
  priority: "low" | "medium" | "high" | "urgent";
  recipients: {
    type: "all" | "specific" | "role" | "segment";
    roles?: string[];
    tiers?: string[];
    locations?: string[];
    userIds?: string[];
  };
  channels: string[];
  status: "draft" | "scheduled" | "sent";
  scheduledFor: string;
  actionUrl: string;
  actionLabel: string;
  expiresAt: string;
}
import {
  Plus,
  Edit,
  Trash2,
  Send,
  X,
  Search,
  Filter,
  Eye,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<
    "list" | "templates" | "analytics"
  >("list");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [deliveryReport, setDeliveryReport] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    scheduled: 0,
    draft: 0,
    failed: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
  });

  const [formData, setFormData] = useState<NotificationFormData>({
    title: "",
    message: "",
    type: "info",
    category: "system",
    priority: "medium",
    recipients: {
      type: "all",
    },
    channels: ["in-app"],
    status: "draft",
    scheduledFor: "",
    actionUrl: "",
    actionLabel: "",
    expiresAt: "",
  });

  useEffect(() => {
    loadData();
  }, [activeTab, filterStatus, filterType, filterCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "list") {
        const [notificationsData, statsData] = await Promise.all([
          notificationsService.getNotifications({
            status: filterStatus || undefined,
            type: filterType || undefined,
            category: filterCategory || undefined,
          }),
          notificationsService.getStatistics(),
        ]);
        setNotifications(notificationsData.notifications);
        setStats(statsData.stats);
      } else if (activeTab === "templates") {
        const templatesData = await notificationsService.getTemplates();
        setTemplates(templatesData.templates);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Transform form data to match service interface
      const serviceData: Partial<CreateNotificationRequest> = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        category: formData.category,
        priority: formData.priority,
        recipients: formData.recipients,
        channels: formData.channels as ("in-app" | "email" | "sms" | "push")[],
        status: formData.status,
        scheduledFor: formData.scheduledFor || undefined,
        actionUrl: formData.actionUrl || undefined,
        actionLabel: formData.actionLabel || undefined,
        expiresAt: formData.expiresAt || undefined,
      };

      if (editingNotification) {
        const response = await notificationsService.updateNotification(
          editingNotification._id,
          serviceData
        );
        toast.success(response.message);
      } else {
        const response = await notificationsService.createNotification(
          serviceData as CreateNotificationRequest
        );
        toast.success(response.message);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save notification"
      );
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);

    // Map service status to form status
    let formStatus: "draft" | "scheduled" | "sent" = "draft";
    if (notification.status === "scheduled") {
      formStatus = "scheduled";
    } else if (notification.status === "sent") {
      formStatus = "sent";
    } else {
      // For all other statuses (draft, cancelled, failed, sending), default to draft
      formStatus = "draft";
    }

    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category,
      priority: notification.priority,
      recipients: notification.recipients,
      channels: notification.channels,
      status: formStatus,
      scheduledFor: notification.scheduledFor
        ? new Date(notification.scheduledFor).toISOString().slice(0, 16)
        : "",
      actionUrl: notification.actionUrl || "",
      actionLabel: notification.actionLabel || "",
      expiresAt: notification.expiresAt
        ? new Date(notification.expiresAt).toISOString().slice(0, 16)
        : "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      const response = await notificationsService.deleteNotification(id);
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete notification"
      );
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm("Are you sure you want to send this notification now?"))
      return;
    try {
      const response = await notificationsService.sendNotification(id);
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to send notification"
      );
    }
  };

  const handleCancel = async (id: string) => {
    if (
      !confirm("Are you sure you want to cancel this scheduled notification?")
    )
      return;
    try {
      const response = await notificationsService.cancelNotification(id);
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to cancel notification"
      );
    }
  };

  const handleResend = async (id: string) => {
    if (!confirm("Are you sure you want to resend this notification?")) return;
    try {
      const response = await notificationsService.resendNotification(id);
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to resend notification"
      );
    }
  };

  const handleViewReport = async (notification: Notification) => {
    try {
      const reportData = await notificationsService.getDeliveryReport(
        notification._id
      );
      setDeliveryReport(reportData.report);
      setSelectedNotification(notification);
      setShowReportModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load report");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      category: "system",
      priority: "medium",
      recipients: {
        type: "all",
      },
      channels: ["in-app"],
      status: "draft",
      scheduledFor: "",
      actionUrl: "",
      actionLabel: "",
      expiresAt: "",
    });
    setEditingNotification(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "reminder":
        return "bg-purple-100 text-purple-800";
      case "promotion":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "sending":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-purple-100 text-purple-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4" />;
      case "sending":
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case "scheduled":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">
          Send and manage notifications across multiple channels
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "list", label: "Notifications", icon: Send },
            { id: "templates", label: "Templates", icon: Filter },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Statistics */}
      {activeTab === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Notifications</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Sent</p>
            <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Scheduled</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.scheduled}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Rate</h3>
              <div className="text-4xl font-bold text-green-600">
                {stats.deliveryRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.totalDelivered} of {stats.sent} delivered
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Open Rate</h3>
              <div className="text-4xl font-bold text-blue-600">
                {stats.openRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.totalOpened} notifications opened
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Click Rate</h3>
              <div className="text-4xl font-bold text-purple-600">
                {stats.clickRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.totalClicked} actions taken
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Delivery Success</span>
                  <span>{stats.deliveryRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${stats.deliveryRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Open Rate</span>
                  <span>{stats.openRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${stats.openRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Click-through Rate</span>
                  <span>{stats.clickRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${stats.clickRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template._id}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {template.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <strong>Title:</strong> {template.title}
                    </p>
                    <p className="text-sm">
                      <strong>Type:</strong> {template.type}
                    </p>
                    <p className="text-sm">
                      <strong>Category:</strong> {template.category}
                    </p>
                    {template.variables.length > 0 && (
                      <p className="text-sm">
                        <strong>Variables:</strong>{" "}
                        {template.variables.join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      // Use template logic here
                      toast.info("Template feature coming soon");
                    }}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications List Tab */}
      {activeTab === "list" && (
        <>
          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                  <option value="failed">Failed</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="reminder">Reminder</option>
                  <option value="promotion">Promotion</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Categories</option>
                  <option value="system">System</option>
                  <option value="account">Account</option>
                  <option value="event">Event</option>
                  <option value="payment">Payment</option>
                  <option value="subscription">Subscription</option>
                  <option value="security">Security</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-5 h-5" />
                New Notification
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                            notification.status
                          )}`}
                        >
                          {getStatusIcon(notification.status)}
                          {notification.status}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {notification.type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(
                            notification.priority
                          )}`}
                        >
                          {notification.priority}
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                          {notification.category}
                        </span>
                        {notification.channels.map((channel) => (
                          <span
                            key={channel}
                            className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded"
                          >
                            {channel}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Recipients: {notification.recipients?.type || "N/A"}
                        </span>
                        <span>
                          Created:{" "}
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </span>
                        {notification.sentAt && (
                          <span>
                            Sent:{" "}
                            {new Date(notification.sentAt).toLocaleDateString()}
                          </span>
                        )}
                        {notification.deliveryStats && (
                          <span>
                            Delivered: {notification.deliveryStats.delivered}/
                            {notification.deliveryStats.total}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {notification.status === "sent" && (
                        <button
                          onClick={() => handleViewReport(notification)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Report"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      {notification.status === "draft" && (
                        <button
                          onClick={() => handleSend(notification._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Send Now"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      )}
                      {notification.status === "scheduled" && (
                        <button
                          onClick={() => handleCancel(notification._id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Cancel"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      {notification.status === "failed" && (
                        <button
                          onClick={() => handleResend(notification._id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Resend"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                      )}
                      {(notification.status === "draft" ||
                        notification.status === "scheduled") && (
                        <button
                          onClick={() => handleEdit(notification)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingNotification ? "Edit Notification" : "New Notification"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter notification message"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="reminder">Reminder</option>
                    <option value="promotion">Promotion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="system">System</option>
                    <option value="account">Account</option>
                    <option value="event">Event</option>
                    <option value="payment">Payment</option>
                    <option value="subscription">Subscription</option>
                    <option value="security">Security</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients *
                </label>
                <select
                  required
                  value={formData.recipients.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipients: {
                        ...formData.recipients,
                        type: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Users</option>
                  <option value="role">By Role</option>
                  <option value="segment">By Segment</option>
                  <option value="specific">Specific Users</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channels *
                </label>
                <div className="space-y-2">
                  {["in-app", "email", "sms", "push"].map((channel) => (
                    <label key={channel} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes(channel as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              channels: [...formData.channels, channel as any],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              channels: formData.channels.filter(
                                (c) => c !== channel
                              ),
                            });
                          }
                        }}
                        className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {channel}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Send Now</option>
                  </select>
                </div>

                {formData.status === "scheduled" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule For *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.scheduledFor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledFor: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.actionUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, actionUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.actionLabel}
                    onChange={(e) =>
                      setFormData({ ...formData, actionLabel: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="View Details"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingNotification ? "Update" : "Create"} Notification
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Report Modal */}
      {showReportModal && selectedNotification && deliveryReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Delivery Report: {selectedNotification.title}
              </h2>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedNotification(null);
                  setDeliveryReport(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deliveryReport.total}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">
                    {deliveryReport.delivered}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {deliveryReport.failed}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Opened</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {deliveryReport.opened}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Clicked</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {deliveryReport.clicked}
                  </p>
                </div>
              </div>

              {/* Delivery Details Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Channel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivered At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opened At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveryReport.deliveryDetails.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No delivery details available
                        </td>
                      </tr>
                    ) : (
                      deliveryReport.deliveryDetails.map(
                        (detail: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {detail.userName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {detail.channel}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                  detail.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : detail.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {detail.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {detail.deliveredAt
                                ? new Date(detail.deliveredAt).toLocaleString()
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {detail.openedAt
                                ? new Date(detail.openedAt).toLocaleString()
                                : "-"}
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
