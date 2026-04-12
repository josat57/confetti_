import axios from "axios";
import {
  AdminUser,
  AdminActivityLog,
  AdminSession,
  CreateAdminRequest,
  UpdateAdminRequest,
  AdminListFilters,
  AdminActivityFilters,
  AdminSessionFilters,
  AdminListResponse,
  AdminActivityResponse,
  AdminSessionResponse,
  AdminStats,
} from "@/types/admin-management";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Use cookies for authentication
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed:", error.response?.data?.message);
    }
    return Promise.reject(error);
  }
);

class AdminManagementService {
  private baseUrl = "/admin";

  // Authentication endpoints (login/logout handled separately)
  async refreshToken(): Promise<{ token: string; message: string }> {
    const response = await api.post(`${this.baseUrl}/refresh`);
    return response.data;
  }

  async verifyToken(): Promise<{ valid: boolean; admin: AdminUser }> {
    const response = await api.get(`${this.baseUrl}/verify`);
    return response.data;
  }

  // Admin CRUD Operations
  async getAdmins(filters?: AdminListFilters): Promise<AdminListResponse> {
    const response = await api.get(this.baseUrl, { params: filters });
    // Transform backend response to match frontend expectations
    const data = response.data.data || response.data;
    if (data.admins) {
      data.admins = data.admins.map((admin: any) => ({
        ...admin,
        name: `${admin.firstName} ${admin.lastName}`,
        active: admin.isActive,
      }));
    }
    return data;
  }

  async getAdminById(adminId: string): Promise<{ admin: AdminUser }> {
    const response = await api.get(`${this.baseUrl}/${adminId}`);
    const data = response.data.data || response.data;
    if (data.admin) {
      data.admin = {
        ...data.admin,
        name: `${data.admin.firstName} ${data.admin.lastName}`,
        active: data.admin.isActive,
      };
    }
    return data;
  }

  async createSuperAdmin(
    data: CreateAdminRequest
  ): Promise<{ admin: AdminUser; message: string }> {
    const response = await api.post(`${this.baseUrl}/super-admin`, data);
    return response.data;
  }

  async createAdmin(
    data: CreateAdminRequest
  ): Promise<{ admin: AdminUser; message: string }> {
    // For regular admin creation, use super-admin endpoint
    const response = await api.post(`${this.baseUrl}/super-admin`, data);
    return response.data;
  }

  async updateAdmin(
    adminId: string,
    data: UpdateAdminRequest
  ): Promise<{ admin: AdminUser; message: string }> {
    const response = await api.put(`${this.baseUrl}/${adminId}`, data);
    return response.data;
  }

  async deleteAdmin(adminId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${adminId}`);
    return response.data;
  }

  async updateAdminStatus(
    adminId: string,
    status: string
  ): Promise<{ admin: AdminUser; message: string }> {
    const response = await api.patch(`${this.baseUrl}/${adminId}/status`, {
      status,
    });
    return response.data;
  }

  // Legacy methods for backward compatibility
  async deactivateAdmin(adminId: string): Promise<{ message: string }> {
    const response = await this.updateAdminStatus(adminId, "inactive");
    return { message: response.message };
  }

  async activateAdmin(adminId: string): Promise<{ message: string }> {
    const response = await this.updateAdminStatus(adminId, "active");
    return { message: response.message };
  }

  // Password Management
  async resetPassword(adminId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/${adminId}/reset-password`
    );
    return response.data;
  }

  async sendInvitation(adminId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/${adminId}/send-invitation`
    );
    return response.data;
  }

  // Activity Logs
  async getActivityLogs(
    filters?: AdminActivityFilters
  ): Promise<AdminActivityResponse> {
    const response = await api.get(`${this.baseUrl}/activity-logs`, {
      params: filters,
    });
    return response.data;
  }

  async getAdminActivity(
    adminId: string,
    filters?: AdminActivityFilters
  ): Promise<AdminActivityResponse> {
    const response = await api.get(`${this.baseUrl}/${adminId}/activity`, {
      params: filters,
    });
    return response.data;
  }

  async exportActivityLogs(
    filters?: AdminActivityFilters
  ): Promise<{ downloadUrl: string }> {
    const response = await api.post(
      `${this.baseUrl}/activity-logs/export`,
      filters
    );
    return response.data;
  }

  // Session Management
  async getSessions(
    filters?: AdminSessionFilters
  ): Promise<AdminSessionResponse> {
    const response = await api.get(`${this.baseUrl}/sessions`, {
      params: filters,
    });
    return response.data;
  }

  async getAdminSessions(
    adminId: string,
    filters?: AdminSessionFilters
  ): Promise<AdminSessionResponse> {
    const response = await api.get(`${this.baseUrl}/${adminId}/sessions`, {
      params: filters,
    });
    return response.data;
  }

  async terminateSession(sessionId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/sessions/${sessionId}`);
    return response.data;
  }

  async terminateAllSessions(adminId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${adminId}/sessions`);
    return response.data;
  }

  // Statistics
  async getStats(): Promise<{ stats: AdminStats }> {
    try {
      // Try to get admin-specific stats from backend
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      // If admin stats endpoint doesn't exist, calculate from admin list
      const adminsResponse = await this.getAdmins();
      const admins = adminsResponse.admins || [];

      const stats: AdminStats = {
        totalAdmins: admins.length,
        activeAdmins: admins.filter((a) => a.isActive || a.active).length,
        superAdmins: admins.filter((a) => a.role === "super_admin").length,
        admins: admins.filter((a) => a.role === "admin").length,
        moderators: admins.filter((a) => a.role === "moderator").length,
        recentActivity: 0, // Not available without activity logs
        activeSessions: 0, // Not available without session data
      };

      return { stats };
    }
  }

  // Permissions
  async getAdminPermissions(adminId: string): Promise<{ permissions: any[] }> {
    const response = await api.get(`${this.baseUrl}/${adminId}/permissions`);
    return response.data;
  }

  async updatePermissions(
    adminId: string,
    permissions: any[]
  ): Promise<{ admin: AdminUser; message: string }> {
    const response = await api.put(`${this.baseUrl}/${adminId}/permissions`, {
      permissions,
    });
    return response.data;
  }

  async getAvailablePermissions(): Promise<{ permissions: any[] }> {
    const response = await api.get(`${this.baseUrl}/permissions/available`);
    return response.data;
  }

  // Two-Factor Authentication
  async setup2FA(adminId: string): Promise<{ qrCode: string; secret: string }> {
    const response = await api.post(`${this.baseUrl}/${adminId}/2fa/setup`);
    return response.data;
  }

  async verify2FA(
    adminId: string,
    code: string
  ): Promise<{ verified: boolean; message: string }> {
    const response = await api.post(`${this.baseUrl}/${adminId}/2fa/verify`, {
      code,
    });
    return response.data;
  }
}

export default new AdminManagementService();
