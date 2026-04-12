"use client";

import { useState, useEffect } from "react";
import { DataExport, CreateDataExportRequest } from "@/types/backup";
import backupService from "@/services/admin/backup.service";
import {
  Download,
  Trash2,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Database,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function DataExportsPage() {
  const [exports, setExports] = useState<DataExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateDataExportRequest>({
    name: "",
    type: "full",
    format: "json",
  });

  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async () => {
    try {
      setLoading(true);
      const response = await backupService.getDataExports();
      setExports(response.exports);
    } catch (err: any) {
      console.error("Error fetching exports:", err);
      toast.error("Failed to load data exports");

      // Mock data
      setExports([
        {
          _id: "1",
          name: "Full Database Export",
          type: "full",
          format: "json",
          status: "completed",
          createdBy: "admin@confetti.com",
          createdAt: new Date(),
          completedAt: new Date(Date.now() + 300000),
          size: 2147483648,
          downloadUrl: "/exports/full-export-2025-11-28.json",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          recordCount: 175000,
        },
        {
          _id: "2",
          name: "Users Export",
          type: "users",
          format: "csv",
          status: "completed",
          createdBy: "admin@confetti.com",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60000),
          size: 52428800,
          downloadUrl: "/exports/users-2025-11-27.csv",
          expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          recordCount: 50000,
        },
        {
          _id: "3",
          name: "Transactions Export",
          type: "transactions",
          format: "json",
          status: "generating",
          createdBy: "admin@confetti.com",
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
          recordCount: 100000,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await backupService.createDataExport(formData);
      toast.success("Data export started");
      setShowCreateModal(false);
      setFormData({
        name: "",
        type: "full",
        format: "json",
      });
      fetchExports();
    } catch (err: any) {
      console.error("Error creating export:", err);
      toast.error("Failed to create export");
    }
  };

  const handleDownload = async (exportId: string) => {
    try {
      const response = await backupService.downloadDataExport(exportId);
      window.open(response.downloadUrl, "_blank");
      toast.success("Download started");
    } catch (err: any) {
      console.error("Error downloading export:", err);
      toast.error("Failed to download export");
    }
  };

  const handleDelete = async (exportId: string, exportName: string) => {
    if (!confirm(`Delete export "${exportName}"?`)) return;

    try {
      await backupService.deleteDataExport(exportId);
      toast.success("Export deleted successfully");
      fetchExports();
    } catch (err: any) {
      console.error("Error deleting export:", err);
      toast.error("Failed to delete export");
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

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "N/A";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date?: Date) => {
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
          <Link
            href="/admin/dashboard/backups"
            className="text-sm text-purple-600 hover:text-purple-700 mb-2 inline-block"
          >
            ← Back to Backups
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Data Exports</h1>
          <p className="text-gray-600 mt-1">
            Export and download platform data
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Create Export
        </button>
      </div>

      {/* Exports List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Export
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
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
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exports.map((exp) => (
                <tr key={exp._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {exp.name}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {exp.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 uppercase">
                      {exp.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(exp.status)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          exp.status
                        )}`}
                      >
                        {exp.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exp.recordCount?.toLocaleString() || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatBytes(exp.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900">
                        {formatDate(exp.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500">{exp.createdBy}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {exp.status === "completed" && (
                        <button
                          onClick={() => handleDownload(exp._id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(exp._id, exp.name)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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
      </div>

      {/* Create Export Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create Data Export
            </h2>

            <form onSubmit={handleCreateExport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Export Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Monthly Users Export"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Export Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="full">Full Database</option>
                  <option value="users">Users Only</option>
                  <option value="events">Events Only</option>
                  <option value="transactions">Transactions Only</option>
                  <option value="partial">Partial (Custom)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={formData.format}
                  onChange={(e) =>
                    setFormData({ ...formData, format: e.target.value as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="sql">SQL</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Export Information
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Exports are available for 7 days and will be automatically
                      deleted after expiration.
                    </p>
                  </div>
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
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Database className="w-4 h-4" />
                  Create Export
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
