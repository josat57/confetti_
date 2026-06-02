import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
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

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "reminder" | "promotion";
  category:
    | "system"
    | "account"
    | "event"
    | "payment"
    | "subscription"
    | "security"
    | "marketing";
  priority: "low" | "medium" | "high" | "urgent";
  recipients: {
    type: "all" | "specific" | "role" | "segment";
    userIds?: string[];
    roles?: string[];
    segment?: string;
  };
  channels: ("in-app" | "email" | "sms" | "push")[];
  status: "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";
  scheduledFor?: string | Date;
  sentAt?: string | Date;
  deliveryStats?: {
    total: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
  };
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string | Date;
  metadata?: Record<string, any>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "reminder" | "promotion";
  category:
    | "system"
    | "account"
    | "event"
    | "payment"
    | "subscription"
    | "security"
    | "marketing";
  priority: "low" | "medium" | "high" | "urgent";
  recipients: {
    type: "all" | "specific" | "role" | "segment";
    userIds?: string[];
    roles?: string[];
    segment?: string;
  };
  channels: ("in-app" | "email" | "sms" | "push")[];
  status: "draft" | "scheduled" | "sent";
  scheduledFor?: string;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  _id: string;
  name: string;
  description: string;
  title: string;
  message: string;
  type: string;
  category: string;
  variables: string[];
  createdAt: string | Date;
}

export interface NotificationStats {
  total: number;
  sent: number;
  scheduled: number;
  draft: number;
  failed: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

class NotificationsService {
  private baseUrl = "/admin/notifications";

  /**
   * Get all notifications
   */
  async getNotifications(params?: {
    status?: string;
    type?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await api.get(this.baseUrl, { params });
      return {
        notifications:
          response.data.data?.notifications ||
          response.data.notifications ||
          [],
        total: response.data.data?.total || response.data.total || 0,
        page: response.data.data?.page || response.data.page || 1,
        totalPages:
          response.data.data?.totalPages || response.data.totalPages || 1,
      };
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return { notifications: [], total: 0, page: 1, totalPages: 1 };
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(
    id: string
  ): Promise<{ notification: Notification }> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return {
      notification:
        response.data.data?.notification || response.data.notification,
    };
  }

  /**
   * Create and send notification
   */
  async createNotification(data: CreateNotificationRequest): Promise<{
    notification: Notification;
    message: string;
  }> {
    // Backend uses /send endpoint for creating notifications
    const response = await api.post(`${this.baseUrl}/send`, data);
    return {
      notification:
        response.data.data?.notification || response.data.notification,
      message: response.data.message || "Notification sent successfully",
    };
  }

  /**
   * Update notification
   */
  async updateNotification(
    id: string,
    data: Partial<CreateNotificationRequest>
  ): Promise<{
    notification: Notification;
    message: string;
  }> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return {
      notification:
        response.data.data?.notification || response.data.notification,
      message: response.data.message || "Notification updated successfully",
    };
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return {
      message: response.data.message || "Notification deleted successfully",
    };
  }

  /**
   * Send notification immediately
   */
  async sendNotification(id: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${id}/send`);
    return {
      message: response.data.message || "Notification sent successfully",
    };
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(id: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${id}/cancel`);
    return {
      message: response.data.message || "Notification cancelled successfully",
    };
  }

  /**
   * Resend failed notification
   */
  async resendNotification(id: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${id}/resend`);
    return {
      message: response.data.message || "Notification resent successfully",
    };
  }

  /**
   * Get notification statistics
   */
  async getStatistics(): Promise<{ stats: NotificationStats }> {
    try {
      const response = await api.get(`${this.baseUrl}/statistics`);
      return {
        stats: response.data.data?.stats ||
          response.data.stats || {
            total: 0,
            sent: 0,
            scheduled: 0,
            draft: 0,
            failed: 0,
            totalDelivered: 0,
            totalOpened: 0,
            totalClicked: 0,
            deliveryRate: 0,
            openRate: 0,
            clickRate: 0,
          },
      };
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      return {
        stats: {
          total: 0,
          sent: 0,
          scheduled: 0,
          draft: 0,
          failed: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
        },
      };
    }
  }

  /**
   * Get notification templates
   */
  async getTemplates(): Promise<{ templates: NotificationTemplate[] }> {
    try {
      const response = await api.get(`${this.baseUrl}/templates`);
      return {
        templates:
          response.data.data?.templates || response.data.templates || [],
      };
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      return { templates: [] };
    }
  }

  /**
   * Create notification from template
   */
  async createFromTemplate(
    templateId: string,
    variables: Record<string, string>
  ): Promise<{
    notification: Notification;
    message: string;
  }> {
    const response = await api.post(
      `${this.baseUrl}/templates/${templateId}/create`,
      {
        variables,
      }
    );
    return {
      notification:
        response.data.data?.notification || response.data.notification,
      message: response.data.message || "Notification created from template",
    };
  }

  /**
   * Test notification (send to admin only)
   */
  async testNotification(
    data: CreateNotificationRequest
  ): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/test`, data);
    return {
      message: response.data.message || "Test notification sent",
    };
  }

  /**
   * Get delivery report
   */
  async getDeliveryReport(id: string): Promise<{
    report: {
      total: number;
      delivered: number;
      failed: number;
      opened: number;
      clicked: number;
      deliveryDetails: Array<{
        userId: string;
        userName: string;
        channel: string;
        status: string;
        deliveredAt?: Date;
        openedAt?: Date;
        clickedAt?: Date;
        error?: string;
      }>;
    };
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/report`);
      return {
        report: response.data.data?.report ||
          response.data.report || {
            total: 0,
            delivered: 0,
            failed: 0,
            opened: 0,
            clicked: 0,
            deliveryDetails: [],
          },
      };
    } catch (error) {
      console.error("Failed to fetch delivery report:", error);
      return {
        report: {
          total: 0,
          delivered: 0,
          failed: 0,
          opened: 0,
          clicked: 0,
          deliveryDetails: [],
        },
      };
    }
  }

  /**
   * Get user segments for targeting
   */
  async getUserSegments(): Promise<{
    segments: Array<{ id: string; name: string; count: number }>;
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/segments`);
      return {
        segments: response.data.data?.segments || response.data.segments || [],
      };
    } catch (error) {
      console.error("Failed to fetch segments:", error);
      return { segments: [] };
    }
  }
}

export default new NotificationsService();
