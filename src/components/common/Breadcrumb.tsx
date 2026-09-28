import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
  onNavigate?: (href: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-1 text-xs font-bold text-slate-700">
      <button 
        onClick={() => onNavigate && onNavigate('dashboard')}
        className="flex items-center gap-1 hover:text-indigo-600 transition-colors bg-white px-1.5 py-0.5 border border-slate-900 brutal-shadow-sm"
      >
        <Home className="w-3.5 h-3.5" />
        <span>SIS</span>
      </button>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {item.href ? (
            <button
              onClick={() => onNavigate && onNavigate(item.href!)}
              className="hover:text-indigo-600 font-semibold hover:underline"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-slate-900 font-extrabold uppercase tracking-wide bg-amber-300 px-1.5 py-0.5 border border-slate-900 brutal-shadow-sm">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
