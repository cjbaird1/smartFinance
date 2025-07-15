import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const tooltipBaseStyle = {
  position: 'fixed',
  zIndex: 9999,
  background: '#222',
  color: '#fff',
  padding: '7px 14px',
  borderRadius: 8,
  fontSize: 14,
  boxShadow: '0 4px 16px rgba(44,62,80,0.18)',
  opacity: 0.97,
  transition: 'opacity 0.15s',
  pointerEvents: 'none',
  maxWidth: 260,
  wordBreak: 'break-word',
};

export default function Tooltip({ children, content, placement = 'top' }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = 0, left = 0;
      if (placement === 'top') {
        top = rect.top - 8; // 8px gap
        left = rect.left + rect.width / 2;
      } else if (placement === 'bottom') {
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
      } else if (placement === 'right') {
        top = rect.top + rect.height / 2;
        left = rect.right + 8;
      } else if (placement === 'left') {
        top = rect.top + rect.height / 2;
        left = rect.left - 8;
      }
      setCoords({ top, left });
    }
  }, [visible, placement]);

  // Portal tooltip element
  const tooltipEl = visible ? ReactDOM.createPortal(
    <span
      style={{
        ...tooltipBaseStyle,
        top: coords.top,
        left: coords.left,
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'auto',
      }}
      role="tooltip"
    >
      {content}
    </span>,
    document.body
  ) : null;

  return (
    <span
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
    >
      {children}
      {tooltipEl}
    </span>
  );
} 