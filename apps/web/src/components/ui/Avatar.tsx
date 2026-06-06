import React from 'react';
import clsx from 'clsx';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  status,
}) => {
  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const initials = getInitials(name);

  // Background color based on initials hash
  const colors = [
    'bg-blue-500 text-white',
    'bg-purple-500 text-white',
    'bg-indigo-500 text-white',
    'bg-emerald-500 text-white',
    'bg-amber-500 text-white',
    'bg-rose-500 text-white',
    'bg-teal-500 text-white',
  ];
  const charSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = colors[charSum % colors.length];

  return (
    <div className="relative inline-block">
      <div
        className={clsx(
          'flex items-center justify-center font-semibold rounded-full overflow-hidden select-none shrink-0 shadow-sm border border-slate-200 dark:border-slate-800',
          {
            'h-6 w-6 text-[10px]': size === 'xs',
            'h-8 w-8 text-xs': size === 'sm',
            'h-10 w-10 text-sm': size === 'md',
            'h-12 w-12 text-base': size === 'lg',
            'h-14 w-14 text-lg': size === 'xl',
          },
          className
        )}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className={clsx('h-full w-full flex items-center justify-center', colorClass)}>
            {initials}
          </div>
        )}
      </div>

      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-slate-900',
            {
              'h-1.5 w-1.5': size === 'xs' || size === 'sm',
              'h-2.5 w-2.5': size === 'md',
              'h-3 w-3': size === 'lg' || size === 'xl',
            },
            {
              'bg-emerald-500': status === 'online',
              'bg-slate-400': status === 'offline',
              'bg-amber-400': status === 'away',
              'bg-rose-500': status === 'busy',
            }
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
