import React from 'react';
import clsx from 'clsx';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-t-2 border-r-2 border-transparent border-primary-600',
        {
          'h-4 w-4 border-2': size === 'sm',
          'h-8 w-8 border-2': size === 'md',
          'h-12 w-12 border-3': size === 'lg',
          'h-16 w-16 border-4': size === 'xl',
        },
        className
      )}
    />
  );
};

export default Spinner;
