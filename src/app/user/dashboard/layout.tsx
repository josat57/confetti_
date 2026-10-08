"use client";

import PlanLimitPrompt from "@/components/subscription/PlanLimitPrompt";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import UserSidebar from "@/components/user/layout/UserSidebar";
import UserHeader from "@/components/user/layout/UserHeader";
import UserMobileNav from "@/components/user/layout/UserMobileNav";
import AIChatWidget from "@/components/user/chat/AIChatWidget";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, verifyUser } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        const response = await verifyUser();

        if (!response?.userData) {
          router.push("/sign-in");
          return;
        }

        const roleDashboards: Record<string, string> = {
          vendor: "/vendor/dashboard",
          "event-planner": "/planner/dashboard",
          admin: "/admin/dashboard",
        };

        if (response.userData.role !== "user") {
          router.push(roleDashboards[response.userData.role] || "/");
          return;
        }

        setIsVerifying(false);
      } catch {
        router.push("/sign-in");
      }
    };

    if (isVerifying) {
      verifyAndRedirect();
    }
  }, [router, isVerifying, verifyUser]);

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-brand="purple">
      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="lg:pl-64">
        <UserHeader user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">{children}</main>
        <PlanLimitPrompt dashboard="user" />
      </div>

      <UserMobileNav />
      <AIChatWidget />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
