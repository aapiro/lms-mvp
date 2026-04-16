import { useState, useCallback } from 'react';

/**
 * Hook for form state with validation.
 *
 * Usage:
 *   const { values, errors, handleChange, handleSubmit, reset, setValues } = useForm({
 *     initialValues: { title: '', price: 0 },
 *     validate: (values) => ({ title: !values.title ? 'Required' : '' }),
 *     onSubmit: async (values) => { await api.post('/courses', values); }
 *   });
 */
export default function useForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error on change
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      // Validate
      if (validate) {
        const validationErrors = validate(values);
        const hasErrors = Object.values(validationErrors).some(Boolean);
        setErrors(validationErrors);
        if (hasErrors) return false;
      }

      setSubmitting(true);
      try {
        await onSubmit(values);
        return true;
      } catch (err) {
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const reset = useCallback(
    (newValues) => {
      setValues(newValues || initialValues);
      setErrors({});
    },
    [initialValues]
  );

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors,
    submitting,
  };
}
