// Admin Management Types

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  name?: string; // Computed field for display
  email: string;
  role: "super_admin" | "admin" | "moderator";
  permissions: string[]; // Backend returns array of strings
  twoFactorEnabled: boolean;
  isActive: boolean;
  active?: boolean; // Computed field for compatibility
  lastLogin?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
}

export interface Permission {
  resource: string; // 'users', 'vendors', 'content', 'billing', etc.
  actions: ("read" | "create" | "update" | "delete")[];
}

export interface AdminRole {
  name: string;
  value: "super_admin" | "admin" | "moderator";
  description: string;
  permissions: Permission[];
}

export interface AdminActivityLog {
  _id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface AdminSession {
  _id: string;
  adminId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  location?: string;
  active: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: "super_admin" | "admin" | "moderator";
  permissions?: string[];
  sendInvitation?: boolean;
}

export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "super_admin" | "admin" | "moderator";
  permissions?: string[];
  isActive?: boolean;
  twoFactorEnabled?: boolean;
}

export interface AdminListFilters {
  role?: "super_admin" | "admin" | "moderator";
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminActivityFilters {
  adminId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AdminSessionFilters {
  adminId?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminListResponse {
  admins: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminActivityResponse {
  activities: AdminActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminSessionResponse {
  sessions: AdminSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  superAdmins: number;
  admins: number;
  moderators: number;
  recentActivity: number;
  activeSessions: number;
}
