"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  FileText,
  MessageSquare,
  Activity,
  BarChart3,
  Store,
  Bell,
  Lock,
  DollarSign,
  X,
  ChevronDown,
  UserCheck,
  Flag,
  HelpCircle,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Mail,
  Package,
  Brain,
} from "lucide-react";

interface AdminSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  current?: boolean;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    current: true,
  },
  {
    name: "Authentication & Authorization",
    icon: Shield,
    children: [
      { name: "Admin Management", href: "/admin/auth/admins", icon: UserCheck },
      { name: "Role Management", href: "/admin/auth/roles", icon: Shield },
      { name: "Permissions", href: "/admin/auth/permissions", icon: Lock },
    ],
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Content Management",
    href: "/admin/content",
    icon: FileText,
  },
  {
    name: "System Configuration",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    name: "Moderation",
    icon: Flag,
    children: [
      {
        name: "Content Moderation",
        href: "/admin/moderation/content",
        icon: FileCheck,
      },
      {
        name: "Reports",
        href: "/admin/moderation/reports",
        icon: AlertTriangle,
      },
      {
        name: "Inappropriate Content",
        href: "/admin/moderation/inappropriate",
        icon: X,
      },
    ],
  },
  {
    name: "Support System",
    href: "/admin/support",
    icon: HelpCircle,
  },
  {
    name: "Audit & Logging",
    href: "/admin/audit",
    icon: Activity,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "AI Event Planner",
    href: "/admin/ai-planner",
    icon: Brain,
  },
  {
    name: "Vendor Management",
    href: "/admin/vendors",
    icon: Store,
  },
  {
    name: "Event Planners",
    href: "/admin/event-planners",
    icon: Users,
  },
  {
    name: "Billing & Subscriptions",
    icon: CreditCard,
    children: [
      {
        name: "Plans",
        href: "/admin/dashboard/plans",
        icon: Package,
      },
      {
        name: "Subscriptions",
        href: "/admin/dashboard/subscriptions",
        icon: CreditCard,
      },
      {
        name: "Escrow & Commission",
        href: "/admin/dashboard/escrow",
        icon: CreditCard,
      },
    ],
  },
  {
    name: "Communication",
    icon: Mail,
    children: [
      {
        name: "Announcements",
        href: "/admin/communication/announcements",
        icon: Bell,
      },
      {
        name: "Notifications",
        href: "/admin/communication/notifications",
        icon: Mail,
      },
    ],
  },
  {
    name: "Security & Compliance",
    href: "/admin/security",
    icon: Lock,
  },
  {
    name: "Financial Oversight",
    icon: DollarSign,
    children: [
      {
        name: "Financial Reports",
        href: "/admin/financial/reports",
        icon: FileText,
      },
      {
        name: "Transactions",
        href: "/admin/financial/transactions",
        icon: CreditCard,
      },
      {
        name: "Revenue Stats",
        href: "/admin/financial/revenue",
        icon: TrendingUp,
      },
    ],
  },
];

export default function AdminSidebar({ open, setOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Confetti Admin
              </span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isExpanded = expandedItems.includes(item.name);
              const hasChildren = item.children && item.children.length > 0;

              if (hasChildren) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isExpanded
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                      <ChevronDown
                        className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-8 mt-1 space-y-1"
                        >
                          {item.children!.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href || "#"}
                              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                isActive(child.href || "")
                                  ? "bg-purple-100 text-purple-700"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                              {child.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive(item.href || "")
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.username?.charAt(0).toUpperCase() || "A"}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.username || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
