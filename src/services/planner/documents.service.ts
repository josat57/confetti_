import api from "@/api/api";

// Use the axios instance directly

export type DocumentType =
  | "Contract"
  | "Invoice"
  | "Receipt"
  | "Proposal"
  | "Other";

export interface Document {
  _id: string;
  event: {
    _id: string;
    name: string;
  };
  name: string;
  type: DocumentType;
  category: string;
  file: {
    url: string;
    size: number;
    mimeType: string;
  };
  tags: string[];
  sharedWith: Array<{
    user: string;
    role: "Vendor" | "Client" | "Team Member";
    sharedAt: Date;
  }>;
  versions: Array<{
    version: number;
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageInfo {
  used: number;
  limit: number;
  percentage: number;
  tier: string;
}

class DocumentsService {
  /**
   * Get all documents
   */
  async getDocuments(
    eventId?: string,
    type?: DocumentType,
    search?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    documents: Document[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (eventId) params.append("eventId", eventId);
    if (type) params.append("type", type);
    if (search) params.append("search", search);

    const response = await api.get(`/api/v1/planner/documents?${params}`);
    return response.data;
  }

  /**
   * Upload document
   */
  async uploadDocument(formData: FormData): Promise<{ document: Document }> {
    const response = await api.post("/api/v1/planner/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Get document by ID
   */
  async getDocument(
    documentId: string
  ): Promise<{ document: Document; downloadUrl: string }> {
    const response = await api.get(`/api/v1/planner/documents/${documentId}`);
    return response.data;
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean }> {
    const response = await api.delete(
      `/api/v1/planner/documents/${documentId}`
    );
    return response.data;
  }

  /**
   * Share document
   */
  async shareDocument(
    documentId: string,
    userId: string,
    role: "Vendor" | "Client" | "Team Member"
  ): Promise<{ success: boolean }> {
    const response = await api.post(
      `/api/v1/planner/documents/${documentId}/share`,
      {
        userId,
        role,
      }
    );
    return response.data;
  }

  /**
   * Get storage info
   */
  async getStorageInfo(): Promise<{ storage: StorageInfo }> {
    const response = await api.get("/api/v1/planner/documents/storage");
    return response.data;
  }

  /**
   * Download document
   */
  downloadDocument(documentId: string, filename: string) {
    const link = document.createElement("a");
    link.href = `/api/v1/planner/documents/${documentId}/download`;
    link.download = filename;
    link.click();
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Get file icon based on mime type
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return "📽️";
    return "📎";
  }
}

export const documentsService = new DocumentsService();
