import axios from "axios";

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
      // Don't auto-redirect - let the component handle it
    }
    return Promise.reject(error);
  }
);

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error" | "maintenance";
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "all" | "planners" | "vendors" | "admins";
  status: "draft" | "published" | "scheduled" | "archived";
  publishedAt?: string | Date;
  scheduledFor?: string | Date;
  expiresAt?: string | Date;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
  views?: number;
  isSticky?: boolean;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error" | "maintenance";
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "all" | "planners" | "vendors" | "admins";
  status: "draft" | "published" | "scheduled";
  scheduledFor?: string;
  expiresAt?: string;
  isSticky?: boolean;
}

class AnnouncementsService {
  private baseUrl = "/admin/announcements";

  /**
   * Get all announcements
   */
  async getAnnouncements(params?: {
    status?: string;
    type?: string;
    targetAudience?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    announcements: Announcement[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await api.get(this.baseUrl, { params });
      return {
        announcements:
          response.data.data?.announcements ||
          response.data.announcements ||
          [],
        total: response.data.data?.total || response.data.total || 0,
        page: response.data.data?.page || response.data.page || 1,
        totalPages:
          response.data.data?.totalPages || response.data.totalPages || 1,
      };
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      return { announcements: [], total: 0, page: 1, totalPages: 1 };
    }
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(
    id: string
  ): Promise<{ announcement: Announcement }> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return {
      announcement:
        response.data.data?.announcement || response.data.announcement,
    };
  }

  /**
   * Create announcement
   */
  async createAnnouncement(data: CreateAnnouncementRequest): Promise<{
    announcement: Announcement;
    message: string;
  }> {
    const response = await api.post(this.baseUrl, data);
    return {
      announcement:
        response.data.data?.announcement || response.data.announcement,
      message: response.data.message || "Announcement created successfully",
    };
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(
    id: string,
    data: Partial<CreateAnnouncementRequest>
  ): Promise<{
    announcement: Announcement;
    message: string;
  }> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return {
      announcement:
        response.data.data?.announcement || response.data.announcement,
      message: response.data.message || "Announcement updated successfully",
    };
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return {
      message: response.data.message || "Announcement deleted successfully",
    };
  }

  /**
   * Publish announcement
   */
  async publishAnnouncement(id: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${id}/publish`);
    return {
      message: response.data.message || "Announcement published successfully",
    };
  }

  /**
   * Archive announcement
   */
  async archiveAnnouncement(id: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${id}/archive`);
    return {
      message: response.data.message || "Announcement archived successfully",
    };
  }

  /**
   * Get announcement statistics
   */
  async getStatistics(): Promise<{
    stats: {
      total: number;
      published: number;
      draft: number;
      scheduled: number;
      archived: number;
      totalViews: number;
    };
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/statistics`);
      return {
        stats: response.data.data?.stats ||
          response.data.stats || {
            total: 0,
            published: 0,
            draft: 0,
            scheduled: 0,
            archived: 0,
            totalViews: 0,
          },
      };
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      return {
        stats: {
          total: 0,
          published: 0,
          draft: 0,
          scheduled: 0,
          archived: 0,
          totalViews: 0,
        },
      };
    }
  }
}

export default new AnnouncementsService();
