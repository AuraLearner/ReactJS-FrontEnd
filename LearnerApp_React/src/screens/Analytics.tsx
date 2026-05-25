import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Users, Target, CalendarCheck, TrendUp, Trophy, Warning } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const placementData = [
  { month: 'DEC', rate: 45 }, { month: 'JAN', rate: 52 }, { month: 'FEB', rate: 58 },
  { month: 'MAR', rate: 67 }, { month: 'APR', rate: 75 }, { month: 'MAY', rate: 90 },
];
const attendanceData = [
  { month: 'DEC', rate: 88 }, { month: 'JAN', rate: 90 }, { month: 'FEB', rate: 85 },
  { month: 'MAR', rate: 92 }, { month: 'APR', rate: 94 }, { month: 'MAY', rate: 96 },
];
const topPerformers = [
  { rank: '#1', initials: 'SM', name: 'Sneha Mehta', batch: 'JAVA_FS_2026', score: '96%', bg: 'bg-green/12', color: 'text-green' },
  { rank: '#2', initials: 'PP', name: 'Priya Patel', batch: 'REACT_2026', score: '92%', bg: 'bg-mauve/12', color: 'text-mauve' },
  { rank: '#3', initials: 'RS', name: 'Rahul Sharma', batch: 'JAVA_FS_2026', score: '87%', bg: 'bg-blue/12', color: 'text-blue' },
];
const atRisk = [
  { initials: 'AK', name: 'Akash Kumar', batch: 'PYTHON_2026', score: '32%', bg: 'bg-red/12', color: 'text-red', v: 'red' as const },
  { initials: 'RS', name: 'Rohan S.', batch: 'DSA_BOOT', score: '38%', bg: 'bg-red/12', color: 'text-red', v: 'red' as const },
  { initials: 'AK', name: 'Arjun Kumar', batch: 'JAVA_FS_2026', score: '42%', bg: 'bg-peach/12', color: 'text-peach', v: 'amber' as const },
];

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
  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 6 · UC-7" title="Analytics Dashboard"
          subtitle="Admin view of placement trends, attendance patterns, and batch performance" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-10">
        <StatCard value={520} label="Total Learners" accent="blue" icon={<Users size={20} weight="duotone" />} />
        <StatCard value={320} label="Placement Ready" accent="green" icon={<Target size={20} weight="duotone" />} />
        <StatCard value="94%" label="Avg Attendance" accent="amber" icon={<CalendarCheck size={20} weight="duotone" />} />
        <StatCard value="61.5%" label="Placement Rate" accent="mauve" icon={<TrendUp size={20} weight="duotone" />} />
      </motion.div>

      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold">Placement Trend</h2>
            <Badge variant="green">↑ Improving</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={placementData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6c7086' }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(137,180,250,0.04)' }} />
              <Bar dataKey="rate" fill="#89b4fa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold">Attendance Trend</h2>
            <Badge variant="blue">Stable</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a6e3a1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a6e3a1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6c7086' }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="rate" stroke="#a6e3a1" strokeWidth={2} fill="url(#greenGrad)" />
            </AreaChart>
          </ResponsiveContainer>
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
            {topPerformers.map((p) => (
              <motion.div key={p.rank + p.name} className="flex items-center gap-5 p-5 rounded-2xl hover:bg-base/50 transition-colors" whileHover={{ x: 6 }}>
                <div className="font-mono text-sm text-peach w-7 font-bold">{p.rank}</div>
                <div className={`w-12 h-12 rounded-xl ${p.bg} ${p.color} text-sm font-bold flex items-center justify-center shrink-0`}>{p.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold">{p.name}</div>
                  <div className="text-xs text-overlay0 mt-1 font-medium">{p.batch}</div>
                </div>
                <Badge variant="green">{p.score}</Badge>
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
            {atRisk.map((p, i) => (
              <motion.div key={i} className="flex items-center gap-5 p-5 rounded-2xl hover:bg-base/50 transition-colors" whileHover={{ x: 6 }}>
                <div className={`w-12 h-12 rounded-xl ${p.bg} ${p.color} text-sm font-bold flex items-center justify-center shrink-0`}>{p.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold">{p.name}</div>
                  <div className="text-xs text-overlay0 mt-1 font-medium">{p.batch}</div>
                </div>
                <Badge variant={p.v}>{p.score}</Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
