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
        'bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:border-slate-300/80 transition-all p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
