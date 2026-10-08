"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "react-toastify";
import { escrowService, BookingPayments, EscrowPaymentView } from "@/services/escrow.service";

const ACCENT = {
  purple: { button: "bg-purple-600 hover:bg-purple-700", ring: "focus:ring-purple-500" },
  teal: { button: "bg-teal-600 hover:bg-teal-700", ring: "focus:ring-teal-500" },
};

const naira = (n: number) => `₦${Math.round(n || 0).toLocaleString()}`;

const STATUS: Record<string, { label: string; className: string }> = {
  held: { label: "Held by Confetti", className: "bg-blue-100 text-blue-700" },
  released: { label: "Released to vendor", className: "bg-green-100 text-green-700" },
  refunded: { label: "Refunded", className: "bg-gray-100 text-gray-600" },
  disputed: { label: "Under review", className: "bg-amber-100 text-amber-700" },
};

/**
 * Pay a booking through Confetti (held until after the event) and follow the payments.
 * Used on the client booking page and the planner bookings page.
 */
export default function BookingPaymentPanel({ bookingId, accent = "purple" }: { bookingId: string; accent?: keyof typeof ACCENT }) {
  const theme = ACCENT[accent];
  const [data, setData] = useState<BookingPayments | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState<"flutterwave" | "paystack">("flutterwave");
  const [paying, setPaying] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [disputing, setDisputing] = useState<EscrowPaymentView | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await escrowService.getBookingPayments(bookingId);
      setData(res);
      setAmount(res.totals.outstanding ? String(res.totals.outstanding) : "");
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!(value > 0)) return toast.error("Enter an amount");
    setPaying(true);
    try {
      const { paymentUrl } = await escrowService.checkout({ bookingId, amount: value, paymentProvider: provider });
      window.location.href = paymentUrl;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't start the payment");
      setPaying(false);
    }
  }

  async function confirm(payment: EscrowPaymentView) {
    if (!window.confirm(`Release ${naira(payment.amount - payment.refunded)} to the vendor now? Only do this once they've delivered.`)) return;
    setBusy(payment._id);
    try {
      await escrowService.confirmDelivery(payment._id);
      toast.success("Thank you! The vendor is being paid.");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't release the payment");
    } finally {
      setBusy(null);
    }
  }

  async function submitDispute(e: React.FormEvent) {
    e.preventDefault();
    if (!disputing) return;
    setBusy(disputing._id);
    try {
      await escrowService.openDispute(disputing._id, reason);
      toast.success("We've paused this payment and will be in touch");
      setDisputing(null);
      setReason("");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't report the problem");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }
  if (!data) return null;
  const { totals } = data;

  return (
    <div className="space-y-4">
      {totals.total > 0 && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-semibold">{naira(totals.total)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Paid</p>
            <p className="font-semibold">{naira(totals.paid)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="font-semibold">{naira(totals.outstanding)}</p>
          </div>
        </div>
      )}

      {data.canPay ? (
        <form onSubmit={pay} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <p className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>
              Pay through Confetti and we hold the money until after your event. It goes to the vendor when you confirm they delivered,
              or automatically {data.autoReleaseDays} days after the event unless you report a problem.
              {data.bookingStatus === "quoted" ? " Paying accepts the vendor's quote." : ""}
            </span>
          </p>
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-sm flex-1 min-w-[140px]">
              <span className="text-gray-600">Amount (₦)</span>
              <input
                type="number"
                min={100}
                max={totals.outstanding}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${theme.ring}`}
              />
            </label>
            {totals.deposit > 0 && totals.paid === 0 && totals.deposit < totals.outstanding && (
              <button type="button" onClick={() => setAmount(String(totals.deposit))} className="text-xs text-gray-600 underline pb-3">
                Pay deposit ({naira(totals.deposit)})
              </button>
            )}
            <select value={provider} onChange={(e) => setProvider(e.target.value as "flutterwave" | "paystack")} className="text-sm border border-gray-300 rounded-lg px-2 py-2" aria-label="Payment provider">
              <option value="flutterwave">Flutterwave</option>
              <option value="paystack">Paystack</option>
            </select>
            <button type="submit" disabled={paying} className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${theme.button}`}>
              {paying ? "Opening…" : "Pay through Confetti"}
            </button>
          </div>
        </form>
      ) : totals.total > 0 && totals.outstanding === 0 ? (
        <p className="text-sm text-green-700 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> Fully paid
        </p>
      ) : data.payments.length === 0 ? (
        <p className="text-sm text-gray-500">You can pay through Confetti once the vendor sends a quote or confirms the booking.</p>
      ) : null}

      {data.payments.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {data.payments.map((p) => (
            <li key={p._id} className="py-3 flex flex-wrap items-center gap-3 justify-between">
              <div className="text-sm">
                <p className="font-medium">
                  {naira(p.amount)} <span className="text-xs text-gray-500 capitalize">· {p.kind}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {p.paidAt && `Paid ${new Date(p.paidAt).toLocaleDateString()}`}
                  {p.status === "held" && p.releaseAfter && ` · releases ${new Date(p.releaseAfter).toLocaleDateString()}`}
                  {p.refunded > 0 && ` · ${naira(p.refunded)} refunded`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS[p.status]?.className || "bg-gray-100 text-gray-600"}`}>
                  {STATUS[p.status]?.label || p.status}
                </span>
                {p.status === "held" && (
                  <>
                    <button onClick={() => confirm(p)} disabled={busy === p._id} className={`px-3 py-1.5 rounded-lg text-xs text-white disabled:opacity-50 ${theme.button}`}>
                      Confirm delivery
                    </button>
                    <button onClick={() => setDisputing(p)} className="px-3 py-1.5 rounded-lg text-xs border border-red-200 text-red-600 hover:bg-red-50">
                      Report a problem
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {disputing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <form onSubmit={submitDispute} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-3">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">Report a problem</h2>
              <button type="button" onClick={() => setDisputing(null)} aria-label="Close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              We&apos;ll keep holding {naira(disputing.amount - disputing.refunded)} while Confetti reviews what happened with you and the vendor.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              minLength={10}
              required
              placeholder="What went wrong?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDisputing(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={busy === disputing._id || reason.trim().length < 10} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg disabled:opacity-50">
                Report problem
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
