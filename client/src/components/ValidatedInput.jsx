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
  const inputClasses = `search-input ${error ? 'input-error' : ''} ${className}`;
  const containerClasses = `input-container ${containerClassName}`;

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
        <span className="error-message">{error}</span>
      )}
    </div>
  );
};

export default ValidatedInput; 