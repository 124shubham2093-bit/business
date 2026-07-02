import React, { type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 outline-none select-none cursor-pointer border border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]',
            {
              // Primaries
              'bg-brand-purple text-white hover:bg-brand-purple-dark hover:shadow-[0_0_15px_rgba(139,92,246,0.45)] border-brand-purple/20':
                variant === 'primary',
              // Secondaries
              'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/5':
                variant === 'secondary',
              // Outline
              'border-brand-purple/30 bg-transparent text-brand-purple-light hover:bg-brand-purple/10 hover:border-brand-purple/50':
                variant === 'outline',
              // Ghost
              'hover:bg-white/5 text-gray-400 hover:text-gray-200': variant === 'ghost',
              // Danger
              'bg-red-950/40 text-red-400 border-red-500/20 hover:bg-red-900/50 hover:text-red-300 hover:border-red-500/40':
                variant === 'danger',

              // Sizes
              'px-3 py-1.5 text-xs': size === 'sm',
              'px-4 py-2 text-sm': size === 'md',
              'px-5 py-2.5 text-base': size === 'lg',
            },
            className
          )
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
