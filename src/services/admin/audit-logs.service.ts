import axios from "axios";
import {
  AuditLog,
  ComplianceReport,
  DataRetentionPolicy,
  ComplianceMetrics,
  AuditLogFilters,
  ComplianceReportFilters,
  DataRetentionFilters,
  AuditLogListResponse,
  ComplianceReportListResponse,
  DataRetentionListResponse,
  CreateComplianceReportRequest,
  CreateDataRetentionPolicyRequest,
  GDPRRequest,
  SecurityEvent,
} from "@/types/audit-logs";

// Backend audit log structure (different from frontend interface)
export interface BackendAuditLog {
  _id: string;
  action: string;
  admin?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  details?: {
    [key: string]: any;
  };
  resourceType?: string;
  resourceId?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies for admin authentication
});

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "Audit API Error:",
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
);

class AuditLogsService {
  private baseUrl = "/admin";

  // Audit Logs
  async getAuditLogs(filters?: AuditLogFilters): Promise<{
    logs: BackendAuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await api.get(`${this.baseUrl}/audit-logs`, {
      params: filters,
    });

    // Handle the actual backend response structure: { status: "success", data: { logs: [...] } }
    if (response.data?.status === "success" && response.data?.data?.logs) {
      const logs = response.data.data.logs;
      const limit = filters?.limit || 10;
      const page = filters?.page || 1;

      return {
        logs: logs,
        total: logs.length, // Backend doesn't provide total count, use logs length
        page: page,
        limit: limit,
        totalPages: Math.ceil(logs.length / limit),
      };
    }

    // Fallback for different response structure
    return {
      logs: response.data?.logs || [],
      total: response.data?.total || 0,
      page: response.data?.page || filters?.page || 1,
      limit: response.data?.limit || filters?.limit || 10,
      totalPages: response.data?.totalPages || 1,
    };
  }

  async getAuditLogById(logId: string): Promise<{ log: AuditLog }> {
    const response = await api.get(`${this.baseUrl}/audit-logs/${logId}`);
    return response.data;
  }

  async getAuditLogStatistics(
    filters?: AuditLogFilters
  ): Promise<{ statistics: any }> {
    const response = await api.get(`${this.baseUrl}/audit-logs/statistics`, {
      params: filters,
    });
    // Handle the actual backend response structure
    if (response.data?.data?.statistics) {
      return { statistics: response.data.data.statistics };
    }
    return response.data;
  }

  async exportAuditLogs(
    filters?: AuditLogFilters,
    format: "csv" | "json" | "pdf" = "csv"
  ): Promise<{ downloadUrl: string }> {
    const response = await api.get(`${this.baseUrl}/audit-logs/export`, {
      params: { ...filters, format },
    });
    return response.data;
  }

  async archiveAuditLogs(
    filters: AuditLogFilters
  ): Promise<{ message: string; archivedCount: number }> {
    const response = await api.post(
      `${this.baseUrl}/audit-logs/archive`,
      filters
    );
    return response.data;
  }

  async deleteAuditLogs(
    filters: AuditLogFilters
  ): Promise<{ message: string; deletedCount: number }> {
    const response = await api.delete(`${this.baseUrl}/audit-logs`, {
      data: filters,
    });
    return response.data;
  }

  // Compliance Reports
  async getComplianceReports(
    filters?: ComplianceReportFilters
  ): Promise<ComplianceReportListResponse> {
    const response = await api.get(`${this.baseUrl}/compliance/reports`, {
      params: filters,
    });
    return response.data;
  }

  async getComplianceReportById(
    reportId: string
  ): Promise<{ report: ComplianceReport }> {
    const response = await api.get(
      `${this.baseUrl}/compliance/reports/${reportId}`
    );
    return response.data;
  }

