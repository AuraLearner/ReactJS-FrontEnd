import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Code, MathOperations, ChatCircle, Microphone, CalendarBlank, Plus, User, CheckCircle } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { apiRequest } from '../utils/api';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const types = [
  { icon: <Code size={24} weight="duotone" />, name: 'Coding Test', desc: 'Algorithms, Data Structures, Problem Solving', status: 'Active', v: 'blue' as const },
  { icon: <MathOperations size={24} weight="duotone" />, name: 'Aptitude Test', desc: 'Quantitative, Logical Reasoning, Verbal', status: 'Active', v: 'green' as const },
  { icon: <ChatCircle size={24} weight="duotone" />, name: 'Communication', desc: 'Verbal, Written, Presentation Skills', status: 'Scheduled', v: 'amber' as const },
  { icon: <Microphone size={24} weight="duotone" />, name: 'Mock Interview', desc: 'HR + Technical Panel Simulation', status: 'Upcoming', v: 'red' as const },
];

const assessmentTypes = types.map((type) => type.name);

const defaultForm = {
  learnerId: '',
  type: 'Coding Test',
  score: '',
  totalMarks: '100',
  assessmentDate: '2026-05-22',
};

type AssessmentPayload = {
  learnerId: number;
  score: number;
  type: string;
  totalMarks: number;
  assessmentDate: string;
};

type SavedAssessment = AssessmentPayload & {
  assessmentId?: number;
};

export default function Assessment() {
  const inputCls = 'w-full px-5 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all';
  const labelCls = 'flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono';
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const learnerId = Number(form.learnerId);
      const score = Number(form.score);
      const totalMarks = Number(form.totalMarks);

      if (Number.isNaN(learnerId) || Number.isNaN(score) || Number.isNaN(totalMarks)) {
        throw new Error('Learner ID, score, and total marks must be numeric');
      }

      const payload: AssessmentPayload = {
        learnerId,
        score,
        type: form.type,
        totalMarks,
        assessmentDate: form.assessmentDate,
      };

      const savedAssessment = await apiRequest<SavedAssessment>('/api/assessments', {
        method: 'POST',
        body: payload,
      });

      setMessage(`Created assessment #${savedAssessment.assessmentId ?? 'pending'} for learner ${savedAssessment.learnerId}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 4 · UC-5" title="Create Assessment"
          subtitle="Define and assign assessments to batches · Actor: Mentor / Admin" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <form onSubmit={handleSubmit}>
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-10">Assessment Details</h2>
            <div className="space-y-7">
              <div>
                <label className={labelCls}>Assessment Type</label>
                <select className={inputCls + ' appearance-none cursor-pointer'} value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}>
                  {assessmentTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div><label className={labelCls}><User size={14} weight="bold" />Learner ID</label><input type="number" className={inputCls} value={form.learnerId} onChange={(event) => setForm((prev) => ({ ...prev, learnerId: event.target.value }))} placeholder="1" /></div>
                <div><label className={labelCls}>Score</label><input type="number" className={inputCls} value={form.score} onChange={(event) => setForm((prev) => ({ ...prev, score: event.target.value }))} placeholder="85" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div><label className={labelCls}>Total Marks</label><input type="number" className={inputCls} value={form.totalMarks} onChange={(event) => setForm((prev) => ({ ...prev, totalMarks: event.target.value }))} placeholder="100" /></div>
                <div><label className={labelCls}><CalendarBlank size={14} weight="bold" />Date</label>
                  <input type="date" value={form.assessmentDate} onChange={(event) => setForm((prev) => ({ ...prev, assessmentDate: event.target.value }))} className={inputCls} /></div>
              </div>
            </div>
            <div className="mt-10">
              <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold bg-blue text-crust cursor-pointer shadow-[0_4px_20px_rgba(137,180,250,0.2)] disabled:cursor-not-allowed disabled:opacity-70">
                <Plus size={18} weight="bold" /> {isSubmitting ? 'Creating...' : 'Create Assessment'}
              </motion.button>
            </div>
            {message || error ? (
              <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red/20 bg-red/10 text-red-200' : 'border-green/20 bg-green/10 text-green'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" />
                  <span>{error ?? message}</span>
                </div>
              </div>
            ) : null}
            <p className="mt-6 text-[10px] text-overlay0 font-mono tracking-widest">POST /api/assessments · Notification triggered on creation</p>
          </form>
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
