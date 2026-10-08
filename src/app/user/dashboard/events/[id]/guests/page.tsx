"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Copy, Loader2, MessageCircle, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import EventSubNav from "@/components/user/events/EventSubNav";
import {
  clientEventService,
  Guest,
  GuestInput,
  GuestListResponse,
  RsvpStatus,
} from "@/services/client-event.service";
import { eventPassService } from "@/services/event-pass.service";
import { csvToRecords } from "@/utils/csv";

const RSVP_LABEL: Record<RsvpStatus, string> = {
  pending: "Awaiting reply",
  accepted: "Attending",
  declined: "Not attending",
  tentative: "Maybe",
};
const RSVP_STYLE: Record<RsvpStatus, string> = {
  pending: "bg-gray-100 text-gray-600",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  tentative: "bg-amber-100 text-amber-700",
};
const INVITE_LABEL: Record<string, string> = { not_sent: "Not sent", sent: "Sent", failed: "Failed", opened: "Opened" };
const EMPTY: GuestInput = { name: "", email: "", phone: "", plusOne: false, plusOneName: "", category: "", dietaryRestrictions: "", notes: "" };
const TEMPLATE = "Name,Email,Phone,Plus One,Category,Dietary\nAda Obi,ada@example.com,08031234567,yes,Family,vegetarian\n";

