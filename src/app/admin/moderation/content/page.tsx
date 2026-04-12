"use client";

import { useState, useEffect } from "react";
import {
  EyeIcon,
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import {
  FlagIcon as FlagSolidIcon,
  ExclamationTriangleIcon as ExclamationSolidIcon,
} from "@heroicons/react/24/solid";
import contentModerationService from "@/services/admin/content-moderation.service";
import { FlaggedContent, ModerationStats } from "@/types/content-moderation";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  removed: "bg-red-100 text-red-800",
  escalated: "bg-purple-100 text-purple-800",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const contentTypeLabels = {
  vendor_profile: "Vendor Profile",
  event_listing: "Event Listing",
  user_review: "User Review",
  comment: "Comment",
  message: "Message",
  portfolio_item: "Portfolio Item",
};

export default function ContentModerationPage() {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    contentType: "",
    priority: "",
    search: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState("flaggedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadFlaggedContent();
    loadStats();
  }, [currentPage, filters, sortBy, sortOrder]);

  const loadFlaggedContent = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(filters.status && { status: filters.status }),
        ...(filters.contentType && { contentType: filters.contentType as any }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.search && { search: filters.search }),
        sortBy,
        sortOrder,
      };

      const response = await contentModerationService.getFlaggedContent(params);
      setFlaggedContent(response.flaggedContent);
      setTotal(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error("Failed to load flagged content:", error);
      // Provide empty data when API is not available
      setFlaggedContent([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await contentModerationService.getModerationStats();
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to load moderation stats:", error);
      // Provide fallback stats
      setStats({
        totalFlagged: 0,
        pending: 0,
        approved: 0,
        removed: 0,
        escalated: 0,
        byContentType: {},
        byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
        averageResponseTime: 0,
        todayActions: 0,
        weekActions: 0,
      });
    }
  };

  const handleAction = async (
    contentId: string,
    action: "approve" | "remove" | "escalate",
    reason?: string
  ) => {
    try {
      switch (action) {
        case "approve":
          await contentModerationService.approveContent(contentId, reason);
          break;
        case "remove":
          await contentModerationService.removeContent(
            contentId,
            reason || "Inappropriate content"
          );
          break;
        case "escalate":
          await contentModerationService.updatePriority(contentId, "critical");
          break;
      }
      loadFlaggedContent();
      loadStats();
    } catch (error) {
      console.error(`Failed to ${action} content:`, error);
      alert(`Failed to ${action} content. Please try again.`);
    }
  };

  const handleBulkAction = async (action: "approve" | "remove" | "dismiss") => {
    if (selectedItems.length === 0) return;

    const reason = action === "remove" ? "Bulk moderation action" : undefined;

    if (
      confirm(
        `Are you sure you want to ${action} ${selectedItems.length} items?`
      )
    ) {
      try {
        await contentModerationService.bulkAction(
          action,
          selectedItems,
          reason
        );
        setSelectedItems([]);
        loadFlaggedContent();
        loadStats();
      } catch (error) {
        console.error(`Failed to ${action} content:`, error);
        alert(`Failed to ${action} content. Please try again.`);
      }
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <ExclamationSolidIcon className="h-5 w-5 text-red-600" />;
      case "high":
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <FlagIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Moderation
          </h1>
          <p className="text-gray-600">Review and moderate flagged content</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => contentModerationService.exportFlaggedContent()}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FlagIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Flagged
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalFlagged}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Removed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.removed}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg Response
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageResponseTime}h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              setFilters({ ...filters, contentType: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Types</option>
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
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-800 font-medium">
              {selectedItems.length} items selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction("approve")}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction("remove")}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Remove
              </button>
              <button
                onClick={() => handleBulkAction("dismiss")}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === flaggedContent.length &&
                      flaggedContent.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(
                          flaggedContent.map((item) => item._id)
                        );
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("content.title")}
                >
                  <div className="flex items-center">
                    Content
                    {sortBy === "content.title" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("priority")}
                >
                  <div className="flex items-center">
                    Priority
                    {sortBy === "priority" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("flaggedAt")}
                >
                  <div className="flex items-center">
                    Flagged At
                    {sortBy === "flaggedAt" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading flagged content...
                  </td>
                </tr>
              ) : flaggedContent.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No flagged content found
                  </td>
                </tr>
              ) : (
                flaggedContent.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item._id]);
                          } else {
                            setSelectedItems(
                              selectedItems.filter((id) => id !== item._id)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getPriorityIcon(item.priority)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.content.title || "Untitled Content"}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {item.content.description ||
                              item.content.text ||
                              "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {contentTypeLabels[item.contentType]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.reporter.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.reporter.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.category}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {item.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          priorityColors[item.priority]
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[item.status]
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.flaggedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedContent(item);
                            setShowDetailsModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {item.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAction(item._id, "approve")}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction(item._id, "remove")}
                              className="text-red-600 hover:text-red-900"
                              title="Remove"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction(item._id, "escalate")}
                              className="text-orange-600 hover:text-orange-900"
                              title="Escalate"
                            >
                              <ExclamationTriangleIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * 10 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, total)}
                    </span>{" "}
                    of <span className="font-medium">{total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? "z-10 bg-purple-50 border-purple-500 text-purple-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedContent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDetailsModal(false)}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Content Details
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Content Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Type:</span>{" "}
                          {contentTypeLabels[selectedContent.contentType]}
                        </div>
                        <div>
                          <span className="font-medium">Title:</span>{" "}
                          {selectedContent.content.title || "Untitled"}
                        </div>
                        <div>
                          <span className="font-medium">Author:</span>{" "}
                          {selectedContent.content.author.name}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {formatDate(selectedContent.content.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Report Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Reporter:</span>{" "}
                          {selectedContent.reporter.name}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>{" "}
                          {selectedContent.category}
                        </div>
                        <div>
                          <span className="font-medium">Priority:</span>
                          <span
                            className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              priorityColors[selectedContent.priority]
                            }`}
                          >
                            {selectedContent.priority}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <span
                            className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              statusColors[selectedContent.status]
                            }`}
                          >
                            {selectedContent.status}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Flagged:</span>{" "}
                          {formatDate(selectedContent.flaggedAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {selectedContent.content.description ||
                          selectedContent.content.text ||
                          "No content available"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Report Reason
                    </h4>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-700">
                        {selectedContent.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedContent.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleAction(selectedContent._id, "approve");
                        setShowDetailsModal(false);
                      }}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleAction(selectedContent._id, "remove");
                        setShowDetailsModal(false);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        handleAction(selectedContent._id, "escalate");
                        setShowDetailsModal(false);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Escalate
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
