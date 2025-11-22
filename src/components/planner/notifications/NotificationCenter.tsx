"use client";

import { useState } from "react";
import { X, Check, Settings, Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import NotificationItem from "./NotificationItem";
import {
  notificationsService,
  Notification,
  NotificationType,
} from "@/services/planner/notifications.service";

interface NotificationCenterProps {
  onClose: () => void;
  onOpenSettings: () => void;
}

export default function NotificationCenter({
  onClose,
  onOpenSettings,
}: NotificationCenterProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotificationType | "all">("all");

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () =>
      notificationsService.getNotifications(
        undefined,
        filter === "all" ? undefined : filter,
        1,
        50
      ),
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt);
    let dateKey: string;

    if (isToday(date)) {
      dateKey = "Today";
    } else if (isYesterday(date)) {
      dateKey = "Yesterday";
    } else {
      dateKey = format(date, "MMMM d, yyyy");
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const filters: Array<{ value: NotificationType | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "Task", label: "Tasks" },
    { value: "Event", label: "Events" },
    { value: "Booking", label: "Bookings" },
    { value: "Payment", label: "Payments" },
    { value: "Message", label: "Messages" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close notifications"
      />

      <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSettings}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notification settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  filter === f.value
                    ? "bg-teal-100 text-teal-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  Loading notifications...
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No notifications
                </h3>
                <p className="text-sm text-gray-600">You're all caught up!</p>
              </div>
            </div>
          ) : (
            <div>
              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  <div className="sticky top-0 px-4 py-2 bg-gray-100 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase">
                      {date}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {items.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                        onDelete={(id) => deleteMutation.mutate(id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
