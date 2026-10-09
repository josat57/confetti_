"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Loader2, Pencil, Plus, Scissors, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import EventSubNav from "@/components/user/events/EventSubNav";
import PlusGate from "@/components/user/events/PlusGate";
import { celebrationPlusService as svc, AsoEbiFabric, AsoEbiOrder, AsoEbiOverview, AsoEbiUnit, saveBlob } from "@/services/celebration-plus.service";
import { clientEventService, Guest } from "@/services/client-event.service";

const naira = (n?: number) => `₦${Math.round(n || 0).toLocaleString()}`;
const errorText = (err: any, fallback: string) => err?.response?.data?.message || fallback;
const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500";
const UNITS: AsoEbiUnit[] = ["piece", "yard", "set", "bundle"];
const PAY_STYLE = { unpaid: "bg-red-100 text-red-700", partial: "bg-amber-100 text-amber-800", paid: "bg-green-100 text-green-700" };
const COLLECT_STYLE = { pending: "bg-gray-100 text-gray-600", ready: "bg-blue-100 text-blue-700", collected: "bg-green-100 text-green-700" };

type FabricForm = { name: string; price: number | ""; unit: AsoEbiUnit; color: string; stock: number | "" };
type OrderForm = { fabric: string; guest: string; name: string; phone: string; quantity: number; size: string; measurements: string; amountPaid: number | ""; notes: string };
const EMPTY_FABRIC: FabricForm = { name: "", price: "", unit: "piece", color: "", stock: "" };
const EMPTY_ORDER: OrderForm = { fabric: "", guest: "", name: "", phone: "", quantity: 1, size: "", measurements: "", amountPaid: "", notes: "" };

