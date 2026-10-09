"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Gift as GiftIcon, Heart, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import EventSubNav from "@/components/user/events/EventSubNav";
import PlusGate from "@/components/user/events/PlusGate";
import { celebrationPlusService as svc, Gift, GiftCategory, GiftInput, GiftSummary, ThankYouMethod } from "@/services/celebration-plus.service";
import { clientEventService, Guest } from "@/services/client-event.service";

const naira = (n?: number) => `₦${Math.round(n || 0).toLocaleString()}`;
const errorText = (err: any, fallback: string) => err?.response?.data?.message || fallback;
const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500";
const CATEGORIES: Array<{ value: GiftCategory; label: string }> = [
  { value: "item", label: "Item" },
  { value: "cash", label: "Cash" },
  { value: "voucher", label: "Voucher" },
  { value: "experience", label: "Experience" },
  { value: "other", label: "Other" },
];
const METHODS: Array<{ value: ThankYouMethod; label: string }> = [
  { value: "message", label: "Message" },
  { value: "card", label: "Card" },
  { value: "call", label: "Call" },
  { value: "in_person", label: "In person" },
  { value: "other", label: "Other" },
];
type Tab = "received" | "registry";
const EMPTY: GiftInput = { title: "", category: "item", amount: "", link: "", quantityWanted: 1, fromName: "", guest: "", registryItem: "", receivedAt: "", notes: "" };

