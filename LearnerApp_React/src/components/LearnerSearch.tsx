import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, User } from '@phosphor-icons/react';
import { apiRequest } from '../utils/api';

export type LearnerOption = {
  learnerId: number;
  name: string;
  batch: string;
  attendance: number;
  codingScore: number;
  aptitudeScore: number;
  communicationScore: number;
  mentorId: number | null;
};

interface LearnerSearchProps {
  value: LearnerOption | null;
  onChange: (learner: LearnerOption | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AL';
}

export default function LearnerSearch({
  value,
  onChange,
  label = 'Select Learner',
  placeholder = 'Search by name, batch, or ID…',
  className = '',
}: LearnerSearchProps) {
  const [allLearners, setAllLearners] = useState<LearnerOption[]>([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch learners once on first open
  useEffect(() => {
    if (!isOpen || hasFetched) return;

    let cancelled = false;

    const fetchLearners = async () => {
      setIsLoading(true);

      try {
        const data = await apiRequest<LearnerOption[]>('/api/learners');

        if (!cancelled) {
          setAllLearners(Array.isArray(data) ? data : []);
          setHasFetched(true);
        }
      } catch {
        if (!cancelled) {
          setAllLearners([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchLearners();

    return () => {
      cancelled = true;
    };
  }, [isOpen, hasFetched]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? allLearners.filter(
      (learner) =>
        learner.name.toLowerCase().includes(normalizedQuery) ||
        learner.batch.toLowerCase().includes(normalizedQuery) ||
        String(learner.learnerId).includes(normalizedQuery),
    )
    : allLearners;

  const handleSelect = (learner: LearnerOption) => {
    onChange(learner);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label ? (
        <label className="flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono">
          <User size={14} weight="bold" /> {label}
        </label>
      ) : null}

      {/* Selected display or search input */}
      {value && !isOpen ? (
        <button
          type="button"
          onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="w-full flex items-center gap-3 px-4 py-3 bg-base border border-surface0/60 rounded-xl text-left transition-all hover:border-blue/40 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-blue/12 text-blue text-xs font-bold flex items-center justify-center shrink-0">
            {getInitials(value.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-text font-semibold truncate">{value.name}</div>
            <div className="text-[10px] text-overlay0 font-mono">{value.batch} · ID {value.learnerId}</div>
          </div>
          <span
            onClick={(event) => { event.stopPropagation(); handleClear(); }}
            className="text-overlay0 hover:text-text text-xs transition-colors px-1"
          >✕</span>
        </button>
      ) : (
        <div className="relative">
          <MagnifyingGlass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-overlay0 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => { setQuery(event.target.value); if (!isOpen) setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all focus:border-blue/50 focus:ring-1 focus:ring-blue/20"
          />
        </div>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full max-h-[280px] overflow-y-auto bg-mantle border border-surface0/70 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] scrollbar-thin"
          >
            {isLoading ? (
              <div className="px-4 py-6 text-center text-xs text-overlay0 font-mono">Loading learners…</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-overlay0 font-mono">
                {normalizedQuery ? 'No learners match your search' : 'No learners found'}
              </div>
            ) : (
              filtered.map((learner) => (
                <button
                  key={learner.learnerId}
                  type="button"
                  onClick={() => handleSelect(learner)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-blue/8 cursor-pointer ${
                    value?.learnerId === learner.learnerId ? 'bg-blue/10' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-blue/12 text-blue text-xs font-bold flex items-center justify-center shrink-0">
                    {getInitials(learner.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text font-medium truncate">{learner.name}</div>
                    <div className="text-[10px] text-overlay0 font-mono mt-0.5">{learner.batch} · ID {learner.learnerId}</div>
                  </div>
                  <div className="text-[10px] text-overlay0 font-mono shrink-0">{learner.codingScore}%</div>
                </button>
              ))
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
