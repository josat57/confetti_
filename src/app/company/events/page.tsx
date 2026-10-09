"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useCompany } from "@/components/company/CompanyContext";
import { organizationService, naira, OrgEvent } from "@/services/organization.service";

const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

/** The company's events with budget and spending */
export default function CompanyEventsPage() {
  const { org, dashboardHref } = useCompany();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState("");
  const [form, setForm] = useState<{ title: string; startDate: string; department: string; budget: number | ""; guestCount: number | ""; city: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setEvents(await organizationService.events({ department: department || undefined }));
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [department]);

  useEffect(() => {
    load();
  }, [load]);

  if (!org) return null;
  const active = org.contract.status === "active";
  // Event screens live in each person's own dashboard
  const eventHref = (id: string) => (dashboardHref === "/planner/dashboard" ? `/planner/dashboard/events/${id}` : `/user/dashboard/events/${id}`);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    try {
      await organizationService.createEvent({
        title: form.title,
        startDate: new Date(form.startDate).toISOString(),
        department: form.department || undefined,
        budget: form.budget === "" ? undefined : form.budget,
        guestCount: form.guestCount === "" ? undefined : form.guestCount,
        city: form.city || undefined,
      });
      toast.success("Event created");
      setForm(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't create the event");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Company events</h1>
          <p className="text-sm text-gray-600">
            {org.me?.role === "requester" ? "Events you've created for the company." : "All the company's events."} Company events include the Celebration Plus tools.
          </p>
        </div>
        <div className="flex gap-2">
          {org.departments.length > 0 && (
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2 text-sm" aria-label="Department">
              <option value="">All departments</option>
              {org.departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          )}
          <button
            disabled={!active}
            title={active ? undefined : "Needs an active Corporate contract"}
            onClick={() => setForm({ title: "", startDate: "", department: org.me?.department || "", budget: "", guestCount: "", city: "" })}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> New event
          </button>
        </div>
      </div>

      {form && (
        <form onSubmit={create} className="bg-white rounded-xl border border-gray-200 p-5 grid sm:grid-cols-3 gap-3">
          <input className={`${input} sm:col-span-2`} required placeholder="Event name *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label className="text-xs text-gray-500">
            Date *
            <input type="datetime-local" required className={input} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </label>
          <select className={input} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} aria-label="Department">
            <option value="">No department</option>
            {org.departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <input className={input} type="number" min={0} placeholder="Budget (₦)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value === "" ? "" : Number(e.target.value) })} />
          <input className={input} type="number" min={1} placeholder="Guests" value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value === "" ? "" : Number(e.target.value) })} />
          <input className={input} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <div className="sm:col-span-3 flex gap-2">
            <button disabled={busy} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50">
              Create
            </button>
            <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No company events yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2">Event</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2 text-right">Budget</th>
                <th className="px-4 py-2 text-right">Paid</th>
                <th className="px-4 py-2 text-right">Approved, unpaid</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const over = e.budget !== null && e.spent + e.committed > e.budget;
                return (
                  <tr key={e._id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      {e.mine ? (
                        <Link href={eventHref(e._id)} className="font-medium text-indigo-700 hover:underline">
                          {e.title}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900">{e.title}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.startDate ? new Date(e.startDate).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{e.department || "—"}</td>
                    <td className="px-4 py-3 text-right">{e.budget !== null ? naira(e.budget) : "—"}</td>
                    <td className={`px-4 py-3 text-right ${over ? "text-red-600 font-medium" : ""}`}>{naira(e.spent)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{naira(e.committed)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
