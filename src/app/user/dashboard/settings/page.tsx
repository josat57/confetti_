"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  User, Bell, Lock, Globe, Shield, Loader2, Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import { settingsService } from "@/services/settings.service";
import api from "@/api/api";
import { toast } from "react-toastify";

type Tab = "profile" | "notifications" | "security" | "preferences";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "profile",       label: "Profile",       icon: User  },
  { id: "notifications", label: "Notifications", icon: Bell  },
  { id: "security",      label: "Security",      icon: Lock  },
  { id: "preferences",   label: "Preferences",   icon: Globe },
];

const inputCls = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const saveBtnCls = "flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-semibold rounded-xl transition-colors";

// ── Profile tab ────────────────────────────────────────────────────────────────
function ProfileTab({ user }: { user: any }) {
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName:  user?.lastName  || "",
    username:  user?.username  || "",
    email:     user?.email     || "",
    phone:     user?.phone     || "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/users/me", {
        firstName: form.firstName,
        lastName:  form.lastName,
        phone:     form.phone,
      });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>First Name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Last Name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Username</label>
          <input
            type="text"
            value={form.username}
            disabled
            className={`${inputCls} bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed`}
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Username cannot be changed</p>
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input
            type="tel"
            placeholder="+234..."
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Email</label>
          <input
            type="email"
            value={form.email}
            disabled
            className={`${inputCls} bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed`}
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Email changes require verification — contact support
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={saveBtnCls}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

// ── Notifications tab ──────────────────────────────────────────────────────────
function NotificationsTab({ user }: { user: any }) {
  const prefs = user?.preferences?.notifications || {};
  const [settings, setSettings] = useState({
    email: prefs.email ?? true,
    push:  prefs.push  ?? true,
    sms:   prefs.sms   ?? false,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await settingsService.updateNotifications(settings);
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  function Toggle({ label, description, value, onChange }: {
    label: string; description: string; value: boolean; onChange: (v: boolean) => void;
  }) {
    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : ""}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-1">
        <Toggle
          label="Email Notifications"
          description="Receive updates and reminders via email"
          value={settings.email}
          onChange={(v) => setSettings((p) => ({ ...p, email: v }))}
        />
        <Toggle
          label="Push Notifications"
          description="Get real-time alerts in your browser"
          value={settings.push}
          onChange={(v) => setSettings((p) => ({ ...p, push: v }))}
        />
        <Toggle
          label="SMS Notifications"
          description="Receive critical reminders by text message"
          value={settings.sms}
          onChange={(v) => setSettings((p) => ({ ...p, sms: v }))}
        />
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className={saveBtnCls}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save
        </button>
      </div>
    </div>
  );
}

// ── Security tab ───────────────────────────────────────────────────────────────
function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ cur: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      await settingsService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  function PasswordInput({ label, value, onChange, visible, onToggle, placeholder }: any) {
    return (
      <div>
        <label className={labelCls}>{label}</label>
        <div className="relative">
          <input
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${inputCls} pr-10`}
          />
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md">
      <PasswordInput
        label="Current Password"
        value={form.currentPassword}
        onChange={(v: string) => setForm((p) => ({ ...p, currentPassword: v }))}
        visible={show.cur}
        onToggle={() => setShow((p) => ({ ...p, cur: !p.cur }))}
        placeholder="Your current password"
      />
      <PasswordInput
        label="New Password"
        value={form.newPassword}
        onChange={(v: string) => setForm((p) => ({ ...p, newPassword: v }))}
        visible={show.new}
        onToggle={() => setShow((p) => ({ ...p, new: !p.new }))}
        placeholder="At least 8 characters"
      />
      <PasswordInput
        label="Confirm New Password"
        value={form.confirmPassword}
        onChange={(v: string) => setForm((p) => ({ ...p, confirmPassword: v }))}
        visible={show.confirm}
        onToggle={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
        placeholder="Repeat new password"
      />
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving || !form.currentPassword || !form.newPassword}
          className={saveBtnCls}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          Change Password
        </button>
      </div>
    </form>
  );
}

// ── Preferences tab ────────────────────────────────────────────────────────────
function PreferencesTab({ user }: { user: any }) {
  const [form, setForm] = useState({
    language: user?.preferences?.language || "en",
    currency: "NGN",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updatePreferences({ language: form.language, currency: form.currency });
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  const selectCls = `${inputCls} appearance-none`;

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-sm">
      <div>
        <label className={labelCls}>Language</label>
        <select
          value={form.language}
          onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
          className={selectCls}
        >
          <option value="en">English</option>
          <option value="yo">Yoruba</option>
          <option value="ig">Igbo</option>
          <option value="ha">Hausa</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Currency</label>
        <select
          value={form.currency}
          onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
          className={selectCls}
        >
          <option value="NGN">NGN — Nigerian Naira</option>
          <option value="USD">USD — US Dollar</option>
          <option value="GBP">GBP — British Pound</option>
        </select>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving} className={saveBtnCls}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save
        </button>
      </div>
    </form>
  );
}

// ── Main settings page ─────────────────────────────────────────────────────────
export default function UserSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account preferences and security
        </p>
      </div>

      <div className="flex bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Desktop tab list */}
        <nav className="hidden sm:flex flex-col w-52 border-r border-gray-100 dark:border-gray-700 py-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left ${
                  active
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-r-2 border-purple-600 dark:border-purple-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile tabs */}
        <div className="sm:hidden w-full border-b border-gray-100 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? "border-purple-600 dark:border-purple-400 text-purple-700 dark:text-purple-300"
                      : "border-transparent text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 p-6">
          {activeTab === "profile"       && <ProfileTab       user={user} />}
          {activeTab === "notifications" && <NotificationsTab user={user} />}
          {activeTab === "security"      && <SecurityTab />}
          {activeTab === "preferences"   && <PreferencesTab   user={user} />}
        </div>
      </div>
    </div>
  );
}
