"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Clock, Download, Loader2, MapPin, Phone } from "lucide-react";
import { celebrationPlusService as svc, saveBlob, SharedRunSheet } from "@/services/celebration-plus.service";

/** A vendor's read-only run sheet, shared by the host (private link, no account) */
export default function SharedRunSheetPage() {
  const { token } = useParams() as { token: string };
  const [data, setData] = useState<SharedRunSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    svc
      .viewSharedRunSheet(token)
      .then(setData)
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false));
  }, [token]);

  async function download() {
    setDownloading(true);
    try {
      saveBlob(await svc.sharedRunSheetPdf(token), "run-sheet.pdf");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }
  if (invalid || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold text-gray-900">This link isn&apos;t valid</p>
          <p className="text-sm text-gray-500 mt-1">Ask the host to send you a new one.</p>
        </div>
      </div>
    );
  }

  let lastDay: string | undefined;
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">Run sheet for {data.vendor.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{data.event.title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            {data.event.startDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {new Date(data.event.startDate).toDateString()}
              </span>
            )}
            {data.event.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {data.event.venue}
              </span>
            )}
            {data.vendor.arrivalTime && (
              <span className="flex items-center gap-1.5 font-medium text-gray-900">
                <Clock className="w-4 h-4" /> Arrive by {data.vendor.arrivalTime}
              </span>
            )}
          </div>
          {(data.dayOfContact.name || data.dayOfContact.phone) && (
            <p className="mt-4 p-3 rounded-lg bg-purple-50 text-sm text-purple-900 flex items-center gap-2">
              <Phone className="w-4 h-4" /> On the day, call {data.dayOfContact.name}
              {data.dayOfContact.phone && (
                <a href={`tel:${data.dayOfContact.phone}`} className="font-semibold underline">
                  {data.dayOfContact.phone}
                </a>
              )}
            </p>
          )}
          {data.notes && <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">{data.notes}</p>}
          <button
            onClick={download}
            disabled={downloading}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Schedule</h2>
          {data.items.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing scheduled for you yet.</p>
          ) : (
            <ol className="space-y-3">
              {data.items.map((i) => {
                const header = i.day && i.day !== lastDay ? i.day : null;
                lastDay = i.day || lastDay;
                return (
                  <li key={i._id}>
                    {header && <p className="text-sm font-semibold text-purple-700 mb-2 mt-2">{new Date(`${header}T12:00:00`).toDateString()}</p>}
                    <div className={`flex gap-3 p-3 rounded-lg ${i.mine ? "bg-purple-50 border border-purple-100" : "bg-gray-50"}`}>
                      <span className="w-24 text-sm font-mono text-gray-800">
                        {i.start}
                        {i.end ? `–${i.end}` : ""}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{i.title}</p>
                        <p className="text-xs text-gray-500">{[i.mine ? "You" : "Everyone", i.location, i.description, i.notes].filter(Boolean).join(" · ")}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {data.otherVendors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Also working on the day</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              {data.otherVendors.map((v, idx) => (
                <li key={idx}>
                  {v.name}
                  {v.role ? ` · ${v.role}` : ""}
                  {v.arrivalTime ? ` · arrives ${v.arrivalTime}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-center text-xs text-gray-400">Updated {new Date(data.updatedAt).toLocaleString()} · Planned with Confetti</p>
      </div>
    </div>
  );
}
