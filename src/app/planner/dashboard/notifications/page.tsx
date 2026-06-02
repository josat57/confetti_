"use client";

import { useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Loader2,
  Calendar,
  DollarSign,
  Mail,
  CheckCircle,
  AlertCircle,
  Info,
  Filter,
} from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { toast } from "react-toastify";
import { NotificationType } from "@/services/planner/notifications.service";
import {
  usePlannerNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";

const TYPE_FILTERS: Array<{ value: NotificationType | "all"; label: string }> = [
  { value: "all",     label: "All" },
  { value: "Task",    label: "Tasks" },
  { value: "Event",   label: "Events" },
  { value: "Booking", label: "Bookings" },
  { value: "Payment", label: "Payments" },
  { value: "Message", label: "Messages" },
  { value: "System",  label: "System" },
];

function NotifIcon({ type, priority }: { type: NotificationType; priority: string }) {
  const iconMap: Record<NotificationType, any> = {
    Task:    CheckCircle,
    Event:   Calendar,
    Payment: DollarSign,
    Message: Mail,
    Booking: Calendar,
    System:  Info,
  };
  const Icon = iconMap[type] || AlertCircle;

  let cls = "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
  if (priority === "High") {
    cls = "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
  } else if (priority === "Medium") {
    cls = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
  } else {
    const colorMap: Partial<Record<NotificationType, string>> = {
      Task:    "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      Event:   "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
      Payment: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      Message: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      Booking: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    };
    cls = colorMap[type] || cls;
  }

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cls}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
}

function groupByDate(notifications: any[]) {
  return notifications.reduce((groups, n) => {
    const d = new Date(n.createdAt);
    const key = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMMM d, yyyy");
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
    return groups;
  }, {} as Record<string, any[]>);
}

export default function PlannerNotificationsPage() {
  const [filter, setFilter] = useState<NotificationType | "all">("all");

  const { data, isLoading } = usePlannerNotifications(filter);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const grouped = groupByDate(notifications);

  async function handleMarkAllRead() {
    try {
      await markAllRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNotif.mutateAsync(id);
    } catch {
      toast.error("Failed to delete notification");
    }
  }

  const filterBtnCls = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
      active
        ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
    }`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-teal-600 dark:text-teal-400 mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-700 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors disabled:opacity-50"
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
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-teal-300 dark:text-teal-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No notifications</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div>
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                {/* Date header */}
                <div className="sticky top-0 px-5 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {date}
                  </h3>
                </div>
                <ul className="divide-y divide-gray-50 dark:divide-gray-700">
                  {(items as any[]).map((notif) => (
                    <li
                      key={notif._id}
                      onClick={() => !notif.read && markRead.mutate(notif._id)}
                      className={`group flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors border-l-4 ${
                        notif.read
                          ? "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          : "border-teal-500 bg-teal-50/30 dark:bg-teal-900/10 hover:bg-teal-50/60 dark:hover:bg-teal-900/20"
                      }`}
                    >
                      <NotifIcon type={notif.type} priority={notif.priority} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className={`text-sm font-medium leading-5 ${
                            notif.read
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-900 dark:text-gray-100"
                          }`}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!notif.read && (
                              <span className="w-2 h-2 bg-teal-500 rounded-full" />
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
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
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                          {!notif.read && (
                            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">New</span>
                          )}
                          {notif.priority === "High" && (
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">Urgent</span>
                          )}
                        </div>
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
