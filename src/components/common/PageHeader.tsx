import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { Plus, Download, Printer } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: { label: string; href?: string }[];
  onNavigate?: (href: string) => void;
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  printAction?: () => void;
  exportAction?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbItems,
  onNavigate,
  primaryAction,
  secondaryAction,
  printAction,
  exportAction,
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        {breadcrumbItems && <Breadcrumb items={breadcrumbItems} onNavigate={onNavigate} />}
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2 leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-medium text-slate-500 mt-2">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {printAction && (
          <button
            onClick={printAction}
            className="premium-btn premium-btn-secondary px-3 py-2 text-sm"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print</span>
          </button>
        )}
        {exportAction && (
          <button
            onClick={exportAction}
            className="premium-btn premium-btn-secondary px-3 py-2 text-sm"
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="premium-btn premium-btn-secondary px-4 py-2 text-sm"
          >
            {secondaryAction.icon && <span className="mr-1.5">{secondaryAction.icon}</span>}
            {!secondaryAction.icon && <Plus className="w-4 h-4 mr-1.5" />}
            <span>{secondaryAction.label}</span>
          </button>
        )}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="premium-btn premium-btn-primary px-4 py-2 text-sm"
          >
            {primaryAction.icon && <span className="mr-1.5">{primaryAction.icon}</span>}
            {!primaryAction.icon && <Plus className="w-4 h-4 mr-1.5" />}
            <span>{primaryAction.label}</span>
          </button>
        )}
      </div>
    </div>
  );
};
