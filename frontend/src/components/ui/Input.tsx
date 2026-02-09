import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            flex h-10 w-full rounded-md border border-[hsl(var(--input))]
            bg-transparent px-3 py-2 text-sm ring-offset-white
            file:border-0 file:bg-transparent file:text-sm file:font-medium
            placeholder:text-[hsl(var(--muted-foreground))]
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-[hsl(var(--destructive))]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
