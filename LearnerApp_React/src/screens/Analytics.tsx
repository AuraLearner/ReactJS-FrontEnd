import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Users, Target, CalendarCheck, TrendUp, Trophy, Warning } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { apiRequest } from '../utils/api';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
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

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function isPlacementReady(learner: LearnerRecord): boolean {
  return learner.attendance >= 75 && learner.codingScore >= 75 && learner.communicationScore >= 70;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (<div className="bg-base border border-surface1 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-[10px] font-mono text-overlay0 mb-1">{label}</p>
      <p className="text-sm font-bold text-text">{payload[0].value}%</p>
    </div>);
  }
  return null;
};

export default function Analytics() {
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [topLearners, setTopLearners] = useState<LearnerRecord[]>([]);
  const [weakLearners, setWeakLearners] = useState<LearnerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [averageScoreResponse, topLearnersResponse, weakLearnersResponse] = await Promise.all([
          apiRequest<number>('/api/analytics/average-score'),
          apiRequest<LearnerRecord[]>('/api/analytics/top-learners'),
          apiRequest<LearnerRecord[]>('/api/analytics/weak-learners'),
        ]);

        if (!cancelled) {
          setAverageScore(typeof averageScoreResponse === 'number' ? averageScoreResponse : Number(averageScoreResponse));
          setTopLearners(Array.isArray(topLearnersResponse) ? topLearnersResponse : []);
          setWeakLearners(Array.isArray(weakLearnersResponse) ? weakLearnersResponse : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load analytics');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalLearners = topLearners.length;
  const readyLearners = topLearners.filter(isPlacementReady).length;
  const topChartData = topLearners.slice(0, 6).map((learner) => ({
    name: learner.name.split(' ')[0],
    score: learner.codingScore,
  }));
  const weakChartData = weakLearners.slice(0, 6).map((learner) => ({
    name: learner.name.split(' ')[0],
    score: learner.attendance,
  }));

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 6 · UC-7" title="Analytics Dashboard"
          subtitle="Admin view of placement trends, attendance patterns, and batch performance" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-10">
        <StatCard value={totalLearners} label="Total Learners" accent="blue" icon={<Users size={20} weight="duotone" />} />
        <StatCard value={readyLearners} label="Placement Ready" accent="green" icon={<Target size={20} weight="duotone" />} />
        <StatCard value={averageScore ? averageScore.toFixed(1) : '0.0'} label="Avg Coding Score" accent="amber" icon={<CalendarCheck size={20} weight="duotone" />} />
        <StatCard value={weakLearners.length} label="Needs Attention" accent="mauve" icon={<TrendUp size={20} weight="duotone" />} />
      </motion.div>

      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold">Top Coding Scores</h2>
            <Badge variant="green">Live Analytics</Badge>
          </div>
          {topChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topChartData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6c7086' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(137,180,250,0.04)' }} />
                <Bar dataKey="score" fill="#89b4fa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center rounded-xl border border-dashed border-surface0/50 text-sm text-overlay0">
              {isLoading ? 'Loading analytics...' : 'No top learner data available.'}
            </div>
          )}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold">Attendance Watchlist</h2>
            <Badge variant="blue">Risk Review</Badge>
          </div>
          {weakChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weakChartData}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a6e3a1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a6e3a1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6c7086' }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#a6e3a1" strokeWidth={2} fill="url(#greenGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center rounded-xl border border-dashed border-surface0/50 text-sm text-overlay0">
              {isLoading ? 'Loading analytics...' : 'No at-risk learner data available.'}
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-3">
              <Trophy size={22} weight="duotone" className="text-peach" /> Top Performers
            </h2>
            <Badge variant="green">Top 5</Badge>
          </div>
          <div className="space-y-3">
            {topLearners.slice(0, 5).map((learner, index) => (
              <motion.div key={learner.learnerId} className="flex items-center gap-3 sm:gap-5 p-3 sm:p-5 rounded-2xl hover:bg-base/50 transition-colors" whileHover={{ x: 4 }}>
                <div className="font-mono text-sm text-peach w-7 font-bold">#{index + 1}</div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${index === 0 ? 'bg-green/12 text-green' : index === 1 ? 'bg-mauve/12 text-mauve' : 'bg-blue/12 text-blue'} text-xs sm:text-sm font-bold flex items-center justify-center shrink-0`}>{getInitials(learner.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text font-semibold truncate">{learner.name}</div>
                  <div className="text-xs text-overlay0 mt-1 font-medium">{learner.batch}</div>
                </div>
                <Badge variant="green">{learner.codingScore}%</Badge>
              </motion.div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-3">
              <Warning size={22} weight="duotone" className="text-red" /> Needs Attention
            </h2>
            <Badge variant="red">At Risk</Badge>
          </div>
          <div className="space-y-3">
            {weakLearners.slice(0, 5).map((learner) => (
              <motion.div key={learner.learnerId} className="flex items-center gap-3 sm:gap-5 p-3 sm:p-5 rounded-2xl hover:bg-base/50 transition-colors" whileHover={{ x: 4 }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red/12 text-red text-xs sm:text-sm font-bold flex items-center justify-center shrink-0">{getInitials(learner.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text font-semibold truncate">{learner.name}</div>
                  <div className="text-xs text-overlay0 mt-1 font-medium">{learner.batch}</div>
                </div>
                <Badge variant="red">{learner.codingScore}%</Badge>
              </motion.div>
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
