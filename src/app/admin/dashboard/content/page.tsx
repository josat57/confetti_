"use client";

import { useState, useEffect } from "react";
import {
  FlaggedContent,
  ModerationStats,
  ContentType,
} from "@/types/content-moderation";
import FlaggedContentList from "@/components/admin/content/FlaggedContentList";
import ContentReviewModal from "@/components/admin/content/ContentReviewModal";
import contentModerationService from "@/services/admin/content-moderation.service";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ContentModerationPage() {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(
    null
  );
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "pending",
    contentType: "" as ContentType | "",
    priority: "",
  });
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [contentResponse, statsResponse] = await Promise.all([
        contentModerationService.getFlaggedContent({
          status: filters.status || undefined,
          contentType: filters.contentType || undefined,
          priority: filters.priority || undefined,
        }),
        contentModerationService.getModerationStats(),
      ]);

      setFlaggedContent(contentResponse.flaggedContent);
      setStats(statsResponse.stats);
    } catch (err: any) {
      console.error("Error fetching content:", err);
      setError(err.response?.data?.message || "Failed to load content");
      toast.error("Failed to load flagged content");

      // Fallback to mock data for development
      setFlaggedContent([
        {
          _id: "1",
          contentType: "vendor_profile",
          contentId: "vendor123",
          content: {
            title: "ABC Catering Services",
            description:
              "We provide the best catering services with inappropriate pricing and misleading claims.",
            author: {
              _id: "user1",
              name: "John Doe",
              email: "john@example.com",
              role: "vendor",
            },
            createdAt: new Date("2024-11-20"),
          },
          reporter: {
            _id: "user2",
            name: "Jane Smith",
            email: "jane@example.com",
          },
          reason:
            "This vendor profile contains misleading information about pricing and services.",
          category: "misleading",
          status: "pending",
          flaggedAt: new Date("2024-11-25"),
          priority: "high",
        },
        {
          _id: "2",
          contentType: "user_review",
          contentId: "review456",
          content: {
            text: "This is a fake review with offensive language and spam content.",
            author: {
              _id: "user3",
              name: "Bob Johnson",
              email: "bob@example.com",
              role: "user",
            },
            createdAt: new Date("2024-11-22"),
          },
          reporter: {
            _id: "user4",
            name: "Alice Brown",
            email: "alice@example.com",
          },
          reason: "Fake review with offensive language",
          category: "offensive",
          status: "pending",
          flaggedAt: new Date("2024-11-26"),
          priority: "critical",
        },
      ]);

      setStats({
        totalFlagged: 45,
        pending: 12,
        approved: 20,
        removed: 10,
        escalated: 3,
        byContentType: {
          vendor_profile: 15,
          event_listing: 10,
          user_review: 12,
          comment: 5,
          message: 2,
          portfolio_item: 1,
        },
        byPriority: {
          low: 10,
          medium: 20,
          high: 12,
          critical: 3,
        },
        averageResponseTime: 4.5,
        todayActions: 8,
        weekActions: 35,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contentId: string, reason?: string) => {
    try {
      const response = await contentModerationService.approveContent(
        contentId,
        reason
      );
      toast.success(response.message || "Content approved successfully");
      await fetchData();
      setSelectedContent(null);
    } catch (err: any) {
      console.error("Error approving content:", err);
      toast.error(err.response?.data?.message || "Failed to approve content");
    }
  };

  const handleRemove = async (contentId: string, reason: string) => {
    try {
      const response = await contentModerationService.removeContent(
        contentId,
        reason
      );
      toast.success(response.message || "Content removed successfully");
      await fetchData();
      setSelectedContent(null);
    } catch (err: any) {
      console.error("Error removing content:", err);
      toast.error(err.response?.data?.message || "Failed to remove content");
    }
  };

  const handleBanUser = async (
    contentId: string,
    userId: string,
    reason: string
  ) => {
    try {
      const response = await contentModerationService.banUser(
        contentId,
        userId,
        reason
      );
      toast.success(response.message || "User banned successfully");
      await fetchData();
      setSelectedContent(null);
    } catch (err: any) {
      console.error("Error banning user:", err);
      toast.error(err.response?.data?.message || "Failed to ban user");
    }
  };

  const handleEscalate = async (contentId: string, reason: string) => {
    try {
      const response = await contentModerationService.escalateContent(
        contentId,
        reason
      );
      toast.success(response.message || "Content escalated successfully");
      await fetchData();
      setSelectedContent(null);
    } catch (err: any) {
      console.error("Error escalating content:", err);
      toast.error(err.response?.data?.message || "Failed to escalate content");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    if (
      !confirm(`Are you sure you want to approve ${selectedIds.length} items?`)
    )
      return;

    try {
      const response = await contentModerationService.bulkApprove(selectedIds);
      toast.success(response.message);
      setSelectedIds([]);
      setBulkMode(false);
      await fetchData();
    } catch (err: any) {
      console.error("Error bulk approving:", err);
      toast.error(err.response?.data?.message || "Failed to bulk approve");
    }
  };

  const handleBulkRemove = async () => {
    if (selectedIds.length === 0) return;

    const reason = prompt("Please provide a reason for removing these items:");
    if (!reason) return;

    try {
      const response = await contentModerationService.bulkRemove(
        selectedIds,
        reason
      );
      toast.success(response.message);
      setSelectedIds([]);
      setBulkMode(false);
      await fetchData();
    } catch (err: any) {
      console.error("Error bulk removing:", err);
      toast.error(err.response?.data?.message || "Failed to bulk remove");
    }
  };

  const toggleSelectContent = (contentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(contentId)
        ? prev.filter((id) => id !== contentId)
        : [...prev, contentId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading content moderation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Moderation
          </h1>
          <p className="text-gray-600 mt-1">
            Review and moderate flagged content
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setBulkMode(!bulkMode);
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              bulkMode
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {bulkMode ? "Exit Bulk Mode" : "Bulk Actions"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">
                Pending
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Approved
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.approved}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Removed</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.removed}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                This Week
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {stats.weekActions}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Total</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalFlagged}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="removed">Removed</option>
              <option value="escalated">Escalated</option>
            </select>

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
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkMode && selectedIds.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-purple-900 font-medium">
              {selectedIds.length} item(s) selected
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve Selected
              </button>
              <button
                onClick={handleBulkRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content List */}
      <FlaggedContentList
        content={flaggedContent}
        onReview={setSelectedContent}
        onQuickApprove={(id) => handleApprove(id)}
        onQuickRemove={(id) => {
          const reason = prompt("Please provide a reason for removal:");
          if (reason) handleRemove(id, reason);
        }}
        bulkMode={bulkMode}
        selectedIds={selectedIds}
        onSelectContent={toggleSelectContent}
      />

      {/* Review Modal */}
      {selectedContent && (
        <ContentReviewModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onApprove={(reason) => handleApprove(selectedContent._id, reason)}
          onRemove={(reason) => handleRemove(selectedContent._id, reason)}
          onBanUser={(userId, reason) =>
            handleBanUser(selectedContent._id, userId, reason)
          }
          onEscalate={(reason) => handleEscalate(selectedContent._id, reason)}
        />
      )}
    </div>
  );
}
