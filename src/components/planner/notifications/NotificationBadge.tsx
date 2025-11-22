"use client";

import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "@/services/planner/notifications.service";

interface NotificationBadgeProps {
  onClick: () => void;
}

export default function NotificationBadge({ onClick }: NotificationBadgeProps) {
  // Fetch unread count
  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsService.getNotifications(true, undefined, 1, 1),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = data?.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell
        className={`w-5 h-5 ${hasUnread ? "text-teal-600" : "text-gray-600"}`}
      />

      {hasUnread && (
        <>
          {/* Badge */}
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>

          {/* Pulse animation for new notifications */}
          <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-red-500 rounded-full animate-ping opacity-75" />
        </>
      )}
    </button>
  );
}
