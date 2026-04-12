"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, Download, Copy, Check } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Quote {
  id: string;
  clientName: string;
  clientEmail: string;
  eventType: string;
  eventDate?: Date;
  lineItems: LineItem[];
  notes?: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  createdAt: Date;
  sentAt?: Date;
}

export default function QuoteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      try {
        const { default: quoteService } = await import(
          "@/services/quote.service"
        );
        const quoteData = await quoteService.getById(params.id as string);

        // Transform backend data to match component interface
        const transformedQuote: Quote = {
          id: quoteData._id,
          clientName: quoteData.customer?.name || "N/A",
          clientEmail: quoteData.customer?.email || "N/A",
          eventType: "Event", // lead is just an ID, not an object
          eventDate: undefined, // lead details not available directly
          lineItems: (quoteData.items || []).map((item: any) => ({
            id: item._id,
            description: item.description,
            quantity: item.quantity,
            rate: item.unitPrice,
            amount: item.total,
          })),
          notes: quoteData.notes || "",
          status:
            quoteData.status === "viewed" || quoteData.status === "expired"
              ? "sent"
              : (quoteData.status as
                  | "draft"
                  | "sent"
                  | "accepted"
                  | "rejected"),
          createdAt: new Date(quoteData.createdAt),
          sentAt: quoteData.sentAt ? new Date(quoteData.sentAt) : undefined,
        };

        setQuote(transformedQuote);
      } catch (error: any) {
        console.error("Error fetching quote:", error);
        toast.error(error.response?.data?.message || "Failed to load quote");
        router.push("/vendor/dashboard/quotes");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchQuote();
    }
  }, [params.id, router]);

  const calculateSubtotal = () => {
    if (!quote) return 0;
    return quote.lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.075; // 7.5% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSendQuote = async () => {
    if (!quote) return;

    setSending(true);
    try {
      const { default: quoteService } = await import(
        "@/services/quote.service"
      );
      const updatedQuote = await quoteService.send(quote.id);

      setQuote({
        ...quote,
        status: "sent",
        sentAt: updatedQuote.sentAt
          ? new Date(updatedQuote.sentAt)
          : new Date(),
      });
      toast.success("Quote sent successfully!");
    } catch (error: any) {
      console.error("Error sending quote:", error);
      toast.error(error.response?.data?.message || "Failed to send quote");
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/quotes/${quote?.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: Quote["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusLabel = (status: Quote["status"]) => {
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

  if (!quote) return null;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/vendor/dashboard/quotes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotes</span>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quote #{quote.id}
            </h1>
            <p className="text-gray-600 mt-1">{quote.clientName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                quote.status
              )}`}
            >
              {getStatusLabel(quote.status)}
            </span>
            {quote.status === "draft" && (
              <button
                onClick={handleSendQuote}
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
            )}
          </div>
        </div>
      </div>

      {/* Quote Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        {/* Header */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">QUOTE</h2>
              <p className="text-gray-600">Quote #{quote.id}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {user?.username || "Your Business"}
              </p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Client & Event Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              BILL TO:
            </h3>
            <p className="text-gray-700">{quote.clientName}</p>
            <p className="text-sm text-gray-600">{quote.clientEmail}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              EVENT DETAILS:
            </h3>
            <p className="text-gray-700">{quote.eventType}</p>
            {quote.eventDate && (
              <p className="text-sm text-gray-600">
                {quote.eventDate.toLocaleDateString()}
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
              {quote.lineItems.map((item) => (
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
        {quote.notes && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">NOTES:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {quote.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Created {quote.createdAt.toLocaleDateString()}</p>
          {quote.sentAt && <p>Sent {quote.sentAt.toLocaleDateString()}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  );
}
