import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: React.ReactNode;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  description,
}) => {
  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-slate-900 font-heading">{value}</span>
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
      </div>

      {description && <p className="mt-2 text-xs text-slate-500">{description}</p>}
    </Card>
  );
};
