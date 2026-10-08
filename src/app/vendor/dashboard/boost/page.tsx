"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Sparkles, Star, Ticket } from "lucide-react";
import { toast } from "react-toastify";
import { featuredService, BoostOverview } from "@/services/featured.service";

const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");
const label = (c: string) => c.replace(/_/g, " ");

/** Boost my listing: featured placement bought by the week or from plan credits */
export default function VendorBoostPage() {
  const [data, setData] = useState<BoostOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [weeks, setWeeks] = useState(1);
  const [provider, setProvider] = useState<"flutterwave" | "paystack">("flutterwave");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await featuredService.getOverview());
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
    const query = new URLSearchParams(window.location.search);
    const outcome = query.get("payment");
    if (!outcome) return;
    if (outcome === "success") toast.success("Your listing is featured!");
    else if (outcome === "cancelled") toast.info("Payment cancelled");
    else toast.error(query.get("message") || "The payment didn't go through");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function buy() {
    setBusy(true);
    try {
      const { paymentUrl } = await featuredService.checkout(weeks, provider);
      window.location.href = paymentUrl;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't start the payment");
      setBusy(false);
      load();
    }
  }

  async function useCredit() {
    setBusy(true);
    try {
      const { boost } = await featuredService.useCredit();
      toast.success(`Featured from ${date(boost.startsAt)} to ${date(boost.endsAt)}`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't use the credit");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <p className="text-center py-10 text-gray-600">
        Couldn&apos;t load your featured listing.{" "}
        <button onClick={load} className="text-purple-700 underline">
          Try again
        </button>
      </p>
    );
  }

  const total = data.price.weekly * weeks;
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boost my listing</h1>
        <p className="text-sm text-gray-600 mt-1">
          Featured vendors appear at the top of searches in their category, marked &ldquo;Featured&rdquo;. Spots are limited and shared in rotation so search stays fair.
        </p>
      </div>

      <div className={`rounded-lg border p-5 flex items-start gap-3 ${data.featuredNow ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
        <Star className={`w-6 h-6 flex-shrink-0 ${data.featuredNow ? "text-green-600 fill-green-600" : "text-gray-300"}`} />
        <div className="text-sm">
          {data.featuredNow ? (
            <p className="font-medium text-green-800">Your listing is featured until {date(data.featuredUntil)}.</p>
          ) : (
            <p className="font-medium text-gray-800">Your listing isn&apos;t featured right now.</p>
          )}
          {data.venueListing && <p className="text-gray-700 mt-1">Your Venue plan includes a featured venue listing: you&apos;re always in the rotation for venue searches.</p>}
          {!data.eligible && <p className="text-amber-700 mt-1">Your profile needs to be approved before it can be featured.</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" /> Featured spots in {label(data.category)}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {data.slots.soldOut
              ? `Sold out. The next spot opens on ${date(data.slots.nextAvailableAt)}.`
              : `${data.slots.available} of ${data.slots.cap} spots free from ${date(data.nextStart)}.`}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-600" /> Plan credits
          </h2>
          {data.credits.perMonth > 0 ? (
            <>
              <p className="text-sm text-gray-600 mt-2">
                {data.credits.remaining} of {data.credits.perMonth} free week{data.credits.perMonth > 1 ? "s" : ""} left this month · expire {date(data.credits.expiresAt)}
              </p>
              <button
                onClick={useCredit}
                disabled={busy || data.credits.remaining === 0 || data.slots.soldOut || !data.eligible}
                className="mt-3 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg disabled:opacity-50"
              >
                Use a free week
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-600 mt-2">
              Business and Venue plans include free featured weeks every month.{" "}
              <a href="/vendor/dashboard/settings?tab=billing" className="text-purple-700 underline">
                See plans
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-semibold">Buy a boost</h2>
        <p className="text-sm text-gray-600 mt-1">₦{data.price.weekly.toLocaleString()} a week. Starts {date(data.nextStart)}.</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {Array.from({ length: data.price.maxWeeks }, (_, i) => i + 1).map((w) => (
              <button key={w} onClick={() => setWeeks(w)} className={`px-4 py-2 text-sm ${weeks === w ? "bg-purple-600 text-white" : "bg-white text-gray-700"}`}>
                {w} week{w > 1 ? "s" : ""}
              </button>
            ))}
          </div>
          <select value={provider} onChange={(e) => setProvider(e.target.value as "flutterwave" | "paystack")} className="text-sm border border-gray-300 rounded-lg px-2 py-2" aria-label="Payment provider">
            <option value="flutterwave">Flutterwave</option>
            <option value="paystack">Paystack</option>
          </select>
          <button onClick={buy} disabled={busy || data.slots.soldOut || !data.eligible} className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg disabled:opacity-50">
            {busy ? "Opening…" : `Pay ₦${total.toLocaleString()}`}
          </button>
        </div>
      </div>

      {data.boosts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold mb-2">Your boosts</h2>
          <ul className="divide-y divide-gray-100 text-sm">
            {data.boosts.map((b) => (
              <li key={b._id} className="py-2 flex justify-between">
                <span>
                  {date(b.startsAt)} – {date(b.endsAt)}
                </span>
                <span className="text-gray-600">{b.kind === "credit" ? "Plan credit" : `₦${b.amount.toLocaleString()}`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
