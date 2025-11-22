"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateQuote, useQuoteTemplates } from "@/hooks/useQuotes";
import type { QuoteCreate, QuoteItem } from "@/types/quote.types";

export default function NewQuotePage() {
  const router = useRouter();
  const createQuote = useCreateQuote();
  const { data: templates } = useQuoteTemplates();

  const [formData, setFormData] = useState<QuoteCreate>({
    customer: {
      name: "",
      email: "",
      phone: "",
    },
    items: [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ],
    tax: 0,
    discount: 0,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    terms: "",
    notes: "",
  });

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + (formData.tax || 0) - (formData.discount || 0);
  };

  const handleCustomerChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
      },
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof QuoteItem,
    value: string | number
  ) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };

      // Recalculate total for this item
      if (field === "quantity" || field === "unitPrice") {
        newItems[index].total = calculateItemTotal(
          newItems[index].quantity,
          newItems[index].unitPrice
        );
      }

      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return; // Keep at least one item
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const loadTemplate = (templateId: string) => {
    const template = templates?.find((t) => t._id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        items: template.items,
        terms: template.terms || prev.terms,
        notes: template.notes || prev.notes,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createQuote.mutateAsync(formData);
      router.push("/dashboard/quotes");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Quotes
        </button>
        <h1 className="text-3xl font-bold">Create New Quote</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection */}
        {templates && templates.length > 0 && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Use Template</h2>
            <select
              onChange={(e) => e.target.value && loadTemplate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select a template...</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Customer Information */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customer.name}
                onChange={(e) => handleCustomerChange("name", e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.customer.email}
                onChange={(e) => handleCustomerChange("email", e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.customer.phone}
                onChange={(e) => handleCustomerChange("phone", e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Quote Items */}
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quote Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">Item {index + 1}</h3>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Unit Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-600">Total: </span>
                  <span className="font-semibold">
                    ${item.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t pt-4">
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  ${calculateSubtotal().toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <label>Tax:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tax: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-32 px-3 py-1 border rounded text-right"
                />
              </div>

              <div className="flex justify-between items-center">
                <label>Discount:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-32 px-3 py-1 border rounded text-right"
                />
              </div>

              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-blue-600">
                  ${calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Valid Until <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={
                  formData.validUntil instanceof Date
                    ? formData.validUntil.toISOString().split("T")[0]
                    : formData.validUntil
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    validUntil: new Date(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Terms & Conditions
              </label>
              <textarea
                value={formData.terms}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, terms: e.target.value }))
                }
                rows={4}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter terms and conditions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border rounded"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createQuote.isPending}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createQuote.isPending ? "Creating..." : "Create Quote"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
