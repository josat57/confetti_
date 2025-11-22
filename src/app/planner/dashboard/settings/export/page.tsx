"use client";

import React, { useState } from "react";
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import settingsService from "@/services/planner/settings.service";

const DataExportPage: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const dataCategories = [
    {
      name: "Events",
      description:
        "All your event data including details, timelines, and milestones",
      icon: DocumentTextIcon,
    },
    {
      name: "Clients",
      description:
        "Client information, contact details, and communication history",
      icon: DocumentTextIcon,
    },
    {
      name: "Vendors",
      description: "Vendor bookings, ratings, and performance data",
      icon: DocumentTextIcon,
    },
    {
      name: "Tasks",
      description: "All tasks, assignments, and completion status",
      icon: DocumentTextIcon,
    },
    {
      name: "Budget & Expenses",
      description: "Financial data, budgets, expenses, and payment records",
      icon: DocumentTextIcon,
    },
    {
      name: "Guests",
      description: "Guest lists, RSVP status, and seating arrangements",
      icon: DocumentTextIcon,
    },
    {
      name: "Documents",
      description: "All uploaded documents and files",
      icon: DocumentTextIcon,
    },
    {
      name: "Messages",
      description: "Conversation history and messages",
      icon: DocumentTextIcon,
    },
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const blob = await settingsService.exportData();

      clearInterval(progressInterval);
      setProgress(100);

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `confetti-data-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Data exported successfully");

      setTimeout(() => {
        setProgress(0);
        setExporting(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("Failed to export data");
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Export Your Data
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Download a complete copy of all your data
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              What's included?
            </h3>
            <p className="text-sm text-blue-700">
              Your export will include all data associated with your account in
              JSON format. This includes events, clients, vendors, tasks,
              budgets, guests, documents, and messages.
            </p>
          </div>

          {/* Data Categories */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Data Categories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataCategories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-start p-4 border border-gray-200 rounded-lg"
                >
                  <category.icon className="h-6 w-6 text-teal-600 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Progress */}
          {exporting && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Exporting Data...
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-teal-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                {progress}% complete
              </p>
            </div>
          )}

          {/* Export Button */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center justify-center px-6 py-3 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              {exporting ? "Exporting..." : "Export All Data"}
            </button>
            <p className="text-sm text-gray-500 mt-3 text-center">
              The export may take a few minutes depending on the amount of data.
            </p>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  The export file will be in JSON format, which can be opened
                  with any text editor.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  File attachments and images will be included as URLs pointing
                  to their storage locations.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  This export is for your personal records and backup purposes.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  You can request an export at any time without affecting your
                  account.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  For data portability to other platforms, please contact
                  support for assistance.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExportPage;
