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
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'status_change':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'investigation':
        return <Search className="w-4 h-4 text-cyan-400" />;
      case 'note':
        return <MessageSquare className="w-4 h-4 text-amber-400" />;
      default:
        return <ClipboardCheck className="w-4 h-4 text-brand-purple-light" />;
    }
  };

  const getIconBg = (type: Activity['type']) => {
    switch (type) {
      case 'risk_alert':
        return 'bg-rose-950/40 border-rose-500/20';
      case 'status_change':
        return 'bg-emerald-950/40 border-emerald-500/20';
      case 'investigation':
        return 'bg-cyan-950/40 border-cyan-500/20';
      case 'note':
        return 'bg-amber-950/40 border-amber-500/20';
      default:
        return 'bg-brand-purple/10 border-brand-purple/20';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <span>Recent Activity Logs</span>
        </CardTitle>
        <p className="text-xs text-gray-400">Live feed of due diligence updates and audits</p>
      </CardHeader>
      <CardContent className="px-6 py-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">No recent activities.</div>
        ) : (
          <div className="relative border-l border-white/5 pl-4 ml-2.5 space-y-6 py-2">
            {activities.map((activity) => (
              <div key={activity.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between text-xs group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[27px] flex items-center justify-center w-5 h-5 rounded-full border ${getIconBg(
                    activity.type
                  )} bg-dark-bg z-10 transition-transform duration-200 group-hover:scale-115`}
                >
                  {getIcon(activity.type)}
                </div>

                <div className="flex-1 pr-4">
                  <p className="text-gray-300">
                    <span className="font-semibold text-white">{activity.user}</span>{' '}
                    {activity.action} for{' '}
                    <span className="font-medium text-brand-purple-light group-hover:underline cursor-pointer">
                      {activity.startupName}
                    </span>
                  </p>
                </div>
                <div className="text-[10px] text-gray-500 mt-1 sm:mt-0 flex-shrink-0">
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
