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

const iconMap: Record<NotificationType, any> = {
  Task:    CheckCircle,
  Event:   Calendar,
  Payment: DollarSign,
  Message: Mail,
  Booking: Calendar,
  System:  Info,
};

function getIconCls(type: NotificationType, priority: string) {
  if (priority === "High") return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
  if (priority === "Medium") return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
  const map: Partial<Record<NotificationType, string>> = {
    Task:    "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    Event:   "text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400",
    Payment: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    Message: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    Booking: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return map[type] || "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400";
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const Icon = iconMap[notification.type] || AlertCircle;

  const handleClick = () => {
    if (!notification.read) onMarkAsRead(notification._id);
    if (onClick) onClick(notification);
    else if (notification.actionUrl) window.location.href = notification.actionUrl;
  };

  return (
    <div
      className={`group relative p-4 border-l-4 cursor-pointer transition-colors ${
        notification.read
          ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          : "border-teal-500 bg-teal-50 dark:bg-teal-900/10 hover:bg-teal-100/50 dark:hover:bg-teal-900/20"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconCls(notification.type, notification.priority)}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-medium text-sm ${
              notification.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-gray-100"
            }`}>
              {notification.title}
            </h4>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(notification._id); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
              aria-label="Delete notification"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <p className={`text-sm mb-2 ${
            notification.read ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-300"
          }`}>
            {notification.message}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            {!notification.read && (
              <span className="text-xs font-medium text-teal-600 dark:text-teal-400">New</span>
            )}
            {notification.priority === "High" && (
              <span className="text-xs font-medium text-red-600 dark:text-red-400">Urgent</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
