"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { organizationService, naira, saveFile, CorporateInvoice } from "@/services/organization.service";

const FILTERS = [
  { label: "Requests", status: "requested" },
  { label: "Invoiced", status: "invoiced" },
  { label: "Active", status: "active" },
  { label: "Expired", status: "expired" },
  { label: "All", status: "" },
];
const STATUS_STYLE: Record<string, string> = {
  none: "bg-gray-100 text-gray-600",
  requested: "bg-amber-100 text-amber-800",
  invoiced: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

/** Corporate accounts: contract requests, invoices and payments */
export default function AdminCorporatePage() {
  const [filter, setFilter] = useState("requested");
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrgs(await organizationService.adminList({ status: filter || undefined }));
    } catch {
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!openId) load();
  }, [load, openId]);

  if (openId) return <CompanyDetail id={openId} onBack={() => setOpenId(null)} />;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Corporate accounts</h1>
        <p className="text-sm text-gray-600">Issue yearly contract invoices (from ₦500,000 + VAT) and record bank transfers.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.status)}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === f.status ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : orgs.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Nothing here.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Members</th>
                <th className="px-4 py-2">Contract</th>
                <th className="px-4 py-2">Unpaid</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{o.name}</p>
                    <p className="text-xs text-gray-500">
                      {o.legalName || ""} {o.rcNumber ? `· RC ${o.rcNumber}` : ""} · {o.billingEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3">{o.members}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLE[o.contract?.status || "none"]}`}>{o.contract?.status || "none"}</span>
                    {o.contract?.endsAt && <p className="text-xs text-gray-500 mt-0.5">until {new Date(o.contract.endsAt).toLocaleDateString()}</p>}
                  </td>
                  <td className="px-4 py-3">{o.openInvoices.map((i: any) => `${i.number} ${naira(i.total)}`).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setOpenId(o._id)} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs">
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CompanyDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<{ organization: any; invoices: CorporateInvoice[]; events: number } | null>(null);
  const [form, setForm] = useState({ amount: 500000 as number | "", startsAt: "", notes: "" });
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await organizationService.adminGet(id);
      setData(d);
      if (d.organization.contract?.amount) setForm((f) => ({ ...f, amount: d.organization.contract.amount }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't open the company");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(key: string, fn: () => Promise<unknown>, success: string) {
    setBusy(key);
    try {
      await fn();
      toast.success(success);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
      </div>
    );
  }
  const o = data.organization;
  const hasUnpaid = data.invoices.some((i) => i.status === "issued");
  return (
    <div className="p-6 space-y-5">
      <button onClick={onBack} className="text-sm text-purple-700 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">{o.name}</h1>
        <p className="text-sm text-gray-600">
          {[o.legalName, o.rcNumber && `RC ${o.rcNumber}`, o.vatNumber && `VAT ${o.vatNumber}`, o.billingEmail].filter(Boolean).join(" · ")}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {o.members.length} members · {data.events} events · contract {o.contract?.status}
          {o.contract?.endsAt ? ` until ${new Date(o.contract.endsAt).toDateString()}` : ""}
        </p>
        {o.contract?.requestNotes && <p className="text-sm text-gray-700 mt-2 italic">&ldquo;{o.contract.requestNotes}&rdquo;</p>}
      </div>

      {!hasUnpaid && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act(
              "issue",
              () =>
                organizationService.adminIssueInvoice(id, {
                  amount: Number(form.amount),
                  startsAt: form.startsAt || undefined,
                  kind: o.contractActive ? "renewal" : "contract",
                  notes: form.notes || undefined,
                }),
              "Invoice issued and emailed"
            );
          }}
          className="bg-white rounded-lg border border-gray-200 p-5 grid sm:grid-cols-4 gap-3 items-end"
        >
          <h2 className="sm:col-span-4 font-semibold text-gray-900">{o.contractActive ? "Issue a renewal invoice" : "Issue the contract invoice"}</h2>
          <label className="text-xs text-gray-500">
            Yearly amount before VAT (₦)
            <input type="number" min={500000} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value === "" ? "" : Number(e.target.value) })} />
          </label>
          {!o.contractActive && (
            <label className="text-xs text-gray-500">
              Starts (optional)
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </label>
          )}
          <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Note on the invoice (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button disabled={busy === "issue"} className="py-2 rounded-lg bg-purple-600 text-white text-sm disabled:opacity-50">
            Issue invoice
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Invoices</h2>
        {data.invoices.length === 0 ? (
          <p className="text-sm text-gray-500">None yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.invoices.map((i) => (
              <li key={i._id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span>
                  <strong>{i.number}</strong> · {naira(i.total)} · {i.kind} · {i.status}
                  {i.paidAt ? ` · paid ${new Date(i.paidAt).toLocaleDateString()} (${i.paymentMethod}${i.paymentReference ? ` ${i.paymentReference}` : ""})` : ""}
                </span>
                <span className="flex gap-2">
                  <button onClick={async () => saveFile(await organizationService.adminInvoicePdf(i._id), `${i.number}.pdf`)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  {i.status === "issued" && (
                    <>
                      <button
                        onClick={() => {
                          const ref = window.prompt("Bank transfer reference (optional)") ?? undefined;
                          act(`paid-${i._id}`, () => organizationService.adminMarkPaid(i._id, ref || undefined), "Marked paid; contract active");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-green-600 text-white text-xs"
                      >
                        Transfer received
                      </button>
                      <button onClick={() => confirm(`Void ${i.number}?`) && act(`void-${i._id}`, () => organizationService.adminVoid(i._id), "Voided")} className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 text-xs">
                        Void
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {o.contractActive && (
        <button
          onClick={() => confirm(`End ${o.name}'s contract now?`) && act("cancel", () => organizationService.adminCancelContract(id), "Contract ended")}
          className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm"
        >
          End contract
        </button>
      )}
    </div>
  );
}
