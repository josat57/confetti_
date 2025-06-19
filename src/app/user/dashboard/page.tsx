'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Users, Bell, Settings, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserDashboard() {
  const { user, loading, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.userName || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Connections</h2>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Bell className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center">No recent activity</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </button>
          <button 
            onClick={() => logout()}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </main>
    </div>
  );
} 