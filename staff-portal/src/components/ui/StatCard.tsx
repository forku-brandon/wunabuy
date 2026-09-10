import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: React.ReactNode;
  iconBg?: string;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  iconBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  description,
}) => {
  return (
    <Card className="flex flex-col justify-between">
      <div>
        {/* Top Row: Title + Icon Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            {title}
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        </div>

        {/* Middle Row: Crisp Metric Value */}
        <div className="my-0.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight block">
            {value}
          </span>
        </div>
      </div>

      {/* Bottom Row: Trend Pill & Description */}
      {(change || description) && (
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
          {change && (
            <Badge
              variant={
                changeType === 'positive'
                  ? 'success'
                  : changeType === 'negative'
                  ? 'error'
                  : changeType === 'warning'
                  ? 'warning'
                  : 'neutral'
              }
              size="sm"
            >
              {change}
            </Badge>
          )}

          {description && (
            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate ml-2">
              {description}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
