"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, Loader2, Plus, Star, Zap } from "lucide-react";
import { toast } from "react-toastify";
import { supportService, Ticket } from "@/services/support.service";

const ACCENT = {
  purple: { button: "bg-purple-600 hover:bg-purple-700", active: "border-purple-600 bg-purple-50" },
  teal: { button: "bg-teal-600 hover:bg-teal-700", active: "border-teal-600 bg-teal-50" },
};
const STATUS: Record<string, { label: string; style: string }> = {
  open: { label: "Open", style: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In progress", style: "bg-amber-100 text-amber-700" },
  resolved: { label: "Resolved", style: "bg-green-100 text-green-700" },
  closed: { label: "Closed", style: "bg-gray-100 text-gray-600" },
};
const CATEGORIES = [
  ["general", "General question"],
  ["technical", "Something isn't working"],
  ["billing", "Billing or payments"],
  ["account", "My account"],
  ["event", "An event"],
  ["vendor", "A vendor or booking"],
  ["other", "Other"],
];

/** Contact support and follow tickets (clients, planners, vendors). ?ticket=<id> opens one. */
export default function SupportCenter({ accent = "purple" }: { accent?: keyof typeof ACCENT }) {
  const theme = ACCENT[accent];
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [priority, setPriority] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [active, setActive] = useState<Ticket | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", category: "general" });
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await supportService.list();
      setTickets(data.tickets);
      setPriority(data.priority);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const open = useCallback(async (id: string) => {
    try {
      setActive(await supportService.get(id));
      setCreating(false);
    } catch {
      toast.error("Couldn't open that ticket");
    }
  }, []);

  useEffect(() => {
    load();
    const id = new URLSearchParams(window.location.search).get("ticket");
    if (id) open(id);
  }, [load, open]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const ticket = await supportService.create(form);
      toast.success(`Ticket ${ticket.ticketNumber} sent. We'll reply by email and here.`);
      setForm({ subject: "", description: "", category: "general" });
      setCreating(false);
      setActive(ticket);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't send your request");
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !reply.trim()) return;
    setBusy(true);
    try {
      setActive(await supportService.reply(active._id, reply));
      setReply("");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't send your reply");
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    if (!active || !confirm("Close this ticket?")) return;
    setActive(await supportService.close(active._id));
    load();
  }

  async function rate(rating: number) {
    if (!active) return;
    try {
      setActive(await supportService.rate(active._id, rating));
      toast.success("Thanks for your feedback");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't save your rating");
    }
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Help &amp; support</h1>
          {priority ? (
            <p className="text-sm text-green-700 flex items-center gap-1 mt-1">
              <Zap className="w-4 h-4" /> Priority support with your {priority}: we aim to reply within 4 hours.
            </p>
          ) : (
            <p className="text-sm text-gray-600 mt-1">We usually reply within a day.</p>
          )}
        </div>
        <button onClick={() => { setCreating(true); setActive(null); }} className={`flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg ${theme.button}`}>
          <Plus className="w-4 h-4" /> New request
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm ${active || creating ? "hidden md:block" : ""}`}>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <p className="p-6 text-sm text-red-600">
              Couldn&apos;t load your tickets.{" "}
              <button onClick={load} className="underline">
                Try again
              </button>
            </p>
          ) : tickets.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No requests yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {tickets.map((t) => (
                <li key={t._id}>
                  <button onClick={() => open(t._id)} className={`w-full text-left px-4 py-3 border-l-4 ${active?._id === t._id ? theme.active : "border-transparent"}`}>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t.subject}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 rounded ${STATUS[t.status].style}`}>{STATUS[t.status].label}</span>
                      {t.ticketNumber} · {new Date(t.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2">
          {creating ? (
            <form onSubmit={create} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-3">
              <button type="button" onClick={() => setCreating(false)} className="md:hidden flex items-center text-sm text-gray-600">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-semibold">How can we help?</h2>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {CATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" maxLength={200} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell us what happened" rows={6} maxLength={5000} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <button type="submit" disabled={busy} className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${theme.button}`}>
                {busy ? "Sending…" : "Send"}
              </button>
            </form>
          ) : active ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-4">
              <button onClick={() => setActive(null)} className="md:hidden flex items-center text-sm text-gray-600">
                <ChevronLeft className="w-4 h-4" /> All requests
              </button>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{active.subject}</h2>
                  <p className="text-xs text-gray-500">
                    {active.ticketNumber}
                    {active.isPriority && " · Priority"}
                  </p>
                </div>
                <span className={`h-fit px-2 py-0.5 rounded-full text-xs font-medium ${STATUS[active.status].style}`}>{STATUS[active.status].label}</span>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {(active.messages || []).map((m) => (
                  <div key={m._id} className={`rounded-lg p-3 text-sm whitespace-pre-line ${m.from === "support" ? "bg-gray-50 dark:bg-gray-700" : "bg-white border border-gray-100 dark:border-gray-700"}`}>
                    <p className="text-xs text-gray-500 mb-1">
                      {m.from === "support" ? "Confetti support" : "You"} · {new Date(m.createdAt).toLocaleString()}
                    </p>
                    {m.content}
                  </div>
                ))}
                {active.resolution && <div className="rounded-lg p-3 text-sm bg-green-50 text-green-900 whitespace-pre-line">Resolution: {active.resolution.content}</div>}
              </div>
              {active.status !== "closed" && (
                <form onSubmit={sendReply} className="space-y-2">
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder="Write a reply" maxLength={5000} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={busy || !reply.trim()} className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${theme.button}`}>
                      Send reply
                    </button>
                    <button type="button" onClick={close} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                      Close ticket
                    </button>
                  </div>
                </form>
              )}
              {["resolved", "closed"].includes(active.status) && (
                <div className="text-sm">
                  <p className="text-gray-600 mb-1">{active.satisfaction ? "Your rating" : "How did we do?"}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => rate(n)} aria-label={`${n} stars`}>
                        <Star className={`w-6 h-6 ${(active.satisfaction?.rating || 0) >= n ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-sm text-gray-500">
              Choose a request, or start a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
