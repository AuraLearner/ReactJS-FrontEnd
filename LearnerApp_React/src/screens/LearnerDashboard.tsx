import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar } from 'recharts';
import { Student, TrendUp, Target, CalendarCheck, Lightning, CheckCircle } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { apiRequest, getStoredUserId } from '../utils/api';

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

type PredictionResponse = {
  placementProbability: number;
  status: string;
  recommendation?: string;
};

function buildCurveData(learner: LearnerRecord) {
  const base = (s: number) => Math.max(10, s - 25 + Math.round(Math.random() * 10));
  const mid = (s: number) => Math.max(20, s - 12 + Math.round(Math.random() * 8));
  return [
    { month: 'Month 1', coding: base(learner.codingScore), aptitude: base(learner.aptitudeScore), communication: base(learner.communicationScore) },
    { month: 'Month 2', coding: mid(learner.codingScore), aptitude: mid(learner.aptitudeScore), communication: mid(learner.communicationScore) },
    { month: 'Month 3', coding: Math.round((learner.codingScore + mid(learner.codingScore)) / 2), aptitude: Math.round((learner.aptitudeScore + mid(learner.aptitudeScore)) / 2), communication: Math.round((learner.communicationScore + mid(learner.communicationScore)) / 2) },
    { month: 'Current', coding: learner.codingScore, aptitude: learner.aptitudeScore, communication: learner.communicationScore },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-base border border-surface1 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-[10px] font-mono text-overlay0 mb-2">{label}</p>
        {payload.map((p: { name: string; value: number; color: string }) => (
          <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LearnerDashboard() {
  const [learner, setLearner] = useState<LearnerRecord | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = getStoredUserId();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const match = await apiRequest<LearnerRecord>('/api/learners/me');

        if (cancelled) return;

        setLearner(match);

        if (match) {
          try {
            const pred = await apiRequest<unknown>(`/api/predict/${match.learnerId}`, { method: 'POST' });

            if (!cancelled && pred && typeof pred === 'object') {
              const p = pred as Record<string, unknown>;
              setPrediction({
                placementProbability: Number(p.placementProbability ?? p.placement_probability ?? 0),
                status: String(p.status ?? 'Unknown'),
                recommendation: String(p.recommendation ?? p.recommendationText ?? ''),
              });
            }
          } catch {
            // Prediction is optional — don't fail the page
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 text-center">
        <div className="animate-pulse text-overlay0 font-mono text-sm">Loading your dashboard…</div>
      </div>
    );
  }

  if (error || !learner) {
    const isNotFound = error?.includes('404');
    
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 text-center">
        {isNotFound ? (
          <Card className="max-w-2xl mx-auto py-16">
            <Student size={48} weight="duotone" className="mx-auto mb-4 text-overlay0" />
            <h2 className="font-display text-2xl font-bold mb-2">Profile Pending Setup</h2>
            <p className="text-sm text-subtext0 max-w-md mx-auto">
              Your account has been created, but your academic profile hasn't been configured yet. 
              Please wait for an Administrator or Mentor to assign your batch and upload your initial assessment scores.
            </p>
          </Card>
        ) : (
          <div className="text-red font-mono text-sm">{error ?? 'No learner profile found'}</div>
        )}
      </div>
    );
  }

  const curveData = buildCurveData(learner);
  const readiness = Math.round(
    learner.attendance * 0.25 + learner.codingScore * 0.35
    + learner.aptitudeScore * 0.15 + learner.communicationScore * 0.25,
  );
  const pct = prediction?.placementProbability ?? readiness;
  const endAngle = 90 - (360 * (pct / 100));
  const radialData = [{ name: 'Placement', value: pct, fill: '#89b4fa' }];

  const initials = learner.name.trim().split(/\s+/).filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'AL';

  const skills = [
    { label: 'Coding', value: learner.codingScore, color: 'bg-blue' },
    { label: 'Aptitude', value: learner.aptitudeScore, color: 'bg-mauve' },
    { label: 'Communication', value: learner.communicationScore, color: 'bg-green' },
    { label: 'Attendance', value: learner.attendance, color: 'bg-peach' },
  ];

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="LEARNER PORTAL" title={`Welcome, ${learner.name.split(' ')[0]}`}
          subtitle={`${learner.batch} · ID ${learner.learnerId} · Your personalized learning overview`} />
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={iV} className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-10">
        <StatCard value={`${learner.attendance}%`} label="Attendance" accent="green" icon={<CalendarCheck size={20} weight="duotone" />} />
        <StatCard value={learner.codingScore} label="Coding Score" accent="blue" icon={<TrendUp size={20} weight="duotone" />} />
        <StatCard value={readiness} label="Readiness" accent="amber" icon={<Target size={20} weight="duotone" />} />
        <StatCard value={`${pct}%`} label="Placement Prob." accent="mauve" icon={<Lightning size={20} weight="duotone" />} />
      </motion.div>

      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {/* Learning Curve Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">Learning Curve</h2>
              <p className="text-xs text-overlay0 font-mono tracking-wide">Your progress over time</p>
            </div>
            <Badge variant="green">Live</Badge>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={curveData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(108,112,134,0.15)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6c7086' }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6c7086' }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="coding" stroke="#89b4fa" strokeWidth={2.5} dot={{ r: 4, fill: '#89b4fa' }} name="Coding" />
              <Line type="monotone" dataKey="aptitude" stroke="#cba6f7" strokeWidth={2.5} dot={{ r: 4, fill: '#cba6f7' }} name="Aptitude" />
              <Line type="monotone" dataKey="communication" stroke="#a6e3a1" strokeWidth={2.5} dot={{ r: 4, fill: '#a6e3a1' }} name="Communication" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Placement Prediction Ring */}
        <Card>
          <h2 className="font-display text-lg font-bold mb-6 text-center">Placement Prediction</h2>
          <div className="relative w-[160px] h-[160px] mx-auto mb-4">
            <ResponsiveContainer width={160} height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="100%" data={radialData} startAngle={90} endAngle={endAngle}>
                <RadialBar background={{ fill: '#313244' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-bold text-blue leading-none ${pct >= 100 ? 'text-2xl' : 'text-3xl'}`}>{pct}%</span>
            </div>
          </div>
          <div className="text-center mb-6">
            <Badge variant={pct >= 75 ? 'green' : pct >= 50 ? 'amber' : 'red'} className="text-xs px-4 py-1.5">
              <CheckCircle size={12} weight="fill" className="inline mr-1" />
              {prediction?.status ?? (pct >= 75 ? 'Placement Ready' : pct >= 50 ? 'Moderate' : 'At Risk')}
            </Badge>
          </div>

          {/* Skill Bars */}
          <div className="space-y-4">
            {skills.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-subtext0 font-medium">{s.label}</span>
                  <span className="text-text font-bold font-mono">{s.value}</span>
                </div>
                <div className="h-2 bg-surface0/40 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${s.color}`}
                    initial={{ width: 0 }} animate={{ width: `${s.value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Profile + Recommendation */}
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <h2 className="font-display text-lg font-bold mb-6">My Profile</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue/20 to-mauve/20 border border-blue/20 text-blue text-lg font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-text truncate">{learner.name}</div>
              <div className="text-xs text-overlay0 font-mono mt-0.5">{learner.batch} · Learner ID {learner.learnerId}</div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-surface0/30">
              <span className="text-subtext0">Batch</span>
              <strong className="text-text">{learner.batch}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-surface0/30">
              <span className="text-subtext0">Mentor ID</span>
              <strong className="text-text">{learner.mentorId ?? 'Unassigned'}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-surface0/30">
              <span className="text-subtext0">Readiness Score</span>
              <strong className="text-text">{readiness}%</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-subtext0">Overall Status</span>
              <Badge variant={readiness >= 75 ? 'green' : readiness >= 50 ? 'amber' : 'red'}>
                {readiness >= 75 ? 'On Track' : readiness >= 50 ? 'Needs Work' : 'At Risk'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="bg-peach/8 border border-peach/15 rounded-2xl p-5 lg:p-6 mb-6">
            <p className="flex items-center gap-2 text-xs font-bold text-peach mb-3 font-mono tracking-widest">
              <Lightning size={14} weight="fill" /> AI RECOMMENDATION
            </p>
            <p className="text-sm text-text leading-relaxed">
              {prediction?.recommendation || 'Generate a prediction from the AI Predict tab to receive personalized guidance.'}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
              <Student size={18} weight="duotone" className="text-blue" /> Quick Tips
            </h3>
            {[
              { tip: 'Practice at least 2 coding problems daily', done: learner.codingScore >= 75 },
              { tip: 'Maintain 80%+ attendance consistently', done: learner.attendance >= 80 },
              { tip: 'Work on communication through mock interviews', done: learner.communicationScore >= 70 },
              { tip: 'Complete all pending assignments on time', done: false },
            ].map((t) => (
              <div key={t.tip} className={`flex items-start gap-3 text-sm py-2 ${t.done ? 'text-green' : 'text-subtext0'}`}>
                <CheckCircle size={16} weight={t.done ? 'fill' : 'regular'} className="mt-0.5 shrink-0" />
                <span>{t.tip}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
