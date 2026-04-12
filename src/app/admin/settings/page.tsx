"use client";

import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Mail,
  CreditCard,
  Shield,
  Flag,
  Wrench,
  Save,
  Loader2,
  TestTube,
} from "lucide-react";
import settingsService, {
  SystemSettings,
} from "@/services/admin/settings.service";
import { toast } from "react-toastify";

type TabType =
  | "general"
  | "email"
  | "payment"
  | "security"
  | "features"
  | "maintenance";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      setSettings(response.settings);
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (category: keyof SystemSettings, data: any) => {
    try {
      setSaving(true);
      await settingsService.updateCategory(category, data);
      toast.success("Settings saved successfully");
      fetchSettings();
    } catch (err: any) {
      console.error("Error saving settings:", err);
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general" as TabType, label: "General", icon: SettingsIcon },
    { id: "email" as TabType, label: "Email", icon: Mail },
    { id: "payment" as TabType, label: "Payment", icon: CreditCard },
    { id: "security" as TabType, label: "Security", icon: Shield },
    { id: "features" as TabType, label: "Features", icon: Flag },
    { id: "maintenance" as TabType, label: "Maintenance", icon: Wrench },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <GeneralSettings
              settings={settings.general}
              onSave={(data) => handleSave("general", data)}
              saving={saving}
            />
          )}
          {activeTab === "email" && (
            <EmailSettings
              settings={settings.email}
              onSave={(data) => handleSave("email", data)}
              saving={saving}
            />
          )}
          {activeTab === "payment" && (
            <PaymentSettings
              settings={settings.payment}
              onSave={(data) => handleSave("payment", data)}
              saving={saving}
            />
          )}
          {activeTab === "security" && (
            <SecuritySettings
              settings={settings.security}
              onSave={(data) => handleSave("security", data)}
              saving={saving}
            />
          )}
          {activeTab === "features" && (
            <FeaturesSettings
              settings={settings.features}
              onSave={(data) => handleSave("features", data)}
              saving={saving}
            />
          )}
          {activeTab === "maintenance" && (
            <MaintenanceSettings
              settings={settings.maintenance}
              onSave={(data) => handleSave("maintenance", data)}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// General Settings Component
function GeneralSettings({
  settings,
  onSave,
  saving,
}: {
  settings: SystemSettings["general"];
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name *
          </label>
          <input
            type="text"
            required
            value={formData.siteName}
            onChange={(e) =>
              setFormData({ ...formData, siteName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Description
        </label>
        <textarea
          value={formData.siteDescription}
          onChange={(e) =>
            setFormData({ ...formData, siteDescription: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            required
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Email *
          </label>
          <input
            type="email"
            required
            value={formData.supportEmail}
            onChange={(e) =>
              setFormData({ ...formData, supportEmail: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Address
        </label>
        <textarea
          value={formData.companyAddress}
          onChange={(e) =>
            setFormData({ ...formData, companyAddress: e.target.value })
          }
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) =>
              setFormData({ ...formData, timezone: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) =>
              setFormData({ ...formData, language: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
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
  onSave,
  saving,
}: {
  settings: SystemSettings["email"];
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    try {
      setTesting(true);
      await settingsService.testEmailConfig(testEmail);
      toast.success("Test email sent successfully");
    } catch (err: any) {
      console.error("Error sending test email:", err);
      toast.error("Failed to send test email");
    } finally {
      setTesting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Provider
        </label>
        <select
          value={formData.provider}
          onChange={(e) =>
            setFormData({ ...formData, provider: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="smtp">SMTP</option>
          <option value="sendgrid">SendGrid</option>
          <option value="mailgun">Mailgun</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={formData.smtpHost}
            onChange={(e) =>
              setFormData({ ...formData, smtpHost: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={formData.smtpPort}
            onChange={(e) =>
              setFormData({ ...formData, smtpPort: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Username
          </label>
          <input
            type="text"
            value={formData.smtpUser}
            onChange={(e) =>
              setFormData({ ...formData, smtpUser: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Password
          </label>
          <input
            type="password"
            value={formData.smtpPassword}
            onChange={(e) =>
              setFormData({ ...formData, smtpPassword: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Email
          </label>
          <input
            type="email"
            value={formData.fromEmail}
            onChange={(e) =>
              setFormData({ ...formData, fromEmail: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Name
          </label>
          <input
            type="text"
            value={formData.fromName}
            onChange={(e) =>
              setFormData({ ...formData, fromName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Test Email Configuration
        </h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test email address"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
            Send Test
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Continue in next part...

// Payment Settings Component
function PaymentSettings({
  settings,
  onSave,
  saving,
}: {
  settings: SystemSettings["payment"];
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Currency
        </label>
        <select
          value={formData.currency}
          onChange={(e) =>
            setFormData({ ...formData, currency: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="NGN">NGN - Nigerian Naira</option>
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
        </select>
      </div>

      {/* Flutterwave */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Flutterwave</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.flutterwaveEnabled}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  flutterwaveEnabled: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Enabled</span>
          </label>
        </div>

        {formData.flutterwaveEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public Key
              </label>
              <input
                type="text"
                value={formData.flutterwavePublicKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    flutterwavePublicKey: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key
              </label>
              <input
                type="password"
                value={formData.flutterwaveSecretKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    flutterwaveSecretKey: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Paystack */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Paystack</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.paystackEnabled}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paystackEnabled: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Enabled</span>
          </label>
        </div>

        {formData.paystackEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public Key
              </label>
              <input
                type="text"
                value={formData.paystackPublicKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paystackPublicKey: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key
              </label>
              <input
                type="password"
                value={formData.paystackSecretKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paystackSecretKey: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
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
  onSave,
  saving,
}: {
  settings: SystemSettings["security"];
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-6"
    >
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Password Policy</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Length
          </label>
          <input
            type="number"
            min="6"
            max="32"
            value={formData.passwordMinLength}
            onChange={(e) =>
              setFormData({
                ...formData,
                passwordMinLength: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.passwordRequireUppercase}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passwordRequireUppercase: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              Require uppercase letters
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.passwordRequireLowercase}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passwordRequireLowercase: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              Require lowercase letters
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.passwordRequireNumbers}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passwordRequireNumbers: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Require numbers</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.passwordRequireSpecialChars}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passwordRequireSpecialChars: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              Require special characters
            </span>
          </label>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Session & Login</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="5"
            value={formData.sessionTimeout}
            onChange={(e) =>
              setFormData({
                ...formData,
                sessionTimeout: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            min="3"
            value={formData.maxLoginAttempts}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxLoginAttempts: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lockout Duration (minutes)
          </label>
          <input
            type="number"
            min="5"
            value={formData.lockoutDuration}
            onChange={(e) =>
              setFormData({
                ...formData,
                lockoutDuration: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.twoFactorEnabled}
            onChange={(e) =>
              setFormData({
                ...formData,
                twoFactorEnabled: e.target.checked,
              })
            }
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">
            Enable Two-Factor Authentication
          </span>
        </label>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Features Settings Component
function FeaturesSettings({
  settings,
  onSave,
  saving,
}: {
  settings: SystemSettings["features"];
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);

  const features = [
    {
      key: "userRegistration",
      label: "User Registration",
      description: "Allow new users to register",
    },
    {
      key: "emailVerification",
      label: "Email Verification",
      description: "Require email verification for new accounts",
    },
    {
      key: "socialLogin",
      label: "Social Login",
      description: "Enable login with social media accounts",
    },
    {
      key: "guestCheckout",
      label: "Guest Checkout",
      description: "Allow checkout without registration",
    },
    { key: "reviews", label: "Reviews", description: "Enable user reviews" },
    { key: "ratings", label: "Ratings", description: "Enable user ratings" },
    {
      key: "wishlist",
      label: "Wishlist",
      description: "Enable wishlist functionality",
    },
    {
      key: "notifications",
      label: "Notifications",
      description: "Enable push notifications",
    },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        {features.map((feature) => (
          <div
            key={feature.key}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {feature.label}
              </h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData[feature.key as keyof typeof formData]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [feature.key]: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Maintenance Settings Component
function MaintenanceSettings({
  settings,
  onSave,
  saving,
}: {
  settings: SystemSettings["maintenance"];
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(settings);
  const [newIP, setNewIP] = useState("");

  const addIP = () => {
    if (newIP && !formData.allowedIPs.includes(newIP)) {
      setFormData({
        ...formData,
        allowedIPs: [...formData.allowedIPs, newIP],
      });
      setNewIP("");
    }
  };

  const removeIP = (ip: string) => {
    setFormData({
      ...formData,
      allowedIPs: formData.allowedIPs.filter((i) => i !== ip),
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-6"
    >
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="w-5 h-5 text-yellow-600" />
          <h3 className="text-sm font-medium text-yellow-900">
            Maintenance Mode
          </h3>
        </div>
        <p className="text-sm text-yellow-700">
          When enabled, only allowed IP addresses can access the site. All other
          users will see the maintenance message.
        </p>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.enabled}
          onChange={(e) =>
            setFormData({ ...formData, enabled: e.target.checked })
          }
          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <span className="text-sm font-medium text-gray-900">
          Enable Maintenance Mode
        </span>
      </label>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maintenance Message
        </label>
        <textarea
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="We're currently performing maintenance. Please check back soon."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allowed IP Addresses
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={addIP}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {formData.allowedIPs.map((ip) => (
              <div
                key={ip}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-900">{ip}</span>
                <button
                  type="button"
                  onClick={() => removeIP(ip)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}
