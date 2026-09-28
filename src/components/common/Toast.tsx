import React from 'react';
import { ToastMessage } from '../../types';
export type { ToastMessage };
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  let bg = 'bg-indigo-100 text-indigo-950 border-indigo-900';
  let icon = <Info className="w-5 h-5 text-indigo-700" />;

  if (toast.type === 'success') {
    bg = 'bg-emerald-200 text-emerald-950 border-slate-900';
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-800" />;
  } else if (toast.type === 'error') {
    bg = 'bg-rose-200 text-rose-950 border-slate-900';
    icon = <XCircle className="w-5 h-5 text-rose-800" />;
  } else if (toast.type === 'warning') {
    bg = 'bg-amber-200 text-amber-950 border-slate-900';
    icon = <AlertCircle className="w-5 h-5 text-amber-800" />;
  }

  return (
    <div className={`flex items-start gap-3 p-4 border-2 brutal-border brutal-shadow-md rounded-none ${bg} max-w-sm w-full transition-all duration-200 animate-slide-in`}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <h4 className="font-bold text-sm leading-none mb-1">{toast.title}</h4>
        <p className="text-xs text-slate-800 font-medium">{toast.message}</p>
      </div>
      <button 
        onClick={() => onClose(toast.id)} 
        className="text-slate-700 hover:text-slate-950 p-0.5 brutal-border-sm bg-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-auto">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
};
