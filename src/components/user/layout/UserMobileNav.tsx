"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Briefcase, BookOpen, Settings } from "lucide-react";

const navItems = [
  { name: "Home", href: "/user/dashboard", icon: LayoutDashboard },
  { name: "Events", href: "/user/dashboard/events", icon: Calendar },
  { name: "Bookings", href: "/user/dashboard/bookings", icon: BookOpen },
  { name: "Vendors", href: "/user/dashboard/vendors", icon: Briefcase },
  { name: "Settings", href: "/user/dashboard/settings", icon: Settings },
];

export default function UserMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/user/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-2 flex-1 transition-colors duration-150 ${
                isActive
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
