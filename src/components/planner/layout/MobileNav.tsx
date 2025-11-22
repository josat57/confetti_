"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  Settings,
} from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/planner/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Events",
      href: "/planner/dashboard/events",
      icon: Calendar,
    },
    {
      name: "Vendors",
      href: "/planner/dashboard/vendors",
      icon: Briefcase,
    },
    {
      name: "Clients",
      href: "/planner/dashboard/clients",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/planner/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center py-3 px-2 min-w-0 flex-1
                transition-colors duration-150
                ${
                  isActive
                    ? "text-teal-600"
                    : "text-gray-600 hover:text-teal-600"
                }
              `}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
