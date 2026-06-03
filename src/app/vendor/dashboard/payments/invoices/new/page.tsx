"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Plus, X, Save, Send } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { invoicesService } from "@/services/invoices.service";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  useAuth();
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    dueDate: "",
    notes: "",
    paymentMethod: "flutterwave" as
      | "flutterwave"
      | "paystack"
      | "bank_transfer",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    },
  ]);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) {
      toast.error("Invoice must have at least one line item");
      return;
    }
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (
    id: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          updated.amount = updated.quantity * updated.rate;
          return updated;
        }
        return item;
      })
    );
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.075;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSave = async (sendToClient: boolean) => {
    // Validation
    if (!formData.clientName.trim()) {
      toast.error("Please enter client name");
      return;
    }
    if (!formData.clientEmail.trim()) {
      toast.error("Please enter client email");
      return;
    }
    if (!formData.dueDate) {
      toast.error("Please select due date");
      return;
    }
    if (lineItems.some((item) => !item.description.trim())) {
      toast.error("Please fill in all line item descriptions");
      return;
    }

    const action = sendToClient ? setSending : setSaving;
    action(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      const invoice = await invoicesService.create({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        issueDate: today,
        dueDate: formData.dueDate,
        items: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.rate,
        })),
        notes: formData.notes || undefined,
      });

      if (sendToClient) {
        await invoicesService.send(invoice._id);
      }

      toast.success(
        sendToClient ? "Invoice sent successfully!" : "Invoice saved as draft"
      );
      router.push("/vendor/dashboard/payments");
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    } finally {
      action(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
        <p className="text-gray-600 mt-1">
          Generate an invoice for your client
        </p>
      </div>

      <div className="space-y-6">
        {/* Client Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Client Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Email *
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) =>
                  setFormData({ ...formData, clientEmail: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target
                      .value as typeof formData.paymentMethod,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="flutterwave">Flutterwave</option>
                <option value="paystack">Paystack</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <button
              onClick={addLineItem}
              className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {lineItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-3 items-start p-4 bg-gray-50 rounded-lg"
              >
                <div className="col-span-12 md:col-span-5">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(item.id, "description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="Service description"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(
                        item.id,
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Rate (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(e) =>
                      updateLineItem(
                        item.id,
                        "rate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-900">
                    ₦{item.amount.toLocaleString()}
                  </div>
                </div>
                <div className="col-span-1 flex items-end">
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="max-w-sm ml-auto space-y-2">
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
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Notes
          </h2>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Payment terms, bank details, or other information..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/vendor/dashboard/payments"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={() => handleSave(false)}
            disabled={saving || sending}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Draft</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || sending}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Invoice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
