import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, Info, Warning } from '@phosphor-icons/react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType = 'info') => {
    switch (type) {
      case 'success': return <CheckCircle size={20} weight="fill" className="text-green" />;
      case 'warning': return <Warning size={20} weight="fill" className="text-yellow" />;
      case 'error': return <Info size={20} weight="fill" className="text-red" />;
      default: return <Bell size={20} weight="fill" className="text-blue" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-base border border-surface1 shadow-xl rounded-xl p-4 w-80 flex items-start gap-3 relative overflow-hidden"
            >
              {/* Optional: Add a left border color based on type */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                toast.type === 'success' ? 'bg-green' : 
                toast.type === 'warning' ? 'bg-yellow' : 
                toast.type === 'error' ? 'bg-red' : 'bg-blue'
              }`} />
              
              <div className="shrink-0 mt-0.5 ml-1">
                {getIcon(toast.type)}
              </div>
              <div className="flex-1 pr-6">
                <h4 className="text-[13px] font-bold text-text mb-0.5">{toast.title}</h4>
                <p className="text-xs text-subtext0 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-3 right-3 text-overlay0 hover:text-text transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
