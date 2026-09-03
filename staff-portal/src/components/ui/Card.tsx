import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-[#151C28] rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all p-5 text-slate-900 dark:text-slate-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
