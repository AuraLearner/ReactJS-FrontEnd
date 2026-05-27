import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Target, ChalkboardTeacher, ChartLineUp, Plus, UploadSimple, Exam, Lightning } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import type { ScreenId } from '../components/Navbar';
import { apiRequest } from '../utils/api';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
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

const statusBadge = { Active: 'green', 'In Progress': 'amber', New: 'blue' } as const;

function isPlacementReady(learner: LearnerRecord): boolean {
  return learner.attendance >= 75 && learner.codingScore >= 75 && learner.communicationScore >= 70;
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

interface Props { onNavigate: (id: ScreenId) => void; }

export default function AdminDashboard({ onNavigate }: Props) {
  const [learners, setLearners] = useState<LearnerRecord[]>([]);
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

  const totalLearners = learners.length;
  const readyLearners = learners.filter(isPlacementReady).length;
  const mentorCount = new Set(learners.map((learner) => learner.mentorId).filter((mentorId): mentorId is number => mentorId != null)).size;
  const averageAttendance = totalLearners > 0
    ? Math.round(learners.reduce((sum, learner) => sum + learner.attendance, 0) / totalLearners)
    : 0;

  const batchSummaries = Array.from(
    learners.reduce((summaryMap, learner) => {
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

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 1" title="Admin Dashboard" subtitle="Overview of all learners, mentors, and placement activity" />
      </motion.div>

      <motion.div variants={iV} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-10">
        <StatCard value={totalLearners} label="Total Learners" accent="blue" icon={<Users size={20} weight="duotone" />}
          delta={<span className="text-green">live from /api/learners</span>} />
        <StatCard value={readyLearners} label="Placement Ready" accent="green" icon={<Target size={20} weight="duotone" />}
          delta={<span className="text-green">{totalLearners ? `${Math.round((readyLearners / totalLearners) * 100)}% readiness` : 'no learners yet'}</span>} />
        <StatCard value={mentorCount} label="Active Mentors" accent="amber" icon={<ChalkboardTeacher size={20} weight="duotone" />}
          delta={<span className="text-subtext0">distinct mentor IDs</span>} />
        <StatCard value={`${averageAttendance}%`} label="Avg Attendance" accent="mauve" icon={<ChartLineUp size={20} weight="duotone" />}
          delta={<span className="text-green">computed from learner list</span>} />
      </motion.div>

      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">Batch Overview</h2>
              <p className="text-xs text-overlay0 font-mono tracking-wide">Ready learner ratio by batch</p>
            </div>
            <button onClick={() => onNavigate('mentor')} className="px-4 py-2 rounded-xl text-xs font-semibold text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 transition-colors cursor-pointer">View All</button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-9 px-4 sm:px-6 lg:px-9">
            <table className="w-full border-collapse min-w-[400px]">
              <thead><tr>
                {['Batch', 'Learners', 'Ready', 'Status'].map((h) => (
                  <th key={h} className="text-xs font-semibold tracking-wider uppercase text-overlay0 px-6 py-4 text-left border-b border-surface0/50">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {isLoading && batchSummaries.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-sm text-overlay0 border-b border-surface0/30" colSpan={4}>Loading learners...</td>
                  </tr>
                ) : batchSummaries.length > 0 ? batchSummaries.map((batch) => (
                  <tr key={batch.name} className="hover:bg-base/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-text border-b border-surface0/30 font-medium">{batch.name}</td>
                    <td className="px-6 py-4 text-sm text-subtext1 border-b border-surface0/30">{batch.learners}</td>
                    <td className="px-6 py-4 text-sm text-subtext1 border-b border-surface0/30">{batch.ready}</td>
                    <td className="px-6 py-4 border-b border-surface0/30"><Badge variant={statusBadge[batch.status]}>{batch.status}</Badge></td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-6 py-8 text-sm text-overlay0 border-b border-surface0/30" colSpan={4}>No learner records available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">Batch Placement Readiness</h2>
            <p className="text-xs text-overlay0 font-mono tracking-wide">TOP BATCHES BY READY %</p>
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
              Load learner data to render the batch chart.
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={iV}>
        <Card>
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Add Learner', nav: 'addlearner' as ScreenId, icon: <Plus size={18} weight="bold" />, primary: true },
              { label: 'Upload CSV', nav: 'csvupload' as ScreenId, icon: <UploadSimple size={18} weight="bold" /> },
              { label: 'New Assessment', nav: 'assessment' as ScreenId, icon: <Exam size={18} weight="bold" /> },
              { label: 'AI Prediction', nav: 'prediction' as ScreenId, icon: <Lightning size={18} weight="bold" /> },
            ].map((a) => (
              <motion.button key={a.label} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate(a.nav)}
                className={`flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                  a.primary ? 'bg-blue text-crust shadow-[0_4px_20px_rgba(137,180,250,0.2)]'
                  : 'text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 hover:bg-surface0/20'
                }`}>
                {a.icon} {a.label}
              </motion.button>
            ))}
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
