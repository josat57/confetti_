"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Trash2, ExternalLink } from "lucide-react";
import {
  notificationsService,
  Notification,
} from "@/services/notifications.service";
import { toast } from "react-toastify";
import Link from "next/link";

// Simple time ago function
const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { notifications: fetchedNotifications, unreadCount: count } =
        await notificationsService.getNotifications({ limit: 10 });

      setNotifications(
        fetchedNotifications.map((n) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          readAt: n.readAt ? new Date(n.readAt) : undefined,
        }))
      );
      setUnreadCount(count);
    } catch (error: any) {
      // Silently fail if endpoint doesn't exist
      if (error.response?.status !== 404) {
        console.error("Error fetching notifications:", error);
      }
    }
  };

  // Fetch unread count periodically
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error: any) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await notificationsService.markAllAsRead();
      setNotifications(
        notifications.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error("Failed to mark all as read");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      const notification = notifications.find((n) => n._id === notificationId);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
      if (notification && !notification.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      toast.success("Notification deleted");
    } catch (error: any) {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    const iconClass = "w-10 h-10 rounded-full flex items-center justify-center";
    switch (type) {
      case "lead":
        return (
          <div className={`${iconClass} bg-blue-100 text-blue-600`}>📋</div>
        );
      case "booking":
        return (
          <div className={`${iconClass} bg-green-100 text-green-600`}>📅</div>
        );
      case "payment":
        return (
          <div className={`${iconClass} bg-purple-100 text-purple-600`}>💳</div>
        );
      case "review":
        return (
          <div className={`${iconClass} bg-yellow-100 text-yellow-600`}>⭐</div>
        );
      case "team":
        return (
          <div className={`${iconClass} bg-pink-100 text-pink-600`}>👥</div>
        );
      default:
        return (
          <div className={`${iconClass} bg-gray-100 text-gray-600`}>🔔</div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? "bg-purple-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      {getNotificationIcon(notification.type)}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {timeAgo(notification.createdAt)}
                          </span>
                          <div className="flex items-center gap-1">
                            {notification.link && (
                              <Link
                                href={notification.link}
                                onClick={() => {
                                  if (!notification.isRead) {
                                    handleMarkAsRead(notification._id);
                                  }
                                  setIsOpen(false);
                                }}
                                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                                title="View"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                            {!notification.isRead && (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification._id)
                                }
                                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification._id)}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <Link
                href="/vendor/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
