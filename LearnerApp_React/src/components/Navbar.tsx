import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SignIn, ChartBar, UserPlus, UploadSimple, ChalkboardTeacher,
  Exam, Brain, ChartLine, Bell, List, X
} from '@phosphor-icons/react';

export type ScreenId =
  | 'login' | 'admin' | 'addlearner' | 'csvupload' | 'mentor'
  | 'assessment' | 'prediction' | 'analytics' | 'notifications';

interface NavTab { id: ScreenId; label: string; icon: React.ReactNode; }

const tabs: NavTab[] = [
  { id: 'login', label: 'Login', icon: <SignIn size={16} /> },
  { id: 'admin', label: 'Dashboard', icon: <ChartBar size={16} /> },
  { id: 'addlearner', label: 'Add Learner', icon: <UserPlus size={16} /> },
  { id: 'csvupload', label: 'CSV Upload', icon: <UploadSimple size={16} /> },
  { id: 'mentor', label: 'Mentor', icon: <ChalkboardTeacher size={16} /> },
  { id: 'assessment', label: 'Assessment', icon: <Exam size={16} /> },
  { id: 'prediction', label: 'AI Predict', icon: <Brain size={16} /> },
  { id: 'analytics', label: 'Analytics', icon: <ChartLine size={16} /> },
  { id: 'notifications', label: 'Alerts', icon: <Bell size={16} /> },
];

interface NavbarProps { activeScreen: ScreenId; onNavigate: (id: ScreenId) => void; }

export default function Navbar({ activeScreen, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-crust/80 backdrop-blur-2xl border-b border-surface0/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue to-mauve flex items-center justify-center shadow-[0_0_20px_rgba(137,180,250,0.15)]">
              <span className="text-crust font-bold text-sm tracking-tight">AL</span>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight hidden sm:block">
              Aura<span className="text-blue">Learner</span>
            </span>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden lg:flex items-center gap-1.5">
            {tabs.map((tab) => (
              <motion.button key={tab.id} onClick={() => onNavigate(tab.id)}
                className={`group flex items-center px-3.5 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-300 ${
                  activeScreen === tab.id
                    ? 'text-blue bg-blue/10 shadow-[inset_0_0_0_1px_rgba(137,180,250,0.25)]'
                    : 'text-overlay1 hover:text-subtext1 hover:bg-surface0/40'
                }`}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <span className="shrink-0">{tab.icon}</span>
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-out ${
                  activeScreen === tab.id 
                    ? 'max-w-[120px] ml-2 opacity-100' 
                    : 'max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:ml-2 group-hover:opacity-100'
                }`}>
                  {tab.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-subtext0 hover:text-text hover:bg-surface0/40 transition-colors cursor-pointer">
            {mobileOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-surface0/50 overflow-hidden">
            <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tabs.map((tab) => (
                <button key={tab.id}
                  onClick={() => { onNavigate(tab.id); setMobileOpen(false); }}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all ${
                    activeScreen === tab.id
                      ? 'text-blue bg-blue/10 border border-blue/20'
                      : 'text-overlay1 hover:text-text hover:bg-surface0/40 border border-transparent'
                  }`}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
