"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { escrowService, PayoutAccount } from "@/services/escrow.service";

const naira = (n: number) => `₦${Math.round(n || 0).toLocaleString()}`;
const STATUS: Record<string, string> = {
  held: "Held until after the event",
  disputed: "Under review",
  released: "Released",
  refunded: "Refunded to client",
};
const PAYOUT: Record<string, string> = {
  not_started: "—",
  processing: "Transfer in progress",
  paid: "Paid to your bank",
  failed: "Transfer failed, we're retrying",
  manual: "Being paid by Confetti",
};

/** Booking payments made through Confetti and payouts to the vendor's bank */
export default function VendorPayoutsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof escrowService.getVendorPayouts>> | null>(null);
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [banks, setBanks] = useState<Array<{ name: string; code: string }>>([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const [summary, acct] = await Promise.all([escrowService.getVendorPayouts(), escrowService.getPayoutAccount()]);
      setData(summary);
      setAccount(acct);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if ((editing || !account) && banks.length === 0) {
      escrowService.getBanks().then(setBanks).catch(() => toast.error("Couldn't load the list of banks"));
    }
  }, [editing, account, banks.length]);

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!bankCode || !/^\d{10}$/.test(accountNumber)) return toast.error("Choose your bank and enter the 10-digit account number");
    setSaving(true);
    try {
      const saved = await escrowService.savePayoutAccount(bankCode, accountNumber);
      setAccount(saved);
      setEditing(false);
      setAccountNumber("");
      toast.success(`Payouts will go to ${saved.accountName}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't verify that account");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
        <p className="text-sm text-gray-600 mt-1">
          Clients can pay bookings through Confetti. We hold the money until after the event, then pay you, minus your plan&apos;s booking fee.
        </p>
      </div>
      {error && (
        <p className="text-sm text-red-600">
          Couldn&apos;t load your payouts.{" "}
          <button onClick={load} className="underline">
            Try again
          </button>
        </p>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <Banknote className="w-5 h-5 text-purple-600" /> Payout account
        </h2>
        {account && !editing ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-medium">{account.accountName}</p>
              <p className="text-gray-600">
                {account.bankName} ····{account.accountLast4}
              </p>
              {account.verified && (
                <p className="text-xs text-green-700 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Account checked with the bank
                </p>
              )}
            </div>
            <button onClick={() => setEditing(true)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg">
              Change
            </button>
          </div>
        ) : (
          <form onSubmit={saveAccount} className="flex flex-wrap gap-3 items-end">
            <label className="text-sm flex-1 min-w-[200px]">
              <span className="text-gray-600">Bank</span>
              <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" required>
                <option value="">Choose your bank</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-gray-600">Account number</span>
              <input
                inputMode="numeric"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                className="mt-1 block w-44 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="0123456789"
                required
              />
            </label>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg disabled:opacity-50">
              {saving ? "Checking…" : "Save account"}
            </button>
            {account && (
              <button type="button" onClick={() => setEditing(false)} className="px-3 py-2 text-sm text-gray-600">
                Cancel
              </button>
            )}
            <p className="w-full text-xs text-gray-500">We check the account name with your bank. Only the last 4 digits are shown here.</p>
          </form>
        )}
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ["Held for upcoming events", data.totals.held],
              ["Released, being paid", data.totals.awaitingPayout],
              ["Paid to your bank", data.totals.paidOut],
              ["Booking fees", data.totals.fees],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold">{naira(value as number)}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            {data.payments.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">No payments through Confetti yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-gray-500 border-b">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Fee</th>
                    <th className="px-4 py-3 text-right">You receive</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => {
                    const net = p.amount - p.refunded;
                    const fee = p.status === "released" ? p.commission : Math.round(net * p.commissionRate);
                    return (
                      <tr key={p._id} className="border-b last:border-0">
                        <td className="px-4 py-3">{p.clientName || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {p.eventType || "Event"}
                          {p.eventDate ? ` · ${new Date(p.eventDate).toLocaleDateString()}` : ""}
                        </td>
                        <td className="px-4 py-3 text-right">{naira(p.amount)}</td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {naira(fee)} <span className="text-xs">({Math.round(p.commissionRate * 100)}%)</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{naira(p.status === "released" ? p.vendorAmount : net - fee)}</td>
                        <td className="px-4 py-3 text-xs">
                          {STATUS[p.status] || p.status}
                          {p.status === "held" && p.releaseAfter && <span className="block text-gray-500">from {new Date(p.releaseAfter).toLocaleDateString()}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs">{p.status === "released" ? PAYOUT[p.payoutStatus] : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
