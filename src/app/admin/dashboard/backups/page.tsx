"use client";

import { useState, useEffect } from "react";
import { Backup, BackupFilters, StorageUsage } from "@/types/backup";
import backupService from "@/services/admin/backup.service";
import {
  Database,
  Download,
  Trash2,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  Calendar,
  Shield,
  RefreshCw,
  AlertTriangle,
  Archive,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [storage, setStorage] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState<BackupFilters>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [backupDescription, setBackupDescription] = useState("");

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [backupsRes, storageRes] = await Promise.all([
        backupService.getBackups(filters),
        backupService.getStorageUsage(),
      ]);

      setBackups(backupsRes.backups);
      setTotal(backupsRes.total);
      setStorage(storageRes.usage);
    } catch (err: any) {
      console.error("Error fetching backups:", err);
      toast.error("Failed to load backups");

      // Mock data
      setStorage({
        database: {
          size: 2147483648, // 2GB
          collections: [
            { name: "users", size: 524288000, documents: 50000 },
            { name: "events", size: 314572800, documents: 25000 },
            { name: "transactions", size: 209715200, documents: 100000 },
          ],
          totalSize: 2147483648,
        },
        fileStorage: {
          uploads: 5368709120, // 5GB
          images: 3221225472, // 3GB
          documents: 1073741824, // 1GB
          totalSize: 9663676416, // 9GB
        },
        backups: {
          count: 15,
          totalSize: 32212254720, // 30GB
          oldestBackup: new Date("2025-10-01"),
          newestBackup: new Date(),
        },
        total: 44023414784, // 41GB
        limit: 107374182400, // 100GB
        usagePercentage: 41,
      });

      setBackups([
        {
          _id: "1",
          name: "Daily Backup - Nov 28",
          description: "Automated daily backup",
          type: "scheduled",
          status: "completed",
          createdBy: "system",
          createdAt: new Date(),
          completedAt: new Date(),
          size: 2147483648,
          location: "/backups/2025-11-28-daily.tar.gz",
          checksum: "sha256:abc123...",
          verified: true,
          verifiedAt: new Date(),
          metadata: {
            databaseSize: 2147483648,
            fileStorageSize: 9663676416,
            totalRecords: 175000,
            collections: ["users", "events", "transactions", "vendors"],
            version: "1.0.0",
          },
        },
        {
          _id: "2",
          name: "Pre-Migration Backup",
          description: "Manual backup before system migration",
          type: "manual",
          status: "completed",
          createdBy: "admin@confetti.com",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 300000),
          size: 2100000000,
          location: "/backups/2025-11-27-migration.tar.gz",
          checksum: "sha256:def456...",
          verified: true,
          verifiedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          metadata: {
            databaseSize: 2100000000,
            fileStorageSize: 9500000000,
            totalRecords: 173000,
            collections: ["users", "events", "transactions", "vendors"],
            version: "1.0.0",
          },
        },
        {
          _id: "3",
          name: "Weekly Backup - Nov 25",
          description: "Automated weekly backup",
          type: "scheduled",
          status: "completed",
          createdBy: "system",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 400000),
          size: 2050000000,
          location: "/backups/2025-11-25-weekly.tar.gz",
          checksum: "sha256:ghi789...",
          verified: false,
          metadata: {
            databaseSize: 2050000000,
            fileStorageSize: 9400000000,
            totalRecords: 170000,
            collections: ["users", "events", "transactions", "vendors"],
            version: "1.0.0",
          },
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await backupService.createBackup({
        name: backupName,
        description: backupDescription,
        type: "manual",
      });
      toast.success("Backup creation started");
      setShowCreateModal(false);
      setBackupName("");
      setBackupDescription("");
      fetchData();
    } catch (err: any) {
      console.error("Error creating backup:", err);
      toast.error("Failed to create backup");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (backupId: string, backupName: string) => {
    if (
      !confirm(
        `Are you sure you want to restore "${backupName}"? This will overwrite current data.`
      )
    )
      return;

    try {
      await backupService.restoreBackup({
        backupId,
        confirmation: true,
      });
      toast.success("Backup restoration started");
      fetchData();
    } catch (err: any) {
      console.error("Error restoring backup:", err);
      toast.error("Failed to restore backup");
    }
  };

  const handleVerify = async (backupId: string) => {
    try {
      const response = await backupService.verifyBackup(backupId);
      if (response.valid) {
        toast.success("Backup verified successfully");
      } else {
        toast.error("Backup verification failed");
      }
      fetchData();
    } catch (err: any) {
      console.error("Error verifying backup:", err);
      toast.error("Failed to verify backup");
    }
  };

  const handleDownload = async (backupId: string) => {
    try {
      const response = await backupService.downloadBackup(backupId);
      window.open(response.downloadUrl, "_blank");
      toast.success("Download started");
    } catch (err: any) {
      console.error("Error downloading backup:", err);
      toast.error("Failed to download backup");
    }
  };

  const handleDelete = async (backupId: string, backupName: string) => {
    if (!confirm(`Delete backup "${backupName}"?`)) return;

    try {
      await backupService.deleteBackup(backupId);
      toast.success("Backup deleted successfully");
      fetchData();
    } catch (err: any) {
      console.error("Error deleting backup:", err);
      toast.error("Failed to delete backup");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "creating":
      case "restoring":
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
      case "creating":
      case "restoring":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
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
            Backup & Data Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage backups, storage, and data exports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/backups/schedules"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Calendar className="w-5 h-5" />
            Schedules
          </Link>
          <Link
            href="/admin/dashboard/backups/exports"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Archive className="w-5 h-5" />
            Exports
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            Create Backup
          </button>
        </div>
      </div>

      {/* Storage Usage Cards */}
      {storage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatBytes(storage.database.totalSize)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Database Size</p>
            <p className="text-xs text-gray-500 mt-2">
              {storage.database.collections.length} collections
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatBytes(storage.fileStorage.totalSize)}
            </p>
            <p className="text-sm text-gray-600 mt-1">File Storage</p>
            <p className="text-xs text-gray-500 mt-2">
              {formatBytes(storage.fileStorage.images)} images
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Archive className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatBytes(storage.backups.totalSize)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Backup Storage</p>
            <p className="text-xs text-gray-500 mt-2">
              {storage.backups.count} backups
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {storage.usagePercentage}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Storage Used</p>
            <p className="text-xs text-gray-500 mt-2">
              {formatBytes(storage.total)} / {formatBytes(storage.limit || 0)}
            </p>
          </div>
        </div>
      )}

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
            <option value="manual">Manual</option>
            <option value="scheduled">Scheduled</option>
            <option value="automatic">Automatic</option>
          </select>

          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as any, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="creating">Creating</option>
            <option value="failed">Failed</option>
            <option value="restoring">Restoring</option>
          </select>

          <input
            type="text"
            placeholder="Created by..."
            value={filters.createdBy || ""}
            onChange={(e) =>
              setFilters({ ...filters, createdBy: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Backup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {backup.name}
                      </p>
                      {backup.description && (
                        <p className="text-sm text-gray-500">
                          {backup.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(backup.status)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          backup.status
                        )}`}
                      >
                        {backup.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatBytes(backup.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900">
                        {formatDate(backup.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {backup.createdBy}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {backup.verified ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs">Not verified</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {backup.status === "completed" && (
                        <>
                          <button
                            onClick={() =>
                              handleRestore(backup._id, backup.name)
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="Restore"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          {!backup.verified && (
                            <button
                              onClick={() => handleVerify(backup._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Verify"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(backup._id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(backup._id, backup.name)}
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

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create Manual Backup
            </h2>

            <form onSubmit={handleCreateBackup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Name
                </label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Pre-deployment backup"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add notes about this backup..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Create Backup
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
