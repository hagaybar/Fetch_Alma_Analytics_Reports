import type { HTMLAttributes } from 'react';

type FrequencyValue = 'daily' | 'weekly' | 'monthly' | 'on_demand';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'frequency' | 'format';
  frequency?: FrequencyValue;
}

const variants = {
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  destructive: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  outline: 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
  frequency: '', // Dynamically determined based on frequency prop
  format: 'text-slate-500 dark:text-slate-400 font-mono', // For format badges like CSV, XLSX, TSV
};

const frequencyColors: Record<FrequencyValue, string> = {
  daily: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  weekly: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  monthly: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  on_demand: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

export function Badge({
  className = '',
  variant = 'default',
  frequency,
  children,
  ...props
}: BadgeProps) {
  let variantClasses = variants[variant];

  // If variant is 'frequency', use the frequency prop to determine color
  if (variant === 'frequency' && frequency) {
    variantClasses = frequencyColors[frequency] || frequencyColors.on_demand;
  }

  // Format badges have minimal styling (no background)
  const baseClasses = variant === 'format'
    ? 'text-xs'
    : 'text-xs px-2 py-0.5 rounded-full font-medium';

  return (
    <span
      className={`inline-flex items-center ${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// Helper component for displaying frequency badges
export function FrequencyBadge({ frequency }: { frequency: FrequencyValue }) {
  const labels: Record<FrequencyValue, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    on_demand: 'On Demand',
  };

  return (
    <Badge variant="frequency" frequency={frequency}>
      {labels[frequency]}
    </Badge>
  );
}

// Helper component for displaying format badges
export function FormatBadge({ format }: { format: string }) {
  return (
    <Badge variant="format">
      {format.toUpperCase()}
    </Badge>
  );
}