  async generateComplianceReport(
    data: CreateComplianceReportRequest
  ): Promise<{ report: ComplianceReport; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/compliance/reports/generate`,
      data
    );
    return response.data;
  }

  async createComplianceReport(
    data: CreateComplianceReportRequest
  ): Promise<{ report: ComplianceReport; message: string }> {
    // Alias for generateComplianceReport for backward compatibility
    return this.generateComplianceReport(data);
  }

  async deleteComplianceReport(reportId: string): Promise<{ message: string }> {
    const response = await api.delete(
      `${this.baseUrl}/compliance/reports/${reportId}`
    );
    return response.data;
  }

  async downloadComplianceReport(
    reportId: string
  ): Promise<{ downloadUrl: string }> {
    const response = await api.get(
      `${this.baseUrl}/compliance/reports/${reportId}/download`
    );
    return response.data;
  }

  // Data Retention Policies
  async getDataRetentionPolicies(
    filters?: DataRetentionFilters
  ): Promise<DataRetentionListResponse> {
    const response = await api.get(`${this.baseUrl}/data-retention/policies`, {
      params: filters,
    });
    return response.data;
  }

  async getDataRetentionPolicyById(
    policyId: string
  ): Promise<{ policy: DataRetentionPolicy }> {
    const response = await api.get(
      `${this.baseUrl}/data-retention/policies/${policyId}`
    );
    return response.data;
  }

  async createDataRetentionPolicy(
    data: CreateDataRetentionPolicyRequest
  ): Promise<{ policy: DataRetentionPolicy; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/data-retention/policies`,
      data
    );
    return response.data;
  }

  async updateDataRetentionPolicy(
    policyId: string,
    data: Partial<CreateDataRetentionPolicyRequest>
  ): Promise<{ policy: DataRetentionPolicy; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/data-retention/policies/${policyId}`,
      data
    );
    return response.data;
  }

  async deleteDataRetentionPolicy(
    policyId: string
  ): Promise<{ message: string }> {
    const response = await api.delete(
      `${this.baseUrl}/data-retention/policies/${policyId}`
    );
    return response.data;
  }

  async applyDataRetentionPolicy(
    policyId: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/data-retention/policies/${policyId}/apply`
    );
    return response.data;
  }

  async activateDataRetentionPolicy(
    policyId: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/data-retention/policies/${policyId}/activate`
    );
    return response.data;
  }

  async deactivateDataRetentionPolicy(
    policyId: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/data-retention/policies/${policyId}/deactivate`
    );
    return response.data;
  }

  // GDPR Requests
  async getGDPRRequests(): Promise<{ requests: GDPRRequest[] }> {
    const response = await api.get(`${this.baseUrl}/gdpr/requests`);
    return response.data;
  }

  async getGDPRRequestById(
    requestId: string
  ): Promise<{ request: GDPRRequest }> {
    const response = await api.get(
      `${this.baseUrl}/gdpr/requests/${requestId}`
    );
    return response.data;
  }

  async assignGDPRRequest(
    requestId: string,
    adminId: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/gdpr/requests/${requestId}/assign`,
      { adminId }
    );
    return response.data;
  }

  async verifyGDPRRequest(requestId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/gdpr/requests/${requestId}/verify`
    );
    return response.data;
  }

  async processGDPRRequest(requestId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/gdpr/requests/${requestId}/process`
    );
    return response.data;
  }

  async rejectGDPRRequest(
    requestId: string,
    reason: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/gdpr/requests/${requestId}/reject`,
      { reason }
    );
    return response.data;
  }

  async addGDPRRequestNote(
    requestId: string,
    note: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/gdpr/requests/${requestId}/notes`,
      { note }
    );
    return response.data;
  }

  async getGDPRStatistics(): Promise<{ statistics: any }> {
    const response = await api.get(`${this.baseUrl}/gdpr/statistics`);
    return response.data;
  }

  // Security Events
  async getSecurityEvents(): Promise<{ events: SecurityEvent[] }> {
    const response = await api.get(`${this.baseUrl}/security`);
    return response.data;
  }

  async resolveSecurityEvent(
    eventId: string,
    actions: string[]
  ): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/security/${eventId}/resolve`,
      {
        actions,
      }
    );
    return response.data;
  }

  // Compliance Metrics
  async getComplianceMetrics(): Promise<{ metrics: ComplianceMetrics }> {
    const response = await api.get(`${this.baseUrl}/metrics`);
    return response.data;
  }

  // Search and Analytics
  async searchAuditLogs(
    query: string,
    filters?: AuditLogFilters
  ): Promise<AuditLogListResponse> {
    const response = await api.post(`${this.baseUrl}/logs/search`, {
      query,
      filters,
    });
    return response.data;
  }

  async getAuditLogStats(dateRange: {
    startDate: Date;
    endDate: Date;
  }): Promise<{ stats: any }> {
    const response = await api.post(`${this.baseUrl}/logs/stats`, dateRange);
    return response.data;
  }

  // Tamper Detection
  async verifyLogIntegrity(
    logId: string
  ): Promise<{ valid: boolean; hash: string; message: string }> {
    const response = await api.get(`${this.baseUrl}/logs/${logId}/verify`);
    return response.data;
  }

  async generateIntegrityReport(dateRange: {
    startDate: Date;
    endDate: Date;
  }): Promise<{ report: any; downloadUrl: string }> {
    const response = await api.post(`${this.baseUrl}/integrity`, dateRange);
    return response.data;
  }
}

export default new AuditLogsService();
