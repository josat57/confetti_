"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import adminManagementService from "@/services/admin/admin-management.service";
import {
  AdminUser,
  AdminStats,
  AdminActivityLog,
} from "@/types/admin-management";
import {
  Shield,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Mail,
  Eye,
  Search,
  Filter,
  BarChart3,
  Activity,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Key,
} from "lucide-react";

export default function AdminsPage() {
  const [activeTab, setActiveTab] = useState<"list" | "activity" | "stats">(
    "list"
  );
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "admin" as "super_admin" | "admin" | "moderator",
    permissions: [] as string[],
    sendInvitation: true,
  });

  useEffect(() => {
    loadData();
  }, [activeTab, filterStatus, filterRole]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "list") {
        const adminsData = await adminManagementService.getAdmins({
          isActive: filterStatus ? filterStatus === "active" : undefined,
          role: (filterRole as any) || undefined,
          search: searchQuery || undefined,
        });
        setAdmins(adminsData.admins || []);

        // Get stats (service will calculate from admin list if endpoint doesn't exist)
        try {
          const statsData = await adminManagementService.getStats();
          setStats(statsData.stats);
        } catch (error) {
          console.log("Failed to load stats:", error);
          // Calculate basic stats from loaded admins as fallback
          const admins = adminsData.admins || [];
          setStats({
            totalAdmins: admins.length,
            activeAdmins: admins.filter((a) => a.isActive || a.active).length,
            superAdmins: admins.filter((a) => a.role === "super_admin").length,
            admins: admins.filter((a) => a.role === "admin").length,
            moderators: admins.filter((a) => a.role === "moderator").length,
            recentActivity: 0,
            activeSessions: 0,
          });
        }
      } else if (activeTab === "activity") {
        try {
          const activityData = await adminManagementService.getActivityLogs();
          setActivityLogs(activityData.activities || []);
        } catch (error) {
          console.log("Activity logs endpoint not available yet");
        }
      } else if (activeTab === "stats") {
        try {
          const statsData = await adminManagementService.getStats();
          setStats(statsData.stats);
        } catch (error) {
          console.log("Stats endpoint not available yet");
        }
      }
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        const response = await adminManagementService.updateAdmin(
          editingAdmin._id,
          {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            role: formData.role,
            permissions: formData.permissions,
          }
        );
        toast.success(response.message || "Admin updated successfully");
      } else {
        const response = await adminManagementService.createAdmin({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          permissions: formData.permissions,
          sendInvitation: formData.sendInvitation,
        });
        toast.success(response.message || "Admin created successfully");
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save admin");
    }
  };

  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || [],
      sendInvitation: false,
    });
    setShowModal(true);
  };

  const handleDelete = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    try {
      const response = await adminManagementService.deleteAdmin(adminId);
      toast.success(response.message || "Admin deleted successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete admin");
    }
  };

  const handleToggleStatus = async (
    adminId: string,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;
      const response = await adminManagementService.updateAdmin(adminId, {
        isActive: newStatus,
      });
      toast.success(response.message || "Status updated successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleResetPassword = async (adminId: string) => {
    if (!confirm("Are you sure you want to reset this admin's password?"))
      return;
    try {
      const response = await adminManagementService.resetPassword(adminId);
      toast.success(
        response.message || "Password reset email sent successfully"
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  const handleSendInvitation = async (adminId: string) => {
    try {
      const response = await adminManagementService.sendInvitation(adminId);
      toast.success(response.message || "Invitation sent successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    }
  };

  const handleViewDetails = async (admin: AdminUser) => {
    try {
      const response = await adminManagementService.getAdminById(admin._id);
      setSelectedAdmin(response.admin);
      setShowDetailsModal(true);
    } catch (error: any) {
      toast.error("Failed to load admin details");
    }
  };

  const handleExportActivity = async () => {
    try {
      const response = await adminManagementService.exportActivityLogs();
      window.open(response.downloadUrl, "_blank");
      toast.success("Activity logs exported successfully");
    } catch (error: any) {
      toast.error("Failed to export activity logs");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "admin",
      permissions: [],
      sendInvitation: true,
    });
    setEditingAdmin(null);
  };

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
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

  const getStatusIcon = (active: boolean) => {
    return active ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <XCircle className="w-4 h-4" />
    );
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      (admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterStatus === "" ||
        (filterStatus === "active" && admin.active) ||
        (filterStatus === "inactive" && !admin.active)) &&
      (!filterRole || admin.role === filterRole)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-gray-600 mt-2">
          Manage admin users and their permissions
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("list")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "list"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Admin List
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "activity"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Activity className="w-5 h-5 inline mr-2" />
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "stats"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Statistics
          </button>
        </nav>
      </div>

      {/* Admin List Tab */}
      {activeTab === "list" && (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Admins</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalAdmins}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Admins</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.activeAdmins}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Super Admins</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.superAdmins}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.activeSessions}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
          )}

          {/* Filters and Actions */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add Admin
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Admin Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading admins...</p>
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No admins found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAdmins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {admin.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(
                              admin.role
                            )}`}
                          >
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              admin.active ?? false
                            )}`}
                          >
                            {getStatusIcon(admin.active ?? false)}
                            {admin.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {admin.twoFactorEnabled ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <Lock className="w-4 h-4" />
                              Enabled
                            </span>
                          ) : (
                            <span className="text-gray-400 flex items-center gap-1">
                              <Unlock className="w-4 h-4" />
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.lastLogin
                            ? new Date(admin.lastLogin).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(admin)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(admin)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  admin._id,
                                  admin.active ?? false
                                )
                              }
                              className="text-yellow-600 hover:text-yellow-900"
                              title={admin.active ? "Deactivate" : "Activate"}
                            >
                              {admin.active ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleResetPassword(admin._id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSendInvitation(admin._id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Send Invitation"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(admin._id)}
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
            )}
          </div>
        </>
      )}

      {/* Activity Logs Tab */}
      {activeTab === "activity" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Activity Logs
            </h2>
            <button
              onClick={handleExportActivity}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading activity logs...</p>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No activity logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activityLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.adminName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.adminEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.details || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === "stats" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Distribution
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Super Admins</span>
                  <span className="font-semibold text-purple-600">
                    {stats.superAdmins}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Admins</span>
                  <span className="font-semibold text-blue-600">
                    {stats.admins}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Moderators</span>
                  <span className="font-semibold text-green-600">
                    {stats.moderators}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-green-600">
                    {stats.activeAdmins}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Inactive</span>
                  <span className="font-semibold text-red-600">
                    {stats.totalAdmins - stats.activeAdmins}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold text-gray-900">
                    {stats.totalAdmins}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activity Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Recent Activity</span>
                  <span className="font-semibold text-blue-600">
                    {stats.recentActivity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Sessions</span>
                  <span className="font-semibold text-orange-600">
                    {stats.activeSessions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingAdmin ? "Edit Admin" : "Create New Admin"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              {!editingAdmin && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendInvitation"
                    checked={formData.sendInvitation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sendInvitation: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="sendInvitation"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Send invitation email
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAdmin ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Details Modal */}
      {showDetailsModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">Admin Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedAdmin.firstName} {selectedAdmin.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {selectedAdmin.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(
                        selectedAdmin.role
                      )}`}
                    >
                      {selectedAdmin.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        selectedAdmin.active ?? false
                      )}`}
                    >
                      {getStatusIcon(selectedAdmin.active ?? false)}
                      {selectedAdmin.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">2FA Status</p>
                    <p className="font-medium text-gray-900">
                      {selectedAdmin.twoFactorEnabled ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Lock className="w-4 h-4" />
                          Enabled
                        </span>
                      ) : (
                        <span className="text-gray-400 flex items-center gap-1">
                          <Unlock className="w-4 h-4" />
                          Disabled
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="font-medium text-gray-900">
                      {selectedAdmin.lastLogin
                        ? new Date(selectedAdmin.lastLogin).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Permissions
                </h3>
                {selectedAdmin.permissions &&
                selectedAdmin.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedAdmin.permissions.map((perm, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No custom permissions set</p>
                )}
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Timestamps
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedAdmin.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Updated At</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedAdmin.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
