"use client";

import { useState } from "react";
import { FlaggedContent, ModerationHistory } from "@/types/content-moderation";
import {
  X,
  CheckCircle,
  XCircle,
  Ban,
  AlertTriangle,
  User,
  Clock,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ContentReviewModalProps {
  content: FlaggedContent;
  history?: ModerationHistory[];
  onClose: () => void;
  onApprove: (reason?: string) => void;
  onRemove: (reason: string) => void;
  onBanUser: (userId: string, reason: string) => void;
  onEscalate: (reason: string) => void;
}

export default function ContentReviewModal({
  content,
  history = [],
  onClose,
  onApprove,
  onRemove,
  onBanUser,
  onEscalate,
}: ContentReviewModalProps) {
  const [activeTab, setActiveTab] = useState<"content" | "history">("content");
  const [showActionModal, setShowActionModal] = useState<
    "approve" | "remove" | "ban" | "escalate" | null
  >(null);
  const [actionReason, setActionReason] = useState("");

  const handleAction = () => {
    if (!showActionModal) return;

    switch (showActionModal) {
      case "approve":
        onApprove(actionReason || undefined);
        break;
      case "remove":
        if (actionReason.trim()) {
          onRemove(actionReason);
        }
        break;
      case "ban":
        if (actionReason.trim()) {
          onBanUser(content.content.author._id, actionReason);
        }
        break;
      case "escalate":
        if (actionReason.trim()) {
          onEscalate(actionReason);
        }
        break;
    }

    setShowActionModal(null);
    setActionReason("");
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "approve":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "remove":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "ban_user":
        return <Ban className="w-4 h-4 text-red-600" />;
      case "escalate":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Content Review
              </h2>
              <p className="text-gray-600 mt-1">
                {content.contentType.replace(/_/g, " ")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("content")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "content"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Content Details
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Moderation History ({history.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
            {activeTab === "content" ? (
              <div className="space-y-6">
                {/* Flag Information */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">
                        Report Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-red-700">Category</p>
                          <p className="font-medium text-red-900 capitalize">
                            {content.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-red-700">Priority</p>
                          <p className="font-medium text-red-900 capitalize">
                            {content.priority}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-red-700 mb-1">Reason:</p>
                      <p className="text-red-900">{content.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Reporter Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Reported By
                  </h3>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {content.reporter.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {content.reporter.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Flagged{" "}
                        {formatDistanceToNow(new Date(content.flaggedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Author */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Content Author
                  </h3>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {content.content.author.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {content.content.author.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        Role: {content.content.author.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Content Preview
                  </h3>
                  {content.content.title && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Title</p>
                      <p className="font-medium text-gray-900">
                        {content.content.title}
                      </p>
                    </div>
                  )}
                  {(content.content.description || content.content.text) && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Content</p>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {content.content.description || content.content.text}
                        </p>
                      </div>
                    </div>
                  )}
                  {content.content.images &&
                    content.content.images.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Images</p>
                        <div className="grid grid-cols-3 gap-2">
                          {content.content.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Content image ${index + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  <div className="mt-3 text-xs text-gray-500">
                    Created{" "}
                    {formatDistanceToNow(new Date(content.content.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No moderation history yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        {getActionIcon(item.action)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900 capitalize">
                              {item.action.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(item.performedAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            By: {item.performedBy.name}
                          </p>
                          <p className="text-sm text-gray-700">{item.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {content.status === "pending" && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setShowActionModal("escalate")}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Escalate
              </button>
              <button
                onClick={() => setShowActionModal("ban")}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Ban User
              </button>
              <button
                onClick={() => setShowActionModal("remove")}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Content
              </button>
              <button
                onClick={() => setShowActionModal("approve")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve Content
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {showActionModal.replace(/_/g, " ")} Content
            </h3>
            <p className="text-gray-600 mb-4">
              {showActionModal === "approve"
                ? "Optionally provide a reason for approving this content:"
                : "Please provide a reason for this action:"}
            </p>

            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              rows={4}
              required={showActionModal !== "approve"}
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setActionReason("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={showActionModal !== "approve" && !actionReason.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
