import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        /* Fixed by Codex on 2026-02-15
           Problem: Search inputs inherited dark text colors on dark backgrounds, making typed text invisible.
           Solution: Enforce the shared input text/caret colors in the base Input component.
           Result: Search text remains readable across all screens and themes. */
        className={cn(
          'flex h-10 w-full rounded-full border border-input bg-common-invert px-4 py-3 text-sm text-text-primary caret-text-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
