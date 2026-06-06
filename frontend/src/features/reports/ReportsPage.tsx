import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import BarChartWidget from '../../components/charts/BarChartWidget';
import AreaChartWidget from '../../components/charts/AreaChartWidget';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { reportService } from '../../services/dataService';
import { FileDown, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportsPage: React.FC = () => {
  const [revenueReport, setRevenueReport] = useState<any>(null);
  const [projectReport, setProjectReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [rev, proj] = await Promise.all([
          reportService.getRevenueReport(),
          reportService.getProjectReport(),
        ]);
        setRevenueReport(rev);
        setProjectReport(proj);
      } catch (error) {
        toast.error('Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const handleExport = (type: string) => {
    toast.success(`Exporting report as ${type.toUpperCase()}...`);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Reports & Analytics"
        description="Generate financial projections, task velocities, and HR capacity graphs"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')} icon={<FileDown className="h-4 w-4" />}>
              CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('xlsx')} icon={<FileDown className="h-4 w-4" />}>
              Excel
            </Button>
            <Button onClick={() => window.print()} icon={<Printer className="h-4 w-4" />}>
              Print
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Report Chart */}
          <Card>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider mb-4">Financial Revenue vs Expenses</h3>
            <BarChartWidget data={revenueReport?.monthlyRevenue} dataKeyX="month" dataKeyY="revenue" barColor="#3b82f6" />
          </Card>

          {/* Project Reports Area */}
          <Card>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider mb-4">Project Velocity (Completed Tasks)</h3>
            <AreaChartWidget data={projectReport?.monthlyProjects} dataKeyX="month" dataKeyY="completed" fillColor="#10b981" strokeColor="#059669" />
          </Card>

          {/* Stats Breakdown summary cards */}
          <Card className="lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider mb-4">Annual Business Performance Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col gap-1 border-r border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Billing Revenue</span>
                <span className="text-2xl font-extrabold text-slate-850 dark:text-white">₹{revenueReport?.totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex flex-col gap-1 border-r border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Operations Cost</span>
                <span className="text-2xl font-extrabold text-slate-850 dark:text-white">₹{revenueReport?.totalExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Profit margin</span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{revenueReport?.netProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
