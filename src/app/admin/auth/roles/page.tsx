"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Search,
  Lock,
  Users,
} from "lucide-react";
import rolesService, { Role, Permission } from "@/services/admin/roles.service";
import { toast } from "react-toastify";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "view"
  );
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsResponse] = await Promise.all([
        rolesService.getRoles(),
        rolesService.getPermissions(),
      ]);
      setRoles(rolesResponse.roles);
      setPermissions(permissionsResponse.permissions);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedRole(null);
    setModalMode("create");
    setShowModal(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleView = (role: Role) => {
    setSelectedRole(role);
    setModalMode("view");
    setShowModal(true);
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      toast.error("Cannot delete system roles");
      return;
    }

    if (!confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
      return;
    }

    try {
      await rolesService.deleteRole(role._id);
      toast.success("Role deleted successfully");
      fetchData();
    } catch (err: any) {
      console.error("Error deleting role:", err);
      toast.error(err.response?.data?.message || "Failed to delete role");
    }
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Role Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage roles and their permissions
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Roles Found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? "No roles match your search"
                : "Get started by creating your first role"}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Role
              </button>
            )}
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role._id}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${
                role.isSystem ? "border-2 border-blue-200" : ""
              }`}
            >
              {/* Role Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {role.name}
                    </h3>
                    {role.isSystem && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        System Role
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {role.description}
              </p>

              {/* Permissions Count */}
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>
                  {role.permissions.length} permission
                  {role.permissions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <button
                  onClick={() => handleView(role)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View Details
                </button>
                {!role.isSystem && (
                  <>
                    <button
                      onClick={() => handleEdit(role)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(role)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <RoleModal
          mode={modalMode}
          role={selectedRole}
          permissions={permissions}
          onClose={() => {
            setShowModal(false);
            setSelectedRole(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setSelectedRole(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

// Role Modal Component
function RoleModal({
  mode,
  role,
  permissions,
  onClose,
  onSuccess,
}: {
  mode: "create" | "edit" | "view";
  role: Role | null;
  permissions: Permission[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: role?.name || "",
    description: role?.description || "",
    permissions: role?.permissions || [],
  });

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "create") {
        await rolesService.createRole(formData);
        toast.success("Role created successfully");
      } else if (mode === "edit" && role) {
        await rolesService.updateRole(role._id, formData);
        toast.success("Role updated successfully");
      }
      onSuccess();
    } catch (err: any) {
      console.error("Error saving role:", err);
      toast.error(err.response?.data?.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionName: string) => {
    if (isViewMode) return;

    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter((p) => p !== permissionName)
        : [...prev.permissions, permissionName],
    }));
  };

  const toggleCategory = (category: string) => {
    if (isViewMode) return;

    const categoryPermissions = groupedPermissions[category].map((p) => p.name);
    const allSelected = categoryPermissions.every((p) =>
      formData.permissions.includes(p)
    );

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !categoryPermissions.includes(p))
        : [...new Set([...prev.permissions, ...categoryPermissions])],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "create"
              ? "Create New Role"
              : mode === "edit"
              ? "Edit Role"
              : "Role Details"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-2xl text-gray-400">×</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                required
                disabled={isViewMode || (isEditMode && role?.isSystem)}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                placeholder="e.g., Content Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                disabled={isViewMode}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                placeholder="Describe what this role can do..."
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Permissions
            </h3>
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {category}
                    </h4>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        {perms.every((p) =>
                          formData.permissions.includes(p.name)
                        )
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {perms.map((permission) => (
                      <label
                        key={permission._id}
                        className={`flex items-start gap-2 p-2 rounded ${
                          !isViewMode ? "cursor-pointer hover:bg-gray-100" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={isViewMode}
                          checked={formData.permissions.includes(
                            permission.name
                          )}
                          onChange={() => togglePermission(permission.name)}
                          className="mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {permission.name}
                          </p>
                          {permission.description && (
                            <p className="text-xs text-gray-600">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "create" ? "Create Role" : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
