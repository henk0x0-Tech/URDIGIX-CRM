import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { clientService } from '../../services/dataService';
import { Plus, Table, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const fetchClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      toast.error('Failed to load clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clientService.create({
        name,
        contactPerson,
        email,
        phone,
        company,
        industry,
        address,
        city,
        state,
        pincode,
        status: 'active',
        totalProjects: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString().split('T')[0],
      } as any);
      toast.success('Client added successfully!');
      setIsAddOpen(false);
      fetchClients();
      // Clear fields
      setName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setCompany('');
      setIndustry('');
      setAddress('');
      setCity('');
      setState('');
      setPincode('');
    } catch (error) {
      toast.error('Failed to add client.');
    }
  };

  const columns = [
    { header: 'Company Name', accessor: (row: any) => <span className="font-bold">{row.company}</span> },
    { header: 'Contact Person', accessor: 'contactPerson' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Phone', accessor: 'phone' as const },
    { header: 'Industry', accessor: 'industry' as const },
    { header: 'Status', accessor: (row: any) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Clients"
        description="Manage your enterprise accounts and contacts"
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
              Add Client
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : viewMode === 'table' ? (
        <DataTable data={clients} columns={columns} searchKey="company" searchPlaceholder="Search clients by company name..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((c) => (
            <Card key={c.id} hoverEffect className="flex flex-col justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-base">{c.company}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{c.industry}</p>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div><span className="font-bold">Contact:</span> {c.contactPerson}</div>
                  <div><span className="font-bold">Email:</span> {c.email}</div>
                  <div><span className="font-bold">Phone:</span> {c.phone}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Client" size="lg">
        <form onSubmit={handleAddClient} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company Name" value={company} onChange={(e) => { setCompany(e.target.value); setName(e.target.value); }} required />
            <Input label="Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="email" label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} required />
            <Input label="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
            <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Save Client</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
