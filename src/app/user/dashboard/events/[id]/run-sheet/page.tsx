"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, Copy, Download, Link2, Loader2, Mail, Pencil, Phone, Plus, Trash2, Users, X } from "lucide-react";
import { toast } from "react-toastify";
import EventSubNav from "@/components/user/events/EventSubNav";
import PlusGate from "@/components/user/events/PlusGate";
import {
  celebrationPlusService as svc,
  RunSheet,
  RunSheetItem,
  RunSheetItemInput,
  RunSheetVendor,
  RunSheetVendorInput,
  saveBlob,
} from "@/services/celebration-plus.service";

const errorText = (err: any, fallback: string) => err?.response?.data?.message || fallback;
const EMPTY_VENDOR: RunSheetVendorInput = { name: "", role: "", contactName: "", contactPhone: "", contactEmail: "", arrivalTime: "" };
const EMPTY_ITEM: RunSheetItemInput = { day: "", start: "", end: "", title: "", location: "", notes: "", vendorKey: "", forAllVendors: false };
const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500";

function RunSheetScreen({ eventId }: { eventId: string }) {
  const [sheet, setSheet] = useState<RunSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", phone: "", notes: "" });
  const [vendorForm, setVendorForm] = useState<RunSheetVendorInput>(EMPTY_VENDOR);
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [itemForm, setItemForm] = useState<RunSheetItemInput>(EMPTY_ITEM);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const apply = (data: RunSheet) => {
    setSheet(data);
    setContact({ name: data.dayOfContact?.name || "", phone: data.dayOfContact?.phone || "", notes: data.notes || "" });
  };

  const load = useCallback(async () => {
    try {
      apply(await svc.getRunSheet(eventId));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(key: string, fn: () => Promise<RunSheet>, success?: string) {
    setBusy(key);
    try {
      const data = await fn();
      apply(data);
      if (success) toast.success(success);
      return data;
    } catch (err) {
      toast.error(errorText(err, "Something went wrong"));
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function saveContact(e: React.FormEvent) {
    e.preventDefault();
    await run("contact", () => svc.updateRunSheet(eventId, { dayOfContact: { name: contact.name, phone: contact.phone }, notes: contact.notes }), "Saved");
  }

  async function saveVendor(e: React.FormEvent) {
    e.preventDefault();
    const done = await run("vendor", () =>
      editingVendor ? svc.updateRunSheetVendor(eventId, editingVendor, vendorForm) : svc.addRunSheetVendor(eventId, vendorForm)
    );
    if (done) {
      setVendorForm(EMPTY_VENDOR);
      setEditingVendor(null);
      setShowVendorForm(false);
    }
  }

  function editVendor(v: RunSheetVendor) {
    setEditingVendor(v._id);
    setShowVendorForm(true);
    setVendorForm({
      name: v.name,
      role: v.role || "",
      contactName: v.contactName || "",
      contactPhone: v.contactPhone || "",
      contactEmail: v.contactEmail || "",
      arrivalTime: v.arrivalTime || "",
    });
  }

  async function importBooked() {
    const data = await run("import", () => svc.importRunSheetVendors(eventId));
    if (data) toast.info(data.added ? `Added ${data.added} booked vendor${data.added > 1 ? "s" : ""}` : "No new booked vendors to add");
  }

  async function share(v: RunSheetVendor, email: boolean) {
    const data = await run(`share-${v._id}`, () => svc.shareRunSheetVendor(eventId, v._id, email));
    if (!data) return;
    const link = data.vendors.find((x) => x._id === v._id)?.shareLink;
    if (email) toast[data.emailed ? "success" : "error"](data.emailed ? `Sent to ${v.contactEmail}` : "Couldn't send the email; copy the link instead");
    else if (link) copy(link);
  }

  function copy(link: string) {
    navigator.clipboard?.writeText(link).then(
      () => toast.success("Link copied"),
      () => toast.info(link)
    );
  }

  async function revoke(v: RunSheetVendor) {
    if (!confirm(`Turn off ${v.name}'s link? They won't be able to open it any more.`)) return;
    await run(`share-${v._id}`, () => svc.revokeRunSheetShare(eventId, v._id), "Link turned off");
  }

  async function removeVendor(v: RunSheetVendor) {
    if (!confirm(`Remove ${v.name}? Their time slots stay on the schedule, unassigned.`)) return;
    await run(`remove-${v._id}`, () => svc.removeRunSheetVendor(eventId, v._id));
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    const body: RunSheetItemInput = { ...itemForm, vendorKey: itemForm.vendorKey || null };
    const done = await run("item", () => (editingItem ? svc.updateRunSheetItem(eventId, editingItem, body) : svc.addRunSheetItem(eventId, body)));
    if (done) {
      setItemForm({ ...EMPTY_ITEM, day: itemForm.day });
      setEditingItem(null);
    }
  }

  function editItem(i: RunSheetItem) {
    setEditingItem(i._id);
    setItemForm({
      day: i.day || "",
      start: i.start,
      end: i.end || "",
      title: i.title,
      location: i.location || "",
      notes: i.notes || "",
      vendorKey: i.vendorKey || "",
      forAllVendors: i.forAllVendors,
    });
    window.scrollTo({ top: document.getElementById("schedule-form")?.offsetTop || 0, behavior: "smooth" });
  }

  async function removeItem(i: RunSheetItem) {
    if (!confirm(`Delete "${i.title}"?`)) return;
    await run(`item-${i._id}`, () => svc.removeRunSheetItem(eventId, i._id));
  }

  async function downloadPdf() {
    setBusy("pdf");
    try {
      saveBlob(await svc.runSheetPdf(eventId), "run-sheet.pdf");
    } catch {
      toast.error("Couldn't create the PDF");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
      </div>
    );
  }
  if (error || !sheet) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-700">Couldn&apos;t load the run sheet.</p>
        <button onClick={load} className="mt-2 text-sm text-purple-700 underline">
          Try again
        </button>
      </div>
    );
  }

  // Group the schedule by day (entries without a day first)
  const groups: Array<{ day: string; items: RunSheetItem[] }> = [];
  for (const item of sheet.items) {
    const day = item.day || "";
    const group = groups.find((g) => g.day === day);
    if (group) group.items.push(item);
    else groups.push({ day, items: [item] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Day-of run sheet</h2>
          <p className="text-sm text-gray-500">Who does what, and when. Share each vendor&apos;s part with them.</p>
        </div>
        <button
          onClick={downloadPdf}
          disabled={busy === "pdf"}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {busy === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
        </button>
      </div>

      <form onSubmit={saveContact} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Phone className="w-4 h-4" /> Who vendors call on the day
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className={input} placeholder="Name (e.g. your coordinator)" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
          <input className={input} placeholder="Phone number" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
        </div>
        <textarea
          className={input}
          rows={2}
          placeholder="Notes for every vendor (parking, entrance, dress code…)"
          value={contact.notes}
          onChange={(e) => setContact({ ...contact, notes: e.target.value })}
        />
        <button disabled={busy === "contact"} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
          Save
        </button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4" /> Vendors ({sheet.vendors.length})
          </h3>
          <div className="flex gap-2">
            <button onClick={importBooked} disabled={busy === "import"} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-50">
              Add my booked vendors
            </button>
            <button
              onClick={() => {
                setEditingVendor(null);
                setVendorForm(EMPTY_VENDOR);
                setShowVendorForm(!showVendorForm);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" /> Add vendor
            </button>
          </div>
        </div>

        {showVendorForm && (
          <form onSubmit={saveVendor} className="border border-purple-100 bg-purple-50/40 rounded-lg p-4 mb-4 grid sm:grid-cols-3 gap-3">
            <input className={input} required placeholder="Vendor name *" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} />
            <input className={input} placeholder="Role (Caterer, DJ…)" value={vendorForm.role} onChange={(e) => setVendorForm({ ...vendorForm, role: e.target.value })} />
            <label className="text-xs text-gray-500">
              Arrives at
              <input type="time" className={input} value={vendorForm.arrivalTime} onChange={(e) => setVendorForm({ ...vendorForm, arrivalTime: e.target.value })} />
            </label>
            <input className={input} placeholder="Contact person" value={vendorForm.contactName} onChange={(e) => setVendorForm({ ...vendorForm, contactName: e.target.value })} />
            <input className={input} placeholder="Phone" value={vendorForm.contactPhone} onChange={(e) => setVendorForm({ ...vendorForm, contactPhone: e.target.value })} />
            <input className={input} type="email" placeholder="Email (to send their link)" value={vendorForm.contactEmail} onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })} />
            <div className="sm:col-span-3 flex gap-2">
              <button disabled={busy === "vendor"} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
                {editingVendor ? "Save vendor" : "Add vendor"}
              </button>
              <button type="button" onClick={() => setShowVendorForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        {sheet.vendors.length === 0 ? (
          <p className="text-sm text-gray-500">Add the vendors working on the day, then give each of them their time slots.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {sheet.vendors.map((v) => (
              <div key={v._id} className="py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {v.name} {v.role && <span className="text-sm font-normal text-gray-500">· {v.role}</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[v.arrivalTime && `Arrives ${v.arrivalTime}`, v.contactName, v.contactPhone, v.contactEmail, `${v.slots} slot${v.slots === 1 ? "" : "s"}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {v.shareLink && (
                    <p className="text-xs text-green-700 mt-0.5">
                      Link on{v.lastViewedAt ? ` · opened ${new Date(v.lastViewedAt).toLocaleDateString()}` : " · not opened yet"}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => (v.shareLink ? copy(v.shareLink) : share(v, false))}
                    disabled={busy === `share-${v._id}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-50"
                  >
                    {v.shareLink ? <Copy className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />} {v.shareLink ? "Copy link" : "Get link"}
                  </button>
                  {v.contactEmail && (
                    <button
                      onClick={() => share(v, true)}
                      disabled={busy === `share-${v._id}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email link
                    </button>
                  )}
                  {v.shareLink && (
                    <button onClick={() => revoke(v)} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                      Turn off link
                    </button>
                  )}
                  <button onClick={() => editVendor(v)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" aria-label={`Edit ${v.name}`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeVendor(v)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50" aria-label={`Remove ${v.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4" /> Schedule
        </h3>
        <form id="schedule-form" onSubmit={saveItem} className="grid sm:grid-cols-6 gap-3 mb-5">
          <label className="text-xs text-gray-500 sm:col-span-2">
            Day (optional)
            <input type="date" className={input} value={itemForm.day} onChange={(e) => setItemForm({ ...itemForm, day: e.target.value })} />
          </label>
          <label className="text-xs text-gray-500">
            Start *
            <input type="time" required className={input} value={itemForm.start} onChange={(e) => setItemForm({ ...itemForm, start: e.target.value })} />
          </label>
          <label className="text-xs text-gray-500">
            End
            <input type="time" className={input} value={itemForm.end} onChange={(e) => setItemForm({ ...itemForm, end: e.target.value })} />
          </label>
          <label className="text-xs text-gray-500 sm:col-span-2">
            Vendor
            <select className={input} value={itemForm.vendorKey || ""} onChange={(e) => setItemForm({ ...itemForm, vendorKey: e.target.value })}>
              <option value="">No one in particular</option>
              {sheet.vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <input className={`${input} sm:col-span-3`} required placeholder="What happens *" value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} />
          <input className={`${input} sm:col-span-3`} placeholder="Where (hall, entrance…)" value={itemForm.location} onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })} />
          <input className={`${input} sm:col-span-4`} placeholder="Notes" value={itemForm.notes} onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })} />
          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={!!itemForm.forAllVendors} onChange={(e) => setItemForm({ ...itemForm, forAllVendors: e.target.checked })} />
            Show to every vendor
          </label>
          <div className="sm:col-span-6 flex gap-2">
            <button disabled={busy === "item"} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
              {editingItem ? "Save entry" : (<><Plus className="w-4 h-4" /> Add to schedule</>)}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setItemForm(EMPTY_ITEM);
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        </form>

        {sheet.items.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing scheduled yet.</p>
        ) : (
          <div className="space-y-5">
            {groups.map((g) => (
              <div key={g.day || "any"}>
                {g.day && <p className="text-sm font-semibold text-purple-700 mb-2">{new Date(`${g.day}T12:00:00`).toDateString()}</p>}
                <ol className="border-l-2 border-purple-100 pl-4 space-y-3">
                  {g.items.map((i) => (
                    <li key={i._id} className="flex flex-wrap items-start gap-3">
                      <span className="w-24 text-sm font-mono text-gray-700">
                        {i.start}
                        {i.end ? `–${i.end}` : ""}
                      </span>
                      <div className="flex-1 min-w-[180px]">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{i.title}</p>
                        <p className="text-xs text-gray-500">
                          {[i.vendorName || (i.forAllVendors ? "All vendors" : null), i.location, i.notes].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <button onClick={() => editItem(i)} className="p-1 rounded text-gray-500 hover:bg-gray-100" aria-label={`Edit ${i.title}`}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeItem(i)} className="p-1 rounded text-red-500 hover:bg-red-50" aria-label={`Delete ${i.title}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RunSheetPage() {
  const { id } = useParams() as { id: string };
  return (
    <div className="max-w-5xl">
      <EventSubNav eventId={id} />
      <PlusGate
        eventId={id}
        feature="runSheet"
        title="The day-of run sheet"
        description="Plan the day minute by minute, give every vendor their time slots and contacts, share a private link with each of them and download it as a PDF."
      >
        <RunSheetScreen eventId={id} />
      </PlusGate>
    </div>
  );
}
