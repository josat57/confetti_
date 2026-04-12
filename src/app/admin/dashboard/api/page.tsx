"use client";

import { useState, useEffect } from "react";
import { APIKey, APIKeyFilters, APIUsageStats } from "@/types/api-management";
import apiManagementService from "@/services/admin/api-management.service";
import {
  Key,
  Plus,
  Loader2,
  Copy,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [stats, setStats] = useState<APIUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newAPIKey, setNewAPIKey] = useState<APIKey | null>(null);
  const [filters, setFilters] = useState<APIKeyFilters>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [keysRes, statsRes] = await Promise.all([
        apiManagementService.getAPIKeys(filters),
        apiManagementService.getAPIUsageStats(),
      ]);

      setApiKeys(keysRes.apiKeys);
      setTotal(keysRes.total);
      setStats(statsRes.stats);
    } catch (err: any) {
      console.error("Error fetching API keys:", err);
      toast.error("Failed to load API keys");

      // Mock data
      setStats({
        totalRequests: 125000,
        successfulRequests: 120000,
        failedRequests: 5000,
        averageResponseTime: 150,
        requestsToday: 5000,
        requestsThisWeek: 35000,
        requestsThisMonth: 125000,
        topEndpoints: [
          {
            endpoint: "/api/v1/events",
            count: 45000,
            averageResponseTime: 120,
          },
          { endpoint: "/api/v1/users", count: 30000, averageResponseTime: 100 },
          {
            endpoint: "/api/v1/bookings",
            count: 25000,
            averageResponseTime: 180,
          },
        ],
        errorRate: 4,
        requestsByStatusCode: [
          { code: 200, count: 100000 },
          { code: 201, count: 20000 },
          { code: 400, count: 3000 },
          { code: 401, count: 1500 },
          { code: 500, count: 500 },
        ],
        requestsByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 5000) + 1000,
        })),
      });

      setApiKeys([
        {
          _id: "1",
          name: "Production API Key",
          description: "Main production API key for mobile app",
          key: "pk_live_abc123def456ghi789",
          status: "active",
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-01-01"),
          lastUsed: new Date(),
          rateLimit: {
            requestsPerMinute: 100,
            requestsPerHour: 5000,
            requestsPerDay: 50000,
          },
          permissions: ["read:events", "write:bookings", "read:users"],
          usage: {
            totalRequests: 85000,
            successfulRequests: 82000,
            failedRequests: 3000,
            lastRequest: new Date(),
          },
        },
        {
          _id: "2",
          name: "Development API Key",
          description: "Testing and development purposes",
          key: "pk_test_xyz789uvw456rst123",
          status: "active",
          createdBy: "dev@confetti.com",
          createdAt: new Date("2025-10-01"),
          lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
          rateLimit: {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000,
          },
          permissions: ["read:*"],
          usage: {
            totalRequests: 25000,
            successfulRequests: 24000,
            failedRequests: 1000,
            lastRequest: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
        },
        {
          _id: "3",
          name: "Partner Integration",
          description: "Third-party partner API access",
          key: "pk_live_partner_abc123",
          status: "active",
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-06-01"),
          lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 500,
            requestsPerDay: 5000,
          },
          permissions: ["read:events", "read:venues"],
          usage: {
            totalRequests: 15000,
            successfulRequests: 14000,
            failedRequests: 1000,
            lastRequest: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiManagementService.createAPIKey({
        name: formData.name,
        description: formData.description,
        rateLimit: {
          requestsPerMinute: formData.requestsPerMinute,
          requestsPerHour: formData.requestsPerHour,
          requestsPerDay: formData.requestsPerDay,
        },
      });
      setNewAPIKey(response.apiKey);
      setShowCreateModal(false);
      setShowSecretModal(true);
      toast.success("API key created successfully");
      fetchData();
    } catch (err: any) {
      console.error("Error creating API key:", err);
      toast.error("Failed to create API key");
    }
  };

  const handleRevoke = async (keyId: string, keyName: string) => {
    if (!confirm(`Revoke API key "${keyName}"? This action cannot be undone.`))
      return;

    try {
      await apiManagementService.revokeAPIKey(keyId);
      toast.success("API key revoked successfully");
      fetchData();
    } catch (err: any) {
      console.error("Error revoking API key:", err);
      toast.error("Failed to revoke API key");
    }
  };

  const handleDelete = async (keyId: string, keyName: string) => {
    if (!confirm(`Delete API key "${keyName}"?`)) return;

    try {
      await apiManagementService.deleteAPIKey(keyId);
      toast.success("API key deleted successfully");
      fetchData();
    } catch (err: any) {
      console.error("Error deleting API key:", err);
      toast.error("Failed to delete API key");
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "revoked":
        return "text-red-600 bg-red-100";
      case "expired":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "revoked":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "expired":
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return key;
    return key.substring(0, 8) + "..." + key.substring(key.length - 4);
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
            API & Integration Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage API keys, webhooks, and third-party integrations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/api/logs"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Activity className="w-5 h-5" />
            API Logs
          </Link>
          <Link
            href="/admin/dashboard/api/webhooks"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
            Webhooks
          </Link>
          <Link
            href="/admin/dashboard/api/integrations"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Key className="w-5 h-5" />
            Integrations
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            Create API Key
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalRequests.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Requests</p>
            <p className="text-xs text-green-600 mt-2">
              +{stats.requestsToday.toLocaleString()} today
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {((stats.successfulRequests / stats.totalRequests) * 100).toFixed(
                1
              )}
              %
            </p>
            <p className="text-sm text-gray-600 mt-1">Success Rate</p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.successfulRequests.toLocaleString()} successful
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.averageResponseTime}ms
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg Response Time</p>
            <p className="text-xs text-gray-500 mt-2">Last 24 hours</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.errorRate}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Error Rate</p>
            <p className="text-xs text-red-600 mt-2">
              {stats.failedRequests.toLocaleString()} failed
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as any, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
            <option value="expired">Expired</option>
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

      {/* API Keys List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {apiKey.name}
                      </p>
                      {apiKey.description && (
                        <p className="text-sm text-gray-500">
                          {apiKey.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {maskKey(apiKey.key)}
                        </code>
                        <button
                          onClick={() => handleCopyKey(apiKey.key)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(apiKey.status)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          apiKey.status
                        )}`}
                      >
                        {apiKey.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900">
                        {apiKey.usage.totalRequests.toLocaleString()} requests
                      </p>
                      <p className="text-xs text-gray-500">
                        {(
                          (apiKey.usage.successfulRequests /
                            apiKey.usage.totalRequests) *
                          100
                        ).toFixed(1)}
                        % success
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900">
                        {apiKey.rateLimit.requestsPerMinute}/min
                      </p>
                      <p className="text-xs text-gray-500">
                        {apiKey.rateLimit.requestsPerDay.toLocaleString()}/day
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(apiKey.lastUsed)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {apiKey.status === "active" && (
                        <button
                          onClick={() => handleRevoke(apiKey._id, apiKey.name)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Revoke"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(apiKey._id, apiKey.name)}
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

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create API Key
            </h2>

            <form onSubmit={handleCreateAPIKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Production API Key"
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
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe the purpose of this API key..."
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Rate Limits
                </h3>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Requests per Minute
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.requestsPerMinute}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requestsPerMinute: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Requests per Hour
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.requestsPerHour}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requestsPerHour: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Requests per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.requestsPerDay}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requestsPerDay: parseInt(e.target.value),
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
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Key className="w-4 h-4" />
                  Create API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Secret Modal */}
      {showSecretModal && newAPIKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              API Key Created
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Important: Save your API key
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This is the only time you'll see the secret. Store it
                    securely.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded border border-gray-300">
                    {newAPIKey.key}
                  </code>
                  <button
                    onClick={() => handleCopyKey(newAPIKey.key)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {newAPIKey.secret && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Secret
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded border border-gray-300">
                      {newAPIKey.secret}
                    </code>
                    <button
                      onClick={() => handleCopyKey(newAPIKey.secret!)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSecretModal(false);
                  setNewAPIKey(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
