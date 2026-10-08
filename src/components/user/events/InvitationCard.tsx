"use client";

import type { InvitationDesign } from "@/services/client-event.service";

const THEMES: Record<string, { background: string; text: string; border: string }> = {
  classic: { background: "#fdfbf7", text: "#1f2937", border: "#d6c7a1" },
  floral: { background: "#fff5f7", text: "#4a2c38", border: "#f4b6c8" },
  modern: { background: "#f8fafc", text: "#0f172a", border: "#cbd5e1" },
  festive: { background: "#fff8e6", text: "#3b2a07", border: "#f5c451" },
  elegant: { background: "#111827", text: "#f9fafb", border: "#a78bfa" },
};

export const INVITATION_THEMES = Object.keys(THEMES);

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

/** An invitation as guests see it (designer preview and the public RSVP page) */
export default function InvitationCard({
  design,
  guestName,
  children,
}: {
  design: InvitationDesign;
  guestName?: string;
  children?: React.ReactNode;
}) {
  const theme = THEMES[design.theme] || THEMES.classic;
  return (
    <div
      className="rounded-2xl border-2 p-6 sm:p-10 text-center shadow-sm"
      style={{ background: theme.background, color: theme.text, borderColor: theme.border, fontFamily: "Georgia, serif" }}
    >
      {guestName && <p className="text-xs sm:text-sm tracking-[0.2em] uppercase mb-2">Dear {guestName}</p>}
      {design.hosts && <p className="text-sm sm:text-base mb-3">{design.hosts} invite you to</p>}
      <h2 className="text-2xl sm:text-4xl font-bold mb-4 break-words" style={{ color: design.accentColor }}>
        {design.title}
      </h2>
      {design.startDate && <p className="text-sm sm:text-base">{formatDate(design.startDate)}</p>}
      {(design.venueText || design.venue) && <p className="text-sm sm:text-base mt-1">{design.venueText || design.venue}</p>}
      {design.message && <p className="mt-5 text-sm sm:text-base leading-relaxed whitespace-pre-line">{design.message}</p>}
      {design.dressCode && <p className="mt-4 text-xs sm:text-sm">Dress code: {design.dressCode}</p>}
      {design.rsvpDeadline && (
        <p className="mt-4 text-xs sm:text-sm opacity-80">Kindly reply by {new Date(design.rsvpDeadline).toDateString()}</p>
      )}
      {children}
    </div>
  );
}
