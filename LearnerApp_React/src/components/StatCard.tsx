import type { ReactNode } from 'react';

type AccentColor = 'blue' | 'green' | 'amber' | 'mauve';

interface StatCardProps {
  value: string | number;
  label: string;
  delta?: ReactNode;
  accent: AccentColor;
  icon?: React.ReactNode;
}

const accentGradient: Record<AccentColor, string> = {
  blue: 'from-blue/20 to-blue/5',
  green: 'from-green/20 to-green/5',
  amber: 'from-peach/20 to-peach/5',
  mauve: 'from-mauve/20 to-mauve/5',
};
const accentIcon: Record<AccentColor, string> = { blue: 'text-blue bg-blue/10', green: 'text-green bg-green/10', amber: 'text-peach bg-peach/10', mauve: 'text-mauve bg-mauve/10' };

export default function StatCard({ value, label, delta, accent, icon }: StatCardProps) {
  return (
    <div className="relative overflow-hidden bg-mantle border border-surface0/60 rounded-2xl p-5 sm:p-6 lg:p-7 hover:border-surface1/80 transition-all duration-300 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentGradient[accent]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      <div className="relative flex items-start justify-between mb-4">
        {icon && (
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${accentIcon[accent]} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
      <div className="relative font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-text tracking-tight leading-none">{value}</div>
      <div className="relative text-[10px] sm:text-xs text-subtext0 mt-3 font-medium tracking-wide uppercase">{label}</div>
      {delta && <div className="relative text-[10px] sm:text-xs mt-3 font-medium">{delta}</div>}
    </div>
  );
}
