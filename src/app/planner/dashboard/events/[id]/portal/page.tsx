"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { clientPortalService, PlannerPortal } from "@/services/client-portal.service";

const APPROVAL_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-700",
  changes_requested: "bg-red-100 text-red-700",
};
const APPROVAL_LABEL: Record<string, string> = { pending: "Waiting", approved: "Approved", changes_requested: "Changes requested" };

/** Planner: share an event with the client (private link), ask for approvals, talk */
export default function PlannerEventPortalPage() {
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<PlannerPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState({ email: "", name: "" });
  const [approval, setApproval] = useState({ title: "", description: "", amount: "" });
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await clientPortalService.get(id));
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't load the client portal");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<PlannerPortal>, success?: string) => {
    setBusy(true);
    try {
      setData(await fn());
      if (success) toast.success(success);
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <Link href={`/planner/dashboard/events/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-teal-700">
        <ArrowLeft className="w-4 h-4" /> Back to event
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Client portal{data ? ` · ${data.event.title}` : ""}</h1>
        <p className="text-sm text-gray-600 mt-1">
          Your client sees the schedule, checklist progress, budget and the documents you share, and can approve items and comment. No account needed.
        </p>
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

      {data && (
        <>
          <section className="bg-white rounded-lg shadow p-5 space-y-3">
            <h2 className="font-semibold">People with access</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (await run(() => clientPortalService.invite(id, invite.email, invite.name), `Invitation sent to ${invite.email}`)) setInvite({ email: "", name: "" });
              }}
              className="flex flex-wrap gap-2"
            >
              <input value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} placeholder="Client name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="email" required value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} placeholder="client@email.com" className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <button type="submit" disabled={busy} className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg disabled:opacity-50">
                Invite client
              </button>
            </form>
            {data.invites.length > 0 && (
              <ul className="divide-y divide-gray-100 text-sm">
                {data.invites.map((i) => (
                  <li key={i._id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {i.name ? `${i.name} · ` : ""}
                      {i.email}
                      <span className="text-xs text-gray-500">
                        {" "}
                        · {i.status === "revoked" ? "access removed" : i.lastViewedAt ? `last viewed ${new Date(i.lastViewedAt).toLocaleDateString()}` : "not opened yet"}
                      </span>
                    </span>
                    {i.link && (
                      <span className="flex gap-2">
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(i.link!);
                            toast.success("Link copied");
                          }}
                          className="flex items-center gap-1 text-xs text-teal-700"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy link
                        </button>
                        <button onClick={() => confirm(`Remove ${i.email}'s access?`) && run(() => clientPortalService.revoke(id, i._id))} className="text-xs text-red-600">
                          Remove access
                        </button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-lg shadow p-5 space-y-3">
            <h2 className="font-semibold">Approvals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await run(
                  () => clientPortalService.addApproval(id, { title: approval.title, description: approval.description || undefined, amount: Number(approval.amount) || undefined }),
                  "Approval requested"
                );
                if (ok) setApproval({ title: "", description: "", amount: "" });
              }}
              className="grid sm:grid-cols-[1fr_140px] gap-2"
            >
              <input required value={approval.title} onChange={(e) => setApproval({ ...approval, title: e.target.value })} placeholder="e.g. Menu option B" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="number" min={0} value={approval.amount} onChange={(e) => setApproval({ ...approval, amount: e.target.value })} placeholder="Amount (₦)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <textarea value={approval.description} onChange={(e) => setApproval({ ...approval, description: e.target.value })} placeholder="Details (optional)" rows={2} className="sm:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <button type="submit" disabled={busy} className="w-fit px-4 py-2 text-sm text-white bg-teal-600 rounded-lg disabled:opacity-50">
                Ask for approval
              </button>
            </form>
            <ul className="divide-y divide-gray-100">
              {data.approvals.map((a) => (
                <li key={a._id} className="py-3 text-sm flex justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {a.title}
                      {a.amount ? ` · ₦${a.amount.toLocaleString()}` : ""}
                    </p>
                    {a.description && <p className="text-gray-600">{a.description}</p>}
                    {a.response && <p className="text-gray-700 italic mt-1">“{a.response}” — {a.respondedBy}</p>}
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${APPROVAL_STYLE[a.status]}`}>{APPROVAL_LABEL[a.status]}</span>
                    <button onClick={() => confirm("Delete this approval?") && run(() => clientPortalService.deleteApproval(id, a._id))} className="text-gray-400 hover:text-red-600" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-lg shadow p-5 space-y-3">
            <h2 className="font-semibold">Documents</h2>
            {data.documents.length === 0 ? (
              <p className="text-sm text-gray-500">Upload documents to this event from Documents, then choose which ones your client sees.</p>
            ) : (
              <ul className="divide-y divide-gray-100 text-sm">
                {data.documents.map((d) => (
                  <li key={d._id} className="py-2 flex justify-between items-center">
                    <span>{d.name}</span>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600">
                      <input type="checkbox" checked={!!d.sharedWithClient} onChange={(e) => run(() => clientPortalService.shareDocument(id, d._id, e.target.checked))} />
                      Share with client
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-lg shadow p-5 space-y-3">
            <h2 className="font-semibold">Comments</h2>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {data.comments.map((c) => (
                <li key={c._id} className={`rounded-lg p-3 text-sm ${c.author === "planner" ? "bg-teal-50" : "bg-gray-50"}`}>
                  <p className="text-xs text-gray-500">
                    {c.name || c.author} · {new Date(c.createdAt).toLocaleString()}
                  </p>
                  <p className="whitespace-pre-line">{c.body}</p>
                </li>
              ))}
            </ul>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (await run(() => clientPortalService.comment(id, comment))) setComment("");
              }}
              className="flex gap-2"
            >
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write to your client" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <button type="submit" disabled={busy || !comment.trim()} className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg disabled:opacity-50">
                Send
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
