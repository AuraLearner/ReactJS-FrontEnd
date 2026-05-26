import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  IdentificationCard,
  BookOpen,
  ChalkboardTeacher,
  Check,
  X as XIcon,
} from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { apiRequest } from '../utils/api';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const batchOptions = ['JAVA_FS_2026', 'REACT_2026', 'PYTHON_2026'];

const mentorOptions = [
  { id: '1', name: 'John Mentor' },
  { id: '2', name: 'Priya Nair' },
  { id: '3', name: 'Arun Kumar' },
];

const defaultForm = {
  name: 'Rahul Sharma',
  userId: '',
  batch: 'JAVA_FS_2026',
  mentorId: '1',
  attendance: '88',
  codingScore: '75',
  aptitudeScore: '72',
  communicationScore: '70',
};

type LearnerPayload = {
  name: string;
  userId?: number;
  batch: string;
  mentorId: number;
  attendance: number;
  codingScore: number;
  aptitudeScore: number;
  communicationScore: number;
};

type SavedLearner = LearnerPayload & {
  learnerId?: number;
};

export default function AddLearner() {
  const inputCls = 'w-full px-5 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all';
  const labelCls = 'flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono';
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedMentor = mentorOptions.find((mentor) => mentor.id === form.mentorId);
  const previewInitials = form.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AL';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const numericFields = [
        form.mentorId,
        form.attendance,
        form.codingScore,
        form.aptitudeScore,
        form.communicationScore,
      ];

      if (numericFields.some((value) => Number.isNaN(Number(value)))) {
        throw new Error('Mentor and score fields must be numeric');
      }

      const payload: LearnerPayload = {
        name: form.name.trim(),
        batch: form.batch,
        mentorId: Number(form.mentorId),
        attendance: Number(form.attendance),
        codingScore: Number(form.codingScore),
        aptitudeScore: Number(form.aptitudeScore),
        communicationScore: Number(form.communicationScore),
      };

      if (form.userId.trim()) {
        payload.userId = Number(form.userId);
      }

      const savedLearner = await apiRequest<SavedLearner>('/api/learners', {
        method: 'POST',
        body: payload,
      });

      setMessage(`Saved ${savedLearner.name ?? payload.name} · learner #${savedLearner.learnerId ?? 'pending'}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save learner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(defaultForm);
    setMessage(null);
    setError(null);
  };

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 2 · UC-2" title="Add Learner"
          subtitle="Register a new learner and assign them to a batch and mentor · API: POST /api/learners" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <Card className="lg:col-span-3">
          <form onSubmit={handleSubmit}>
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-10">Learner Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7 mb-8">
              <div>
                <label className={labelCls}><User size={14} weight="bold" />Full Name</label>
                <input className={inputCls} value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Rahul Sharma" />
              </div>
              <div>
                <label className={labelCls}><IdentificationCard size={14} weight="bold" />User ID (optional)</label>
                <input type="number" className={inputCls} value={form.userId} onChange={(event) => setForm((prev) => ({ ...prev, userId: event.target.value }))} placeholder="101" />
              </div>
              <div>
                <label className={labelCls}><BookOpen size={14} weight="bold" />Assign Batch</label>
                <select className={inputCls + ' appearance-none cursor-pointer'} value={form.batch} onChange={(event) => setForm((prev) => ({ ...prev, batch: event.target.value }))}>
                  {batchOptions.map((batch) => <option key={batch}>{batch}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}><ChalkboardTeacher size={14} weight="bold" />Assign Mentor</label>
                <select className={inputCls + ' appearance-none cursor-pointer'} value={form.mentorId} onChange={(event) => setForm((prev) => ({ ...prev, mentorId: event.target.value }))}>
                  {mentorOptions.map((mentor) => <option key={mentor.id} value={mentor.id}>{mentor.id} · {mentor.name}</option>)}
                </select>
              </div>
            </div>
            <div className="h-px bg-surface0/40 my-10" />
            <h3 className="font-display text-lg font-bold mb-8">Initial Assessment Scores</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-7 mb-10">
              <div><label className={labelCls}>Attendance %</label><input type="number" className={inputCls} value={form.attendance} onChange={(event) => setForm((prev) => ({ ...prev, attendance: event.target.value }))} placeholder="88" /></div>
              <div><label className={labelCls}>Coding Score</label><input type="number" className={inputCls} value={form.codingScore} onChange={(event) => setForm((prev) => ({ ...prev, codingScore: event.target.value }))} placeholder="75" /></div>
              <div><label className={labelCls}>Aptitude Score</label><input type="number" className={inputCls} value={form.aptitudeScore} onChange={(event) => setForm((prev) => ({ ...prev, aptitudeScore: event.target.value }))} placeholder="72" /></div>
              <div><label className={labelCls}>Communication Score</label><input type="number" className={inputCls} value={form.communicationScore} onChange={(event) => setForm((prev) => ({ ...prev, communicationScore: event.target.value }))} placeholder="70" /></div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-green text-crust cursor-pointer shadow-[0_4px_20px_rgba(166,227,161,0.2)] disabled:cursor-not-allowed disabled:opacity-70">
                <Check size={18} weight="bold" /> {isSubmitting ? 'Saving...' : 'Save Learner'}
              </motion.button>
              <button type="button" onClick={handleReset} className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 transition-colors cursor-pointer">
                <XIcon size={16} /> Reset
              </button>
            </div>
            {message || error ? (
              <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red/20 bg-red/10 text-red-200' : 'border-green/20 bg-green/10 text-green'}`}>
                {error ?? message}
              </div>
            ) : null}
            <p className="mt-6 text-[10px] text-overlay0 font-mono tracking-widest">
              Saved learners will appear in the dashboard and mentor views.
            </p>
          </form>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
          <Card>
            <h2 className="font-display text-xl font-bold mb-8">Learner Preview</h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue/20 to-mauve/20 border border-blue/20 text-blue text-lg font-bold flex items-center justify-center shrink-0">{previewInitials}</div>
              <div>
                <div className="text-lg font-semibold text-text">{form.name}</div>
                <div className="text-xs text-overlay0 font-mono mt-1">{form.userId ? `User ID ${form.userId}` : 'User ID optional'}</div>
              </div>
            </div>
            <div className="flex gap-2.5 flex-wrap mb-8"><Badge variant="blue">{form.batch}</Badge><Badge variant="green">{selectedMentor?.name ?? 'Mentor'}</Badge></div>
            <div className="h-px bg-surface0/40 mb-7" />
            <div className="space-y-4 text-sm text-subtext0 font-mono">
              <div className="flex justify-between"><span>Attendance</span><strong className="text-text">{form.attendance}%</strong></div>
              <div className="flex justify-between"><span>Coding Score</span><strong className="text-text">{form.codingScore} / 100</strong></div>
              <div className="flex justify-between"><span>Aptitude Score</span><strong className="text-text">{form.aptitudeScore} / 100</strong></div>
              <div className="flex justify-between"><span>Communication</span><strong className="text-text">{form.communicationScore} / 100</strong></div>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
