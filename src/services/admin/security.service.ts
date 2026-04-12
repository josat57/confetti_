import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Use cookies for authentication
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-redirect on 401 for security endpoints that might not exist yet
    if (error.response?.status === 401) {
      console.error("Authentication failed:", error.response?.data?.message);
    }
    return Promise.reject(error);
  }
);

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    preventReuse: number;
  };
  sessionManagement: {
    sessionTimeout: number;
    maxConcurrentSessions: number;
    idleTimeout: number;
    rememberMeDuration: number;
  };
  loginSecurity: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireCaptcha: boolean;
    twoFactorEnabled: boolean;
    twoFactorMethods: string[];
  };
  ipRestrictions: {
    enabled: boolean;
    whitelist: string[];
    blacklist: string[];
  };
  apiSecurity: {
    rateLimitEnabled: boolean;
    requestsPerMinute: number;
    requireApiKey: boolean;
    allowedOrigins: string[];
  };
  dataProtection: {
    encryptionEnabled: boolean;
    backupEncryption: boolean;
    dataRetentionDays: number;
    gdprCompliant: boolean;
  };
}

export interface SecurityLog {
  _id: string;
  timestamp: string;
  eventType: string;
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  userName?: string;
  ipAddress: string;
  userAgent: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface SecurityAlert {
  _id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  affectedUsers?: number;
}

export interface SecurityMetrics {
  totalLogs?: number;
  last24Hours?: number;
  last7Days?: number;
  failedLoginAttempts?: number;
  failedLogins?: number;
  blockedIPs?: number;
  suspiciousActivities?: number;
  activeThreats?: number;
  securityScore?: number;
  lastSecurityAudit?: string;
}

class SecurityService {
  private baseUrl = "/admin/security";

  /**
   * Get security settings
   */
  async getSettings(): Promise<{ settings: SecuritySettings }> {
    try {
      const response = await api.get(`${this.baseUrl}/settings`);
      const backendSettings =
        response.data.data?.settings || response.data.settings;

      // If backend returns empty array or no data, use defaults
      if (
        !backendSettings ||
        (Array.isArray(backendSettings) && backendSettings.length === 0)
      ) {
        return { settings: this.getDefaultSettings() };
      }

      // If backend returns array with data, use first item
      if (Array.isArray(backendSettings) && backendSettings.length > 0) {
        return { settings: backendSettings[0] };
      }

      // Otherwise return the settings object
      return { settings: backendSettings };
    } catch (error) {
      console.error("Failed to fetch security settings:", error);
      return { settings: this.getDefaultSettings() };
    }
  }

  /**
   * Update security settings
   */
  async updateSettings(settings: Partial<SecuritySettings>): Promise<{
    settings: SecuritySettings;
    message: string;
  }> {
    const response = await api.put(`${this.baseUrl}/settings`, settings);
    return {
      settings: response.data.data?.settings || response.data.settings,
      message:
        response.data.message || "Security settings updated successfully",
    };
  }

  /**
   * Get security logs
   */
  async getLogs(params?: {
    page?: number;
    limit?: number;
    severity?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    logs: SecurityLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/logs`, { params });
      return {
        logs: response.data.data?.logs || response.data.logs || [],
        total: response.data.data?.total || response.data.total || 0,
        page: response.data.data?.page || response.data.page || 1,
        totalPages:
          response.data.data?.totalPages || response.data.totalPages || 1,
      };
    } catch (error) {
      console.error("Failed to fetch security logs:", error);
      return { logs: [], total: 0, page: 1, totalPages: 1 };
    }
  }

  /**
   * Get security alerts
   */
  async getAlerts(params?: {
    resolved?: boolean;
    severity?: string;
  }): Promise<{ alerts: SecurityAlert[] }> {
    try {
      const response = await api.get(`${this.baseUrl}/alerts`, { params });
      return {
        alerts: response.data.data?.alerts || response.data.alerts || [],
      };
    } catch (error) {
      console.error("Failed to fetch security alerts:", error);
      return { alerts: [] };
    }
  }

  /**
   * Resolve security alert
   */
  async resolveAlert(
    alertId: string,
    notes?: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/alerts/${alertId}/resolve`,
      { notes }
    );
    return {
      message: response.data.message || "Alert resolved successfully",
    };
  }

