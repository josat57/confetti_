"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { ImportResult } from "@/types/guest";

interface GuestImportProps {
  onImport: (file: File) => Promise<ImportResult>;
  onClose: () => void;
}

export default function GuestImport({ onImport, onClose }: GuestImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (
        validTypes.includes(selectedFile.type) ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
        setResult(null);
      } else {
        alert("Please select a valid CSV or Excel file");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (
        validTypes.includes(droppedFile.type) ||
        droppedFile.name.endsWith(".csv")
      ) {
        setFile(droppedFile);
        setResult(null);
      } else {
        alert("Please select a valid CSV or Excel file");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const importResult = await onImport(file);
      setResult(importResult);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import guests. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,email,phone,category,plusOneAllowed,dietaryRestrictions,specialRequirements
John Doe,john@example.com,+234 800 000 0000,VIP,true,Vegetarian,Wheelchair access
Jane Smith,jane@example.com,+234 800 000 0001,Family,false,None,None`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guest_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Import Guests</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Import Instructions
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Download the template CSV file below</li>
              <li>Fill in your guest information</li>
              <li>Upload the completed file</li>
              <li>Review any errors and fix them in your file</li>
            </ul>
          </div>

          {/* Download Template */}
          <div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-5 h-5" />
              Download Template CSV
            </button>
          </div>

          {/* File Upload */}
          {!result && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Guest List
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-teal-600">
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports CSV and Excel files
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Result */}
          {result && (
            <div className="space-y-4">
              <div
                className={`border rounded-lg p-4 ${
                  result.errors.length === 0
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.errors.length === 0 ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3
                      className={`font-medium mb-1 ${
                        result.errors.length === 0
                          ? "text-green-900"
                          : "text-yellow-900"
                      }`}
                    >
                      {result.errors.length === 0
                        ? "Import Successful!"
                        : "Import Completed with Errors"}
                    </h3>
                    <p
                      className={`text-sm ${
                        result.errors.length === 0
                          ? "text-green-800"
                          : "text-yellow-800"
                      }`}
                    >
                      Successfully imported {result.imported} guest(s)
                      {result.errors.length > 0 &&
                        ` with ${result.errors.length} error(s)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {result.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-medium text-red-900 mb-3">
                    Errors ({result.errors.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-800 bg-white p-2 rounded border border-red-200"
                      >
                        <span className="font-medium">Row {error.row}:</span>{" "}
                        {error.error}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-red-700 mt-3">
                    Please fix these errors in your file and try importing
                    again.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {result ? (
              <>
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Import Another File
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={importing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || importing}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? "Importing..." : "Import Guests"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
