// Support Ticket Types for Admin

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketCategory =
  | "technical"
  | "billing"
  | "account"
  | "feature_request"
  | "bug_report"
  | "general";

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  description: string;
  messages: TicketMessage[];
  tags: string[];
  attachments: TicketAttachment[];
  createdAt: Date;
  updatedAt: Date;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  resolution?: string;
  satisfactionRating?: number;
  satisfactionFeedback?: string;
}

export interface TicketMessage {
  _id: string;
  ticketId: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  message: string;
  isInternal: boolean;
  attachments: TicketAttachment[];
  createdAt: Date;
}

export interface TicketAttachment {
  _id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface CannedResponse {
  _id: string;
  title: string;
  content: string;
  category: TicketCategory;
  tags: string[];
  usageCount: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketAnalytics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  byPriority: {
    [key in TicketPriority]: number;
  };
  byCategory: {
    [key in TicketCategory]?: number;
  };
  byStatus: {
    [key in TicketStatus]: number;
  };
  averageResponseTime: number; // in hours
  averageResolutionTime: number; // in hours
  averageSatisfactionRating: number;
  totalSatisfactionRatings: number;
  responseTimeByPriority: {
    [key in TicketPriority]: number;
  };
  resolutionTimeByPriority: {
    [key in TicketPriority]: number;
  };
  ticketsByDay: {
    date: string;
    created: number;
    resolved: number;
  }[];
  topAdmins: {
    adminId: string;
    adminName: string;
    ticketsResolved: number;
    averageResolutionTime: number;
  }[];
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface TicketActivity {
  _id: string;
  ticketId: string;
  action: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  details?: any;
  createdAt: Date;
}
