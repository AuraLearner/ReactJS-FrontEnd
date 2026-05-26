import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Envelope, Lock, ArrowRight, User, UserPlus } from '@phosphor-icons/react';
import Card from '../components/Card';
import type { ScreenId } from '../components/Navbar';
import { apiRequest, setAuthSession } from '../utils/api';

const roles = ['Admin', 'Mentor', 'Learner'] as const;
type Role = (typeof roles)[number];
type Mode = 'login' | 'register';

interface LoginScreenProps {
  onLoginSuccess: (screen: ScreenId) => void;
}

function resolveScreenForRole(role: string): ScreenId {
  const normalizedRole = role.trim().toUpperCase();

  if (normalizedRole === 'ADMIN') {
    return 'admin';
  }

  if (normalizedRole === 'MENTOR') {
    return 'mentor';
  }

  return 'prediction';
}

function extractTokenAndRole(
  response: unknown,
  fallbackRole: Role,
): { token: string; role: string; userId?: number } {
  if (typeof response === 'string') {
    const token = response.trim();

    if (!token || token.toLowerCase().includes('invalid credentials')) {
      throw new Error('Invalid credentials');
    }

    return { token, role: fallbackRole };
  }

  if (response && typeof response === 'object') {
    const payload = response as Record<string, unknown>;
    const token = String(payload.token ?? payload.jwt ?? payload.accessToken ?? '').trim();
    const role = String(payload.role ?? fallbackRole).trim() || fallbackRole;
    const rawUserId = payload.userId ?? payload.id;
    const parsedUserId = rawUserId == null ? NaN : Number(rawUserId);
    const userId = Number.isFinite(parsedUserId) ? parsedUserId : undefined;

    if (token) {
      return { token, role, userId };
    }

    const message = String(payload.message ?? payload.error ?? '').trim();

    if (message) {
      throw new Error(message);
    }
  }

  throw new Error('Authentication token was not returned');
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [activeRole, setActiveRole] = useState<Role>('Admin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@auralearner.in');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'register') {
        const trimmedName = name.trim();

        if (!trimmedName) {
          throw new Error('Full name is required');
        }

        await apiRequest('/api/auth/register', {
          method: 'POST',
          body: {
            name: trimmedName,
            email: email.trim(),
            password,
            role: activeRole.toUpperCase(),
          },
        });

        setSuccess('Account created. Sign in with your new credentials.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        return;
      }

      const response = await apiRequest<unknown>('/api/auth/login', {
        method: 'POST',
        body: {
          email: email.trim(),
          password,
        },
      });

      const { token, role, userId } = extractTokenAndRole(response, activeRole);
      setAuthSession(token, role, userId);

      if (rememberMe) {
        localStorage.setItem('rememberedRole', role);
      } else {
        localStorage.removeItem('rememberedRole');
      }

      onLoginSuccess(resolveScreenForRole(role));
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to continue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-5 py-12">
      <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-[440px]">
        <Card className="!p-8 sm:!p-10 lg:!p-12">
          <form onSubmit={handleSubmit}>
            {/* Logo */}
            <div className="text-center mb-10">
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

            {/* Mode Toggle */}
            <div className="flex rounded-2xl overflow-hidden w-full mb-8 bg-base border border-surface0/60 p-1">
              <motion.button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-3 text-[13px] font-semibold cursor-pointer rounded-xl transition-all duration-200 ${
                  !isRegister
                    ? 'bg-blue text-crust shadow-lg'
                    : 'text-overlay1 hover:text-text'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                Sign In
              </motion.button>
              <motion.button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-3 text-[13px] font-semibold cursor-pointer rounded-xl transition-all duration-200 ${
                  isRegister
                    ? 'bg-blue text-crust shadow-lg'
                    : 'text-overlay1 hover:text-text'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                Register
              </motion.button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
              <div>
                <p className="text-sm font-semibold text-text">
                  {isRegister ? 'Create your AuraLearner account' : 'Sign in to your dashboard'}
                </p>
                <p className="text-[11px] text-overlay0 font-mono mt-1 tracking-wide">
                  {isRegister ? 'POST /api/auth/register' : 'POST /api/auth/login'}
                </p>
              </div>
              <div className="flex rounded-full bg-base border border-surface0/60 p-1">
                {roles.map((role) => (
                  <motion.button
                    key={role}
                    type="button"
                    onClick={() => setActiveRole(role)}
                    className={`px-3 py-1.5 text-[11px] font-semibold cursor-pointer rounded-full transition-all duration-200 ${
                      activeRole === role
                        ? 'bg-blue text-crust shadow-lg'
                        : 'text-overlay1 hover:text-text'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {role}
                  </motion.button>
                ))}
              </div>
            </div>

            {isRegister ? (
              <div className="mb-6">
                <label className="flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono">
                  <User size={14} weight="bold" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Aravind Kumar"
                  className="w-full px-5 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all"
                />
              </div>
            ) : null}

            <div className="mb-6">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono">
                <Envelope size={14} weight="bold" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@auralearner.in"
                className="w-full px-5 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono">
                <Lock size={14} weight="bold" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••"
                className="w-full px-5 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all"
              />
            </div>

            {isRegister ? (
              <div className="mb-6">
                <label className="flex items-center gap-2 text-[11px] font-semibold text-subtext0 mb-3 tracking-wider uppercase font-mono">
                  <Lock size={14} weight="bold" /> Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-5 py-3.5 bg-base border border-surface0/60 rounded-xl text-text text-sm placeholder:text-overlay0 transition-all"
                />
              </div>
            ) : (
              <div className="flex justify-between items-center mb-10">
                <label className="flex gap-2.5 items-center text-[13px] text-subtext0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="accent-blue w-4 h-4 rounded"
                  />
                  Remember me
                </label>
                <span className="text-[13px] text-blue cursor-pointer hover:text-lavender transition-colors">Forgot password?</span>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-blue to-lavender text-crust cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_4px_24px_rgba(137,180,250,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isRegister ? <UserPlus size={18} weight="bold" /> : <ShieldCheck size={18} weight="bold" />}
              {isSubmitting ? (isRegister ? 'Creating Account...' : 'Signing In...') : (isRegister ? 'Create Account' : 'Sign In')}
              <ArrowRight size={16} weight="bold" />
            </motion.button>

            {error ? (
              <p className="mt-4 text-sm text-red-300 bg-red/10 border border-red/20 rounded-xl px-4 py-3">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="mt-4 text-sm text-green bg-green/10 border border-green/20 rounded-xl px-4 py-3">
                {success}
              </p>
            ) : null}

            <div className="mt-8 flex items-center justify-between text-[10px] text-overlay0 font-mono tracking-widest">
              <span>{mode === 'register' ? 'POST /api/auth/register' : 'POST /api/auth/login'}</span>
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue hover:text-lavender transition-colors"
              >
                {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
