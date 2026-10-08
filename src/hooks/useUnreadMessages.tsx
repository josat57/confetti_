"use client";

import { useEffect, useState } from "react";
import { messagingService } from "@/services/messaging.service";
import { MESSAGES_CHANGED_EVENT } from "@/components/messages/MessagesInbox";

const POLL_MS = 30_000;

/** Unread message count for nav badges; refreshes on an interval, on focus and after reading. */
export function useUnreadMessages(enabled = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      messagingService
        .getUnreadCount()
        .then((n) => active && setCount(n))
        .catch(() => {});
    };
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    window.addEventListener(MESSAGES_CHANGED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener(MESSAGES_CHANGED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [enabled]);

  return count;
}

export function UnreadBadge({ count, className = "bg-purple-600" }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span className={`ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-white text-[11px] font-bold flex items-center justify-center ${className}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
