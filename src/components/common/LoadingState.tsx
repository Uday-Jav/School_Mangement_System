import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading system data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-slate-900 brutal-shadow my-4">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
      <p className="text-xs font-black uppercase text-slate-900 tracking-wider">{message}</p>
    </div>
  );
};
