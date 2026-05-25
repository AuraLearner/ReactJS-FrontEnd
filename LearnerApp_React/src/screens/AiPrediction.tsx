import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Lightning, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const metrics = [
  { label: 'Attendance', pct: 88, display: '88%', color: 'bg-green' },
  { label: 'Coding Score', pct: 82, display: '82/100', color: 'bg-blue' },
  { label: 'Communication', pct: 76, display: '76/100', color: 'bg-mauve' },
  { label: 'Mock Interview', pct: 80, display: '80/100', color: 'bg-peach' },
];
const radialData = [{ name: 'Placement', value: 87, fill: '#89b4fa' }];
const techFlow = [
  { label: 'Spring Boot', sub: 'Collects Metrics', color: 'text-text' },
  { label: 'Python ML', sub: 'Predicts Readiness', color: 'text-blue' },
  { label: 'PostgreSQL', sub: 'Stores Result', color: 'text-green' },
];

export default function AiPrediction() {
  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 5 · UC-6" title="AI Placement Prediction"
          subtitle="ML model predicts placement readiness from learner metrics · Python API: POST /predict" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-8">Learner Metrics Input</h2>
          <div className="flex items-center gap-5 mb-10 p-5 lg:p-6 bg-base/50 rounded-2xl border border-surface0/40">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue/20 to-mauve/20 border border-blue/20 text-blue text-lg font-bold flex items-center justify-center shrink-0">RS</div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold">Rahul Sharma</div>
              <div className="text-xs text-overlay0 font-mono mt-1">JAVA_FS_2026 · Mentor: John</div>
            </div>
            <Badge variant="blue" className="hidden sm:inline-flex">Batch: Active</Badge>
          </div>
          <div className="space-y-6 mb-10">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center gap-4">
                <div className="text-sm text-subtext0 w-32 lg:w-36 shrink-0 font-medium">{m.label}</div>
                <div className="flex-1 h-2.5 bg-surface0/40 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${m.color}`}
                    initial={{ width: 0 }} animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' as const }} />
                </div>
                <div className="font-mono text-sm text-text min-w-[55px] text-right font-bold">{m.display}</div>
              </div>
            ))}
          </div>
          <div className="p-5 lg:p-6 bg-crust/80 rounded-xl border border-surface0/40 mb-8">
            <p className="text-[10px] text-overlay0 font-mono mb-4 tracking-widest">REQUEST PAYLOAD → POST /predict</p>
            <pre className="font-mono text-xs text-subtext0 leading-8">
{`{
  `}<span className="text-blue">"attendance"</span>{`: 88,
  `}<span className="text-blue">"coding_score"</span>{`: 82,
  `}<span className="text-blue">"communication"</span>{`: 76,
  `}<span className="text-blue">"mock_interview"</span>{`: 80
}`}
            </pre>
          </div>
          <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-blue to-lavender text-crust cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_4px_24px_rgba(137,180,250,0.25)]">
            <Lightning size={18} weight="fill" /> Generate Prediction
          </motion.button>
        </Card>

        <div className="bg-gradient-to-br from-blue/8 to-mauve/8 border border-blue/15 rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="text-center mb-10">
            <p className="font-mono text-[10px] text-overlay0 tracking-[4px] mb-6 uppercase">Placement Probability</p>
            <div className="relative inline-block mx-auto">
              <ResponsiveContainer width={220} height={220}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar background={{ fill: '#313244' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div className="font-display text-5xl lg:text-6xl font-bold text-blue"
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}>87%</motion.div>
              </div>
            </div>
            <div className="mt-6"><Badge variant="green" className="text-xs px-5 py-2"><CheckCircle size={14} weight="fill" className="inline mr-1" />Placement Ready</Badge></div>
          </div>

          <div className="h-px bg-surface0/40 my-10" />

          <div className="mb-10">
            <p className="text-xs text-overlay0 font-mono mb-4 tracking-widest">RESPONSE PAYLOAD</p>
            <div className="bg-crust/80 rounded-xl p-5 lg:p-6 border border-surface0/40">
              <pre className="font-mono text-xs text-subtext0 leading-8">
{`{
  `}<span className="text-green">"placement_probability"</span>{`: 87,
  `}<span className="text-green">"status"</span>{`: `}<span className="text-peach">"Placement Ready"</span>{`,
  `}<span className="text-green">"recommendation"</span>{`: `}<span className="text-peach">"Focus on DSA…"</span>{`
}`}
              </pre>
            </div>
          </div>

          <div className="bg-peach/8 border border-peach/15 rounded-2xl p-6 lg:p-7 mb-10">
            <p className="flex items-center gap-2 text-xs font-bold text-peach mb-3 font-mono tracking-widest">
              <Lightning size={14} weight="fill" /> RECOMMENDATION
            </p>
            <p className="text-sm text-text leading-relaxed">
              Focus on DSA and Mock Interviews. Improve problem-solving speed for top product companies.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 items-center">
            {techFlow.map((t, i) => (
              <div key={t.label} className="contents">
                <div className="text-center p-4 lg:p-5 bg-mantle rounded-xl border border-surface0/40">
                  <div className={`font-display text-base lg:text-lg font-bold ${t.color} mb-1`}>{t.label}</div>
                  <div className="text-[9px] text-overlay0 font-mono tracking-wide">{t.sub}</div>
                </div>
                {i < techFlow.length - 1 && <ArrowRight size={16} className="text-overlay0 mx-auto col-start-auto hidden" />}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
