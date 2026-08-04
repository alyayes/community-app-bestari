import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border min-w-[280px] backdrop-blur-sm
                ${toast.type === 'success' ? 'bg-[#FAF6EE]/95 border-[#A8B774] text-[#2C4219]' : ''}
                ${toast.type === 'error' ? 'bg-[#FEF2F2]/95 border-[#FCA5A5] text-[#991B1B]' : ''}
                ${toast.type === 'info' ? 'bg-white/95 border-[#E6E1D5] text-[#433A30]' : ''}
              `}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#A8B774]" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-[#F87171]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#2C4219]" />}
              
              <span className="text-sm font-semibold flex-1">{toast.message}</span>
              
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-[#433A30]/50 hover:text-[#433A30] transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
