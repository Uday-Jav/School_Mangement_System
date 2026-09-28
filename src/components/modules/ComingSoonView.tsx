import React from 'react';
import { PageHeader } from '../common/PageHeader';
import { Hammer } from 'lucide-react';

interface ComingSoonViewProps {
  moduleName: string;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ moduleName }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title={`${moduleName.toUpperCase()} MODULE`}
        subtitle="This module is deferred for a future milestone."
        breadcrumbItems={[{ label: moduleName }]}
      />

      <div className="h-[60vh] flex flex-col items-center justify-center border-4 border-dashed border-slate-300 bg-slate-50 text-slate-500 brutal-shadow">
        <div className="bg-white p-6 border-4 border-slate-900 brutal-shadow flex flex-col items-center gap-4 max-w-sm text-center">
          <Hammer className="w-12 h-12 text-amber-500" />
          <h2 className="text-xl font-black uppercase text-slate-900">COMING SOON</h2>
          <p className="text-sm font-bold leading-relaxed">
            The <strong>{moduleName}</strong> workflow is fully designed but data persistence is deferred beyond the current milestone.
          </p>
        </div>
      </div>
    </div>
  );
};
