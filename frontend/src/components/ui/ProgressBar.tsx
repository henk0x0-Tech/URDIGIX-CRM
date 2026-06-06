import React from 'react';
import clsx from 'clsx';

export interface ProgressBarProps {
  progress: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  size = 'md',
  showPercentage = false,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={clsx('w-full flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        {showPercentage && <span>{Math.round(clampedProgress)}%</span>}
      </div>
      <div
        className={clsx(
          'w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden',
          {
            'h-1': size === 'sm',
            'h-2.5': size === 'md',
            'h-4': size === 'lg',
          }
        )}
      >
        <div
          className="bg-primary-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
