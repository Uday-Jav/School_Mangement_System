import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let bgClass = 'bg-slate-100 text-slate-700';

  if (['ACTIVE', 'PRESENT', 'PAID', 'PASSED', 'PASSED WITH HONORS', 'COMPLETED', 'PUBLISHED', 'RETURNED'].includes(normalized)) {
    bgClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  } else if (['INACTIVE', 'ABSENT', 'OVERDUE', 'FAILED', 'LOST', 'SUSPENDED'].includes(normalized)) {
    bgClass = 'bg-rose-50 text-rose-700 border border-rose-200';
  } else if (['PENDING', 'LATE', 'ONGOING', 'UPCOMING', 'MAINTENANCE', 'PARTIAL', 'MEDIUM'].includes(normalized)) {
    bgClass = 'bg-amber-50 text-amber-700 border border-amber-200';
  } else if (['LEAVE', 'DRAFT', 'ON LEAVE', 'ISSUED'].includes(normalized)) {
    bgClass = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${px} ${bgClass}`}>
      {status}
    </span>
  );
};
