"use client";

import { useState, useEffect } from "react";
import {
  AuditLog,
  ComplianceMetrics,
  AuditLogFilters,
} from "@/types/audit-logs";
import auditLogsService from "@/services/admin/audit-logs.service";
import {
  Shield,
  Search,
  Filter,
  Download,
  Archive,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Globe,
  Loader2,
  Eye,
  Calendar,
  Database,
  Lock,
  Settings,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 50,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, metricsRes] = await Promise.all([
        auditLogsService.getAuditLogs(filters),
        auditLogsService.getComplianceMetrics(),
      ]);

      // Transform backend logs to frontend format
      const transformedLogs: AuditLog[] = logsRes.logs.map(
        (backendLog: any) => ({
          _id: backendLog._id,
          timestamp: new Date(backendLog.timestamp),
          action: backendLog.action,
          resource: backendLog.resourceType || "unknown",
          resourceId: backendLog.resourceId,
          adminId: backendLog.admin?._id || backendLog.user?._id || "system",
          adminName: backendLog.admin
            ? `${backendLog.admin.firstName} ${backendLog.admin.lastName}`
            : backendLog.user
            ? `${backendLog.user.firstName} ${backendLog.user.lastName}`
            : "System",
          adminEmail:
            backendLog.admin?.email ||
            backendLog.user?.email ||
            "system@confetti.com",
          ipAddress: backendLog.details?.ipAddress || "127.0.0.1",
          userAgent: backendLog.details?.userAgent || "Unknown",
          severity: (backendLog.details?.severity || "low") as
            | "low"
            | "medium"
            | "high"
            | "critical",
          category: (backendLog.details?.category || "system") as
            | "authentication"
            | "authorization"
            | "data_access"
            | "data_modification"
            | "system"
            | "security"
            | "compliance",
          status: (backendLog.details?.status || "success") as
            | "success"
            | "failure"
            | "warning",
          archived: backendLog.archived || false,
          metadata: backendLog.details || {},
        })
      );

      setLogs(transformedLogs);
      setTotal(logsRes.total);
      setMetrics(metricsRes.metrics);
    } catch (err: any) {
      console.error("Error fetching audit logs:", err);
      toast.error("Failed to load audit logs");

      // Mock data for development
      setMetrics({
        totalLogs: 125000,
        logsToday: 1250,
        criticalEvents: 15,
        failedLogins: 45,
        dataAccess: 8500,
        dataModifications: 1200,
        retentionCompliance: {
          totalRecords: 125000,
          expiredRecords: 2500,
          archivedRecords: 15000,
          complianceRate: 98.5,
        },
        gdprRequests: {
          accessRequests: 25,
          deletionRequests: 8,
          portabilityRequests: 12,
          pendingRequests: 5,
        },
      });

      setLogs([
        {
          _id: "1",
          timestamp: new Date(),
          userId: "user123",
          userName: "John Doe",
          userEmail: "john@example.com",
          action: "LOGIN",
          resource: "authentication",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0...",
          location: { country: "Nigeria", city: "Lagos" },
          severity: "low",
          category: "authentication",
          status: "success",
          sessionId: "sess_123",
          responseCode: 200,
          processingTime: 150,
          dataClassification: "internal",
          archived: false,
        },
        {
          _id: "2",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          adminId: "admin456",
          adminName: "Jane Admin",
          adminEmail: "jane@confetti.com",
          action: "UPDATE_USER",
          resource: "user",
          resourceId: "user789",
          resourceName: "Alice Smith",
          method: "PUT",
          endpoint: "/api/v1/users/user789",
          ipAddress: "10.0.0.50",
          userAgent: "Mozilla/5.0...",
          changes: {
            before: { status: "active", tier: "basic" },
            after: { status: "suspended", tier: "basic" },
          },
          severity: "medium",
          category: "data_modification",
          status: "success",
          responseCode: 200,
          processingTime: 85,
          dataClassification: "confidential",
          complianceFlags: ["GDPR", "DATA_RETENTION"],
          archived: false,
        },
        {
          _id: "3",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          userId: "user456",
          userName: "Bob Wilson",
          userEmail: "bob@example.com",
          action: "FAILED_LOGIN",
          resource: "authentication",
          ipAddress: "203.0.113.45",
          userAgent: "curl/7.68.0",
          location: { country: "Unknown", city: "Unknown" },
          severity: "high",
          category: "security",
          status: "failure",
          responseCode: 401,
          processingTime: 50,
          dataClassification: "internal",
          complianceFlags: ["SECURITY_ALERT"],
          archived: false,
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "json" | "pdf" = "csv") => {
    try {
      setExporting(true);
      const response = await auditLogsService.exportAuditLogs(filters, format);
      window.open(response.downloadUrl, "_blank");
      toast.success("Export started");
    } catch (err: any) {
      console.error("Error exporting logs:", err);
      toast.error("Failed to export logs");
    } finally {
      setExporting(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Archive selected logs? This action cannot be undone."))
      return;

    try {
      const archiveFilters = {
        ...filters,
        endDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      };
      const response = await auditLogsService.archiveAuditLogs(archiveFilters);
      toast.success(`${response.archivedCount} logs archived`);
      fetchData();
    } catch (err: any) {
      console.error("Error archiving logs:", err);
      toast.error("Failed to archive logs");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failure":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <User className="w-4 h-4" />;
      case "authorization":
        return <Lock className="w-4 h-4" />;
      case "data_access":
        return <Eye className="w-4 h-4" />;
      case "data_modification":
        return <Database className="w-4 h-4" />;
      case "system":
        return <Settings className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "compliance":
        return <FileText className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive audit trail and compliance monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/audit/reports"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-5 h-5" />
            Reports
          </Link>
          <Link
            href="/admin/dashboard/audit/retention"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Archive className="w-5 h-5" />
            Retention
          </Link>
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Export
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.totalLogs.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Logs</p>
            <p className="text-xs text-green-600 mt-2">
              +{metrics.logsToday} today
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.criticalEvents}
            </p>
            <p className="text-sm text-gray-600 mt-1">Critical Events</p>
            <p className="text-xs text-red-600 mt-2">
              {metrics.failedLogins} failed logins
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.dataAccess.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Data Access</p>
            <p className="text-xs text-blue-600 mt-2">
              {metrics.dataModifications.toLocaleString()} modifications
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.retentionCompliance.complianceRate}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Compliance Rate</p>
            <p className="text-xs text-gray-500 mt-2">
              {metrics.retentionCompliance.expiredRecords.toLocaleString()}{" "}
              expired
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.category || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value as any,
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              setFilters({
                ...filters,
                severity: e.target.value as any,
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              setFilters({
                ...filters,
                status: e.target.value as any,
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="warning">Warning</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
            placeholder="Start Date"
          />
          <input
            type="date"
            value={
              filters.endDate
                ? new Date(filters.endDate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                endDate: e.target.value ? new Date(e.target.value) : undefined,
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.userName || log.adminName || "System"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {log.userEmail || log.adminEmail || "N/A"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(log.category)}
                      <span className="text-sm font-medium text-gray-900">
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.resource}
                      </p>
                      {log.resourceName && (
                        <p className="text-sm text-gray-500">
                          {log.resourceName}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className="text-sm text-gray-900 capitalize">
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                        log.severity
                      )}`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <p>{log.ipAddress}</p>
                      {log.location && (
                        <p className="text-xs text-gray-500">
                          {log.location.city}, {log.location.country}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/dashboard/audit/logs/${log._id}`}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
