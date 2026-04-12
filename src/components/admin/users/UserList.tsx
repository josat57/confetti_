"use client";

import { useState } from "react";
import { AdminUserView, UserFilters } from "@/types/user-admin";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Ban,
  Trash2,
} from "lucide-react";

interface UserListProps {
  users: AdminUserView[];
  onUserSelect: (user: AdminUserView) => void;
  onSuspend: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export default function UserList({
  users,
  onUserSelect,
  onSuspend,
  onDelete,
}: UserListProps) {
  const [filters, setFilters] = useState<UserFilters>({
    role: "",
    status: "",
    tier: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status && user.status !== filters.status) return false;
    if (filters.tier && user.subscriptionTier !== filters.tier) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchLower)
      );
    }
    return true;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u._id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "vendor":
        return "bg-blue-100 text-blue-800";
      case "event-planner":
        return "bg-purple-100 text-purple-800";
      case "guest":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "deleted":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Roles</option>
                <option value="vendor">Vendor</option>
                <option value="event-planner">Event Planner</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier
              </label>
              <select
                value={filters.tier}
                onChange={(e) =>
                  setFilters({ ...filters, tier: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Tiers</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-purple-900">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors">
              Suspend Selected
            </button>
            <button className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 capitalize">
                      {user.subscriptionTier || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(user.registrationDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onUserSelect(user)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSuspend(user._id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Suspend User"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found matching your criteria
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">
          Showing {filteredUsers.length} of {users.length} users
        </span>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Previous
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
