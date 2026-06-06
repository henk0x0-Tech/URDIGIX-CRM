import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, iconLeft, iconRight, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {iconLeft && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              {iconLeft}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={clsx(
              'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm transition-all duration-200 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800',
              {
                'pl-10': iconLeft,
                'pr-10': iconRight,
                'border-slate-200 dark:border-slate-700/80 focus:border-primary-500': !error,
                'border-rose-500 focus:border-rose-500 bg-rose-50/20 dark:bg-rose-500/5': error,
              },
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3.5 text-slate-400 pointer-events-none">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs font-medium text-rose-500">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
