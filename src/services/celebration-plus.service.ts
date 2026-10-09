import api from "@/api/api";

/**
 * Celebration Plus screens: run sheet, gifts, aso-ebi and the curated vendor shortlist.
 * API: confetti_server routes/celebration-plus.routes.js
 */

// ---- Run sheet ----

export interface RunSheetVendor {
  _id: string;
  name: string;
  vendor?: string | null;
  role?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  arrivalTime?: string;
  shareLink: string | null;
  sharedAt?: string;
  lastViewedAt?: string;
  slots: number;
}
export interface RunSheetItem {
  _id: string;
  day?: string;
  start: string;
  end?: string;
  title: string;
  description?: string;
  location?: string;
  vendorKey: string | null;
  vendorName: string | null;
  forAllVendors: boolean;
  notes?: string;
  mine?: boolean;
}
export interface RunSheetEvent {
  _id?: string;
  title: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
}
export interface RunSheet {
  event: RunSheetEvent;
  dayOfContact: { name?: string; phone?: string };
  notes: string;
  vendors: RunSheetVendor[];
  items: RunSheetItem[];
  added?: number;
  emailed?: boolean;
}
export interface SharedRunSheet {
  event: RunSheetEvent;
  vendor: { name: string; role?: string; arrivalTime?: string };
  dayOfContact: { name?: string; phone?: string };
  notes: string;
  items: RunSheetItem[];
  otherVendors: Array<{ name: string; role?: string; arrivalTime?: string }>;
  updatedAt: string;
}
export type RunSheetVendorInput = Partial<Pick<RunSheetVendor, "name" | "role" | "contactName" | "contactPhone" | "contactEmail" | "arrivalTime">>;
export type RunSheetItemInput = Partial<Pick<RunSheetItem, "day" | "start" | "end" | "title" | "description" | "location" | "forAllVendors" | "notes">> & {
  vendorKey?: string | null;
};

// ---- Gifts ----

export type GiftCategory = "item" | "cash" | "voucher" | "experience" | "other";
export type ThankYouMethod = "card" | "message" | "call" | "in_person" | "other";
export interface Gift {
  _id: string;
  kind: "registry" | "received";
  title: string;
  description?: string;
  category: GiftCategory;
  amount?: number;
  link?: string;
  quantityWanted: number;
  quantityReceived: number;
  fromName?: string;
  guest?: { _id: string; name: string } | null;
  registryItem?: string | null;
  receivedAt?: string;
  thankYou?: { status: "not_sent" | "sent"; sentAt?: string; method?: ThankYouMethod };
  notes?: string;
  createdAt: string;
}
export interface GiftSummary {
  registry: { items: number; fulfilled: number };
  received: { count: number; cashTotal: number; thankYouSent: number; thankYouPending: number };
}
export interface GiftInput {
  kind?: "registry" | "received";
  title?: string;
  description?: string;
  category?: GiftCategory;
  amount?: number | "";
  link?: string;
  quantityWanted?: number;
  fromName?: string;
  guest?: string | null;
  registryItem?: string | null;
  receivedAt?: string;
  notes?: string;
  thankYouSent?: boolean;
}

// ---- Aso-ebi ----

export type AsoEbiUnit = "yard" | "piece" | "set" | "bundle";
export interface AsoEbiFabric {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  unit: AsoEbiUnit;
  price: number;
  stock?: number;
  active: boolean;
  ordered: number;
  remaining: number | null;
  orders: number;
  due: number;
  paid: number;
}
export interface AsoEbiOrder {
  _id: string;
  fabric: string;
  guest?: string;
  name: string;
  phone?: string;
  quantity: number;
  size?: string;
  measurements?: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  payments: Array<{ _id: string; amount: number; method: string; note?: string; at: string }>;
  collectionStatus: "pending" | "ready" | "collected";
  collectedAt?: string;
  collectedBy?: string;
  notes?: string;
}
export interface AsoEbiOverview {
  fabrics: AsoEbiFabric[];
  orders: AsoEbiOrder[];
  summary: {
    orders: number;
    due: number;
    paid: number;
    outstanding: number;
    payment: Record<"unpaid" | "partial" | "paid", number>;
    collection: Record<"pending" | "ready" | "collected", number>;
  };
  sizes: string[];
}

// ---- Curated shortlist ----

