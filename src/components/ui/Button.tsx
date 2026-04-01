import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-100',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-white/90 text-foreground hover:bg-stone-100 hover:text-foreground dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-stone-200 dark:hover:bg-secondary/80',
        ghost:
          'text-foreground hover:bg-stone-100 hover:text-foreground dark:hover:bg-accent/20 dark:hover:text-accent-foreground',
        link: 'text-accent underline-offset-4 hover:underline',
        lion:
          'bg-lion-400 font-semibold text-slate-950 hover:bg-lion-300 active:bg-lion-500 disabled:bg-stone-300 disabled:text-stone-600',
        'lion-outline':
          'border border-lion-500/25 bg-lion-100/70 text-lion-800 hover:bg-lion-100 active:bg-lion-200 dark:border-lion-400/40 dark:bg-lion-400/10 dark:text-lion-300 dark:hover:bg-lion-400/15 dark:active:bg-lion-400/20',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-9 px-4',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;
