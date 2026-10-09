"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Loader2, Video, X } from "lucide-react";
import { toast } from "react-toastify";
import { meetingService, Meeting } from "@/services/meeting.service";

const pad = (n: number) => String(n).padStart(2, "0");
const localInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Download a blob as a file (calendar invite) */
function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Schedule a video call from a conversation or a booking, and show the upcoming
 * ones with Join / Add to calendar / Cancel. Everyone gets an email invite.
 */
export default function VideoCallButton({
  conversationId,
  bookingId,
  defaultTitle = "Video call",
  className = "",
}: {
  conversationId?: string;
  bookingId?: string;
  defaultTitle?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [calls, setCalls] = useState<Meeting[]>([]);
  const [form, setForm] = useState({ title: defaultTitle, when: "", duration: 30, agenda: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!conversationId && !bookingId) return;
    try {
      setCalls(await meetingService.list({ conversationId, bookingId, upcoming: true }));
    } catch {
      setCalls([]);
    }
  }, [conversationId, bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  function start() {
    const next = new Date(Date.now() + 24 * 3600000);
    next.setMinutes(0, 0, 0);
    setForm({ title: defaultTitle, when: localInput(next), duration: 30, agenda: "" });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await meetingService.create({
        conversationId,
        bookingId: conversationId ? undefined : bookingId,
        title: form.title,
        agenda: form.agenda || undefined,
        startsAt: new Date(form.when).toISOString(),
        durationMinutes: form.duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      toast.success("Call scheduled. Everyone has an email invite.");
      setOpen(false);
      load();
    } catch (err: any) {
      // A missing pass shows the upgrade prompt (api.tsx); other errors here
      if (err?.response?.data?.code !== "PASS_REQUIRED") toast.error(err?.response?.data?.message || "Couldn't schedule the call");
    } finally {
      setSaving(false);
    }
  }

  async function cancel(call: Meeting) {
    if (!confirm(`Cancel "${call.title}"? Everyone will be told.`)) return;
    try {
      await meetingService.cancel(call._id);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't cancel the call");
    }
  }

  async function addToCalendar(call: Meeting) {
    try {
      saveFile(await meetingService.invite(call._id), "invite.ics");
    } catch {
      toast.error("Couldn't download the invite");
    }
  }

  const soon = calls[0];
  const live = soon && new Date(soon.startsAt).getTime() - Date.now() < 15 * 60000;

  return (
    <>
      {soon && (
        <a
          href={soon.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${live ? "bg-green-600 text-white" : "bg-green-50 text-green-700 border border-green-200"}`}
          title={`${soon.title} · ${new Date(soon.startsAt).toLocaleString()}`}
        >
          <Video className="w-3.5 h-3.5" /> {live ? "Join call" : new Date(soon.startsAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
        </a>
      )}
      <button
        type="button"
        onClick={start}
        className={className || "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-700 hover:bg-gray-50"}
        title="Schedule a video call"
      >
        <Video className="w-4 h-4" /> <span className="hidden sm:inline">Video call</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-5 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" /> Video call
              </h3>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {calls.length > 0 && (
              <ul className="space-y-2">
                {calls.map((c) => (
                  <li key={c._id} className="border border-gray-100 rounded-lg p-3 text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{c.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(c.startsAt).toLocaleString()} · {c.durationMinutes} min
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-green-600 text-white text-xs">
                        Join
                      </a>
                      <button onClick={() => addToCalendar(c)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-xs">
                        <CalendarPlus className="w-3.5 h-3.5" /> Add to calendar
                      </button>
                      <button onClick={() => cancel(c)} className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 text-xs">
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={save} className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule a new call</p>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What's it about?"
                aria-label="Title"
              />
              <div className="grid grid-cols-3 gap-2">
                <label className="col-span-2 text-xs text-gray-500">
                  When (your time)
                  <input
                    type="datetime-local"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={form.when}
                    onChange={(e) => setForm({ ...form, when: e.target.value })}
                  />
                </label>
                <label className="text-xs text-gray-500">
                  Length
                  <select
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  >
                    {[15, 30, 45, 60, 90].map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={2}
                placeholder="Agenda (optional)"
                value={form.agenda}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              />
              <p className="text-xs text-gray-500">The call opens in the browser (no app needed). Everyone gets an email with a calendar invite.</p>
              <button disabled={saving} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Schedule call
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
