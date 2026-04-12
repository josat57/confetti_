// User Management Types for Admin

export interface AdminUserView {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "vendor" | "event-planner" | "guest";
  status: "active" | "suspended" | "deleted";
  subscriptionTier?: "starter" | "professional" | "business" | "enterprise";
  registrationDate: Date;
  lastLogin?: Date;
  eventsCreated?: number;
  bookingsMade?: number;
  totalSpent?: number;
}

export interface UserActivityRecord {
  _id: string;
  action: string;
  description: string;
  ipAddress?: string;
  timestamp: Date;
}

export interface UserFilters {
  role?: "vendor" | "event-planner" | "guest" | "";
  status?: "active" | "suspended" | "deleted" | "";
  tier?: "starter" | "professional" | "business" | "enterprise" | "";
  search?: string;
}
