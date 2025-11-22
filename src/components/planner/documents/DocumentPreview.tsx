"use client";

import { X, Download } from "lucide-react";
import {
  Document,
  documentsService,
} from "@/services/planner/documents.service";

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
}

export default function DocumentPreview({
  document,
  onClose,
}: DocumentPreviewProps) {
  const handleDownload = () => {
    documentsService.downloadDocument(document._id, document.name);
  };

  const canPreview =
    document.file.mimeType.startsWith("image/") ||
    document.file.mimeType === "application/pdf";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">
            {document.name}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto p-4">
          {canPreview ? (
            document.file.mimeType.startsWith("image/") ? (
              <img
                src={document.file.url}
                alt={document.name}
                className="max-w-full h-auto mx-auto"
              />
            ) : (
              <iframe
                src={document.file.url}
                className="w-full h-full min-h-[600px]"
                title={document.name}
              />
            )
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {documentsService.getFileIcon(document.file.mimeType)}
              </div>
              <p className="text-gray-600 mb-4">
                Preview not available for this file type
              </p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Download to View
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
