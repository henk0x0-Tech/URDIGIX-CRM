import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import { activityService } from '../../services/dataService';
import toast from 'react-hot-toast';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activityService.getAll();
        setActivities(data);
      } catch (error) {
        toast.error('Failed to load activity log.');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Activity Logs"
        description="Full audit trail and user modification logs across all modules"
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <Card className="flex flex-col gap-6 p-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Audit Trail</h3>
          <div className="relative border-l border-slate-200 dark:border-slate-850 ml-3 flex flex-col gap-6">
            {activities.map((act) => (
              <div key={act.id} className="relative pl-8 flex flex-col gap-1 text-xs">
                {/* Dot */}
                <div className="absolute left-0 top-1.5 translate-x-[-50%] h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-primary-600" />
                
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{act.userName}</span>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                    {act.action}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-500 font-semibold leading-relaxed mt-0.5">{act.details}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ActivitiesPage;
