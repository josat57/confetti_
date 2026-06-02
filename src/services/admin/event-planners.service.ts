import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies for admin authentication
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed:", error.response?.data?.message);
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface EventPlanner {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: string;
  status: string;
  phone?: string;
  profilePicture?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastLogin?: string | Date;
  subscription?: any;
}

class EventPlannersService {
  private baseUrl = "/admin/users";

  /**
   * Get all event planners
   */
  async getEventPlanners(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    users: EventPlanner[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append("role", "event-planner"); // Filter by event-planner role

    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${this.baseUrl}?${queryString}`;

    const response = await api.get(url);
    // Backend returns { status, data: { users, pagination } }
    return {
      users: response.data.data?.users || [],
      total: response.data.data?.pagination?.total || 0,
      page: response.data.data?.pagination?.page || 1,
      pages: response.data.data?.pagination?.pages || 1,
    };
  }

  /**
   * Get event planner by ID
   */
  async getEventPlannerById(userId: string): Promise<{ user: EventPlanner }> {
    const response = await api.get(`${this.baseUrl}/${userId}`);
    return {
      user: response.data.data?.user || response.data.user,
    };
  }

  /**
   * Update event planner status
   */
  async updateEventPlannerStatus(
    userId: string,
    status: string
  ): Promise<{
    user: EventPlanner;
    message: string;
  }> {
    const response = await api.put(`${this.baseUrl}/${userId}/status`, {
      status,
      resourceType: "user",
    });
    return {
      user: response.data.data?.user || response.data.user,
      message: response.data.message || "Status updated successfully",
    };
  }

  /**
   * Delete event planner
   */
  async deleteEventPlanner(userId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${userId}`, {
      data: { resourceType: "user" },
    });
    return {
      message: response.data.message || "Event planner deleted successfully",
    };
  }

  /**
   * Get event planner statistics
   */
  async getEventPlannerStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  }> {
    const response = await api.get(
      `${this.baseUrl}/statistics?role=event-planner`
    );
    const stats = response.data.data?.statistics || response.data.stats || {};

    return {
      total: stats.total || 0,
      active: stats.byStatus?.find((s: any) => s._id === "active")?.count || 0,
      inactive:
        stats.byStatus?.find((s: any) => s._id === "inactive")?.count || 0,
      suspended:
        stats.byStatus?.find((s: any) => s._id === "suspended")?.count || 0,
    };
  }
}

export default new EventPlannersService();
