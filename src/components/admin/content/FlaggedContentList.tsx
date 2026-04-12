"use client";

import { FlaggedContent, ContentType } from "@/types/content-moderation";
import {
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FlaggedContentListProps {
  content: FlaggedContent[];
  onReview: (content: FlaggedContent) => void;
  onQuickApprove?: (contentId: string) => void;
  onQuickRemove?: (contentId: string) => void;
  selectedIds?: string[];
  onSelectContent?: (contentId: string) => void;
  bulkMode?: boolean;
}

export default function FlaggedContentList({
  content,
  onReview,
  onQuickApprove,
  onQuickRemove,
  selectedIds = [],
  onSelectContent,
  bulkMode = false,
}: FlaggedContentListProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      removed: "bg-red-100 text-red-800",
      escalated: "bg-purple-100 text-purple-800",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return styles[priority as keyof typeof styles] || styles.low;
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case "vendor_profile":
        return "👤";
      case "event_listing":
        return "📅";
      case "user_review":
        return "⭐";
      case "comment":
        return "💬";
      case "message":
        return "✉️";
      case "portfolio_item":
        return "🖼️";
      default:
        return "📄";
    }
  };

  const getContentTypeLabel = (type: ContentType) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const pendingContent = content.filter((c) => c.status === "pending");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Flagged Content ({pendingContent.length} pending)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Review and moderate reported content
          </p>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {content.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Flagged Content
            </h3>
            <p className="text-gray-600">
              All content has been reviewed. Great job!
            </p>
          </div>
        ) : (
          content.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                selectedIds.includes(item._id) ? "ring-2 ring-purple-500" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox for bulk selection */}
                {bulkMode && onSelectContent && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item._id)}
                    onChange={() => onSelectContent(item._id)}
                    className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                )}

                {/* Content Icon */}
                <div className="text-3xl">
                  {getContentTypeIcon(item.contentType)}
                </div>

                {/* Content Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {item.content.title ||
                            getContentTypeLabel(item.contentType)}
                        </h4>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {getContentTypeLabel(item.contentType)} • Category:{" "}
                        {item.category}
                      </p>
                    </div>
                  </div>

                  {/* Content Preview */}
                  {(item.content.description || item.content.text) && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {item.content.description || item.content.text}
                      </p>
                    </div>
                  )}

                  {/* Author & Reporter Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Content Author</p>
                        <p className="text-sm font-medium text-gray-900">
                          {item.content.author.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.content.author.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Reported By</p>
                        <p className="text-sm font-medium text-gray-900">
                          {item.reporter.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.reporter.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Flag Reason */}
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900 mb-1">
                      Report Reason:
                    </p>
                    <p className="text-sm text-red-800">{item.reason}</p>
                  </div>

                  {/* Timestamps */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        Flagged{" "}
                        {formatDistanceToNow(new Date(item.flaggedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {item.reviewedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>
                          Reviewed{" "}
                          {formatDistanceToNow(new Date(item.reviewedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {item.status === "pending" && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onReview(item)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
                    {onQuickApprove && (
                      <button
                        onClick={() => onQuickApprove(item._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    )}
                    {onQuickRemove && (
                      <button
                        onClick={() => onQuickRemove(item._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
