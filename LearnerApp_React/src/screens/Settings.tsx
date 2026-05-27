import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, LockKey, CheckCircle, XCircle } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import { apiRequest } from '../utils/api';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function Settings() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (oldPassword === newPassword) {
      setError('New password must be different from the old password.');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      await apiRequest<{ message: string }>('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { oldPassword, newPassword },
      });
      setMessage('Your password has been successfully changed.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while changing your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="ACCOUNT PREFERENCES" title="Account Settings" subtitle="Manage your account security and personal preferences." />
      </motion.div>
      
      <motion.div variants={iV} className="mt-8">
        <Card className="max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center text-blue">
              <Key size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-text">Change Password</h2>
              <p className="text-sm text-subtext0 mt-1">Ensure your account is using a long, random password to stay secure.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-subtext1 mb-2">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LockKey size={18} className="text-overlay0" />
                </div>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-surface0/30 border border-surface1/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue/50 focus:ring-2 focus:ring-blue/20 transition-all placeholder:text-overlay0"
                  placeholder="Enter current password"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-subtext1 mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key size={18} className="text-overlay0" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface0/30 border border-surface1/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue/50 focus:ring-2 focus:ring-blue/20 transition-all placeholder:text-overlay0"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 bg-red/10 border border-red/20 text-red-100 px-4 py-3 rounded-xl text-sm">
                <XCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}

            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 bg-green/10 border border-green/20 text-green px-4 py-3 rounded-xl text-sm">
                <CheckCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
                <p>{message}</p>
              </motion.div>
            )}

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-blue text-crust font-bold text-sm px-6 py-3 rounded-xl shadow-[0_4px_15px_rgba(137,180,250,0.25)] hover:shadow-[0_6px_20px_rgba(137,180,250,0.35)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </motion.button>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
