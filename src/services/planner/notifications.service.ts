import api from "@/api/api";

export type NotificationType =
  | "Task"
  | "Booking"
  | "Payment"
  | "Message"
  | "Event"
  | "System";

export type NotificationPriority = "Low" | "Medium" | "High";

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: {
    eventId?: string;
    taskId?: string;
    vendorId?: string;
    clientId?: string;
  };
  createdAt: Date;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
  };
  sms: {
    enabled: boolean;
    types: NotificationType[];
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  groupSimilar: boolean;
}

class NotificationsService {
  /**
   * Get all notifications
   */
  async getNotifications(
    unread?: boolean,
    type?: NotificationType,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    notifications: Notification[];
    unreadCount: number;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (unread !== undefined) {
      params.append("unread", String(unread));
    }
    if (type) {
      params.append("type", type);
    }

    const response = await api.get(`/api/v1/planner/notifications?${params}`);
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string
  ): Promise<{ notification: Notification }> {
    const response = await api.patch(
      `/api/v1/planner/notifications/${notificationId}/read`
    );
    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ updated: number }> {
    const response = await api.patch(
      "/api/v1/planner/notifications/mark-all-read"
    );
    return response.data;
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<{ preferences: NotificationPreferences }> {
    const response = await api.get("/api/v1/planner/notifications/preferences");
    return response.data;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<{ preferences: NotificationPreferences }> {
    const response = await api.put(
      "/api/v1/planner/notifications/preferences",
      preferences
    );
    return response.data;
  }

  /**
   * Delete notification
   */
  async deleteNotification(
    notificationId: string
  ): Promise<{ success: boolean }> {
    const response = await api.delete(
      `/api/v1/planner/notifications/${notificationId}`
    );
    return response.data;
  }
}

export const notificationsService = new NotificationsService();
