import React from 'react';
import '../styles/search-page.css';
import '../styles/news-page.css';
// import './button-wave.css';

/**
 * Reusable Button component for consistent styling across the app.
 *
 * Props:
 * - variant: 'search' | 'filter' | 'indicator' | 'afterhours' (default: 'search')
 * - active: boolean (for active state, e.g., filter/indicator buttons)
 * - disabled: boolean
 * - style: object (inline style overrides)
 * - className: string (additional classes)
 * - wave: boolean (whether to apply button-wave class)
 * - ...rest: other button props (onClick, type, etc.)
 */
const Button = ({
  children,
  variant = 'search',
  active = false,
  disabled = false,
  style = {},
  className = '',
  wave = true,
  ...rest
}) => {
  let baseClass = '';
  switch (variant) {
    case 'search':
      baseClass = 'search-button';
      break;
    case 'filter':
      baseClass = 'filter-button';
      break;
    case 'afterhours':
      baseClass = 'after-hours-button';
      break;
    case 'indicator':
      baseClass = 'indicator-btn';
      break;
    default:
      baseClass = 'search-button';
  }

  // Compose className
  let classes = baseClass;
  if (wave) classes += ' button-wave';
  if (active) classes += ' active';
  if (className) classes += ' ' + className;

  // Inline style for indicator variant (since it's not in CSS)
  const indicatorStyle =
    variant === 'indicator'
      ? {
          padding: '6px 18px',
          borderRadius: 6,
          border: '1px solid #aaa',
          background: active ? '#1976d2' : '#f4f4f4',
          color: active ? '#fff' : '#222',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s',
          ...style,
        }
      : style;

  return (
    <button
      className={classes}
      disabled={disabled}
      style={indicatorStyle}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button; 