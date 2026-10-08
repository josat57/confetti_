"use client";

import PlanLimitPrompt from "@/components/subscription/PlanLimitPrompt";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import DashboardSidebar from "@/components/planner/layout/DashboardSidebar";
import DashboardHeader from "@/components/planner/layout/DashboardHeader";
import MobileNav from "@/components/planner/layout/MobileNav";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PlannerDashboardLayout({
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

        // Check if user is an event planner
        if (response.userData.role !== "event-planner") {
          // Redirect to appropriate dashboard based on role
          const roleDashboards: Record<string, string> = {
            vendor: "/vendor/dashboard",
            admin: "/admin",
            user: "/user/dashboard",
          };

          const dashboardPath = roleDashboards[response.userData.role] || "/";
          router.push(dashboardPath);
          return;
        }

        // Verify subscription tier (will be fully implemented in later phases)
        // For now, just allow access
        setIsVerifying(false);
      } catch (error) {
        console.error("Verification failed:", error);
        router.push("/sign-in");
      }
    };

    if (isVerifying) {
      verifyAndRedirect();
    }
  }, [router, isVerifying, verifyUser]);

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-gray-600">Loading planner dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-brand="teal">
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">{children}</main>
        <PlanLimitPrompt dashboard="planner" />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
