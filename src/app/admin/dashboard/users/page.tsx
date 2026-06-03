"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminUserView, UserActivityRecord } from "@/types/user-admin";
import UserList from "@/components/admin/users/UserList";
import UserProfile from "@/components/admin/users/UserProfile";
import { Users, Loader2 } from "lucide-react";
import usersService from "@/services/admin/users.service";
import { toast } from "react-toastify";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [activities, setActivities] = useState<UserActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await usersService.getUsers({ page, limit: 50 });
      setUsers(response.users);
      setPagination((prev) => ({ ...prev, ...response.pagination }));
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserSelect = async (user: AdminUserView) => {
    setSelectedUser(user);
    setActivities([]);
    try {
      const response = await usersService.getUserActivity(user._id, { limit: 20 });
      setActivities(response.activities);
    } catch {
      // activity is non-critical; silently fail
    }
  };

  const handleSuspend = async (userId: string) => {
    const user = users.find((u) => u._id === userId);
    const newStatus = user?.status === "suspended" ? "active" : "suspended";
    const confirmed = confirm(
      newStatus === "suspended"
        ? "Are you sure you want to suspend this user?"
        : "Are you sure you want to reactivate this user?"
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await usersService.updateUserStatus(userId, newStatus);
      toast.success(
        newStatus === "suspended"
          ? "User suspended successfully"
          : "User reactivated successfully"
      );
      await fetchUsers(pagination.page);
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    try {
      setActionLoading(true);
      await usersService.deleteUser(userId);
      toast.success("User deleted successfully");
      await fetchUsers(pagination.page);
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: Partial<AdminUserView>) => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const response = await usersService.updateUser(selectedUser._id, data);
      toast.success("User updated successfully");
      setSelectedUser(response.user);
      await fetchUsers(pagination.page);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all platform users</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-lg">
          <Users className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-900">
            {pagination.total} Total Users
          </span>
        </div>
      </div>

      {actionLoading && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </div>
      )}

      <UserList
        users={users}
        onUserSelect={handleUserSelect}
        onSuspend={handleSuspend}
        onDelete={handleDelete}
        pagination={pagination}
        onPageChange={(page) => fetchUsers(page)}
        loading={loading}
      />

      {selectedUser && (
        <UserProfile
          user={selectedUser}
          activities={activities}
          onClose={() => {
            setSelectedUser(null);
            setActivities([]);
          }}
          onUpdate={handleUpdate}
          onSuspend={() => {
            handleSuspend(selectedUser._id);
            setSelectedUser(null);
          }}
          onDelete={() => {
            handleDelete(selectedUser._id);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
