"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import rolesService, { Permission, Role } from "@/services/admin/roles.service";
import {
  Shield,
  Lock,
  Users,
  Settings,
  FileText,
  DollarSign,
  BarChart3,
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<"permissions" | "roles">(
    "permissions"
  );
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [permissionFormData, setPermissionFormData] = useState({
    name: "",
    description: "",
    category: "",
  });

  const [roleFormData, setRoleFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "permissions") {
        const permissionsData = await rolesService.getPermissions();
        setPermissions(permissionsData.permissions);
      } else {
        const [rolesData, permissionsData] = await Promise.all([
          rolesService.getRoles(),
          rolesService.getPermissions(),
        ]);
        setRoles(rolesData.roles);
        setPermissions(permissionsData.permissions);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    try {
      // Note: This would need a backend endpoint
      toast.info("Permission creation endpoint not yet implemented");
      setShowPermissionModal(false);
      resetPermissionForm();
    } catch (error: any) {
      toast.error("Failed to create permission");
    }
  };

  const handleUpdatePermission = async () => {
    if (!editingPermission) return;
    try {
      // Note: This would need a backend endpoint
      toast.info("Permission update endpoint not yet implemented");
      setShowPermissionModal(false);
      resetPermissionForm();
    } catch (error: any) {
      toast.error("Failed to update permission");
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;
    try {
      // Note: This would need a backend endpoint
      toast.info("Permission deletion endpoint not yet implemented");
      loadData();
    } catch (error: any) {
      toast.error("Failed to delete permission");
    }
  };

  const handleCreateRole = async () => {
    try {
      const response = await rolesService.createRole(roleFormData);
      toast.success(response.message || "Role created successfully");
      setShowRoleModal(false);
      resetRoleForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create role");
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    try {
      const response = await rolesService.updateRole(
        editingRole._id,
        roleFormData
      );
      toast.success(response.message || "Role updated successfully");
      setShowRoleModal(false);
      resetRoleForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      const response = await rolesService.deleteRole(roleId);
      toast.success(response.message || "Role deleted successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete role");
    }
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setPermissionFormData({
      name: permission.name,
      description: permission.description,
      category: permission.category,
    });
    setShowPermissionModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setShowRoleModal(true);
  };

  const resetPermissionForm = () => {
    setPermissionFormData({ name: "", description: "", category: "" });
    setEditingPermission(null);
  };

  const resetRoleForm = () => {
    setRoleFormData({ name: "", description: "", permissions: [] });
    setEditingRole(null);
  };

  const togglePermissionInRole = (permissionName: string) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter((p) => p !== permissionName)
        : [...prev.permissions, permissionName],
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "user":
        return <Users className="w-5 h-5" />;
      case "system":
        return <Settings className="w-5 h-5" />;
      case "content":
        return <FileText className="w-5 h-5" />;
      case "financial":
        return <DollarSign className="w-5 h-5" />;
      case "analytics":
        return <BarChart3 className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "user":
        return "bg-blue-100 text-blue-800";
      case "system":
        return "bg-purple-100 text-purple-800";
      case "content":
        return "bg-green-100 text-green-800";
      case "financial":
        return "bg-yellow-100 text-yellow-800";
      case "analytics":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const filteredPermissions = permissions.filter(
    (permission) =>
      (permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) &&
      (!selectedCategory || permission.category === selectedCategory)
  );

  const categories = Array.from(
    new Set(permissions.map((p) => p.category))
  ).filter(Boolean);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Permissions Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage system permissions and role assignments
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "permissions", label: "Permissions", icon: Lock },
            { id: "roles", label: "Role Permissions", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Permissions Tab */}
      {activeTab === "permissions" && (
        <>
          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  resetPermissionForm();
                  setShowPermissionModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-5 h-5" />
                New Permission
              </button>
            </div>
          </div>

          {/* Permissions List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading permissions...</p>
            </div>
          ) : Object.keys(groupedPermissions).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No permissions found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(
                ([category, categoryPermissions]) => (
                  <div key={category} className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${getCategoryColor(
                          category
                        )}`}
                      >
                        {getCategoryIcon(category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {categoryPermissions.length} permissions
                        </p>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {categoryPermissions.map((permission) => (
                        <div
                          key={permission._id}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {permission.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {permission.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleEditPermission(permission)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletePermission(permission._id)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => {
                resetRoleForm();
                setShowRoleModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              New Role
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No roles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Shield className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {role.name}
                        </h3>
                        {role.isSystem && (
                          <span className="text-xs text-purple-600">
                            System Role
                          </span>
                        )}
                      </div>
                    </div>
                    {!role.isSystem && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {role.description}
                  </p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Permissions ({role.permissions.length})
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {role.permissions.slice(0, 5).map((permission, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <Check className="w-3 h-3 text-green-600" />
                          {permission}
                        </div>
                      ))}
                      {role.permissions.length > 5 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{role.permissions.length - 5} more permissions
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPermission ? "Edit Permission" : "New Permission"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission Name *
                </label>
                <input
                  type="text"
                  value={permissionFormData.name}
                  onChange={(e) =>
                    setPermissionFormData({
                      ...permissionFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., users.create"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={permissionFormData.description}
                  onChange={(e) =>
                    setPermissionFormData({
                      ...permissionFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe what this permission allows"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={permissionFormData.category}
                  onChange={(e) =>
                    setPermissionFormData({
                      ...permissionFormData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select category</option>
                  <option value="User">User Management</option>
                  <option value="System">System</option>
                  <option value="Content">Content</option>
                  <option value="Financial">Financial</option>
                  <option value="Analytics">Analytics</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={
                    editingPermission
                      ? handleUpdatePermission
                      : handleCreatePermission
                  }
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingPermission ? "Update" : "Create"} Permission
                </button>
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    resetPermissionForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingRole ? "Edit Role" : "New Role"}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={roleFormData.name}
                    onChange={(e) =>
                      setRoleFormData({ ...roleFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Content Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={roleFormData.description}
                    onChange={(e) =>
                      setRoleFormData({
                        ...roleFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief description of the role"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Permissions ({roleFormData.permissions.length} selected)
                </label>
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(
                    ([category, categoryPermissions]) => (
                      <div
                        key={category}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className={`p-2 rounded-lg ${getCategoryColor(
                              category
                            )}`}
                          >
                            {getCategoryIcon(category)}
                          </div>
                          <h4 className="font-semibold text-gray-900">
                            {category}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryPermissions.map((permission) => (
                            <label
                              key={permission._id}
                              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.includes(
                                  permission.name
                                )}
                                onChange={() =>
                                  togglePermissionInRole(permission.name)
                                }
                                className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {permission.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {permission.description}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={editingRole ? handleUpdateRole : handleCreateRole}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingRole ? "Update" : "Create"} Role
                </button>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    resetRoleForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
