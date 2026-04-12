"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import announcementsService, {
  Announcement,
  CreateAnnouncementRequest,
} from "@/services/admin/announcements.service";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Archive,
  Filter,
  Search,
} from "lucide-react";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    archived: 0,
    totalViews: 0,
  });

  const [formData, setFormData] = useState<CreateAnnouncementRequest>({
    title: "",
    content: "",
    type: "info",
    priority: "medium",
    targetAudience: "all",
    status: "draft",
    scheduledFor: "",
    expiresAt: "",
    isSticky: false,
  });

  useEffect(() => {
    loadData();
  }, [filterStatus, filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [announcementsData, statsData] = await Promise.all([
        announcementsService.getAnnouncements({
          status: filterStatus || undefined,

          type: filterType || undefined,
        }),
        announcementsService.getStatistics(),
      ]);
      setAnnouncements(announcementsData.announcements);
      setStats(statsData.stats);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load announcements");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        const response = await announcementsService.updateAnnouncement(
          editingAnnouncement._id,
          formData
        );
        toast.success(response.message);
      } else {
        const response = await announcementsService.createAnnouncement(
          formData
        );
        toast.success(response.message);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save announcement"
      );
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      status:
        announcement.status === "archived" ? "draft" : announcement.status,
      scheduledFor: announcement.scheduledFor
        ? new Date(announcement.scheduledFor).toISOString().slice(0, 16)
        : "",
      expiresAt: announcement.expiresAt
        ? new Date(announcement.expiresAt).toISOString().slice(0, 16)
        : "",
      isSticky: announcement.isSticky || false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const response = await announcementsService.deleteAnnouncement(id);
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete announcement"
      );
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await announcementsService.publishAnnouncement(id);
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to publish announcement"
      );
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const response = await announcementsService.archiveAnnouncement(id);
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to archive announcement"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "info",
      priority: "medium",
      targetAudience: "all",
      status: "draft",
      scheduledFor: "",
      expiresAt: "",
      isSticky: false,
    });
    setEditingAnnouncement(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-purple-100 text-purple-800";
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
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "archived":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-2">
          Create and manage system-wide announcements
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Archived</p>
          <p className="text-2xl font-bold text-purple-600">{stats.archived}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Views</p>
          <p className="text-2xl font-bold text-indigo-600">
            {stats.totalViews}
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search announcements..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="maintenance">Maintenance</option>
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
            New Announcement
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No announcements found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.isSticky && (
                      <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                        Pinned
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getTypeColor(
                        announcement.type
                      )}`}
                    >
                      {announcement.type}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(
                        announcement.priority
                      )}`}
                    >
                      {announcement.priority}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                        announcement.status
                      )}`}
                    >
                      {announcement.status}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                      {announcement.targetAudience}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      Created:{" "}
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                    {announcement.publishedAt && (
                      <span>
                        Published:{" "}
                        {new Date(
                          announcement.publishedAt
                        ).toLocaleDateString()}
                      </span>
                    )}
                    {announcement.views !== undefined && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {announcement.views} views
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {announcement.status === "draft" && (
                    <button
                      onClick={() => handlePublish(announcement._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Publish"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {announcement.status !== "archived" && (
                    <button
                      onClick={() => handleArchive(announcement._id)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                      title="Archive"
                    >
                      <Archive className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(announcement._id)}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
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
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter announcement content"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="maintenance">Maintenance</option>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <select
                    required
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Users</option>
                    <option value="planners">Event Planners</option>
                    <option value="vendors">Vendors</option>
                    <option value="admins">Admins</option>
                  </select>
                </div>

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
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              {formData.status === "scheduled" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule For
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledFor: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

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

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isSticky}
                    onChange={(e) =>
                      setFormData({ ...formData, isSticky: e.target.checked })
                    }
                    className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Pin this announcement (appears at top)
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingAnnouncement ? "Update" : "Create"} Announcement
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
    </div>
  );
}
