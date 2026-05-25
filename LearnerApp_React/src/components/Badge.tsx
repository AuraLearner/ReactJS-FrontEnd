import type { ReactNode } from 'react';

type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'mauve';

interface BadgeProps {
  children: ReactNode;
  variant: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-green/15 text-green border-green/20',
  amber: 'bg-peach/15 text-peach border-peach/20',
  red: 'bg-red/15 text-red border-red/20',
  blue: 'bg-blue/15 text-blue border-blue/20',
  mauve: 'bg-mauve/15 text-mauve border-mauve/20',
};

export default function Badge({ children, variant, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
