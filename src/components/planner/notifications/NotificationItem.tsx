"use client";

import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  Calendar,
  DollarSign,
  Mail,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import {
  Notification,
  NotificationType,
} from "@/services/planner/notifications.service";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "Task":
        return CheckCircle;
      case "Event":
        return Calendar;
      case "Payment":
        return DollarSign;
      case "Message":
        return Mail;
      case "Booking":
        return Calendar;
      case "System":
        return Info;
      default:
        return AlertCircle;
    }
  };

  const getIconColor = (type: NotificationType, priority: string) => {
    if (priority === "High") return "text-red-600 bg-red-100";
    if (priority === "Medium") return "text-yellow-600 bg-yellow-100";

    switch (type) {
      case "Task":
        return "text-blue-600 bg-blue-100";
      case "Event":
        return "text-teal-600 bg-teal-100";
      case "Payment":
        return "text-green-600 bg-green-100";
      case "Message":
        return "text-purple-600 bg-purple-100";
      case "Booking":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const Icon = getIcon(notification.type);
  const iconColor = getIconColor(notification.type, notification.priority);

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
    if (onClick) {
      onClick(notification);
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      className={`group relative p-4 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        notification.read
          ? "border-gray-200 bg-white"
          : "border-teal-500 bg-teal-50"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`font-medium ${
                notification.read ? "text-gray-700" : "text-gray-900"
              }`}
            >
              {notification.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification._id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
              aria-label="Delete notification"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <p
            className={`text-sm ${
              notification.read ? "text-gray-500" : "text-gray-700"
            } mb-2`}
          >
            {notification.message}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </span>
            {!notification.read && (
              <span className="text-xs font-medium text-teal-600">New</span>
            )}
            {notification.priority === "High" && (
              <span className="text-xs font-medium text-red-600">Urgent</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
