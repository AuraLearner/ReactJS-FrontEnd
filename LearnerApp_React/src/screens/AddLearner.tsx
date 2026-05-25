import { motion } from 'framer-motion';
import { User, Envelope, BookOpen, ChalkboardTeacher, Check, X as XIcon, Database, ArrowRight } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function AddLearner() {
  const inputCls = "w-full px-5 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all";
  const labelCls = "flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono";

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 2 · UC-2" title="Add Learner"
          subtitle="Register a new learner and assign them to a batch and mentor · API: POST /api/learners" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <Card className="lg:col-span-3">
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-10">Learner Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7 mb-8">
            <div><label className={labelCls}><User size={14} weight="bold" />Full Name</label><input className={inputCls} placeholder="Rahul Sharma" /></div>
            <div><label className={labelCls}><Envelope size={14} weight="bold" />Email Address</label><input className={inputCls} placeholder="rahul@example.com" /></div>
            <div><label className={labelCls}><BookOpen size={14} weight="bold" />Assign Batch</label>
              <select className={inputCls + " appearance-none cursor-pointer"}><option>JAVA_FS_2026</option><option>REACT_2026</option><option>PYTHON_2026</option></select></div>
            <div><label className={labelCls}><ChalkboardTeacher size={14} weight="bold" />Assign Mentor</label>
              <select className={inputCls + " appearance-none cursor-pointer"}><option>John Mentor</option><option>Priya Nair</option><option>Arun Kumar</option></select></div>
          </div>
          <div className="h-px bg-surface0/40 my-10" />
          <h3 className="font-display text-lg font-bold mb-8">Initial Assessment Scores</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-7 mb-10">
            {[{ l: 'Attendance %', p: '88' }, { l: 'Coding Score', p: '75' }, { l: 'Communication', p: '70' }].map((f) => (
              <div key={f.l}><label className={labelCls}>{f.l}</label><input className={inputCls} placeholder={f.p} /></div>
            ))}
          </div>
          <div className="flex gap-4">
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-green text-crust cursor-pointer shadow-[0_4px_20px_rgba(166,227,161,0.2)]">
              <Check size={18} weight="bold" /> Save Learner
            </motion.button>
            <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 transition-colors cursor-pointer">
              <XIcon size={16} /> Cancel
            </button>
          </div>
          <p className="mt-6 text-[10px] text-overlay0 font-mono tracking-widest flex items-center gap-2">
            <Database size={12} /> Storage: PostgreSQL · POST /api/learners
          </p>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
          <Card>
            <h2 className="font-display text-xl font-bold mb-8">Learner Preview</h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue/20 to-mauve/20 border border-blue/20 text-blue text-lg font-bold flex items-center justify-center shrink-0">RS</div>
              <div><div className="text-lg font-semibold">Rahul Sharma</div><div className="text-xs text-overlay0 font-mono mt-1">rahul@example.com</div></div>
            </div>
            <div className="flex gap-2.5 flex-wrap mb-8"><Badge variant="blue">JAVA_FS_2026</Badge><Badge variant="green">John Mentor</Badge></div>
            <div className="h-px bg-surface0/40 mb-7" />
            <div className="space-y-4 text-sm text-subtext0 font-mono">
              <div className="flex justify-between"><span>Attendance</span><strong className="text-text">88%</strong></div>
              <div className="flex justify-between"><span>Coding Score</span><strong className="text-text">75 / 100</strong></div>
              <div className="flex justify-between"><span>Communication</span><strong className="text-text">70 / 100</strong></div>
            </div>
          </Card>
          <Card>
            <h3 className="font-display text-base font-bold mb-6">Data Flow</h3>
            <div className="space-y-3">
              {[
                { t: 'Form Validation (Frontend)', c: 'text-green border-green/20 bg-green/5' },
                { t: 'POST /api/learners', c: 'text-subtext0 border-surface0/40 bg-base/40' },
                { t: 'Spring Boot processes', c: 'text-subtext0 border-surface0/40 bg-base/40' },
                { t: 'Store → PostgreSQL', c: 'text-subtext0 border-surface0/40 bg-base/40' },
                { t: 'Notification triggered', c: 'text-green border-green/20 bg-green/5' },
              ].map((s, i) => (
                <div key={s.t} className={`flex items-center gap-3 text-xs font-mono py-3 px-4 rounded-xl border ${s.c}`}>
                  <ArrowRight size={14} /> <span className="font-semibold mr-1">Step {i + 1}</span> {s.t}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
