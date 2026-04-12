"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import securityService, {
  SecuritySettings,
  SecurityLog,
  SecurityAlert,
  SecurityMetrics,
} from "@/services/admin/security.service";

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "settings" | "logs" | "alerts" | "ips"
  >("overview");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<
    Array<{ ip: string; reason: string; blockedAt: string }>
  >([]);
  const [newIP, setNewIP] = useState("");
  const [ipReason, setIPReason] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview" || activeTab === "settings") {
        const [settingsData, metricsData] = await Promise.all([
          securityService.getSettings(),
          securityService.getMetrics(),
        ]);
        setSettings(settingsData.settings);
        setMetrics(metricsData.metrics);
      }

      if (activeTab === "logs") {
        const logsData = await securityService.getLogs({ limit: 50 });
        setLogs(logsData.logs);
      }

      if (activeTab === "alerts") {
        const alertsData = await securityService.getAlerts({ resolved: false });
        setAlerts(alertsData.alerts);
      }

      if (activeTab === "ips") {
        const ipsData = await securityService.getBlockedIPs();
        setBlockedIPs(ipsData.ips);
      }
    } catch (error: any) {
      console.error("Failed to load security data:", error);
      // Only show error toast if it's not a 404 (endpoint not implemented yet)
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (
    category: keyof SecuritySettings,
    updates: any
  ) => {
    try {
      const updatedSettings = {
        ...settings,
        [category]: { ...settings?.[category], ...updates },
      };
      const response = await securityService.updateSettings(updatedSettings);
      setSettings(response.settings);
      toast.success(response.message);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.info("Security settings endpoint not yet implemented");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update settings"
        );
      }
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await securityService.resolveAlert(alertId);
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.info("Alert resolution endpoint not yet implemented");
      } else {
        toast.error(error.response?.data?.message || "Failed to resolve alert");
      }
    }
  };

  const handleBlockIP = async () => {
    if (!newIP) {
      toast.error("Please enter an IP address");
      return;
    }
    try {
      const response = await securityService.blockIP(newIP, ipReason);
      toast.success(response.message);
      setNewIP("");
      setIPReason("");
      loadData();
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.info("IP blocking endpoint not yet implemented");
      } else {
        toast.error(error.response?.data?.message || "Failed to block IP");
      }
    }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      const response = await securityService.unblockIP(ip);
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.info("IP unblocking endpoint not yet implemented");
      } else {
        toast.error(error.response?.data?.message || "Failed to unblock IP");
      }
    }
  };

  const handleRunAudit = async () => {
    try {
      setLoading(true);
      const response = await securityService.runSecurityAudit();
      toast.success(response.message);
      loadData();
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.info("Security audit endpoint not yet implemented");
      } else {
        toast.error(error.response?.data?.message || "Failed to run audit");
      }
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Security & Compliance
        </h1>
        <p className="text-gray-600 mt-2">
          Manage security settings, monitor threats, and ensure compliance
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "settings", label: "Settings" },
            { id: "logs", label: "Security Logs" },
            { id: "alerts", label: "Alerts" },
            { id: "ips", label: "IP Management" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading && activeTab === "overview" ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading security data...</p>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === "overview" && metrics && (
            <div className="space-y-6">
              {/* Security Score */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Security Score</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`text-5xl font-bold ${getSecurityScoreColor(
                        metrics.securityScore || 85
                      )}`}
                    >
                      {metrics.securityScore || 85}
                    </div>
                    <p className="text-gray-600 mt-2">
                      Last audit:{" "}
                      {new Date(
                        metrics.lastSecurityAudit || new Date()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={handleRunAudit}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    Run Security Audit
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Failed Logins</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {metrics.failedLoginAttempts || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Blocked IPs</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {metrics.blockedIPs || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">
                        Suspicious Activities
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {metrics.suspiciousActivities || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Threats</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {metrics.activeThreats || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <>
              {!settings ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Password Policy */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Password Policy
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Length
                        </label>
                        <input
                          type="number"
                          value={settings.passwordPolicy.minLength}
                          onChange={(e) =>
                            handleUpdateSettings("passwordPolicy", {
                              minLength: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Expiry (days)
                        </label>
                        <input
                          type="number"
                          value={settings.passwordPolicy.expiryDays}
                          onChange={(e) =>
                            handleUpdateSettings("passwordPolicy", {
                              expiryDays: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {[
                        {
                          key: "requireUppercase",
                          label: "Require Uppercase Letters",
                        },
                        {
                          key: "requireLowercase",
                          label: "Require Lowercase Letters",
                        },
                        { key: "requireNumbers", label: "Require Numbers" },
                        {
                          key: "requireSpecialChars",
                          label: "Require Special Characters",
                        },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              settings.passwordPolicy[
                                item.key as keyof typeof settings.passwordPolicy
                              ] as boolean
                            }
                            onChange={(e) =>
                              handleUpdateSettings("passwordPolicy", {
                                [item.key]: e.target.checked,
                              })
                            }
                            className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Session Management */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Session Management
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          value={settings.sessionManagement.sessionTimeout}
                          onChange={(e) =>
                            handleUpdateSettings("sessionManagement", {
                              sessionTimeout: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Idle Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          value={settings.sessionManagement.idleTimeout}
                          onChange={(e) =>
                            handleUpdateSettings("sessionManagement", {
                              idleTimeout: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Concurrent Sessions
                        </label>
                        <input
                          type="number"
                          value={
                            settings.sessionManagement.maxConcurrentSessions
                          }
                          onChange={(e) =>
                            handleUpdateSettings("sessionManagement", {
                              maxConcurrentSessions: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remember Me Duration (days)
                        </label>
                        <input
                          type="number"
                          value={settings.sessionManagement.rememberMeDuration}
                          onChange={(e) =>
                            handleUpdateSettings("sessionManagement", {
                              rememberMeDuration: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Login Security */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Login Security
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          value={settings.loginSecurity.maxLoginAttempts}
                          onChange={(e) =>
                            handleUpdateSettings("loginSecurity", {
                              maxLoginAttempts: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lockout Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={settings.loginSecurity.lockoutDuration}
                          onChange={(e) =>
                            handleUpdateSettings("loginSecurity", {
                              lockoutDuration: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.loginSecurity.requireCaptcha}
                          onChange={(e) =>
                            handleUpdateSettings("loginSecurity", {
                              requireCaptcha: e.target.checked,
                            })
                          }
                          className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Require CAPTCHA
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.loginSecurity.twoFactorEnabled}
                          onChange={(e) =>
                            handleUpdateSettings("loginSecurity", {
                              twoFactorEnabled: e.target.checked,
                            })
                          }
                          className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Enable Two-Factor Authentication
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* API Security */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">API Security</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Requests Per Minute
                        </label>
                        <input
                          type="number"
                          value={settings.apiSecurity.requestsPerMinute}
                          onChange={(e) =>
                            handleUpdateSettings("apiSecurity", {
                              requestsPerMinute: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.apiSecurity.rateLimitEnabled}
                          onChange={(e) =>
                            handleUpdateSettings("apiSecurity", {
                              rateLimitEnabled: e.target.checked,
                            })
                          }
                          className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Enable Rate Limiting
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.apiSecurity.requireApiKey}
                          onChange={(e) =>
                            handleUpdateSettings("apiSecurity", {
                              requireApiKey: e.target.checked,
                            })
                          }
                          className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Require API Key
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Data Protection */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Data Protection
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data Retention (days)
                        </label>
                        <input
                          type="number"
                          value={settings.dataProtection.dataRetentionDays}
                          onChange={(e) =>
                            handleUpdateSettings("dataProtection", {
                              dataRetentionDays: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {[
                        {
                          key: "encryptionEnabled",
                          label: "Enable Encryption",
                        },
                        { key: "backupEncryption", label: "Encrypt Backups" },
                        { key: "gdprCompliant", label: "GDPR Compliant" },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              settings.dataProtection[
                                item.key as keyof typeof settings.dataProtection
                              ] as boolean
                            }
                            onChange={(e) =>
                              handleUpdateSettings("dataProtection", {
                                [item.key]: e.target.checked,
                              })
                            }
                            className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Security Logs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No security logs found
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.eventType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                                log.severity
                              )}`}
                            >
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.userName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.ipAddress}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {log.description}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  No active security alerts
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-sm text-gray-500">
                            {alert.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {alert.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          {alert.affectedUsers && (
                            <span>Affected Users: {alert.affectedUsers}</span>
                          )}
                        </div>
                      </div>
                      {!alert.resolved && (
                        <button
                          onClick={() => handleResolveAlert(alert._id)}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* IP Management Tab */}
          {activeTab === "ips" && (
            <div className="space-y-6">
              {/* Add IP Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Block IP Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IP Address
                    </label>
                    <input
                      type="text"
                      value={newIP}
                      onChange={(e) => setNewIP(e.target.value)}
                      placeholder="192.168.1.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={ipReason}
                      onChange={(e) => setIPReason(e.target.value)}
                      placeholder="Suspicious activity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleBlockIP}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Block IP
                </button>
              </div>

              {/* Blocked IPs List */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">
                    Blocked IP Addresses
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blocked At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {blockedIPs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No blocked IP addresses
                          </td>
                        </tr>
                      ) : (
                        blockedIPs.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.ip}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.reason}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(item.blockedAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleUnblockIP(item.ip)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Unblock
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
