import api from "@/api/api";

export type PassTier = "celebration" | "plus" | "diaspora";

export interface EventPassOffer {
  key: PassTier;
  displayName: string;
  description: string;
  prices: Record<string, number>;
  featureList: string[];
  features: Record<string, boolean>;
  available: boolean;
}

export interface ActivePass {
  tier: PassTier;
  activatedAt?: string;
}

// API: confetti_server routes/event-pass.routes.js
export const eventPassService = {
  async getCatalogue(): Promise<EventPassOffer[]> {
    const res = await api.get("/event-passes/catalogue");
    return res.data.data.passes;
  },

  /** Active pass for one event (null when the event is on the free plan) */
  async getPassForEvent(eventId: string): Promise<ActivePass | null> {
    const res = await api.get("/event-passes", { params: { eventId } });
    return res.data.data.pass;
  },

  /** Active passes for all my events, keyed by event id */
  async getMyPasses(): Promise<Record<string, ActivePass>> {
    const res = await api.get("/event-passes");
    return res.data.data.passes || {};
  },

  /** Start paying for a pass (or an upgrade); returns the payment page URL */
  async checkout(data: {
    eventId: string;
    tier: PassTier;
    paymentProvider?: "flutterwave" | "paystack";
  }): Promise<{ paymentUrl: string; amount: number; currency: string }> {
    const res = await api.post("/event-passes/checkout", data);
    return res.data.data;
  },
};

export default eventPassService;