function GiftsScreen({ eventId }: { eventId: string }) {
  const [tab, setTab] = useState<Tab>("received");
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [summary, setSummary] = useState<GiftSummary | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [form, setForm] = useState<GiftInput>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [onlyPending, setOnlyPending] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [method, setMethod] = useState<ThankYouMethod>("message");

  const load = useCallback(async () => {
    try {
      const data = await svc.getGifts(eventId);
      setGifts(data.gifts);
      setSummary(data.summary);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
    clientEventService
      .getGuests(eventId)
      .then((d) => setGuests(d.guests))
      .catch(() => {});
  }, [load, eventId]);

  const registry = gifts.filter((g) => g.kind === "registry");
  const received = gifts.filter((g) => g.kind === "received");
  const shown = tab === "registry" ? registry : received.filter((g) => !onlyPending || g.thankYou?.status !== "sent");

  function startAdd() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function startEdit(g: Gift) {
    setEditing(g._id);
    setShowForm(true);
    setForm({
      title: g.title,
      category: g.category,
      amount: g.amount ?? "",
      link: g.link || "",
      quantityWanted: g.quantityWanted,
      fromName: g.fromName || "",
      guest: g.guest?._id || "",
      registryItem: g.registryItem || "",
      receivedAt: g.receivedAt ? g.receivedAt.slice(0, 10) : "",
      notes: g.notes || "",
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const body: GiftInput = {
      title: form.title,
      category: form.category,
      amount: form.amount === "" ? "" : Number(form.amount), // "" clears it
      notes: form.notes,
    };
    if (tab === "registry") {
      body.link = form.link;
      body.quantityWanted = Number(form.quantityWanted) || 1;
    } else {
      body.fromName = form.fromName;
      body.guest = form.guest || null;
      body.registryItem = form.registryItem || null;
      if (form.receivedAt) body.receivedAt = form.receivedAt;
    }
    try {
      if (editing) await svc.updateGift(eventId, editing, body);
      else await svc.addGift(eventId, { ...body, kind: tab });
      setShowForm(false);
      setForm(EMPTY);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errorText(err, "Couldn't save the gift"));
    } finally {
      setBusy(false);
    }
  }

  async function remove(g: Gift) {
    if (!confirm(`Delete "${g.title}"?`)) return;
    try {
      await svc.deleteGift(eventId, g._id);
      load();
    } catch (err) {
      toast.error(errorText(err, "Couldn't delete the gift"));
    }
  }

  async function thank(ids: string[], sent: boolean) {
    if (!ids.length) return;
    try {
      await svc.setThankYou(eventId, ids, sent, sent ? method : undefined);
      setSelected([]);
      load();
    } catch (err) {
      toast.error(errorText(err, "Couldn't update"));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-700">Couldn&apos;t load your gifts.</p>
        <button onClick={load} className="mt-2 text-sm text-purple-700 underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["Gifts received", summary.received.count],
            ["Cash received", naira(summary.received.cashTotal)],
            ["Thank-yous to send", summary.received.thankYouPending],
            ["Registry fulfilled", `${summary.registry.fulfilled} of ${summary.registry.items}`],
          ].map(([label, value]) => (
            <div key={label as string} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["received", "registry"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setShowForm(false);
                setSelected([]);
              }}
              className={`px-3 py-1.5 rounded-md text-sm ${tab === t ? "bg-white shadow-sm font-medium text-gray-900" : "text-gray-600"}`}
            >
              {t === "received" ? `Received (${received.length})` : `Registry (${registry.length})`}
            </button>
          ))}
        </div>
        <button onClick={startAdd} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700">
          <Plus className="w-4 h-4" /> {tab === "received" ? "Record a gift" : "Add to registry"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 grid sm:grid-cols-3 gap-3">
          <input className={`${input} sm:col-span-2`} required placeholder="Gift *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as GiftCategory })}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            className={input}
            type="number"
            min={0}
            placeholder={tab === "registry" ? "Price (₦)" : "Value (₦)"}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value === "" ? "" : Number(e.target.value) })}
          />
          {tab === "registry" ? (
            <>
              <input className={input} placeholder="Link to the item (https://…)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              <label className="text-xs text-gray-500">
                How many
                <input className={input} type="number" min={1} max={1000} value={form.quantityWanted} onChange={(e) => setForm({ ...form, quantityWanted: Number(e.target.value) })} />
              </label>
            </>
          ) : (
            <>
              <select
                className={input}
                value={form.guest || ""}
                onChange={(e) => {
                  const guest = guests.find((g) => g._id === e.target.value);
                  setForm({ ...form, guest: e.target.value, fromName: guest ? guest.name : form.fromName });
                }}
              >
                <option value="">Guest (optional)</option>
                {guests.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <input className={input} required placeholder="From *" value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} />
              <select className={input} value={form.registryItem || ""} onChange={(e) => setForm({ ...form, registryItem: e.target.value })}>
                <option value="">Not from the registry</option>
                {registry.map((r) => (
                  <option key={r._id} value={r._id}>
                    Registry: {r.title}
                  </option>
                ))}
              </select>
              <label className="text-xs text-gray-500">
                Received on
                <input className={input} type="date" value={form.receivedAt} onChange={(e) => setForm({ ...form, receivedAt: e.target.value })} />
              </label>
            </>
          )}
          <input className={`${input} sm:col-span-3`} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="sm:col-span-3 flex gap-2">
            <button disabled={busy} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
              {editing ? "Save" : "Add"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {tab === "received" && received.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} /> Only thank-yous to send
          </label>
          {selected.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-gray-600">{selected.length} selected</span>
              <select className="border border-gray-300 rounded-lg px-2 py-1 text-sm" value={method} onChange={(e) => setMethod(e.target.value as ThankYouMethod)} aria-label="Thank-you method">
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <button onClick={() => thank(selected, true)} className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
                Mark thanked
              </button>
            </div>
          )}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          {tab === "registry" ? <GiftIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" /> : <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />}
          <p className="text-gray-700 font-medium">{tab === "registry" ? "Your registry is empty" : "No gifts recorded yet"}</p>
          <p className="text-gray-500 text-sm mt-1">
            {tab === "registry" ? "List what you'd love to receive." : "Record gifts as they arrive so nobody misses a thank-you."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-100">
          {shown.map((g) => {
            const thanked = g.thankYou?.status === "sent";
            return (
              <div key={g._id} className="p-4 flex flex-wrap items-center gap-3">
                {g.kind === "received" && (
                  <input
                    type="checkbox"
                    aria-label={`Select ${g.title}`}
                    checked={selected.includes(g._id)}
                    onChange={(e) => setSelected(e.target.checked ? [...selected, g._id] : selected.filter((x) => x !== g._id))}
                  />
                )}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {g.title}
                    {g.link && (
                      <a href={g.link} target="_blank" rel="noopener noreferrer" className="text-purple-600" aria-label="Open link">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {g.kind === "registry"
                      ? [`${g.quantityReceived} of ${g.quantityWanted} received`, g.amount ? naira(g.amount) : null].filter(Boolean).join(" · ")
                      : [
                          `From ${g.fromName}`,
                          g.category !== "item" ? g.category : null,
                          g.amount ? naira(g.amount) : null,
                          g.receivedAt ? new Date(g.receivedAt).toLocaleDateString() : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                  </p>
                </div>
                {g.kind === "registry" ? (
                  g.quantityReceived >= g.quantityWanted && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Fulfilled</span>
                  )
                ) : (
                  <button
                    onClick={() => thank([g._id], !thanked)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${thanked ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}
                    title={thanked ? "Click to mark as not sent" : "Click to mark as thanked"}
                  >
                    {thanked ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                    {thanked ? "Thanked" : "Thank-you to send"}
                  </button>
                )}
                <button onClick={() => startEdit(g)} className="p-1.5 rounded text-gray-500 hover:bg-gray-100" aria-label={`Edit ${g.title}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(g)} className="p-1.5 rounded text-red-500 hover:bg-red-50" aria-label={`Delete ${g.title}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GiftsPage() {
  const { id } = useParams() as { id: string };
  return (
    <div className="max-w-5xl">
      <EventSubNav eventId={id} />
      <PlusGate
        eventId={id}
        feature="giftTracking"
        title="Gift tracking"
        description="Keep a gift registry, record every gift and cash envelope as it arrives, and tick off thank-yous so nobody is missed."
      >
        <GiftsScreen eventId={id} />
      </PlusGate>
    </div>
  );
}
