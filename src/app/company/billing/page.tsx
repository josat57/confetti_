"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Download, Landmark, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useCompany } from "@/components/company/CompanyContext";
import { organizationService, naira, saveFile, CorporateInvoice, Receipt } from "@/services/organization.service";

const STATUS_STYLE: Record<string, string> = { issued: "bg-amber-100 text-amber-800", paid: "bg-green-100 text-green-700", void: "bg-gray-100 text-gray-500" };

/** Corporate contract, invoices in the company's name, and receipts for vendor payments */
export default function BillingPage() {
  const { org, reload } = useCompany();
  const [invoices, setInvoices] = useState<CorporateInvoice[]>([]);
  const [bank, setBank] = useState<{ bankName: string | null; accountName: string; accountNumber: string | null } | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const isAdmin = org?.me?.role === "admin";

  const load = useCallback(async () => {
    try {
      const [inv, rec] = await Promise.all([organizationService.invoices(), organizationService.receipts()]);
      setInvoices(inv.invoices);
      setBank(inv.bank);
      setReceipts(rec);
    } catch {
      // approvers and admins only; the tab is hidden for others
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const query = new URLSearchParams(window.location.search);
    const outcome = query.get("payment");
    if (outcome) {
      if (outcome === "success") toast.success("Payment received. Your Corporate contract is active.");
      else if (outcome === "cancelled") toast.info("Payment cancelled");
      else toast.error(query.get("message") || "The payment didn't go through");
      window.history.replaceState(null, "", window.location.pathname);
      reload();
    }
  }, [load, reload]);

  if (!org) return null;

  async function request(e: React.FormEvent) {
    e.preventDefault();
    setBusy("request");
    try {
      await organizationService.requestContract(notes || undefined);
      toast.success("Request sent. We'll email your invoice.");
      await reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't send the request");
    } finally {
      setBusy(null);
    }
  }

  async function pay(invoice: CorporateInvoice) {
    setBusy(invoice._id);
    try {
      const { paymentUrl } = await organizationService.payInvoice(invoice._id);
      window.location.href = paymentUrl;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't start the payment");
      setBusy(null);
    }
  }

  async function download(kind: "invoice" | "receipt", id: string, name: string) {
    try {
      saveFile(kind === "invoice" ? await organizationService.invoicePdf(id) : await organizationService.receiptPdf(id), `${name}.pdf`);
    } catch {
      toast.error("Couldn't download it");
    }
  }

  const c = org.contract;
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Corporate contract</h1>
        {c.status === "active" ? (
          <p className="text-sm text-gray-700 mt-1">
            Active until <strong>{new Date(c.endsAt!).toDateString()}</strong>
            {c.amount ? ` · ${naira(c.amount)} a year + VAT` : ""}. A renewal invoice is sent 30 days before it ends.
          </p>
        ) : c.status === "requested" ? (
          <p className="text-sm text-gray-700 mt-1">Requested on {new Date(c.requestedAt!).toDateString()}. Confetti will send your invoice.</p>
        ) : c.status === "invoiced" ? (
          <p className="text-sm text-gray-700 mt-1">Your invoice is below. The contract starts as soon as it&apos;s paid.</p>
        ) : (
          <>
            <p className="text-sm text-gray-700 mt-1">
              Corporate is billed once a year, from ₦500,000 + VAT, by invoice in your company&apos;s name. Pay by bank transfer or card.
            </p>
            {isAdmin ? (
              <form onSubmit={request} className="mt-4 space-y-3">
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Tell us about your company's events (how many a year, team size). Optional."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button disabled={busy === "request"} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {c.status === "expired" ? "Renew the contract" : "Request a Corporate contract"}
                </button>
                {!org.legalName && !org.rcNumber && <p className="text-xs text-amber-700">Add the company&apos;s registered name or RC number under People &amp; settings first.</p>}
              </form>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Ask a company admin to start the contract.</p>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Invoices</h2>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        ) : invoices.length === 0 ? (
          <p className="text-sm text-gray-500">No invoices yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {invoices.map((i) => (
              <li key={i._id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {i.number} · {naira(i.total)}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${STATUS_STYLE[i.status]}`}>{i.status === "issued" ? "unpaid" : i.status}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {naira(i.subtotal)} + VAT {naira(i.vat)} · {i.kind === "renewal" ? "Renewal" : "Contract"}
                    {i.status === "issued" && i.dueDate ? ` · due ${new Date(i.dueDate).toLocaleDateString()}` : ""}
                    {i.paidAt ? ` · paid ${new Date(i.paidAt).toLocaleDateString()} by ${i.paymentMethod === "card" ? "card" : "transfer"}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => download("invoice", i._id, i.number)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs">
                    <Download className="w-3.5 h-3.5" /> {i.status === "paid" ? "Receipt" : "Invoice"}
                  </button>
                  {i.status === "issued" && isAdmin && (
                    <button onClick={() => pay(i)} disabled={busy === i._id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs disabled:opacity-50">
                      <CreditCard className="w-3.5 h-3.5" /> Pay by card
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {invoices.some((i) => i.status === "issued") && bank?.accountNumber && (
          <div className="mt-4 p-3 rounded-lg bg-indigo-50 text-sm text-indigo-900 flex gap-2">
            <Landmark className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Or pay by bank transfer to {bank.bankName}, {bank.accountName}, <strong>{bank.accountNumber}</strong>, using the invoice number as the reference.
              We&apos;ll mark it paid when it arrives.
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-1">Receipts for vendor payments</h2>
        <p className="text-xs text-gray-500 mb-3">Payments made through Confetti for company events, in the company&apos;s name.</p>
        {receipts.length === 0 ? (
          <p className="text-sm text-gray-500">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {receipts.map((r) => (
              <li key={r._id} className="py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  {r.number} · {r.vendor} · {r.event} · {r.paidAt ? new Date(r.paidAt).toLocaleDateString() : ""}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-medium">{naira(r.amount)}</span>
                  <button onClick={() => download("receipt", r._id, r.number)} className="text-xs text-indigo-700 hover:underline">
                    PDF
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
