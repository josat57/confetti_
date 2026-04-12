// Notification Management Types

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "email" | "sms" | "in-app" | "all";
  status: "draft" | "scheduled" | "sent" | "cancelled" | "failed";
  targetAudience: TargetAudience;
  scheduledFor?: Date;
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  analytics?: NotificationAnalytics;
}

export interface TargetAudience {
  type: "all" | "role" | "tier" | "location" | "custom";
  roles?: ("event-planner" | "vendor" | "user")[];
  tiers?: ("free" | "basic" | "professional" | "enterprise")[];
  locations?: string[];
  userIds?: string[];
}

export interface NotificationAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface NotificationTemplate {
  _id: string;
  name: string;
  title: string;
  message: string;
  type: "email" | "sms" | "in-app";
  variables: string[];
  category: string;
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  priority: "low" | "medium" | "high";
  targetAudience: TargetAudience;
  startDate: Date;
  endDate: Date;
  active: boolean;
  dismissible: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: "email" | "sms" | "in-app" | "all";
  targetAudience: TargetAudience;
  scheduledFor?: Date;
  templateId?: string;
}

export interface CreateTemplateRequest {
  name: string;
  title: string;
  message: string;
  type: "email" | "sms" | "in-app";
  variables?: string[];
  category: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  priority: "low" | "medium" | "high";
  targetAudience: TargetAudience;
  startDate: Date;
  endDate: Date;
  dismissible?: boolean;
}

export interface NotificationFilters {
  status?: "draft" | "scheduled" | "sent" | "cancelled" | "failed";
  type?: "email" | "sms" | "in-app" | "all";
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TemplateFilters {
  type?: "email" | "sms" | "in-app";
  category?: string;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AnnouncementFilters {
  active?: boolean;
  type?: "info" | "warning" | "success" | "error";
  priority?: "low" | "medium" | "high";
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TemplateListResponse {
  templates: NotificationTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnnouncementListResponse {
  announcements: Announcement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationStats {
  totalSent: number;
  scheduled: number;
  drafts: number;
  failed: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalRecipients: number;
}

export interface TestNotificationRequest {
  notificationId?: string;
  title: string;
  message: string;
  type: "email" | "sms";
  recipientEmail?: string;
  recipientPhone?: string;
}
