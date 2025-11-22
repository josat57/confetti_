"use client";

import Link from "next/link";
import { Plus, Calendar, Users, FileText } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      name: "New Event",
      href: "/vendor/dashboard/events/new",
      icon: Plus,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      name: "View Calendar",
      href: "/vendor/dashboard/calendar",
      icon: Calendar,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Manage Leads",
      href: "/vendor/dashboard/leads",
      icon: Users,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "Create Quote",
      href: "/vendor/dashboard/quotes/new",
      icon: FileText,
      color: "bg-yellow-600 hover:bg-yellow-700",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              href={action.href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg text-white transition-colors ${action.color}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium text-center">
                {action.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
