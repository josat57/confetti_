"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  Calendar,
  Briefcase,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  User,
  BookOpen,
  MessageSquare,
  LifeBuoy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages, UnreadBadge } from "@/hooks/useUnreadMessages";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const navigation = [
  { name: "Dashboard",     href: "/user/dashboard",               icon: LayoutDashboard },
  { name: "My Events",     href: "/user/dashboard/events",        icon: Calendar },
  { name: "My Bookings",   href: "/user/dashboard/bookings",      icon: BookOpen },
  { name: "Find Vendors",  href: "/user/dashboard/vendors",       icon: Briefcase },
  { name: "Messages",      href: "/user/dashboard/messages",      icon: MessageSquare },
  { name: "AI Planner",    href: "/user/dashboard/ai-planner",    icon: Sparkles },
  { name: "Notifications", href: "/user/dashboard/notifications", icon: Bell },
  { name: "Help & support", href: "/user/dashboard/support",     icon: LifeBuoy },
  { name: "Settings",      href: "/user/dashboard/settings",      icon: Settings },
];

export default function UserSidebar({ isOpen, onClose, user }: UserSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const unreadMessages = useUnreadMessages();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            Confetti
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
          My Account
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/user/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                isActive
                  ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
              {item.href === "/user/dashboard/messages" && <UnreadBadge count={unreadMessages} />}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ""}`.trim()
                : user?.username || "User"}
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
