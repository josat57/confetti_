// Content Moderation Types for Admin

export type ContentType =
  | "vendor_profile"
  | "event_listing"
  | "user_review"
  | "comment"
  | "message"
  | "portfolio_item";

export type ModerationStatus = "pending" | "approved" | "removed" | "escalated";

export type ModerationAction = "approve" | "remove" | "ban_user" | "escalate";

export interface FlaggedContent {
  _id: string;
  contentType: ContentType;
  contentId: string;
  content: {
    title?: string;
    description?: string;
    text?: string;
    images?: string[];
    author: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    createdAt: Date;
  };
  reporter: {
    _id: string;
    name: string;
    email: string;
  };
  reason: string;
  category: string; // e.g., "inappropriate", "spam", "fake", "offensive"
  status: ModerationStatus;
  flaggedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  moderationAction?: ModerationAction;
  moderationReason?: string;
  priority: "low" | "medium" | "high" | "critical";
}

export interface ModerationHistory {
  _id: string;
  contentId: string;
  contentType: ContentType;
  action: ModerationAction;
  reason: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  performedAt: Date;
  details?: {
    previousStatus?: string;
    newStatus?: string;
    affectedUser?: {
      _id: string;
      name: string;
      email: string;
    };
  };
}

export interface ModerationStats {
  totalFlagged: number;
  pending: number;
  approved: number;
  removed: number;
  escalated: number;
  byContentType: {
    [key in ContentType]?: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  averageResponseTime: number; // in hours
  todayActions: number;
  weekActions: number;
}

export interface ContentReviewDetails {
  content: FlaggedContent;
  history: ModerationHistory[];
  relatedFlags?: FlaggedContent[]; // Other flags from same user/content
  userHistory?: {
    totalFlags: number;
    totalViolations: number;
    previousBans: number;
  };
}
