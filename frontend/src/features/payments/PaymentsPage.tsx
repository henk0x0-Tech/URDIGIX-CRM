import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { paymentService } from '../../services/dataService';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [transactionId, setTransactionId] = useState('');
  const [date, setDate] = useState('');

  const fetchPayments = async () => {
    try {
      const data = await paymentService.getAll();
      setPayments(data);
    } catch (error) {
      toast.error('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentService.create({
        invoiceNumber,
        clientName,
        amount: Number(amount),
        method: method as any,
        transactionId,
        date,
        status: 'completed',
        createdAt: new Date().toISOString().split('T')[0],
      });
      toast.success('Payment recorded successfully!');
      setIsAddOpen(false);
      fetchPayments();
      setInvoiceNumber('');
      setClientName('');
      setAmount('');
      setTransactionId('');
      setDate('');
    } catch (error) {
      toast.error('Failed to record payment.');
    }
  };

  const columns = [
    { header: 'Transaction ID', accessor: (row: any) => <span className="font-bold">{row.transactionId || 'N/A'}</span> },
    { header: 'Invoice #', accessor: 'invoiceNumber' as const },
    { header: 'Client', accessor: 'clientName' as const },
    { header: 'Amount', accessor: (row: any) => <span>₹{row.amount.toLocaleString('en-IN')}</span> },
    { header: 'Method', accessor: 'method' as const },
    { header: 'Date', accessor: 'date' as const },
    { header: 'Status', accessor: (row: any) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Payments"
        description="Track incoming and outgoing business transactions"
        actions={
          <Button onClick={() => setIsAddOpen(true)} icon={<Plus className="h-4 w-4" />}>
            Record Payment
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <DataTable data={payments} columns={columns} searchKey="invoiceNumber" searchPlaceholder="Search payments by invoice number..." />
      )}

      {/* Record Payment Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record New Payment" size="lg">
        <form onSubmit={handleAddPayment} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
            <Input label="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="number" label="Amount Received (INR)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <Input label="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="date" label="Payment Date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm outline-none text-slate-900 dark:text-slate-100 focus:border-primary-500"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Record Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
