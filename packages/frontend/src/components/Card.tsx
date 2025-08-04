import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const cardVariants = cva(
  'rounded-lg transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-background-card border border-seraphim-gold/20 hover:border-seraphim-gold/40',
        premium: 'premium-card',
        metallic: 'metallic-surface bg-gradient-metallic border border-seraphim-gold/30',
        security: 'bg-background-card border border-vanguard-security/30 hover:shadow-glow-blue/20',
        integrity: 'bg-background-card border border-vanguard-integrity/30 hover:shadow-glow-red/20',
        accuracy: 'bg-background-card border border-vanguard-accuracy/30 hover:shadow-glow-green/20',
        glass: 'bg-background-card/50 backdrop-blur-md border border-seraphim-gold/20',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      glow: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      glow: false,
    },
    compoundVariants: [
      {
        variant: 'default',
        glow: true,
        className: 'hover:shadow-glow-gold/20',
      },
      {
        variant: 'premium',
        glow: true,
        className: 'shadow-glow-gold/10',
      },
    ],
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    padding,
    glow,
    header,
    footer,
    badge,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, glow }), className)}
        {...props}
      >
        {badge && (
          <div className="absolute -top-3 -right-3 z-10">
            {badge}
          </div>
        )}
        
        {header && (
          <div className="border-b border-seraphim-gold/10 pb-4 mb-4">
            {header}
          </div>
        )}
        
        {children}
        
        {footer && (
          <div className="border-t border-seraphim-gold/10 pt-4 mt-4">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  ...props
}) => {
  if (children) {
    return (
      <div className={cn('', className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('flex items-start justify-between', className)} {...props}>
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-seraphim-text">{title}</h3>
        )}
        {subtitle && (
          <p className="text-sm text-seraphim-text-dim mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({
  className,
  ...props
}) => {
  return <div className={cn('', className)} {...props} />;
};

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  ...props
}) => {
  return (
    <div 
      className={cn('flex items-center justify-between', className)} 
      {...props} 
    />
  );
};

// Metric Card Component
export interface MetricCardProps extends Omit<CardProps, 'variant'> {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  type?: 'default' | 'security' | 'integrity' | 'accuracy';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  type = 'default',
  className,
  ...props
}) => {
  const variantMap = {
    default: 'default',
    security: 'security',
    integrity: 'integrity',
    accuracy: 'accuracy',
  } as const;

  return (
    <Card
      variant={variantMap[type]}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-seraphim-text-dim">{title}</p>
          <p className="text-2xl font-bold text-seraphim-text mt-2">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  change.type === 'increase' 
                    ? 'text-vanguard-accuracy' 
                    : 'text-vanguard-integrity'
                )}
              >
                {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={cn(
            'p-3 rounded-lg',
            type === 'security' && 'bg-vanguard-security/10 text-vanguard-security',
            type === 'integrity' && 'bg-vanguard-integrity/10 text-vanguard-integrity',
            type === 'accuracy' && 'bg-vanguard-accuracy/10 text-vanguard-accuracy',
            type === 'default' && 'bg-seraphim-gold/10 text-seraphim-gold'
          )}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Background decoration */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5">
        <div className={cn(
          'w-full h-full rounded-full',
          type === 'security' && 'bg-vanguard-security',
          type === 'integrity' && 'bg-vanguard-integrity',
          type === 'accuracy' && 'bg-vanguard-accuracy',
          type === 'default' && 'bg-seraphim-gold'
        )} />
      </div>
    </Card>
  );
};

// Export all card-related components
export { cardVariants };