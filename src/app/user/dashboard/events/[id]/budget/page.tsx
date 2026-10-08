"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Crown, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import EventSubNav from "@/components/user/events/EventSubNav";
import { clientEventService, Budget, Expense, EXPENSE_CATEGORIES } from "@/services/client-event.service";
import { eventPassService } from "@/services/event-pass.service";

const money = (amount: number, currency = "NGN") =>
  `${currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency === "GBP" ? "£" : `${currency} `}${Math.round(amount || 0).toLocaleString()}`;
const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const EMPTY_EXPENSE: Partial<Expense> = { description: "", amount: 0, category: "venue", paymentStatus: "pending", paymentDueDate: "" };

export default function EventBudgetPage() {
  const { id } = useParams() as { id: string };
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canTrack, setCanTrack] = useState(false);
  const [total, setTotal] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [savingTotal, setSavingTotal] = useState(false);
  const [editing, setEditing] = useState<Expense | "new" | null>(null);
  const [form, setForm] = useState<Partial<Expense>>(EMPTY_EXPENSE);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [b, pass] = await Promise.all([
        clientEventService.getBudget(id),
        eventPassService.getPassForEvent(id).catch(() => null),
      ]);
      setBudget(b);
      setCanTrack(!!pass);
      if (b) {
        setTotal(String(b.totalBudget));
        setCurrency(b.currency);
      }
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

  async function saveTotal(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(total);
    if (!(amount >= 0)) return toast.error("Enter your total budget");
    setSavingTotal(true);
    try {
      setBudget(await clientEventService.setBudget(id, amount, currency));
      toast.success("Budget saved");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't save the budget");
    } finally {
      setSavingTotal(false);
    }
  }

  function openExpense(expense: Expense | "new") {
    setEditing(expense);
    setForm(
      expense === "new"
        ? EMPTY_EXPENSE
        : { ...expense, paymentDueDate: expense.paymentDueDate ? expense.paymentDueDate.slice(0, 10) : "" }
    );
  }

  async function saveExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description?.trim() || !(Number(form.amount) > 0)) return toast.error("Add a description and an amount");
    setSaving(true);
    const payload = {
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category,
      paymentStatus: form.paymentStatus,
      paymentDueDate: form.paymentDueDate || undefined,
      notes: form.notes,
    };
    try {
      if (editing === "new") await clientEventService.addExpense(id, payload);
      else if (editing) await clientEventService.updateExpense(id, editing._id, payload);
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't save the expense");
    } finally {
      setSaving(false);
    }
  }

  async function removeExpense(expense: Expense) {
    if (!confirm(`Delete "${expense.description}"?`)) return;
    try {
      await clientEventService.deleteExpense(id, expense._id);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't delete the expense");
    }
  }

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of budget?.expenses || []) if (e.paymentStatus !== "cancelled") map[e.category] = (map[e.category] || 0) + e.amount;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [budget]);

  const due = useMemo(
    () =>
      (budget?.expenses || [])
        .filter((e) => e.paymentStatus !== "paid" && e.paymentStatus !== "cancelled" && e.paymentDueDate)
        .sort((a, b) => new Date(a.paymentDueDate!).getTime() - new Date(b.paymentDueDate!).getTime()),
    [budget]
  );

  if (loading) {
    return (
      <div className="max-w-5xl">
        <EventSubNav eventId={id} />
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  const spent = budget?.totalSpent || 0;
  const pct = budget?.totalBudget ? Math.min(100, (spent / budget.totalBudget) * 100) : 0;

  return (
    <div className="max-w-5xl space-y-5">
      <EventSubNav eventId={id} />
      {error && (
        <p className="text-sm text-red-600">
          Couldn&apos;t load the budget.{" "}
          <button onClick={load} className="underline">
            Try again
          </button>
        </p>
      )}

      <form onSubmit={saveTotal} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-3">
        <label className="text-sm flex-1 min-w-[180px]">
          <span className="text-gray-700 dark:text-gray-300">Total budget</span>
          <input
            type="number"
            min={0}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="e.g. 3000000"
          />
        </label>
        <label className="text-sm">
          <span className="text-gray-700 dark:text-gray-300">Currency</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 block border border-gray-300 rounded-lg px-3 py-2">
            {["NGN", "USD", "GBP", "EUR"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={savingTotal} className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg disabled:opacity-50">
          {savingTotal ? "Saving…" : budget ? "Update" : "Set budget"}
        </button>
      </form>

      {budget && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="text-xl font-bold">{money(budget.totalBudget, budget.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Spent</p>
              <p className="text-xl font-bold">{money(spent, budget.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{budget.remaining < 0 ? "Over budget" : "Remaining"}</p>
              <p className={`text-xl font-bold ${budget.remaining < 0 ? "text-red-600" : "text-green-700"}`}>
                {money(Math.abs(budget.remaining), budget.currency)}
              </p>
            </div>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${budget.isOverBudget ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-purple-600"}`} style={{ width: `${pct}%` }} />
          </div>
          {byCategory.length > 0 && (
            <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {byCategory.map(([cat, amount]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="text-gray-600">{label(cat)}</span>
                  <span className="font-medium">{money(amount, budget.currency)}</span>
                </div>
              ))}
            </div>
          )}
          {budget.alerts?.map((a) => (
            <p key={a.category} className="mt-2 text-xs text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {a.message}
            </p>
          ))}
        </div>
      )}

      {budget && due.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <h2 className="font-semibold mb-2">Payments due</h2>
          <ul className="space-y-1">
            {due.map((e) => {
              const late = new Date(e.paymentDueDate!) < new Date();
              return (
                <li key={e._id} className="flex justify-between text-sm">
                  <span className={late ? "text-red-600" : "text-gray-700"}>
                    {e.description} · {new Date(e.paymentDueDate!).toLocaleDateString()}
                    {late ? " (late)" : ""}
                  </span>
                  <span className="font-medium">{money(e.amount, budget.currency)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {budget && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Expenses</h2>
            {canTrack && (
              <button onClick={() => openExpense("new")} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-purple-600 rounded-lg">
                <Plus className="w-4 h-4" /> Add expense
              </button>
            )}
          </div>
          {!canTrack ? (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              <Crown className="w-5 h-5 flex-shrink-0" />
              <div>
                Track every expense, see what&apos;s due and when, with a Celebration Pass for this event.{" "}
                <Link href={`/user/dashboard/events/${id}`} className="font-medium underline">
                  Upgrade this event
                </Link>
              </div>
            </div>
          ) : budget.expenses.length === 0 ? (
            <p className="text-sm text-gray-500">No expenses yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-gray-500 border-b">
                  <tr>
                    <th className="py-2">Description</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {budget.expenses.map((e) => (
                    <tr key={e._id} className="border-b last:border-0">
                      <td className="py-2">{e.description}</td>
                      <td className="py-2 text-gray-600">{label(e.category)}</td>
                      <td className="py-2 text-gray-600">{label(e.paymentStatus)}</td>
                      <td className="py-2 text-right font-medium">{money(e.amount, budget.currency)}</td>
                      <td className="py-2 text-right whitespace-nowrap">
                        <button onClick={() => openExpense(e)} className="p-1 text-gray-500" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeExpense(e)} className="p-1 text-red-500" title="Delete">
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
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <form onSubmit={saveExpense} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-3">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">{editing === "new" ? "Add expense" : "Edit expense"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is it for?" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            <input type="number" min={0} value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="Amount" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Expense["category"] })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {label(c)}
                  </option>
                ))}
              </select>
              <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as Expense["paymentStatus"] })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {["pending", "paid", "overdue", "cancelled"].map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </div>
            <label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-300">Payment due (optional)</span>
              <input type="date" value={form.paymentDueDate || ""} onChange={(e) => setForm({ ...form, paymentDueDate: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
            </label>
            <div className="flex justify-end gap-2">
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
