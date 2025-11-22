"use client";

import React, { useState } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { generateA11yId } from "@/utils/accessibility";

interface FormFieldProps {
  label: string;
  name: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "url"
    | "number"
    | "date"
    | "textarea"
    | "select";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  autoComplete?: string;
}

export const AccessibleFormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder,
  helpText,
  options,
  disabled = false,
  autoComplete,
}) => {
  const [fieldId] = useState(() => generateA11yId(name));
  const [errorId] = useState(() => generateA11yId(`${name}-error`));
  const [helpId] = useState(() => generateA11yId(`${name}-help`));

  const commonProps = {
    id: fieldId,
    name,
    value,
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => onChange(e.target.value),
    disabled,
    required,
    "aria-required": required,
    "aria-invalid": !!error,
    "aria-describedby":
      [error && errorId, helpText && helpId].filter(Boolean).join(" ") ||
      undefined,
    autoComplete,
    className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
      error ? "border-red-500" : "border-gray-300"
    }`,
  };

  const renderInput = () => {
    if (type === "textarea") {
      return <textarea {...commonProps} placeholder={placeholder} rows={4} />;
    }

    if (type === "select" && options) {
      return (
        <select {...commonProps}>
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return <input {...commonProps} type={type} placeholder={placeholder} />;
  };

  return (
    <div className="space-y-1">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {renderInput()}

      {helpText && (
        <p id={helpId} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}

      {error && (
        <div
          id={errorId}
          className="flex items-center text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

interface AccessibleFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  onSubmit,
  children,
  title,
  description,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  isSubmitting = false,
  className = "",
}) => {
  const [formId] = useState(() => generateA11yId("form"));

  return (
    <form id={formId} onSubmit={onSubmit} className={className} noValidate>
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      )}

      {description && (
        <p className="text-sm text-gray-600 mb-6">{description}</p>
      )}

      <div className="space-y-4">{children}</div>

      <div className="flex justify-end space-x-3 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
