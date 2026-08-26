import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx('bg-white rounded-xl border border-slate-200 shadow-sm p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

