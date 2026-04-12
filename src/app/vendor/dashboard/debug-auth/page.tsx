"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import api from "@/api/api";

export default function DebugAuthPage() {
  const { user } = useAuth();
  const [apiTest, setApiTest] = useState<any>(null);
  const [cookies, setCookies] = useState<string>("");

  useEffect(() => {
    // Get cookies
    setCookies(document.cookie);

    // Test API call
    const testApi = async () => {
      try {
        const response = await api.get("/vendors/leads", {
          params: { page: 1, limit: 10 },
        });
        setApiTest({ success: true, data: response.data });
      } catch (error: any) {
        setApiTest({
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status,
        });
      }
    };

    testApi();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>

      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Cookies</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {cookies || "No cookies found"}
          </pre>
        </div>

        {/* API Test */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">API Test Result</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(apiTest, null, 2)}
          </pre>
        </div>

        {/* Environment */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(
              {
                API_URL: process.env.NEXT_PUBLIC_API_URL,
                NODE_ENV: process.env.NODE_ENV,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