  /**
   * Get security metrics
   */
  async getMetrics(): Promise<{ metrics: SecurityMetrics }> {
    try {
      const response = await api.get(`${this.baseUrl}/metrics`);
      const backendMetrics =
        response.data.data?.metrics || response.data.metrics || {};

      // Map backend response to our interface
      return {
        metrics: {
          totalLogs: backendMetrics.totalLogs || 0,
          last24Hours: backendMetrics.last24Hours || 0,
          last7Days: backendMetrics.last7Days || 0,
          failedLoginAttempts:
            backendMetrics.failedLogins ||
            backendMetrics.failedLoginAttempts ||
            0,
          blockedIPs: backendMetrics.blockedIPs || 0,
          suspiciousActivities: backendMetrics.suspiciousActivities || 0,
          activeThreats: backendMetrics.activeThreats || 0,
          securityScore: backendMetrics.securityScore || 85,
          lastSecurityAudit:
            backendMetrics.lastSecurityAudit || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Failed to fetch security metrics:", error);
      return { metrics: this.getDefaultMetrics() };
    }
  }

  /**
   * Block IP address
   */
  async blockIP(
    ipAddress: string,
    reason?: string
  ): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/block-ip`, {
      ipAddress,
      reason,
    });
    return {
      message: response.data.message || "IP address blocked successfully",
    };
  }

  /**
   * Unblock IP address
   */
  async unblockIP(ipAddress: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/unblock-ip`, {
      ipAddress,
    });
    return {
      message: response.data.message || "IP address unblocked successfully",
    };
  }

  /**
   * Run security audit
   */
  async runSecurityAudit(): Promise<{
    report: any;
    message: string;
  }> {
    const response = await api.post(`${this.baseUrl}/audit`);
    return {
      report: response.data.data?.report || response.data.report,
      message: response.data.message || "Security audit completed",
    };
  }

  /**
   * Get blocked IPs
   */
  async getBlockedIPs(): Promise<{
    ips: Array<{ ip: string; reason: string; blockedAt: string }>;
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/blocked-ips`);
      return {
        ips: response.data.data?.ips || response.data.ips || [],
      };
    } catch (error) {
      console.error("Failed to fetch blocked IPs:", error);
      return { ips: [] };
    }
  }

  /**
   * Test two-factor authentication
   */
  async testTwoFactor(
    method: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`${this.baseUrl}/test-2fa`, { method });
    return {
      success: response.data.success || false,
      message: response.data.message || "2FA test completed",
    };
  }

  private getDefaultSettings(): SecuritySettings {
    return {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        expiryDays: 90,
        preventReuse: 5,
      },
      sessionManagement: {
        sessionTimeout: 30,
        maxConcurrentSessions: 3,
        idleTimeout: 15,
        rememberMeDuration: 30,
      },
      loginSecurity: {
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        requireCaptcha: false,
        twoFactorEnabled: false,
        twoFactorMethods: ["email", "sms"],
      },
      ipRestrictions: {
        enabled: false,
        whitelist: [],
        blacklist: [],
      },
      apiSecurity: {
        rateLimitEnabled: true,
        requestsPerMinute: 100,
        requireApiKey: true,
        allowedOrigins: ["*"],
      },
      dataProtection: {
        encryptionEnabled: true,
        backupEncryption: true,
        dataRetentionDays: 365,
        gdprCompliant: true,
      },
    };
  }

  private getDefaultMetrics(): SecurityMetrics {
    return {
      failedLoginAttempts: 0,
      blockedIPs: 0,
      suspiciousActivities: 0,
      activeThreats: 0,
      securityScore: 85,
      lastSecurityAudit: new Date().toISOString(),
    };
  }
}

export default new SecurityService();