export interface ShortlistVendor {
  _id: string;
  businessName: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  city?: string;
  state?: string;
  priceRange?: { min?: number; max?: number };
  photo?: string | null;
  isVerified?: boolean;
}
export interface Shortlist {
  _id: string | null;
  status: "new" | "requested" | "in_progress" | "ready";
  brief: { categories: string[]; budget?: number; notes?: string; submittedAt?: string };
  readyAt?: string;
  items: Array<{
    _id: string;
    vendor: ShortlistVendor | null;
    category?: string;
    note?: string;
    clientStatus: "new" | "interested" | "dismissed";
    addedAt: string;
  }>;
}
export interface CurationQueueRow {
  eventId: string;
  title: string;
  eventType: string;
  startDate?: string;
  city?: string;
  tier: string;
  status: Shortlist["status"];
  brief: Shortlist["brief"] | null;
  picks: number;
  interested: number;
  updatedAt?: string;
}
export interface CurationEvent {
  event: {
    _id: string;
    title: string;
    description?: string;
    eventType: string;
    startDate?: string;
    city?: string;
    state?: string;
    guestCount?: number;
    budget?: { amount?: number; currency?: string };
    client: { name: string; email: string } | null;
  };
  shortlist: Shortlist;
}

const ev = (eventId: string) => `/events/${eventId}`;
const data = <T>(p: Promise<{ data: { data: T } }>) => p.then((r) => r.data.data);

