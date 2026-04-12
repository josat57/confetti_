"use client";

import { useState } from "react";
import {
  SupportTicket,
  CannedResponse,
  TicketPriority,
  TicketStatus,
} from "@/types/support-ticket";
import {
  X,
  Send,
  User,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TicketDetailsModalProps {
  ticket: SupportTicket;
  cannedResponses: CannedResponse[];
  admins: { _id: string; name: string; email: string }[];
  onClose: () => void;
  onAssign: (adminId: string) => void;
  onRespond: (message: string, isInternal: boolean) => void;
  onEscalate: (reason: string, newPriority: TicketPriority) => void;
  onUpdateStatus: (status: TicketStatus) => void;
  onUpdatePriority: (priority: TicketPriority) => void;
  onAddTags: (tags: string[]) => void;
}

export default function TicketDetailsModal({
  ticket,
  cannedResponses,
  admins,
  onClose,
  onAssign,
  onRespond,
  onEscalate,
  onUpdateStatus,
  onUpdatePriority,
  onAddTags,
}: TicketDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"conversation" | "details">(
    "conversation"
  );
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [showActionModal, setShowActionModal] = useState<
    "assign" | "close" | "escalate" | "tags" | null
  >(null);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [resolution, setResolution] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [newPriority, setNewPriority] = useState<TicketPriority>("high");
  const [newTags, setNewTags] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      onRespond(message, isInternal);
      setMessage("");
      setIsInternal(false);
    }
  };

  const handleUseCannedResponse = (response: CannedResponse) => {
    setMessage(response.content);
    setShowCannedResponses(false);
  };

  const handleAction = () => {
    switch (showActionModal) {
      case "assign":
        if (selectedAdmin) {
          onAssign(selectedAdmin);
        }
        break;
      case "close":
        if (resolution.trim()) {
          onUpdateStatus("closed");
        }
        break;
      case "escalate":
        if (escalationReason.trim()) {
          onEscalate(escalationReason, newPriority);
        }
        break;
      case "tags":
        if (newTags.trim()) {
          const tags = newTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          onAddTags(tags);
        }
        break;
    }
    setShowActionModal(null);
    resetActionState();
  };

  const resetActionState = () => {
    setSelectedAdmin("");
    setResolution("");
    setEscalationReason("");
    setNewPriority("high");
    setNewTags("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                #{ticket.ticketNumber} - {ticket.subject}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                    ticket.status === "open"
                      ? "bg-blue-100 text-blue-800"
                      : ticket.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : ticket.status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {ticket.status.replace(/_/g, " ")}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                    ticket.priority === "urgent"
                      ? "bg-red-100 text-red-800"
                      : ticket.priority === "high"
                      ? "bg-orange-100 text-orange-800"
                      : ticket.priority === "medium"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {ticket.priority}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 capitalize">
                  {ticket.category.replace(/_/g, " ")}
                </span>
              </div>
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
                onClick={() => setActiveTab("conversation")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "conversation"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Conversation ({ticket.messages.length})
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "details"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Details
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-400px)]">
            {activeTab === "conversation" && (
              <div className="space-y-4">
                {/* Initial Description */}
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="flex items-start gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">
                          {ticket.user.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(ticket.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                {ticket.messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`rounded-lg p-4 ${
                      msg.isInternal
                        ? "bg-yellow-50 border-l-4 border-yellow-500"
                        : msg.sender.role === "admin"
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "bg-gray-50 border-l-4 border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {msg.sender.name}
                            </p>
                            {msg.isInternal && (
                              <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded">
                                Internal
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(msg.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    User Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{ticket.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{ticket.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium capitalize">
                        {ticket.user.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ticket Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Ticket Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {ticket.firstResponseAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">First Response:</span>
                        <span className="font-medium">
                          {new Date(ticket.firstResponseAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {ticket.resolvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Resolved:</span>
                        <span className="font-medium text-green-600">
                          {new Date(ticket.resolvedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {ticket.assignedTo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assigned To:</span>
                        <span className="font-medium">
                          {ticket.assignedTo.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution */}
                {ticket.resolution && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Resolution
                    </h3>
                    <p className="text-green-800">{ticket.resolution}</p>
                  </div>
                )}

                {/* Satisfaction */}
                {ticket.satisfactionRating && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      Satisfaction Rating
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">⭐</span>
                      <span className="text-xl font-bold text-yellow-900">
                        {ticket.satisfactionRating}/5
                      </span>
                    </div>
                    {ticket.satisfactionFeedback && (
                      <p className="text-yellow-800 text-sm">
                        {ticket.satisfactionFeedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reply Section */}
          {ticket.status !== "closed" && activeTab === "conversation" && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Reply
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setShowCannedResponses(!showCannedResponses)
                      }
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      Use Canned Response
                    </button>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded"
                      />
                      Internal Note
                    </label>
                  </div>
                </div>

                {showCannedResponses && (
                  <div className="mb-2 p-2 bg-white border border-gray-200 rounded max-h-32 overflow-y-auto">
                    {cannedResponses.map((response) => (
                      <button
                        key={response._id}
                        onClick={() => handleUseCannedResponse(response)}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                      >
                        <p className="font-medium text-gray-900">
                          {response.title}
                        </p>
                        <p className="text-gray-600 text-xs line-clamp-1">
                          {response.content}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowActionModal("assign")}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => setShowActionModal("escalate")}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Escalate
                  </button>
                  <button
                    onClick={() => setShowActionModal("close")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Close Ticket
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Modals - Simplified for brevity */}
      {showActionModal === "assign" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Ticket
            </h3>
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            >
              <option value="">Select Admin</option>
              {admins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.name}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowActionModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={!selectedAdmin}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {showActionModal === "close" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Close Ticket
            </h3>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Enter resolution..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              rows={4}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowActionModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={!resolution.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
