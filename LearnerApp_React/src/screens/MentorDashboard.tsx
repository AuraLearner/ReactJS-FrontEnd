import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { UsersThree, Target, Warning, MagnifyingGlass, FunnelSimple, PencilSimple } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ScoreBar from '../components/ScoreBar';
import { apiRequest, getStoredRole, getStoredUserId } from '../utils/api';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

type LearnerRecord = {
  learnerId: number;
  name: string;
  batch: string;
  mentorId: number | null;
  attendance: number;
  codingScore: number;
  aptitudeScore: number;
  communicationScore: number;
};

type BatchSummary = {
  name: string;
  learners: number;
  ready: number;
  status: 'Active' | 'In Progress' | 'New';
  readiness: number;
};

type PredictionVariant = 'green' | 'amber' | 'red';

function isPlacementReady(learner: LearnerRecord): boolean {
  return learner.attendance >= 75 && learner.codingScore >= 75 && learner.communicationScore >= 70;
}

function calculateReadiness(learner: LearnerRecord): number {
  return Math.round(
    learner.attendance * 0.25
      + learner.codingScore * 0.35
      + learner.aptitudeScore * 0.15
      + learner.communicationScore * 0.25,
  );
}

function deriveMockInterviewScore(learner: LearnerRecord): number {
  return Math.round((learner.aptitudeScore + learner.communicationScore) / 2);
}

function derivePrediction(learner: LearnerRecord): { label: string; variant: PredictionVariant } {
  const readiness = calculateReadiness(learner);

  if (readiness >= 80) {
    return { label: `${readiness}% Ready`, variant: 'green' };
  }

  if (readiness >= 60) {
    return { label: `${readiness}% Moderate`, variant: 'amber' };
  }

  return { label: `${readiness}% At Risk`, variant: 'red' };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Tip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (<div className="bg-base border border-surface1 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-[10px] font-mono text-overlay0 mb-1">{label}</p>
      <p className="text-sm font-bold text-blue">{payload[0].value}% Ready</p>
    </div>);
  }
  return null;
};

