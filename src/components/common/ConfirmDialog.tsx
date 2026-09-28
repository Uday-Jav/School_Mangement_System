import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border-3 border-slate-900 brutal-shadow-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 border-2 border-slate-900 ${variant === 'danger' ? 'bg-rose-400 text-slate-950' : 'bg-amber-400 text-slate-950'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-slate-900 uppercase">{title}</h4>
            <p className="text-xs font-semibold text-slate-600">Action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-800 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold bg-slate-200 hover:bg-slate-300 border-2 border-slate-900 brutal-shadow-sm transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-bold border-2 border-slate-900 brutal-shadow-sm transition-all ${
              variant === 'danger'
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
