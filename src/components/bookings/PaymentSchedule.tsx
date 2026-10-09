"use client";

import { useState } from "react";
import { CalendarClock, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { PaymentScheduleView } from "@/types/booking.types";

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  partial: "bg-blue-100 text-blue-700",
  upcoming: "bg-gray-100 text-gray-600",
  due_soon: "bg-amber-100 text-amber-800",
  overdue: "bg-red-100 text-red-700",
};
const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  partial: "Part paid",
  upcoming: "Upcoming",
  due_soon: "Due soon",
  overdue: "Overdue",
};

type Row = { label: string; amount: number | ""; dueDate: string };

/**
 * Deposit and balance schedule for a booking. Read-only for clients; the venue
 * can edit it (onSave) — instalments must add up to the booking total.
 */
export default function PaymentSchedule({
  schedule,
  currency = "NGN",
  onSave,
}: {
  schedule?: PaymentScheduleView | null;
  currency?: string;
  onSave?: (items: Array<{ label: string; amount: number; dueDate: string }>, totalAmount?: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const money = (n: number) => `${currency === "NGN" ? "₦" : `${currency} `}${Math.round(n || 0).toLocaleString()}`;

  function startEdit() {
    const explicit = schedule?.items.filter((i) => i.explicit) || [];
    const base = explicit.length ? explicit : schedule?.items || [];
    setRows(
      base.length
        ? base.map((i) => ({ label: i.label, amount: i.amount, dueDate: i.dueDate ? i.dueDate.slice(0, 10) : "" }))
        : [{ label: "Deposit", amount: "", dueDate: "" }, { label: "Balance", amount: "", dueDate: "" }]
    );
    setTotal(schedule?.total || "");
    setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(
        rows.map((r) => ({ label: r.label, amount: Number(r.amount), dueDate: r.dueDate })),
        total === "" ? undefined : Number(total)
      );
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const sum = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  if (editing) {
    return (
      <form onSubmit={save} className="space-y-3">
        <label className="block text-sm text-gray-700">
          Booking total
          <input
            type="number"
            min={0}
            className="mt-1 w-48 border border-gray-300 rounded-lg px-3 py-1.5 text-sm block"
            value={total}
            onChange={(e) => setTotal(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input
              className="col-span-4 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              placeholder="Label"
              value={r.label}
              onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              aria-label="Instalment label"
            />
            <input
              className="col-span-3 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              type="number"
              min={1}
              required
              placeholder="Amount"
              value={r.amount}
              onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, amount: e.target.value === "" ? "" : Number(e.target.value) } : x)))}
              aria-label="Amount"
            />
            <input
              className="col-span-4 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              type="date"
              required
              value={r.dueDate}
              onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, dueDate: e.target.value } : x)))}
              aria-label="Due date"
            />
            <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="col-span-1 p-1 text-red-500" aria-label="Remove instalment">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setRows([...rows, { label: `Instalment ${rows.length + 1}`, amount: "", dueDate: "" }])}
            disabled={rows.length >= 12}
            className="flex items-center gap-1 text-purple-700 hover:underline disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> Add instalment
          </button>
          <span className={total !== "" && sum !== Number(total) ? "text-red-600" : "text-gray-600"}>
            Adds up to {money(sum)}
            {total !== "" ? ` of ${money(Number(total))}` : ""}
          </span>
        </div>
        <p className="text-xs text-gray-500">The first instalment is the deposit. Confetti reminds the client 3 days before each one is due and if it&apos;s late.</p>
        <div className="flex gap-2">
          <button disabled={saving} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save schedule
          </button>
          <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (!schedule?.items.length) {
    return (
      <div className="text-sm text-gray-500 flex items-center justify-between gap-2">
        <span>No payment schedule yet.</span>
        {onSave && (
          <button onClick={startEdit} className="flex items-center gap-1 text-purple-700 hover:underline">
            <Plus className="w-4 h-4" /> Set a schedule
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {schedule.nextDue && (
        <p className={`text-sm flex items-center gap-1.5 ${schedule.nextDue.status === "overdue" ? "text-red-700" : "text-gray-700"}`}>
          <CalendarClock className="w-4 h-4" />
          Next: {schedule.nextDue.label} {money(schedule.nextDue.amount)}
          {schedule.nextDue.dueDate ? ` by ${new Date(schedule.nextDue.dueDate).toLocaleDateString()}` : ""}
        </p>
      )}
      <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
        {schedule.items.map((i, idx) => (
          <li key={i._id || idx} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
            <span className="font-medium text-gray-900">{i.label}</span>
            <span className="text-gray-600">{i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "No due date"}</span>
            <span className="text-gray-900">
              {money(i.amount)}
              {i.paid > 0 && i.outstanding > 0 ? <span className="text-xs text-gray-500"> ({money(i.paid)} paid)</span> : null}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLE[i.status]}`}>{STATUS_LABEL[i.status]}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Paid {money(schedule.paid)} of {money(schedule.total)} · balance {money(schedule.balance)}
        </span>
        {onSave && (
          <button onClick={startEdit} className="flex items-center gap-1 text-purple-700 hover:underline">
            <Pencil className="w-3.5 h-3.5" /> Edit schedule
          </button>
        )}
      </div>
    </div>
  );
}
