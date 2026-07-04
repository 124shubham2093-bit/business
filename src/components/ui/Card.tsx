import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'rounded-xl glass-panel text-gray-200 transition-all duration-300',
            glow
              // Elevated card: uses glass-panel-glow (elevation shadow, not neon glow)
              ? 'glass-panel-glow hover:border-slate-600/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]'
              : 'hover:border-slate-600/40'
          ),
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('flex flex-col space-y-1.5 p-6 border-b border-white/5', className)}
        {...props}
      />
    );
  }
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={twMerge(
          'text-lg font-semibold font-display tracking-tight text-white leading-none',
          className
        )}
        {...props}
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={twMerge('text-xs text-gray-400', className)}
        {...props}
      />
    );
  }
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={twMerge('p-6 pt-4', className)} {...props} />;
  }
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('flex items-center p-6 pt-0 border-t border-white/5 mt-4', className)}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'CardFooter';
