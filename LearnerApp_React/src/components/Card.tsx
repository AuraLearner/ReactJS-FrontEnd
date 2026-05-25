import type { ReactNode } from 'react';

interface CardProps { children: ReactNode; className?: string; }

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-mantle border border-surface0/60 rounded-2xl p-6 sm:p-8 lg:p-9 shadow-[0_2px_24px_rgba(0,0,0,0.25)] hover:border-surface1/70 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}