export default function EventGuestsPage() {
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<GuestListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<RsvpStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Guest | "new" | null>(null);
  const [form, setForm] = useState<GuestInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [hasRsvpLinks, setHasRsvpLinks] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await clientEventService.getGuests(id, {
        rsvpStatus: filter === "all" ? undefined : filter,
        search: search.trim() || undefined,
      });
      setData(res);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, filter, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    eventPassService
      .getPassForEvent(id)
      .then((pass) => setHasRsvpLinks(!!pass))
      .catch(() => setHasRsvpLinks(false));
  }, [id]);

  function openForm(guest: Guest | "new") {
    setEditing(guest);
    setForm(
      guest === "new"
        ? EMPTY
        : {
            name: guest.name,
            email: guest.email || "",
            phone: guest.phone || "",
            plusOne: guest.plusOne,
            plusOneName: guest.plusOneName || "",
            category: guest.category || "",
            dietaryRestrictions: (guest.dietaryRestrictions || []).join(", "),
            notes: guest.notes || "",
          }
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Enter the guest's name");
    setSaving(true);
    try {
      if (editing === "new") await clientEventService.addGuest(id, form);
      else if (editing) await clientEventService.updateGuest(editing._id, form);
      toast.success(editing === "new" ? "Guest added" : "Guest updated");
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't save the guest");
    } finally {
      setSaving(false);
    }
  }

  async function remove(guest: Guest) {
    if (!confirm(`Remove ${guest.name} from the guest list?`)) return;
    try {
      await clientEventService.deleteGuest(guest._id);
      toast.success("Guest removed");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't remove the guest");
    }
  }

  async function setRsvp(guest: Guest, status: RsvpStatus) {
    try {
      await clientEventService.setRsvp(guest._id, status);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't update the RSVP");
    }
  }

  async function importFile(file: File) {
    try {
      const records = csvToRecords(await file.text());
      const guests: GuestInput[] = records
        .map((r) => ({
          name: r.name || r.fullname || [r.firstname, r.lastname].filter(Boolean).join(" "),
          email: r.email || undefined,
          phone: r.phone || r.phonenumber || undefined,
          plusOne: /^(yes|y|true|1)$/i.test(r.plusone || ""),
          category: r.category || r.group || undefined,
          dietaryRestrictions: r.dietary || r.dietaryrestrictions || undefined,
          relationship: r.relationship || undefined,
        }))
        .filter((g) => g.name);
      if (guests.length === 0) return toast.error("No guests found. The file needs a Name column.");
      const result = await clientEventService.importGuests(id, guests);
      toast.success(`Imported ${result.imported} guest(s)${result.skipped ? `, skipped ${result.skipped}` : ""}`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't import the file");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "guest-list-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyLink(guest: Guest) {
    try {
      const { url } = await clientEventService.getRsvpLink(id, guest._id);
      await navigator.clipboard.writeText(url);
      toast.success(`RSVP link for ${guest.name} copied`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't get the link");
    }
  }

  async function shareWhatsApp(guest: Guest) {
    // Open the window first (popup blockers), then point it at WhatsApp
    const win = window.open("", "_blank");
    try {
      const { whatsappUrl } = await clientEventService.getRsvpLink(id, guest._id);
      if (win) win.location.href = whatsappUrl;
      else window.location.href = whatsappUrl;
      await clientEventService.markShared(id, guest._id);
      load();
    } catch (err: any) {
      win?.close();
      toast.error(err?.response?.data?.message || "Couldn't open WhatsApp");
    }
  }

  const stats = data?.stats;
  const limit = data?.limit;

  return (
    <div className="max-w-6xl">
      <EventSubNav eventId={id} />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          {[
            ["Guests", stats.total],
            ["Attending", stats.attending],
            ["Awaiting reply", stats.byStatus.pending],
            ["Not attending", stats.byStatus.declined],
            ["Expected (with +1s)", stats.estimatedAttendance],
          ].map(([label, value]) => (
            <div key={label as string} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
          ))}
        </div>
      )}

      {limit?.max != null && (
        <div className="mb-5 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-300">Free plan guest limit</span>
            <span className="font-medium">
              {limit.used} of {limit.max}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${limit.used >= limit.max ? "bg-red-500" : "bg-purple-600"}`}
              style={{ width: `${Math.min(100, (limit.used / limit.max) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">A Celebration Pass gives this event unlimited guests, RSVP links and digital invitations.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as RsvpStatus | "all")}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2"
          aria-label="Filter by RSVP"
        >
          <option value="all">All replies</option>
          {(Object.keys(RSVP_LABEL) as RsvpStatus[]).map((s) => (
            <option key={s} value={s}>
              {RSVP_LABEL[s]}
            </option>
          ))}
        </select>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          <Upload className="w-4 h-4" /> Import CSV
        </button>
        <button onClick={downloadTemplate} className="text-sm text-purple-700 hover:underline">
          CSV template
        </button>
        <button onClick={() => openForm("new")} className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700">
          <Plus className="w-4 h-4" /> Add guest
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-gray-600">
          Couldn&apos;t load the guest list.{" "}
          <button onClick={load} className="text-purple-700 underline">
            Try again
          </button>
        </div>
      ) : !data || data.guests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center text-gray-500">
          {search || filter !== "all" ? "No guests match." : "No guests yet. Add them one by one or import a CSV."}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Reply</th>
                <th className="px-4 py-3">Invitation</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.guests.map((g) => (
                <tr key={g._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {g.name}
                      {g.plusOne && <span className="ml-1 text-xs text-gray-500">+1{g.plusOneName ? ` (${g.plusOneName})` : ""}</span>}
                    </p>
                    <p className="text-xs text-gray-500">{[g.email, g.phone, g.category].filter(Boolean).join(" · ")}</p>
                    {g.rsvpMessage && <p className="text-xs text-gray-600 italic mt-0.5">“{g.rsvpMessage}”</p>}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={g.rsvpStatus}
                      onChange={(e) => setRsvp(g, e.target.value as RsvpStatus)}
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${RSVP_STYLE[g.rsvpStatus]}`}
                      aria-label={`RSVP for ${g.name}`}
                    >
                      {(Object.keys(RSVP_LABEL) as RsvpStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {RSVP_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {INVITE_LABEL[g.invitation?.status || "not_sent"]}
                    {g.invitation?.channel ? ` · ${g.invitation.channel}` : ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{g.tableAssignment || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {hasRsvpLinks && (
                        <>
                          <button onClick={() => copyLink(g)} title="Copy RSVP link" className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => shareWhatsApp(g)} title="Send on WhatsApp" className="p-1.5 rounded hover:bg-gray-100 text-green-600">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => openForm(g)} title="Edit" className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(g)} title="Remove" className="p-1.5 rounded hover:bg-red-50 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <form onSubmit={save} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editing === "new" ? "Add guest" : "Edit guest"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {[
              ["name", "Name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone (for WhatsApp)", "tel"],
              ["category", "Group (e.g. Family, Friends)", "text"],
              ["dietaryRestrictions", "Dietary needs (comma separated)", "text"],
            ].map(([key, label, type]) => (
              <label key={key} className="block text-sm">
                <span className="text-gray-700 dark:text-gray-300">{label}</span>
                <input
                  type={type}
                  value={(form as any)[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  required={key === "name"}
                />
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.plusOne} onChange={(e) => setForm({ ...form, plusOne: e.target.checked })} />
              Bringing a plus-one
            </label>
            {form.plusOne && (
              <input
                value={form.plusOneName || ""}
                onChange={(e) => setForm({ ...form, plusOneName: e.target.value })}
                placeholder="Plus-one's name (optional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            )}
            <label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-300">Notes</span>
              <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
