import axios from "axios";
import {
  Backup,
  BackupSchedule,
  StorageUsage,
  DataExport,
  DataImport,
  BackupFilters,
  BackupListResponse,
  CreateBackupRequest,
  RestoreBackupRequest,
  CreateBackupScheduleRequest,
  CreateDataExportRequest,
  BackupRetentionPolicy,
} from "@/types/backup";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class BackupService {
  private baseUrl = "/admin/backups";

  // Backups
  async getBackups(filters?: BackupFilters): Promise<BackupListResponse> {
    const response = await api.get(`${this.baseUrl}`, { params: filters });
    return response.data;
  }

  async getBackupById(backupId: string): Promise<{ backup: Backup }> {
    const response = await api.get(`${this.baseUrl}/${backupId}`);
    return response.data;
  }

  async createBackup(
    data: CreateBackupRequest
  ): Promise<{ backup: Backup; message: string }> {
    const response = await api.post(`${this.baseUrl}`, data);
    return response.data;
  }

  async deleteBackup(backupId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${backupId}`);
    return response.data;
  }

  async restoreBackup(
    data: RestoreBackupRequest
  ): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/restore`, data);
    return response.data;
  }

  async verifyBackup(
    backupId: string
  ): Promise<{ valid: boolean; message: string }> {
    const response = await api.post(`${this.baseUrl}/${backupId}/verify`);
    return response.data;
  }

  async downloadBackup(backupId: string): Promise<{ downloadUrl: string }> {
    const response = await api.get(`${this.baseUrl}/${backupId}/download`);
    return response.data;
  }

  // Backup Schedules
  async getBackupSchedules(): Promise<{ schedules: BackupSchedule[] }> {
    const response = await api.get(`${this.baseUrl}/schedules`);
    return response.data;
  }

  async getBackupScheduleById(
    scheduleId: string
  ): Promise<{ schedule: BackupSchedule }> {
    const response = await api.get(`${this.baseUrl}/schedules/${scheduleId}`);
    return response.data;
  }

  async createBackupSchedule(
    data: CreateBackupScheduleRequest
  ): Promise<{ schedule: BackupSchedule; message: string }> {
    const response = await api.post(`${this.baseUrl}/schedules`, data);
    return response.data;
  }

  async updateBackupSchedule(
    scheduleId: string,
    data: Partial<CreateBackupScheduleRequest>
  ): Promise<{ schedule: BackupSchedule; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/schedules/${scheduleId}`,
      data
    );
    return response.data;
  }

  async deleteBackupSchedule(scheduleId: string): Promise<{ message: string }> {
    const response = await api.delete(
      `${this.baseUrl}/schedules/${scheduleId}`
    );
    return response.data;
  }

  async toggleBackupSchedule(
    scheduleId: string,
    enabled: boolean
  ): Promise<{ message: string }> {
    const response = await api.patch(
      `${this.baseUrl}/schedules/${scheduleId}/toggle`,
      { enabled }
    );
    return response.data;
  }

  async runScheduleNow(scheduleId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/schedules/${scheduleId}/run`
    );
    return response.data;
  }

  // Storage Usage
  async getStorageUsage(): Promise<{ usage: StorageUsage }> {
    const response = await api.get(`${this.baseUrl}/storage`);
    return response.data;
  }

  // Data Export
  async getDataExports(): Promise<{ exports: DataExport[] }> {
    const response = await api.get(`${this.baseUrl}/exports`);
    return response.data;
  }

  async createDataExport(
    data: CreateDataExportRequest
  ): Promise<{ export: DataExport; message: string }> {
    const response = await api.post(`${this.baseUrl}/exports`, data);
    return response.data;
  }

  async downloadDataExport(exportId: string): Promise<{ downloadUrl: string }> {
    const response = await api.get(
      `${this.baseUrl}/exports/${exportId}/download`
    );
    return response.data;
  }

  async deleteDataExport(exportId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/exports/${exportId}`);
    return response.data;
  }

  // Data Import
  async getDataImports(): Promise<{ imports: DataImport[] }> {
    const response = await api.get(`${this.baseUrl}/imports`);
    return response.data;
  }

  async uploadDataImport(
    file: File,
    type: string,
    format: string
  ): Promise<{ import: DataImport; message: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("format", format);

    const response = await api.post(`${this.baseUrl}/imports`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async getDataImportStatus(importId: string): Promise<{ import: DataImport }> {
    const response = await api.get(`${this.baseUrl}/imports/${importId}`);
    return response.data;
  }

  // Retention Policies
  async getRetentionPolicies(): Promise<{ policies: BackupRetentionPolicy[] }> {
    const response = await api.get(`${this.baseUrl}/retention`);
    return response.data;
  }

  async createRetentionPolicy(
    data: Partial<BackupRetentionPolicy>
  ): Promise<{ policy: BackupRetentionPolicy; message: string }> {
    const response = await api.post(`${this.baseUrl}/retention`, data);
    return response.data;
  }

  async updateRetentionPolicy(
    policyId: string,
    data: Partial<BackupRetentionPolicy>
  ): Promise<{ policy: BackupRetentionPolicy; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/retention/${policyId}`,
      data
    );
    return response.data;
  }

  async deleteRetentionPolicy(policyId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/retention/${policyId}`);
    return response.data;
  }

  // Cleanup
  async cleanupOldBackups(): Promise<{
    message: string;
    deletedCount: number;
  }> {
    const response = await api.post(`${this.baseUrl}/cleanup`);
    return response.data;
  }
}

export default new BackupService();
