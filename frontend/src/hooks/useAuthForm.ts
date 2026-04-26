import { useState, useCallback } from 'react';
import type { ValidationError } from '@/types/auth';

type FormErrors<T> = Partial<Record<keyof T, string>>;

export const useAuthForm = <T extends Record<string, unknown>>(initialValues: T) => {
  const [formValues, setFormValues] = useState<T>(initialValues);
  const [formErrors, setFormErrors] = useState<FormErrors<T>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormValues((previous) => ({
        ...previous,
        [name]: value,
      }));
      if (formErrors[name as keyof T]) {
        setFormErrors((previous) => ({
          ...previous,
          [name]: undefined,
        }));
      }
    },
    [formErrors]
  );

  const setErrors = useCallback((validationErrors: ValidationError[]) => {
    const errorMap: FormErrors<T> = {};
    validationErrors.forEach((error) => {
      errorMap[error.field as keyof T] = error.message;
    });
    setFormErrors(errorMap);
  }, []);

  const resetForm = useCallback(() => {
    setFormValues(initialValues);
    setFormErrors({});
  }, [initialValues]);

  return {
    formValues,
    formErrors,
    isLoading,
    setIsLoading,
    handleChange,
    setErrors,
    resetForm,
  };
};