export default function MentorDashboard() {
  const [learners, setLearners] = useState<LearnerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadLearners = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiRequest<LearnerRecord[]>('/api/learners');

        if (!cancelled) {
          setLearners(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load learners');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadLearners();

    return () => {
      cancelled = true;
    };
  }, []);

  const userRole = getStoredRole().trim().toUpperCase();
  const mentorUserId = getStoredUserId();

  const scopedLearners = userRole === 'MENTOR' && mentorUserId != null
    ? learners.filter((learner) => learner.mentorId === mentorUserId)
    : learners;

  const query = searchQuery.trim().toLowerCase();
  const visibleLearners = query
    ? scopedLearners.filter((learner) => (
      learner.name.toLowerCase().includes(query)
      || learner.batch.toLowerCase().includes(query)
      || String(learner.learnerId).includes(query)
    ))
    : scopedLearners;

  const totalLearners = visibleLearners.length;
  const readyLearners = visibleLearners.filter(isPlacementReady).length;
  const mentorCount = new Set(
    visibleLearners
      .map((learner) => learner.mentorId)
      .filter((mentorId): mentorId is number => mentorId != null),
  ).size;
  const averageAttendance = totalLearners > 0
    ? Math.round(visibleLearners.reduce((sum, learner) => sum + learner.attendance, 0) / totalLearners)
    : 0;

  const batchSummaries = Array.from(
    visibleLearners.reduce((summaryMap, learner) => {
      const key = learner.batch?.trim() || 'Unassigned';
      const summary = summaryMap.get(key) ?? { name: key, learners: 0, ready: 0 };

      summary.learners += 1;

      if (isPlacementReady(learner)) {
        summary.ready += 1;
      }

      summaryMap.set(key, summary);
      return summaryMap;
    }, new Map<string, { name: string; learners: number; ready: number }>()).values(),
  ).map<BatchSummary>((summary) => {
    const readiness = summary.learners > 0 ? Math.round((summary.ready / summary.learners) * 100) : 0;

    return {
      ...summary,
      readiness,
      status: readiness >= 75 ? 'Active' : readiness >= 40 ? 'In Progress' : 'New',
    };
  }).sort((left, right) => right.learners - left.learners);

  const chartData = batchSummaries.slice(0, 6).map((batch) => ({
    batch: batch.name,
    rate: batch.readiness,
  }));

  const learnerRows = visibleLearners.map((learner) => {
    const prediction = derivePrediction(learner);

    return {
      ...learner,
      mockInterview: deriveMockInterviewScore(learner),
      prediction: prediction.label,
      predictionVariant: prediction.variant,
    };
  });

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 3 · UC-4" title="Mentor Dashboard"
          subtitle="Live learner roster via GET /api/learners · Mentors see their assigned learners when a mentor id is available" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-10">
        <StatCard value={totalLearners} label="Assigned Learners" accent="blue" icon={<UsersThree size={20} weight="duotone" />} />
        <StatCard value={readyLearners} label="Placement Ready" accent="green" icon={<Target size={20} weight="duotone" />} />
        <StatCard value={Math.max(0, totalLearners - readyLearners)} label="Need Attention" accent="amber" icon={<Warning size={20} weight="duotone" />} />
      </motion.div>
      <motion.div variants={iV}>
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">Assigned Learners</h2>
              <p className="text-xs text-overlay0 font-mono tracking-wide">Protected data from /api/learners · Search and filters are live</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-overlay0" />
                <input
                  className="pl-10 pr-4 py-2.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 w-[200px] sm:w-[220px] transition-all"
                  placeholder="Search learner…"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 transition-colors cursor-pointer">
                <FunnelSimple size={14} /> Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-9 px-4 sm:px-6 lg:px-9">
            <table className="w-full border-collapse min-w-[850px]">
              <thead><tr>
                {['Learner', 'Coding', 'Aptitude', 'Communication', 'Mock Interview', 'Prediction', 'Action'].map((h) => (
                  <th key={h} className="font-mono text-[10px] font-medium tracking-widest uppercase text-overlay0 px-4 lg:px-5 py-4 text-left border-b border-surface0/50">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {isLoading && learnerRows.length === 0 ? (
                  <tr>
                    <td className="px-4 lg:px-5 py-8 text-sm text-overlay0 border-b border-surface0/25" colSpan={7}>Loading learners...</td>
                  </tr>
                ) : learnerRows.length > 0 ? learnerRows.map((l) => {
                  const initials = l.name
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'AL';

                  return (
                  <tr key={l.learnerId} className="hover:bg-base/40 transition-colors group">
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue/12 text-blue text-xs font-bold flex items-center justify-center shrink-0">{initials}</div>
                        <span className="text-sm text-text font-semibold">{l.name}</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25 min-w-[130px]"><ScoreBar value={l.codingScore} color="bg-blue" /></td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25 min-w-[130px]"><ScoreBar value={l.aptitudeScore} color="bg-mauve" /></td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25 min-w-[130px]"><ScoreBar value={l.communicationScore} color="bg-green" /></td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25 min-w-[130px]"><ScoreBar value={l.mockInterview} color="bg-peach" /></td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25"><Badge variant={l.predictionVariant}>{l.prediction}</Badge></td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-peach text-crust cursor-pointer shadow-[0_2px_10px_rgba(250,179,135,0.15)]">
                        <PencilSimple size={14} weight="bold" /> Update
                      </motion.button>
                    </td>
                  </tr>
                );
                }) : (
                  <tr>
                    <td className="px-4 lg:px-5 py-8 text-sm text-overlay0 border-b border-surface0/25" colSpan={7}>
                      {searchQuery.trim() ? 'No learners match your search.' : 'No learner records available yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8">
        <Card>
          <div className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">Batch Overview</h2>
            <p className="text-xs text-overlay0 font-mono tracking-wide">Ready learner ratio by batch</p>
          </div>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="batch" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6c7086' }} />
                  <Tooltip content={<Tip />} cursor={{ fill: 'rgba(137,180,250,0.04)' }} />
                  <Bar dataKey="rate" fill="#89b4fa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-overlay0 font-mono mt-5 tracking-wide">Ready percentage by batch</p>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center rounded-xl border border-dashed border-surface0/50 text-sm text-overlay0">
              {isLoading ? 'Loading learners...' : 'Load learner data to render the batch chart.'}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display text-lg font-bold mb-6">Mentor Scope</h3>
          <div className="space-y-4 text-sm text-subtext0">
            <div className="flex items-center justify-between">
              <span>Visible learners</span>
              <strong className="text-text">{totalLearners}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Distinct mentors</span>
              <strong className="text-text">{mentorCount}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Average attendance</span>
              <strong className="text-text">{averageAttendance}%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Current role</span>
              <strong className="text-text">{userRole || 'UNKNOWN'}</strong>
            </div>
          </div>
        </Card>
      </motion.div>

      {error ? (
        <motion.div variants={iV} className="mt-8 rounded-2xl border border-red/20 bg-red/10 px-5 py-4 text-sm text-red-100">
          {error}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
