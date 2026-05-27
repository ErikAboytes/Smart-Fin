import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  className = '',
  color = 'indigo', // indigo, emerald, rose, violet
  showLabel = false,
  glow = false
}) => {
  const percentage = Math.min(100, Math.max(0, parseFloat(value)));

  const colorStyles = {
    indigo: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    emerald: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    rose: 'bg-gradient-to-r from-rose-400 to-red-500',
    violet: 'bg-gradient-to-r from-violet-500 to-indigo-600',
  };

  const glowStyles = {
    indigo: 'shadow-[0_0_12px_rgba(99,102,241,0.5)]',
    emerald: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    rose: 'shadow-[0_0_12px_rgba(239,68,68,0.5)]',
    violet: 'shadow-[0_0_12px_rgba(139,92,246,0.5)]',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1 text-xs font-semibold text-dark-muted">
        {showLabel && (
          <>
            <span>Progreso</span>
            <span className="text-dark-text font-bold">{percentage.toFixed(1)}%</span>
          </>
        )}
      </div>
      <div className="w-full bg-slate-900/60 rounded-full h-2.5 border border-dark-border/40 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorStyles[color]} ${glow ? glowStyles[color] : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
export default ProgressBar;
