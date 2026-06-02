"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Briefcase,
  Sparkles,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  BookOpen,
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import {
  useUserDashboardStats,
  useUpcomingEvents,
  useUserRecentActivity,
} from "@/hooks/useUserDashboard";

// ── Skeleton helpers ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-28 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonEventRow() {
  return (
    <div className="flex items-center space-x-4 py-4 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="h-3 bg-gray-200 rounded w-32" />
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20" />
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  Draft:       { label: "Draft",       className: "bg-gray-100 text-gray-700",   icon: Clock },
  Planning:    { label: "Planning",    className: "bg-blue-100 text-blue-700",   icon: Clock },
  Confirmed:   { label: "Confirmed",   className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  "In Progress":{ label: "In Progress",className: "bg-amber-100 text-amber-700", icon: Clock },
  Completed:   { label: "Completed",   className: "bg-purple-100 text-purple-700",icon: CheckCircle2 },
  Cancelled:   { label: "Cancelled",   className: "bg-red-100 text-red-700",     icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.Draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d, yyyy");
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useUserDashboardStats();
  const { data: upcoming = [], isLoading: upcomingLoading } = useUpcomingEvents(5);
  const { data: activity = [], isLoading: activityLoading } = useUserRecentActivity(6);

  const loading = statsLoading || upcomingLoading || activityLoading;

  const displayName = user?.firstName ? user.firstName : user?.username || "there";

  const statsCards = [
    {
      title: "Upcoming Events",
      value: stats?.upcomingEvents ?? 0,
      icon: Calendar,
      bg: "bg-purple-50",
      text: "text-purple-600",
      action: () => router.push("/user/dashboard/events"),
    },
    {
      title: "Total Events",
      value: stats?.totalEvents ?? 0,
      icon: CheckCircle2,
      bg: "bg-blue-50",
      text: "text-blue-600",
      action: () => router.push("/user/dashboard/events"),
    },
    {
      title: "Saved Vendors",
      value: stats?.savedVendors ?? 0,
      icon: Briefcase,
      bg: "bg-green-50",
      text: "text-green-600",
      action: () => router.push("/user/dashboard/vendors"),
    },
    {
      title: "Active Bookings",
      value: stats?.activeBookings ?? 0,
      icon: BookOpen,
      bg: "bg-amber-50",
      text: "text-amber-600",
      action: () => router.push("/user/dashboard/bookings"),
    },
  ];

  const quickActions = [
    {
      label: "Plan New Event",
      description: "Create and manage your next event",
      icon: Calendar,
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => router.push("/user/dashboard/events/new"),
    },
    {
      label: "Find Vendors",
      description: "Browse and book event professionals",
      icon: Briefcase,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => router.push("/user/dashboard/vendors"),
    },
    {
      label: "AI Planner",
      description: "Get an AI-generated event plan",
      icon: Sparkles,
      color: "bg-indigo-600 hover:bg-indigo-700",
      onClick: () => router.push("/user/dashboard/ai-planner"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {displayName}!
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Here's an overview of your events and activity.
          </p>
        </div>
        <button
          onClick={() => router.push("/user/dashboard/events/new")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statsCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.title}
                  onClick={card.action}
                  className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{card.title}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${card.text}`} />
                    </div>
                  </div>
                </button>
              );
            })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`${action.color} text-white rounded-xl p-5 text-left transition-colors shadow-sm`}
            >
              <Icon className="w-8 h-8 mb-3 opacity-90" />
              <p className="font-semibold text-base">{action.label}</p>
              <p className="text-sm mt-1 opacity-80">{action.description}</p>
            </button>
          );
        })}
      </div>

      {/* Upcoming events + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming events */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
            <button
              onClick={() => router.push("/user/dashboard/events")}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {upcomingLoading ? (
              <div className="px-6 py-2">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonEventRow key={i} />)}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-600 font-medium">No upcoming events</p>
                <p className="text-gray-400 text-sm mt-1">Start planning your next event</p>
                <button
                  onClick={() => router.push("/user/dashboard/events/new")}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Create Event
                </button>
              </div>
            ) : (
              upcoming.map((event) => (
                <div
                  key={event._id}
                  onClick={() => router.push(`/user/dashboard/events/${event._id}`)}
                  className="flex items-center space-x-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{event.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatEventDate(event.date)}
                      </span>
                      {event.location?.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location.city}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="px-6 py-2">
            {activityLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonEventRow key={i} />)
            ) : activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">No recent activity yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {activity.map((item) => (
                  <li key={item.id} className="py-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(item.timestamp), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding CTA — shown only when user has zero events */}
      {!loading && (stats?.totalEvents ?? 0) === 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold mb-2">Start Planning Your First Event</h3>
            <p className="text-purple-100 text-sm mb-6">
              Use our AI planner or browse our vetted vendors to make your event unforgettable.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/user/dashboard/events/new")}
                className="px-4 py-2 bg-white text-purple-700 font-semibold text-sm rounded-lg hover:bg-purple-50 transition-colors"
              >
                Create an Event
              </button>
              <button
                onClick={() => router.push("/user/dashboard/ai-planner")}
                className="px-4 py-2 bg-purple-500 bg-opacity-40 border border-purple-300 text-white font-semibold text-sm rounded-lg hover:bg-opacity-60 transition-colors"
              >
                Try AI Planner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
