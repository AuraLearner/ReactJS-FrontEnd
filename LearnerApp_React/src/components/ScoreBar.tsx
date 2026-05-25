interface ScoreBarProps {
  value: number;
  max?: number;
  color: string;
}

export default function ScoreBar({ value, max = 100, color }: ScoreBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-surface0/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="font-mono text-xs text-subtext0 min-w-[32px] text-right font-medium">{value}</div>
    </div>
  );
}
