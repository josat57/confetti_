import api from "@/api/api";

/** Corporate accounts. API: confetti_server routes/organization.routes.js */

export type OrgRole = "admin" | "approver" | "requester";
export type ContractStatus = "none" | "requested" | "invoiced" | "active" | "expired" | "cancelled";

export interface Organization {
  _id: string;
  name: string;
  legalName?: string;
  rcNumber?: string;
  vatNumber?: string;
  billingEmail?: string;
  phone?: string;
  address?: { street?: string; city?: string; state?: string; country?: string };
  departments: string[];
  budgets: Array<{ department?: string; year: number; amount: number }>;
  approvalThreshold: number;
  contract: { status: ContractStatus; amount?: number; startsAt?: string; endsAt?: string; requestedAt?: string };
  me: { role: OrgRole; department?: string } | null;
  memberCount: number;
}
export interface OrgMember {
  user: { _id: string; name: string; email: string };
  role: OrgRole;
  department?: string;
  addedAt: string;
}
export interface OrgInvite {
  _id: string;
  email: string;
  role: OrgRole;
  department?: string;
  createdAt: string;
}
export interface OrgEvent {
  _id: string;
  title: string;
  eventType: string;
  startDate: string;
  status: string;
  department?: string;
  guestCount?: number;
  budget: number | null;
  spent: number;
  committed: number;
  mine: boolean;
}
export interface OrgBooking {
  _id: string;
  vendor: { _id: string; businessName: string; category?: string };
  event: { _id: string; title: string; department?: string };
  status: string;
  amount: number | null;
  paid: number;
  purchaseRequests: Array<{ _id: string; number: string; status: string; amount: number }>;
}
export interface PurchaseRequest {
  _id: string;
  number: string;
  event: { _id: string; title: string } | string;
  booking: string;
  vendor: { _id: string; businessName?: string; name?: string } | string;
  department?: string;
  description?: string;
  amount: number;
  currency: string;
  requestedBy: { _id: string; firstName?: string; lastName?: string; email?: string } | string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  autoApproved: boolean;
  decidedBy?: { firstName?: string; lastName?: string } | string;
  decidedAt?: string;
  decisionNote?: string;
  log: Array<{ action: string; note?: string; at: string; by?: any }>;
  createdAt: string;
}
export interface SpendGroup {
  key: string;
  name: string;
  paid: number;
  payments: number;
  department?: string;
  committed?: number;
  budget?: number | null;
  remaining?: number | null;
}
export interface SpendReport {
  organization: { name: string };
  period: { from: string; to: string };
  totals: { paid: number; payments: number; committed: number; pendingApproval: number; pendingCount: number };
  byEvent: SpendGroup[];
  byDepartment: SpendGroup[];
  byVendor: SpendGroup[];
  payments: Array<{ date: string; event: string; department: string; vendor: string; category: string; amount: number; method: string }>;
}
export interface CorporateInvoice {
  _id: string;
  number: string;
  kind: "contract" | "renewal";
  billedTo: { name?: string; rcNumber?: string; vatNumber?: string; email?: string; address?: string };
  items: Array<{ description: string; amount: number }>;
  subtotal: number;
  vatRate: number;
  vat: number;
  total: number;
  currency: string;
  periodStart?: string;
  periodEnd?: string;
  issuedAt: string;
  dueDate?: string;
  status: "issued" | "paid" | "void";
  paidAt?: string;
  paymentMethod?: "card" | "transfer";
  paymentReference?: string;
}
export interface Receipt {
  _id: string;
  number: string;
  paidAt: string;
  amount: number;
  refunded: number;
  vendor: string;
  event: string;
  status: string;
}

// People can belong to several companies; the chosen one goes with every company request
const ACTIVE_KEY = "confetti_company";
export const getActiveCompany = (): string | null => {
  try {
    return typeof window === "undefined" ? null : localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
};
export const setActiveCompany = (id: string | null) => {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // private mode: falls back to the first company
  }
};
api.interceptors.request.use((config) => {
  const id = getActiveCompany();
  if (id && config.url?.startsWith("/organizations")) {
    config.headers = config.headers || {};
    (config.headers as any)["X-Organization-Id"] = id;
  }
  return config;
});

export interface CompanyMembership {
  _id: string;
  name: string;
  role: OrgRole;
  contractActive: boolean;
}

const d = <T>(p: Promise<{ data: { data: T } }>) => p.then((r) => r.data.data);
const blob = (url: string, params?: Record<string, unknown>) => api.get(url, { params, responseType: "blob" }).then((r) => r.data as Blob);

