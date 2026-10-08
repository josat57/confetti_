"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  User,
  Image,
  Calendar,
  Users,
  Briefcase,
  UserCircle,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Lock,
  Bot,
  MessageSquare,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import TierBadge from "@/components/vendor/common/TierBadge";
import UpgradeModal from "@/components/vendor/common/UpgradeModal";
import { hasFeatureAccess } from "@/utils/subscriptionTier";
import { getUserSubscriptionTier } from "@/utils/getUserSubscriptionTier";
import api from "@/api/api";
import { useUnreadMessages, UnreadBadge } from "@/hooks/useUnreadMessages";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function DashboardSidebar({ isOpen, onClose, user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    featureName: string;
    requiredTier: string;
  }>({ isOpen: false, featureName: "", requiredTier: "" });
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user || user.role !== "vendor") {
        setLoadingSubscription(false);
        return;
      }
      try {
        const response = await api.get("/subscriptions/current");
        if (response.data?.data?.subscription) {
          setSubscriptionData(response.data.data.subscription);
        }
      } catch {
        // default to basic
      } finally {
        setLoadingSubscription(false);
      }
    };
    fetchSubscription();
  }, [user]);

  const unreadMessages = useUnreadMessages();

  // Which plan unlocks each page (basic = Listing, professional = Pro, business = Business).
  // Listing vendors can answer 5 enquiries a month, so leads, quotes and bookings stay open;
  // the API enforces the limits.
  const navigation = [
    { name: "Dashboard",  href: "/vendor/dashboard",            icon: LayoutDashboard, tier: "basic" },
    { name: "Profile",    href: "/vendor/dashboard/profile",    icon: User,            tier: "basic" },
    { name: "Events",     href: "/vendor/dashboard/events",     icon: Image,           tier: "basic" },
    { name: "Calendar",   href: "/vendor/dashboard/calendar",   icon: Calendar,        tier: "professional" },
    { name: "Leads",      href: "/vendor/dashboard/leads",      icon: Users,           tier: "basic" },
    { name: "Bookings",   href: "/vendor/dashboard/bookings",   icon: Briefcase,       tier: "basic" },
    { name: "Quotes",     href: "/vendor/dashboard/quotes",     icon: Briefcase,       tier: "basic" },
    { name: "Clients",    href: "/vendor/dashboard/clients",    icon: UserCircle,      tier: "professional" },
    { name: "Team",       href: "/vendor/dashboard/team",       icon: Users,           tier: "business" },
    { name: "Payments",   href: "/vendor/dashboard/payments",   icon: CreditCard,      tier: "professional" },
    { name: "Payouts",    href: "/vendor/dashboard/payouts",    icon: CreditCard,      tier: "basic" },
    { name: "AI Planner", href: "/vendor/dashboard/ai-planner", icon: Bot,             tier: "business" },
    { name: "Messages",       href: "/vendor/dashboard/messages",       icon: MessageSquare,   tier: "basic" },
    { name: "Analytics",      href: "/vendor/dashboard/analytics",      icon: BarChart3,       tier: "basic" },
    { name: "Notifications",  href: "/vendor/dashboard/notifications",  icon: Bell,            tier: "basic" },
    { name: "Settings",       href: "/vendor/dashboard/settings",       icon: Settings,        tier: "basic" },
  ];

  const userTier = subscriptionData?.planName
    ? getUserSubscriptionTier({ subscription: subscriptionData })
    : "basic";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo & Tier Badge */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            Confetti
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <TierBadge tier={userTier} size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/vendor/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const hasAccess = hasFeatureAccess(userTier, item.tier as any);

          if (!hasAccess) {
            return (
              <button
                key={item.name}
                onClick={() =>
                  setUpgradeModal({ isOpen: true, featureName: item.name, requiredTier: item.tier })
                }
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 w-full text-left text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                <Lock className="w-4 h-4" />
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onClose()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
              {item.href === "/vendor/dashboard/messages" && <UnreadBadge count={unreadMessages} />}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="w-10 h-10 rounded-full bg-purple-600 dark:bg-purple-700 flex items-center justify-center text-white font-semibold">
            {user?.userName?.charAt(0).toUpperCase() || "V"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.userName || "Vendor"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-gray-600/75 dark:bg-gray-900/80 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false, featureName: "", requiredTier: "" })}
        featureName={upgradeModal.featureName}
        requiredTier={upgradeModal.requiredTier}
        currentTier={userTier}
      />
    </>
  );
}
