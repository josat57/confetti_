"use client";

import { useState, useEffect } from "react";
import { AdminSession, AdminSessionFilters } from "@/types/admin-management";
import adminManagementService from "@/services/admin/admin-management.service";
import {
  Clock,
  Monitor,
  MapPin,
  Power,
  Search,
  Loader2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminSessionFilters>({
    page: 1,
    limit: 20,
    active: true,
  });
  const [total, setTotal] = useState(0);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchSessions();
  }, [filters]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await adminManagementService.getSessions(filters);
      setSessions(response.sessions);
      setTotal(response.total);
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
      toast.error("Failed to load sessions");

      // Mock data
      setSessions([
        {
          _id: "1",
          adminId: "1",
          token: "token123",
          ipAddress: "192.168.1.1",
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          device: "MacBook Pro",
          location: "Lagos, Nigeria",
          active: true,
          lastActivity: new Date(),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
        },
        {
          _id: "2",
          adminId: "2",
          token: "token456",
          ipAddress: "192.168.1.2",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          device: "Windows PC",
          location: "Nairobi, Kenya",
          active: true,
          lastActivity: new Date(Date.now() - 15 * 60 * 1000),
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
        },
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to terminate this session?")) return;

    try {
      setTerminatingSession(sessionId);
      await adminManagementService.terminateSession(sessionId);
      toast.success("Session terminated successfully");
      fetchSessions();
    } catch (err: any) {
      console.error("Error terminating session:", err);
      toast.error("Failed to terminate session");
    } finally {
      setTerminatingSession(null);
    }
  };

  const formatDuration = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
      return "📱";
    }
    if (userAgent.includes("Macintosh") || userAgent.includes("Mac")) {
      return "💻";
    }
    if (userAgent.includes("Windows")) {
      return "🖥️";
    }
    return "💻";
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
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard/admins"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Active Sessions
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage admin login sessions
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-600 mt-1">Active Sessions</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Monitor className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {sessions.filter((s) => s.device.includes("Mobile")).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Mobile Devices</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {
              sessions.filter(
                (s) =>
                  new Date(s.lastActivity).getTime() <
                  Date.now() - 30 * 60 * 1000
              ).length
            }
          </p>
          <p className="text-sm text-gray-600 mt-1">Idle Sessions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by admin ID..."
              value={filters.adminId || ""}
              onChange={(e) =>
                setFilters({ ...filters, adminId: e.target.value, page: 1 })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={
              filters.active === undefined ? "" : filters.active.toString()
            }
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
            <option value="true">Active Only</option>
            <option value="false">Expired Only</option>
            <option value="">All Sessions</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {sessions.map((session) => (
            <div key={session._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl">
                    {getDeviceIcon(session.userAgent)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {session.device}
                      </h3>
                      {session.active ? (
                        <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                          Expired
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{session.location || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span>{session.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          Last active:{" "}
                          {formatLastActivity(session.lastActivity)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          Duration: {formatDuration(session.createdAt)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {session.userAgent}
                    </p>
                  </div>
                </div>

                {session.active && (
                  <button
                    onClick={() => handleTerminateSession(session._id)}
                    disabled={terminatingSession === session._id}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    {terminatingSession === session._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                    Terminate
                  </button>
                )}
              </div>
            </div>
          ))}
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
    </div>
  );
}