/** Save a downloaded blob as a file */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const celebrationPlusService = {
  // Run sheet
  getRunSheet: (eventId: string) => data<RunSheet>(api.get(`${ev(eventId)}/run-sheet`)),
  updateRunSheet: (eventId: string, body: { dayOfContact?: { name?: string; phone?: string }; notes?: string }) =>
    data<RunSheet>(api.patch(`${ev(eventId)}/run-sheet`, body)),
  addRunSheetVendor: (eventId: string, body: RunSheetVendorInput) => data<RunSheet>(api.post(`${ev(eventId)}/run-sheet/vendors`, body)),
  importRunSheetVendors: (eventId: string) => data<RunSheet>(api.post(`${ev(eventId)}/run-sheet/vendors/import`)),
  updateRunSheetVendor: (eventId: string, key: string, body: RunSheetVendorInput) =>
    data<RunSheet>(api.patch(`${ev(eventId)}/run-sheet/vendors/${key}`, body)),
  removeRunSheetVendor: (eventId: string, key: string) => data<RunSheet>(api.delete(`${ev(eventId)}/run-sheet/vendors/${key}`)),
  shareRunSheetVendor: (eventId: string, key: string, email = false) =>
    data<RunSheet>(api.post(`${ev(eventId)}/run-sheet/vendors/${key}/share`, { email })),
  revokeRunSheetShare: (eventId: string, key: string) => data<RunSheet>(api.delete(`${ev(eventId)}/run-sheet/vendors/${key}/share`)),
  addRunSheetItem: (eventId: string, body: RunSheetItemInput) => data<RunSheet>(api.post(`${ev(eventId)}/run-sheet/items`, body)),
  updateRunSheetItem: (eventId: string, itemId: string, body: RunSheetItemInput) =>
    data<RunSheet>(api.patch(`${ev(eventId)}/run-sheet/items/${itemId}`, body)),
  removeRunSheetItem: (eventId: string, itemId: string) => data<RunSheet>(api.delete(`${ev(eventId)}/run-sheet/items/${itemId}`)),
  async runSheetPdf(eventId: string): Promise<Blob> {
    return (await api.get(`${ev(eventId)}/run-sheet/pdf`, { responseType: "blob" })).data;
  },
  viewSharedRunSheet: (token: string) => data<SharedRunSheet>(api.get(`/run-sheets/shared/${token}`)),
  async sharedRunSheetPdf(token: string): Promise<Blob> {
    return (await api.get(`/run-sheets/shared/${token}/pdf`, { responseType: "blob" })).data;
  },

  // Gifts
  getGifts: (eventId: string, params?: { kind?: string; thankYou?: string }) =>
    data<{ gifts: Gift[]; summary: GiftSummary }>(api.get(`${ev(eventId)}/gifts`, { params })),
  addGift: (eventId: string, body: GiftInput) => data<{ gift: Gift }>(api.post(`${ev(eventId)}/gifts`, body)),
  updateGift: (eventId: string, giftId: string, body: GiftInput) => data<{ gift: Gift }>(api.patch(`${ev(eventId)}/gifts/${giftId}`, body)),
  deleteGift: (eventId: string, giftId: string) => api.delete(`${ev(eventId)}/gifts/${giftId}`),
  setThankYou: (eventId: string, giftIds: string[], sent = true, method?: ThankYouMethod) =>
    data<{ updated: number }>(api.post(`${ev(eventId)}/gifts/thank-you`, { giftIds, sent, method })),

  // Aso-ebi
  getAsoEbi: (eventId: string, params?: { fabric?: string; payment?: string; collection?: string; q?: string }) =>
    data<AsoEbiOverview>(api.get(`${ev(eventId)}/aso-ebi`, { params })),
  addFabric: (eventId: string, body: Partial<Pick<AsoEbiFabric, "name" | "description" | "color" | "unit" | "price">> & { stock?: number | "" }) =>
    data<{ fabric: AsoEbiFabric }>(api.post(`${ev(eventId)}/aso-ebi/fabrics`, body)),
  updateFabric: (eventId: string, fabricId: string, body: Partial<Pick<AsoEbiFabric, "name" | "description" | "color" | "unit" | "price" | "active">> & { stock?: number | "" | null }) =>
    data<{ fabric: AsoEbiFabric }>(api.patch(`${ev(eventId)}/aso-ebi/fabrics/${fabricId}`, body)),
  deleteFabric: (eventId: string, fabricId: string) => api.delete(`${ev(eventId)}/aso-ebi/fabrics/${fabricId}`),
  addOrder: (
    eventId: string,
    body: { fabric: string; name?: string; guest?: string; phone?: string; quantity: number; size?: string; measurements?: string; amountDue?: number | ""; amountPaid?: number | ""; paymentMethod?: string; notes?: string }
  ) => data<{ order: AsoEbiOrder }>(api.post(`${ev(eventId)}/aso-ebi/orders`, body)),
  updateOrder: (eventId: string, orderId: string, body: Partial<Pick<AsoEbiOrder, "fabric" | "name" | "phone" | "quantity" | "size" | "measurements" | "amountDue" | "notes" | "collectionStatus" | "collectedBy">>) =>
    data<{ order: AsoEbiOrder }>(api.patch(`${ev(eventId)}/aso-ebi/orders/${orderId}`, body)),
  deleteOrder: (eventId: string, orderId: string) => api.delete(`${ev(eventId)}/aso-ebi/orders/${orderId}`),
  recordPayment: (eventId: string, orderId: string, body: { amount: number; method?: string; note?: string }) =>
    data<{ order: AsoEbiOrder }>(api.post(`${ev(eventId)}/aso-ebi/orders/${orderId}/payments`, body)),
  removePayment: (eventId: string, orderId: string, paymentId: string) =>
    data<{ order: AsoEbiOrder }>(api.delete(`${ev(eventId)}/aso-ebi/orders/${orderId}/payments/${paymentId}`)),
  setCollection: (eventId: string, orderIds: string[], status: AsoEbiOrder["collectionStatus"], collectedBy?: string) =>
    data<{ updated: number }>(api.post(`${ev(eventId)}/aso-ebi/orders/collection`, { orderIds, status, collectedBy })),
  async asoEbiCsv(eventId: string): Promise<Blob> {
    return (await api.get(`${ev(eventId)}/aso-ebi/orders.csv`, { responseType: "blob" })).data;
  },

  // Curated shortlist (client)
  getShortlist: (eventId: string) => data<Shortlist>(api.get(`${ev(eventId)}/shortlist`)),
  submitBrief: (eventId: string, body: { categories: string[]; budget?: number; notes?: string }) =>
    data<Shortlist>(api.put(`${ev(eventId)}/shortlist/brief`, body)),
  setShortlistItem: (eventId: string, itemId: string, status: "new" | "interested" | "dismissed") =>
    data<Shortlist>(api.patch(`${ev(eventId)}/shortlist/items/${itemId}`, { status })),

  // Curated shortlist (admin)
  adminQueue: (params?: { status?: string; page?: number }) =>
    data<{ events: CurationQueueRow[]; total: number; page: number; totalPages: number; counts: Record<Shortlist["status"], number> }>(
      api.get("/admin/curation", { params })
    ),
  adminEvent: (eventId: string) => data<CurationEvent>(api.get(`/admin/curation/${eventId}`)),
  adminSearchVendors: (params: { q?: string; category?: string; city?: string }) =>
    data<{ vendors: ShortlistVendor[] }>(api.get("/admin/curation/vendors", { params })).then((d) => d.vendors),
  adminAdd: (eventId: string, vendorId: string, note?: string) => data<Shortlist>(api.post(`/admin/curation/${eventId}/items`, { vendorId, note })),
  adminNote: (eventId: string, itemId: string, note: string) => data<Shortlist>(api.patch(`/admin/curation/${eventId}/items/${itemId}`, { note })),
  adminRemove: (eventId: string, itemId: string) => data<Shortlist>(api.delete(`/admin/curation/${eventId}/items/${itemId}`)),
  adminReady: (eventId: string) => data<Shortlist>(api.post(`/admin/curation/${eventId}/ready`)),
};

export default celebrationPlusService;
