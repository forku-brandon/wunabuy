import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx('bg-white rounded-3xl border border-slate-100/80 shadow-sm hover:shadow-md transition-all p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};
