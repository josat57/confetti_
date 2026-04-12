"use client";

import { useState, useEffect } from "react";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ComputerDesktopIcon,
  LockClosedIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  GlobeAltIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";
import {
  ExclamationTriangleIcon as ExclamationSolidIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/solid";
import auditLogsService, {
  BackendAuditLog,
} from "@/services/admin/audit-logs.service";
import {
  AuditLog,
  AuditLogFilters,
  ComplianceMetrics,
} from "@/types/audit-logs";

// Interface for displaying backend audit logs
interface DisplayAuditLog {
  _id: string;
  action: string;
  adminName?: string;
  adminEmail?: string;
  userName?: string;
  userEmail?: string;
  resource: string;
  resourceId?: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "success" | "failure" | "warning";
  timestamp: Date;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
  };
  method?: string;
  endpoint?: string;
  sessionId?: string;
  requestId?: string;
  responseCode?: number;
  processingTime?: number;
  dataClassification?: string;
  retentionDate?: Date;
  archived?: boolean;
  complianceFlags?: string[];
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

// Transform backend audit log to display format
const transformBackendAuditLog = (
  backendLog: BackendAuditLog
): DisplayAuditLog => {
  // Determine category based on action and resourceType
  const getCategory = (action: string, resourceType?: string): string => {
    if (action.includes("login") || action.includes("auth"))
      return "authentication";
    if (action.includes("permission") || action.includes("role"))
      return "authorization";
    if (
      action.includes("view") ||
      action.includes("read") ||
      action.includes("get")
    )
      return "data_access";
    if (
      action.includes("create") ||
      action.includes("update") ||
      action.includes("delete") ||
      action.includes("modify")
    )
      return "data_modification";
    if (action.includes("security") || action.includes("breach"))
      return "security";
    if (action.includes("compliance") || action.includes("gdpr"))
      return "compliance";
    return "system";
  };

  // Determine severity based on action and resourceType
  const getSeverity = (
    action: string,
    resourceType?: string
  ): "low" | "medium" | "high" | "critical" => {
    if (
      action.includes("delete") ||
      action.includes("breach") ||
      action.includes("security")
    )
      return "critical";
    if (
      action.includes("update") ||
      action.includes("modify") ||
      action.includes("permission")
    )
      return "high";
    if (action.includes("create") || action.includes("login")) return "medium";
    return "low";
  };

  // Determine status - assume success unless indicated otherwise
  const getStatus = (
    action: string,
    details?: any
  ): "success" | "failure" | "warning" => {
    if (details?.error || action.includes("failed") || action.includes("error"))
      return "failure";
    if (action.includes("warning") || action.includes("suspicious"))
      return "warning";
    return "success";
  };

  // Create a more readable resource name
  const getResourceName = (resourceType?: string, details?: any): string => {
    if (!resourceType) return "Unknown";

    // Format resource type to be more readable
    const formatted = resourceType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    // Add specific details based on resource type
    if (details?.title) return `${formatted}: ${details.title}`;
    if (details?.planName) return `${formatted}: ${details.planName}`;
    if (details?.type) return `${formatted} (${details.type})`;

    return formatted;
  };

  return {
    _id: backendLog._id,
    action: backendLog.action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()), // Format action name
    adminName: backendLog.admin
      ? `${backendLog.admin.firstName} ${backendLog.admin.lastName}`
      : undefined,
    adminEmail: backendLog.admin?.email,
    userName: backendLog.user
      ? `${backendLog.user.firstName} ${backendLog.user.lastName}`
      : undefined,
    userEmail: backendLog.user?.email,
    resource: getResourceName(backendLog.resourceType, backendLog.details),
    resourceId: backendLog.resourceId,
    category: getCategory(backendLog.action, backendLog.resourceType),
    severity: getSeverity(backendLog.action, backendLog.resourceType),
    status: getStatus(backendLog.action, backendLog.details),
    timestamp: new Date(backendLog.timestamp),
    details: backendLog.details,
    // Default values for missing fields
    ipAddress: "127.0.0.1", // Default IP since not provided by backend
    userAgent: "Unknown",
    archived: false,
  };
};

const severityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusColors = {
  success: "bg-green-100 text-green-800",
  failure: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
};

const categoryColors = {
  authentication: "bg-blue-100 text-blue-800",
  authorization: "bg-purple-100 text-purple-800",
  data_access: "bg-green-100 text-green-800",
  data_modification: "bg-orange-100 text-orange-800",
  system: "bg-gray-100 text-gray-800",
  security: "bg-red-100 text-red-800",
  compliance: "bg-indigo-100 text-indigo-800",
};

