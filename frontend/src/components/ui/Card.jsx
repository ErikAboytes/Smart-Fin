import React from 'react';

export const Card = ({ children, className = '', hoverEffect = false, glass = false }) => {
  return (
    <div
      className={`
        rounded-2xl 
        p-6 
        border 
        ${glass ? 'glass-panel' : 'bg-dark-card border-dark-border'} 
        ${hoverEffect ? (glass ? 'glass-panel-hover' : 'transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5') : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-bold text-dark-text tracking-wide mb-4 ${className}`}>
      {children}
    </h3>
  );
};
export default Card;
