import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-2xl border p-5 transition-all duration-300',
        glass 
          ? 'glass dark:glass-dark' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm',
        {
          'card-hover': hoverEffect,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
