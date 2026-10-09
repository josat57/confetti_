"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Heart, Loader2, Plus, Search, Send, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { celebrationPlusService as svc, CurationEvent, CurationQueueRow, Shortlist, ShortlistVendor } from "@/services/celebration-plus.service";

const naira = (n?: number) => `₦${Math.round(n || 0).toLocaleString()}`;
const errorText = (err: any, fallback: string) => err?.response?.data?.message || fallback;
const FILTERS: Array<{ label: string; status: string }> = [
  { label: "All", status: "" },
  { label: "Waiting", status: "requested" },
  { label: "In progress", status: "in_progress" },
  { label: "No brief yet", status: "new" },
  { label: "Sent", status: "ready" },
];
const STATUS_STYLE: Record<Shortlist["status"], string> = {
  new: "bg-gray-100 text-gray-600",
  requested: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
};
const STATUS_LABEL: Record<Shortlist["status"], string> = { new: "No brief", requested: "Waiting", in_progress: "In progress", ready: "Sent" };

/** Curated vendor shortlists for Celebration Plus events */
export default function AdminCurationPage() {
  const [rows, setRows] = useState<CurationQueueRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await svc.adminQueue({ status: filter || undefined, page });
      setRows(data.events);
      setCounts(data.counts);
      setTotalPages(data.totalPages);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    if (!openId) load();
  }, [load, openId]);

  if (openId) return <CurationEditor eventId={openId} onBack={() => setOpenId(null)} />;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Curated shortlists</h1>
        <p className="text-sm text-gray-600 mt-1">Celebration Plus events. Pick vendors for each client, then send the list.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => {
              setFilter(f.status);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === f.status ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {f.label}
            {f.status && counts[f.status] ? ` (${counts[f.status]})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-gray-700">Couldn&apos;t load the queue.</p>
          <button onClick={load} className="mt-2 text-sm text-purple-700 underline">
            Try again
          </button>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-gray-500 py-16">Nothing here.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2">Event</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Needs</th>
                <th className="px-4 py-2">Picks</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.eventId} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {r.eventType}
                      {r.city ? ` · ${r.city}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.startDate ? new Date(r.startDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-gray-700 capitalize">{r.brief?.categories?.join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {r.picks}
                    {r.interested ? <span className="text-xs text-red-500"> · {r.interested} liked</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setOpenId(r.eventId)} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs hover:bg-purple-700">
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40">
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function CurationEditor({ eventId, onBack }: { eventId: string; onBack: () => void }) {
  const [data, setData] = useState<CurationEvent | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState({ q: "", category: "", city: "" });
  const [results, setResults] = useState<ShortlistVendor[]>([]);
  const [searching, setSearching] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    svc
      .adminEvent(eventId)
      .then((d) => {
        setData(d);
        setSearch((s) => ({ ...s, city: d.event.city || "", category: d.shortlist.brief?.categories?.[0] || "" }));
      })
      .catch(() => setError(true));
  }, [eventId]);

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setSearching(true);
    try {
      setResults(await svc.adminSearchVendors({ q: search.q || undefined, category: search.category || undefined, city: search.city || undefined }));
    } catch (err) {
      toast.error(errorText(err, "Search failed"));
    } finally {
      setSearching(false);
    }
  }

  async function act(key: string, fn: () => Promise<Shortlist>, success?: string) {
    setBusy(key);
    try {
      const shortlist = await fn();
      setData((d) => (d ? { ...d, shortlist } : d));
      if (success) toast.success(success);
    } catch (err) {
      toast.error(errorText(err, "Something went wrong"));
    } finally {
      setBusy(null);
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="text-sm text-purple-700 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="mt-6 text-gray-700">Couldn&apos;t open this event.</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
      </div>
    );
  }

  const { event, shortlist } = data;
  const picked = new Set(shortlist.items.map((i) => i.vendor?._id));
  return (
    <div className="p-6 space-y-5">
      <button onClick={onBack} className="text-sm text-purple-700 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to the queue
      </button>
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-sm text-gray-600 capitalize">
              {event.eventType}
              {event.startDate ? ` · ${new Date(event.startDate).toDateString()}` : ""}
              {event.city ? ` · ${event.city}` : ""}
              {event.guestCount ? ` · ${event.guestCount} guests` : ""}
            </p>
            {event.client && (
              <p className="text-xs text-gray-500 mt-1">
                {event.client.name} · {event.client.email}
              </p>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLE[shortlist.status]}`}>{STATUS_LABEL[shortlist.status]}</span>
        </div>
        {event.description && <p className="text-sm text-gray-700 mt-3">{event.description}</p>}
        <div className="mt-3 p-3 rounded-lg bg-amber-50 text-sm text-amber-900">
          {shortlist.brief?.submittedAt ? (
            <>
              <p>
                <strong>Needs:</strong> <span className="capitalize">{shortlist.brief.categories.join(", ") || "—"}</span>
                {shortlist.brief.budget ? ` · budget ${naira(shortlist.brief.budget)}` : ""}
              </p>
              {shortlist.brief.notes && <p className="mt-1">&ldquo;{shortlist.brief.notes}&rdquo;</p>}
            </>
          ) : (
            <p>The client hasn&apos;t sent a brief yet.</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Shortlist ({shortlist.items.length})</h2>
            <button
              onClick={() => act("ready", () => svc.adminReady(eventId), "Sent to the client")}
              disabled={!shortlist.items.length || busy === "ready"}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {shortlist.status === "ready" ? "Send update" : "Send to client"}
            </button>
          </div>
          {shortlist.items.length === 0 ? (
            <p className="text-sm text-gray-500">Search for vendors and add them here.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {shortlist.items.map((i) => (
                <li key={i._id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        {i.vendor?.businessName || "Vendor removed"}
                        {i.clientStatus === "interested" && <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" aria-label="Client likes this" />}
                        {i.clientStatus === "dismissed" && <span className="text-xs text-gray-400">(hidden by client)</span>}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {i.vendor?.category}
                        {i.vendor?.city ? ` · ${i.vendor.city}` : ""}
                      </p>
                    </div>
                    <button onClick={() => act(`rm-${i._id}`, () => svc.adminRemove(eventId, i._id))} className="p-1 text-red-500 hover:bg-red-50 rounded" aria-label="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs"
                      placeholder="Why this vendor (the client sees this)"
                      value={notes[i._id] ?? i.note ?? ""}
                      onChange={(e) => setNotes({ ...notes, [i._id]: e.target.value })}
                    />
                    {notes[i._id] !== undefined && notes[i._id] !== (i.note || "") && (
                      <button onClick={() => act(`note-${i._id}`, () => svc.adminNote(eventId, i._id, notes[i._id]), "Saved")} className="px-2 py-1 rounded-lg border text-xs">
                        Save
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Find vendors</h2>
          <form onSubmit={runSearch} className="grid grid-cols-3 gap-2 mb-3">
            <input className="col-span-3 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Business name" value={search.q} onChange={(e) => setSearch({ ...search, q: e.target.value })} />
            <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Category" value={search.category} onChange={(e) => setSearch({ ...search, category: e.target.value })} />
            <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="City" value={search.city} onChange={(e) => setSearch({ ...search, city: e.target.value })} />
            <button disabled={searching} className="flex items-center justify-center gap-1 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
            </button>
          </form>
          <ul className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
            {results.map((v) => (
              <li key={v._id} className="py-2 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{v.businessName}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {v.category}
                    {v.city ? ` · ${v.city}` : ""}
                    {v.rating ? ` · ★ ${Number(v.rating).toFixed(1)}` : ""}
                    {v.priceRange?.min ? ` · from ${naira(v.priceRange.min)}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => act(`add-${v._id}`, () => svc.adminAdd(eventId, v._id))}
                  disabled={picked.has(v._id) || busy === `add-${v._id}`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-200 text-purple-700 text-xs hover:bg-purple-50 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" /> {picked.has(v._id) ? "Added" : "Add"}
                </button>
              </li>
            ))}
            {!results.length && !searching && <li className="py-6 text-center text-sm text-gray-500">Search to see approved vendors.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