function AsoEbiScreen({ eventId }: { eventId: string }) {
  const [data, setData] = useState<AsoEbiOverview | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [filters, setFilters] = useState({ fabric: "", payment: "", collection: "", q: "" });
  const [fabricForm, setFabricForm] = useState<FabricForm | null>(null);
  const [editingFabric, setEditingFabric] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState<OrderForm | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [paying, setPaying] = useState<AsoEbiOrder | null>(null);
  const [payment, setPayment] = useState({ amount: "" as number | "", method: "transfer", note: "" });
  const [selected, setSelected] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      setData(
        await svc.getAsoEbi(eventId, {
          fabric: filters.fabric || undefined,
          payment: filters.payment || undefined,
          collection: filters.collection || undefined,
          q: filters.q || undefined,
        })
      );
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [eventId, filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    clientEventService
      .getGuests(eventId)
      .then((d) => setGuests(d.guests))
      .catch(() => {});
  }, [eventId]);

  async function act(key: string, fn: () => Promise<unknown>, success?: string) {
    setBusy(key);
    try {
      await fn();
      if (success) toast.success(success);
      await load();
      return true;
    } catch (err) {
      toast.error(errorText(err, "Something went wrong"));
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function saveFabric(e: React.FormEvent) {
    e.preventDefault();
    if (!fabricForm) return;
    const body = { name: fabricForm.name, price: Number(fabricForm.price), unit: fabricForm.unit, color: fabricForm.color, stock: fabricForm.stock };
    const ok = await act("fabric", () => (editingFabric ? svc.updateFabric(eventId, editingFabric, body) : svc.addFabric(eventId, body)));
    if (ok) {
      setFabricForm(null);
      setEditingFabric(null);
    }
  }

  async function saveOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!orderForm) return;
    const common = {
      fabric: orderForm.fabric,
      name: orderForm.name,
      phone: orderForm.phone,
      quantity: Number(orderForm.quantity),
      size: orderForm.size,
      measurements: orderForm.measurements,
      notes: orderForm.notes,
    };
    const ok = await act("order", () =>
      editingOrder
        ? svc.updateOrder(eventId, editingOrder, common)
        : svc.addOrder(eventId, { ...common, guest: orderForm.guest || undefined, amountPaid: orderForm.amountPaid })
    );
    if (ok) {
      setOrderForm(null);
      setEditingOrder(null);
    }
  }

  function editOrder(o: AsoEbiOrder) {
    setEditingOrder(o._id);
    setOrderForm({
      fabric: o.fabric,
      guest: o.guest || "",
      name: o.name,
      phone: o.phone || "",
      quantity: o.quantity,
      size: o.size || "",
      measurements: o.measurements || "",
      amountPaid: "",
      notes: o.notes || "",
    });
  }

  async function savePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paying) return;
    const ok = await act("pay", () => svc.recordPayment(eventId, paying._id, { amount: Number(payment.amount), method: payment.method, note: payment.note }), "Payment recorded");
    if (ok) {
      setPaying(null);
      setPayment({ amount: "", method: "transfer", note: "" });
    }
  }

  async function exportCsv() {
    setBusy("csv");
    try {
      saveBlob(await svc.asoEbiCsv(eventId), "aso-ebi-orders.csv");
    } catch {
      toast.error("Couldn't export the orders");
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
  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-700">Couldn&apos;t load aso-ebi.</p>
        <button onClick={load} className="mt-2 text-sm text-purple-700 underline">
          Try again
        </button>
      </div>
    );
  }

  const fabricName = (id: string) => data.fabrics.find((f) => f._id === id)?.name || "Fabric";
  const activeFabrics = data.fabrics.filter((f) => f.active);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Orders", data.summary.orders],
          ["Collected", `${naira(data.summary.paid)} of ${naira(data.summary.due)}`],
          ["Outstanding", naira(data.summary.outstanding)],
          ["Picked up", `${data.summary.collection.collected} of ${data.summary.orders}`],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Fabrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Scissors className="w-4 h-4" /> Fabrics
          </h3>
          <button
            onClick={() => {
              setEditingFabric(null);
              setFabricForm(EMPTY_FABRIC);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" /> Add fabric
          </button>
        </div>
        {fabricForm && (
          <form onSubmit={saveFabric} className="grid sm:grid-cols-5 gap-3 mb-4 border border-purple-100 bg-purple-50/40 rounded-lg p-4">
            <input className={`${input} sm:col-span-2`} required placeholder="Fabric (e.g. Gold lace) *" value={fabricForm.name} onChange={(e) => setFabricForm({ ...fabricForm, name: e.target.value })} />
            <input className={input} required type="number" min={0} placeholder="Price (₦) *" value={fabricForm.price} onChange={(e) => setFabricForm({ ...fabricForm, price: e.target.value === "" ? "" : Number(e.target.value) })} />
            <select className={input} value={fabricForm.unit} onChange={(e) => setFabricForm({ ...fabricForm, unit: e.target.value as AsoEbiUnit })} aria-label="Unit">
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  per {u}
                </option>
              ))}
            </select>
            <input className={input} type="number" min={0} placeholder="Stock (optional)" value={fabricForm.stock} onChange={(e) => setFabricForm({ ...fabricForm, stock: e.target.value === "" ? "" : Number(e.target.value) })} />
            <input className={`${input} sm:col-span-2`} placeholder="Colour" value={fabricForm.color} onChange={(e) => setFabricForm({ ...fabricForm, color: e.target.value })} />
            <div className="sm:col-span-3 flex gap-2">
              <button disabled={busy === "fabric"} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
                {editingFabric ? "Save" : "Add"}
              </button>
              <button type="button" onClick={() => setFabricForm(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}
        {data.fabrics.length === 0 ? (
          <p className="text-sm text-gray-500">Add the fabrics your family and friends can order.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.fabrics.map((f: AsoEbiFabric) => (
              <div key={f._id} className={`border rounded-lg p-3 ${f.active ? "border-gray-200" : "border-dashed border-gray-200 opacity-70"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{f.name}</p>
                    <p className="text-xs text-gray-500">
                      {naira(f.price)} per {f.unit}
                      {f.color ? ` · ${f.color}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingFabric(f._id);
                        setFabricForm({ name: f.name, price: f.price, unit: f.unit, color: f.color || "", stock: f.stock ?? "" });
                      }}
                      className="p-1 rounded text-gray-500 hover:bg-gray-100"
                      aria-label={`Edit ${f.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        f.orders > 0
                          ? act(`fabric-${f._id}`, () => svc.updateFabric(eventId, f._id, { active: !f.active }), f.active ? "Orders closed" : "Orders reopened")
                          : confirm(`Delete ${f.name}?`) && act(`fabric-${f._id}`, () => svc.deleteFabric(eventId, f._id))
                      }
                      className="p-1 rounded text-gray-500 hover:bg-gray-100 text-xs"
                      aria-label={f.orders > 0 ? (f.active ? "Close orders" : "Reopen orders") : `Delete ${f.name}`}
                      title={f.orders > 0 ? (f.active ? "Stop taking orders" : "Take orders again") : "Delete"}
                    >
                      {f.orders > 0 ? (f.active ? "Close" : "Reopen") : <Trash2 className="w-4 h-4 text-red-500" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {f.ordered} ordered{f.remaining !== null ? ` · ${f.remaining} left` : ""} · {naira(f.paid)} of {naira(f.due)} paid
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Orders</h3>
          <div className="flex gap-2">
            <button onClick={exportCsv} disabled={busy === "csv"} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-50">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              disabled={!activeFabrics.length}
              onClick={() => {
                setEditingOrder(null);
                setOrderForm({ ...EMPTY_ORDER, fabric: activeFabrics[0]?._id || "" });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50"
              title={activeFabrics.length ? undefined : "Add a fabric first"}
            >
              <Plus className="w-4 h-4" /> New order
            </button>
          </div>
        </div>

        {orderForm && (
          <form onSubmit={saveOrder} className="grid sm:grid-cols-4 gap-3 mb-4 border border-purple-100 bg-purple-50/40 rounded-lg p-4">
            <select className={input} required value={orderForm.fabric} onChange={(e) => setOrderForm({ ...orderForm, fabric: e.target.value })} aria-label="Fabric">
              {data.fabrics
                .filter((f) => f.active || f._id === orderForm.fabric)
                .map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({naira(f.price)}/{f.unit})
                  </option>
                ))}
            </select>
            {!editingOrder && (
              <select
                className={input}
                value={orderForm.guest}
                onChange={(e) => {
                  const g = guests.find((x) => x._id === e.target.value);
                  setOrderForm({ ...orderForm, guest: e.target.value, name: g?.name || orderForm.name, phone: g?.phone || orderForm.phone });
                }}
                aria-label="Guest"
              >
                <option value="">Guest (optional)</option>
                {guests.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
            <input className={input} required placeholder="Name *" value={orderForm.name} onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })} />
            <input className={input} placeholder="Phone" value={orderForm.phone} onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })} />
            <label className="text-xs text-gray-500">
              Quantity
              <input className={input} type="number" min={1} max={1000} required value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })} />
            </label>
            <label className="text-xs text-gray-500">
              Size
              <select className={input} value={orderForm.size} onChange={(e) => setOrderForm({ ...orderForm, size: e.target.value })}>
                <option value="">—</option>
                {data.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s === "custom" ? "Custom (measurements)" : s}
                  </option>
                ))}
              </select>
            </label>
            <input className={`${input} sm:col-span-2 self-end`} placeholder="Measurements / notes for the tailor" value={orderForm.measurements} onChange={(e) => setOrderForm({ ...orderForm, measurements: e.target.value })} />
            {!editingOrder && (
              <label className="text-xs text-gray-500">
                Paid already (₦)
                <input className={input} type="number" min={0} value={orderForm.amountPaid} onChange={(e) => setOrderForm({ ...orderForm, amountPaid: e.target.value === "" ? "" : Number(e.target.value) })} />
              </label>
            )}
            <div className="sm:col-span-4 flex gap-2">
              <button disabled={busy === "order"} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
                {editingOrder ? "Save order" : "Add order"}
              </button>
              <button type="button" onClick={() => setOrderForm(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <input className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" placeholder="Search name or phone" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm" value={filters.fabric} onChange={(e) => setFilters({ ...filters, fabric: e.target.value })} aria-label="Filter by fabric">
            <option value="">All fabrics</option>
            {data.fabrics.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>
          <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm" value={filters.payment} onChange={(e) => setFilters({ ...filters, payment: e.target.value })} aria-label="Filter by payment">
            <option value="">Any payment</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Part paid</option>
            <option value="paid">Paid</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm" value={filters.collection} onChange={(e) => setFilters({ ...filters, collection: e.target.value })} aria-label="Filter by collection">
            <option value="">Any collection</option>
            <option value="pending">Not ready</option>
            <option value="ready">Ready to collect</option>
            <option value="collected">Collected</option>
          </select>
          {selected.length > 0 && (
            <div className="flex items-center gap-2 ml-auto text-sm">
              <span className="text-gray-600">{selected.length} selected</span>
              <button onClick={() => act("bulk", () => svc.setCollection(eventId, selected, "ready")).then(() => setSelected([]))} className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">
                Ready
              </button>
              <button onClick={() => act("bulk", () => svc.setCollection(eventId, selected, "collected")).then(() => setSelected([]))} className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
                Collected
              </button>
            </div>
          )}
        </div>

        {data.orders.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No orders{filters.q || filters.fabric || filters.payment || filters.collection ? " match" : " yet"}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="py-2 pr-2"></th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Fabric</th>
                  <th className="py-2 pr-3">Qty / size</th>
                  <th className="py-2 pr-3">Paid</th>
                  <th className="py-2 pr-3">Collection</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o._id} className="border-b border-gray-50 align-top">
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        aria-label={`Select ${o.name}`}
                        checked={selected.includes(o._id)}
                        onChange={(e) => setSelected(e.target.checked ? [...selected, o._id] : selected.filter((x) => x !== o._id))}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{o.name}</p>
                      {o.phone && <p className="text-xs text-gray-500">{o.phone}</p>}
                    </td>
                    <td className="py-2 pr-3">{fabricName(o.fabric)}</td>
                    <td className="py-2 pr-3">
                      {o.quantity}
                      {o.size ? ` · ${o.size}` : ""}
                      {o.measurements && <p className="text-xs text-gray-500 max-w-[180px] truncate" title={o.measurements}>{o.measurements}</p>}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PAY_STYLE[o.paymentStatus]}`}>
                        {naira(o.amountPaid)} / {naira(o.amountDue)}
                      </span>
                      {o.balance > 0 && (
                        <button
                          onClick={() => {
                            setPaying(o);
                            setPayment({ amount: o.balance, method: "transfer", note: "" });
                          }}
                          className="block mt-1 text-xs text-purple-700 hover:underline"
                        >
                          Record payment
                        </button>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        className={`text-xs rounded-full px-2 py-0.5 border-0 ${COLLECT_STYLE[o.collectionStatus]}`}
                        value={o.collectionStatus}
                        onChange={(e) => act(`c-${o._id}`, () => svc.setCollection(eventId, [o._id], e.target.value as AsoEbiOrder["collectionStatus"]))}
                        aria-label="Collection status"
                      >
                        <option value="pending">Not ready</option>
                        <option value="ready">Ready</option>
                        <option value="collected">Collected</option>
                      </select>
                    </td>
                    <td className="py-2 whitespace-nowrap">
                      <button onClick={() => editOrder(o)} className="p-1 rounded text-gray-500 hover:bg-gray-100" aria-label={`Edit ${o.name}'s order`}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirm(`Delete ${o.name}'s order?`) && act(`d-${o._id}`, () => svc.deleteOrder(eventId, o._id))}
                        className="p-1 rounded text-red-500 hover:bg-red-50"
                        aria-label={`Delete ${o.name}'s order`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {paying && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <form onSubmit={savePayment} className="bg-white rounded-xl shadow-xl p-5 w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Payment from {paying.name}</h3>
              <button type="button" onClick={() => setPaying(null)} aria-label="Close">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600">Outstanding: {naira(paying.balance)}</p>
            <input className={input} type="number" min={1} max={paying.balance} required value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value === "" ? "" : Number(e.target.value) })} aria-label="Amount" />
            <select className={input} value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })} aria-label="Method">
              <option value="transfer">Bank transfer</option>
              <option value="cash">Cash</option>
              <option value="pos">POS</option>
              <option value="other">Other</option>
            </select>
            <input className={input} placeholder="Note (optional)" value={payment.note} onChange={(e) => setPayment({ ...payment, note: e.target.value })} />
            {paying.payments.length > 0 && (
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-medium">Earlier payments</p>
                {paying.payments.map((p) => (
                  <div key={p._id} className="flex items-center justify-between">
                    <span>
                      {naira(p.amount)} · {p.method} · {new Date(p.at).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        confirm("Remove this payment?") &&
                        act("pay", () => svc.removePayment(eventId, paying._id, p._id)).then((ok) => ok && setPaying(null))
                      }
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button disabled={busy === "pay"} className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
              Record payment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function AsoEbiPage() {
  const { id } = useParams() as { id: string };
  return (
    <div className="max-w-6xl">
      <EventSubNav eventId={id} />
      <PlusGate
        eventId={id}
        feature="asoEbi"
        title="Aso-ebi tracking"
        description="List your aso-ebi fabrics, take orders with sizes, track who has paid and who has collected, and export the list for your tailor."
      >
        <AsoEbiScreen eventId={id} />
      </PlusGate>
    </div>
  );
}
