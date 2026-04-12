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
  ChatBubbleLeftRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon as ExclamationSolidIcon } from "@heroicons/react/24/solid";
import reportsService, {
  Report,
  ReportStats,
} from "@/services/admin/reports.service";

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  investigating: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-gray-100 text-gray-800",
  escalated: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const typeLabels = {
  user: "User Report",
  content: "Content Report",
  event: "Event Report",
  vendor: "Vendor Report",
  abuse: "Abuse Report",
  spam: "Spam Report",
  inappropriate: "Inappropriate Content",
  financial: "Financial Report",
  compliance: "Compliance Report",
  generated: "Generated Report",
  user_report: "User Report",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<
    "resolve" | "dismiss" | "escalate" | "assign"
  >("resolve");
  const [actionReason, setActionReason] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    priority: "",
    assignedTo: "",
    search: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadReports();
    loadStats();
  }, [currentPage, filters, sortBy, sortOrder]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
        ...(filters.search && { search: filters.search }),
        sortBy,
        sortOrder,
      };

      const response = await reportsService.getReports(params);
      setReports(response.reports);
      setTotal(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error("Failed to load reports:", error);
      // Provide empty data when API is not available
      setReports([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await reportsService.getReportStats();
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to load report stats:", error);
      // Provide fallback stats
      setStats({
        totalReports: 0,
        openReports: 0,
        investigatingReports: 0,
        resolvedReports: 0,
        dismissedReports: 0,
        escalatedReports: 0,
        byType: {
          user: 0,
          content: 0,
          event: 0,
          vendor: 0,
          abuse: 0,
          spam: 0,
          inappropriate: 0,
        },
        byStatus: {
          completed: 0,
          pending: 0,
          failed: 0,
          open: 0,
          investigating: 0,
          resolved: 0,
          dismissed: 0,
          escalated: 0,
        },
        byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
        averageResolutionTime: 0,
        todayReports: 0,
        weekReports: 0,
      });
    }
  };

  const handleAction = async (
    reportId: string,
    action: string,
    reason?: string
  ) => {
    try {
      switch (action) {
        case "resolve":
          await reportsService.resolveReport(
            reportId,
            "resolved",
            reason || "Report resolved"
          );
          break;
        case "dismiss":
          await reportsService.dismissReport(
            reportId,
            reason || "Report dismissed"
          );
          break;
        case "escalate":
          await reportsService.escalateReport(
            reportId,
            reason || "Report escalated"
          );
          break;
        case "investigating":
          await reportsService.updateReportStatus(
            reportId,
            "investigating",
            reason
          );
          break;
      }
      loadReports();
      loadStats();
    } catch (error) {
      console.error(`Failed to ${action} report:`, error);
      alert(`Failed to ${action} report. Please try again.`);
    }
  };

  const handleBulkAction = async (
    action: "resolve" | "dismiss" | "investigating"
  ) => {
    if (selectedItems.length === 0) return;

    if (
      confirm(
        `Are you sure you want to ${action} ${selectedItems.length} reports?`
      )
    ) {
      try {
        await reportsService.bulkUpdateStatus(
          selectedItems,
          action as any,
          `Bulk ${action} action`
        );
        setSelectedItems([]);
        loadReports();
        loadStats();
      } catch (error) {
        console.error(`Failed to ${action} reports:`, error);
        alert(`Failed to ${action} reports. Please try again.`);
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

  const handleActionSubmit = async () => {
    if (!selectedReport) return;

    try {
      await handleAction(selectedReport._id, actionType, actionReason);
      setShowActionModal(false);
      setActionReason("");
      setSelectedReport(null);
    } catch (error) {
      console.error("Failed to perform action:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports Management
          </h1>
          <p className="text-gray-600">Manage user reports and complaints</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => reportsService.exportReports()}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FlagIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Reports
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalReports}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.openReports || stats.byStatus?.open || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Investigating
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.investigatingReports ||
                    stats.byStatus?.investigating ||
                    0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.resolvedReports ||
                    stats.byStatus?.resolved ||
                    stats.byStatus?.completed ||
                    0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dismissed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.dismissedReports || stats.byStatus?.dismissed || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg Resolution
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageResolutionTime || 0}h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="user">User Report</option>
            <option value="content">Content Report</option>
            <option value="event">Event Report</option>
            <option value="vendor">Vendor Report</option>
            <option value="abuse">Abuse Report</option>
            <option value="spam">Spam Report</option>
            <option value="inappropriate">Inappropriate Content</option>
            <option value="financial">Financial Report</option>
            <option value="compliance">Compliance Report</option>
            <option value="generated">Generated Report</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
            <option value="escalated">Escalated</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
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
          <select
            value={filters.assignedTo}
            onChange={(e) =>
              setFilters({ ...filters, assignedTo: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            <option value="me">Assigned to Me</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-800 font-medium">
              {selectedItems.length} reports selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction("investigating")}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Mark Investigating
              </button>
              <button
                onClick={() => handleBulkAction("resolve")}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Resolve
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

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === reports.length &&
                      reports.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(reports.map((item) => item._id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center">
                    Report
                    {sortBy === "title" &&
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
                  Reported User/Content
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
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Created
                    {sortBy === "createdAt" &&
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
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(report._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, report._id]);
                          } else {
                            setSelectedItems(
                              selectedItems.filter((id) => id !== report._id)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getPriorityIcon(report.priority)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {report.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {typeLabels[
                          (report.type ||
                            report.reportType) as keyof typeof typeLabels
                        ] ||
                          report.reportType ||
                          "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {report.reporter?.name ||
                              (report as any).generatedBy ||
                              "System"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.reporter?.email || "System Generated"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.reportedUser ? (
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {report.reportedUser.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {report.reportedUser.role}
                            </div>
                          </div>
                        </div>
                      ) : report.reportedContent ? (
                        <div className="text-sm text-gray-900">
                          {report.reportedContent.title ||
                            report.reportedContent.type}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          priorityColors[report.priority]
                        }`}
                      >
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[report.status]
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailsModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {(report.status === "open" ||
                          report.status === "investigating") && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setActionType("resolve");
                                setShowActionModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Resolve"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setActionType("dismiss");
                                setShowActionModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-900"
                              title="Dismiss"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setActionType("escalate");
                                setShowActionModal(true);
                              }}
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
      {showDetailsModal && selectedReport && (
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
                    Report Details
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
                        Report Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Type:</span>{" "}
                          {typeLabels[
                            (selectedReport.type ||
                              selectedReport.reportType) as keyof typeof typeLabels
                          ] ||
                            selectedReport.reportType ||
                            "Unknown"}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>{" "}
                          {selectedReport.category}
                        </div>
                        <div>
                          <span className="font-medium">Priority:</span>
                          <span
                            className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              priorityColors[selectedReport.priority]
                            }`}
                          >
                            {selectedReport.priority}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <span
                            className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              statusColors[selectedReport.status]
                            }`}
                          >
                            {selectedReport.status}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {formatDate(selectedReport.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Reporter Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {selectedReport.reporter?.name || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{" "}
                          {selectedReport.reporter?.email || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Role:</span>{" "}
                          {selectedReport.reporter?.role || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedReport.reportedUser && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Reported User
                      </h4>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Name:</span>{" "}
                            {selectedReport.reportedUser.name}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span>{" "}
                            {selectedReport.reportedUser.email}
                          </div>
                          <div>
                            <span className="font-medium">Role:</span>{" "}
                            {selectedReport.reportedUser.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedReport.reportedContent && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Reported Content
                      </h4>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Type:</span>{" "}
                            {selectedReport.reportedContent.type}
                          </div>
                          <div>
                            <span className="font-medium">Title:</span>{" "}
                            {selectedReport.reportedContent.title || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Description:</span>{" "}
                            {selectedReport.reportedContent.description ||
                              "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Report Description
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {selectedReport.description}
                      </p>
                    </div>
                  </div>

                  {selectedReport.evidence && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Evidence
                      </h4>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        {selectedReport.evidence.additionalInfo && (
                          <p className="text-sm text-gray-700 mb-2">
                            {selectedReport.evidence.additionalInfo}
                          </p>
                        )}
                        {selectedReport.evidence.urls &&
                          selectedReport.evidence.urls.length > 0 && (
                            <div>
                              <span className="font-medium text-sm">URLs:</span>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {selectedReport.evidence.urls.map(
                                  (url, index) => (
                                    <li key={index}>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        {url}
                                      </a>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {selectedReport.resolution && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Resolution
                      </h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Action:</span>{" "}
                            {selectedReport.resolution.action}
                          </div>
                          <div>
                            <span className="font-medium">Reason:</span>{" "}
                            {selectedReport.resolution.reason}
                          </div>
                          <div>
                            <span className="font-medium">Resolved By:</span>{" "}
                            {selectedReport.resolution.resolvedBy.name}
                          </div>
                          <div>
                            <span className="font-medium">Resolved At:</span>{" "}
                            {formatDate(selectedReport.resolution.resolvedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {(selectedReport.status === "open" ||
                  selectedReport.status === "investigating") && (
                  <>
                    <button
                      onClick={() => {
                        setActionType("resolve");
                        setShowDetailsModal(false);
                        setShowActionModal(true);
                      }}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => {
                        setActionType("dismiss");
                        setShowDetailsModal(false);
                        setShowActionModal(true);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        setActionType("escalate");
                        setShowDetailsModal(false);
                        setShowActionModal(true);
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

      {/* Action Modal */}
      {showActionModal && selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowActionModal(false)}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {actionType.charAt(0).toUpperCase() + actionType.slice(1)}{" "}
                  Report
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (optional)
                    </label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={`Enter reason for ${actionType}...`}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleActionSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirm{" "}
                  {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                </button>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setActionReason("");
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
