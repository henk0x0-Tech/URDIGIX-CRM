import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { taskService } from '../../services/dataService';
import { Plus, Kanban, List, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskService.create({
        title,
        description,
        projectName,
        assigneeName,
        dueDate,
        priority: priority as any,
        status: 'pending',
        estimatedHours: 8,
        loggedHours: 0,
        createdAt: new Date().toISOString().split('T')[0],
      });
      toast.success('Task created successfully!');
      setIsAddOpen(false);
      fetchTasks();
      setTitle('');
      setDescription('');
      setProjectName('');
      setAssigneeName('');
      setDueDate('');
    } catch (error) {
      toast.error('Failed to create task.');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await taskService.update(taskId, { status: newStatus as any });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      toast.success('Task status updated!');
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const columns = [
    { name: 'Pending', status: 'pending' },
    { name: 'In Progress', status: 'in_progress' },
    { name: 'In Review', status: 'review' },
    { name: 'Completed', status: 'completed' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Tasks"
        description="Plan, prioritize, and track individual items across projects"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Kanban className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-slate-855 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setIsAddOpen(true)} icon={<Plus className="h-4 w-4" />}>
              Add Task
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board using Native Drag and Drop */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="flex flex-col gap-4 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 p-4 rounded-2xl min-h-[50vh]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const taskId = e.dataTransfer.getData('text/plain');
                  updateTaskStatus(taskId, col.status);
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wider uppercase">
                    {col.name}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 select-none"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400">{t.projectName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${t.priority === 'critical' || t.priority === 'high' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {t.priority}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{t.title}</span>
                        <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>{t.assigneeName}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {t.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              <tr>
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map((t) => (
                <tr key={t.id} className="table-row-hover text-slate-700 dark:text-slate-300">
                  <td className="px-6 py-4 font-bold">{t.title}</td>
                  <td className="px-6 py-4">{t.projectName}</td>
                  <td className="px-6 py-4">{t.assigneeName}</td>
                  <td className="px-6 py-4">{t.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.priority === 'critical' || t.priority === 'high' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-slate-100 text-slate-600'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Task" size="lg">
        <form onSubmit={handleAddTask} className="flex flex-col gap-4">
          <Input label="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
            <Input label="Assignee Name" value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="date" label="Due Date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
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
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksPage;
