import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, danger, outline, gradient-indigo, gradient-emerald
  className = '',
  disabled = false,
  size = 'md'
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20',
    secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/10 hover:shadow-rose-600/20',
    outline: 'border border-dark-border text-dark-text hover:bg-slate-800 hover:border-slate-500',
    'gradient-indigo': 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02]',
    'gradient-emerald': 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 shadow-lg shadow-emerald-400/20 hover:shadow-emerald-400/30 hover:scale-[1.02]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
export default Button;
