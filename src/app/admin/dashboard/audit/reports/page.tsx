"use client";

import { useState, useEffect } from "react";
import {
  ComplianceReport,
  ComplianceReportFilters,
  CreateComplianceReportRequest,
} from "@/types/audit-logs";
import auditLogsService from "@/services/admin/audit-logs.service";
import {
  FileText,
  Download,
  Trash2,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ComplianceReportsPage() {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<ComplianceReportFilters>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState<CreateComplianceReportRequest>({
    title: "",
    type: "access_log",
    description: "",
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await auditLogsService.getComplianceReports(filters);
      setReports(response.reports);
      setTotal(response.total);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      toast.error("Failed to load compliance reports");

      // Mock data
      setReports([
        {
          _id: "1",
          title: "Monthly GDPR Compliance Report",
          type: "gdpr",
          description: "Comprehensive GDPR compliance report for November 2025",
          dateRange: {
            startDate: new Date("2025-11-01"),
            endDate: new Date("2025-11-30"),
          },
          generatedBy: "admin@confetti.com",
          generatedAt: new Date(),
          status: "completed",
          fileUrl: "/reports/gdpr-nov-2025.pdf",
          fileSize: 2456789,
          recordCount: 125000,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
        {
          _id: "2",
          title: "Data Retention Audit",
          type: "data_retention",
          description: "Quarterly data retention compliance audit",
          dateRange: {
            startDate: new Date("2025-09-01"),
            endDate: new Date("2025-11-30"),
          },
          generatedBy: "admin@confetti.com",
          generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: "completed",
          fileUrl: "/reports/retention-q4-2025.pdf",
          fileSize: 1234567,
          recordCount: 85000,
        },
        {
          _id: "3",
          title: "Security Audit Report",
          type: "security_audit",
          description: "Weekly security audit and incident report",
          dateRange: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
          },
          generatedBy: "security@confetti.com",
          generatedAt: new Date(),
          status: "generating",
          recordCount: 5000,
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await auditLogsService.createComplianceReport(formData);
      toast.success("Compliance report generation started");
      setShowCreateModal(false);
      fetchReports();
      setFormData({
        title: "",
        type: "access_log",
        description: "",
        dateRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
        },
      });
    } catch (err: any) {
      console.error("Error creating report:", err);
      toast.error("Failed to create compliance report");
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const response = await auditLogsService.downloadComplianceReport(
        reportId
      );
      window.open(response.downloadUrl, "_blank");
      toast.success("Download started");
    } catch (err: any) {
      console.error("Error downloading report:", err);
      toast.error("Failed to download report");
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Delete this compliance report?")) return;

    try {
      await auditLogsService.deleteComplianceReport(reportId);
      toast.success("Report deleted successfully");
      fetchReports();
    } catch (err: any) {
      console.error("Error deleting report:", err);
      toast.error("Failed to delete report");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "generating":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "generating":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
          <Link
            href="/admin/dashboard/audit"
            className="text-sm text-purple-600 hover:text-purple-700 mb-2 inline-block"
          >
            ← Back to Audit Logs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Compliance Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Generate and manage compliance reports
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Generate Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.type || ""}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value as any, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="gdpr">GDPR</option>
            <option value="data_retention">Data Retention</option>
            <option value="access_log">Access Log</option>
            <option value="security_audit">Security Audit</option>
            <option value="custom">Custom</option>
          </select>

          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as any, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="generating">Generating</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="text"
            placeholder="Generated by..."
            value={filters.generatedBy || ""}
            onChange={(e) =>
              setFilters({ ...filters, generatedBy: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {report.title}
                      </p>
                      {report.description && (
                        <p className="text-sm text-gray-500">
                          {report.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {report.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(report.dateRange.startDate)} -{" "}
                    {formatDate(report.dateRange.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.recordCount?.toLocaleString() || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatFileSize(report.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.generatedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {report.status === "completed" && (
                        <button
                          onClick={() => handleDownload(report._id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Generate Compliance Report
            </h2>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="gdpr">GDPR Compliance</option>
                  <option value="data_retention">Data Retention</option>
                  <option value="access_log">Access Log</option>
                  <option value="security_audit">Security Audit</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={
                      new Date(formData.dateRange.startDate)
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dateRange: {
                          ...formData.dateRange,
                          startDate: new Date(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={
                      new Date(formData.dateRange.endDate)
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dateRange: {
                          ...formData.dateRange,
                          endDate: new Date(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