export const organizationService = {
  get: () => d<Organization>(api.get("/organizations/me")),
  mine: () => d<{ organizations: CompanyMembership[] }>(api.get("/organizations/mine")).then((x) => x.organizations),
  create: (body: Partial<Organization> & { name: string }) => d<Organization>(api.post("/organizations", body)),
  update: (body: Partial<Organization>) => d<Organization>(api.patch("/organizations/me", body)),
  setBudgets: (budgets: Organization["budgets"]) => d<Organization>(api.put("/organizations/me/budgets", { budgets })),

  members: () => d<{ members: OrgMember[]; invites: OrgInvite[] }>(api.get("/organizations/me/members")),
  invite: (body: { email: string; role: OrgRole; department?: string }) =>
    d<{ invite: OrgInvite; link: string }>(api.post("/organizations/me/invites", body)),
  revokeInvite: (id: string) => d(api.delete(`/organizations/me/invites/${id}`)),
  updateMember: (userId: string, body: { role?: OrgRole; department?: string }) =>
    d<{ members: OrgMember[]; invites: OrgInvite[] }>(api.patch(`/organizations/me/members/${userId}`, body)),
  removeMember: (userId: string) => d<{ members: OrgMember[]; invites: OrgInvite[] }>(api.delete(`/organizations/me/members/${userId}`)),
  previewInvite: (token: string) => d<{ organization: string; email: string; role: OrgRole }>(api.get(`/organizations/invites/${token}`)),
  acceptInvite: (token: string) => d<Organization>(api.post(`/organizations/invites/${token}/accept`)),

  events: (params?: { department?: string }) => d<{ events: OrgEvent[] }>(api.get("/organizations/me/events", { params })).then((x) => x.events),
  createEvent: (body: { title: string; startDate: string; endDate?: string; department?: string; budget?: number; guestCount?: number; city?: string; description?: string }) =>
    d<{ event: { _id: string } }>(api.post("/organizations/me/events", body)).then((x) => x.event),
  attachEvent: (eventId: string, department?: string) => d(api.post(`/organizations/me/events/${eventId}/attach`, { department })),
  bookings: () => d<{ bookings: OrgBooking[] }>(api.get("/organizations/me/bookings")).then((x) => x.bookings),

  purchases: (params?: { status?: string; mine?: string }) =>
    d<{ purchases: PurchaseRequest[] }>(api.get("/organizations/me/purchases", { params })).then((x) => x.purchases),
  createPurchase: (body: { bookingId: string; amount?: number; description?: string }) =>
    d<{ purchase: PurchaseRequest }>(api.post("/organizations/me/purchases", body)).then((x) => x.purchase),
  approve: (id: string, note?: string) => d<{ purchase: PurchaseRequest }>(api.post(`/organizations/me/purchases/${id}/approve`, { note })),
  reject: (id: string, note: string) => d<{ purchase: PurchaseRequest }>(api.post(`/organizations/me/purchases/${id}/reject`, { note })),
  cancelPurchase: (id: string) => d<{ purchase: PurchaseRequest }>(api.post(`/organizations/me/purchases/${id}/cancel`)),

  report: (params?: { from?: string; to?: string }) => d<SpendReport>(api.get("/organizations/me/reports", { params })),
  reportCsv: (params?: { from?: string; to?: string }) => blob("/organizations/me/reports/export.csv", params),
  reportPdf: (params?: { from?: string; to?: string }) => blob("/organizations/me/reports/export.pdf", params),

  requestContract: (notes?: string) => d<{ status: ContractStatus }>(api.post("/organizations/me/contract/request", { notes })),
  invoices: () =>
    d<{ invoices: CorporateInvoice[]; bank: { bankName: string | null; accountName: string; accountNumber: string | null } }>(api.get("/organizations/me/invoices")),
  invoicePdf: (id: string) => blob(`/organizations/me/invoices/${id}/pdf`),
  payInvoice: (id: string, paymentProvider: "flutterwave" | "paystack" = "flutterwave") =>
    d<{ paymentUrl: string }>(api.post(`/organizations/me/invoices/${id}/pay`, { paymentProvider })),
  receipts: () => d<{ receipts: Receipt[] }>(api.get("/organizations/me/receipts")).then((x) => x.receipts),
  receiptPdf: (id: string) => blob(`/organizations/me/receipts/${id}/pdf`),

  // Confetti admin
  adminList: (params?: { status?: string }) => d<{ organizations: any[] }>(api.get("/admin/corporate", { params })).then((x) => x.organizations),
  adminGet: (id: string) => d<{ organization: any; invoices: CorporateInvoice[]; events: number }>(api.get(`/admin/corporate/${id}`)),
  adminIssueInvoice: (id: string, body: { amount: number; startsAt?: string; kind?: "contract" | "renewal"; notes?: string }) =>
    d<{ invoice: CorporateInvoice }>(api.post(`/admin/corporate/${id}/invoices`, body)),
  adminMarkPaid: (invoiceId: string, reference?: string) => d(api.post(`/admin/corporate/invoices/${invoiceId}/mark-paid`, { reference })),
  adminVoid: (invoiceId: string) => d(api.post(`/admin/corporate/invoices/${invoiceId}/void`)),
  adminInvoicePdf: (invoiceId: string) => blob(`/admin/corporate/invoices/${invoiceId}/pdf`),
  adminCancelContract: (id: string) => d(api.post(`/admin/corporate/${id}/contract/cancel`)),
};

export const naira = (n?: number | null) => `₦${Math.round(n || 0).toLocaleString()}`;

/** Save a downloaded file */
export function saveFile(data: Blob, name: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default organizationService;
