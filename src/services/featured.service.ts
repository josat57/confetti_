import api from "@/api/api";

export interface BoostOverview {
  category: string;
  eligible: boolean;
  featuredNow: boolean;
  featuredUntil?: string;
  venueListing: boolean;
  price: { weekly: number; currency: string; maxWeeks: number };
  credits: { perMonth: number; used: number; remaining: number; expiresAt: string; plan?: string };
  slots: { category: string; cap: number; inUse: number; available: number; soldOut: boolean; nextAvailableAt: string | null };
  nextStart: string;
  boosts: Array<{ _id: string; kind: "paid" | "credit"; weeks: number; startsAt: string; endsAt: string; amount: number }>;
}

// API: confetti_server routes/featured.routes.js
export const featuredService = {
  async getOverview(): Promise<BoostOverview> {
    const res = await api.get("/vendors/boost");
    return res.data.data;
  },
  async checkout(weeks: number, paymentProvider: "flutterwave" | "paystack"): Promise<{ paymentUrl: string }> {
    const res = await api.post("/vendors/boost/checkout", { weeks, paymentProvider });
    return res.data.data;
  },
  async useCredit(): Promise<{ boost: { startsAt: string; endsAt: string } }> {
    const res = await api.post("/vendors/boost/use-credit");
    return res.data.data;
  },
};

export default featuredService;
