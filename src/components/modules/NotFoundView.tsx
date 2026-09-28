import React from 'react';
import { PageHeader } from '../common/PageHeader';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface NotFoundViewProps {
  onNavigateHome: () => void;
  title?: string;
  message?: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ 
  onNavigateHome, 
  title = "PAGE NOT FOUND", 
  message = "The requested module is either under construction, scheduled for a future update, or you do not have permission to access it." 
}) => {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center h-full min-h-[60vh]">
      <div className="p-8 bg-white border-4 border-slate-900 brutal-shadow text-center max-w-lg w-full relative">
        <div className="absolute -top-6 -right-6 p-4 bg-amber-300 border-4 border-slate-900 brutal-shadow">
          <AlertCircle className="w-8 h-8 text-slate-900" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">{title}</h1>
        <p className="text-sm font-bold text-slate-600 mb-8 border-l-4 border-amber-300 pl-4 text-left">
          {message}
        </p>

        <button
          onClick={onNavigateHome}
          className="w-full py-4 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-indigo-700 brutal-shadow-sm transition-transform active:translate-y-1 active:translate-x-1"
        >
          <ArrowLeft className="w-5 h-5" />
          RETURN TO DASHBOARD
        </button>
      </div>
    </div>
  );
};
