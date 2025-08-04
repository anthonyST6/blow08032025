import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const inputVariants = cva(
  'block w-full px-3 py-2 text-seraphim-text bg-background-secondary border rounded-md placeholder-seraphim-text-dim focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-seraphim-black hover:border-seraphim-gold/30 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-seraphim-gold/20 focus:ring-seraphim-gold/50 focus:border-seraphim-gold/50',
        security: 'border-vanguard-security/30 focus:ring-vanguard-security/50 focus:border-vanguard-security/50',
        integrity: 'border-vanguard-integrity/30 focus:ring-vanguard-integrity/50 focus:border-vanguard-integrity/50',
        accuracy: 'border-vanguard-accuracy/30 focus:ring-vanguard-accuracy/50 focus:border-vanguard-accuracy/50',
        error: 'border-vanguard-integrity focus:ring-vanguard-integrity/50 focus:border-vanguard-integrity',
        success: 'border-vanguard-accuracy focus:ring-vanguard-accuracy/50 focus:border-vanguard-accuracy',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    containerClassName,
    variant,
    size,
    label,
    error,
    success,
    hint,
    icon,
    iconPosition = 'left',
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const effectiveVariant = hasError ? 'error' : hasSuccess ? 'success' : variant;

    return (
      <div className={cn('space-y-1', containerClassName)}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-seraphim-text"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-seraphim-text-dim">{icon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant: effectiveVariant, size }),
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-seraphim-text-dim">{icon}</span>
            </div>
          )}
          
          {(hasError || hasSuccess) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-vanguard-integrity" />
              ) : (
                <CheckCircle className="h-5 w-5 text-vanguard-accuracy" />
              )}
            </div>
          )}
        </div>
        
        {(error || success || hint) && (
          <div className="flex items-start space-x-1">
            {error && (
              <>
                <AlertCircle className="h-4 w-4 text-vanguard-integrity mt-0.5 flex-shrink-0" />
                <p className="text-sm text-vanguard-integrity">{error}</p>
              </>
            )}
            {success && !error && (
              <>
                <CheckCircle className="h-4 w-4 text-vanguard-accuracy mt-0.5 flex-shrink-0" />
                <p className="text-sm text-vanguard-accuracy">{success}</p>
              </>
            )}
            {hint && !error && !success && (
              <>
                <Info className="h-4 w-4 text-seraphim-text-dim mt-0.5 flex-shrink-0" />
                <p className="text-sm text-seraphim-text-dim">{hint}</p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea variant
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className,
    containerClassName,
    label,
    error,
    success,
    hint,
    id,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    return (
      <div className={cn('space-y-1', containerClassName)}>
        {label && (
          <label 
            htmlFor={textareaId} 
            className="block text-sm font-medium text-seraphim-text"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={cn(
              'block w-full px-3 py-2 text-seraphim-text bg-background-secondary rounded-md placeholder-seraphim-text-dim focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-seraphim-black hover:border-seraphim-gold/30 transition-all duration-200 min-h-[100px] resize-y',
              hasError 
                ? 'border-vanguard-integrity focus:ring-vanguard-integrity/50 focus:border-vanguard-integrity'
                : hasSuccess
                ? 'border-vanguard-accuracy focus:ring-vanguard-accuracy/50 focus:border-vanguard-accuracy'
                : 'border-seraphim-gold/20 focus:ring-seraphim-gold/50 focus:border-seraphim-gold/50',
              className
            )}
            {...props}
          />
        </div>
        
        {(error || success || hint) && (
          <div className="flex items-start space-x-1">
            {error && (
              <>
                <AlertCircle className="h-4 w-4 text-vanguard-integrity mt-0.5 flex-shrink-0" />
                <p className="text-sm text-vanguard-integrity">{error}</p>
              </>
            )}
            {success && !error && (
              <>
                <CheckCircle className="h-4 w-4 text-vanguard-accuracy mt-0.5 flex-shrink-0" />
                <p className="text-sm text-vanguard-accuracy">{success}</p>
              </>
            )}
            {hint && !error && !success && (
              <>
                <Info className="h-4 w-4 text-seraphim-text-dim mt-0.5 flex-shrink-0" />
                <p className="text-sm text-seraphim-text-dim">{hint}</p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';