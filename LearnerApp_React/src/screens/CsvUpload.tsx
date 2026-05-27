import { useRef, useState, useEffect, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileArrowUp, DownloadSimple, CheckCircle, Warning, CaretRight, X } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { apiRequest } from '../utils/api';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const csvHeader = 'email,name,batch,mentorId,attendance,codingScore,aptitudeScore,communicationScore';

const csvExampleRows = [
  'rahul.s@example.com,Rahul Sharma,JAVA_FS_2026,1,88,75,72,70',
  'priya.p@example.com,Priya Patel,REACT_2026,2,92,82,88,85',
  'arjun.k@example.com,Arjun K,PYTHON_2026,3,60,65,58,60',
];

interface CsvRow {
  email: string; name: string; batch: string; mentorId: string;
  attendance: string; codingScore: string; aptitudeScore: string; communicationScore: string;
  originalLine: string;
  errors: string[];
}

export default function CsvUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validation State
  const [availableMentors, setAvailableMentors] = useState<{id: number, name: string}[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([]);
  const [invalidRows, setInvalidRows] = useState<CsvRow[]>([]);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const mentors = await apiRequest<{id: number, name: string}[]>('/api/users/mentors');
        setAvailableMentors(mentors);
      } catch (err) { console.error(err); }
      try {
        const batches = await apiRequest<string[]>('/api/learners/batches');
        setAvailableBatches(batches);
      } catch (err) { console.error(err); }
    };
    fetchDropdownData();
  }, []);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setMessage(null);
    setError(null);
    setShowReview(false);
    setInvalidRows([]);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    const dataRows = lines.slice(1); // skip header
    const rows: CsvRow[] = [];
    const invalids: CsvRow[] = [];
    
    const mentorIds = availableMentors.map(m => m.id.toString());

    dataRows.forEach(line => {
      const cols = line.split(',');
      if (cols.length < 8) return; // skip malformed completely
      
      const [email, name, batch, mentorId, att, cod, apt, comm] = cols.map(c => c.trim());
      const rowErrors: string[] = [];
      
      if (batch && !availableBatches.includes(batch)) {
        rowErrors.push('Unrecognized Batch');
      }
      if (mentorId && !mentorIds.includes(mentorId)) {
        rowErrors.push('Invalid Mentor ID');
      }
      
      const rowObj: CsvRow = { email, name, batch, mentorId, attendance: att, codingScore: cod, aptitudeScore: apt, communicationScore: comm, originalLine: line, errors: rowErrors };
      rows.push(rowObj);
      if (rowErrors.length > 0) {
        invalids.push(rowObj);
      }
    });
    
    return { rows, invalids };
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError('Choose a CSV file before uploading');
      return;
    }

    try {
      const text = await selectedFile.text();
      const { rows, invalids } = parseCSV(text);
      
      setParsedRows(rows);
      
      if (invalids.length > 0) {
        setInvalidRows(invalids);
        setShowReview(true);
        return;
      }
      
      // If valid, upload directly
      await processUpload(selectedFile);
    } catch (err) {
      setError('Failed to parse CSV file.');
    }
  };

  const handleFixRow = (index: number, field: 'batch' | 'mentorId', value: string) => {
    setInvalidRows(prev => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      
      // Re-evaluate errors for this row
      const mentorIds = availableMentors.map(m => m.id.toString());
      const newErrors = [];
      if (newRows[index].batch && !availableBatches.includes(newRows[index].batch) && newRows[index].batch !== 'NEW_BATCH_OVERRIDE') {
        newErrors.push('Unrecognized Batch');
      }
      if (newRows[index].mentorId && !mentorIds.includes(newRows[index].mentorId)) {
        newErrors.push('Invalid Mentor ID');
      }
      newRows[index].errors = newErrors;
      
      return newRows;
    });
  };

  const handleConfirmAndUpload = async () => {
    // Generate new CSV content
    let finalCsv = csvHeader + '\n';
    
    // Merge valid rows and fixed invalid rows
    const allFinalRows = parsedRows.map(pr => {
      const fixedMatch = invalidRows.find(ir => ir.email === pr.email); // using email as unique key for simplicity
      const rowToUse = fixedMatch || pr;
      return `${rowToUse.email},${rowToUse.name},${rowToUse.batch === 'NEW_BATCH_OVERRIDE' ? pr.batch : rowToUse.batch},${rowToUse.mentorId},${rowToUse.attendance},${rowToUse.codingScore},${rowToUse.aptitudeScore},${rowToUse.communicationScore}`;
    });
    
    finalCsv += allFinalRows.join('\n');
    
    const blob = new Blob([finalCsv], { type: 'text/csv' });
    const fixedFile = new File([blob], selectedFile!.name, { type: 'text/csv' });
    
    setShowReview(false);
    await processUpload(fixedFile);
  };

  const processUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const response = await apiRequest<unknown>('/api/learners/upload', {
        method: 'POST',
        body: formData,
      });

      setMessage(typeof response === 'string' ? response : 'CSV uploaded successfully');
      setSelectedFile(null); // Clear on success
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

  if (showReview) {
    return (
      <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setShowReview(false)} className="p-2 hover:bg-surface0 rounded-xl transition-colors text-subtext0"><X size={24} /></button>
          <div>
            <h1 className="font-display text-2xl font-bold text-text">Review Data Anomalies</h1>
            <p className="text-sm text-subtext0">We found unrecognized batches or invalid mentor IDs in your CSV. Please map them to valid records below.</p>
          </div>
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-surface0/60 text-[11px] font-mono text-overlay0 uppercase tracking-widest bg-surface0/20">
                <th className="py-4 px-4 font-semibold">Row Data</th>
                <th className="py-4 px-4 font-semibold w-1/3">Batch Mapping</th>
                <th className="py-4 px-4 font-semibold w-1/3">Mentor Mapping</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-text divide-y divide-surface0/40">
              {invalidRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface0/20 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      {row.errors.includes('Unrecognized Batch') && <Badge variant="amber">Batch: {row.batch}</Badge>}
                      {row.errors.includes('Invalid Mentor ID') && <Badge variant="red">Mentor: {row.mentorId}</Badge>}
                      {row.errors.length === 0 && <Badge variant="green">Resolved</Badge>}
                    </div>
                    <div className="font-medium text-text mt-2">{row.name}</div>
                    <div className="text-xs text-subtext0">{row.email}</div>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={row.errors.includes('Unrecognized Batch') ? '' : (row.batch === 'NEW_BATCH_OVERRIDE' ? 'NEW_BATCH_OVERRIDE' : row.batch)}
                      onChange={(e) => handleFixRow(idx, 'batch', e.target.value)}
                      className={`w-full bg-surface0/30 text-text border ${row.errors.includes('Unrecognized Batch') ? 'border-amber/50 ring-1 ring-amber/20' : 'border-surface1/60'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue/50 focus:ring-2 focus:ring-blue/20 transition-all appearance-none cursor-pointer`}
                    >
                      <option value="" disabled className="bg-base text-overlay0">Select Valid Batch</option>
                      {availableBatches.map(b => (
                        <option key={b} value={b} className="bg-base text-text">{b}</option>
                      ))}
                      <option value="NEW_BATCH_OVERRIDE" className="bg-base text-blue font-semibold">Create as New Batch</option>
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={row.errors.includes('Invalid Mentor ID') ? '' : row.mentorId}
                      onChange={(e) => handleFixRow(idx, 'mentorId', e.target.value)}
                      className={`w-full bg-surface0/30 text-text border ${row.errors.includes('Invalid Mentor ID') ? 'border-red/50 ring-1 ring-red/20' : 'border-surface1/60'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue/50 focus:ring-2 focus:ring-blue/20 transition-all appearance-none cursor-pointer`}
                    >
                      <option value="" disabled className="bg-base text-overlay0">Select Valid Mentor</option>
                      {availableMentors.map(m => (
                        <option key={m.id} value={m.id.toString()} className="bg-base text-text">{m.name} (ID: {m.id})</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-8 flex justify-end">
            <motion.button 
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleConfirmAndUpload}
              disabled={invalidRows.some(r => r.errors.length > 0)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue text-crust shadow-[0_4px_20px_rgba(137,180,250,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale transition-all"
            >
              Confirm and Upload <CaretRight size={16} weight="bold" />
            </motion.button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 2 · UC-3" title="Upload Learners via CSV"
          subtitle="Bulk-import learners from a CSV file and map each row into the learner roster" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <motion.div className={`border-2 border-dashed rounded-2xl p-6 sm:p-12 lg:p-14 text-center cursor-pointer transition-all overflow-hidden ${
            selectedFile ? 'border-green/40 bg-green/3' : 'border-surface0/60 hover:border-blue/40 hover:bg-blue/3'
          }`}
            whileHover={{ scale: 1.01 }} onClick={handleBrowse}>
            {selectedFile ? (
              <>
                <CheckCircle size={48} weight="duotone" className="mx-auto mb-4 text-green" />
                <p className="text-base text-text font-semibold mb-1 truncate px-2">{selectedFile.name}</p>
                <p className="text-xs text-overlay0 font-mono tracking-wide mb-3">
                  {(selectedFile.size / 1024).toFixed(1)} KB · Ready to review
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="text-[11px] text-red font-semibold hover:text-red/80 transition-colors cursor-pointer"
                >
                  Remove file
                </button>
              </>
            ) : (
              <>
                <FileArrowUp size={56} weight="duotone" className="mx-auto mb-5 text-overlay1" />
                <p className="text-base text-subtext1 mb-2 font-medium">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-overlay0 font-mono tracking-wide break-words px-2">choose_file.csv · Max 10MB · UTF-8 encoded</p>
                <p className="mt-3 text-[11px] text-overlay0 font-mono tracking-wide break-all leading-5 px-2">{csvHeader}</p>
              </>
            )}
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
          </motion.div>
          <div className="mt-8 flex gap-4 items-center flex-wrap">
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={handleUploadClick} disabled={isUploading}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold bg-blue text-crust cursor-pointer shadow-[0_4px_20px_rgba(137,180,250,0.2)] disabled:cursor-not-allowed disabled:opacity-70">
              <FileArrowUp size={18} weight="bold" /> {isUploading ? 'Processing...' : 'Upload & Process'}
            </motion.button>
            <button type="button" onClick={handleDownloadTemplate} className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 transition-colors cursor-pointer">
              <DownloadSimple size={16} weight="bold" /> Download Template
            </button>
          </div>
          {message || error ? (
            <div className={`mt-8 flex items-start gap-3 px-5 py-4 rounded-xl text-sm ${error ? 'bg-red/8 border border-red/20 text-red-200' : 'bg-green/8 border border-green/20 text-green'}`}>
              {error ? <Warning size={22} weight="fill" className="shrink-0 mt-0.5" /> : <CheckCircle size={22} weight="fill" className="shrink-0 mt-0.5" />}
              <div className="whitespace-pre-wrap font-mono text-xs leading-5 w-full overflow-x-auto">{error ?? message}</div>
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
            Upload the CSV template to keep the learner import clean and consistent. Any anomalies (like misspelled batches or incorrect Mentor IDs) will be caught and you can fix them before saving!
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
