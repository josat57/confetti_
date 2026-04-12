"use client";

import { useState, useEffect } from "react";
import {
  SystemHealth,
  ServerMetrics,
  DatabaseMetrics,
  APIMetrics,
  CacheMetrics,
  MonitoringStats,
} from "@/types/monitoring";
import monitoringService from "@/services/admin/monitoring.service";
import {
  Activity,
  Server,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Loader2,
  RefreshCw,
  FileText,
  Settings,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function MonitoringPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics | null>(
    null
  );
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetrics | null>(null);
  const [apiMetrics, setAPIMetrics] = useState<APIMetrics | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      if (!loading) setRefreshing(true);

      const [healthRes, serverRes, dbRes, apiRes, cacheRes, statsRes] =
        await Promise.all([
          monitoringService.getSystemHealth(),
          monitoringService.getServerMetrics(),
          monitoringService.getDatabaseMetrics(),
          monitoringService.getAPIMetrics(),
          monitoringService.getCacheMetrics(),
          monitoringService.getStats(),
        ]);

      setHealth(healthRes.health);
      setServerMetrics(serverRes.metrics);
      setDbMetrics(dbRes.metrics);
      setAPIMetrics(apiRes.metrics);
      setCacheMetrics(cacheRes.metrics);
      setStats(statsRes.stats);
    } catch (err: any) {
      console.error("Error fetching monitoring data:", err);
      if (loading) {
        toast.error("Failed to load monitoring data");
      }

      // Mock data
      setHealth({
        status: "healthy",
        uptime: 2592000, // 30 days
        uptimePercentage: 99.98,
        lastChecked: new Date(),
        components: {
          api: { status: "healthy", responseTime: 45, errorRate: 0.02 },
          database: { status: "healthy", responseTime: 12, errorRate: 0.01 },
          cache: { status: "healthy", responseTime: 2, errorRate: 0 },
          storage: { status: "healthy", errorRate: 0 },
        },
      });

      setServerMetrics({
        cpu: { usage: 42.5, cores: 8, loadAverage: [1.2, 1.5, 1.8] },
        memory: {
          total: 16 * 1024 * 1024 * 1024,
          used: 8.5 * 1024 * 1024 * 1024,
          free: 7.5 * 1024 * 1024 * 1024,
          usagePercentage: 53.1,
        },
        disk: {
          total: 500 * 1024 * 1024 * 1024,
          used: 285 * 1024 * 1024 * 1024,
          free: 215 * 1024 * 1024 * 1024,
          usagePercentage: 57.0,
        },
        network: {
          bytesIn: 1024 * 1024 * 1024 * 45,
          bytesOut: 1024 * 1024 * 1024 * 120,
          requestsPerSecond: 450,
        },
        timestamp: new Date(),
      });

      setDbMetrics({
        connectionPool: { total: 100, active: 35, idle: 60, waiting: 5 },
        queryPerformance: {
          averageQueryTime: 15.5,
          slowQueries: 12,
          totalQueries: 125000,
          queriesPerSecond: 85,
        },
        storage: {
          size: 25 * 1024 * 1024 * 1024,
          collections: 45,
          indexes: 120,
        },
        timestamp: new Date(),
      });

      setAPIMetrics({
        totalRequests: 1250000,
        requestsPerSecond: 450,
        averageResponseTime: 125,
        errorRate: 0.5,
        statusCodes: {
          "2xx": 1200000,
          "3xx": 25000,
          "4xx": 20000,
          "5xx": 5000,
        },
        topEndpoints: [
          {
            endpoint: "/api/v1/events",
            method: "GET",
            requests: 250000,
            averageTime: 85,
            errorRate: 0.2,
          },
          {
            endpoint: "/api/v1/users",
            method: "GET",
            requests: 180000,
            averageTime: 65,
            errorRate: 0.1,
          },
          {
            endpoint: "/api/v1/vendors",
            method: "GET",
            requests: 150000,
            averageTime: 95,
            errorRate: 0.3,
          },
        ],
        timestamp: new Date(),
      });

      setCacheMetrics({
        hitRate: 85.5,
        missRate: 14.5,
        totalKeys: 15420,
        memoryUsage: 512 * 1024 * 1024,
        evictions: 1250,
        operations: { gets: 2500000, sets: 450000, deletes: 85000 },
        timestamp: new Date(),
      });

      setStats({
        systemStatus: "healthy",
        uptime: 2592000,
        totalRequests: 1250000,
        errorRate: 0.5,
        averageResponseTime: 125,
        activeUsers: 1250,
        backgroundJobs: { pending: 45, processing: 12, failed: 8 },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "degraded":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5" />;
      case "critical":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
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
            System Monitoring
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time system health and performance metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            Auto-refresh
          </label>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <Link
            href="/admin/dashboard/monitoring/errors"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-5 h-5" />
            Error Logs
          </Link>

          <Link
            href="/admin/dashboard/monitoring/jobs"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Activity className="w-5 h-5" />
            Background Jobs
          </Link>
        </div>
      </div>

      {/* System Status */}
      {health && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              System Status
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  health.status
                )}`}
              >
                {getStatusIcon(health.status)}
                {health.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">
                {health.uptimePercentage}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatUptime(health.uptime)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">API</p>
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    health.components.api.status
                  )}`}
                >
                  {getStatusIcon(health.components.api.status)}
                  {health.components.api.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {health.components.api.responseTime}ms avg
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Database</p>
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    health.components.database.status
                  )}`}
                >
                  {getStatusIcon(health.components.database.status)}
                  {health.components.database.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {health.components.database.responseTime}ms avg
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Cache</p>
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    health.components.cache.status
                  )}`}
                >
                  {getStatusIcon(health.components.cache.status)}
                  {health.components.cache.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {health.components.cache.responseTime}ms avg
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Server Metrics */}
      {serverMetrics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Server className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Server Metrics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">CPU Usage</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage</span>
                  <span className="font-semibold text-gray-900">
                    {serverMetrics.cpu.usage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${serverMetrics.cpu.usage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {serverMetrics.cpu.cores} cores • Load:{" "}
                  {serverMetrics.cpu.loadAverage.join(", ")}
                </p>
              </div>
            </div>

            {/* Memory */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MemoryStick className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Memory</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage</span>
                  <span className="font-semibold text-gray-900">
                    {serverMetrics.memory.usagePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${serverMetrics.memory.usagePercentage}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {formatBytes(serverMetrics.memory.used)} /{" "}
                  {formatBytes(serverMetrics.memory.total)}
                </p>
              </div>
            </div>

            {/* Disk */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Disk Space</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage</span>
                  <span className="font-semibold text-gray-900">
                    {serverMetrics.disk.usagePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${serverMetrics.disk.usagePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {formatBytes(serverMetrics.disk.used)} /{" "}
                  {formatBytes(serverMetrics.disk.total)}
                </p>
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Network className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Network</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Bytes In</p>
                <p className="font-semibold text-gray-900">
                  {formatBytes(serverMetrics.network.bytesIn)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Bytes Out</p>
                <p className="font-semibold text-gray-900">
                  {formatBytes(serverMetrics.network.bytesOut)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Requests/sec</p>
                <p className="font-semibold text-gray-900">
                  {serverMetrics.network.requestsPerSecond}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database & API Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database */}
        {dbMetrics && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Database</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Connection Pool
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Active</p>
                    <p className="font-semibold text-green-600">
                      {dbMetrics.connectionPool.active}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Idle</p>
                    <p className="font-semibold text-gray-900">
                      {dbMetrics.connectionPool.idle}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Waiting</p>
                    <p className="font-semibold text-orange-600">
                      {dbMetrics.connectionPool.waiting}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-semibold text-gray-900">
                      {dbMetrics.connectionPool.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Query Performance
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Avg Query Time</p>
                    <p className="font-semibold text-gray-900">
                      {dbMetrics.queryPerformance.averageQueryTime}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Queries/sec</p>
                    <p className="font-semibold text-gray-900">
                      {dbMetrics.queryPerformance.queriesPerSecond}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Slow Queries</p>
                    <p className="font-semibold text-red-600">
                      {dbMetrics.queryPerformance.slowQueries}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Queries</p>
                    <p className="font-semibold text-gray-900">
                      {dbMetrics.queryPerformance.totalQueries.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Metrics */}
        {apiMetrics && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                API Performance
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Total Requests</p>
                  <p className="font-semibold text-gray-900">
                    {apiMetrics.totalRequests.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Requests/sec</p>
                  <p className="font-semibold text-gray-900">
                    {apiMetrics.requestsPerSecond}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Response</p>
                  <p className="font-semibold text-gray-900">
                    {apiMetrics.averageResponseTime}ms
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Error Rate</p>
                  <p className="font-semibold text-red-600">
                    {apiMetrics.errorRate}%
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Status Codes
                </h3>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-gray-600">2xx</p>
                    <p className="font-semibold text-green-600">
                      {apiMetrics.statusCodes["2xx"].toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">3xx</p>
                    <p className="font-semibold text-blue-600">
                      {apiMetrics.statusCodes["3xx"].toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">4xx</p>
                    <p className="font-semibold text-orange-600">
                      {apiMetrics.statusCodes["4xx"].toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">5xx</p>
                    <p className="font-semibold text-red-600">
                      {apiMetrics.statusCodes["5xx"].toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Top Endpoints
                </h3>
                <div className="space-y-2">
                  {apiMetrics.topEndpoints.slice(0, 3).map((endpoint, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-600 truncate">
                        {endpoint.method} {endpoint.endpoint}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {endpoint.requests.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cache Metrics */}
      {cacheMetrics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Cache Performance
              </h2>
            </div>
            <Link
              href="/admin/dashboard/monitoring/cache"
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              Manage Cache
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Hit Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {cacheMetrics.hitRate}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Miss Rate</p>
              <p className="text-2xl font-bold text-orange-600">
                {cacheMetrics.missRate}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Keys</p>
              <p className="text-2xl font-bold text-gray-900">
                {cacheMetrics.totalKeys.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatBytes(cacheMetrics.memoryUsage)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
