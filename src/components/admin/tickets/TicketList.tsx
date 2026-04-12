"use client";

import { SupportTicket } from "@/types/support-ticket";
import {
  MessageSquare,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Tag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TicketListProps {
  tickets: SupportTicket[];
  onViewDetails: (ticket: SupportTicket) => void;
}

export default function TicketList({
  tickets,
  onViewDetails,
}: TicketListProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      waiting: "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return styles[status as keyof typeof styles] || styles.open;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return styles[priority as keyof typeof styles] || styles.low;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "high":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Tickets Found
          </h3>
          <p className="text-gray-600">No tickets match your current filters</p>
        </div>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  {getPriorityIcon(ticket.priority)}
                  <h4 className="text-lg font-semibold text-gray-900">
                    #{ticket.ticketNumber} - {ticket.subject}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                      ticket.status
                    )}`}
                  >
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(
                      ticket.priority
                    )} capitalize`}
                  >
                    {ticket.priority}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 capitalize">
                    {ticket.category.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Description Preview */}
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                  {ticket.description}
                </p>

                {/* User & Assignment Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Submitted by</p>
                      <p className="text-sm font-medium text-gray-900">
                        {ticket.user.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {ticket.user.email}
                      </p>
                    </div>
                  </div>

                  {ticket.assignedTo && (
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Assigned to</p>
                        <p className="text-sm font-medium text-gray-900">
                          {ticket.assignedTo.name}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Created</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDistanceToNow(new Date(ticket.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-wrap gap-1">
                      {ticket.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {ticket.messages.length} messages
                  </span>
                  {ticket.firstResponseAt && (
                    <span>
                      First response:{" "}
                      {formatDistanceToNow(new Date(ticket.firstResponseAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                  {ticket.resolvedAt && (
                    <span className="text-green-600">
                      Resolved:{" "}
                      {formatDistanceToNow(new Date(ticket.resolvedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                  {ticket.satisfactionRating && (
                    <span className="text-yellow-600">
                      ⭐ {ticket.satisfactionRating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="ml-6">
                <button
                  onClick={() => onViewDetails(ticket)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
