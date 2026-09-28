import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue' | 'cyan';
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  trend,
  trendUp = true,
  onClick
}) => {
  const colorStyles = {
    indigo: 'border-l-4 border-l-teal-500',
    emerald: 'border-l-4 border-l-emerald-500',
    amber: 'border-l-4 border-l-amber-500',
    rose: 'border-l-4 border-l-rose-500',
    purple: 'border-l-4 border-l-purple-500',
    blue: 'border-l-4 border-l-blue-500',
    cyan: 'border-l-4 border-l-cyan-500',
  };

  const iconBg = {
    indigo: 'bg-teal-50 text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  };

  return (
    <div 
      onClick={onClick}
      className={`premium-card p-5 transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${colorStyles[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span className={`px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
