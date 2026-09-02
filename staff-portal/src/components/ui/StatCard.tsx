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
  iconBg = 'bg-teal-50 text-teal-600',
  description,
}) => {
  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${iconBg}`}>
            {icon}
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{title}</span>
            <span className="text-xl font-extrabold text-slate-900 font-heading block mt-0.5">{value}</span>
          </div>
        </div>

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

      {description && <p className="mt-3 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-400">{description}</p>}
    </Card>
  );
};
