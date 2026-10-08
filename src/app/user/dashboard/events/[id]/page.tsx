"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Check, Crown, Loader2, MapPin, Sparkles, Users, Briefcase, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/api/api";
import { normalizeEvent, UserEvent } from "@/services/user.service";
import { eventPassService, ActivePass, EventPassOffer, PassTier } from "@/services/event-pass.service";

const RANK: Record<PassTier, number> = { celebration: 1, plus: 2, diaspora: 2 };

/** A client's event: details, its pass, and "Upgrade this event" */
export default function UserEventPage() {
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<UserEvent | null>(null);
  const [pass, setPass] = useState<ActivePass | null>(null);
  const [offers, setOffers] = useState<EventPassOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [provider, setProvider] = useState<"flutterwave" | "paystack">("flutterwave");
  const [buying, setBuying] = useState<PassTier | null>(null);

  const load = useCallback(async () => {
    try {
      const [eventRes, activePass, catalogue] = await Promise.all([
        api.get(`/events/${id}`),
        eventPassService.getPassForEvent(id).catch(() => null),
        eventPassService.getCatalogue().catch(() => []),
      ]);
      setEvent(normalizeEvent(eventRes.data.data?.event || eventRes.data.event || eventRes.data));
      setPass(activePass);
      setOffers(catalogue);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  // Back from the payment page
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const outcome = query.get("pass");
    if (!outcome) return;
    if (outcome === "success") toast.success("Your pass is active. Enjoy planning!");
    else if (outcome === "cancelled") toast.info("Payment cancelled");
    else toast.error(query.get("message") || "The payment didn't go through");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function buy(tier: PassTier) {
    setBuying(tier);
    try {
      const { paymentUrl } = await eventPassService.checkout({ eventId: id, tier, paymentProvider: provider });
      window.location.href = paymentUrl;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't start the payment");
      setBuying(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }
  if (notFound || !event) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">This event couldn&apos;t be found.</p>
        <Link href="/user/dashboard/events" className="text-purple-600 text-sm hover:underline">
          Back to my events
        </Link>
      </div>
    );
  }

  const current = pass ? offers.find((o) => o.key === pass.tier) : null;
  const upgrades = offers.filter((o) => !pass || RANK[o.key] > RANK[pass.tier]);
  const ngn = (offer: EventPassOffer) => offer.prices.NGN;
  const priceLabel = (offer: EventPassOffer) => {
    if (!offer.available) {
      const usd = offer.prices.USD;
      return usd ? `$${usd}` : "Coming soon";
    }
    const full = ngn(offer);
    const paid = current ? ngn(current) || 0 : 0;
    return `₦${(full - paid).toLocaleString()}${paid ? " to upgrade" : ""}`;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/user/dashboard/events" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-purple-700">
        <ArrowLeft className="w-4 h-4" /> My events
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{event.name}</h1>
            <p className="text-sm text-purple-600 font-medium capitalize mt-1">{event.type}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              current ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
            }`}
          >
            {current ? <Crown className="w-4 h-4" /> : null}
            {current ? current.displayName : "Free plan"}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-600 dark:text-gray-400">
          {event.date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {format(new Date(event.date), "EEE, MMM d, yyyy")}
            </span>
          )}
          {(event.location.city || event.location.state) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {[event.location.city, event.location.state].filter(Boolean).join(", ")}
            </span>
          )}
          {event.guestCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {event.guestCount} guests
            </span>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/user/dashboard/vendors" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
            <Briefcase className="w-4 h-4" /> Find vendors
          </Link>
          <Link href="/user/dashboard/ai-planner" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
            <Sparkles className="w-4 h-4" /> AI planner
          </Link>
          <Link href="/user/dashboard/messages" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
            <MessageSquare className="w-4 h-4" /> Messages
          </Link>
        </div>
      </div>

      {current && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="font-semibold text-amber-900 flex items-center gap-2">
            <Crown className="w-4 h-4" /> {current.displayName} is active for this event
          </p>
          <ul className="mt-2 grid sm:grid-cols-2 gap-1">
            {current.featureList.map((f) => (
              <li key={f} className="text-sm text-amber-900 flex items-start gap-1.5">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {upgrades.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {current ? "Upgrade this event" : "Unlock everything for this event"}
              </h2>
              <p className="text-sm text-gray-500">One payment for this event. No subscription.</p>
            </div>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as "flutterwave" | "paystack")}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5"
              aria-label="Payment provider"
            >
              <option value="flutterwave">Pay with Flutterwave</option>
              <option value="paystack">Pay with Paystack</option>
            </select>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {upgrades.map((offer) => (
              <div key={offer.key} className={`border rounded-xl p-4 flex flex-col ${offer.available ? "border-gray-200" : "border-dashed border-gray-200 opacity-70"}`}>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{offer.displayName}</p>
                <p className="text-xl font-bold mt-1">{priceLabel(offer)}</p>
                <p className="text-xs text-gray-500 mt-1">{offer.description}</p>
                <ul className="mt-3 space-y-1 flex-1">
                  {offer.featureList.map((f) => (
                    <li key={f} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => buy(offer.key)}
                  disabled={!offer.available || !!buying}
                  className="mt-4 w-full py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buying === offer.key ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : !offer.available ? (
                    "Coming soon"
                  ) : current ? (
                    "Upgrade"
                  ) : (
                    "Get this pass"
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
