"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { organizationService, naira, saveFile, SpendGroup, SpendReport } from "@/services/organization.service";

const year = new Date().getFullYear();

function Table({ title, rows, extra }: { title: string; rows: SpendGroup[]; extra?: (r: SpendGroup) => React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing in this period.</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-gray-50">
                <td className="py-2 pr-3 text-gray-800">{r.name}</td>
                <td className="py-2 pr-3 text-right font-medium">{naira(r.paid)}</td>
                <td className="py-2 text-right text-xs text-gray-500">{extra ? extra(r) : `${r.payments} payment${r.payments === 1 ? "" : "s"}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/** Spending by event, department and vendor; CSV and PDF export */
export default function ReportsPage() {
  const [from, setFrom] = useState(`${year}-01-01`);
  const [to, setTo] = useState(`${year}-12-31`);
  const [report, setReport] = useState<SpendReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReport(await organizationService.report({ from, to }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't load the report");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  async function download(kind: "csv" | "pdf") {
    setDownloading(kind);
    try {
      const file = kind === "csv" ? await organizationService.reportCsv({ from, to }) : await organizationService.reportPdf({ from, to });
      saveFile(file, `spending-${from}-to-${to}.${kind}`);
    } catch {
      toast.error("Couldn't export the report");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Spending reports</h1>
          <p className="text-sm text-gray-600">Money paid to vendors, by event, department and vendor.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-gray-500">
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="block border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label className="text-xs text-gray-500">
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="block border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          {(["csv", "pdf"] as const).map((k) => (
            <button key={k} onClick={() => download(k)} disabled={!!downloading} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-50">
              <Download className="w-4 h-4" /> {k.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading || !report ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              ["Paid to vendors", naira(report.totals.paid), `${report.totals.payments} payments`],
              ["Approved, not yet paid", naira(report.totals.committed), "committed"],
              ["Waiting for approval", naira(report.totals.pendingApproval), `${report.totals.pendingCount} requests`],
            ].map(([label, value, sub]) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-semibold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </div>
          <Table
            title="By department"
            rows={report.byDepartment}
            extra={(r) => (r.budget != null ? <span className={r.remaining! < 0 ? "text-red-600" : ""}>{naira(r.remaining)} of {naira(r.budget)} left</span> : "no budget")}
          />
          <div className="grid lg:grid-cols-2 gap-5">
            <Table title="By event" rows={report.byEvent} extra={(r) => (r.committed ? `${naira(r.committed)} committed` : r.department)} />
            <Table title="By vendor" rows={report.byVendor} />
          </div>
        </>
      )}
    </div>
  );
}
