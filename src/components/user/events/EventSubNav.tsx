"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import api from "@/api/api";

const TABS = [
  { label: "Overview", path: "" },
  { label: "Guests", path: "/guests" },
  { label: "Budget", path: "/budget" },
  { label: "Checklist", path: "/checklist" },
  { label: "Seating", path: "/seating" },
  { label: "Invitations", path: "/invitations" },
];

/** Event name and tabs across the client event screens */
export default function EventSubNav({ eventId, showTitle = true }: { eventId: string; showTitle?: boolean }) {
  const pathname = usePathname();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!showTitle) return;
    let active = true;
    api
      .get(`/events/${eventId}`)
      .then((res) => {
        const e = res.data.data?.event || res.data.event || res.data;
        if (active) setTitle(e?.title || e?.name || "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [eventId, showTitle]);

  const root = `/user/dashboard/events/${eventId}`;
  return (
    <div className="mb-6">
      <Link href="/user/dashboard/events" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-purple-700">
        <ArrowLeft className="w-4 h-4" /> My events
      </Link>
      {showTitle && title && <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{title}</h1>}
      <nav className="mt-3 flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => {
          const href = `${root}${tab.path}`;
          const active = tab.path ? pathname?.startsWith(href) : pathname === root;
          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
                active
                  ? "border-purple-600 text-purple-700 dark:text-purple-300"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
