import React from 'react';
import './FormField.css';

function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  helpText,
  as = 'input',
  options,
  rows = 3,
  disabled = false,
  className = '',
  ...props
}) {
  const id = `field-${name}`;
  const hasError = !!error;

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const inputProps = {
    id,
    name,
    value,
    onChange: handleChange,
    placeholder,
    required,
    disabled,
    className: `form-field__input ${hasError ? 'form-field__input--error' : ''}`,
    'aria-invalid': hasError || undefined,
    'aria-describedby': hasError ? `${id}-error` : helpText ? `${id}-help` : undefined,
    ...props,
  };

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={id} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea {...inputProps} rows={rows} />
      ) : as === 'select' ? (
        <select {...inputProps}>
          {options &&
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      ) : (
        <input {...inputProps} type={type} />
      )}
      {hasError && (
        <p id={`${id}-error`} className="form-field__error" role="alert">
          {error}
        </p>
      )}
      {helpText && !hasError && (
        <p id={`${id}-help`} className="form-field__help">
          {helpText}
        </p>
      )}
    </div>
  );
}

export default FormField;
