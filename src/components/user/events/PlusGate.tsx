"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Loader2 } from "lucide-react";
import { eventPassService } from "@/services/event-pass.service";

/**
 * Shows the screen when the event's pass includes `feature` (Celebration Plus),
 * otherwise an upgrade card. Checked up front so the screen doesn't call a
 * locked API just to find out.
 */
export default function PlusGate({
  eventId,
  feature,
  title,
  description,
  children,
}: {
  eventId: string;
  feature: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<"loading" | "open" | "locked">("loading");

  useEffect(() => {
    let active = true;
    Promise.all([eventPassService.getPassForEvent(eventId), eventPassService.getCatalogue()])
      .then(([pass, catalogue]) => {
        const features = pass ? catalogue.find((p) => p.key === pass.tier)?.features || {} : {};
        if (active) setState(features[feature] ? "open" : "locked");
      })
      // If the check fails, let the screen load; the API still enforces the pass
      .catch(() => active && setState("open"));
    return () => {
      active = false;
    };
  }, [eventId, feature]);

  if (state === "loading") {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
      </div>
    );
  }
  if (state === "open") return <>{children}</>;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-xl mx-auto">
      <Crown className="w-10 h-10 text-amber-500 mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-gray-900">{title} comes with Celebration Plus</h2>
      <p className="text-sm text-gray-600 mt-2">{description}</p>
      <Link
        href={`/user/dashboard/events/${eventId}`}
        className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
      >
        Upgrade this event
      </Link>
    </div>
  );
}
