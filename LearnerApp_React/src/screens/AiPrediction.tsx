import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Lightning, CheckCircle } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import LearnerSearch from '../components/LearnerSearch';
import type { LearnerOption } from '../components/LearnerSearch';
import { apiRequest } from '../utils/api';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

type PredictionResponse = {
  placementProbability: number;
  status: string;
  recommendation?: string;
};

function normalizePredictionResponse(response: unknown): PredictionResponse {
  if (response && typeof response === 'object') {
    const payload = response as Record<string, unknown>;

    return {
      placementProbability: Number(
        payload.placementProbability ?? payload.placement_probability ?? 0,
      ),
      status: String(payload.status ?? 'Placement Ready'),
      recommendation: String(payload.recommendation ?? payload.recommendationText ?? ''),
    };
  }

  return {
    placementProbability: 0,
    status: 'Placement Ready',
    recommendation: '',
  };
}

function buildMetrics(learner: LearnerOption | null) {
  if (!learner) {
    return [
      { label: 'Attendance', pct: 0, display: '—', color: 'bg-green' },
      { label: 'Coding Score', pct: 0, display: '—', color: 'bg-blue' },
      { label: 'Communication', pct: 0, display: '—', color: 'bg-mauve' },
      { label: 'Mock Interview', pct: 0, display: '—', color: 'bg-peach' },
    ];
  }

  const mock = Math.round((learner.aptitudeScore + learner.communicationScore) / 2);

  return [
    { label: 'Attendance', pct: learner.attendance, display: `${learner.attendance}%`, color: 'bg-green' },
    { label: 'Coding Score', pct: learner.codingScore, display: `${learner.codingScore}/100`, color: 'bg-blue' },
    { label: 'Communication', pct: learner.communicationScore, display: `${learner.communicationScore}/100`, color: 'bg-mauve' },
    { label: 'Mock Interview', pct: mock, display: `${mock}/100`, color: 'bg-peach' },
  ];
}

