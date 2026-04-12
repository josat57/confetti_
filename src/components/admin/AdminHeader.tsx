"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import NotificationSystem, { useNotifications } from "./NotificationSystem";
import {
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  } = useNotifications();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="ml-4 flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationSystem
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
            onDeleteAll={deleteAll}
          />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.username?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.username || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </button>

                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
