import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { projectService } from '../../services/dataService';
import { Plus, Table, LayoutGrid, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState('medium');

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectService.create({
        name,
        description,
        clientName,
        budget: Number(budget),
        startDate,
        endDate,
        deadline: endDate,
        priority: priority as any,
        status: 'planning',
        progress: 0,
        spent: 0,
        createdAt: new Date().toISOString().split('T')[0],
      });
      toast.success('Project created successfully!');
      setIsAddOpen(false);
      fetchProjects();
      // Clear fields
      setName('');
      setDescription('');
      setClientName('');
      setBudget('');
      setStartDate('');
      setEndDate('');
    } catch (error) {
      toast.error('Failed to create project.');
    }
  };

  const columns = [
    { header: 'Project Name', accessor: (row: any) => <span className="font-bold">{row.name}</span> },
    { header: 'Client', accessor: 'clientName' as const },
    { header: 'Budget', accessor: (row: any) => <span>₹{row.budget.toLocaleString('en-IN')}</span> },
    { header: 'Progress', accessor: (row: any) => <ProgressBar progress={row.progress} showPercentage={true} size="sm" /> },
    { header: 'Priority', accessor: 'priority' as const },
    { header: 'Status', accessor: (row: any) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Projects"
        description="Monitor, budget, and manage deliverables across client engagements"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Table className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setIsAddOpen(true)} icon={<Plus className="h-4 w-4" />}>
              Create Project
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : viewMode === 'table' ? (
        <DataTable data={projects} columns={columns} searchKey="name" searchPlaceholder="Search projects by name..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Card key={p.id} hoverEffect className="flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-base leading-snug">{p.name}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-xs text-slate-400 font-semibold">{p.clientName}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                <ProgressBar progress={p.progress} showPercentage={true} size="sm" className="mt-1" />
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{p.deadline}</span>
                  </div>
                  <span>₹{p.budget.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Project" size="lg">
        <form onSubmit={handleAddProject} className="flex flex-col gap-4">
          <Input label="Project Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            <Input type="number" label="Budget (INR)" value={budget} onChange={(e) => setBudget(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <Input type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm outline-none text-slate-900 dark:text-slate-100 focus:border-primary-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
