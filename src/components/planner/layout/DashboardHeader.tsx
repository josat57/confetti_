"use client";

import { useState } from "react";
import { Menu, Search, Bell, UserCircle, Sun, Moon } from "lucide-react";
import { notificationsService } from "@/services/notifications.service";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";

interface DashboardHeaderProps {
  user: any;
  onMenuClick: () => void;
}

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const { resolvedTheme, toggle } = useTheme();

  useEffect(() => {
    notificationsService.getUnreadCount().then(setUnreadCount).catch(() => {});
  }, []);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.name || "Event Planner";

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Search */}
        <form onSubmit={(e) => e.preventDefault()} className="hidden md:flex flex-1 max-w-2xl mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events, clients, vendors, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>
        </form>

        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Event Planner</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <UserCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
      </div>
    </header>
  );
}
