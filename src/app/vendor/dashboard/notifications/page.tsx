"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  Trash2,
  Loader2,
  Calendar,
  DollarSign,
  Briefcase,
  Info,
  Star,
  Filter,
} from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { toast } from "react-toastify";
import {
  notificationsService,
  Notification,
} from "@/services/notifications.service";

const TYPE_FILTERS = [
  { value: "all",     label: "All" },
  { value: "lead",    label: "Leads" },
  { value: "booking", label: "Bookings" },
  { value: "payment", label: "Payments" },
  { value: "review",  label: "Reviews" },
  { value: "system",  label: "System" },
] as const;

type FilterValue = (typeof TYPE_FILTERS)[number]["value"];

function NotifIcon({ type }: { type: Notification["type"] }) {
  const cfg: Record<string, { icon: any; cls: string }> = {
    lead:    { icon: Briefcase, cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    booking: { icon: Calendar,  cls: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
    payment: { icon: DollarSign,cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
    review:  { icon: Star,      cls: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
    system:  { icon: Info,      cls: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" },
    team:    { icon: Briefcase, cls: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" },
  };
  const { icon: Icon, cls } = cfg[type] || cfg.system;
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cls}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
}

function groupByDate(notifications: Notification[]) {
  return notifications.reduce((groups, n) => {
    const d = new Date(n.createdAt);
    const key = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMMM d, yyyy");
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
    return groups;
  }, {} as Record<string, Notification[]>);
}

const notifKeys = {
  all: ["vendor-notifications"] as const,
  list: (filter: FilterValue) => ["vendor-notifications", "list", filter] as const,
};

export default function VendorNotificationsPage() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: notifKeys.list(filter),
    queryFn: () =>
      notificationsService.getNotifications({
        type: filter === "all" ? undefined : filter,
        limit: 50,
      }),
    staleTime: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notifKeys.all }),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notifKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  const deleteNotif = useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notifKeys.all }),
    onError: () => toast.error("Failed to delete notification"),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const grouped = groupByDate(notifications);

  const filterBtnCls = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
      active
        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
    }`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
          >
            {markAllRead.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={filterBtnCls(filter === f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-purple-300 dark:text-purple-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No notifications</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div>
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div className="sticky top-0 px-5 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {date}
                  </h3>
                </div>
                <ul className="divide-y divide-gray-50 dark:divide-gray-700">
                  {items.map((notif) => (
                    <li
                      key={notif._id}
                      onClick={() => !notif.isRead && markRead.mutate(notif._id)}
                      className={`group flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors border-l-4 ${
                        notif.isRead
                          ? "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          : "border-purple-500 bg-purple-50/30 dark:bg-purple-900/10 hover:bg-purple-50/60 dark:hover:bg-purple-900/20"
                      }`}
                    >
                      <NotifIcon type={notif.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className={`text-sm font-medium leading-5 ${
                            notif.isRead
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-900 dark:text-gray-100"
                          }`}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-purple-500 rounded-full" />
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(notif._id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">
                          {notif.message}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
