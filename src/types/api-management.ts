// API & Integration Management Types

export interface APIKey {
  _id: string;
  name: string;
  description?: string;
  key: string;
  secret?: string; // Only shown once during creation
  status: "active" | "revoked" | "expired";
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  permissions: string[];
  usage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastRequest?: Date;
  };
  ipWhitelist?: string[];
  metadata?: Record<string, any>;
}

export interface APILog {
  _id: string;
  apiKeyId: string;
  apiKeyName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  statusCode: number;
  responseTime: number; // in milliseconds
  requestSize: number; // in bytes
  responseSize: number; // in bytes
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  error?: string;
  requestBody?: any;
  responseBody?: any;
}

export interface APIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsToday: number;
  requestsThisWeek: number;
  requestsThisMonth: number;
  topEndpoints: {
    endpoint: string;
    count: number;
    averageResponseTime: number;
  }[];
  errorRate: number;
  requestsByStatusCode: {
    code: number;
    count: number;
  }[];
  requestsByHour: {
    hour: number;
    count: number;
  }[];
}

export interface Webhook {
  _id: string;
  name: string;
  description?: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failed";
  secret: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  deliveryStats: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    lastSuccess?: Date;
    lastFailure?: Date;
  };
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // in seconds
  };
  headers?: Record<string, string>;
}

export interface Integration {
  _id: string;
  name: string;
  type: "payment" | "email" | "sms" | "analytics" | "storage" | "custom";
  provider: string;
  description?: string;
  status: "active" | "inactive" | "error" | "configuring";
  enabled: boolean;
  credentials: Record<string, any>;
  config: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastSync?: Date;
  syncStatus?: "syncing" | "completed" | "failed";
  healthCheck: {
    lastCheck?: Date;
    status: "healthy" | "unhealthy" | "unknown";
    message?: string;
  };
  usage: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
  };
}

export interface APIKeyFilters {
  status?: "active" | "revoked" | "expired";
  createdBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface APILogFilters {
  apiKeyId?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  statusCode?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface WebhookFilters {
  status?: "active" | "inactive" | "failed";
  event?: string;
  page?: number;
  limit?: number;
}

export interface IntegrationFilters {
  type?: "payment" | "email" | "sms" | "analytics" | "storage" | "custom";
  status?: "active" | "inactive" | "error" | "configuring";
  enabled?: boolean;
  page?: number;
  limit?: number;
}

export interface APIKeyListResponse {
  apiKeys: APIKey[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface APILogListResponse {
  logs: APILog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WebhookListResponse {
  webhooks: Webhook[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IntegrationListResponse {
  integrations: Integration[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  expiresAt?: Date;
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  permissions?: string[];
  ipWhitelist?: string[];
}

export interface CreateWebhookRequest {
  name: string;
  description?: string;
  url: string;
  events: string[];
  secret?: string;
  retryPolicy?: {
    maxRetries?: number;
    retryDelay?: number;
  };
  headers?: Record<string, string>;
}

export interface CreateIntegrationRequest {
  name: string;
  type: "payment" | "email" | "sms" | "analytics" | "storage" | "custom";
  provider: string;
  description?: string;
  credentials: Record<string, any>;
  config?: Record<string, any>;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}
