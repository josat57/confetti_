"use client";

import { useState, useEffect } from "react";
import {
  AdminUser,
  AdminStats,
  AdminListFilters,
} from "@/types/admin-management";
import adminManagementService from "@/services/admin/admin-management.service";
import {
  Users,
  UserPlus,
  Shield,
  Activity,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  Power,
  Mail,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminListFilters>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminsRes, statsRes] = await Promise.all([
        adminManagementService.getAdmins(filters),
        adminManagementService.getStats(),
      ]);

      setAdmins(adminsRes.admins);
      setTotal(adminsRes.total);
      setStats(statsRes.stats);
    } catch (err: any) {
      console.error("Error fetching admins:", err);
      toast.error("Failed to load admin users");

      // Mock data for development
      setStats({
        totalAdmins: 12,
        activeAdmins: 10,
        superAdmins: 2,
        admins: 6,
        moderators: 4,
        recentActivity: 45,
        activeSessions: 8,
      });

      setAdmins([
        {
          _id: "1",
          firstName: "John",
          lastName: "Doe",
          name: "John Doe",
          email: "john@confetti.com",
          role: "super_admin",
          permissions: [],
          twoFactorEnabled: true,
          isActive: true,
          active: true,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: "2",
          firstName: "Jane",
          lastName: "Smith",
          name: "Jane Smith",
          email: "jane@confetti.com",
          role: "admin",
          permissions: [],
          twoFactorEnabled: true,
          isActive: true,
          active: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: "3",
          firstName: "Bob",
          lastName: "Wilson",
          name: "Bob Wilson",
          email: "bob@confetti.com",
          role: "moderator",
          permissions: [],
          twoFactorEnabled: false,
          isActive: true,
          active: true,
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (adminId: string) => {
    if (!confirm("Are you sure you want to deactivate this admin?")) return;

    try {
      setActionLoading(adminId);
      await adminManagementService.deactivateAdmin(adminId);
      toast.success("Admin deactivated successfully");
      fetchData();
    } catch (err: any) {
      console.error("Error deactivating admin:", err);
      toast.error("Failed to deactivate admin");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (adminId: string) => {
    try {
      setActionLoading(adminId);
      await adminManagementService.activateAdmin(adminId);
      toast.success("Admin activated successfully");
      fetchData();
    } catch (err: any) {
      console.error("Error activating admin:", err);
      toast.error("Failed to activate admin");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (adminId: string) => {
    if (!confirm("Send password reset link to this admin?")) return;

    try {
      setActionLoading(adminId);
      await adminManagementService.resetPassword(adminId);
      toast.success("Password reset link sent");
    } catch (err: any) {
      console.error("Error resetting password:", err);
      toast.error("Failed to send reset link");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (adminId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this admin? This action cannot be undone."
      )
    )
      return;

    try {
      setActionLoading(adminId);
      await adminManagementService.deleteAdmin(adminId);
      toast.success("Admin deleted successfully");
      fetchData();
    } catch (err: any) {
      console.error("Error deleting admin:", err);
      toast.error("Failed to delete admin");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "moderator":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600 mt-1">
            Manage admin users, roles, and permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/admins/activity"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Activity className="w-5 h-5" />
            Activity Logs
          </Link>
          <Link
            href="/admin/dashboard/admins/sessions"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Clock className="w-5 h-5" />
            Sessions
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <UserPlus className="w-5 h-5" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalAdmins}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Admins</p>
            <p className="text-xs text-green-600 mt-2">
              {stats.activeAdmins} active
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.superAdmins}
            </p>
            <p className="text-sm text-gray-600 mt-1">Super Admins</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.recentActivity}
            </p>
            <p className="text-sm text-gray-600 mt-1">Recent Actions</p>
            <p className="text-xs text-gray-500 mt-2">Last 24 hours</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.activeSessions}
            </p>
            <p className="text-sm text-gray-600 mt-1">Active Sessions</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.role || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                role: e.target.value as any,
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="super-admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>

          <select
            value={
              filters.isActive === undefined ? "" : filters.isActive.toString()
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                isActive:
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

      {/* Admin List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  2FA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{admin.name}</p>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        admin.role
                      )}`}
                    >
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {admin.twoFactorEnabled ? (
                      <span className="text-green-600 text-sm">Enabled</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Disabled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatLastLogin(
                      admin.lastLogin ? new Date(admin.lastLogin) : undefined
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/dashboard/admins/${admin._id}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="View Details"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleResetPassword(admin._id)}
                        disabled={actionLoading === admin._id}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      {admin.active ? (
                        <button
                          onClick={() => handleDeactivate(admin._id)}
                          disabled={actionLoading === admin._id}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg disabled:opacity-50"
                          title="Deactivate"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(admin._id)}
                          disabled={actionLoading === admin._id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                          title="Activate"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(admin._id)}
                        disabled={actionLoading === admin._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
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
    </div>
  );
}
