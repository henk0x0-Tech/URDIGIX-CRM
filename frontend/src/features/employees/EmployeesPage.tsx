import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { employeeService } from '../../services/dataService';
import { Plus, Table, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [salary, setSalary] = useState('');

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      toast.error('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeService.create({
        firstName,
        lastName,
        email,
        phone,
        department,
        designation,
        joinDate,
        salary: Number(salary),
        status: 'active',
        skills: [],
        address: '',
        city: '',
        state: '',
        projectCount: 0,
        taskCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      });
      toast.success('Employee added successfully!');
      setIsAddOpen(false);
      fetchEmployees();
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setDepartment('');
      setDesignation('');
      setJoinDate('');
      setSalary('');
    } catch (error) {
      toast.error('Failed to add employee.');
    }
  };

  const columns = [
    { header: 'Name', accessor: (row: any) => <span className="font-bold">{row.firstName} {row.lastName}</span> },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Department', accessor: 'department' as const },
    { header: 'Designation', accessor: 'designation' as const },
    { header: 'Joining Date', accessor: 'joinDate' as const },
    { header: 'Status', accessor: (row: any) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Team Members"
        description="Manage company staff, departments, salaries, and assignments"
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
              Add Employee
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : viewMode === 'table' ? (
        <DataTable data={employees} columns={columns} searchKey="firstName" searchPlaceholder="Search employees by first name..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <Card key={emp.id} hoverEffect className="flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                    {emp.firstName} {emp.lastName}
                  </span>
                  <StatusBadge status={emp.status} />
                </div>
                <p className="text-xs text-slate-400 font-semibold">{emp.designation} • {emp.department}</p>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div><span className="font-bold">Email:</span> {emp.email}</div>
                  <div><span className="font-bold">Phone:</span> {emp.phone}</div>
                  <div><span className="font-bold">Joining Date:</span> {emp.joinDate}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Employee" size="lg">
        <form onSubmit={handleAddEmployee} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="email" label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
            <Input label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="date" label="Joining Date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required />
            <Input type="number" label="Monthly Salary (INR)" value={salary} onChange={(e) => setSalary(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Save Employee</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
