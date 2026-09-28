import React from 'react';
import { ShieldAlert, CheckCircle, Search, MessageSquare, ClipboardCheck } from 'lucide-react';
import type { Activity } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'risk_alert':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'status_change':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'investigation':
        return <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
      case 'note':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      default:
        return <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const getIconBg = (type: Activity['type']) => {
    switch (type) {
      case 'risk_alert':
        return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30';
      case 'status_change':
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30';
      case 'investigation':
        return 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-500/30';
      case 'note':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/30';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-500/30';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 border-b border-[var(--border-color)]">
        <CardTitle className="flex items-center space-x-2">
          <span>Recent Investigation Activity</span>
        </CardTitle>
        <p className="text-xs text-[var(--text-secondary)]">Recent due diligence findings and investigation updates.</p>
      </CardHeader>
      <CardContent className="px-6 py-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--text-secondary)] font-mono">No recent investigation activity</div>
        ) : (
          <div className="relative border-l border-[var(--border-color)] pl-4 ml-2.5 space-y-6 py-2">
            {activities.map((activity) => (
              <div key={activity.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between text-xs group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[27px] flex items-center justify-center w-5 h-5 rounded-full border ${getIconBg(
                    activity.type
                  )} bg-[var(--bg-surface)] z-10 transition-transform duration-200 group-hover:scale-110`}
                >
                  {getIcon(activity.type)}
                </div>

                <div className="flex-1 pr-4">
                  <p className="text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">{activity.user}</span>{' '}
                    {activity.action} for{' '}
                    <span className="font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline cursor-pointer">
                      {activity.startupName}
                    </span>
                  </p>
                </div>
                <div className="text-[10px] font-mono text-[var(--text-secondary)] mt-1 sm:mt-0 flex-shrink-0">
                  {activity.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default RecentActivity;
