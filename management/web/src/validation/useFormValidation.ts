import { useState, useCallback } from 'react';
import type { z } from 'zod';

interface UseFormValidationResult<T> {
      errors: Record<string, string>;
      validate: (data: unknown) => { success: true; data: T } | { success: false };
      validateField: (field: string, value: unknown, fullData?: unknown) => boolean;
      clearErrors: () => void;
      clearFieldError: (field: string) => void;
      setFieldError: (field: string, message: string) => void;
      hasErrors: boolean;
}

/**
 * Zod şeması ile form validasyonu için custom hook
 *
 * @example
 * const { errors, validate, validateField, clearErrors } = useFormValidation(ExpenseFormSchema);
 *
 * // Form submit
 * const handleSubmit = () => {
 *   const result = validate(formData);
 *   if (result.success) {
 *     // Submit validated data
 *   }
 * };
 *
 * // Field blur
 * const handleBlur = (field: string, value: unknown) => {
 *   validateField(field, value, formData);
 * };
 */
export function useFormValidation<T>(
      schema: z.ZodSchema<T>
): UseFormValidationResult<T> {
      const [errors, setErrors] = useState<Record<string, string>>({});

      const validate = useCallback((data: unknown) => {
            const result = schema.safeParse(data);

            if (result.success) {
                  setErrors({});
                  return { success: true as const, data: result.data };
            }

            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                  const path = issue.path.join('.');
                  if (!newErrors[path]) {
                        newErrors[path] = issue.message;
                  }
            });

            setErrors(newErrors);
            return { success: false as const };
      }, [schema]);

      const validateField = useCallback((
            field: string,
            value: unknown,
            fullData?: unknown
      ): boolean => {
            // Eğer fullData verilmişse, o veri üzerinde validate et
            const dataToValidate = fullData || { [field]: value };
            const result = schema.safeParse(dataToValidate);

            if (result.success) {
                  // Bu alan için hata varsa temizle
                  setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors[field];
                        return newErrors;
                  });
                  return true;
            }

            // Sadece bu alanla ilgili hatayı bul
            const fieldError = result.error.issues.find(
                  (issue) => issue.path.join('.') === field
            );

            if (fieldError) {
                  setErrors((prev) => ({
                        ...prev,
                        [field]: fieldError.message,
                  }));
                  return false;
            }

            // Bu alan için hata yoksa, temizle
            setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors[field];
                  return newErrors;
            });
            return true;
      }, [schema]);

      const clearErrors = useCallback(() => {
            setErrors({});
      }, []);

      const clearFieldError = useCallback((field: string) => {
            setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors[field];
                  return newErrors;
            });
      }, []);

      const setFieldError = useCallback((field: string, message: string) => {
            setErrors((prev) => ({
                  ...prev,
                  [field]: message,
            }));
      }, []);

      return {
            errors,
            validate,
            validateField,
            clearErrors,
            clearFieldError,
            setFieldError,
            hasErrors: Object.keys(errors).length > 0,
      };
}

/**
 * TextField için helper props oluşturur
 */
export function getTextFieldProps(
      errors: Record<string, string>,
      field: string
): { error: boolean; helperText: string | undefined } {
      return {
            error: Boolean(errors[field]),
            helperText: errors[field],
      };
}
