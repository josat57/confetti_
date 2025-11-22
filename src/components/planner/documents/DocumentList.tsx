"use client";

import { useState } from "react";
import {
  Download,
  Trash2,
  Share2,
  Eye,
  MoreVertical,
  Grid,
  List as ListIcon,
} from "lucide-react";
import { format } from "date-fns";
import {
  Document,
  documentsService,
} from "@/services/planner/documents.service";

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
  onShare: (doc: Document) => void;
  onPreview: (doc: Document) => void;
}

export default function DocumentList({
  documents,
  onDelete,
  onShare,
  onPreview,
}: DocumentListProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleDownload = (doc: Document) => {
    documentsService.downloadDocument(doc._id, doc.name);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No documents yet
        </h3>
        <p className="text-gray-600">
          Upload your first document to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* View toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded ${
              view === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded ${
              view === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">
                  {documentsService.getFileIcon(doc.file.mimeType)}
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setMenuOpen(menuOpen === doc._id ? null : doc._id)
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === doc._id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpen(null)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <button
                          onClick={() => {
                            onPreview(doc);
                            setMenuOpen(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <button
                          onClick={() => {
                            handleDownload(doc);
                            setMenuOpen(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => {
                            onShare(doc);
                            setMenuOpen(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <button
                          onClick={() => {
                            onDelete(doc._id);
                            setMenuOpen(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <h4 className="font-medium text-gray-900 truncate mb-1">
                {doc.name}
              </h4>
              <p className="text-xs text-gray-500 mb-2">{doc.event.name}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{documentsService.formatFileSize(doc.file.size)}</span>
                <span>{format(new Date(doc.createdAt), "MMM d")}</span>
              </div>
              {doc.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {doc.tags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 2 && (
                    <span className="px-2 py-0.5 text-xs text-gray-500">
                      +{doc.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {documentsService.getFileIcon(doc.file.mimeType)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {doc.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {doc.event.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {doc.type}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {documentsService.formatFileSize(doc.file.size)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {format(new Date(doc.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onPreview(doc)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onShare(doc)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(doc._id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
