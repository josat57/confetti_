"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, CheckCircle2, ClipboardCheck, FileText, Loader2, PieChart } from "lucide-react";
import { toast } from "react-toastify";
import { useCompany } from "@/components/company/CompanyContext";
import { organizationService, naira, setActiveCompany, SpendReport, PurchaseRequest } from "@/services/organization.service";

const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

function SetupCompany() {
  const { switchTo, companies } = useCompany();
  const [form, setForm] = useState({ name: "", legalName: "", rcNumber: "", vatNumber: "", billingEmail: "", departments: "" });
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await organizationService.create({
        ...form,
        departments: form.departments.split(",").map((d) => d.trim()).filter(Boolean),
      } as any);
      toast.success("Company account created");
      setActiveCompany(created._id);
      await switchTo(created._id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't create the company");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Building2 className="w-10 h-10 text-indigo-600 mb-3" />
        <h1 className="text-xl font-bold text-gray-900">{companies.length ? "Add another company" : "Set up a company account"}</h1>
        <p className="text-sm text-gray-600 mt-1">
          Run your company&apos;s events and budgets in one place: purchases need an approver&apos;s sign-off, invoices are in the company&apos;s
          name, and reports show spending by event, department and vendor. Corporate is billed yearly, from ₦500,000.
        </p>
        <form onSubmit={create} className="grid sm:grid-cols-2 gap-3 mt-5">
          <input className={`${input} sm:col-span-2`} required placeholder="Company name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={input} placeholder="Registered name (for invoices)" value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
          <input className={input} placeholder="RC number" value={form.rcNumber} onChange={(e) => setForm({ ...form, rcNumber: e.target.value })} />
          <input className={input} placeholder="VAT / TIN" value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} />
          <input className={input} type="email" placeholder="Billing email" value={form.billingEmail} onChange={(e) => setForm({ ...form, billingEmail: e.target.value })} />
          <input className={`${input} sm:col-span-2`} placeholder="Departments, separated by commas (e.g. Marketing, HR)" value={form.departments} onChange={(e) => setForm({ ...form, departments: e.target.value })} />
          <button disabled={busy} className="sm:col-span-2 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {busy ? "Creating…" : "Create company account"}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4">
          Been invited by a colleague? Open the link in their email instead. You can belong to several companies (for example, if you plan events for more
          than one) and switch between them at the top.
        </p>
      </div>
    </div>
  );
}

export default function CompanyOverview() {
  const { org } = useCompany();
  const pathname = usePathname();
  const [adding, setAdding] = useState(false);
  // "+ New company" from the switcher (read after mount; the page is static)
  useEffect(() => {
    setAdding(new URLSearchParams(window.location.search).get("new") === "1");
  }, [pathname, org?._id]);
  const [report, setReport] = useState<SpendReport | null>(null);
  const [pending, setPending] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const canSee = org?.me?.role === "admin" || org?.me?.role === "approver";

  useEffect(() => {
    if (!org) return;
    Promise.all([
      canSee ? organizationService.report().catch(() => null) : Promise.resolve(null),
      organizationService.purchases({ status: "pending" }).catch(() => []),
    ])
      .then(([r, p]) => {
        setReport(r);
        setPending(p);
      })
      .finally(() => setLoading(false));
  }, [org, canSee]);

  if (!org || adding) return <SetupCompany />;
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const active = org.contract.status === "active";
  return (
    <div className="space-y-6">
      {!active && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="font-semibold text-amber-900">
            {org.contract.status === "requested"
              ? "We've received your request. Confetti will send your invoice shortly."
              : org.contract.status === "invoiced"
              ? "Your invoice is ready. Pay it to switch on company events and approvals."
              : org.contract.status === "expired"
              ? "Your Corporate contract has ended."
              : "Your company account is set up. Start your Corporate contract to plan events."}
          </p>
          <Link href="/company/billing" className="inline-block mt-2 text-sm text-amber-900 underline">
            Go to billing
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Contract", value: active ? `Until ${new Date(org.contract.endsAt!).toLocaleDateString()}` : org.contract.status, icon: CheckCircle2 },
          { label: "Waiting for approval", value: `${pending.length}`, icon: ClipboardCheck },
          { label: "Paid to vendors this year", value: report ? naira(report.totals.paid) : "—", icon: PieChart },
          { label: "Approved, not yet paid", value: report ? naira(report.totals.committed) : "—", icon: FileText },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <card.icon className="w-5 h-5 text-indigo-600" />
            <p className="text-xs text-gray-500 mt-2">{card.label}</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{card.value}</p>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Waiting for approval</h2>
            <Link href="/company/approvals" className="text-sm text-indigo-700 hover:underline">
              See all
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {pending.slice(0, 5).map((p) => (
              <li key={p._id} className="py-2 flex justify-between text-sm">
                <span>
                  {p.number} · {typeof p.event === "object" ? p.event.title : ""} · {typeof p.vendor === "object" ? p.vendor.businessName || p.vendor.name : ""}
                </span>
                <span className="font-medium">{naira(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report && report.byDepartment.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Budgets this year</h2>
          <div className="space-y-3">
            {report.byDepartment.map((d) => {
              const pct = d.budget ? Math.min((d.paid / d.budget) * 100, 100) : 0;
              return (
                <div key={d.key}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800">{d.name}</span>
                    <span className="text-gray-600">
                      {naira(d.paid)}
                      {d.budget ? ` of ${naira(d.budget)}` : ""}
                    </span>
                  </div>
                  {d.budget ? (
                    <div className="h-2 bg-gray-100 rounded-full mt-1">
                      <div className={`h-2 rounded-full ${pct >= 90 ? "bg-red-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