const categoryIcons = {
  authentication: UserIcon,
  authorization: LockClosedIcon,
  data_access: EyeIcon,
  data_modification: DocumentTextIcon,
  system: ComputerDesktopIcon,
  security: ShieldCheckIcon,
  compliance: DocumentTextIcon,
};

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<DisplayAuditLog[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<DisplayAuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Filters
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 10,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Date range
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 7 days ago
    endDate: new Date().toISOString().split("T")[0], // today
  });

  useEffect(() => {
    loadAuditLogs();
    loadMetrics();
  }, [currentPage, filters]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const filterParams = {
        ...filters,
        page: currentPage,
        startDate: dateRange.startDate
          ? new Date(dateRange.startDate)
          : undefined,
        endDate: dateRange.endDate ? new Date(dateRange.endDate) : undefined,
      };

      const response = await auditLogsService.getAuditLogs(filterParams);

      // Transform backend logs to display format
      const transformedLogs = response.logs.map(transformBackendAuditLog);

      setAuditLogs(transformedLogs);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      // Provide empty data when API is not available
      setAuditLogs([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await auditLogsService.getComplianceMetrics();
      setMetrics(response.metrics);
    } catch (error) {
      console.error("Failed to load compliance metrics:", error);
      // Provide fallback metrics
      setMetrics({
        totalLogs: 0,
        logsToday: 0,
        criticalEvents: 0,
        failedLogins: 0,
        dataAccess: 0,
        dataModifications: 0,
        retentionCompliance: {
          totalRecords: 0,
          expiredRecords: 0,
          archivedRecords: 0,
          complianceRate: 100,
        },
        gdprRequests: {
          accessRequests: 0,
          deletionRequests: 0,
          portabilityRequests: 0,
          pendingRequests: 0,
        },
      });
    }
  };

  const handleExport = async (format: "csv" | "json" | "pdf" = "csv") => {
    try {
      const filterParams = {
        ...filters,
        startDate: dateRange.startDate
          ? new Date(dateRange.startDate)
          : undefined,
        endDate: dateRange.endDate ? new Date(dateRange.endDate) : undefined,
      };

      const response = await auditLogsService.exportAuditLogs(
        filterParams,
        format
      );
      // Open download URL in new tab
      window.open(response.downloadUrl, "_blank");
    } catch (error) {
      console.error("Failed to export audit logs:", error);
      alert("Failed to export audit logs. Please try again.");
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
    setCurrentPage(1);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <ExclamationSolidIcon className="h-5 w-5 text-red-600" />;
      case "high":
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />;
      case "medium":
        return <ShieldExclamationIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <ShieldCheckIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const Icon =
      categoryIcons[category as keyof typeof categoryIcons] || DocumentTextIcon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit & Logging</h1>
          <p className="text-gray-600">
            Monitor system activities, security events, and compliance
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
          <div className="relative">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.totalLogs.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Today's Logs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.logsToday.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Critical Events
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.criticalEvents}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Compliance Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.retentionCompliance.complianceRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <LockClosedIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Failed Logins
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.failedLogins}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <EyeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Data Access</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.dataAccess}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Data Modifications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.dataModifications}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FingerPrintIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  GDPR Requests
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.gdprRequests.pendingRequests}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Range and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs by action, user, resource..."
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Advanced Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={filters.category || ""}
              onChange={(e) =>
                handleFilterChange("category", e.target.value || undefined)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="authorization">Authorization</option>
              <option value="data_access">Data Access</option>
              <option value="data_modification">Data Modification</option>
              <option value="system">System</option>
              <option value="security">Security</option>
              <option value="compliance">Compliance</option>
            </select>
            <select
              value={filters.severity || ""}
              onChange={(e) =>
                handleFilterChange("severity", e.target.value || undefined)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange("status", e.target.value || undefined)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
            </select>
            <select
              value={filters.method || ""}
              onChange={(e) =>
                handleFilterChange("method", e.target.value || undefined)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User/Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
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
                    Loading audit logs...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No audit logs found for the selected criteria
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.adminName || log.userName || "System"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.adminEmail || log.userEmail || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.action}
                      </div>
                      {log.details?.recipientCount && (
                        <div className="text-sm text-gray-500">
                          Recipients: {log.details.recipientCount}
                        </div>
                      )}
                      {log.details?.updates && (
                        <div className="text-sm text-gray-500">
                          Updated fields:{" "}
                          {Object.keys(log.details.updates).length}
                        </div>
                      )}
                      {log.method && (
                        <div className="text-sm text-gray-500">
                          {log.method}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {log.resource}
                      </div>
                      {log.resourceId && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          ID: {log.resourceId.slice(-8)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getCategoryIcon(log.category)}
                        <span
                          className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            categoryColors[
                              log.category as keyof typeof categoryColors
                            ] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {log.category.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getSeverityIcon(log.severity)}
                        <span
                          className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            severityColors[log.severity]
                          }`}
                        >
                          {log.severity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[log.status]
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {log.ipAddress}
                      </div>
                      {log.location && (
                        <div className="text-sm text-gray-500">
                          {log.location.city}, {log.location.country}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetailsModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
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
      {showDetailsModal && selectedLog && (
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
                    Audit Log Details
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <EyeIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Basic Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Timestamp:</span>{" "}
                          {formatDate(selectedLog.timestamp)}
                        </div>
                        <div>
                          <span className="font-medium">Action:</span>{" "}
                          {selectedLog.action}
                        </div>
                        <div>
                          <span className="font-medium">Resource:</span>{" "}
                          {selectedLog.resource}
                        </div>
                        <div>
                          <span className="font-medium">Method:</span>{" "}
                          {selectedLog.method || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Endpoint:</span>{" "}
                          {selectedLog.endpoint || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        User Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">User:</span>{" "}
                          {selectedLog.userName ||
                            selectedLog.adminName ||
                            "System"}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{" "}
                          {selectedLog.userEmail ||
                            selectedLog.adminEmail ||
                            "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">IP Address:</span>{" "}
                          {selectedLog.ipAddress}
                        </div>
                        <div>
                          <span className="font-medium">User Agent:</span>{" "}
                          {selectedLog.userAgent || "N/A"}
                        </div>
                        {selectedLog.location && (
                          <div>
                            <span className="font-medium">Location:</span>{" "}
                            {selectedLog.location.city},{" "}
                            {selectedLog.location.country}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Category
                      </h4>
                      <div className="flex items-center">
                        {getCategoryIcon(selectedLog.category)}
                        <span
                          className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            categoryColors[
                              selectedLog.category as keyof typeof categoryColors
                            ] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedLog.category.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Severity
                      </h4>
                      <div className="flex items-center">
                        {getSeverityIcon(selectedLog.severity)}
                        <span
                          className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            severityColors[selectedLog.severity]
                          }`}
                        >
                          {selectedLog.severity}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[selectedLog.status]
                        }`}
                      >
                        {selectedLog.status}
                      </span>
                    </div>
                  </div>

                  {selectedLog.changes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Changes
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {selectedLog.changes.before && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-700 mb-2">
                              Before:
                            </h5>
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(
                                selectedLog.changes.before,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        )}
                        {selectedLog.changes.after && (
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">
                              After:
                            </h5>
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(
                                selectedLog.changes.after,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedLog.details &&
                    Object.keys(selectedLog.details).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Action Details
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(selectedLog.details).map(
                              ([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium text-gray-700 capitalize">
                                    {key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) =>
                                        str.toUpperCase()
                                      )}
                                    :
                                  </span>
                                  <div className="text-gray-600 mt-1">
                                    {typeof value === "object" ? (
                                      <pre className="text-xs whitespace-pre-wrap">
                                        {JSON.stringify(value, null, 2)}
                                      </pre>
                                    ) : (
                                      String(value)
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {selectedLog.metadata &&
                    Object.keys(selectedLog.metadata).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Metadata
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(selectedLog.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Technical Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Session ID:</span>{" "}
                          {selectedLog.sessionId || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Request ID:</span>{" "}
                          {selectedLog.requestId || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Response Code:</span>{" "}
                          {selectedLog.responseCode || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Processing Time:</span>{" "}
                          {selectedLog.processingTime
                            ? `${selectedLog.processingTime}ms`
                            : "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Compliance
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">
                            Data Classification:
                          </span>{" "}
                          {selectedLog.dataClassification || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Retention Date:</span>{" "}
                          {selectedLog.retentionDate
                            ? formatDate(selectedLog.retentionDate)
                            : "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Archived:</span>{" "}
                          {selectedLog.archived ? "Yes" : "No"}
                        </div>
                        {selectedLog.complianceFlags &&
                          selectedLog.complianceFlags.length > 0 && (
                            <div>
                              <span className="font-medium">
                                Compliance Flags:
                              </span>
                              <div className="mt-1">
                                {selectedLog.complianceFlags.map(
                                  (flag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-1 mb-1"
                                    >
                                      {flag}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
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
