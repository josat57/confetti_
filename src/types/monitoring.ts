// System Health & Monitoring Types

export interface SystemHealth {
  status: "healthy" | "degraded" | "critical";
  uptime: number; // in seconds
  uptimePercentage: number;
  lastChecked: Date;
  components: {
    api: ComponentHealth;
    database: ComponentHealth;
    cache: ComponentHealth;
    storage: ComponentHealth;
  };
}

export interface ComponentHealth {
  status: "healthy" | "degraded" | "critical";
  responseTime?: number; // in ms
  errorRate?: number; // percentage
  message?: string;
}

export interface ServerMetrics {
  cpu: {
    usage: number; // percentage
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number; // in bytes
    used: number;
    free: number;
    usagePercentage: number;
  };
  disk: {
    total: number; // in bytes
    used: number;
    free: number;
    usagePercentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    requestsPerSecond: number;
  };
  timestamp: Date;
}

export interface DatabaseMetrics {
  connectionPool: {
    total: number;
    active: number;
    idle: number;
    waiting: number;
  };
  queryPerformance: {
    averageQueryTime: number; // in ms
    slowQueries: number;
    totalQueries: number;
    queriesPerSecond: number;
  };
  storage: {
    size: number; // in bytes
    collections: number;
    indexes: number;
  };
  timestamp: Date;
}

export interface APIMetrics {
  totalRequests: number;
  requestsPerSecond: number;
  averageResponseTime: number; // in ms
  errorRate: number; // percentage
  statusCodes: {
    "2xx": number;
    "3xx": number;
    "4xx": number;
    "5xx": number;
  };
  topEndpoints: Array<{
    endpoint: string;
    method: string;
    requests: number;
    averageTime: number;
    errorRate: number;
  }>;
  timestamp: Date;
}

export interface ErrorLog {
  _id: string;
  level: "error" | "warning" | "info";
  message: string;
  stack?: string;
  context?: Record<string, any>;
  endpoint?: string;
  method?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface BackgroundJob {
  _id: string;
  name: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  priority: "low" | "medium" | "high";
  attempts: number;
  maxAttempts: number;
  data?: Record<string, any>;
  result?: any;
  error?: string;
  processingTime?: number; // in ms
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export interface CacheMetrics {
  hitRate: number; // percentage
  missRate: number; // percentage
  totalKeys: number;
  memoryUsage: number; // in bytes
  evictions: number;
  operations: {
    gets: number;
    sets: number;
    deletes: number;
  };
  timestamp: Date;
}

export interface MonitoringStats {
  systemStatus: "healthy" | "degraded" | "critical";
  uptime: number;
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  activeUsers: number;
  backgroundJobs: {
    pending: number;
    processing: number;
    failed: number;
  };
}

export interface ErrorLogFilters {
  level?: "error" | "warning" | "info";
  resolved?: boolean;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface JobFilters {
  status?: "pending" | "processing" | "completed" | "failed";
  type?: string;
  priority?: "low" | "medium" | "high";
  page?: number;
  limit?: number;
}

export interface ErrorLogListResponse {
  errors: ErrorLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobListResponse {
  jobs: BackgroundJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AlertConfig {
  _id: string;
  name: string;
  type: "cpu" | "memory" | "disk" | "error_rate" | "response_time";
  threshold: number;
  enabled: boolean;
  notifyEmail: boolean;
  notifySMS: boolean;
  recipients: string[];
  createdAt: Date;
  updatedAt: Date;
}
