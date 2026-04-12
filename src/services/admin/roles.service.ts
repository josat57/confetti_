import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if it's an authentication error, not a missing endpoint
    if (
      error.response?.status === 401 &&
      error.config?.url !== "/admin/auth/permissions" &&
      error.config?.url !== "/admin/auth/roles"
    ) {
      console.error("Authentication failed:", error.response?.data?.message);
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// Backend role structure
interface BackendRole {
  value: string;
  label: string;
  description: string;
  permissions: string | string[];
}

// Frontend role structure
export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Permission {
  _id: string;
  name: string;
  description: string;
  category: string;
}

class RolesService {
  private baseUrl = "/admin/auth/roles";

  /**
   * Get all roles
   */
  async getRoles(): Promise<{ roles: Role[] }> {
    try {
      const response = await api.get(this.baseUrl);
      const backendRoles: BackendRole[] =
        response.data.data?.roles || response.data.roles || [];

      // Transform backend roles to frontend format
      const roles: Role[] = backendRoles.map((role) => ({
        _id: role.value,
        name: role.label,
        description: role.description || "",
        permissions:
          role.permissions === "all"
            ? this.getDefaultPermissions().map((p) => p.name)
            : Array.isArray(role.permissions)
            ? role.permissions
            : [],
        isSystem: role.value === "super_admin" || role.value === "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return { roles };
    } catch (error: any) {
      // If endpoint doesn't exist, return empty array
      if (error.response?.status === 404 || error.response?.status === 401) {
        console.warn("Roles endpoint not available, returning empty array");
        return { roles: [] };
      }
      throw error;
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string): Promise<{ role: Role }> {
    const response = await api.get(`${this.baseUrl}/${roleId}`);
    return {
      role: response.data.data?.role || response.data.role,
    };
  }

  /**
   * Create a new role
   */
  async createRole(roleData: {
    name: string;
    description: string;
    permissions: string[];
  }): Promise<{
    role: Role;
    message: string;
  }> {
    const response = await api.post(this.baseUrl, {
      ...roleData,
      resourceType: "role",
    });
    return {
      role: response.data.data?.role || response.data.role,
      message: response.data.message || "Role created successfully",
    };
  }

  /**
   * Update a role
   */
  async updateRole(
    roleId: string,
    roleData: {
      name?: string;
      description?: string;
      permissions?: string[];
    }
  ): Promise<{
    role: Role;
    message: string;
  }> {
    const response = await api.put(`${this.baseUrl}/${roleId}`, {
      ...roleData,
      resourceType: "role",
    });
    return {
      role: response.data.data?.role || response.data.role,
      message: response.data.message || "Role updated successfully",
    };
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${roleId}`, {
      data: { resourceType: "role" },
    });
    return {
      message: response.data.message || "Role deleted successfully",
    };
  }

  /**
   * Get all available permissions
   */
  async getPermissions(): Promise<{ permissions: Permission[] }> {
    try {
      const response = await api.get("/admin/auth/permissions");
      const backendPermissions =
        response.data.data?.permissions || response.data.permissions || [];

      // If backend returns array of strings, transform to Permission objects
      if (
        Array.isArray(backendPermissions) &&
        typeof backendPermissions[0] === "string"
      ) {
        const transformedPermissions: Permission[] = backendPermissions.map(
          (permName: string) => {
            // Find matching default permission for details
            const defaultPerm = this.getDefaultPermissions().find(
              (p) => p.name === permName
            );
            return {
              _id: permName,
              name: permName,
              description:
                defaultPerm?.description || this.formatPermissionName(permName),
              category:
                defaultPerm?.category ||
                this.getCategoryFromPermission(permName),
            };
          }
        );
        return { permissions: transformedPermissions };
      }

      // If backend returns objects, use them directly
      return { permissions: backendPermissions };
    } catch (error: any) {
      // If endpoint doesn't exist, return default permissions
      if (error.response?.status === 404 || error.response?.status === 401) {
        console.warn("Permissions endpoint not available, using defaults");
        return {
          permissions: this.getDefaultPermissions(),
        };
      }
      throw error;
    }
  }

  /**
   * Format permission name for display
   */
  private formatPermissionName(permName: string): string {
    return permName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Get category from permission name
   */
  private getCategoryFromPermission(permName: string): string {
    if (permName.includes("user")) return "User";
    if (permName.includes("vendor")) return "User";
    if (permName.includes("content")) return "Content";
    if (permName.includes("financial") || permName.includes("payment"))
      return "Financial";
    if (permName.includes("analytics") || permName.includes("report"))
      return "Analytics";
    if (permName.includes("security") || permName.includes("audit"))
      return "System";
    if (permName.includes("system") || permName.includes("configuration"))
      return "System";
    return "System";
  }

  /**
   * Get default permissions if backend doesn't provide them
   */
  private getDefaultPermissions(): Permission[] {
    return [
      // User Management
      {
        _id: "1",
        name: "user_management",
        description: "Manage users",
        category: "User Management",
      },
      {
        _id: "2",
        name: "vendor_management",
        description: "Manage vendors",
        category: "User Management",
      },
      {
        _id: "3",
        name: "planner_management",
        description: "Manage event planners",
        category: "User Management",
      },

      // Content
      {
        _id: "4",
        name: "content_management",
        description: "Manage content",
        category: "Content Management",
      },
      {
        _id: "5",
        name: "moderation",
        description: "Moderate content",
        category: "Content Management",
      },

      // Financial
      {
        _id: "6",
        name: "financial_oversight",
        description: "View financial data",
        category: "Financial",
      },
      {
        _id: "7",
        name: "subscription_management",
        description: "Manage subscriptions",
        category: "Financial",
      },

      // Support
      {
        _id: "8",
        name: "support_tickets",
        description: "Handle support tickets",
        category: "Support",
      },

      // Analytics
      {
        _id: "9",
        name: "analytics",
        description: "View analytics",
        category: "Analytics",
      },

      // System
      {
        _id: "10",
        name: "system_configuration",
        description: "Configure system settings",
        category: "System",
      },
      {
        _id: "11",
        name: "audit_logs",
        description: "View audit logs",
        category: "System",
      },
      {
        _id: "12",
        name: "security_compliance",
        description: "Manage security",
        category: "System",
      },
      {
        _id: "13",
        name: "communication_management",
        description: "Manage communications",
        category: "Communication",
      },
    ];
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(
    userId: string,
    roleId: string
  ): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${roleId}/assign`, {
      userId,
      resourceType: "role-assignment",
    });
    return {
      message: response.data.message || "Role assigned successfully",
    };
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string
  ): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${roleId}/remove`, {
      userId,
      resourceType: "role-assignment",
    });
    return {
      message: response.data.message || "Role removed successfully",
    };
  }
}

export default new RolesService();
