"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, Download, Check, CreditCard } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { invoicesService } from "@/services/invoices.service";
import type { Invoice as ApiInvoice } from "@/types/invoice.types";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  lineItems: LineItem[];
  notes?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paymentMethod: "flutterwave" | "paystack" | "bank_transfer";
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  function mapApiInvoice(api: ApiInvoice): Invoice {
    const statusMap: Record<string, Invoice["status"]> = {
      draft: "pending",
      sent: "pending",
      viewed: "pending",
      paid: "paid",
      partially_paid: "paid",
      overdue: "overdue",
      cancelled: "cancelled",
    };
    return {
      id: api._id,
      invoiceNumber: api.invoiceNumber,
      clientName: api.client.name,
      clientEmail: api.client.email,
      lineItems: api.items.map((item) => ({
        id: item._id || Math.random().toString(36).slice(2),
        description: item.description,
        quantity: item.quantity,
        rate: item.unitPrice,
        amount: item.amount,
      })),
      notes: api.notes,
      status: statusMap[api.status] ?? "pending",
      paymentMethod: "bank_transfer",
      dueDate: new Date(api.dueDate),
      paidAt: api.paidAt ? new Date(api.paidAt) : undefined,
      createdAt: new Date(api.createdAt),
    };
  }

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const apiInvoice = await invoicesService.getById(params.id as string);
        setInvoice(mapApiInvoice(apiInvoice));
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast.error("Failed to load invoice");
        router.push("/vendor/dashboard/payments");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id, router]);

  const calculateSubtotal = () => {
    if (!invoice) return 0;
    return invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.075;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;

    setSending(true);
    try {
      await invoicesService.send(invoice.id);
      toast.success("Invoice sent successfully!");
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error("Failed to send invoice");
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;

    try {
      await invoicesService.markAsPaid(invoice.id);
      setInvoice({ ...invoice, status: "paid", paidAt: new Date() });
      toast.success("Invoice marked as paid");
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    }
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Invoice["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/vendor/dashboard/payments"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payments</span>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-gray-600 mt-1">{invoice.clientName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                invoice.status
              )}`}
            >
              {getStatusLabel(invoice.status)}
            </span>
            {invoice.status === "pending" && (
              <>
                <button
                  onClick={handleSendInvoice}
                  disabled={sending}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleMarkAsPaid}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark as Paid</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        {/* Header */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
              <p className="text-gray-600">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {user?.username || "Your Business"}
              </p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Client & Payment Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              BILL TO:
            </h3>
            <p className="text-gray-700">{invoice.clientName}</p>
            <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              PAYMENT INFO:
            </h3>
            <p className="text-gray-700 capitalize">
              {invoice.paymentMethod.replace("_", " ")}
            </p>
            <p className="text-sm text-gray-600">
              Due: {invoice.dueDate.toLocaleDateString()}
            </p>
            {invoice.paidAt && (
              <p className="text-sm text-green-600">
                Paid: {invoice.paidAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-semibold text-gray-900">
                  DESCRIPTION
                </th>
                <th className="text-center py-3 text-sm font-semibold text-gray-900">
                  QTY
                </th>
                <th className="text-right py-3 text-sm font-semibold text-gray-900">
                  RATE
                </th>
                <th className="text-right py-3 text-sm font-semibold text-gray-900">
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 text-gray-700">{item.description}</td>
                  <td className="py-4 text-center text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="py-4 text-right text-gray-700">
                    ₦{item.rate.toLocaleString()}
                  </td>
                  <td className="py-4 text-right font-medium text-gray-900">
                    ₦{item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">
                ₦{calculateSubtotal().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (7.5%):</span>
              <span className="font-medium text-gray-900">
                ₦{calculateTax().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total:</span>
              <span className="text-purple-600">
                ₦{calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">NOTES:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Invoice created {invoice.createdAt.toLocaleDateString()}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
        {invoice.status === "pending" && (
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
            <CreditCard className="w-4 h-4" />
            <span>Process Payment</span>
          </button>
        )}
      </div>
    </div>
  );
}
