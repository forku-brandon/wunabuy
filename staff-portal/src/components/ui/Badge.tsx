import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'teal' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}) => {
  const baseStyles = 'inline-flex items-center font-bold rounded-md uppercase tracking-wider font-mono';

  const variants = {
    success: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300',
    error: 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300',
    info: 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    teal: 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300',
    amber: 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-2.5 py-0.5 text-[10px]',
  };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
