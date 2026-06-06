import React from 'react';
import Card from '../ui/Card';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  iconColor?: 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  iconColor = 'blue',
  className,
}) => {
  return (
    <Card hoverEffect className={clsx('flex items-center justify-between p-6', className)}>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {value}
        </span>
        {trend && (
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={clsx(
                'inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md',
                trend.isPositive
                  ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                  : 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10'
              )}
            >
              {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}%
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {trend.label || 'from last month'}
            </span>
          </div>
        )}
      </div>
      <div
        className={clsx(
          'p-3.5 rounded-2xl shrink-0 flex items-center justify-center shadow-sm',
          {
            'stat-icon-blue text-primary-600': iconColor === 'blue',
            'stat-icon-green text-emerald-600': iconColor === 'green',
            'stat-icon-purple text-purple-600': iconColor === 'purple',
            'stat-icon-orange text-amber-600': iconColor === 'orange',
          }
        )}
      >
        {icon}
      </div>
    </Card>
  );
};

export default StatCard;
