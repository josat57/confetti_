"use client";

import { Menu, Search } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

interface DashboardHeaderProps {
  user: any;
  onMenuClick: () => void;
}

export default function DashboardHeader({
  user,
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg w-64 lg:w-96">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Avatar (Mobile) */}
          <div className="lg:hidden w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
            {user?.userName?.charAt(0).toUpperCase() || "V"}
          </div>
        </div>
      </div>
    </header>
  );
}
