"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/plan-event");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading event planner...</p>
      </div>
    </div>
  );
}
