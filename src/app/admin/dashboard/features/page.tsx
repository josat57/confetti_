"use client";

import { useState, useEffect } from "react";
import { FeatureFlag, FeatureFlagFilters } from "@/types/feature-flags";
import featureFlagsService from "@/services/admin/feature-flags.service";
import {
  Flag,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users,
  Activity,
  Archive,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<FeatureFlagFilters>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    type: "boolean" as "boolean" | "rollout" | "experiment",
    enabled: false,
    percentage: 0,
  });

  useEffect(() => {
    fetchFlags();
  }, [filters]);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const response = await featureFlagsService.getFeatureFlags(filters);
      setFlags(response.flags);
      setTotal(response.total);
    } catch (err: any) {
      console.error("Error fetching feature flags:", err);
      toast.error("Failed to load feature flags");

      // Mock data
      setFlags([
        {
          _id: "1",
          name: "New Dashboard UI",
          key: "new_dashboard_ui",
          description: "Redesigned dashboard with improved UX",
          enabled: true,
          type: "rollout",
          status: "active",
          targeting: {
            percentage: 50,
          },
          rollout: {
            percentage: 100,
            startDate: new Date("2025-11-01"),
            increments: 10,
            currentPercentage: 50,
          },
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-11-01"),
          updatedAt: new Date(),
          lastModifiedBy: "admin@confetti.com",
          usage: {
            totalChecks: 50000,
            enabledChecks: 25000,
            disabledChecks: 25000,
            uniqueUsers: 5000,
          },
        },
        {
          _id: "2",
          name: "AI Event Recommendations",
          key: "ai_event_recommendations",
          description: "ML-powered event recommendations for users",
          enabled: false,
          type: "boolean",
          status: "active",
          targeting: {},
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-10-15"),
          updatedAt: new Date(),
          lastModifiedBy: "admin@confetti.com",
          usage: {
            totalChecks: 10000,
            enabledChecks: 0,
            disabledChecks: 10000,
            uniqueUsers: 1000,
          },
        },
        {
          _id: "3",
          name: "Premium Features Bundle",
          key: "premium_features_bundle",
          description: "New premium tier features",
          enabled: true,
          type: "experiment",
          status: "active",
          targeting: {
            userGroups: ["premium", "enterprise"],
          },
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-11-20"),
          updatedAt: new Date(),
          lastModifiedBy: "admin@confetti.com",
          usage: {
            totalChecks: 15000,
            enabledChecks: 12000,
            disabledChecks: 3000,
            uniqueUsers: 1500,
          },
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await featureFlagsService.createFeatureFlag({
        name: formData.name,
        key: formData.key,
        description: formData.description,
        type: formData.type,
        enabled: formData.enabled,
        targeting:
          formData.type === "rollout"
            ? { percentage: formData.percentage }
            : undefined,
      });
      toast.success("Feature flag created successfully");
      setShowCreateModal(false);
      setFormData({
        name: "",
        key: "",
        description: "",
        type: "boolean",
        enabled: false,
        percentage: 0,
      });
      fetchFlags();
    } catch (err: any) {
      console.error("Error creating feature flag:", err);
      toast.error("Failed to create feature flag");
    }
  };

  const handleToggle = async (flagId: string, enabled: boolean) => {
    try {
      await featureFlagsService.toggleFeatureFlag(flagId, !enabled);
      toast.success(enabled ? "Feature disabled" : "Feature enabled");
      fetchFlags();
    } catch (err: any) {
      console.error("Error toggling feature flag:", err);
      toast.error("Failed to toggle feature flag");
    }
  };

  const handleDelete = async (flagId: string, flagName: string) => {
    if (!confirm(`Delete feature flag "${flagName}"?`)) return;

    try {
      await featureFlagsService.deleteFeatureFlag(flagId);
      toast.success("Feature flag deleted successfully");
      fetchFlags();
    } catch (err: any) {
      console.error("Error deleting feature flag:", err);
      toast.error("Failed to delete feature flag");
    }
  };

  const handleArchive = async (flagId: string) => {
    try {
      await featureFlagsService.archiveFeatureFlag(flagId);
      toast.success("Feature flag archived");
      fetchFlags();
    } catch (err: any) {
      console.error("Error archiving feature flag:", err);
      toast.error("Failed to archive feature flag");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "boolean":
        return "text-blue-600 bg-blue-100";
      case "rollout":
        return "text-purple-600 bg-purple-100";
      case "experiment":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-gray-600 bg-gray-100";
      case "archived":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
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
          <h1 className="text-3xl font-bold text-gray-900">
            Feature Flags & A/B Testing
          </h1>
          <p className="text-gray-600 mt-1">
            Manage feature rollouts and experiments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/features/tests"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Activity className="w-5 h-5" />
            A/B Tests
          </Link>
          <Link
            href="/admin/dashboard/features/analytics"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <TrendingUp className="w-5 h-5" />
            Analytics
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            Create Feature Flag
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Flag className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-600 mt-1">Total Flags</p>
          <p className="text-xs text-green-600 mt-2">
            {flags.filter((f) => f.enabled).length} enabled
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {flags.filter((f) => f.type === "rollout").length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Rollouts</p>
          <p className="text-xs text-gray-500 mt-2">Gradual deployments</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {flags.filter((f) => f.type === "experiment").length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Experiments</p>
          <p className="text-xs text-gray-500 mt-2">A/B tests running</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {flags
              .reduce((sum, f) => sum + f.usage.uniqueUsers, 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total Users</p>
          <p className="text-xs text-gray-500 mt-2">Across all features</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as any, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filters.type || ""}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value as any, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="boolean">Boolean</option>
            <option value="rollout">Rollout</option>
            <option value="experiment">Experiment</option>
          </select>

          <select
            value={filters.enabled !== undefined ? String(filters.enabled) : ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                enabled:
                  e.target.value === "" ? undefined : e.target.value === "true",
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All States</option>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>

          <input
            type="text"
            placeholder="Search..."
            value={filters.search || ""}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Feature Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flags.map((flag) => (
          <div
            key={flag._id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {flag.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                      flag.type
                    )}`}
                  >
                    {flag.type}
                  </span>
                </div>
                {flag.description && (
                  <p className="text-sm text-gray-600">{flag.description}</p>
                )}
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                  {flag.key}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(flag._id, flag.enabled)}
                  className={`p-2 rounded-lg ${
                    flag.enabled
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {flag.enabled ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {flag.type === "rollout" && flag.rollout && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Rollout Progress</span>
                  <span className="font-medium text-gray-900">
                    {flag.rollout.currentPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${flag.rollout.currentPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Checks:</span>
                <span className="font-medium text-gray-900">
                  {flag.usage.totalChecks.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Unique Users:</span>
                <span className="font-medium text-gray-900">
                  {flag.usage.uniqueUsers.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Modified:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(flag.updatedAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <Link
                href={`/admin/dashboard/features/${flag._id}`}
                className="flex-1 px-3 py-2 text-center border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 text-sm font-medium"
              >
                View Details
              </Link>
              <button
                onClick={() => handleArchive(flag._id)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(flag._id, flag.name)}
                className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
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

      {/* Create Feature Flag Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create Feature Flag
            </h2>

            <form onSubmit={handleCreateFlag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feature Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., New Dashboard UI"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feature Key
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., new_dashboard_ui"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use lowercase with underscores
                </p>
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
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe this feature..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="boolean">Boolean (On/Off)</option>
                  <option value="rollout">Gradual Rollout</option>
                  <option value="experiment">Experiment (A/B Test)</option>
                </select>
              </div>

              {formData.type === "rollout" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Rollout Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentage: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of users who will see this feature
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, enabled: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="enabled" className="text-sm text-gray-700">
                  Enable immediately after creation
                </label>
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
                  <Flag className="w-4 h-4" />
                  Create Feature Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
