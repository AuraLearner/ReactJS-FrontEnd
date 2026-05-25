import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Envelope, Lock, ArrowRight } from '@phosphor-icons/react';
import Card from '../components/Card';

const roles = ['Admin', 'Mentor', 'Learner'] as const;

export default function LoginScreen() {
  const [activeRole, setActiveRole] = useState<string>('Admin');

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-5 py-12">
      <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-[440px]">
        <Card className="!p-8 sm:!p-10 lg:!p-12">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue to-mauve flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(137,180,250,0.15)]">
              <span className="text-crust font-bold text-xl tracking-tight">AL</span>
            </div>
            <h1 className="font-display text-3xl sm:text-[34px] font-bold text-text mb-3 tracking-tight">
              Aura<span className="text-blue">Learner</span>
            </h1>
            <p className="text-xs text-overlay0 font-mono tracking-[4px] uppercase">
              Placement Intelligence
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-2xl overflow-hidden w-full mb-10 bg-base border border-surface0/60 p-1">
            {roles.map((role) => (
              <motion.button key={role} onClick={() => setActiveRole(role)}
                className={`flex-1 py-3 text-[13px] font-semibold cursor-pointer rounded-xl transition-all duration-200 ${
                  activeRole === role
                    ? 'bg-blue text-crust shadow-lg'
                    : 'text-overlay1 hover:text-text'
                }`} whileTap={{ scale: 0.97 }}>
                {role}
              </motion.button>
            ))}
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono">
              <Envelope size={14} weight="bold" /> Email Address
            </label>
            <input type="email" placeholder="admin@auralearner.in"
              className="w-full px-5 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all" />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono">
              <Lock size={14} weight="bold" /> Password
            </label>
            <input type="password" placeholder="••••••••••••"
              className="w-full px-5 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all" />
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center mb-10">
            <label className="flex gap-2.5 items-center text-[13px] text-subtext0 cursor-pointer">
              <input type="checkbox" className="accent-blue w-4 h-4 rounded" /> Remember me
            </label>
            <span className="text-[13px] text-blue cursor-pointer hover:text-lavender transition-colors">Forgot password?</span>
          </div>

          {/* Sign In */}
          <motion.button
            className="w-full py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-blue to-lavender text-crust cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_4px_24px_rgba(137,180,250,0.25)]"
            whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}>
            <ShieldCheck size={18} weight="bold" />
            Sign In
            <ArrowRight size={16} weight="bold" />
          </motion.button>

          <div className="mt-8 text-center text-[10px] text-overlay0 font-mono tracking-widest">
            POST /api/auth/login
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
