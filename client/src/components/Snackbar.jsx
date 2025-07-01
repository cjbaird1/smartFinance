import React, { useEffect } from 'react';
import '../styles/snackbar.css';

const Snackbar = ({ message, open, onClose, type = 'error' }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <div className={`snackbar snackbar-${type} ${open ? 'show' : ''}`} role="alert">
      <span>{message}</span>
      <button className="snackbar-close" onClick={onClose} aria-label="Close">&times;</button>
    </div>
  );
};

export default Snackbar; 