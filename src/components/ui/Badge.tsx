import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  glow = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-mono font-medium rounded-md border tracking-wide transition-all duration-200 select-none';

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variants = {
    default: 'bg-[var(--bg-subtle)] border-[var(--border-color)] text-[var(--text-primary)]',
    success: glow 
      ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 shadow-sm'
      : 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400',
    warning: 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-400',
    danger: glow
      ? 'bg-rose-100 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-400 shadow-sm'
      : 'bg-rose-100 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-400',
    info: glow
      ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400 shadow-sm'
      : 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400',
    purple: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400',
  };

  return (
    <span
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
