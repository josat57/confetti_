"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, CheckCircle2, Circle, FileText, Loader2, MapPin } from "lucide-react";
import { clientPortalService, ClientPortalView } from "@/services/client-portal.service";

const naira = (n: number, currency = "NGN") => `${currency === "NGN" ? "₦" : `${currency} `}${Math.round(n || 0).toLocaleString()}`;

/** Client view of their event, shared by their planner (private link, no account) */
export default function ClientPortalPage() {
  const { token } = useParams() as { token: string };
  const [data, setData] = useState<ClientPortalView | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [comment, setComment] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    clientPortalService
      .view(token)
      .then(setData)
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false));
  }, [token]);

  async function respond(approvalId: string, decision: "approved" | "changes_requested") {
    if (!data) return;
    setBusy(true);
    setError("");
    try {
      const result = await clientPortalService.respond(token, approvalId, decision, responses[approvalId]);
      setData({ ...data, ...result });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't send your answer");
    } finally {
      setBusy(false);
    }
  }

  async function sendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!data || !comment.trim()) return;
    setBusy(true);
    try {
      const result = await clientPortalService.clientComment(token, comment);
      setData({ ...data, ...result });
      setComment("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't send your comment");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </main>
    );
  }
  if (invalid || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">This link isn&apos;t valid</h1>
          <p className="text-gray-600 mt-2 text-sm">Ask your planner to send it again.</p>
        </div>
      </main>
    );
  }

  const done = data.checklist.filter((c) => c.status === "completed").length;
  const card = "bg-white rounded-2xl shadow-sm p-5";

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className={card}>
          <p className="text-xs uppercase tracking-wide text-teal-700">Your event</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{data.event.title}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {new Date(data.event.startDate).toDateString()}
            </span>
            {data.event.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {data.event.venue}
              </span>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

        {data.approvals.length > 0 && (
          <section className={card}>
            <h2 className="font-semibold mb-3">Needs your approval</h2>
            <ul className="space-y-4">
              {data.approvals.map((a) => (
                <li key={a._id} className="border border-gray-100 rounded-xl p-4">
                  <p className="font-medium">
                    {a.title}
                    {a.amount ? ` · ₦${a.amount.toLocaleString()}` : ""}
                  </p>
                  {a.description && <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{a.description}</p>}
                  {a.status === "pending" ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={responses[a._id] || ""}
                        onChange={(e) => setResponses({ ...responses, [a._id]: e.target.value })}
                        placeholder="Comment (needed if you want changes)"
                        rows={2}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-base"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => respond(a._id, "approved")} disabled={busy} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium disabled:opacity-50">
                          Approve
                        </button>
                        <button onClick={() => respond(a._id, "changes_requested")} disabled={busy} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium disabled:opacity-50">
                          Ask for changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`mt-2 text-sm ${a.status === "approved" ? "text-green-700" : "text-amber-700"}`}>
                      {a.status === "approved" ? "Approved" : "Changes requested"}
                      {a.response ? `: “${a.response}”` : ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.timeline.length > 0 && (
          <section className={card}>
            <h2 className="font-semibold mb-3">Schedule</h2>
            <ul className="space-y-2 text-sm">
              {data.timeline.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-28 flex-shrink-0 text-gray-500">{t.startTime ? new Date(t.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : ""}</span>
                  <span>
                    <span className="font-medium">{t.title}</span>
                    {t.location ? <span className="text-gray-500"> · {t.location}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.checklist.length > 0 && (
          <section className={card}>
            <h2 className="font-semibold mb-1">Progress</h2>
            <p className="text-sm text-gray-600 mb-3">
              {done} of {data.checklist.length} tasks done
            </p>
            <ul className="space-y-1.5 text-sm">
              {data.checklist.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  {c.status === "completed" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-gray-300" />}
                  <span className={c.status === "completed" ? "text-gray-500" : ""}>{c.title}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.budget && (
          <section className={card}>
            <h2 className="font-semibold mb-3">Budget</h2>
            <div className="grid grid-cols-3 gap-3 text-sm mb-3">
              <div>
                <p className="text-xs text-gray-500">Budget</p>
                <p className="font-semibold">{naira(data.budget.total, data.budget.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Spent</p>
                <p className="font-semibold">{naira(data.budget.spent, data.budget.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="font-semibold">{naira(data.budget.remaining, data.budget.currency)}</p>
              </div>
            </div>
            <ul className="divide-y divide-gray-100 text-sm">
              {data.budget.expenses.map((e, i) => (
                <li key={i} className="py-1.5 flex justify-between">
                  <span>{e.description}</span>
                  <span>{naira(e.amount, data.budget!.currency)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.documents.length > 0 && (
          <section className={card}>
            <h2 className="font-semibold mb-3">Documents</h2>
            <ul className="space-y-2 text-sm">
              {data.documents.map((d) => (
                <li key={d._id}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-teal-700 hover:underline">
                    <FileText className="w-4 h-4" /> {d.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={card}>
          <h2 className="font-semibold mb-3">Messages with your planner</h2>
          <ul className="space-y-2 mb-3">
            {data.comments.map((c) => (
              <li key={c._id} className={`rounded-xl p-3 text-sm ${c.author === "client" ? "bg-teal-50" : "bg-gray-50"}`}>
                <p className="text-xs text-gray-500">
                  {c.name || c.author} · {new Date(c.createdAt).toLocaleString()}
                </p>
                <p className="whitespace-pre-line">{c.body}</p>
              </li>
            ))}
          </ul>
          <form onSubmit={sendComment} className="flex gap-2">
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a message" className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-base" />
            <button type="submit" disabled={busy || !comment.trim()} className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm disabled:opacity-50">
              Send
            </button>
          </form>
        </section>
        <p className="text-center text-xs text-gray-400">Shared with you through Confetti</p>
      </div>
    </main>
  );
}
