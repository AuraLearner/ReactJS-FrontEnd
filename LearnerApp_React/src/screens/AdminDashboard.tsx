import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Target, ChalkboardTeacher, ChartLineUp, Plus, UploadSimple, Exam, Lightning } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import type { ScreenId } from '../components/Navbar';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const batches = [
  { name: 'JAVA_FS_2026', learners: 180, ready: 112, status: 'Active' as const },
  { name: 'REACT_2026', learners: 140, ready: 98, status: 'Active' as const },
  { name: 'PYTHON_2026', learners: 120, ready: 67, status: 'In Progress' as const },
  { name: 'DSA_BOOT', learners: 80, ready: 43, status: 'New' as const },
];
const statusBadge = { Active: 'green', 'In Progress': 'amber', New: 'blue' } as const;
const chartData = [
  { month: 'DEC', rate: 45 }, { month: 'JAN', rate: 52 }, { month: 'FEB', rate: 58 },
  { month: 'MAR', rate: 67 }, { month: 'APR', rate: 75 }, { month: 'MAY', rate: 90 },
];

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
  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 1" title="Admin Dashboard" subtitle="Overview of all learners, mentors, and placement activity" />
      </motion.div>

      <motion.div variants={iV} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-10">
        <StatCard value={520} label="Total Learners" accent="blue" icon={<Users size={20} weight="duotone" />}
          delta={<span className="text-green">↑ 42 this month</span>} />
        <StatCard value={320} label="Placement Ready" accent="green" icon={<Target size={20} weight="duotone" />}
          delta={<span className="text-green">↑ 61.5% rate</span>} />
        <StatCard value={18} label="Active Mentors" accent="amber" icon={<ChalkboardTeacher size={20} weight="duotone" />}
          delta={<span className="text-subtext0">across 6 batches</span>} />
        <StatCard value="94%" label="Avg Attendance" accent="mauve" icon={<ChartLineUp size={20} weight="duotone" />}
          delta={<span className="text-green">↑ 3% vs last month</span>} />
      </motion.div>

      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">Batch Overview</h2>
              <p className="text-xs text-overlay0 font-mono tracking-wide">JAVA_FS_2026 · REACT_2026 · PYTHON_2026</p>
            </div>
            <button className="px-4 py-2 rounded-xl text-xs font-semibold text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 transition-colors cursor-pointer">View All</button>
          </div>
          <div className="overflow-x-auto -mx-6 sm:-mx-8 lg:-mx-9 px-6 sm:px-8 lg:px-9">
            <table className="w-full border-collapse min-w-[400px]">
              <thead><tr>
                {['Batch', 'Learners', 'Ready', 'Status'].map((h) => (
                  <th key={h} className="text-xs font-semibold tracking-wider uppercase text-overlay0 px-6 py-4 text-left border-b border-surface0/50">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.name} className="hover:bg-base/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-text border-b border-surface0/30 font-medium">{b.name}</td>
                    <td className="px-6 py-4 text-sm text-subtext1 border-b border-surface0/30">{b.learners}</td>
                    <td className="px-6 py-4 text-sm text-subtext1 border-b border-surface0/30">{b.ready}</td>
                    <td className="px-6 py-4 border-b border-surface0/30"><Badge variant={statusBadge[b.status]}>{b.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">Placement Trend</h2>
            <p className="text-xs text-overlay0 font-mono tracking-wide">LAST 6 MONTHS</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6c7086' }} />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(137,180,250,0.04)' }} />
              <Bar dataKey="rate" fill="#89b4fa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-overlay0 font-mono mt-5 tracking-wide">Placement-ready % by month</p>
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
    </motion.div>
  );
}
