import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-seraphim-black disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-gold text-seraphim-black hover:shadow-glow-gold/50 focus:ring-seraphim-gold border border-seraphim-gold/50',
        secondary: 'bg-transparent text-seraphim-text border border-seraphim-gold/30 hover:border-seraphim-gold/60 hover:bg-seraphim-gold/10 focus:ring-seraphim-gold/50',
        security: 'bg-gradient-security text-white hover:shadow-glow-blue/50 focus:ring-vanguard-security',
        integrity: 'bg-gradient-integrity text-white hover:shadow-glow-red/50 focus:ring-vanguard-integrity',
        accuracy: 'bg-gradient-accuracy text-white hover:shadow-glow-green/50 focus:ring-vanguard-accuracy',
        ghost: 'text-seraphim-text hover:bg-seraphim-gold/10 focus:ring-seraphim-gold/30',
        danger: 'bg-vanguard-integrity text-white hover:bg-vanguard-integrity-dark focus:ring-vanguard-integrity',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
      glow: {
        true: 'relative overflow-hidden',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      glow: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false, 
    disabled,
    children,
    icon,
    iconPosition = 'left',
    glow = false,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, glow, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {glow && (
          <span className="absolute inset-0 -z-10">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
          </span>
        )}
        
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Export button variants for use in other components
export { buttonVariants };