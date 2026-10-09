import api from "@/api/api";

/**
 * Booking payments held by Confetti (escrow), vendor payouts and admin tools.
 * API: confetti_server routes/escrow.routes.js. Amounts are in naira.
 */

export type EscrowStatus = "pending_payment" | "held" | "released" | "refunded" | "disputed" | "cancelled";
export type PayoutStatus = "not_started" | "processing" | "paid" | "failed" | "manual";

export interface EscrowPaymentView {
  _id: string;
  booking: string;
  amount: number;
  currency: string;
  kind: "deposit" | "balance" | "full";
  status: EscrowStatus;
  paidAt?: string;
  releaseAfter?: string;
  releasedAt?: string;
  releaseReason?: "client_confirmed" | "auto" | "admin";
  commissionRate: number;
  commission: number;
  vendorAmount: number;
  refunded: number;
  refundStatus: string;
  payoutStatus: PayoutStatus;
  dispute: { reason: string; openedByRole: string; resolution?: string; resolvedAt?: string } | null;
  /** Paid from abroad: what the client was charged */
  charged?: { amount: number; currency: string } | null;
}

export interface BookingPayments {
  payments: EscrowPaymentView[];
  totals: { total: number; paid: number; outstanding: number; deposit: number; currency: string };
  canPay: boolean;
  bookingStatus: string;
  autoReleaseDays: number;
  /** Naira per USD/GBP, for paying from abroad */
  fxRates?: Record<string, number>;
  /** Diaspora Pass: this booking is paid through Confetti only */
  escrowRequired?: boolean;
  passCurrency?: string | null;
}

export interface PayoutAccount {
  bankCode: string;
  bankName: string;
  accountLast4: string;
  accountName: string;
  verified: boolean;
  payoutsReady: boolean;
  subaccount: boolean;
}

export const escrowService = {
  async getBookingPayments(bookingId: string): Promise<BookingPayments> {
    const res = await api.get(`/escrow/bookings/${bookingId}`);
    return res.data.data;
  },
  async checkout(data: {
    bookingId: string;
    amount?: number;
    paymentProvider?: "flutterwave" | "paystack";
    currency?: string;
  }): Promise<{ paymentUrl: string; charged?: { amount: number; currency: string } | null }> {
    const res = await api.post("/escrow/checkout", data);
    return res.data.data;
  },
  async confirmDelivery(escrowId: string): Promise<EscrowPaymentView> {
    const res = await api.post(`/escrow/${escrowId}/confirm`);
    return res.data.data.payment;
  },
  async openDispute(escrowId: string, reason: string): Promise<EscrowPaymentView> {
    const res = await api.post(`/escrow/${escrowId}/dispute`, { reason });
    return res.data.data.payment;
  },
  async getBanks(): Promise<Array<{ name: string; code: string }>> {
    const res = await api.get("/escrow/banks");
    return res.data.data.banks;
  },

  // Vendors
  async getVendorPayouts(): Promise<{
    payoutAccount: { bankName: string; accountLast4: string; accountName: string; verified: boolean } | null;
    totals: { held: number; awaitingPayout: number; paidOut: number; fees: number };
    payments: Array<EscrowPaymentView & { clientName?: string; eventType?: string; eventDate?: string }>;
  }> {
    const res = await api.get("/vendors/payouts");
    return res.data.data;
  },
  async getPayoutAccount(): Promise<PayoutAccount | null> {
    const res = await api.get("/vendors/payouts/account");
    return res.data.data.account;
  },
  async savePayoutAccount(bankCode: string, accountNumber: string): Promise<PayoutAccount> {
    const res = await api.put("/vendors/payouts/account", { bankCode, accountNumber });
    return res.data.data.account;
  },

  // Admins
  async adminList(params: { status?: string; payoutStatus?: string; page?: number }) {
    const res = await api.get("/admin/escrow", { params });
    return res.data.data as {
      items: Array<
        EscrowPaymentView & {
          client: { name: string; email: string } | null;
          vendor: { _id: string; name: string } | null;
          event: { type: string; date: string } | null;
          payoutFailure?: string;
          history: Array<{ status: string; note?: string; at: string }>;
        }
      >;
      total: number;
      page: number;
      totalPages: number;
    };
  },
  async adminReport(params?: { from?: string; to?: string }) {
    const res = await api.get("/admin/escrow/report", { params });
    return res.data.data as {
      collected: { amount: number; refunded: number; payments: number };
      released: { gross: number; commission: number; toVendors: number; payments: number };
      heldNow: Record<string, { amount: number; payments: number }>;
      owedToVendors: { amount: number; payments: number };
      byMonth: Array<{ period: string; commission: number; gross: number }>;
      byRate: Array<{ rate: number; commission: number; gross: number; payments: number }>;
    };
  },
  async adminResolve(id: string, data: { resolution: "release" | "refund" | "split"; refundAmount?: number; note?: string }) {
    const res = await api.post(`/admin/escrow/${id}/resolve`, data);
    return res.data.data.payment as EscrowPaymentView;
  },
  async adminRetryPayout(id: string) {
    const res = await api.post(`/admin/escrow/${id}/payout/retry`);
    return res.data.data.payment as EscrowPaymentView;
  },
  async adminMarkPaid(id: string, note?: string) {
    const res = await api.post(`/admin/escrow/${id}/payout/mark-paid`, { note });
    return res.data.data.payment as EscrowPaymentView;
  },
};

export default escrowService;
