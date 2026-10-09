"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { useCompany } from "@/components/company/CompanyContext";
import { organizationService, naira, OrgBooking, PurchaseRequest } from "@/services/organization.service";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};
const FILTERS = ["pending", "approved", "rejected", "cancelled", ""];
const who = (u: any) => (u && typeof u === "object" ? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email : "");

/** Purchase requests: raise one for a booking; approvers approve or reject */
export default function ApprovalsPage() {
  const { org } = useCompany();
  const [filter, setFilter] = useState("pending");
  const [items, setItems] = useState<PurchaseRequest[]>([]);
  const [bookings, setBookings] = useState<OrgBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [raising, setRaising] = useState<OrgBooking | null>(null);
  const [form, setForm] = useState({ amount: "" as number | "", description: "" });
  const [deciding, setDeciding] = useState<{ pr: PurchaseRequest; decision: "approve" | "reject" } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, b] = await Promise.all([organizationService.purchases({ status: filter || undefined }), organizationService.bookings()]);
      setItems(p);
      setBookings(b);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  if (!org) return null;
  const canDecide = org.me?.role === "admin" || org.me?.role === "approver";
  const needsApproval = bookings.filter((b) => !b.purchaseRequests.some((p) => p.status === "pending") && b.status !== "cancelled");

  async function raise(e: React.FormEvent) {
    e.preventDefault();
    if (!raising) return;
    setBusy(true);
    try {
      const pr = await organizationService.createPurchase({
        bookingId: raising._id,
        amount: form.amount === "" ? undefined : form.amount,
        description: form.description || undefined,
      });
      toast.success(pr.autoApproved ? "Approved automatically (under the company limit)" : "Sent for approval");
      setRaising(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't send the request");
    } finally {
      setBusy(false);
    }
  }

  async function decide(e: React.FormEvent) {
    e.preventDefault();
    if (!deciding) return;
    setBusy(true);
    try {
      if (deciding.decision === "approve") await organizationService.approve(deciding.pr._id, note || undefined);
      else await organizationService.reject(deciding.pr._id, note);
      toast.success(deciding.decision === "approve" ? "Approved" : "Rejected");
      setDeciding(null);
      setNote("");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  async function cancel(pr: PurchaseRequest) {
    if (!confirm(`Cancel ${pr.number}?`)) return;
    try {
      await organizationService.cancelPurchase(pr._id);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't cancel");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Approvals</h1>
        <p className="text-sm text-gray-600">
          A vendor can only confirm a company booking, and it can only be paid, once the purchase is approved.
          {org.approvalThreshold > 0 ? ` Purchases up to ${naira(org.approvalThreshold)} are approved automatically.` : ""}
        </p>
      </div>

      {needsApproval.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Bookings on company events</h2>
          <ul className="divide-y divide-gray-100">
            {needsApproval.map((b) => {
              const approved = b.purchaseRequests.filter((p) => p.status === "approved").reduce((s, p) => s + p.amount, 0);
              return (
                <li key={b._id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">
                      {b.vendor.businessName} · {b.event.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {b.amount ? `Quote ${naira(b.amount)}` : "No price yet"} · paid {naira(b.paid)}
                      {approved ? ` · approved ${naira(approved)}` : " · not approved"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRaising(b);
                      setForm({ amount: b.amount ? Math.max(b.amount - approved, 0) || b.amount : "", description: "" });
                    }}
                    disabled={org.contract.status !== "active"}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 text-xs hover:bg-indigo-50 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" /> Request approval
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f || "all"}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize ${filter === f ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Nothing here.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((pr) => (
            <li key={pr._id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {pr.number} · {naira(pr.amount)}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_STYLE[pr.status]}`}>
                      {pr.autoApproved ? "auto-approved" : pr.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {typeof pr.vendor === "object" ? pr.vendor.businessName || pr.vendor.name : ""} for {typeof pr.event === "object" ? pr.event.title : "an event"}
                    {pr.department ? ` · ${pr.department}` : ""}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Requested by {who(pr.requestedBy)} on {new Date(pr.createdAt).toLocaleDateString()}
                    {pr.decidedAt && !pr.autoApproved ? ` · ${pr.status} by ${who(pr.decidedBy)}` : ""}
                  </p>
                  {pr.description && <p className="text-sm text-gray-700 mt-1">{pr.description}</p>}
                  {pr.decisionNote && <p className="text-sm text-gray-700 mt-1 italic">&ldquo;{pr.decisionNote}&rdquo;</p>}
                </div>
                <div className="flex gap-2">
                  {pr.status === "pending" && canDecide && (
                    <>
                      <button onClick={() => setDeciding({ pr, decision: "approve" })} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700">
                        Approve
                      </button>
                      <button onClick={() => setDeciding({ pr, decision: "reject" })} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50">
                        Reject
                      </button>
                    </>
                  )}
                  {(pr.status === "pending" || pr.status === "approved") && (
                    <button onClick={() => cancel(pr)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600">
                      Cancel
                    </button>
                  )}
                  <button onClick={() => setOpen(open === pr._id ? null : pr._id)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600">
                    {open === pr._id ? "Hide log" : "Log"}
                  </button>
                </div>
              </div>
              {open === pr._id && (
                <ol className="mt-3 border-t border-gray-100 pt-3 space-y-1 text-xs text-gray-600">
                  {pr.log.map((l, i) => (
                    <li key={i}>
                      {new Date(l.at).toLocaleString()} · <span className="capitalize">{l.action.replace("_", " ")}</span>
                      {l.note ? ` · ${l.note}` : ""}
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ul>
      )}

      {(raising || deciding) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <form onSubmit={raising ? raise : decide} className="bg-white rounded-xl shadow-xl p-5 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {raising ? `Request approval: ${raising.vendor.businessName}` : deciding!.decision === "approve" ? `Approve ${deciding!.pr.number}` : `Reject ${deciding!.pr.number}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setRaising(null);
                  setDeciding(null);
                }}
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {raising ? (
              <>
                <label className="block text-sm text-gray-700">
                  Amount to approve (₦)
                  <input type="number" min={1} required className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value === "" ? "" : Number(e.target.value) })} />
                </label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="What it's for" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </>
            ) : (
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
                required={deciding!.decision === "reject"}
                placeholder={deciding!.decision === "reject" ? "Why? (the requester sees this)" : "Note (optional)"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            )}
            <button disabled={busy} className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50">
              {raising ? "Send for approval" : deciding!.decision === "approve" ? "Approve" : "Reject"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
