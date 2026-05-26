interface SectionHeaderProps {
  moduleLabel: string;
  title: string;
  subtitle: string;
  subtitleClassName?: string;
}

export default function SectionHeader({ moduleLabel, title, subtitle, subtitleClassName = '' }: SectionHeaderProps) {
  return (
    <div className="mb-10 lg:mb-14">
      <div className="inline-block text-xs font-medium tracking-widest text-overlay0 uppercase mb-4 px-3.5 py-1.5 rounded-full bg-surface0/30 border border-surface0/50">
        {moduleLabel}
      </div>
      <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-text mb-3 tracking-tight leading-tight">{title}</h1>
      <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed break-words text-subtext0 ${subtitleClassName}`}>{subtitle}</p>
    </div>
  );
}
