import { useRef, useState, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { FileArrowUp, DownloadSimple, CheckCircle } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import { apiRequest } from '../utils/api';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const csvHeader = 'userId,name,batch,mentorId,attendance,codingScore,aptitudeScore,communicationScore';

const csvExampleRows = [
  '1,Rahul Sharma,JAVA_FS_2026,1,88,75,72,70',
  '2,Priya Patel,REACT_2026,2,92,82,88,85',
  '3,Arjun K,PYTHON_2026,3,60,65,58,60',
];

export default function CsvUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setMessage(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Choose a CSV file before uploading');
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await apiRequest<unknown>('/api/learners/upload', {
        method: 'POST',
        body: formData,
      });

      setMessage(typeof response === 'string' ? response : 'CSV uploaded successfully');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload CSV');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      csvHeader,
      '1,Rahul Sharma,JAVA_FS_2026,1,88,75,72,70',
      '2,Priya Patel,REACT_2026,2,92,82,88,85',
      '3,Arjun K,PYTHON_2026,3,60,65,58,60',
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = downloadUrl;
    anchor.download = 'learner-upload-template.csv';
    anchor.click();

    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 2 · UC-3" title="Upload Learners via CSV"
          subtitle="Bulk-import learners from a CSV file and map each row into the learner roster" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <motion.div className="border-2 border-dashed border-surface0/60 rounded-2xl p-6 sm:p-12 lg:p-14 text-center cursor-pointer transition-all hover:border-blue/40 hover:bg-blue/3 overflow-hidden"
            whileHover={{ scale: 1.01 }} onClick={handleBrowse}>
            <FileArrowUp size={56} weight="duotone" className="mx-auto mb-5 text-overlay1" />
            <p className="text-base text-subtext1 mb-2 font-medium">Drop your CSV file here or click to browse</p>
            <p className="text-xs text-overlay0 font-mono tracking-wide break-words px-2">{selectedFile ? selectedFile.name : 'choose_file.csv'} · Max 10MB · UTF-8 encoded</p>
            <p className="mt-3 text-[11px] text-overlay0 font-mono tracking-wide break-all leading-5 px-2">{csvHeader}</p>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
          </motion.div>
          <div className="mt-8 flex gap-4 items-center flex-wrap">
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={handleUpload} disabled={isUploading}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold bg-blue text-crust cursor-pointer shadow-[0_4px_20px_rgba(137,180,250,0.2)] disabled:cursor-not-allowed disabled:opacity-70">
              <FileArrowUp size={18} weight="bold" /> {isUploading ? 'Uploading...' : 'Upload & Process'}
            </motion.button>
            <button type="button" onClick={handleDownloadTemplate} className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 transition-colors cursor-pointer">
              <DownloadSimple size={16} weight="bold" /> Download Template
            </button>
          </div>
          {message || error ? (
            <div className={`mt-8 flex items-center gap-3 px-5 py-4 rounded-xl text-sm ${error ? 'bg-red/8 border border-red/20 text-red-200' : 'bg-green/8 border border-green/20 text-green'}`}>
              <CheckCircle size={22} weight="fill" />
              <span>{error ?? message}</span>
            </div>
          ) : null}
        </Card>
        <Card>
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-8">Expected CSV Format</h2>
          <div className="bg-crust/80 rounded-xl p-6 font-mono text-xs text-subtext0 leading-7 border border-surface0/40 overflow-hidden">
            <div className="text-blue font-semibold break-all leading-5">{csvHeader}</div>
            {csvExampleRows.map((row) => (
              <div key={row} className="break-words">{row.replaceAll(',', ', ')}</div>
            ))}
            <div className="text-overlay0">... 247 more rows</div>
          </div>
          <div className="mt-8 rounded-xl border border-surface0/40 bg-base/30 px-4 py-4 text-sm text-subtext0 leading-relaxed">
            Upload the CSV template to keep the learner import clean and consistent.
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
