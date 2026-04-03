import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const isDateInput = type === 'date';

    return (
      <input
        type={type}
        className={cn(
          'block min-w-0 w-full max-w-full rounded-sm border border-input bg-white/90 text-base text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:bg-background dark:shadow-none',
          isDateInput ? 'native-date-input h-11 px-3 py-2 text-left' : 'h-11 px-4 py-2',
          isDateInput &&
            'appearance-auto pr-3 leading-normal [color-scheme:light] dark:[color-scheme:dark]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
export default Input;
