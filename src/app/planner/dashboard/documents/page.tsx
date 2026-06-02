"use client";

import { useState } from "react";
import { Search, Upload as UploadIcon, HardDrive } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DocumentList from "@/components/planner/documents/DocumentList";
import DocumentUpload from "@/components/planner/documents/DocumentUpload";
import DocumentPreview from "@/components/planner/documents/DocumentPreview";
import DocumentShare from "@/components/planner/documents/DocumentShare";
import {
  documentsService,
  Document,
  DocumentType,
} from "@/services/planner/documents.service";

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [shareDoc, setShareDoc] = useState<Document | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all");

  // Fetch documents
  const { data, isLoading } = useQuery({
    queryKey: ["documents", typeFilter, search],
    queryFn: () =>
      documentsService.getDocuments(
        undefined,
        typeFilter === "all" ? undefined : typeFilter,
        search || undefined
      ),
  });

  // Fetch storage info
  const { data: storageData } = useQuery({
    queryKey: ["storage-info"],
    queryFn: () => documentsService.getStorageInfo(),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      files,
      metadata,
    }: {
      files: File[];
      metadata: any;
    }) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("eventId", metadata.eventId);
      formData.append("type", metadata.type);
      formData.append("tags", JSON.stringify(metadata.tags));
      return documentsService.uploadDocument(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["storage-info"] });
      setShowUpload(false);
      alert("Documents uploaded successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to upload documents");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["storage-info"] });
      alert("Document deleted successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to delete document");
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: ({
      docId,
      emails,
      message,
    }: {
      docId: string;
      emails: string[];
      message?: string;
    }) => documentsService.shareDocument(docId, emails, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setShareDoc(null);
      alert("Document shared successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to share document");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id);
    }
  };

  const storage = storageData?.storage;
  const documents = data?.documents || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage contracts, invoices, and other event documents
        </p>
      </div>

      {/* Storage info */}
      {storage && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Storage: {documentsService.formatFileSize(storage.used)} /{" "}
                {storage.limit === -1
                  ? "Unlimited"
                  : documentsService.formatFileSize(storage.limit)}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{storage.tier} Plan</span>
          </div>
          {storage.limit !== -1 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  storage.percentage > 90
                    ? "bg-red-600"
                    : storage.percentage > 75
                    ? "bg-yellow-600"
                    : "bg-teal-600"
                }`}
                style={{ width: `${Math.min(storage.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Types</option>
          <option value="Contract">Contracts</option>
          <option value="Invoice">Invoices</option>
          <option value="Receipt">Receipts</option>
          <option value="Proposal">Proposals</option>
          <option value="Other">Other</option>
        </select>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          <UploadIcon className="w-5 h-5" />
          Upload
        </button>
      </div>

      {/* Upload section */}
      {showUpload && (
        <div className="mb-6">
          <DocumentUpload
            onUpload={(files, metadata) =>
              uploadMutation.mutate({ files, metadata })
            }
            loading={uploadMutation.isPending}
            events={[]} // TODO: Pass actual events
          />
        </div>
      )}

      {/* Documents list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
          </div>
        </div>
      ) : (
        <DocumentList
          documents={documents}
          onDelete={handleDelete}
          onShare={setShareDoc}
          onPreview={setPreviewDoc}
        />
      )}

      {/* Preview modal */}
      {previewDoc && (
        <DocumentPreview
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Share modal */}
      {shareDoc && (
        <DocumentShare
          document={shareDoc}
          onShare={(emails, message) =>
            shareMutation.mutate({ docId: shareDoc._id, emails, message })
          }
          onClose={() => setShareDoc(null)}
          loading={shareMutation.isPending}
        />
      )}
    </div>
  );
}
