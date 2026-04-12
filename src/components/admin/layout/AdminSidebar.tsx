"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Flag,
  CreditCard,
  BarChart3,
  Headphones,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Bell,
  Tag,
  FileText,
  Database,
  Key,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Users", href: "/admin/dashboard/users" },
  { icon: ShieldCheck, label: "Vendors", href: "/admin/dashboard/vendors" },
  { icon: Flag, label: "Content Moderation", href: "/admin/dashboard/content" },
  {
    icon: CreditCard,
    label: "Subscriptions",
    href: "/admin/dashboard/subscriptions",
  },
  { icon: BarChart3, label: "Analytics", href: "/admin/dashboard/analytics" },
  {
    icon: Headphones,
    label: "Support Tickets",
    href: "/admin/dashboard/tickets",
  },
  {
    icon: Activity,
    label: "System Health",
    href: "/admin/dashboard/monitoring",
  },
  { icon: UserCog, label: "Admin Users", href: "/admin/dashboard/admins" },
  {
    icon: Bell,
    label: "Notifications",
    href: "/admin/dashboard/notifications",
  },
  { icon: Tag, label: "Coupons", href: "/admin/dashboard/coupons" },
  { icon: FileText, label: "Audit Logs", href: "/admin/dashboard/audit" },
  { icon: Database, label: "Backups", href: "/admin/dashboard/backups" },
  { icon: Key, label: "API & Integrations", href: "/admin/dashboard/api" },
  { icon: Flag, label: "Feature Flags", href: "/admin/dashboard/features" },
  { icon: Settings, label: "Settings", href: "/admin/dashboard/settings" },
];

export default function AdminSidebar({
  collapsed,
  onToggle,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-purple-700">
        {!collapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-purple-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-purple-700 text-white"
                  : "text-purple-100 hover:bg-purple-800"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
