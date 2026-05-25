import { motion } from 'framer-motion';
import { FileArrowUp, DownloadSimple, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const steps = [
  { n: '1', t: 'Spring Boot receives multipart/form-data', v: 'blue' as const },
  { n: '2', t: 'Core Java validates each row', v: 'blue' as const },
  { n: '3', t: 'Batch insert into PostgreSQL', v: 'blue' as const },
  { n: '4', t: 'Success / error report returned', v: 'green' as const },
];

export default function CsvUpload() {
  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 2 · UC-3" title="Upload Learners via CSV"
          subtitle="Bulk-import learners using Core Java batch processing · Technologies: Spring Boot + Core Java + PostgreSQL" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <motion.div className="border-2 border-dashed border-surface0/60 rounded-2xl p-10 sm:p-14 lg:p-16 text-center cursor-pointer transition-all hover:border-blue/40 hover:bg-blue/3"
            whileHover={{ scale: 1.01 }}>
            <FileArrowUp size={56} weight="duotone" className="mx-auto mb-5 text-overlay1" />
            <p className="text-base text-subtext1 mb-2 font-medium">Drop your CSV file here or click to browse</p>
            <p className="text-xs text-overlay0 font-mono tracking-wide">choose_file.csv · Max 10MB · UTF-8 encoded</p>
          </motion.div>
          <div className="mt-8 flex gap-4 items-center flex-wrap">
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold bg-blue text-crust cursor-pointer shadow-[0_4px_20px_rgba(137,180,250,0.2)]">
              <FileArrowUp size={18} weight="bold" /> Upload &amp; Process
            </motion.button>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 transition-colors cursor-pointer">
              <DownloadSimple size={16} weight="bold" /> Download Template
            </button>
          </div>
          <div className="mt-8 flex items-center gap-3 px-5 py-4 rounded-xl bg-green/8 border border-green/20 text-green text-sm">
            <CheckCircle size={22} weight="fill" />
            <span><strong>250 learners</strong> imported successfully · 0 errors</span>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-8">Expected CSV Format</h2>
          <div className="bg-crust/80 rounded-xl p-6 font-mono text-xs text-subtext0 leading-8 border border-surface0/40">
            <div className="text-blue font-semibold">name, email, batch, mentor, attendance, coding, communication</div>
            <div>Rahul Sharma, rahul@x.com, JAVA_FS_2026, John, 88, 75, 70</div>
            <div>Priya Patel, priya@x.com, REACT_2026, Priya, 92, 82, 88</div>
            <div>Arjun K, arjun@x.com, PYTHON_2026, Arun, 60, 65, 58</div>
            <div className="text-overlay0">... 247 more rows</div>
          </div>
          <div className="h-px bg-surface0/40 my-10" />
          <h3 className="font-display text-lg font-bold mb-6">Processing Pipeline</h3>
          <div className="space-y-4">
            {steps.map((s) => (
              <motion.div key={s.n} className="flex gap-4 items-center" whileHover={{ x: 6 }}>
                <Badge variant={s.v} className="w-8 justify-center">{s.n}</Badge>
                <ArrowRight size={14} className="text-overlay0 shrink-0" />
                <span className={`text-sm ${s.v === 'green' ? 'text-green font-medium' : 'text-subtext0'}`}>{s.t}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
