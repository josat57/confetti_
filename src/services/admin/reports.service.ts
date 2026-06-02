import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
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
      "Reports API Error:",
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
);

export interface Report {
  _id: string;
  type?:
    | "user"
    | "content"
    | "event"
    | "vendor"
    | "abuse"
    | "spam"
    | "inappropriate";
  reportType?: "financial" | "compliance" | "generated" | "user_report";
  category: string;
  title: string;
  description: string;
  reporter?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  generatedBy?: string; // For system-generated reports
  reportedUser?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  reportedContent?: {
    _id: string;
    type: string;
    title?: string;
    description?: string;
  };
  status:
    | "open"
    | "investigating"
    | "resolved"
    | "dismissed"
    | "escalated"
    | "completed"
    | "pending"
    | "failed";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  evidence: {
    screenshots?: string[];
    urls?: string[];
    additionalInfo?: string;
  };
  resolution?: {
    action: string;
    reason: string;
    resolvedBy: {
      _id: string;
      name: string;
      email: string;
    };
    resolvedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportStats {
  totalReports: number;
  openReports?: number;
  investigatingReports?: number;
  resolvedReports?: number;
  dismissedReports?: number;
  escalatedReports?: number;
  byType: {
    user?: number;
    content?: number;
    event?: number;
    vendor?: number;
    abuse?: number;
    spam?: number;
    inappropriate?: number;
    compliance?: number;
    generated?: number;
    financial?: number;
  };
  byStatus: {
    completed?: number;
    pending?: number;
    failed?: number;
    open?: number;
    investigating?: number;
    resolved?: number;
    dismissed?: number;
    escalated?: number;
  };
  byPriority?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  averageResolutionTime?: number; // in hours
  todayReports?: number;
  weekReports?: number;
}

export interface ReportAction {
  _id: string;
  reportId: string;
  action: string;
  description: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  performedAt: Date;
}

class ReportsService {
  private baseUrl = "/admin/reports";

  /**
   * Get all reports with filtering and pagination
   */
  async getReports(params?: {
    type?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    reports: Report[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await api.get(this.baseUrl, { params });
    // Handle the actual backend response structure
    if (response.data?.data) {
      return {
        reports: response.data.data.reports || [],
        total: response.data.data.pagination?.total || 0,
        page: response.data.data.pagination?.page || 1,
        pages: response.data.data.pagination?.pages || 0,
      };
    }
    return response.data;
  }

  /**
   * Get report by ID
   */
  async getReportById(id: string): Promise<{ report: Report }> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    if (response.data?.data?.report) {
      return { report: response.data.data.report };
    }
    return response.data;
  }

  /**
   * Create new report
   */
  async createReport(data: {
    type: Report["type"];
    category: string;
    title: string;
    description: string;
    reportedUserId?: string;
    reportedContentId?: string;
    evidence?: Report["evidence"];
    priority?: Report["priority"];
  }): Promise<{ report: Report }> {
    const response = await api.post(this.baseUrl, data);
    if (response.data?.data?.report) {
      return { report: response.data.data.report };
    }
    return response.data;
  }

  /**
   * Update report status
   */
  async updateReportStatus(
    id: string,
    status: Report["status"],
    reason?: string
  ): Promise<{ report: Report }> {
    const response = await api.put(`${this.baseUrl}/${id}/status`, {
      status,
      reason,
    });
    if (response.data?.data?.report) {
      return { report: response.data.data.report };
    }
    return response.data;
  }

  /**
   * Assign report to moderator
   */
  async assignReport(
    id: string,
    moderatorId: string
  ): Promise<{ report: Report }> {
    const response = await api.put(`${this.baseUrl}/${id}/assign`, {
      moderatorId,
    });
    if (response.data?.data?.report) {
      return { report: response.data.data.report };
    }
    return response.data;
  }

  /**
   * Update report priority
   */
  async updateReportPriority(
    id: string,
    priority: Report["priority"]
  ): Promise<{ report: Report }> {
    const response = await api.put(`${this.baseUrl}/${id}/priority`, {
      priority,
    });
    if (response.data?.data?.report) {
      return { report: response.data.data.report };
    }
    return response.data;
  }

  /**
   * Resolve report
   */
  async resolveReport(
    id: string,
    action: string,
    reason: string
  ): Promise<{ report: Report }> {
    const response = await api.post(`${this.baseUrl}/${id}/resolve`, {
      action,
      reason,
    });
    if (response.data?.data?.report) {
      return { report: response.data.data.report };
    }
    return response.data;
  }

  /**
   * Dismiss report
   */
  async dismissReport(id: string, reason: string): Promise<{ report: Report }> {
    const response = await api.post(`${this.baseUrl}/${id}/dismiss`, {
      reason,
    });
    if (response.data?.data?.report) {
      return { report: response.data.data.report };
    }
    return response.data;
  }

  /**
   * Escalate report
   */
  async escalateReport(
    id: string,
    reason: string
  ): Promise<{ report: Report }> {
    const response = await api.post(`${this.baseUrl}/${id}/escalate`, {
      reason,
    });
    if (response.data?.data?.report) {
      return { report: response.data.data.report };
    }
    return response.data;
  }

  /**
   * Get report statistics
   */
  async getReportStats(): Promise<{ stats: ReportStats }> {
    const response = await api.get(`${this.baseUrl}/stats`);
    if (response.data?.data?.stats) {
      return { stats: response.data.data.stats };
    }
    return response.data;
  }

  /**
   * Get report actions/history
   */
  async getReportActions(
    reportId: string
  ): Promise<{ actions: ReportAction[] }> {
    const response = await api.get(`${this.baseUrl}/${reportId}/actions`);
    if (response.data?.data?.actions) {
      return { actions: response.data.data.actions };
    }
    return response.data;
  }

  /**
   * Add action to report
   */
  async addReportAction(
    reportId: string,
    action: string,
    description: string
  ): Promise<{ action: ReportAction }> {
    const response = await api.post(`${this.baseUrl}/${reportId}/actions`, {
      action,
      description,
    });
    if (response.data?.data?.action) {
      return { action: response.data.data.action };
    }
    return response.data;
  }

  /**
   * Bulk update report status
   */
  async bulkUpdateStatus(
    reportIds: string[],
    status: Report["status"],
    reason?: string
  ): Promise<{ updated: number; message: string }> {
    const response = await api.post(`${this.baseUrl}/bulk-status`, {
      reportIds,
      status,
      reason,
    });
    return response.data;
  }

  /**
   * Bulk assign reports
   */
  async bulkAssign(
    reportIds: string[],
    moderatorId: string
  ): Promise<{ assigned: number; message: string }> {
    const response = await api.post(`${this.baseUrl}/bulk-assign`, {
      reportIds,
      moderatorId,
    });
    return response.data;
  }

  /**
   * Export reports
   */
  async exportReports(params?: {
    type?: string;
    status?: string;
    priority?: string;
    format?: "csv" | "json";
  }): Promise<{ downloadUrl: string }> {
    const response = await api.get(`${this.baseUrl}/export`, { params });
    return response.data;
  }

  /**
   * Search reports
   */
  async searchReports(
    query: string,
    filters?: {
      type?: string;
      status?: string;
      priority?: string;
    }
  ): Promise<{ reports: Report[]; total: number }> {
    const response = await api.get(`${this.baseUrl}/search`, {
      params: { q: query, ...filters },
    });
    if (response.data?.data) {
      return {
        reports: response.data.data.reports || [],
        total: response.data.data.total || 0,
      };
    }
    return response.data;
  }
}

export default new ReportsService();
