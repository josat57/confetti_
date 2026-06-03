import axios from "axios";
import {
  AdminUserView,
  UserActivityRecord,
  UserFilters,
} from "@/types/user-admin";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface UserListResponse {
  users: AdminUserView[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserActivityResponse {
  activities: UserActivityRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class UsersService {
  private baseUrl = "/admin/users";

  // User List and Details
  async getUsers(
    filters?: UserFilters & { page?: number; limit?: number }
  ): Promise<UserListResponse> {
    const response = await api.get(this.baseUrl, { params: filters });
    return response.data;
  }

  async getUserById(userId: string): Promise<{ user: AdminUserView }> {
    const response = await api.get(`${this.baseUrl}/${userId}`);
    return response.data;
  }

  async getUserActivity(
    userId: string,
    filters?: { page?: number; limit?: number }
  ): Promise<UserActivityResponse> {
    const response = await api.get(`${this.baseUrl}/${userId}/activity`, {
      params: filters,
    });
    return response.data;
  }

  async exportUsers(filters?: UserFilters): Promise<{ downloadUrl: string }> {
    const response = await api.get(`${this.baseUrl}/export`, {
      params: filters,
    });
    return response.data;
  }

  // User Management
  async updateUser(
    userId: string,
    data: Partial<AdminUserView>
  ): Promise<{ user: AdminUserView; message: string }> {
    const response = await api.put(`${this.baseUrl}/${userId}`, data);
    return response.data;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${userId}`);
    return response.data;
  }

  async updateUserStatus(
    userId: string,
    status: "active" | "suspended" | "deleted"
  ): Promise<{ user: AdminUserView; message: string }> {
    const response = await api.put(`${this.baseUrl}/${userId}/status`, {
      status,
    });
    return response.data;
  }

  async updateUserRole(
    userId: string,
    role: "vendor" | "event-planner" | "guest"
  ): Promise<{ user: AdminUserView; message: string }> {
    const response = await api.put(`${this.baseUrl}/${userId}/role`, { role });
    return response.data;
  }

  // Convenience methods
  async suspendUser(userId: string): Promise<{ message: string }> {
    const response = await this.updateUserStatus(userId, "suspended");
    return { message: response.message };
  }

  async activateUser(userId: string): Promise<{ message: string }> {
    const response = await this.updateUserStatus(userId, "active");
    return { message: response.message };
  }
}

export default new UsersService();
