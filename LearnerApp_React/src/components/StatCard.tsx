import type { ReactNode } from 'react';

type AccentColor = 'blue' | 'green' | 'amber' | 'mauve';

interface StatCardProps {
  value: string | number;
  label: string;
  delta?: ReactNode;
  accent: AccentColor;
  icon?: React.ReactNode;
}

const accentBar: Record<AccentColor, string> = { blue: 'bg-blue', green: 'bg-green', amber: 'bg-peach', mauve: 'bg-mauve' };
const accentIcon: Record<AccentColor, string> = { blue: 'text-blue bg-blue/10', green: 'text-green bg-green/10', amber: 'text-peach bg-peach/10', mauve: 'text-mauve bg-mauve/10' };

export default function StatCard({ value, label, delta, accent, icon }: StatCardProps) {
  return (
    <div className="relative overflow-hidden bg-mantle border border-surface0/60 rounded-2xl p-6 lg:p-7 hover:border-surface1/80 transition-all duration-300 group">
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${accentBar[accent]} opacity-70 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={`w-10 h-10 rounded-xl ${accentIcon[accent]} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
      <div className="font-display text-4xl lg:text-[42px] font-bold text-text tracking-tight leading-none">{value}</div>
      <div className="text-xs text-subtext0 mt-3 font-medium tracking-wide uppercase">{label}</div>
      {delta && <div className="text-xs mt-3 font-medium">{delta}</div>}
    </div>
  );
}
