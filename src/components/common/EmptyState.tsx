import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are no items matching your criteria or database query.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-8 text-center bg-white border-2 border-slate-900 brutal-shadow my-4">
      <div className="inline-flex p-4 bg-amber-200 border-2 border-slate-900 brutal-shadow-sm mb-3">
        <FolderOpen className="w-8 h-8 text-slate-950" />
      </div>
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h3>
      <p className="text-xs font-semibold text-slate-600 max-w-sm mx-auto mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-black bg-indigo-600 text-white border-2 border-slate-900 brutal-shadow-sm hover:bg-indigo-700 uppercase"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
