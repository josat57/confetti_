"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Loader2,
  Calendar,
  Briefcase,
  DollarSign,
  Info,
} from "lucide-react";
import { notificationsService, Notification } from "@/services/notifications.service";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";

function NotificationIcon({ type }: { type: Notification["type"] }) {
  const map: Record<string, { icon: any; className: string }> = {
    lead:    { icon: Briefcase,  className: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    booking: { icon: Calendar,   className: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
    payment: { icon: DollarSign, className: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
    review:  { icon: Bell,       className: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
    system:  { icon: Info,       className: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" },
    team:    { icon: Briefcase,  className: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" },
  };
  const cfg = map[type] || map.system;
  const Icon = cfg.icon;
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.className}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
}

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await notificationsService.getNotifications({ limit: 50 });
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    } finally {
      setMarkingAll(false);
    }
  }

  async function markOneRead(id: string) {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
          >
            {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-purple-300 dark:text-purple-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No notifications yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              We'll notify you about your events and activity
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-700">
            {notifications.map((notif) => (
              <li
                key={notif._id}
                onClick={() => !notif.isRead && markOneRead(notif._id)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  !notif.isRead ? "bg-purple-50/50 dark:bg-purple-900/10" : ""
                }`}
              >
                <NotificationIcon type={notif.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium leading-5 ${
                      notif.isRead
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-900 dark:text-gray-100"
                    }`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
