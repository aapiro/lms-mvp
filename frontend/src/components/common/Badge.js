import React from 'react';
import './Badge.css';

function Badge({ variant = 'neutral', size = 'sm', children, className = '' }) {
  return (
    <span className={`badge badge--${variant} badge--${size} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
