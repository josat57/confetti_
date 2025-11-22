"use client";

import { useState } from "react";
import { Download, Loader2, FileText, CheckCircle } from "lucide-react";
import { settingsService } from "@/services/planner/settings.service";

export default function DataExport() {
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportComplete(false);

      // Request export
      const { exportId } = await settingsService.requestDataExport();

      // Poll for completion (in production, use websockets or webhooks)
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = 2000;

      const checkStatus = async (): Promise<void> => {
        if (attempts >= maxAttempts) {
          throw new Error("Export timeout");
        }

        const status = await settingsService.getDataExport(exportId);

        if (status.status === "completed" && status.downloadUrl) {
          setDownloadUrl(status.downloadUrl);
          setExportComplete(true);
        } else if (status.status === "failed") {
          throw new Error("Export failed");
        } else {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
          await checkStatus();
        }
      };

      await checkStatus();
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Export Your Data
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Download a complete copy of all your data
        </p>
      </div>

      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                What's included in your export?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• All events and event details</li>
                <li>• Client information and contacts</li>
                <li>• Vendor bookings and communications</li>
                <li>• Tasks and checklists</li>
                <li>• Budget and financial data</li>
                <li>• Documents and attachments (links only)</li>
                <li>• Team member information</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Export Format
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Your data will be exported as a JSON file that you can import into
            other systems or keep for your records.
          </p>
          <p className="text-sm text-gray-600">
            The export process may take a few minutes depending on the amount of
            data you have.
          </p>
        </div>

        {exportComplete && downloadUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900">
                  Export Complete!
                </h3>
                <p className="text-sm text-green-800 mt-1">
                  Your data export is ready to download.
                </p>
              </div>
              <a
                href={downloadUrl}
                download="my-data-export.json"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exporting Your Data...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export All Data
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          This export complies with GDPR data portability requirements
        </p>
      </div>
    </div>
  );
}
