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
  Settings,
  LogOut,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function DashboardSidebar({
  isOpen,
  onClose,
  user,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [subscriptionTier, setSubscriptionTier] = useState("starter");

  // Fetch subscription tier (will be fully implemented in later phases)
  useEffect(() => {
    // Placeholder for subscription tier fetching
    setSubscriptionTier("starter");
  }, [user]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/planner/dashboard",
      icon: LayoutDashboard,
      tier: "starter",
    },
    {
      name: "Events",
      href: "/planner/dashboard/events",
      icon: Calendar,
      tier: "starter",
    },
    {
      name: "AI Planner",
      href: "/planner/dashboard/ai-planner",
      icon: Sparkles,
      tier: "professional",
    },
    {
      name: "Vendors",
      href: "/planner/dashboard/vendors",
      icon: Briefcase,
      tier: "starter",
    },
    {
      name: "Clients",
      href: "/planner/dashboard/clients",
      icon: UserCircle,
      tier: "starter",
    },
    {
      name: "Budget",
      href: "/planner/dashboard/budget",
      icon: DollarSign,
      tier: "starter",
    },
    {
      name: "Tasks",
      href: "/planner/dashboard/tasks",
      icon: CheckSquare,
      tier: "starter",
    },
    {
      name: "Calendar",
      href: "/planner/dashboard/calendar",
      icon: Calendar,
      tier: "professional",
    },
    {
      name: "Guests",
      href: "/planner/dashboard/guests",
      icon: Users,
      tier: "starter",
    },
    {
      name: "Reports",
      href: "/planner/dashboard/reports",
      icon: BarChart3,
      tier: "professional",
    },
    {
      name: "Messages",
      href: "/planner/dashboard/messages",
      icon: MessageSquare,
      tier: "professional",
    },
    {
      name: "Documents",
      href: "/planner/dashboard/documents",
      icon: FileText,
      tier: "starter",
    },
    {
      name: "Team",
      href: "/planner/dashboard/team",
      icon: UsersRound,
      tier: "professional",
    },
    {
      name: "Settings",
      href: "/planner/dashboard/settings",
      icon: Settings,
      tier: "starter",
    },
  ];

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo & Tier Badge */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="text-2xl font-bold text-teal-600">
            Confetti
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
          {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}{" "}
          Plan
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isLocked = false; // Will implement tier checking in later phases

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg
                transition-colors duration-150 ease-in-out
                ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-700 hover:bg-gray-100"
                }
                ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
              `}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                  // Will show upgrade modal in later phases
                }
              }}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="flex-1">{item.name}</span>
              {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-teal-600" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "Event Planner"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
