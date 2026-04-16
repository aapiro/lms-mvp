import React from 'react';
import './LoadingSkeleton.css';

function LoadingSkeleton({ variant = 'text', count = 1, width }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`skeleton skeleton--${variant}`}
          style={width ? { width } : undefined}
        />
      ))}
    </>
  );
}

export default LoadingSkeleton;
