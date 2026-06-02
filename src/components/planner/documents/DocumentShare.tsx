"use client";

import { useState } from "react";
import { X, Share2, Plus, Trash2 } from "lucide-react";
import { Document } from "@/services/planner/documents.service";

interface DocumentShareProps {
  document: Document;
  onShare: (emails: string[], message?: string) => void;
  onClose: () => void;
  loading: boolean;
}

export default function DocumentShare({
  document,
  onShare,
  onClose,
  loading,
}: DocumentShareProps) {
  const [emails, setEmails] = useState<string[]>([""]);
  const [message, setMessage] = useState("");

  const addEmail = () => setEmails([...emails, ""]);
  const removeEmail = (i: number) => setEmails(emails.filter((_, idx) => idx !== i));
  const updateEmail = (i: number, val: string) =>
    setEmails(emails.map((e, idx) => (idx === i ? val : e)));

  const handleSubmit = () => {
    const valid = emails.map((e) => e.trim()).filter(Boolean);
    if (!valid.length) {
      alert("Please enter at least one email address");
      return;
    }
    onShare(valid, message.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Share Document</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Sharing: <span className="font-medium text-gray-900 dark:text-gray-100">{document.name}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email addresses
            </label>
            <div className="space-y-2">
              {emails.map((email, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(i, e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {emails.length > 1 && (
                    <button
                      onClick={() => removeEmail(i)}
                      className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addEmail}
              className="mt-2 flex items-center gap-1 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
            >
              <Plus className="w-4 h-4" />
              Add another email
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note for the recipients..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
