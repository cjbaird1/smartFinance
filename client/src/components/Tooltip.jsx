import React, { useState } from 'react';

const tooltipStyle = {
  position: 'absolute',
  zIndex: 9999,
  background: '#222',
  color: '#fff',
  padding: '7px 14px',
  borderRadius: 8,
  fontSize: 14,
  boxShadow: '0 4px 16px rgba(44,62,80,0.18)',
  whiteSpace: 'nowrap',
  opacity: 0.97,
  transition: 'opacity 0.15s',
  pointerEvents: 'none',
};

export default function Tooltip({ children, content, placement = 'top' }) {
  const [visible, setVisible] = useState(false);

  let tooltipPosition = {};
  if (placement === 'top') {
    tooltipPosition = {
      left: '50%',
      bottom: '120%',
      transform: 'translateX(-50%)',
    };
  } else if (placement === 'bottom') {
    tooltipPosition = {
      left: '50%',
      top: '120%',
      transform: 'translateX(-50%)',
    };
  } // Add left/right if needed

  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
    >
      {children}
      {visible && (
        <span
          style={{ ...tooltipStyle, ...tooltipPosition }}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
} 