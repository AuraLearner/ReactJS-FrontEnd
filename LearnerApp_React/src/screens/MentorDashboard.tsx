import { motion } from 'framer-motion';
import { UsersThree, Target, Warning, MagnifyingGlass, FunnelSimple, PencilSimple } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ScoreBar from '../components/ScoreBar';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const learners = [
  { initials: 'RS', name: 'Rahul Sharma', bg: 'bg-blue/12', color: 'text-blue', coding: 75, aptitude: 80, comm: 70, mock: 80, pred: '87% Ready', predV: 'green' as const },
  { initials: 'PP', name: 'Priya Patel', bg: 'bg-mauve/12', color: 'text-mauve', coding: 82, aptitude: 78, comm: 88, mock: 85, pred: '92% Ready', predV: 'green' as const },
  { initials: 'AK', name: 'Arjun Kumar', bg: 'bg-red/12', color: 'text-red', coding: 60, aptitude: 65, comm: 58, mock: 55, pred: '42% At Risk', predV: 'red' as const },
  { initials: 'SM', name: 'Sneha Mehta', bg: 'bg-green/12', color: 'text-green', coding: 91, aptitude: 88, comm: 94, mock: 90, pred: '96% Ready', predV: 'green' as const },
];

export default function MentorDashboard() {
  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 3 · UC-4" title="Mentor Dashboard"
          subtitle="View and update scores for your assigned learners · API: PUT /api/assessments/{id}" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-10">
        <StatCard value={12} label="Assigned Learners" accent="blue" icon={<UsersThree size={20} weight="duotone" />} />
        <StatCard value={8} label="Placement Ready" accent="green" icon={<Target size={20} weight="duotone" />} />
        <StatCard value={4} label="Need Attention" accent="amber" icon={<Warning size={20} weight="duotone" />} />
      </motion.div>
      <motion.div variants={iV}>
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">Assigned Learners</h2>
              <p className="text-xs text-overlay0 font-mono tracking-wide">BATCH: JAVA_FS_2026 · Mentor: John Mentor</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-overlay0" />
                <input className="pl-10 pr-4 py-2.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 w-[200px] sm:w-[220px] transition-all" placeholder="Search learner…" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 transition-colors cursor-pointer">
                <FunnelSimple size={14} /> Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto -mx-6 sm:-mx-8 lg:-mx-9 px-6 sm:px-8 lg:px-9">
            <table className="w-full border-collapse min-w-[850px]">
              <thead><tr>
                {['Learner', 'Coding', 'Aptitude', 'Communication', 'Mock Interview', 'Prediction', 'Action'].map((h) => (
                  <th key={h} className="font-mono text-[10px] font-medium tracking-widest uppercase text-overlay0 px-4 lg:px-5 py-4 text-left border-b border-surface0/50">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {learners.map((l) => (
                  <tr key={l.name} className="hover:bg-base/40 transition-colors group">
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl ${l.bg} ${l.color} text-xs font-bold flex items-center justify-center shrink-0`}>{l.initials}</div>
                        <span className="text-sm text-text font-semibold">{l.name}</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25 min-w-[130px]"><ScoreBar value={l.coding} color="bg-blue" /></td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25 min-w-[130px]"><ScoreBar value={l.aptitude} color="bg-mauve" /></td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25 min-w-[130px]"><ScoreBar value={l.comm} color="bg-green" /></td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25 min-w-[130px]"><ScoreBar value={l.mock} color="bg-peach" /></td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25"><Badge variant={l.predV}>{l.pred}</Badge></td>
                    <td className="px-4 lg:px-5 py-5 lg:py-6 border-b border-surface0/25">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-peach text-crust cursor-pointer shadow-[0_2px_10px_rgba(250,179,135,0.15)]">
                        <PencilSimple size={14} weight="bold" /> Update
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
