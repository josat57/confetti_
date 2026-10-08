"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  CheckSquare,
  UserCircle,
  Sparkles,
  BarChart3,
  MessageSquare,
  FileText,
  UsersRound,
  Bell,
  Settings,
  LogOut,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages, UnreadBadge } from "@/hooks/useUnreadMessages";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function DashboardSidebar({ isOpen, onClose, user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [subscriptionTier, setSubscriptionTier] = useState("starter");

  useEffect(() => {
    setSubscriptionTier("starter");
  }, [user]);

  const unreadMessages = useUnreadMessages();

  const navigation = [
    { name: "Dashboard",  href: "/planner/dashboard",            icon: LayoutDashboard, tier: "starter" },
    { name: "Events",     href: "/planner/dashboard/events",     icon: Calendar,        tier: "starter" },
    { name: "AI Planner", href: "/planner/dashboard/ai-planner", icon: Sparkles,        tier: "professional" },
    { name: "Vendors",    href: "/planner/dashboard/vendors",    icon: Briefcase,       tier: "starter" },
    { name: "Clients",    href: "/planner/dashboard/clients",    icon: UserCircle,      tier: "starter" },
    { name: "Budget",     href: "/planner/dashboard/budget",     icon: DollarSign,      tier: "starter" },
    { name: "Tasks",      href: "/planner/dashboard/tasks",      icon: CheckSquare,     tier: "starter" },
    { name: "Calendar",   href: "/planner/dashboard/calendar",   icon: Calendar,        tier: "professional" },
    { name: "Guests",     href: "/planner/dashboard/guests",     icon: Users,           tier: "starter" },
    { name: "Reports",    href: "/planner/dashboard/reports",    icon: BarChart3,       tier: "professional" },
    { name: "Messages",       href: "/planner/dashboard/messages",       icon: MessageSquare,   tier: "professional" },
    { name: "Documents",      href: "/planner/dashboard/documents",      icon: FileText,        tier: "starter" },
    { name: "Team",           href: "/planner/dashboard/team",           icon: UsersRound,      tier: "professional" },
    { name: "Notifications",  href: "/planner/dashboard/notifications",  icon: Bell,            tier: "starter" },
    { name: "Settings",       href: "/planner/dashboard/settings",       icon: Settings,        tier: "starter" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo & Tier Badge */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            Confetti
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
          {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/planner/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const isLocked = false;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => {
                if (isLocked) { e.preventDefault(); return; }
                onClose();
              }}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                isActive
                  ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
              } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="flex-1">{item.name}</span>
              {item.href === "/planner/dashboard/messages" && <UnreadBadge count={unreadMessages} className="bg-teal-600" />}
              {isLocked && <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ""}`.trim()
                : user?.name || "Event Planner"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600/75 dark:bg-gray-900/80 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 border-r border-transparent dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
