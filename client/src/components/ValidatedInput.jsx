import React from 'react';

const ValidatedInput = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const inputClasses = `search-input px-4 py-2 text-base border rounded-lg w-60 bg-bg-main text-text-main border-border focus:outline-none focus:ring-2 focus:ring-accent ${error ? 'border-error' : ''} ${className}`;
  const containerClasses = `input-container flex flex-col flex-shrink-0 ${containerClassName}`;

  return (
    <div className={containerClasses}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
        {...props}
      />
      {error && (
        <span className="error-message text-error text-sm mt-1">{error}</span>
      )}
    </div>
  );
};

export default ValidatedInput; 