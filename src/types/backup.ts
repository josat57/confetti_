// Backup & Data Management Types

export interface Backup {
  _id: string;
  name: string;
  description?: string;
  type: "manual" | "scheduled" | "automatic";
  status: "creating" | "completed" | "failed" | "restoring";
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  size: number; // in bytes
  location: string;
  checksum: string;
  verified: boolean;
  verifiedAt?: Date;
  expiresAt?: Date;
  metadata: {
    databaseSize: number;
    fileStorageSize: number;
    totalRecords: number;
    collections: string[];
    version: string;
  };
  error?: string;
}

export interface BackupSchedule {
  _id: string;
  name: string;
  description?: string;
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  time?: string; // HH:mm format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  retentionDays: number;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageUsage {
  database: {
    size: number;
    collections: {
      name: string;
      size: number;
      documents: number;
    }[];
    totalSize: number;
  };
  fileStorage: {
    uploads: number;
    images: number;
    documents: number;
    totalSize: number;
  };
  backups: {
    count: number;
    totalSize: number;
    oldestBackup?: Date;
    newestBackup?: Date;
  };
  total: number;
  limit?: number;
  usagePercentage: number;
}

export interface DataExport {
  _id: string;
  name: string;
  type: "full" | "partial" | "users" | "events" | "transactions";
  format: "json" | "csv" | "sql";
  status: "generating" | "completed" | "failed";
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  size?: number;
  downloadUrl?: string;
  expiresAt?: Date;
  filters?: Record<string, any>;
  recordCount?: number;
  error?: string;
}

export interface DataImport {
  _id: string;
  name: string;
  type: "full" | "partial" | "users" | "events" | "transactions";
  format: "json" | "csv" | "sql";
  status: "validating" | "importing" | "completed" | "failed";
  uploadedBy: string;
  uploadedAt: Date;
  completedAt?: Date;
  fileSize: number;
  recordsProcessed: number;
  recordsImported: number;
  recordsFailed: number;
  errors?: string[];
  validationErrors?: string[];
}

export interface BackupFilters {
  type?: "manual" | "scheduled" | "automatic";
  status?: "creating" | "completed" | "failed" | "restoring";
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export interface BackupListResponse {
  backups: Backup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBackupRequest {
  name: string;
  description?: string;
  type?: "manual" | "scheduled";
}

export interface RestoreBackupRequest {
  backupId: string;
  confirmation: boolean;
}

export interface CreateBackupScheduleRequest {
  name: string;
  description?: string;
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  retentionDays: number;
}

export interface CreateDataExportRequest {
  name: string;
  type: "full" | "partial" | "users" | "events" | "transactions";
  format: "json" | "csv" | "sql";
  filters?: Record<string, any>;
}

export interface BackupRetentionPolicy {
  _id: string;
  name: string;
  retentionDays: number;
  autoDelete: boolean;
  archiveBeforeDelete: boolean;
  applyToScheduled: boolean;
  applyToManual: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
