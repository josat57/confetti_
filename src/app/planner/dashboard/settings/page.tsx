"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Globe,
  CreditCard,
  Palette,
  Download,
  Trash2,
  Shield,
} from "lucide-react";
import ProfileSettings from "@/components/planner/settings/ProfileSettings";
import NotificationPreferences from "@/components/planner/settings/NotificationPreferences";
import GeneralPreferences from "@/components/planner/settings/GeneralPreferences";
import SubscriptionManagement from "@/components/planner/settings/SubscriptionManagement";
import CustomBranding from "@/components/planner/settings/CustomBranding";
import DataExport from "@/components/planner/settings/DataExport";
import AccountDeletion from "@/components/planner/settings/AccountDeletion";
import SecuritySettings from "@/components/planner/settings/SecuritySettings";

type SettingsTab =
  | "profile"
  | "notifications"
  | "security"
  | "preferences"
  | "subscription"
  | "branding"
  | "data"
  | "account";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabs = [
    { id: "profile" as SettingsTab, label: "Profile", icon: User },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { id: "security" as SettingsTab, label: "Security", icon: Shield },
    { id: "preferences" as SettingsTab, label: "Preferences", icon: Globe },
    {
      id: "subscription" as SettingsTab,
      label: "Subscription",
      icon: CreditCard,
    },
    { id: "branding" as SettingsTab, label: "Branding", icon: Palette },
    { id: "data" as SettingsTab, label: "Data Export", icon: Download },
    { id: "account" as SettingsTab, label: "Account", icon: Trash2 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "notifications" && <NotificationPreferences />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "preferences" && <GeneralPreferences />}
          {activeTab === "subscription" && <SubscriptionManagement />}
          {activeTab === "branding" && <CustomBranding />}
          {activeTab === "data" && <DataExport />}
          {activeTab === "account" && <AccountDeletion />}
        </div>
      </div>
    </div>
  );
}