export default function AiPrediction() {
  const [selectedLearner, setSelectedLearner] = useState<LearnerOption | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse>({
    placementProbability: 0,
    status: 'Awaiting Input',
    recommendation: 'Select a learner from the search to generate a prediction.',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metrics = buildMetrics(selectedLearner);
  const pct = prediction.placementProbability;
  const radialData = [{ name: 'Placement', value: pct, fill: '#89b4fa' }];
  const endAngle = 90 - (360 * (pct / 100));
  const statusVariant = prediction.status.toLowerCase().includes('ready')
    ? 'green'
    : prediction.status.toLowerCase().includes('moderate')
      ? 'amber'
      : prediction.status.toLowerCase().includes('awaiting')
        ? 'blue'
        : 'red';

  const handlePredict = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedLearner) {
      setError('Select a learner before generating a prediction');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<unknown>(`/api/predict/${selectedLearner.learnerId}`, {
        method: 'POST',
      });

      setPrediction(normalizePredictionResponse(response));
    } catch (predictError) {
      setError(predictError instanceof Error ? predictError.message : 'Unable to generate prediction');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name.trim().split(/\s+/).filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'AL';

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 5 · UC-6" title="AI Placement Prediction"
          subtitle="Spring Boot orchestrates the prediction call and returns the result for the selected learner"
          subtitleClassName="text-blue" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-8">Learner Prediction Input</h2>

          {/* Learner snapshot — dynamic from selection */}
          {selectedLearner ? (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-5 mb-8 p-4 sm:p-5 lg:p-6 bg-base/50 rounded-2xl border border-surface0/40">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue/20 to-mauve/20 border border-blue/20 text-blue text-base sm:text-lg font-bold flex items-center justify-center shrink-0">
                {getInitials(selectedLearner.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-lg font-bold truncate text-text">{selectedLearner.name}</div>
                <div className="text-[10px] sm:text-xs text-overlay0 font-mono mt-1 truncate">
                  {selectedLearner.batch} · ID {selectedLearner.learnerId}
                </div>
              </div>
              <Badge variant="blue" className="shrink-0 whitespace-nowrap">Batch: {selectedLearner.batch}</Badge>
            </div>
          ) : (
            <div className="mb-8 p-5 rounded-2xl border border-dashed border-surface0/50 text-center text-sm text-overlay0">
              Search and select a learner below to view their snapshot
            </div>
          )}

          {/* Searchable learner picker */}
          <form onSubmit={handlePredict} className="mb-10">
            <LearnerSearch
              value={selectedLearner}
              onChange={setSelectedLearner}
              label="Search Learner"
              placeholder="Type a name, batch, or ID…"
              className="mb-5"
            />
            <motion.button type="submit" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }} disabled={isLoading || !selectedLearner}
              className="w-full py-3.5 px-6 rounded-xl text-sm font-bold bg-gradient-to-r from-blue to-lavender text-crust cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_4px_24px_rgba(137,180,250,0.25)] disabled:cursor-not-allowed disabled:opacity-70">
              <Lightning size={18} weight="fill" /> {isLoading ? 'Generating…' : 'Generate Prediction'}
            </motion.button>
          </form>

          <div className="space-y-6 mb-10">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center gap-4">
                <div className="text-xs sm:text-sm text-subtext0 w-24 sm:w-32 lg:w-36 shrink-0 font-medium">{m.label}</div>
                <div className="flex-1 h-2.5 bg-surface0/40 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${m.color}`}
                    initial={{ width: 0 }} animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' as const }} />
                </div>
                <div className="font-mono text-xs sm:text-sm text-text min-w-[45px] sm:min-w-[55px] text-right font-bold">{m.display}</div>
              </div>
            ))}
          </div>
          {error ? (
            <div className="mb-8 rounded-xl border border-red/20 bg-red/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}
        </Card>

        <div className="bg-gradient-to-br from-blue/8 to-mauve/8 border border-blue/15 rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="text-center mb-10">
            <p className="font-mono text-[10px] text-overlay0 tracking-[4px] mb-6 uppercase">Placement Probability</p>
            <div className="relative w-[200px] h-[200px] mx-auto">
              <ResponsiveContainer width={200} height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="100%" data={radialData} startAngle={90} endAngle={endAngle}>
                  <RadialBar background={{ fill: '#313244' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className={`font-bold text-blue leading-none ${
                    prediction.placementProbability >= 100 ? 'text-3xl' : 'text-4xl sm:text-5xl'
                  }`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                >
                  {prediction.placementProbability}%
                </motion.div>
              </div>
            </div>
            <div className="mt-6"><Badge variant={statusVariant} className="text-xs px-5 py-2"><CheckCircle size={14} weight="fill" className="inline mr-1" />{prediction.status}</Badge></div>
          </div>

          <div className="h-px bg-surface0/40 my-10" />

          <div className="mb-10">
            <p className="text-xs text-overlay0 font-mono mb-4 tracking-widest">RESPONSE PAYLOAD</p>
            <div className="bg-crust/80 rounded-xl p-5 lg:p-6 border border-surface0/40 overflow-hidden">
              <div className="font-mono text-xs text-subtext0 leading-7 space-y-3 break-words">
                <div className="text-text">{`{`}</div>
                <div className="pl-4 sm:pl-6 break-words">
                  <span className="text-green">"placementProbability"</span>
                  <span className="text-text">: </span>
                  <span className="text-peach">{prediction.placementProbability}</span>
                </div>
                <div className="pl-4 sm:pl-6 break-words">
                  <span className="text-green">"status"</span>
                  <span className="text-text">: </span>
                  <span className="text-peach">"{prediction.status}"</span>
                </div>
                <div className="pl-4 sm:pl-6 break-words">
                  <span className="text-green">"recommendation"</span>
                  <span className="text-text">: </span>
                  <span className="text-peach break-words">
                    "{prediction.recommendation || 'Focus on DSA…'}"
                  </span>
                </div>
                <div className="text-text">{`}`}</div>
              </div>
            </div>
          </div>

          <div className="bg-peach/8 border border-peach/15 rounded-2xl p-6 lg:p-7 mb-10">
            <p className="flex items-center gap-2 text-xs font-bold text-peach mb-3 font-mono tracking-widest">
              <Lightning size={14} weight="fill" /> RECOMMENDATION
            </p>
            <p className="text-sm text-text leading-relaxed">
              {prediction.recommendation || 'Select a learner and generate a prediction to see the recommendation.'}
            </p>
          </div>

          <div className="rounded-2xl border border-surface0/40 bg-base/30 px-5 py-4 text-sm text-subtext0 leading-relaxed">
            {selectedLearner
              ? `Showing prediction for ${selectedLearner.name} (ID ${selectedLearner.learnerId}).`
              : 'Search for a learner above to get started.'}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
