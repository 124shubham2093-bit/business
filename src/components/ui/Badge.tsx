import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  glow = false,
  children,
  ...props
}) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border transition-all duration-300',
          {
            // Default
            'bg-white/5 border-white/10 text-gray-300': variant === 'default',
            // Success (Approved / Low Risk)
            'bg-emerald-950/30 border-emerald-500/20 text-emerald-400': variant === 'success',
            // Warning (Under Review / Medium Risk)
            'bg-amber-950/30 border-amber-500/20 text-amber-400': variant === 'warning',
            // Danger (Flagged / High Risk) — subtle glow kept but reduced; pulse removed
            'bg-rose-950/30 border-rose-500/20 text-rose-400': variant === 'danger',
            // Info
            'bg-cyan-950/30 border-cyan-500/20 text-cyan-400': variant === 'info',
          },
          glow && {
            // Elevation-style glow on hover — much more subtle than before
            'shadow-[0_0_8px_rgba(16,185,129,0.12)]': variant === 'success',
            'shadow-[0_0_8px_rgba(245,158,11,0.12)]': variant === 'warning',
            // Danger: reduced shadow, NO animate-pulse-glow (too jarring for enterprise)
            'shadow-[0_0_8px_rgba(239,68,68,0.15)]': variant === 'danger',
            'shadow-[0_0_8px_rgba(6,182,212,0.12)]': variant === 'info',
          },
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
