"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, verifyUser } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        const response = await verifyUser();
        if (!response?.userData) {
          router.push("/sign-in");
          return;
        }

        // Check if user has access to this dashboard
        const currentPath = window.location.pathname;
        const pathRole = currentPath.split("/")[1];

        if (response.userData.role !== pathRole) {
          router.push(`/${response.userData.role}/dashboard`);
          return;
        }

        setIsVerifying(false);
      } catch (error) {
        console.error("Verification failed:", error);
        router.push("/sign-in");
      }
    };

    // Only run verification once when component mounts
    if (isVerifying) {
      verifyAndRedirect();
    }
  }, [router, isVerifying]); // Removed verifyUser from dependencies

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by the useEffect
  }

  return <>{children}</>;
}
