"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Loader2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import EventSubNav from "@/components/user/events/EventSubNav";
import { clientEventService, ChecklistItem } from "@/services/client-event.service";

const PRIORITY_STYLE = { high: "text-red-600", medium: "text-amber-600", low: "text-gray-400" };

export default function EventChecklistPage() {
  const { id } = useParams() as { id: string };
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, completed: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<ChecklistItem | null>(null);
  const [hideDone, setHideDone] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await clientEventService.getChecklist(id);
      setItems(data.items);
      setSummary(data.summary);
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

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await clientEventService.addChecklistItem(id, { title: title.trim(), dueDate: dueDate || undefined });
      setTitle("");
      setDueDate("");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't add the item");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(item: ChecklistItem) {
    const status = item.status === "completed" ? "pending" : "completed";
    setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, status } : i)));
    try {
      await clientEventService.updateChecklistItem(id, item._id, { status });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't update the item");
      load();
    }
  }

  async function remove(item: ChecklistItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await clientEventService.deleteChecklistItem(id, item._id);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't delete the item");
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await clientEventService.updateChecklistItem(id, editing._id, {
        title: editing.title,
        description: editing.description,
        dueDate: editing.dueDate || undefined,
        priority: editing.priority,
        category: editing.category,
      });
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't save the item");
    }
  }

  async function generate() {
    setBusy(true);
    try {
      const added = await clientEventService.generateChecklist(id);
      toast.success(added ? `Added ${added} suggested tasks` : "Your checklist already has the suggested tasks");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't build the checklist");
    } finally {
      setBusy(false);
    }
  }

  const visible = hideDone ? items.filter((i) => i.status !== "completed") : items;
  const pct = summary.total ? Math.round((summary.completed / summary.total) * 100) : 0;

  return (
    <div className="max-w-4xl">
      <EventSubNav eventId={id} />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {summary.completed} of {summary.total} done
              {summary.overdue > 0 && <span className="text-red-600"> · {summary.overdue} overdue</span>}
            </p>
            <div className="mt-2 h-2 w-64 max-w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm flex items-center gap-1.5 text-gray-600">
              <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide done
            </label>
            <button onClick={generate} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> Suggest tasks
            </button>
          </div>
        </div>
        <form onSubmit={add} className="mt-4 flex flex-wrap gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task" className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" aria-label="Due date" />
          <button type="submit" disabled={busy || !title.trim()} className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg disabled:opacity-50">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center py-10 text-gray-600">
          Couldn&apos;t load the checklist.{" "}
          <button onClick={load} className="text-purple-700 underline">
            Try again
          </button>
        </p>
      ) : visible.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-500">
          {items.length ? "Everything's done!" : "Nothing on the list yet. Add a task or let us suggest some."}
        </div>
      ) : (
        <ul className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
          {visible.map((item) => {
            const done = item.status === "completed";
            const overdue = !done && item.dueDate && new Date(item.dueDate) < new Date();
            return (
              <li key={item._id} className="flex items-start gap-3 px-4 py-3">
                <button
                  onClick={() => toggle(item)}
                  aria-label={done ? "Mark as not done" : "Mark as done"}
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${done ? "bg-green-500 border-green-500 text-white" : "border-gray-300"}`}
                >
                  {done && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${done ? "line-through text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {item.dueDate && <span className={overdue ? "text-red-600" : ""}>Due {new Date(item.dueDate).toLocaleDateString()}</span>}
                    {item.category && <span> · {item.category}</span>}
                    <span className={`ml-1 ${PRIORITY_STYLE[item.priority]}`}>· {item.priority}</span>
                  </p>
                </div>
                <button onClick={() => setEditing({ ...item, dueDate: item.dueDate?.slice(0, 10) })} className="p-1 text-gray-400 hover:text-gray-700" title="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(item)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <form onSubmit={saveEdit} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-3">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">Edit task</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Notes" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={editing.dueDate || ""} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <select value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value as ChecklistItem["priority"] })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Category (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
