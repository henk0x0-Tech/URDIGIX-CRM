import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { invoiceService } from '../../services/dataService';
import { Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [total, setTotal] = useState('');

  const fetchInvoices = async () => {
    try {
      const data = await invoiceService.getAll();
      setInvoices(data);
    } catch (error) {
      toast.error('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await invoiceService.create({
        invoiceNumber,
        clientName,
        projectName,
        issueDate,
        dueDate,
        total: Number(total),
        paidAmount: 0,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
      });
      toast.success('Invoice created successfully!');
      setIsAddOpen(false);
      fetchInvoices();
      setInvoiceNumber('');
      setClientName('');
      setProjectName('');
      setIssueDate('');
      setDueDate('');
      setTotal('');
    } catch (error) {
      toast.error('Failed to create invoice.');
    }
  };

  const handleDownloadPDF = (invNumber: string) => {
    toast.success(`Downloading PDF for ${invNumber}...`);
  };

  const columns = [
    { header: 'Invoice #', accessor: (row: any) => <span className="font-bold">{row.invoiceNumber}</span> },
    { header: 'Client', accessor: 'clientName' as const },
    { header: 'Project', accessor: 'projectName' as const },
    { header: 'Issue Date', accessor: 'issueDate' as const },
    { header: 'Due Date', accessor: 'dueDate' as const },
    { header: 'Amount', accessor: (row: any) => <span>₹{row.total.toLocaleString('en-IN')}</span> },
    { header: 'Status', accessor: (row: any) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownloadPDF(row.invoiceNumber)}
          icon={<Download className="h-3.5 w-3.5" />}
        >
          PDF
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Invoices"
        description="Billing operations, tax, discounts, and payments management"
        actions={
          <Button onClick={() => setIsAddOpen(true)} icon={<Plus className="h-4 w-4" />}>
            Create Invoice
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <DataTable data={invoices} columns={columns} searchKey="invoiceNumber" searchPlaceholder="Search invoices by invoice number..." />
      )}

      {/* Create Invoice Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Invoice" size="lg">
        <form onSubmit={handleAddInvoice} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-2025-001" required />
            <Input label="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>
          <Input label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="date" label="Issue Date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
            <Input type="date" label="Due Date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
          <Input type="number" label="Total Amount (INR)" value={total} onChange={(e) => setTotal(e.target.value)} required />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvoicesPage;
