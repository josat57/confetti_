"use client";

import { useState } from "react";
import { Menu, Search, Sun, Moon } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useTheme } from "@/contexts/ThemeContext";

interface DashboardHeaderProps {
  user: any;
  onMenuClick: () => void;
}

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { resolvedTheme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Desktop search */}
          <form onSubmit={(e) => e.preventDefault()} className="hidden md:flex items-center gap-2">
            <div className="relative w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
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

          <NotificationDropdown />

          {/* Mobile avatar */}
          <div className="lg:hidden w-10 h-10 rounded-full bg-purple-600 dark:bg-purple-700 flex items-center justify-center text-white font-semibold">
            {user?.userName?.charAt(0).toUpperCase() || "V"}
          </div>
        </div>
      </div>
    </header>
  );
}
