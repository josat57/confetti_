"use client";

import { useState, useEffect } from "react";
import {
  DataRetentionPolicy,
  DataRetentionFilters,
  CreateDataRetentionPolicyRequest,
} from "@/types/audit-logs";
import auditLogsService from "@/services/admin/audit-logs.service";
import {
  Archive,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Calendar,
  Database,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function DataRetentionPage() {
  const [policies, setPolicies] = useState<DataRetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] =
    useState<DataRetentionPolicy | null>(null);
  const [filters, setFilters] = useState<DataRetentionFilters>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState<CreateDataRetentionPolicyRequest>({
    name: "",
    description: "",
    category: "",
    retentionPeriod: 365,
    autoDelete: false,
    archiveBeforeDelete: true,
    legalHold: false,
  });

  useEffect(() => {
    fetchPolicies();
  }, [filters]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await auditLogsService.getDataRetentionPolicies(filters);
      setPolicies(response.policies);
      setTotal(response.total);
    } catch (err: any) {
      console.error("Error fetching policies:", err);
      toast.error("Failed to load retention policies");

      // Mock data
      setPolicies([
        {
          _id: "1",
          name: "Audit Logs Retention",
          description: "Standard retention policy for audit logs",
          category: "audit_logs",
          retentionPeriod: 365,
          autoDelete: true,
          archiveBeforeDelete: true,
          legalHold: false,
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date(),
          active: true,
        },
        {
          _id: "2",
          name: "User Data Retention",
          description: "GDPR compliant user data retention",
          category: "user_data",
          retentionPeriod: 730,
          autoDelete: false,
          archiveBeforeDelete: true,
          legalHold: false,
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date(),
          active: true,
        },
        {
          _id: "3",
          name: "Transaction Records",
          description: "Financial transaction record retention",
          category: "transactions",
          retentionPeriod: 2555,
          autoDelete: false,
          archiveBeforeDelete: true,
          legalHold: true,
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date(),
          active: true,
        },
        {
          _id: "4",
          name: "Temporary Files",
          description: "Temporary file cleanup policy",
          category: "temp_files",
          retentionPeriod: 7,
          autoDelete: true,
          archiveBeforeDelete: false,
          legalHold: false,
          createdBy: "system",
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date(),
          active: true,
        },
      ]);
      setTotal(4);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPolicy) {
        await auditLogsService.updateDataRetentionPolicy(
          editingPolicy._id,
          formData
        );
        toast.success("Policy updated successfully");
      } else {
        await auditLogsService.createDataRetentionPolicy(formData);
        toast.success("Policy created successfully");
      }
      setShowModal(false);
      setEditingPolicy(null);
      fetchPolicies();
      resetForm();
    } catch (err: any) {
      console.error("Error saving policy:", err);
      toast.error("Failed to save policy");
    }
  };

  const handleEdit = (policy: DataRetentionPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      category: policy.category,
      retentionPeriod: policy.retentionPeriod,
      autoDelete: policy.autoDelete,
      archiveBeforeDelete: policy.archiveBeforeDelete,
      legalHold: policy.legalHold,
    });
    setShowModal(true);
  };

  const handleDelete = async (policyId: string) => {
    if (!confirm("Delete this retention policy?")) return;

    try {
      await auditLogsService.deleteDataRetentionPolicy(policyId);
      toast.success("Policy deleted successfully");
      fetchPolicies();
    } catch (err: any) {
      console.error("Error deleting policy:", err);
      toast.error("Failed to delete policy");
    }
  };

  const handleToggleActive = async (policy: DataRetentionPolicy) => {
    try {
      if (policy.active) {
        await auditLogsService.deactivateDataRetentionPolicy(policy._id);
        toast.success("Policy deactivated");
      } else {
        await auditLogsService.activateDataRetentionPolicy(policy._id);
        toast.success("Policy activated");
      }
      fetchPolicies();
    } catch (err: any) {
      console.error("Error toggling policy:", err);
      toast.error("Failed to update policy status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      retentionPeriod: 365,
      autoDelete: false,
      archiveBeforeDelete: true,
      legalHold: false,
    });
  };

  const formatRetentionPeriod = (days: number) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
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
            Data Retention Policies
          </h1>
          <p className="text-gray-600 mt-1">
            Manage data retention and archival policies
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPolicy(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Create Policy
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Filter by category..."
            value={filters.category || ""}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <select
            value={filters.active !== undefined ? String(filters.active) : ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                active:
                  e.target.value === "" ? undefined : e.target.value === "true",
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((policy) => (
          <div
            key={policy._id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {policy.name}
                  </h3>
                  {policy.active ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                  {policy.legalHold && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Legal Hold
                    </span>
                  )}
                </div>
                {policy.description && (
                  <p className="text-sm text-gray-600">{policy.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(policy)}
                  className="text-purple-600 hover:text-purple-900"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(policy._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Database className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">
                  {policy.category}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Retention Period:</span>
                <span className="font-medium text-gray-900">
                  {formatRetentionPeriod(policy.retentionPeriod)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Archive className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Auto Delete:</span>
                <span className="font-medium text-gray-900">
                  {policy.autoDelete ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Archive className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Archive Before Delete:</span>
                <span className="font-medium text-gray-900">
                  {policy.archiveBeforeDelete ? "Yes" : "No"}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created by {policy.createdBy} on{" "}
                  {formatDate(policy.createdAt)}
                </p>
                <p className="text-xs text-gray-500">
                  Last updated: {formatDate(policy.updatedAt)}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleToggleActive(policy)}
                className={`w-full px-4 py-2 rounded-lg font-medium ${
                  policy.active
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {policy.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > (filters.limit || 20) && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
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
                (filters.page || 1) >= Math.ceil(total / (filters.limit || 20))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingPolicy ? "Edit Policy" : "Create Retention Policy"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., audit_logs, user_data, transactions"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retention Period (days)
                </label>
                <input
                  type="number"
                  value={formData.retentionPeriod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retentionPeriod: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formatRetentionPeriod(formData.retentionPeriod)}
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.autoDelete}
                    onChange={(e) =>
                      setFormData({ ...formData, autoDelete: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Auto Delete
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.archiveBeforeDelete}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        archiveBeforeDelete: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Archive Before Delete
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.legalHold}
                    onChange={(e) =>
                      setFormData({ ...formData, legalHold: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Legal Hold (Prevents deletion)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPolicy(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingPolicy ? "Update Policy" : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
