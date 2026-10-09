"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Home, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { venueService, ReservationInput, VenueReservation, VenueSpace, VenueSession } from "@/services/venue.service";

const errorText = (err: any, fallback: string) => err?.response?.data?.message || fallback;
const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500";
const STATUS_STYLE: Record<string, string> = {
  held: "bg-amber-100 text-amber-800 border-amber-200",
  booked: "bg-green-100 text-green-800 border-green-200",
  blocked: "bg-gray-200 text-gray-700 border-gray-300",
};
const STATUS_LABEL: Record<string, string> = { held: "Hold", booked: "Booked", blocked: "Blocked", released: "Released", expired: "Expired", cancelled: "Cancelled" };
const SESSION_LABEL: Record<VenueSession, string> = { full: "Full day", morning: "Morning", evening: "Evening" };
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const spaceName = (r: VenueReservation, spaces: VenueSpace[]) =>
  typeof r.space === "object" ? r.space.name : spaces.find((s) => s._id === r.space)?.name || "Space";
const spaceId = (r: VenueReservation) => (typeof r.space === "object" ? r.space._id : r.space);
type Tab = "calendar" | "holds" | "spaces";

const EMPTY_FORM: ReservationInput = {
  status: "held", dateFrom: "", dateTo: "", session: "full", title: "", clientName: "", clientEmail: "", clientPhone: "", guestCount: "", notes: "",
  holdExpiresAt: "", totalAmount: "", depositAmount: "", depositDueDate: "",
};

