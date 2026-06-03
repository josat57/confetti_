"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Shield,
  Save,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Key,
  Calendar,
  Activity,
} from "lucide-react";
import { toast } from "react-toastify";
import profileService, { AdminProfile } from "@/services/admin/profile.service";

type TabType = "profile" | "security" | "2fa";

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "profile", label: "Personal Info", icon: User },
    { id: "security", label: "Change Password", icon: Lock },
    { id: "2fa", label: "Two-Factor Auth", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to load profile
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold text-white select-none">
            {profile.firstName?.charAt(0)?.toUpperCase() ||
              profile.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-gray-500">{profile.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                {profile.role.replace("_", " ")}
              </span>
              {profile.twoFactorEnabled && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Shield className="w-3 h-3" />
                  2FA Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Account meta row */}
        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              Member since{" "}
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4 text-gray-400" />
            <span>
              Last login:{" "}
              {profile.lastLogin
                ? new Date(profile.lastLogin).toLocaleString()
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Key className="w-4 h-4 text-gray-400" />
            <span>{profile.permissions?.length ?? 0} permissions</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
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
          {activeTab === "profile" && (
            <PersonalInfoForm
              profile={profile}
              onSaved={(updated) => setProfile({ ...profile, ...updated })}
            />
          )}
          {activeTab === "security" && (
            <ChangePasswordForm adminId={profile.id} />
          )}
          {activeTab === "2fa" && (
            <TwoFactorSection
              adminId={profile.id}
              enabled={profile.twoFactorEnabled ?? false}
              onToggled={(enabled) =>
                setProfile({ ...profile, twoFactorEnabled: enabled })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Personal Info Form
───────────────────────────────────────────────────────────────────────── */
function PersonalInfoForm({
  profile,
  onSaved,
}: {
  profile: AdminProfile;
  onSaved: (updated: Partial<AdminProfile>) => void;
}) {
  const [formData, setFormData] = useState({
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    email: profile.email ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.email.trim()) {
      toast.error("First name and email are required");
      return;
    }
    try {
      setSaving(true);
      const updated = await profileService.updateProfile(profile.id, formData);
      onSaved(updated);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <h2 className="text-lg font-semibold text-gray-900">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
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

/* ─────────────────────────────────────────────────────────────────────────
   Change Password Form
───────────────────────────────────────────────────────────────────────── */
function ChangePasswordForm({ adminId }: { adminId: string }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(formData.newPassword);
  const strengthLabel = ["", "Very weak", "Weak", "Fair", "Strong", "Very strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-blue-500", "bg-green-500"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    try {
      setSaving(true);
      await profileService.changePassword(
        adminId,
        formData.currentPassword,
        formData.newPassword
      );
      toast.success("Password changed successfully");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  const Field = ({
    label,
    field,
    showKey,
  }: {
    label: string;
    field: keyof typeof formData;
    showKey: keyof typeof show;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={show[showKey] ? "text" : "password"}
          required
          value={formData[field]}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="button"
          onClick={() => setShow({ ...show, [showKey]: !show[showKey] })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>

      <Field label="Current Password" field="currentPassword" showKey="current" />
      <Field label="New Password" field="newPassword" showKey="next" />

      {/* Strength meter */}
      {formData.newPassword && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : "bg-gray-200"}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Strength: <span className="font-medium">{strengthLabel}</span>
          </p>
        </div>
      )}

      <Field label="Confirm New Password" field="confirmPassword" showKey="confirm" />

      {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          Passwords do not match
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        Password must be at least 8 characters. Use a mix of uppercase, lowercase, numbers, and symbols for a stronger password.
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || formData.newPassword !== formData.confirmPassword}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Update Password
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Two-Factor Authentication Section
───────────────────────────────────────────────────────────────────────── */
function TwoFactorSection({
  adminId,
  enabled,
  onToggled,
}: {
  adminId: string;
  enabled: boolean;
  onToggled: (enabled: boolean) => void;
}) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [setupStarted, setSetupStarted] = useState(false);

  const startSetup = async () => {
    try {
      setLoading(true);
      const result = await profileService.setup2FA(adminId);
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setSetupStarted(true);
    } catch {
      toast.error("Failed to start 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = async () => {
    if (token.length !== 6) {
      toast.error("Please enter the 6-digit code from your authenticator app");
      return;
    }
    try {
      setVerifying(true);
      await profileService.verify2FA(adminId, token);
      toast.success("Two-factor authentication enabled successfully");
      onToggled(true);
      setSetupStarted(false);
      setQrCode(null);
      setSecret(null);
      setToken("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Invalid code — please try again");
    } finally {
      setVerifying(false);
    }
  };

  if (enabled) {
    return (
      <div className="max-w-lg space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Two-Factor Authentication
        </h2>
        <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-900">
              2FA is active on your account
            </p>
            <p className="text-sm text-green-700 mt-1">
              Your account is protected with an authenticator app. Each login
              requires a 6-digit code in addition to your password.
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          To disable 2FA or switch authenticator apps, contact a fellow super
          admin or use account recovery.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Two-Factor Authentication
      </h2>

      {!setupStarted ? (
        <>
          <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">
                2FA is not enabled
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                We strongly recommend enabling two-factor authentication to add
                an extra layer of security to your admin account.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">
              How it works
            </h3>
            {[
              "Install an authenticator app (Google Authenticator, Authy, etc.)",
              "Scan the QR code shown in the next step",
              "Enter the 6-digit code to confirm setup",
              "Every future login will require your authenticator code",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600">{step}</p>
              </div>
            ))}
          </div>

          <button
            onClick={startSetup}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Enable Two-Factor Authentication
          </button>
        </>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Scan the QR code below with your authenticator app, then enter the
            6-digit code to confirm.
          </p>

          {qrCode && (
            <div className="flex justify-center">
              <img
                src={qrCode}
                alt="2FA QR Code"
                className="w-48 h-48 border border-gray-200 rounded-lg"
              />
            </div>
          )}

          {secret && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">
                Can't scan? Enter this code manually:
              </p>
              <code className="text-sm font-mono font-bold text-gray-900 break-all">
                {secret}
              </code>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={confirmSetup}
              disabled={verifying || token.length !== 6}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {verifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Verify & Activate
            </button>
            <button
              type="button"
              onClick={() => {
                setSetupStarted(false);
                setQrCode(null);
                setSecret(null);
                setToken("");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
