import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, X, Info } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import { apiRequest } from '../utils/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type PendingUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function PendingApprovals() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  
  // Form State
  const [batch, setBatch] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [attendance, setAttendance] = useState('0');
  const [codingScore, setCodingScore] = useState('0');
  const [aptitudeScore, setAptitudeScore] = useState('0');
  const [communicationScore, setCommunicationScore] = useState('0');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<PendingUser[]>('/api/learners/pending');
      setPendingUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending approvals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPending();
  }, []);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    if (!batch.trim()) {
      setFormError('Batch name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setSuccessMsg(null);

    const payload = {
      batch: batch.trim(),
      mentorId: mentorId ? Number(mentorId) : null,
      attendance: Number(attendance),
      codingScore: Number(codingScore),
      aptitudeScore: Number(aptitudeScore),
      communicationScore: Number(communicationScore),
    };

    try {
      await apiRequest(`/api/learners/approve/${selectedUser.id}`, {
        method: 'POST',
        body: payload,
      });
      
      setSuccessMsg(`${selectedUser.name} has been successfully approved!`);
      setPendingUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      
      // Close modal after delay
      setTimeout(() => {
        setSelectedUser(null);
        setSuccessMsg(null);
        // Reset form
        setBatch('');
        setMentorId('');
        setAttendance('0');
        setCodingScore('0');
        setAptitudeScore('0');
        setCommunicationScore('0');
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('409') || err.message.toLowerCase().includes('already reviewed')) {
            setFormError('This learner has already been reviewed and accepted by another administrator.');
            setPendingUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        } else {
            setFormError(err.message);
        }
      } else {
        setFormError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={itemVariants} className="flex justify-between items-end mb-8">
        <SectionHeader 
          moduleLabel="ADMINISTRATION" 
          title="Pending Approvals" 
          subtitle="Review and assign academic profiles to self-registered learners." 
        />
        <button 
          onClick={fetchPending}
          className="text-sm font-semibold text-blue hover:text-blue/80 transition-colors"
        >
          Refresh List
        </button>
      </motion.div>

      {error ? (
        <motion.div variants={itemVariants} className="bg-red/10 border border-red/20 text-red px-5 py-4 rounded-xl text-sm flex items-start gap-3">
          <Info size={20} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </motion.div>
      ) : isLoading ? (
        <div className="py-20 text-center text-overlay0 font-mono text-sm animate-pulse">Loading pending registrations...</div>
      ) : pendingUsers.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="text-center py-16 border border-dashed border-surface1">
            <CheckCircle size={48} weight="duotone" className="mx-auto text-green mb-4 opacity-80" />
            <h3 className="font-display text-xl font-bold mb-2">You're all caught up!</h3>
            <p className="text-subtext0 text-sm max-w-md mx-auto">There are no pending learner registrations waiting for approval right now.</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {pendingUsers.map(user => (
              <motion.div 
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedUser(user)}
              >
                <Card className="cursor-pointer hover:border-blue/30 transition-colors group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-surface0 flex items-center justify-center text-overlay1 group-hover:bg-blue/10 group-hover:text-blue transition-colors">
                      <Clock size={20} weight="duotone" />
                    </div>
                    <span className="text-[10px] font-mono text-overlay0 bg-surface0 px-2 py-1 rounded-md">ID {user.id}</span>
                  </div>
                  <h3 className="font-bold text-text truncate mb-1">{user.name}</h3>
                  <p className="text-sm text-subtext0 truncate mb-4">{user.email}</p>
                  <button className="w-full py-2 bg-surface0 text-text text-sm font-semibold rounded-lg group-hover:bg-blue group-hover:text-crust transition-colors">
                    Review & Approve
                  </button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Approval Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !isSubmitting && setSelectedUser(null)}
              className="absolute inset-0 bg-crust/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-xl bg-base border border-surface1 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface0/50">
                <div>
                  <h3 className="font-display text-xl font-bold text-text">Approve Learner</h3>
                  <p className="text-xs text-subtext0 mt-1 font-mono">{selectedUser.name} · {selectedUser.email}</p>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)} 
                  disabled={isSubmitting}
                  className="p-2 text-overlay0 hover:text-text hover:bg-surface0 rounded-xl transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleApprove} className="p-6 overflow-y-auto max-h-[70vh]">
                {successMsg ? (
                  <div className="py-12 text-center">
                    <CheckCircle size={56} weight="fill" className="mx-auto text-green mb-4" />
                    <h4 className="font-display text-xl font-bold mb-2">Approved Successfully</h4>
                    <p className="text-subtext0 text-sm">{successMsg}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[13px] font-semibold text-subtext1 mb-2">Batch Assignment</label>
                        <input
                          type="text"
                          value={batch}
                          onChange={(e) => setBatch(e.target.value)}
                          className="w-full bg-surface0/30 border border-surface1/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue/50 focus:ring-2 focus:ring-blue/20 transition-all"
                          placeholder="e.g. 2024-A"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-subtext1 mb-2">Mentor ID (Optional)</label>
                        <input
                          type="number"
                          value={mentorId}
                          onChange={(e) => setMentorId(e.target.value)}
                          className="w-full bg-surface0/30 border border-surface1/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue/50 focus:ring-2 focus:ring-blue/20 transition-all"
                          placeholder="Mentor ID"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[13px] font-semibold text-subtext1 mb-2">Attendance %</label>
                        <input type="number" min="0" max="100" value={attendance} onChange={(e) => setAttendance(e.target.value)} className="w-full bg-surface0/30 border border-surface1/60 rounded-xl px-3 py-2 text-sm text-center" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-subtext1 mb-2">Coding Score</label>
                        <input type="number" min="0" max="100" value={codingScore} onChange={(e) => setCodingScore(e.target.value)} className="w-full bg-surface0/30 border border-surface1/60 rounded-xl px-3 py-2 text-sm text-center" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-subtext1 mb-2">Aptitude Score</label>
                        <input type="number" min="0" max="100" value={aptitudeScore} onChange={(e) => setAptitudeScore(e.target.value)} className="w-full bg-surface0/30 border border-surface1/60 rounded-xl px-3 py-2 text-sm text-center" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-subtext1 mb-2">Comm. Score</label>
                        <input type="number" min="0" max="100" value={communicationScore} onChange={(e) => setCommunicationScore(e.target.value)} className="w-full bg-surface0/30 border border-surface1/60 rounded-xl px-3 py-2 text-sm text-center" />
                      </div>
                    </div>

                    {formError && (
                      <div className="bg-red/10 text-red px-4 py-3 rounded-xl text-sm border border-red/20">
                        {formError}
                      </div>
                    )}

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-surface0/50">
                      <button 
                        type="button" 
                        onClick={() => setSelectedUser(null)}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-subtext0 hover:text-text transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-blue text-crust font-bold text-sm px-6 py-2.5 rounded-xl hover:shadow-[0_4px_15px_rgba(137,180,250,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? 'Approving...' : 'Approve Profile'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
