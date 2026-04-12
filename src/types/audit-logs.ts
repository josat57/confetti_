// Audit Logs & Compliance Types

export interface AuditLog {
  _id: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  userEmail?: string;
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  resourceName?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint?: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
  category:
    | "authentication"
    | "authorization"
    | "data_access"
    | "data_modification"
    | "system"
    | "security"
    | "compliance";
  status: "success" | "failure" | "warning";
  sessionId?: string;
  requestId?: string;
  responseCode?: number;
  processingTime?: number;
  dataClassification?: "public" | "internal" | "confidential" | "restricted";
  complianceFlags?: string[];
  retentionDate?: Date;
  archived: boolean;
}

export interface ComplianceReport {
  _id: string;
  title: string;
  type: "gdpr" | "data_retention" | "access_log" | "security_audit" | "custom";
  description?: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  filters?: AuditLogFilters;
  generatedBy: string;
  generatedAt: Date;
  status: "generating" | "completed" | "failed";
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  expiresAt?: Date;
}

export interface DataRetentionPolicy {
  _id: string;
  name: string;
  description?: string;
  category: string;
  retentionPeriod: number;
  autoDelete: boolean;
  archiveBeforeDelete: boolean;
  legalHold: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

export interface ComplianceMetrics {
  totalLogs: number;
  logsToday: number;
  criticalEvents: number;
  failedLogins: number;
  dataAccess: number;
  dataModifications: number;
  retentionCompliance: {
    totalRecords: number;
    expiredRecords: number;
    archivedRecords: number;
    complianceRate: number;
  };
  gdprRequests: {
    accessRequests: number;
    deletionRequests: number;
    portabilityRequests: number;
    pendingRequests: number;
  };
}

export interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  adminId?: string;
  action?: string;
  resource?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  severity?: "low" | "medium" | "high" | "critical";
  category?:
    | "authentication"
    | "authorization"
    | "data_access"
    | "data_modification"
    | "system"
    | "security"
    | "compliance";
  status?: "success" | "failure" | "warning";
  ipAddress?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ComplianceReportFilters {
  type?: "gdpr" | "data_retention" | "access_log" | "security_audit" | "custom";
  status?: "generating" | "completed" | "failed";
  generatedBy?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface DataRetentionFilters {
  category?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ComplianceReportListResponse {
  reports: ComplianceReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DataRetentionListResponse {
  policies: DataRetentionPolicy[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateComplianceReportRequest {
  title: string;
  type: "gdpr" | "data_retention" | "access_log" | "security_audit" | "custom";
  description?: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  filters?: AuditLogFilters;
}

export interface CreateDataRetentionPolicyRequest {
  name: string;
  description?: string;
  category: string;
  retentionPeriod: number;
  autoDelete?: boolean;
  archiveBeforeDelete?: boolean;
  legalHold?: boolean;
}

export interface GDPRRequest {
  _id: string;
  type: "access" | "deletion" | "portability" | "rectification";
  userId: string;
  userEmail: string;
  requestedBy: string;
  requestDate: Date;
  status: "pending" | "processing" | "completed" | "rejected";
  completedDate?: Date;
  completedBy?: string;
  reason?: string;
  dataExported?: boolean;
  exportUrl?: string;
  notes?: string;
}

export interface SecurityEvent {
  _id: string;
  type:
    | "suspicious_login"
    | "multiple_failures"
    | "privilege_escalation"
    | "data_breach"
    | "unauthorized_access";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  userId?: string;
  adminId?: string;
  ipAddress: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  actions: string[];
  metadata?: Record<string, any>;
}
