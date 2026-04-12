"use client";

import { useState } from "react";
import { AdminUserView, UserActivityRecord } from "@/types/user-admin";
import UserList from "@/components/admin/users/UserList";
import UserProfile from "@/components/admin/users/UserProfile";
import { Users } from "lucide-react";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);

  // Mock data - will be replaced with API calls
  const [users] = useState<AdminUserView[]>([
    {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+234 801 234 5678",
      role: "event-planner",
      status: "active",
      subscriptionTier: "professional",
      registrationDate: new Date("2024-01-15"),
      lastLogin: new Date("2024-11-25"),
      eventsCreated: 12,
      bookingsMade: 0,
      totalSpent: 250000,
    },
    {
      _id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+234 802 345 6789",
      role: "vendor",
      status: "active",
      subscriptionTier: "business",
      registrationDate: new Date("2024-02-20"),
      lastLogin: new Date("2024-11-24"),
      eventsCreated: 0,
      bookingsMade: 45,
      totalSpent: 0,
    },
    {
      _id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+234 803 456 7890",
      role: "event-planner",
      status: "suspended",
      subscriptionTier: "starter",
      registrationDate: new Date("2024-03-10"),
      lastLogin: new Date("2024-11-20"),
      eventsCreated: 3,
      bookingsMade: 0,
      totalSpent: 50000,
    },
  ]);

  const [activities] = useState<UserActivityRecord[]>([
    {
      _id: "1",
      action: "login",
      description: "Logged in from Chrome on Windows",
      ipAddress: "192.168.1.1",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      _id: "2",
      action: "event_created",
      description: "Created new event: Summer Wedding",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      _id: "3",
      action: "profile_updated",
      description: "Updated profile information",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ]);

  const handleSuspend = (userId: string) => {
    if (confirm("Are you sure you want to suspend this user?")) {
      console.log("Suspending user:", userId);
      // API call to suspend user
    }
  };

  const handleDelete = (userId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      console.log("Deleting user:", userId);
      // API call to delete user
    }
  };

  const handleUpdate = (data: Partial<AdminUserView>) => {
    console.log("Updating user:", data);
    // API call to update user
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all platform users</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-lg">
          <Users className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-900">
            {users.length} Total Users
          </span>
        </div>
      </div>

      {/* User List */}
      <UserList
        users={users}
        onUserSelect={setSelectedUser}
        onSuspend={handleSuspend}
        onDelete={handleDelete}
      />

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfile
          user={selectedUser}
          activities={activities}
          onClose={() => setSelectedUser(null)}
          onUpdate={handleUpdate}
          onSuspend={() => {
            handleSuspend(selectedUser._id);
            setSelectedUser(null);
          }}
          onDelete={() => {
            handleDelete(selectedUser._id);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