/** Venue plan: spaces, a calendar per space, holds that expire, bookings and blocked dates */
export default function VenuePage() {
  const [tab, setTab] = useState<Tab>("calendar");
  const [spaces, setSpaces] = useState<VenueSpace[]>([]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [spaceFilter, setSpaceFilter] = useState("");
  const [reservations, setReservations] = useState<VenueReservation[]>([]);
  const [list, setList] = useState<VenueReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [form, setForm] = useState<ReservationInput | null>(null);
  const [editing, setEditing] = useState<VenueReservation | null>(null);
  const [converting, setConverting] = useState<VenueReservation | null>(null);
  const [busy, setBusy] = useState(false);
  const [spaceForm, setSpaceForm] = useState<{ _id?: string; name: string; seated: number | ""; standing: number | ""; pricePerDay: number | "" } | null>(null);

  const range = useMemo(() => {
    const start = new Date(month);
    start.setDate(1 - start.getDay()); // from the Sunday before the 1st
    const end = new Date(start);
    end.setDate(start.getDate() + 41);
    return { start, end };
  }, [month]);

  const load = useCallback(async () => {
    try {
      const [cal, upcoming] = await Promise.all([
        venueService.calendar({ from: ymd(range.start), to: ymd(range.end), space: spaceFilter || undefined }),
        venueService.listReservations({ upcoming: true }),
      ]);
      setSpaces(cal.spaces);
      setReservations(cal.reservations);
      setList(upcoming);
      setLocked(false);
    } catch (err: any) {
      if (err?.response?.data?.code === "PLAN_FEATURE_REQUIRED") setLocked(true);
      else toast.error(errorText(err, "Couldn't load the venue calendar"));
    } finally {
      setLoading(false);
    }
  }, [range, spaceFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(range.start);
      d.setDate(range.start.getDate() + i);
      out.push(d);
    }
    return out;
  }, [range]);

  function openNew(date?: string) {
    if (!spaces.some((s) => s.active)) {
      toast.info("Add a space first");
      setTab("spaces");
      return;
    }
    setEditing(null);
    setForm({ ...EMPTY_FORM, space: spaceFilter || spaces.find((s) => s.active)?._id, dateFrom: date || "", dateTo: date || "" });
  }

  function openEdit(r: VenueReservation) {
    setEditing(r);
    setForm({
      space: spaceId(r),
      dateFrom: r.dateFrom,
      dateTo: r.dateTo,
      session: r.session,
      title: r.title || "",
      clientName: r.clientName || "",
      clientEmail: r.clientEmail || "",
      clientPhone: r.clientPhone || "",
      guestCount: r.guestCount ?? "",
      notes: r.notes || "",
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    try {
      const body: ReservationInput = { ...form };
      if (!body.dateTo) body.dateTo = body.dateFrom;
      if (editing) {
        await venueService.updateReservation(editing._id, {
          space: body.space, dateFrom: body.dateFrom, dateTo: body.dateTo, session: body.session, title: body.title,
          clientName: body.clientName, clientEmail: body.clientEmail, clientPhone: body.clientPhone, guestCount: body.guestCount, notes: body.notes,
        });
        toast.success("Saved");
      } else {
        if (body.status !== "held") delete body.holdExpiresAt;
        else if (body.holdExpiresAt) body.holdExpiresAt = new Date(body.holdExpiresAt).toISOString();
        if (body.status !== "booked") {
          delete body.totalAmount;
          delete body.depositAmount;
          delete body.depositDueDate;
        }
        await venueService.createReservation(body);
        toast.success(body.status === "held" ? "Hold placed" : body.status === "booked" ? "Booked" : "Dates blocked");
      }
      setForm(null);
      setEditing(null);
      load();
    } catch (err: any) {
      const conflicts = err?.response?.data?.details?.conflicts as VenueReservation[] | undefined;
      toast.error(
        conflicts?.length
          ? `Already taken: ${conflicts.map((c) => `${STATUS_LABEL[c.status]} ${c.title || c.clientName || ""} (${c.dateFrom})`).join(", ")}`
          : errorText(err, "Couldn't save")
      );
    } finally {
      setBusy(false);
    }
  }

  async function convert(e: React.FormEvent) {
    e.preventDefault();
    if (!converting || !form) return;
    setBusy(true);
    try {
      await venueService.convertHold(converting._id, {
        clientName: form.clientName, clientEmail: form.clientEmail, clientPhone: form.clientPhone,
        totalAmount: form.totalAmount, depositAmount: form.depositAmount, depositDueDate: form.depositDueDate || undefined,
      });
      toast.success("Hold booked. It's now on your bookings page.");
      setConverting(null);
      setForm(null);
      load();
    } catch (err) {
      toast.error(errorText(err, "Couldn't book the hold"));
    } finally {
      setBusy(false);
    }
  }

  async function extend(r: VenueReservation) {
    const current = r.holdExpiresAt ? new Date(r.holdExpiresAt) : new Date();
    const next = new Date(Math.max(current.getTime(), Date.now()) + 3 * 86400000);
    try {
      await venueService.extendHold(r._id, next.toISOString());
      toast.success(`Hold extended to ${next.toLocaleString()}`);
      load();
    } catch (err) {
      toast.error(errorText(err, "Couldn't extend the hold"));
    }
  }

  async function release(r: VenueReservation) {
    const what = r.status === "booked" ? "Free this space? The booking itself stays on your bookings page." : r.status === "held" ? "Release this hold?" : "Unblock these dates?";
    if (!confirm(what)) return;
    try {
      await venueService.release(r._id);
      load();
    } catch (err) {
      toast.error(errorText(err, "Couldn't release"));
    }
  }

  async function saveSpace(e: React.FormEvent) {
    e.preventDefault();
    if (!spaceForm) return;
    const body = {
      name: spaceForm.name,
      capacity: { seated: spaceForm.seated === "" ? undefined : spaceForm.seated, standing: spaceForm.standing === "" ? undefined : spaceForm.standing },
      pricePerDay: spaceForm.pricePerDay === "" ? undefined : spaceForm.pricePerDay,
    } as Partial<VenueSpace>;
    try {
      if (spaceForm._id) await venueService.updateSpace(spaceForm._id, body);
      else await venueService.createSpace(body);
      setSpaceForm(null);
      load();
    } catch (err) {
      toast.error(errorText(err, "Couldn't save the space"));
    }
  }

  async function removeSpace(s: VenueSpace) {
    if (!confirm(`Remove ${s.name}?`)) return;
    try {
      const r = await venueService.deleteSpace(s._id);
      toast.success(r.archived ? "Switched off (it has past reservations)" : "Removed");
      load();
    } catch (err) {
      toast.error(errorText(err, "Couldn't remove the space"));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }
  if (locked) {
    return (
      <div className="p-6">
        <div className="max-w-xl mx-auto bg-white rounded-xl border border-amber-200 p-8 text-center">
          <Home className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-gray-900">Venue tools come with the Venue plan</h1>
          <p className="text-sm text-gray-600 mt-2">Manage your halls, place timed holds that release themselves, prevent double bookings and track deposits and balances.</p>
          <Link href="/vendor/dashboard/settings?tab=billing" className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700">
            See plans
          </Link>
        </div>
      </div>
    );
  }

  const today = ymd(new Date());
  const holds = list.filter((r) => r.status === "held");
  const booked = list.filter((r) => r.status === "booked");

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venue</h1>
          <p className="text-sm text-gray-600">
            {holds.length} active hold{holds.length === 1 ? "" : "s"} · {booked.length} upcoming booking{booked.length === 1 ? "" : "s"}
          </p>
        </div>
        <button onClick={() => openNew()} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700">
          <Plus className="w-4 h-4" /> Hold or book a date
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {(["calendar", "holds", "spaces"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500"}`}
          >
            {t === "calendar" ? "Calendar" : t === "holds" ? "Holds & bookings" : `Spaces (${spaces.length})`}
          </button>
        ))}
      </div>

      {tab === "calendar" && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-1.5 rounded hover:bg-gray-100" aria-label="Previous month">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <p className="font-semibold w-40 text-center">{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-1.5 rounded hover:bg-gray-100" aria-label="Next month">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <select value={spaceFilter} onChange={(e) => setSpaceFilter(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm" aria-label="Space">
                <option value="">All spaces</option>
                {spaces.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {(["held", "booked", "blocked"] as const).map((st) => (
                <span key={st} className={`px-2 py-0.5 rounded border ${STATUS_STYLE[st]}`}>
                  {STATUS_LABEL[st]}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-1 py-1 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100">
            {days.map((d) => {
              const key = ymd(d);
              const inMonth = d.getMonth() === month.getMonth();
              const dayRes = reservations.filter((r) => r.dateFrom <= key && r.dateTo >= key);
              return (
                <div key={key} className={`min-h-[96px] p-1 ${inMonth ? "bg-white" : "bg-gray-50"} ${key < today ? "opacity-60" : ""}`}>
                  <button
                    onClick={() => key >= today && openNew(key)}
                    className={`text-xs w-6 h-6 rounded-full ${key === today ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                    aria-label={`Add on ${key}`}
                  >
                    {d.getDate()}
                  </button>
                  <div className="space-y-0.5 mt-0.5">
                    {dayRes.slice(0, 3).map((r) => (
                      <button
                        key={r._id}
                        onClick={() => openEdit(r)}
                        className={`block w-full text-left truncate text-[11px] px-1 py-0.5 rounded border ${STATUS_STYLE[r.status]}`}
                        title={`${spaceName(r, spaces)} · ${SESSION_LABEL[r.session]} · ${r.title || r.clientName || STATUS_LABEL[r.status]}`}
                      >
                        {r.session !== "full" ? (r.session === "morning" ? "AM " : "PM ") : ""}
                        {spaces.length > 1 ? `${spaceName(r, spaces)}: ` : ""}
                        {r.title || r.clientName || STATUS_LABEL[r.status]}
                      </button>
                    ))}
                    {dayRes.length > 3 && <p className="text-[11px] text-gray-500 px-1">+{dayRes.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "holds" && (
        <div className="space-y-5">
          {[
            { title: "Holds", items: holds, empty: "No active holds." },
            { title: "Upcoming bookings", items: booked, empty: "No upcoming bookings." },
            { title: "Blocked dates", items: list.filter((r) => r.status === "blocked"), empty: "No blocked dates." },
          ].map((section) => (
            <div key={section.title} className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">{section.title}</h2>
              {section.items.length === 0 ? (
                <p className="text-sm text-gray-500">{section.empty}</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {section.items.map((r) => {
                    const hoursLeft = r.holdExpiresAt ? Math.round((new Date(r.holdExpiresAt).getTime() - Date.now()) / 3600000) : null;
                    return (
                      <li key={r._id} className="py-3 flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[220px]">
                          <p className="font-medium text-gray-900">{r.title || r.clientName || STATUS_LABEL[r.status]}</p>
                          <p className="text-xs text-gray-500">
                            {spaceName(r, spaces)} · {r.dateFrom}
                            {r.dateTo !== r.dateFrom ? ` to ${r.dateTo}` : ""} · {SESSION_LABEL[r.session]}
                            {r.clientName && r.title ? ` · ${r.clientName}` : ""}
                            {r.clientPhone ? ` · ${r.clientPhone}` : ""}
                          </p>
                          {r.status === "held" && hoursLeft !== null && (
                            <p className={`text-xs mt-0.5 flex items-center gap-1 ${hoursLeft <= 24 ? "text-red-600" : "text-amber-700"}`}>
                              <Clock className="w-3 h-3" /> Hold ends {new Date(r.holdExpiresAt!).toLocaleString()} ({hoursLeft < 48 ? `${hoursLeft}h` : `${Math.round(hoursLeft / 24)} days`} left)
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.status === "held" && (
                            <>
                              <button
                                onClick={() => {
                                  setConverting(r);
                                  setForm({ ...EMPTY_FORM, clientName: r.clientName || "", clientEmail: r.clientEmail || "", clientPhone: r.clientPhone || "" });
                                }}
                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700"
                              >
                                Book it
                              </button>
                              <button onClick={() => extend(r)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50">
                                +3 days
                              </button>
                            </>
                          )}
                          {r.status === "booked" && r.booking && (
                            <Link href={`/vendor/dashboard/bookings/${r.booking}`} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50">
                              Booking & deposits
                            </Link>
                          )}
                          <button onClick={() => openEdit(r)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50">
                            Edit / move
                          </button>
                          <button onClick={() => release(r)} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50">
                            {r.status === "held" ? "Release" : r.status === "blocked" ? "Unblock" : "Free space"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "spaces" && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Spaces and halls</h2>
            <button onClick={() => setSpaceForm({ name: "", seated: "", standing: "", pricePerDay: "" })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700">
              <Plus className="w-4 h-4" /> Add space
            </button>
          </div>
          {spaceForm && (
            <form onSubmit={saveSpace} className="grid sm:grid-cols-5 gap-3 border border-purple-100 bg-purple-50/40 rounded-lg p-4">
              <input className={`${input} sm:col-span-2`} required placeholder="Name (e.g. Main hall) *" value={spaceForm.name} onChange={(e) => setSpaceForm({ ...spaceForm, name: e.target.value })} />
              <input className={input} type="number" min={0} placeholder="Seated" value={spaceForm.seated} onChange={(e) => setSpaceForm({ ...spaceForm, seated: e.target.value === "" ? "" : Number(e.target.value) })} />
              <input className={input} type="number" min={0} placeholder="Standing" value={spaceForm.standing} onChange={(e) => setSpaceForm({ ...spaceForm, standing: e.target.value === "" ? "" : Number(e.target.value) })} />
              <input className={input} type="number" min={0} placeholder="Price per day (₦)" value={spaceForm.pricePerDay} onChange={(e) => setSpaceForm({ ...spaceForm, pricePerDay: e.target.value === "" ? "" : Number(e.target.value) })} />
              <div className="sm:col-span-5 flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700">Save</button>
                <button type="button" onClick={() => setSpaceForm(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}
          {spaces.length === 0 ? (
            <p className="text-sm text-gray-500">Add each hall or space you rent out. Each one has its own calendar.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {spaces.map((s) => (
                <li key={s._id} className={`py-3 flex items-center gap-3 ${s.active ? "" : "opacity-60"}`}>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {s.name} {!s.active && <span className="text-xs text-gray-500">(off)</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {[
                        s.capacity?.seated ? `${s.capacity.seated} seated` : null,
                        s.capacity?.standing ? `${s.capacity.standing} standing` : null,
                        s.pricePerDay ? `₦${s.pricePerDay.toLocaleString()}/day` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "No details"}
                    </p>
                  </div>
                  {!s.active && (
                    <button onClick={() => venueService.updateSpace(s._id, { active: true }).then(load)} className="text-xs text-purple-700 hover:underline">
                      Switch on
                    </button>
                  )}
                  <button
                    onClick={() => setSpaceForm({ _id: s._id, name: s.name, seated: s.capacity?.seated ?? "", standing: s.capacity?.standing ?? "", pricePerDay: s.pricePerDay ?? "" })}
                    className="text-xs text-gray-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button onClick={() => removeSpace(s)} className="p-1 text-red-500 hover:bg-red-50 rounded" aria-label={`Remove ${s.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <form onSubmit={converting ? convert : save} className="bg-white rounded-xl shadow-xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{converting ? "Book this hold" : editing ? "Edit reservation" : "Hold, book or block dates"}</h3>
              <button
                type="button"
                onClick={() => {
                  setForm(null);
                  setEditing(null);
                  setConverting(null);
                }}
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {!converting && (
              <>
                {!editing && (
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {(["held", "booked", "blocked"] as const).map((st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setForm({ ...form, status: st })}
                        className={`flex-1 py-1.5 rounded-md text-sm ${form.status === st ? "bg-white shadow-sm font-medium" : "text-gray-600"}`}
                      >
                        {st === "held" ? "Hold" : st === "booked" ? "Book" : "Block"}
                      </button>
                    ))}
                  </div>
                )}
                <select className={input} value={form.space} onChange={(e) => setForm({ ...form, space: e.target.value })} required aria-label="Space">
                  {spaces
                    .filter((s) => s.active || s._id === form.space)
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-xs text-gray-500">
                    From
                    <input type="date" required className={input} value={form.dateFrom} onChange={(e) => setForm({ ...form, dateFrom: e.target.value, dateTo: form.dateTo && form.dateTo >= e.target.value ? form.dateTo : e.target.value })} />
                  </label>
                  <label className="text-xs text-gray-500">
                    To
                    <input type="date" className={input} min={form.dateFrom} value={form.dateTo} onChange={(e) => setForm({ ...form, dateTo: e.target.value })} />
                  </label>
                  <label className="text-xs text-gray-500">
                    Session
                    <select className={input} value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value as VenueSession })}>
                      <option value="full">Full day</option>
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                    </select>
                  </label>
                </div>
                <input className={input} placeholder={form.status === "blocked" ? "Reason (e.g. Maintenance)" : "Event (e.g. Adeyemi wedding)"} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </>
            )}

            {(converting || form.status !== "blocked" || editing) && (
              <div className="grid grid-cols-2 gap-2">
                <input className={input} placeholder={form.status === "booked" || converting ? "Client name *" : "Client name"} required={!!converting || (!editing && form.status === "booked")} value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
                <input className={input} placeholder="Phone" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
                <input className={input} type="email" placeholder="Email (for payment reminders)" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} />
                {!converting && <input className={input} type="number" min={0} placeholder="Guests" value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value === "" ? "" : Number(e.target.value) })} />}
              </div>
            )}

            {!editing && !converting && form.status === "held" && (
              <label className="text-xs text-gray-500 block">
                Hold until (leave empty for 3 days)
                <input type="datetime-local" className={input} value={form.holdExpiresAt} onChange={(e) => setForm({ ...form, holdExpiresAt: e.target.value })} />
              </label>
            )}

            {(converting || (!editing && form.status === "booked")) && (
              <div className="grid grid-cols-3 gap-2">
                <label className="text-xs text-gray-500">
                  Total (₦)
                  <input type="number" min={0} className={input} value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value === "" ? "" : Number(e.target.value) })} />
                </label>
                <label className="text-xs text-gray-500">
                  Deposit (₦)
                  <input type="number" min={0} className={input} value={form.depositAmount} onChange={(e) => setForm({ ...form, depositAmount: e.target.value === "" ? "" : Number(e.target.value) })} />
                </label>
                <label className="text-xs text-gray-500">
                  Deposit due
                  <input type="date" className={input} value={form.depositDueDate} onChange={(e) => setForm({ ...form, depositDueDate: e.target.value })} />
                </label>
              </div>
            )}

            {!converting && <textarea className={input} rows={2} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />}

            <button disabled={busy} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {converting ? "Book it" : editing ? "Save" : form.status === "held" ? "Place hold" : form.status === "booked" ? "Book" : "Block dates"}
            </button>
            {editing && (
              <button type="button" onClick={() => { const r = editing; setForm(null); setEditing(null); release(r); }} className="w-full py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50">
                {editing.status === "held" ? "Release hold" : editing.status === "blocked" ? "Unblock" : "Free this space"}
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
