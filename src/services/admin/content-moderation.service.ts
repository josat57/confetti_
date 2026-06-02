import axios from "axios";
import {
  FlaggedContent,
  ModerationHistory,
  ModerationStats,
  ContentReviewDetails,
  ContentType,
  ModerationAction,
} from "@/types/content-moderation";

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
      // Authentication failed - redirect to admin login
      console.error("Authentication failed:", error.response?.data?.message);
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

class ContentModerationService {
  private baseUrl = "/admin/moderation";

  /**
   * Get all flagged content
   */
  async getFlaggedContent(params?: {
    status?: string;
    contentType?: ContentType;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    flaggedContent: FlaggedContent[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await api.get(`${this.baseUrl}/flagged`, { params });
    // Handle the actual backend response structure
    if (response.data?.data) {
      return {
        flaggedContent: response.data.data.flaggedContent || [],
        total: response.data.data.pagination?.total || 0,
        page: response.data.data.pagination?.page || 1,
        pages: response.data.data.pagination?.pages || 0,
      };
    }
    return response.data;
  }

  /**
   * Get detailed review information for flagged content
   */
  async getContentReviewDetails(
    flaggedContentId: string
  ): Promise<{ review: ContentReviewDetails }> {
    const response = await api.get(
      `${this.baseUrl}/flagged/${flaggedContentId}`
    );
    // Handle the actual backend response structure
    if (response.data?.data?.review) {
      return { review: response.data.data.review };
    }
    return response.data;
  }

  /**
   * Get moderation statistics
   */
  async getModerationStatistics(): Promise<{ statistics: ModerationStats }> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    // Handle the actual backend response structure
    if (response.data?.data?.statistics) {
      return { statistics: response.data.data.statistics };
    }
    return response.data;
  }

  /**
   * Export flagged content
   */
  async exportFlaggedContent(params?: {
    status?: string;
    contentType?: ContentType;
  }): Promise<{ downloadUrl: string }> {
    const response = await api.get(`${this.baseUrl}/flagged/export`, {
      params,
    });
    return response.data;
  }

  /**
   * Approve flagged content (clear the flag)
   */
  async approveContent(
    flaggedContentId: string,
    reason?: string
  ): Promise<{ content: FlaggedContent; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/flagged/${flaggedContentId}/approve`,
      { reason }
    );
    return response.data;
  }

  /**
   * Remove flagged content
   */
  async removeContent(
    flaggedContentId: string,
    reason: string
  ): Promise<{ content: FlaggedContent; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/flagged/${flaggedContentId}/remove`,
      { reason }
    );
    return response.data;
  }

  /**
   * Ban user for content violations
   */
  async banUser(
    flaggedContentId: string,
    userId: string,
    reason: string,
    permanent: boolean = true
  ): Promise<{ content: FlaggedContent; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/flagged/${flaggedContentId}/ban-user`,
      {
        userId,
        reason,
        permanent,
      }
    );
    return response.data;
  }

  /**
   * Send warning to user
   */
  async warnUser(
    flaggedContentId: string,
    userId: string,
    warning: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/flagged/${flaggedContentId}/warn`,
      {
        userId,
        warning,
      }
    );
    return response.data;
  }

  /**
   * Assign moderator to flagged content
   */
  async assignModerator(
    flaggedContentId: string,
    moderatorId: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/flagged/${flaggedContentId}/assign`,
      {
        moderatorId,
      }
    );
    return response.data;
  }

  /**
   * Update priority of flagged content
   */
  async updatePriority(
    flaggedContentId: string,
    priority: "low" | "medium" | "high" | "critical"
  ): Promise<{ message: string }> {
    const response = await api.put(
      `${this.baseUrl}/flagged/${flaggedContentId}/priority`,
      {
        priority,
      }
    );
    return response.data;
  }

  /**
   * Escalate content for further review (legacy method)
   */
  async escalateContent(
    contentId: string,
    reason: string
  ): Promise<{ content: FlaggedContent; message: string }> {
    // Update priority to critical as escalation
    await this.updatePriority(contentId, "critical");
    return {
      content: {} as FlaggedContent,
      message: "Content escalated successfully",
    };
  }

  /**
   * Get moderation history for specific user
   */
  async getModerationHistory(
    userId: string
  ): Promise<{ history: ModerationHistory[] }> {
    const response = await api.get(`${this.baseUrl}/history/${userId}`);
    return response.data;
  }

  /**
   * Get all moderation history with filtering
   */
  async getAllModerationHistory(params?: {
    contentType?: ContentType;
    action?: ModerationAction;
    performedBy?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    history: ModerationHistory[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await api.get(`${this.baseUrl}/history`, { params });
    return response.data;
  }

  /**
   * Get moderation statistics (alias for backward compatibility)
   */
  async getModerationStats(): Promise<{ stats: ModerationStats }> {
    const result = await this.getModerationStatistics();
    return { stats: result.statistics };
  }

  /**
   * Bulk moderation action
   */
  async bulkAction(
    action: "approve" | "remove" | "dismiss",
    contentIds: string[],
    reason?: string
  ): Promise<{ processed: number; message: string }> {
    const response = await api.post(`${this.baseUrl}/bulk-action`, {
      action,
      contentIds,
      reason,
    });
    return response.data;
  }

  /**
   * Bulk approve multiple flagged content items
   */
  async bulkApprove(
    contentIds: string[],
    reason?: string
  ): Promise<{ approved: number; message: string }> {
    const result = await this.bulkAction("approve", contentIds, reason);
    return { approved: result.processed, message: result.message };
  }

  /**
   * Bulk remove multiple flagged content items
   */
  async bulkRemove(
    contentIds: string[],
    reason: string
  ): Promise<{ removed: number; message: string }> {
    const result = await this.bulkAction("remove", contentIds, reason);
    return { removed: result.processed, message: result.message };
  }

  /**
   * Bulk dismiss multiple flagged content items
   */
  async bulkDismiss(
    contentIds: string[],
    reason?: string
  ): Promise<{ dismissed: number; message: string }> {
    const result = await this.bulkAction("dismiss", contentIds, reason);
    return { dismissed: result.processed, message: result.message };
  }
}

export default new ContentModerationService();
