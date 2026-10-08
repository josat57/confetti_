"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Crown, Loader2, Mail, Send } from "lucide-react";
import { toast } from "react-toastify";
import EventSubNav from "@/components/user/events/EventSubNav";
import InvitationCard, { INVITATION_THEMES } from "@/components/user/events/InvitationCard";
import { clientEventService, InvitationDesign, InvitationStats } from "@/services/client-event.service";
import { eventPassService } from "@/services/event-pass.service";

const STATUS_LABEL: Record<string, string> = { not_sent: "Not sent", sent: "Sent", opened: "Opened", failed: "Failed" };

export default function EventInvitationsPage() {
  const { id } = useParams() as { id: string };
  const [design, setDesign] = useState<InvitationDesign | null>(null);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [hasPass, setHasPass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const [data, pass] = await Promise.all([
        clientEventService.getInvitation(id),
        eventPassService.getPassForEvent(id).catch(() => null),
      ]);
      setDesign({ ...data.invitation, venueText: data.invitation.venue });
      setStats(data.stats);
      setHasPass(!!pass);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (changes: Partial<InvitationDesign>) => setDesign((d) => (d ? { ...d, ...changes } : d));

  async function save(): Promise<boolean> {
    if (!design) return false;
    setSaving(true);
    try {
      const saved = await clientEventService.saveInvitation(id, {
        title: design.title,
        hosts: design.hosts,
        message: design.message,
        dressCode: design.dressCode,
        venueText: design.venueText,
        theme: design.theme,
        accentColor: design.accentColor,
        rsvpDeadline: design.rsvpDeadline || null,
        allowPlusOnes: design.allowPlusOnes,
      });
      setDesign({ ...saved, venueText: saved.venue });
      toast.success("Invitation saved");
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't save the invitation");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function send(resend: boolean) {
    if (resend && !confirm("Email the invitation to every guest with an email address, including those already invited?")) return;
    if (!(await save())) return;
    setSending(true);
    try {
      const result = await clientEventService.sendInvitations(id, { resend });
      setStats(result.stats);
      if (result.failed.length) toast.warn(`Sent ${result.sent}. ${result.failed.length} couldn't be sent; try again later.`);
      else toast.success(`Invitations sent to ${result.sent} guest(s)`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't send the invitations");
    } finally {
      setSending(false);
    }
  }

  if (loading || !design) {
    return (
      <div className="max-w-6xl">
        <EventSubNav eventId={id} />
        {error ? (
          <p className="text-center py-10 text-gray-600">
            Couldn&apos;t load the invitation.{" "}
            <button onClick={load} className="text-purple-700 underline">
              Try again
            </button>
          </p>
        ) : (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <EventSubNav eventId={id} />

      {!hasPass && (
        <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          <Crown className="w-5 h-5 flex-shrink-0" />
          <div>
            Digital invitations and RSVP links come with the Celebration Pass. Preview your design here, then{" "}
            <Link href={`/user/dashboard/events/${id}`} className="font-medium underline">
              upgrade this event
            </Link>{" "}
            to save and send it.
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-semibold">Design</h2>
          {[
            ["title", "Title"],
            ["hosts", "Hosted by (e.g. The Okafor family)"],
            ["venueText", "Venue"],
            ["dressCode", "Dress code"],
          ].map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
              <input
                value={(design as any)[key] || ""}
                onChange={(e) => update({ [key]: e.target.value } as Partial<InvitationDesign>)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="text-gray-700 dark:text-gray-300">Message</span>
            <textarea value={design.message} onChange={(e) => update({ message: e.target.value })} rows={4} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-300">Theme</span>
              <select value={design.theme} onChange={(e) => update({ theme: e.target.value as InvitationDesign["theme"] })} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 capitalize">
                {INVITATION_THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-300">Accent colour</span>
              <input type="color" value={design.accentColor} onChange={(e) => update({ accentColor: e.target.value })} className="mt-1 w-full h-10 border border-gray-300 rounded-lg" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-gray-700 dark:text-gray-300">Reply by (optional)</span>
            <input
              type="date"
              value={design.rsvpDeadline ? design.rsvpDeadline.slice(0, 10) : ""}
              onChange={(e) => update({ rsvpDeadline: e.target.value || null })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={design.allowPlusOnes} onChange={(e) => update({ allowPlusOnes: e.target.checked })} />
            Guests may bring a plus-one
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={save} disabled={!hasPass || saving} className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50">
              {saving ? "Saving…" : "Save design"}
            </button>
            <button onClick={() => send(false)} disabled={!hasPass || sending} className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Email guests not yet invited
            </button>
            <button onClick={() => send(true)} disabled={!hasPass || sending} className="flex items-center gap-1.5 px-3 py-2 text-sm text-purple-700 disabled:opacity-50">
              <Mail className="w-4 h-4" /> Resend to everyone
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <InvitationCard design={design} guestName="Guest name">
            <span
              className="inline-block mt-6 px-7 py-3 rounded-full text-white text-sm font-semibold"
              style={{ background: design.accentColor, fontFamily: "Arial, sans-serif" }}
            >
              RSVP
            </span>
          </InvitationCard>

          {stats && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
              <h2 className="font-semibold mb-3">Delivery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status}>
                    <p className="text-xs text-gray-500">{STATUS_LABEL[status] || status}</p>
                    <p className="text-xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {stats.responded} of {stats.guests} guests have replied · {stats.withEmail} have an email address · {stats.withPhone} have a phone
                number for WhatsApp.
              </p>
              <Link href={`/user/dashboard/events/${id}/guests`} className="inline-block mt-2 text-sm text-purple-700 hover:underline">
                Send individual links or WhatsApp messages from the guest list
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
