"use client";

import PlanLimitPrompt from "@/components/subscription/PlanLimitPrompt";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import DashboardSidebar from "@/components/vendor/layout/DashboardSidebar";
import DashboardHeader from "@/components/vendor/layout/DashboardHeader";

export default function VendorDashboardLayout({
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

        // Check if user is a vendor
        if (response.userData.role !== "vendor") {
          router.push(`/${response.userData.role}/dashboard`);
          return;
        }

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
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-brand="purple">
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
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
        <PlanLimitPrompt dashboard="vendor" />
      </div>
    </div>
  );
}
