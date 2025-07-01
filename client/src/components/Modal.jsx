import React from 'react';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.5)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalStyle = {
  background: '#23272e',
  color: '#fff',
  borderRadius: 10,
  padding: '32px 32px 24px 32px',
  minWidth: 350,
  minHeight: 200,
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  position: 'relative',
};

export default function Modal({ children, onClose }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={modalStyle}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
} 