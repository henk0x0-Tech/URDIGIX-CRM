import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import AreaChartWidget from '../../components/charts/AreaChartWidget';
import BarChartWidget from '../../components/charts/BarChartWidget';
import DoughnutChartWidget from '../../components/charts/DoughnutChartWidget';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge';
import { dashboardService } from '../../services/dataService';
import { Users, FolderKanban, FileText, CreditCard, Calendar, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, c, p, a] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getChartData(),
          dashboardService.getRecentProjects(),
          dashboardService.getRecentActivities(),
        ]);
        setStats(s);
        setChartData(c);
        setRecentProjects(p);
        setRecentActivities(a);
      } catch (error) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back, Admin User" 
        actions={
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl shadow-sm">
            <Calendar className="h-4 w-4" />
            <span>01 May, 2024 - 31 May, 2024</span>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={stats?.totalClients}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: stats?.clientsTrend, isPositive: true }}
          iconColor="blue"
        />
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects}
          icon={<FolderKanban className="h-5 w-5" />}
          trend={{ value: stats?.projectsTrend, isPositive: true }}
          iconColor="blue"
        />
        <StatCard
          title="Total Invoices"
          value={stats?.totalInvoices}
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: stats?.invoicesTrend, isPositive: true }}
          iconColor="orange"
        />
        <StatCard
          title="Pending Payments"
          value={`₹${stats?.pendingPayments.toLocaleString('en-IN')}`}
          icon={<CreditCard className="h-5 w-5" />}
          trend={{ value: stats?.paymentsTrend, isPositive: false }}
          iconColor="green"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Projects Overview</h3>
            <span className="text-xs font-bold text-slate-400">This Year</span>
          </div>
          <AreaChartWidget data={chartData?.projectsOverview} dataKeyX="month" dataKeyY="projects" />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Tasks Overview</h3>
          </div>
          <DoughnutChartWidget data={chartData?.tasksOverview} />
        </Card>
      </div>

      {/* Sub sections: Recent Projects & Revenue / Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects Table */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Recent Projects</h3>
              <button className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="py-3 px-2 font-bold">Project Name</th>
                    <th className="py-3 px-2 font-bold">Client</th>
                    <th className="py-3 px-2 font-bold">Progress</th>
                    <th className="py-3 px-2 font-bold">Deadline</th>
                    <th className="py-3 px-2 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {recentProjects.slice(0, 4).map((p) => (
                    <tr key={p.id} className="table-row-hover">
                      <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="py-3.5 px-2">{p.client}</td>
                      <td className="py-3.5 px-2 w-32">
                        <ProgressBar progress={p.progress} showPercentage={false} size="sm" />
                      </td>
                      <td className="py-3.5 px-2">{p.deadline}</td>
                      <td className="py-3.5 px-2">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Recent Activities</h3>
            <button className="text-xs font-bold text-primary-600 hover:text-primary-700">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs">
                <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 font-bold">
                  {act.entity[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{act.details}</span>
                  <span className="text-slate-400 mt-0.5">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Revenue Overview</h3>
            <span className="text-xs font-bold text-slate-400">This Year</span>
          </div>
          <BarChartWidget data={chartData?.revenueOverview} dataKeyX="month" dataKeyY="revenue" barColor="#3b82f6" />
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
