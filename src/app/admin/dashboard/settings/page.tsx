"use client";

import { useState, useEffect } from "react";
import {
  SystemSettings,
  SubscriptionTierConfig,
  FeatureFlag,
  SettingsUpdateRequest,
} from "@/types/system-settings";
import systemSettingsService from "@/services/admin/system-settings.service";
import {
  Settings,
  CreditCard,
  Mail,
  MessageSquare,
  Shield,
  Zap,
  Save,
  Loader2,
  TestTube,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

type TabType =
  | "general"
  | "payment"
  | "email"
  | "sms"
  | "security"
  | "features"
  | "tiers"
  | "flags";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTierConfig[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [testingGateway, setTestingGateway] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, tiersRes, flagsRes] = await Promise.all([
        systemSettingsService.getSettings(),
        systemSettingsService.getSubscriptionTiers(),
        systemSettingsService.getFeatureFlags(),
      ]);

      setSettings(settingsRes.settings);
      setTiers(tiersRes.tiers);
      setFlags(flagsRes.flags);
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (
    section: TabType,
    updates: Partial<any>
  ) => {
    if (!settings) return;

    try {
      setSaving(true);
      const request: SettingsUpdateRequest = {
        section: section as any,
        settings: updates,
      };

      const response = await systemSettingsService.updateSettings(request);
      setSettings(response.settings);
      toast.success(response.message || "Settings updated successfully");
    } catch (err: any) {
      console.error("Error updating settings:", err);
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestGateway = async (gateway: "flutterwave" | "paystack") => {
    try {
      setTestingGateway(gateway);
      const response = await systemSettingsService.testPaymentGateway(gateway);

      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (err: any) {
      console.error("Error testing gateway:", err);
      toast.error("Failed to test payment gateway");
    } finally {
      setTestingGateway(null);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "email", label: "Email", icon: Mail },
    { id: "sms", label: "SMS", icon: MessageSquare },
    { id: "security", label: "Security", icon: Shield },
    { id: "features", label: "Features", icon: Zap },
    { id: "tiers", label: "Subscription Tiers", icon: CreditCard },
    { id: "flags", label: "Feature Flags", icon: Zap },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure platform settings and features
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "general" && (
          <GeneralSettings
            settings={settings.general}
            onUpdate={(updates) => handleUpdateSettings("general", updates)}
            saving={saving}
          />
        )}

        {activeTab === "payment" && (
          <PaymentSettings
            settings={settings.payment}
            onUpdate={(updates) => handleUpdateSettings("payment", updates)}
            onTestGateway={handleTestGateway}
            saving={saving}
            testingGateway={testingGateway}
          />
        )}

        {activeTab === "email" && (
          <EmailSettings
            settings={settings.email}
            onUpdate={(updates) => handleUpdateSettings("email", updates)}
            saving={saving}
          />
        )}

        {activeTab === "sms" && (
          <SmsSettings
            settings={settings.sms}
            onUpdate={(updates) => handleUpdateSettings("sms", updates)}
            saving={saving}
          />
        )}

        {activeTab === "security" && (
          <SecuritySettings
            settings={settings.security}
            onUpdate={(updates) => handleUpdateSettings("security", updates)}
            saving={saving}
          />
        )}

        {activeTab === "features" && (
          <FeatureSettings
            settings={settings.features}
            onUpdate={(updates) => handleUpdateSettings("features", updates)}
            saving={saving}
          />
        )}

        {activeTab === "tiers" && (
          <SubscriptionTiers tiers={tiers} onRefresh={fetchSettings} />
        )}

        {activeTab === "flags" && (
          <FeatureFlagsManager flags={flags} onRefresh={fetchSettings} />
        )}
      </div>
    </div>
  );
}

// General Settings Component
function GeneralSettings({
  settings,
  onUpdate,
  saving,
}: {
  settings: any;
  onUpdate: (updates: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={formData.siteName || ""}
            onChange={(e) =>
              setFormData({ ...formData, siteName: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={formData.siteUrl || ""}
            onChange={(e) =>
              setFormData({ ...formData, siteUrl: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={formData.supportEmail || ""}
            onChange={(e) =>
              setFormData({ ...formData, supportEmail: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Phone
          </label>
          <input
            type="tel"
            value={formData.supportPhone || ""}
            onChange={(e) =>
              setFormData({ ...formData, supportPhone: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone || ""}
            onChange={(e) =>
              setFormData({ ...formData, timezone: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
            <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
            <option value="Africa/Johannesburg">
              Africa/Johannesburg (SAST)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={formData.currency || ""}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="NGN">NGN - Nigerian Naira</option>
            <option value="KES">KES - Kenyan Shilling</option>
            <option value="ZAR">ZAR - South African Rand</option>
            <option value="USD">USD - US Dollar</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={formData.maintenanceMode || false}
          onChange={(e) =>
            setFormData({ ...formData, maintenanceMode: e.target.checked })
          }
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <label htmlFor="maintenanceMode" className="text-sm text-gray-700">
          Enable Maintenance Mode
        </label>
      </div>

      {formData.maintenanceMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maintenance Message
          </label>
          <textarea
            value={formData.maintenanceMessage || ""}
            onChange={(e) =>
              setFormData({ ...formData, maintenanceMessage: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="We're currently performing maintenance. We'll be back soon!"
          />
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Payment Settings Component
function PaymentSettings({
  settings,
  onUpdate,
  onTestGateway,
  saving,
  testingGateway,
}: {
  settings: any;
  onUpdate: (updates: any) => void;
  onTestGateway: (gateway: "flutterwave" | "paystack") => void;
  saving: boolean;
  testingGateway: string | null;
}) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Flutterwave Settings */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Flutterwave</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.flutterwave?.enabled || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    flutterwave: {
                      ...formData.flutterwave,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Enabled</span>
            </label>
            <button
              type="button"
              onClick={() => onTestGateway("flutterwave")}
              disabled={testingGateway === "flutterwave"}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {testingGateway === "flutterwave" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              Test Connection
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public Key
            </label>
            <input
              type="text"
              value={formData.flutterwave?.publicKey || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  flutterwave: {
                    ...formData.flutterwave,
                    publicKey: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key
            </label>
            <input
              type="password"
              value={formData.flutterwave?.secretKey || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  flutterwave: {
                    ...formData.flutterwave,
                    secretKey: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Secret
            </label>
            <input
              type="password"
              value={formData.flutterwave?.webhookSecret || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  flutterwave: {
                    ...formData.flutterwave,
                    webhookSecret: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.flutterwave?.testMode || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    flutterwave: {
                      ...formData.flutterwave,
                      testMode: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Test Mode</span>
            </label>
          </div>
        </div>
      </div>

      {/* Paystack Settings */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Paystack</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.paystack?.enabled || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paystack: {
                      ...formData.paystack,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Enabled</span>
            </label>
            <button
              type="button"
              onClick={() => onTestGateway("paystack")}
              disabled={testingGateway === "paystack"}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {testingGateway === "paystack" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              Test Connection
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public Key
            </label>
            <input
              type="text"
              value={formData.paystack?.publicKey || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paystack: {
                    ...formData.paystack,
                    publicKey: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key
            </label>
            <input
              type="password"
              value={formData.paystack?.secretKey || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paystack: {
                    ...formData.paystack,
                    secretKey: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Secret
            </label>
            <input
              type="password"
              value={formData.paystack?.webhookSecret || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paystack: {
                    ...formData.paystack,
                    webhookSecret: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.paystack?.testMode || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paystack: {
                      ...formData.paystack,
                      testMode: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Test Mode</span>
            </label>
          </div>
        </div>
      </div>

      {/* General Payment Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          General Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Gateway
            </label>
            <select
              value={formData.defaultGateway || ""}
              onChange={(e) =>
                setFormData({ ...formData, defaultGateway: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="flutterwave">Flutterwave</option>
              <option value="paystack">Paystack</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Fee (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.serviceFeePercentage || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serviceFeePercentage: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Transaction Amount
            </label>
            <input
              type="number"
              value={formData.minimumTransactionAmount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimumTransactionAmount: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Transaction Amount
            </label>
            <input
              type="number"
              value={formData.maximumTransactionAmount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maximumTransactionAmount: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Email Settings Component
function EmailSettings({
  settings,
  onUpdate,
  saving,
}: {
  settings: any;
  onUpdate: (updates: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Provider
          </label>
          <select
            value={formData.provider || ""}
            onChange={(e) =>
              setFormData({ ...formData, provider: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">Amazon SES</option>
            <option value="smtp">SMTP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Email
          </label>
          <input
            type="email"
            value={formData.fromEmail || ""}
            onChange={(e) =>
              setFormData({ ...formData, fromEmail: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Name
          </label>
          <input
            type="text"
            value={formData.fromName || ""}
            onChange={(e) =>
              setFormData({ ...formData, fromName: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reply-To Email
          </label>
          <input
            type="email"
            value={formData.replyToEmail || ""}
            onChange={(e) =>
              setFormData({ ...formData, replyToEmail: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {formData.provider !== "smtp" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={formData.apiKey || ""}
              onChange={(e) =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}

        {formData.provider === "smtp" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={formData.smtp?.host || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, host: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={formData.smtp?.port || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    smtp: {
                      ...formData.smtp,
                      port: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Username
              </label>
              <input
                type="text"
                value={formData.smtp?.username || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, username: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Password
              </label>
              <input
                type="password"
                value={formData.smtp?.password || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, password: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.smtp?.secure || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, secure: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Use SSL/TLS</span>
              </label>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}

// SMS Settings Component
function SmsSettings({
  settings,
  onUpdate,
  saving,
}: {
  settings: any;
  onUpdate: (updates: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <input
          type="checkbox"
          id="smsEnabled"
          checked={formData.enabled || false}
          onChange={(e) =>
            setFormData({ ...formData, enabled: e.target.checked })
          }
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <label
          htmlFor="smsEnabled"
          className="text-sm font-medium text-gray-700"
        >
          Enable SMS Notifications
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMS Provider
          </label>
          <select
            value={formData.provider || ""}
            onChange={(e) =>
              setFormData({ ...formData, provider: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="twilio">Twilio</option>
            <option value="termii">Termii</option>
            <option value="africas_talking">Africa's Talking</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sender ID
          </label>
          <input
            type="text"
            value={formData.senderId || ""}
            onChange={(e) =>
              setFormData({ ...formData, senderId: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {formData.provider === "twilio" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account SID
              </label>
              <input
                type="text"
                value={formData.accountSid || ""}
                onChange={(e) =>
                  setFormData({ ...formData, accountSid: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auth Token
              </label>
              <input
                type="password"
                value={formData.authToken || ""}
                onChange={(e) =>
                  setFormData({ ...formData, authToken: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {(formData.provider === "termii" ||
          formData.provider === "africas_talking") && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={formData.apiKey || ""}
              onChange={(e) =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="flex items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.testMode || false}
              onChange={(e) =>
                setFormData({ ...formData, testMode: e.target.checked })
              }
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Test Mode</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Security Settings Component
function SecuritySettings({
  settings,
  onUpdate,
  saving,
}: {
  settings: any;
  onUpdate: (updates: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={formData.sessionTimeout || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                sessionTimeout: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            value={formData.maxLoginAttempts || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxLoginAttempts: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lockout Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.lockoutDuration || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                lockoutDuration: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Min Length
          </label>
          <input
            type="number"
            value={formData.passwordMinLength || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                passwordMinLength: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Expiry (days)
          </label>
          <input
            type="number"
            value={formData.passwordExpiryDays || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                passwordExpiryDays: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Password Requirements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.passwordRequireUppercase || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passwordRequireUppercase: e.target.checked,
                })
              }
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Require Uppercase</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.passwordRequireLowercase || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passwordRequireLowercase: e.target.checked,
                })
              }
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Require Lowercase</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.passwordRequireNumbers || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passwordRequireNumbers: e.target.checked,
                })
              }
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Require Numbers</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.passwordRequireSpecialChars || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passwordRequireSpecialChars: e.target.checked,
                })
              }
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              Require Special Characters
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.require2FA || false}
              onChange={(e) =>
                setFormData({ ...formData, require2FA: e.target.checked })
              }
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              Require 2FA for Admins
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Feature Settings Component
function FeatureSettings({
  settings,
  onUpdate,
  saving,
}: {
  settings: any;
  onUpdate: (updates: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const features = [
    { key: "aiEventPlanner", label: "AI Event Planner" },
    { key: "vendorBooking", label: "Vendor Booking" },
    { key: "guestManagement", label: "Guest Management" },
    { key: "budgetTracking", label: "Budget Tracking" },
    { key: "documentManagement", label: "Document Management" },
    { key: "teamCollaboration", label: "Team Collaboration" },
    { key: "mobileApp", label: "Mobile App" },
    { key: "apiAccess", label: "API Access" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <label
            key={feature.key}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={formData[feature.key] || false}
              onChange={(e) =>
                setFormData({ ...formData, [feature.key]: e.target.checked })
              }
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {feature.label}
            </span>
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Subscription Tiers Component
function SubscriptionTiers({
  tiers,
  onRefresh,
}: {
  tiers: SubscriptionTierConfig[];
  onRefresh: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState<SubscriptionTierConfig | null>(
    null
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Subscription Tiers
        </h3>
        <button
          onClick={() => {
            setEditingTier(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Add Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier._id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{tier.name}</h4>
                <p className="text-sm text-gray-500 capitalize">{tier.tier}</p>
              </div>
              {tier.popular && (
                <span className="px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-100 rounded">
                  Popular
                </span>
              )}
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {tier.currency} {tier.price.monthly}
                <span className="text-sm font-normal text-gray-500">
                  /month
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {tier.currency} {tier.price.yearly}/year
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{tier.description}</p>

            <div className="space-y-2 mb-4">
              <p className="text-sm font-semibold text-gray-700">Limits:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Events: {tier.limits.events || "Unlimited"}</li>
                <li>Guests: {tier.limits.guests || "Unlimited"}</li>
                <li>Vendors: {tier.limits.vendors || "Unlimited"}</li>
                <li>
                  Storage:{" "}
                  {tier.limits.storage
                    ? `${tier.limits.storage}MB`
                    : "Unlimited"}
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingTier(tier);
                  setShowModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Feature Flags Manager Component
function FeatureFlagsManager({
  flags,
  onRefresh,
}: {
  flags: FeatureFlag[];
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Feature Flags</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="w-5 h-5" />
          Add Flag
        </button>
      </div>

      <div className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag._id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {flag.name}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      flag.enabled
                        ? "text-green-600 bg-green-100"
                        : "text-gray-600 bg-gray-100"
                    }`}
                  >
                    {flag.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Key: {flag.key}</span>
                  <span>Rollout: {flag.rolloutPercentage}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
