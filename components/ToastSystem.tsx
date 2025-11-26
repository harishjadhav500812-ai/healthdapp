import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, ShieldCheck, Lock, UserPlus, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'BLOCKCHAIN_VERIFIED' | 'ACCESS_REQUESTED' | 'ACCESS_APPROVED';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message: string) => void;
  success: (title: string, message: string) => void;
  error: (title: string, message: string) => void;
  blockchain: (title: string, message: string) => void;
  accessRequest: (title: string, message: string) => void;
  accessApprove: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Updated Colors for HealthChain Theme
const TOAST_STYLES = {
  SUCCESS: {
    icon: CheckCircle,
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]',
    progress: 'bg-green-500'
  },
  ERROR: {
    icon: AlertCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    progress: 'bg-red-500'
  },
  BLOCKCHAIN_VERIFIED: {
    icon: ShieldCheck,
    bg: 'bg-neonIndigo/10', // Teal
    border: 'border-neonIndigo/30',
    text: 'text-neonIndigo',
    shadow: 'shadow-[0_0_20px_rgba(20,184,166,0.2)]',
    progress: 'bg-neonIndigo'
  },
  ACCESS_REQUESTED: {
    icon: Lock,
    bg: 'bg-neonBlue/10', // Trust Blue
    border: 'border-neonBlue/30',
    text: 'text-neonBlue',
    shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
    progress: 'bg-neonBlue'
  },
  ACCESS_APPROVED: {
    icon: UserPlus,
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    text: 'text-teal-400',
    shadow: 'shadow-[0_0_20px_rgba(45,212,191,0.2)]',
    progress: 'bg-teal-500'
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  // Convenience methods
  const success = (t: string, m: string) => addToast('SUCCESS', t, m);
  const error = (t: string, m: string) => addToast('ERROR', t, m);
  const blockchain = (t: string, m: string) => addToast('BLOCKCHAIN_VERIFIED', t, m);
  const accessRequest = (t: string, m: string) => addToast('ACCESS_REQUESTED', t, m);
  const accessApprove = (t: string, m: string) => addToast('ACCESS_APPROVED', t, m);

  return (
    <ToastContext.Provider value={{ addToast, success, error, blockchain, accessRequest, accessApprove }}>
      {children}
      <div className="fixed top-24 right-4 md:right-8 z-[100] flex flex-col gap-4 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Style = TOAST_STYLES[toast.type];
            const Icon = Style.icon;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1, 
                  filter: 'blur(0px)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 } 
                }}
                exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
                layout
                className={`
                  pointer-events-auto
                  relative overflow-hidden
                  backdrop-blur-xl
                  border ${Style.border}
                  ${Style.bg}
                  ${Style.shadow}
                  rounded-2xl p-4
                  flex items-start gap-4
                `}
              >
                <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${Style.text} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 pt-0.5">
                  <h4 className={`font-bold text-sm ${Style.text} mb-0.5`}>{toast.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-500 hover:text-white transition-colors pt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Progress Bar Animation */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className={`absolute bottom-0 left-0 h-0.5 ${Style.progress}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};