// Admin Dashboard Types

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "super-admin" | "admin" | "moderator";
  permissions: Permission[];
  twoFactorEnabled: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  resource: string;
  actions: ("read" | "create" | "update" | "delete")[];
}

export interface PlatformMetrics {
  totalUsers: number;
  totalVendors: number;
  totalPlanners: number;
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  pendingVerifications: number;
  openTickets: number;
  flaggedContent: number;
}

export interface Activity {
  id: string;
  type:
    | "user_registered"
    | "event_created"
    | "payment_received"
    | "vendor_verified";
  user: string;
  description: string;
  timestamp: Date;
}

export interface AuditLog {
  _id: string;
  adminId: string;
  adminName: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
