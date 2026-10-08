"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import { escrowService } from "@/services/escrow.service";

type Item = Awaited<ReturnType<typeof escrowService.adminList>>["items"][number];
type Report = Awaited<ReturnType<typeof escrowService.adminReport>>;

const naira = (n: number) => `₦${Math.round(n || 0).toLocaleString()}`;
const FILTERS = [
  { label: "All", status: "", payoutStatus: "" },
  { label: "Held", status: "held", payoutStatus: "" },
  { label: "Disputed", status: "disputed", payoutStatus: "" },
  { label: "Released", status: "released", payoutStatus: "" },
  { label: "Refunded", status: "refunded", payoutStatus: "" },
  { label: "Payouts to make", status: "released", payoutStatus: "manual" },
  { label: "Failed payouts", status: "released", payoutStatus: "failed" },
];
const STATUS_STYLE: Record<string, string> = {
  held: "bg-blue-100 text-blue-700",
  disputed: "bg-amber-100 text-amber-800",
  released: "bg-green-100 text-green-700",
  refunded: "bg-gray-100 text-gray-600",
};

/** Escrow: commission report, disputes and payouts */
export default function AdminEscrowPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolving, setResolving] = useState<Item | null>(null);
  const [resolution, setResolution] = useState<"release" | "refund" | "split">("release");
  const [refundAmount, setRefundAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, rep] = await Promise.all([
        escrowService.adminList({ status: filter.status || undefined, payoutStatus: filter.payoutStatus || undefined, page }),
        escrowService.adminReport(),
      ]);
      setItems(list.items);
      setTotalPages(list.totalPages);
      setReport(rep);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(e: React.FormEvent) {
    e.preventDefault();
    if (!resolving) return;
    setBusy(resolving._id);
    try {
      await escrowService.adminResolve(resolving._id, {
        resolution,
        refundAmount: resolution === "split" ? Number(refundAmount) : undefined,
        note: note || undefined,
      });
      toast.success("Resolved");
      setResolving(null);
      setNote("");
      setRefundAmount("");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't resolve");
    } finally {
      setBusy(null);
    }
  }

  async function act(item: Item, action: "retry" | "paid") {
    if (action === "paid" && !confirm(`Confirm you've sent ${naira(item.vendorAmount)} to ${item.vendor?.name}?`)) return;
    setBusy(item._id);
    try {
      if (action === "retry") await escrowService.adminRetryPayout(item._id);
      else await escrowService.adminMarkPaid(item._id, "Paid by admin");
      toast.success(action === "retry" ? "Payout retried" : "Marked as paid");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Escrow & commission</h1>
        <p className="text-sm text-gray-600">Booking payments held by Confetti, disputes, vendor payouts and commission earned (last 12 months).</p>
      </div>

      {report && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            ["Collected", naira(report.collected.amount), `${report.collected.payments} payments · ${naira(report.collected.refunded)} refunded`],
            ["Commission earned", naira(report.released.commission), `on ${naira(report.released.gross)} released`],
            ["Held now", naira(report.heldNow.held?.amount || 0), `${report.heldNow.held?.payments || 0} payments`],
            ["Under review", naira(report.heldNow.disputed?.amount || 0), `${report.heldNow.disputed?.payments || 0} disputes`],
            ["Owed to vendors", naira(report.owedToVendors.amount), `${report.owedToVendors.payments} payouts not yet paid`],
          ].map(([label, value, sub]) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {report && (report.byMonth.length > 0 || report.byRate.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold mb-2 text-sm">Commission by month</h2>
            {report.byMonth.map((m) => (
              <div key={m.period} className="flex justify-between text-sm py-0.5">
                <span className="text-gray-600">{m.period}</span>
                <span>
                  {naira(m.commission)} <span className="text-xs text-gray-500">of {naira(m.gross)}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold mb-2 text-sm">Commission by rate</h2>
            {report.byRate.map((r) => (
              <div key={r.rate} className="flex justify-between text-sm py-0.5">
                <span className="text-gray-600">
                  {Math.round(r.rate * 100)}% · {r.payments} payments
                </span>
                <span>{naira(r.commission)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-sm ${filter.label === f.label ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">
          Couldn&apos;t load escrow payments.{" "}
          <button onClick={load} className="underline">
            Try again
          </button>
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500 bg-white rounded-lg border border-gray-200 p-8 text-center">Nothing here.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 border-b">
              <tr>
                <th className="px-4 py-3">Client → Vendor</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payout</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <Fragment key={item._id}>
                  <tr className="border-b last:border-0 align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.client?.name || "—"}</p>
                      <p className="text-xs text-gray-500">→ {item.vendor?.name || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {item.event?.type || "—"}
                      {item.event?.date ? ` · ${new Date(item.event.date).toLocaleDateString()}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {naira(item.amount)}
                      <p className="text-xs text-gray-500">fee {Math.round(item.commissionRate * 100)}%{item.refunded > 0 ? ` · refunded ${naira(item.refunded)}` : ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[item.status] || "bg-gray-100"}`}>{item.status}</span>
                      {item.dispute && !item.dispute.resolvedAt && (
                        <p className="text-xs text-amber-800 mt-1 max-w-xs">
                          {item.dispute.openedByRole}: “{item.dispute.reason}”
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.status === "released" ? item.payoutStatus : "—"}
                      {item.payoutFailure && <p className="text-red-600">{item.payoutFailure}</p>}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                      {["held", "disputed"].includes(item.status) && (
                        <button onClick={() => setResolving(item)} className="px-2.5 py-1 text-xs border border-gray-300 rounded">
                          Resolve
                        </button>
                      )}
                      {item.status === "released" && item.payoutStatus === "failed" && (
                        <button onClick={() => act(item, "retry")} disabled={busy === item._id} className="px-2.5 py-1 text-xs border border-gray-300 rounded">
                          Retry payout
                        </button>
                      )}
                      {item.status === "released" && ["manual", "failed", "processing"].includes(item.payoutStatus) && (
                        <button onClick={() => act(item, "paid")} disabled={busy === item._id} className="px-2.5 py-1 text-xs border border-gray-300 rounded">
                          Mark paid
                        </button>
                      )}
                      <button onClick={() => setExpanded(expanded === item._id ? null : item._id)} className="px-2 py-1 text-xs text-gray-500">
                        History
                      </button>
                    </td>
                  </tr>
                  {expanded === item._id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-4 py-2 text-xs text-gray-600">
                        {item.history.map((h, i) => (
                          <p key={i}>
                            {new Date(h.at).toLocaleString()} · {h.status}
                            {h.note ? ` — ${h.note}` : ""}
                          </p>
                        ))}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border rounded disabled:opacity-40">
            Previous
          </button>
          <span className="text-sm text-gray-600 py-1.5">
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border rounded disabled:opacity-40">
            Next
          </button>
        </div>
      )}

      {resolving && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <form onSubmit={resolve} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">Resolve {naira(resolving.amount - resolving.refunded)}</h2>
              <button type="button" onClick={() => setResolving(null)} aria-label="Close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {resolving.dispute && <p className="text-sm text-amber-800 bg-amber-50 rounded p-2">“{resolving.dispute.reason}”</p>}
            {(
              [
                ["release", "Release everything to the vendor"],
                ["refund", "Refund everything to the client"],
                ["split", "Refund part, release the rest"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input type="radio" name="resolution" checked={resolution === value} onChange={() => setResolution(value)} />
                {label}
              </label>
            ))}
            {resolution === "split" && (
              <input
                type="number"
                min={1}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Refund to client (₦)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            )}
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Note (shared in the record)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setResolving(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={busy === resolving._id} className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg disabled:opacity-50">
                Resolve
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
