'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Settings,
  Filter,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}

export default function NotificationSystem({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 mt-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filter === 'all'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filter === 'unread'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filter === 'read'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Read ({notifications.filter(n => n.read).length})
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-3 border-b border-gray-200 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notification Settings</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={onMarkAllAsRead}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={onDeleteAll}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                        !notification.read ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.timestamp)}
                            </p>
                            {notification.action && (
                              <button
                                onClick={notification.action.onClick}
                                className="text-xs text-purple-600 hover:text-purple-700 mt-2"
                              >
                                {notification.action.label}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              title="Mark as read"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(notification.id)}
                            className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete notification"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Showing {filteredNotifications.length} of {notifications.length}
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    View all
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
    toast.info(notification.message);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  };
} 