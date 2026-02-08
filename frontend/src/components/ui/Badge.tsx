import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
}

const variants = {
  default: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
  success: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
  warning: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
  destructive: 'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]',
  outline: 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
};

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
