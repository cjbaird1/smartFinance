import React from 'react';
import '../styles/custom-scrollbar.css';

const CustomScrollbar = ({ 
  children, 
  className = '', 
  maxHeight = 'auto',
  showHorizontal = false,
  showVertical = true,
  ...props 
}) => {
  return (
    <div 
      className={`custom-scrollbar ${className}`}
      style={{ maxHeight }}
      {...props}
    >
      <div className="scrollbar-content">
        {children}
      </div>
      {showVertical && <div className="scrollbar-track-vertical" />}
      {showHorizontal && <div className="scrollbar-track-horizontal" />}
    </div>
  );
};

export default CustomScrollbar; 