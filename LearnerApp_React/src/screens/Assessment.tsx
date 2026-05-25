import { motion } from 'framer-motion';
import { Code, MathOperations, ChatCircle, Microphone, CalendarBlank, Plus } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const types = [
  { icon: <Code size={24} weight="duotone" />, name: 'Coding Test', desc: 'Algorithms, Data Structures, Problem Solving', status: 'Active', v: 'blue' as const },
  { icon: <MathOperations size={24} weight="duotone" />, name: 'Aptitude', desc: 'Quantitative, Logical Reasoning, Verbal', status: 'Active', v: 'green' as const },
  { icon: <ChatCircle size={24} weight="duotone" />, name: 'Communication', desc: 'Verbal, Written, Presentation Skills', status: 'Scheduled', v: 'amber' as const },
  { icon: <Microphone size={24} weight="duotone" />, name: 'Mock Interview', desc: 'HR + Technical Panel Simulation', status: 'Upcoming', v: 'red' as const },
];

export default function Assessment() {
  const inputCls = "w-full px-5 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all";
  const labelCls = "flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono";

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 4 · UC-5" title="Create Assessment"
          subtitle="Define and assign assessments to batches · Actor: Mentor / Admin" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-10">Assessment Details</h2>
          <div className="space-y-7">
            <div><label className={labelCls}>Assessment Type</label>
              <select className={inputCls + " appearance-none cursor-pointer"}><option>Coding Test</option><option>Aptitude Test</option><option>Communication</option><option>Mock Interview</option></select></div>
            <div><label className={labelCls}>Assign to Batch</label>
              <select className={inputCls + " appearance-none cursor-pointer"}><option>JAVA_FS_2026</option><option>REACT_2026</option><option>PYTHON_2026</option></select></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div><label className={labelCls}>Total Marks</label><input className={inputCls} placeholder="100" /></div>
              <div><label className={labelCls}><CalendarBlank size={14} weight="bold" />Date</label>
                <input type="date" defaultValue="2026-05-22" className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Description / Instructions</label>
              <textarea className={inputCls + " resize-y"} rows={4} placeholder="Add assessment guidelines…" /></div>
          </div>
          <div className="mt-10">
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold bg-blue text-crust cursor-pointer shadow-[0_4px_20px_rgba(137,180,250,0.2)]">
              <Plus size={18} weight="bold" /> Create Assessment
            </motion.button>
          </div>
          <p className="mt-6 text-[10px] text-overlay0 font-mono tracking-widest">POST /api/assessments · Notification triggered on creation</p>
        </Card>
        <Card>
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-8">Assessment Types</h2>
          <div className="space-y-4 lg:space-y-5">
            {types.map((t) => (
              <motion.div key={t.name} whileHover={{ x: 6, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}
                className="flex items-center gap-5 p-5 lg:p-6 bg-base/50 rounded-2xl border border-surface0/40 hover:border-surface1/60 transition-colors cursor-pointer">
                <div className="text-overlay1 shrink-0">{t.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold mb-1">{t.name}</div>
                  <div className="text-xs text-overlay0 leading-relaxed">{t.desc}</div>
                </div>
                <Badge variant={t.v}>{t.status}</Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
