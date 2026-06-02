"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";

export default function APITestPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1";

  const tests = [
    {
      name: "Backend Health Check",
      url: `${apiUrl.replace("/api/v1", "")}/health`,
      method: "GET",
    },
    {
      name: "Subscription Plans (Public)",
      url: `${apiUrl}/subscription-plans`,
      method: "GET",
    },
    {
      name: "Auth Verify (Should 401)",
      url: `${apiUrl}/auth/verify`,
      method: "GET",
      expectedStatus: 401,
    },
  ];

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    const testResults: any[] = [];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        const response = await fetch(test.url, {
          method: test.method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const endTime = Date.now();
        const duration = endTime - startTime;

        const expectedStatus = test.expectedStatus || 200;
        const success = response.status === expectedStatus;

        let data;
        try {
          data = await response.json();
        } catch {
          data = await response.text();
        }

        testResults.push({
          name: test.name,
          url: test.url,
          status: response.status,
          success,
          duration,
          data: typeof data === "string" ? data : JSON.stringify(data, null, 2),
        });
      } catch (error: any) {
        testResults.push({
          name: test.name,
          url: test.url,
          status: "ERROR",
          success: false,
          duration: 0,
          error: error.message,
        });
      }
      setResults([...testResults]);
    }

    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            API Connection Test
          </h1>
          <p className="text-gray-600 mb-4">
            Testing connection to backend at:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">{apiUrl}</code>
          </p>
          <button
            onClick={runTests}
            disabled={testing}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Run Tests
              </>
            )}
          </button>
        </div>

        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Environment Info
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex gap-2">
              <span className="text-gray-600">API URL:</span>
              <span className="text-gray-900">{apiUrl}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600">Node ENV:</span>
              <span className="text-gray-900">{process.env.NODE_ENV}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600">Browser:</span>
              <span className="text-gray-900">
                {typeof window !== "undefined" ? navigator.userAgent : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                  result.success ? "border-green-200" : "border-red-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {result.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-mono">
                        {result.url}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        result.success ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Status: {result.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.duration}ms
                    </div>
                  </div>
                </div>

                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      Error:
                    </p>
                    <p className="text-sm text-red-700 font-mono">
                      {result.error}
                    </p>
                  </div>
                )}

                {result.data && (
                  <div className="bg-gray-50 rounded p-4 overflow-x-auto">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Response:
                    </p>
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                      {result.data.length > 500
                        ? result.data.substring(0, 500) + "..."
                        : result.data}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {results.length === 0 && !testing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              How to use this page:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Click "Run Tests" to check backend connectivity</li>
              <li>Review the results to identify connection issues</li>
              <li>
                Check if Docker containers are running:{" "}
                <code className="bg-blue-100 px-2 py-1 rounded">docker ps</code>
              </li>
              <li>
                Verify backend logs:{" "}
                <code className="bg-blue-100 px-2 py-1 rounded">
                  docker logs confetti-node-api
                </code>
              </li>
              <li>Ensure .env.local has correct NEXT_PUBLIC_API_URL</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
