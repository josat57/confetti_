"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuoteById, useSendQuote } from "@/hooks/useQuotes";

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const { data: quote, isLoading, error } = useQuoteById(quoteId);
  const sendQuote = useSendQuote();

  const handleSendQuote = async () => {
    if (confirm("Are you sure you want to send this quote to the customer?")) {
      await sendQuote.mutateAsync(quoteId);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      viewed: "bg-purple-100 text-purple-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      expired: "bg-orange-100 text-orange-800",
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading quote details...</div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          Error loading quote details. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Quotes
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Quote #{quote.quoteNumber}</h1>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded text-sm font-semibold ${getStatusColor(
                quote.status
              )}`}
            >
              {quote.status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">
              ${quote.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Amount</p>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-semibold">{quote.customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{quote.customer.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-semibold">{quote.customer.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valid Until</p>
            <p className="font-semibold">
              {new Date(quote.validUntil).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quote Items */}
      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Quote Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quote.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    ${item.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ${item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                  Subtotal
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  ${quote.subtotal.toLocaleString()}
                </td>
              </tr>
              {quote.tax > 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right">
                    Tax
                  </td>
                  <td className="px-4 py-3 text-right">
                    ${quote.tax.toLocaleString()}
                  </td>
                </tr>
              )}
              {quote.discount > 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-red-600">
                    Discount
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    -${quote.discount.toLocaleString()}
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-right text-lg font-bold"
                >
                  Total
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">
                  ${quote.total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Terms and Notes */}
      {(quote.terms || quote.notes) && (
        <div className="border rounded-lg p-6 mb-6">
          {quote.terms && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {quote.terms}
              </p>
            </div>
          )}
          {quote.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {quote.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quote Timeline */}
      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Quote Timeline</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div>
              <p className="font-semibold">Created</p>
              <p className="text-sm text-gray-600">
                {new Date(quote.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          {quote.sentAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div>
                <p className="font-semibold">Sent</p>
                <p className="text-sm text-gray-600">
                  {new Date(quote.sentAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          {quote.viewedAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <div>
                <p className="font-semibold">Viewed by Customer</p>
                <p className="text-sm text-gray-600">
                  {new Date(quote.viewedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          {quote.respondedAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <div>
                <p className="font-semibold">Customer Responded</p>
                <p className="text-sm text-gray-600">
                  {new Date(quote.respondedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {quote.status === "draft" && (
          <>
            <button
              onClick={handleSendQuote}
              disabled={sendQuote.isPending}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {sendQuote.isPending ? "Sending..." : "Send Quote"}
            </button>
            <button
              onClick={() => router.push(`/dashboard/quotes/${quoteId}/edit`)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Quote
            </button>
          </>
        )}
        <button
          onClick={() => window.print()}
          className="px-6 py-3 border rounded hover:bg-gray-50"
        >
          Print / Download PDF
        </button>
      </div>
    </div>
  );
}
