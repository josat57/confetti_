import { useState, useCallback } from "react";
import { FormErrors } from "@/types/ai-planner";

interface UseFormValidationReturn {
  errors: FormErrors;
  setErrors: (errors: FormErrors) => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  hasError: (field: string) => boolean;
  getError: (field: string) => string | undefined;
  validateField: <T>(
    field: string,
    value: T,
    validator: (value: T) => string | null | FormErrors
  ) => boolean;
}

export const useFormValidation = (): UseFormValidationReturn => {
  const [errors, setErrors] = useState<FormErrors>({});

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasError = useCallback(
    (field: string): boolean => {
      return field in errors;
    },
    [errors]
  );

  const getError = useCallback(
    (field: string): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  const validateField = useCallback(
    <T>(
      field: string,
      value: T,
      validator: (value: T) => string | null | FormErrors
    ): boolean => {
      const result = validator(value);

      if (result === null) {
        clearError(field);
        return true;
      }

      if (typeof result === "string") {
        setError(field, result);
        return false;
      }

      // If result is FormErrors object
      const errorKeys = Object.keys(result);
      if (errorKeys.length === 0) {
        clearError(field);
        return true;
      }

      // Set all errors from the result
      setErrors((prev) => ({ ...prev, ...result }));
      return false;
    },
    [setError, clearError]
  );

  return {
    errors,
    setErrors,
    setError,
    clearError,
    clearAllErrors,
    hasError,
    getError,
    validateField,
  };
};
