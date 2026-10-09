"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeCheck, Heart, Loader2, MapPin, Sparkles, Star, X } from "lucide-react";
import { toast } from "react-toastify";
import EventSubNav from "@/components/user/events/EventSubNav";
import PlusGate from "@/components/user/events/PlusGate";
import MessageButton from "@/components/messages/MessageButton";
import QuoteRequestModal from "@/components/user/booking/QuoteRequestModal";
import { celebrationPlusService as svc, Shortlist, ShortlistVendor } from "@/services/celebration-plus.service";

const CATEGORIES = [
  "venue", "catering", "photography", "videography", "decoration", "music", "makeup", "cake", "rentals", "transportation", "planning", "other",
];
const naira = (n?: number) => `₦${Math.round(n || 0).toLocaleString()}`;
const errorText = (err: any, fallback: string) => err?.response?.data?.message || fallback;
const STATUS_TEXT: Record<Shortlist["status"], string> = {
  new: "Tell us what you need and our team will pick vendors for you.",
  requested: "Thanks! Our team is looking for the right vendors. We'll let you know when your shortlist is ready.",
  in_progress: "Our team is putting your shortlist together.",
  ready: "Your shortlist is ready. Mark the vendors you like, then message them or ask for a quote.",
};

function ShortlistScreen({ eventId }: { eventId: string }) {
  const [list, setList] = useState<Shortlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [brief, setBrief] = useState({ categories: [] as string[], budget: "" as number | "", notes: "" });
  const [editingBrief, setEditingBrief] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showDismissed, setShowDismissed] = useState(false);
  const [quoteVendor, setQuoteVendor] = useState<ShortlistVendor | null>(null);

  const apply = (data: Shortlist) => {
    setList(data);
    setBrief({ categories: data.brief?.categories || [], budget: data.brief?.budget ?? "", notes: data.brief?.notes || "" });
  };

  const load = useCallback(async () => {
    try {
      apply(await svc.getShortlist(eventId));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendBrief(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      apply(await svc.submitBrief(eventId, { categories: brief.categories, budget: brief.budget === "" ? undefined : Number(brief.budget), notes: brief.notes }));
      setEditingBrief(false);
      toast.success("Sent to our team");
    } catch (err) {
      toast.error(errorText(err, "Couldn't send"));
    } finally {
      setBusy(false);
    }
  }

  async function mark(itemId: string, status: "new" | "interested" | "dismissed") {
    try {
      apply(await svc.setShortlistItem(eventId, itemId, status));
    } catch (err) {
      toast.error(errorText(err, "Couldn't update"));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
      </div>
    );
  }
  if (error || !list) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-700">Couldn&apos;t load your shortlist.</p>
        <button onClick={load} className="mt-2 text-sm text-purple-700 underline">
          Try again
        </button>
      </div>
    );
  }

  const showForm = list.status === "new" || editingBrief;
  const items = list.items.filter((i) => i.vendor && (showDismissed || i.clientStatus !== "dismissed"));
  const dismissed = list.items.filter((i) => i.clientStatus === "dismissed").length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-amber-50 border border-purple-100 rounded-xl p-5">
        <p className="font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" /> Hand-picked by the Confetti team
        </p>
        <p className="text-sm text-gray-600 mt-1">{STATUS_TEXT[list.status]}</p>
        {!showForm && list.brief?.submittedAt && (
          <div className="mt-3 text-sm text-gray-700">
            <p>
              <span className="text-gray-500">You asked for:</span> {list.brief.categories.join(", ") || "—"}
              {list.brief.budget ? ` · budget ${naira(list.brief.budget)}` : ""}
            </p>
            {list.brief.notes && <p className="text-gray-600 mt-1">&ldquo;{list.brief.notes}&rdquo;</p>}
            <button onClick={() => setEditingBrief(true)} className="mt-2 text-purple-700 text-sm hover:underline">
              Change what you need
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={sendBrief} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Which vendors do you need?</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const on = brief.categories.includes(c);
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setBrief({ ...brief, categories: on ? brief.categories.filter((x) => x !== c) : [...brief.categories, c] })}
                    className={`px-3 py-1.5 rounded-full text-sm capitalize border ${on ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                    aria-pressed={on}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="block text-sm text-gray-700">
            Budget for these vendors (₦, optional)
            <input
              type="number"
              min={0}
              className="mt-1 w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={brief.budget}
              onChange={(e) => setBrief({ ...brief, budget: e.target.value === "" ? "" : Number(e.target.value) })}
            />
          </label>
          <label className="block text-sm text-gray-700">
            Anything we should know? (style, must-haves, area)
            <textarea rows={3} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={brief.notes} onChange={(e) => setBrief({ ...brief, notes: e.target.value })} />
          </label>
          <div className="flex gap-2">
            <button disabled={busy} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
              Send to the team
            </button>
            {editingBrief && (
              <button type="button" onClick={() => setEditingBrief(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {list.items.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Your shortlist</h3>
            {dismissed > 0 && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={showDismissed} onChange={(e) => setShowDismissed(e.target.checked)} /> Show hidden ({dismissed})
              </label>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((i) => {
              const v = i.vendor!;
              return (
                <div key={i._id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex gap-4 ${i.clientStatus === "dismissed" ? "opacity-60" : ""}`}>
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {v.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.photo} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                          {v.businessName} {v.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" aria-label="Verified" />}
                        </p>
                        <p className="text-xs text-gray-500 capitalize flex items-center gap-2 mt-0.5">
                          {v.category}
                          {v.rating ? (
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {Number(v.rating).toFixed(1)}
                            </span>
                          ) : null}
                          {v.city && (
                            <span className="flex items-center gap-0.5 normal-case">
                              <MapPin className="w-3 h-3" /> {v.city}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => mark(i._id, i.clientStatus === "interested" ? "new" : "interested")}
                          className={`p-1.5 rounded-full ${i.clientStatus === "interested" ? "text-red-500 bg-red-50" : "text-gray-400 hover:bg-gray-100"}`}
                          aria-label={i.clientStatus === "interested" ? "Unmark" : "I like this one"}
                          aria-pressed={i.clientStatus === "interested"}
                        >
                          <Heart className={`w-4 h-4 ${i.clientStatus === "interested" ? "fill-red-500" : ""}`} />
                        </button>
                        <button
                          onClick={() => mark(i._id, i.clientStatus === "dismissed" ? "new" : "dismissed")}
                          className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100"
                          aria-label={i.clientStatus === "dismissed" ? "Show again" : "Hide"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {i.note && <p className="text-sm text-gray-700 mt-2 italic">&ldquo;{i.note}&rdquo;</p>}
                    {v.priceRange?.min ? <p className="text-xs text-gray-500 mt-1">From {naira(v.priceRange.min)}</p> : null}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <MessageButton
                        participantId={v._id}
                        relatedEvent={eventId}
                        subject={`Enquiry from Confetti shortlist`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                      />
                      <button onClick={() => setQuoteVendor(v)} className="px-3 py-1.5 rounded-lg text-xs bg-purple-600 text-white hover:bg-purple-700">
                        Ask for a quote
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {quoteVendor && (
        <QuoteRequestModal
          vendor={{
            _id: quoteVendor._id,
            businessName: quoteVendor.businessName,
            category: quoteVendor.category || "vendor",
            pricing: { startingPrice: quoteVendor.priceRange?.min, currency: "NGN" },
          }}
          onClose={() => setQuoteVendor(null)}
          onSuccess={() => setQuoteVendor(null)}
        />
      )}
    </div>
  );
}

export default function ShortlistPage() {
  const { id } = useParams() as { id: string };
  return (
    <div className="max-w-5xl">
      <EventSubNav eventId={id} />
      <PlusGate
        eventId={id}
        feature="curatedShortlist"
        title="A curated vendor shortlist"
        description="Tell us what you need and the Confetti team will hand-pick vendors for your event, on top of the AI suggestions."
      >
        <ShortlistScreen eventId={id} />
      </PlusGate>
    </div>
  );
}
