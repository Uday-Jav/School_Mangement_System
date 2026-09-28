import React, { useState, useEffect } from 'react';
import { canMutateFees } from '../../utils/permissions';
import { PageHeader } from '../common/PageHeader';
import { StatCard } from '../common/StatCard';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Payment, FeeStructure, Student } from '../../types';
import { feeService } from '../../services/feeService';
import { mockFeeStructures, mockPayments, mockStudents } from '../../data/mockData';
import { DollarSign, CreditCard, AlertCircle, Printer, Plus, Receipt, CheckCircle2, RotateCcw } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface FeesViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  openRecordPaymentInitially?: boolean;
}

export const FeesView: React.FC<FeesViewProps> = ({ onShowToast, openRecordPaymentInitially = false }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([...mockFeeStructures]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'payments' | 'structure'>('payments');

  // Modals & Receipt
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(openRecordPaymentInitially);
  const [receiptModalPayment, setReceiptModalPayment] = useState<Payment | null>(null);
  const [reversePaymentId, setReversePaymentId] = useState<string | null>(null);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState(mockStudents[0].id);
  const [feeType, setFeeType] = useState('Tuition Fee');
  const [amount, setAmount] = useState(1200);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [txnId, setTxnId] = useState(`UPI${Math.floor(100000000 + Math.random() * 900000000)}`);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    const data = await feeService.getPayments();
    setPayments(data);
    setLoading(false);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = mockStudents.find(s => s.id === selectedStudentId) || mockStudents[0];

    const newPayment = await feeService.recordPayment({
      student_id: student.id,
      student_name: student.full_name,
      class_name: student.class_name,
      section_name: student.section_name,
      roll_no: student.roll_no,
      fee_type: feeType,
      amount: Number(amount),
      payment_date: '2026-08-31',
      payment_method: paymentMethod,
      transaction_id: txnId,
      status: 'Paid',
      received_by: 'Accountant Mark'
    });

    onShowToast('Payment Recorded', `Successfully collected $${amount} from ${student.full_name}`, 'success');
    setIsRecordPaymentOpen(false);
    loadPayments();
    setReceiptModalPayment(newPayment);
  };

  const handleReversePayment = async () => {
    if (!reversePaymentId) return;
    const payment = payments.find(p => p.id === reversePaymentId);
    if (payment) {
      // In a real app we'd update the payment status to refunded
      // For now we'll simulate the update
      await feeService.recordPayment({
        student_id: payment.student_id,
        student_name: payment.student_name,
        class_name: payment.class_name,
        section_name: payment.section_name,
        roll_no: payment.roll_no,
        fee_type: payment.fee_type,
        amount: -payment.amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: payment.payment_method,
        transaction_id: `REV-${payment.transaction_id}`,
        status: 'Refunded',
        received_by: payment.received_by
      });
      onShowToast('Payment Reversed', `Successfully reversed receipt ${payment.receipt_no}`, 'info');
      setReversePaymentId(null);
      loadPayments();
    }
  };

  const columns: Column<Payment>[] = [
    {
      header: 'Receipt No',
      accessorKey: 'receipt_no',
      sortable: true,
      cell: (row) => <span className="font-mono text-indigo-700 font-extrabold">{row.receipt_no}</span>
    },
    {
      header: 'Student Name',
      accessorKey: 'student_name',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-black text-slate-950">{row.student_name}</span>
          <span className="block text-[10px] text-slate-500 font-semibold">{row.class_name}-{row.section_name} (Roll {row.roll_no})</span>
        </div>
      )
    },
    { header: 'Fee Type', accessorKey: 'fee_type', sortable: true },
    {
      header: 'Amount Paid',
      accessorKey: 'amount',
      sortable: true,
      cell: (row) => <span className="font-black text-emerald-800 text-sm">${row.amount}</span>
    },
    { header: 'Method', accessorKey: 'payment_method', sortable: true },
    {
      header: 'Transaction ID',
      accessorKey: 'transaction_id',
      cell: (row) => <span className="font-mono text-[11px]">{row.transaction_id}</span>
    },
    { header: 'Date', accessorKey: 'payment_date', sortable: true },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="FEES & PAYMENTS"
        subtitle="Manage tuition fees, fee schedules, student collections, and issue printable receipts."
        breadcrumbItems={[{ label: 'Fees & Payments' }]}
        primaryAction={{
          label: 'RECORD NEW PAYMENT',
          icon: <CreditCard className="w-4 h-4" />,
          onClick: () => setIsRecordPaymentOpen(true)
        }}
      />

      {/* FEE STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Expected Fees"
          value="$141,100"
          subtitle="Academic Year 2025-26"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          title="Collected Fees"
          value="$126,900"
          subtitle="89.9% Collection Rate"
          icon={CheckCircle2}
          color="emerald"
          trend="+14% MoM"
          trendUp={true}
        />
        <StatCard
          title="Pending Fees"
          value="$14,200"
          subtitle="10 Students Remaining"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Overdue Collection"
          value="$3,800"
          subtitle="Notice Sent to Parents"
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* SUB TABS */}
      <div className="flex border-b-3 border-slate-900 gap-2">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-black text-xs border-t-2 border-x-2 border-slate-900 uppercase ${
            activeTab === 'payments' ? 'bg-indigo-600 text-white -mb-[2px]' : 'bg-white text-slate-900 hover:bg-amber-100'
          }`}
        >
          Payment Transactions
        </button>
        <button
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2 font-black text-xs border-t-2 border-x-2 border-slate-900 uppercase ${
            activeTab === 'structure' ? 'bg-indigo-600 text-white -mb-[2px]' : 'bg-white text-slate-900 hover:bg-amber-100'
          }`}
        >
          Fee Structure Setup
        </button>
      </div>

      {/* TAB CONTENT: PAYMENTS */}
      {activeTab === 'payments' && (
        <DataTable<Payment>
          data={payments}
          columns={columns}
          searchPlaceholder="Search payment by receipt no, student name, TXN ID..."
          keyExtractor={(item) => item.id}
          pageSize={10}
          actions={(row) => (
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setReceiptModalPayment(row)}
                className="p-1.5 bg-amber-300 border border-slate-900 font-extrabold text-[10px] flex items-center gap-1 uppercase hover:bg-amber-400"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>RECEIPT</span>
              </button>
              {row.status !== 'Refunded' && row.amount > 0 && canMutateFees() && (
                <button
                  onClick={() => setReversePaymentId(row.id)}
                  className="p-1.5 bg-slate-100 border border-slate-900 font-extrabold text-[10px] flex items-center gap-1 uppercase hover:bg-slate-200"
                  title="Reverse Payment"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
                </button>
              )}
            </div>
          )}
        />
      )}

      {/* TAB CONTENT: FEE STRUCTURE */}
      {activeTab === 'structure' && (
        <div className="bg-white border-3 border-slate-900 brutal-shadow p-5">
          <h3 className="text-lg font-black text-slate-950 uppercase mb-4">APPROVED FEE STRUCTURE (2025-2026)</h3>
          <div className="overflow-x-auto border-2 border-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase">
                  <th className="p-3">CLASS</th>
                  <th className="p-3">ACADEMIC YEAR</th>
                  <th className="p-3">FEE TYPE</th>
                  <th className="p-3">AMOUNT ($)</th>
                  <th className="p-3">DUE DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 font-bold">
                {feeStructures.map((fs) => (
                  <tr key={fs.id} className="hover:bg-amber-100/50">
                    <td className="p-3 font-extrabold text-indigo-900">{fs.class_name}</td>
                    <td className="p-3">{fs.academic_year}</td>
                    <td className="p-3">{fs.fee_type_name}</td>
                    <td className="p-3 text-emerald-800 font-black text-sm">${fs.amount}</td>
                    <td className="p-3 font-mono">{fs.due_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        title="RECORD FEE PAYMENT"
        subtitle="Collect student tuition, transport or lab fees and issue instant receipt."
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">SELECT STUDENT</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2 bg-white border-2 border-slate-900"
            >
              {mockStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.admission_no}) - {s.class_name}-{s.section_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">FEE TYPE</label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                className="w-full p-2 bg-white border-2 border-slate-900"
              >
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Transport Fee">Transport Fee</option>
                <option value="Library Fee">Library Fee</option>
                <option value="Exam Fee">Exam Fee</option>
                <option value="Laboratory Fee">Laboratory Fee</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">AMOUNT PAID ($)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 bg-white border-2 border-slate-900 font-mono font-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">PAYMENT METHOD</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2 bg-white border-2 border-slate-900"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">TRANSACTION ID / REF</label>
              <input
                type="text"
                required
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                className="w-full p-2 bg-white border-2 border-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button
              type="button"
              onClick={() => setIsRecordPaymentOpen(false)}
              className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white border-2 border-slate-900 font-black uppercase"
            >
              COLLECT & PRINT RECEIPT
            </button>
          </div>
        </form>
      </Modal>

      {/* PRINTABLE FEE RECEIPT MODAL */}
      {receiptModalPayment && (
        <Modal
          isOpen={!!receiptModalPayment}
          onClose={() => setReceiptModalPayment(null)}
          title={`FEE PAYMENT RECEIPT: ${receiptModalPayment.receipt_no}`}
          subtitle="Official Institutional Payment Proof"
          maxWidth="lg"
        >
          <div className="space-y-4 printable-area">
            <div className="p-4 bg-slate-900 text-white border-2 border-slate-900 text-center">
              <h2 className="text-xl font-black uppercase">METRO INTERNATIONAL SCHOOL</h2>
              <p className="text-xs font-bold text-slate-300">MAIN CAMPUS FINANCE DESK</p>
              <div className="mt-1 text-xs font-black text-amber-300">FEE RECEIPT #{receiptModalPayment.receipt_no}</div>
            </div>

            <div className="border-2 border-slate-900 p-3 bg-slate-50 text-xs font-bold space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500">Student Name:</span> <span>{receiptModalPayment.student_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Class & Section:</span> <span>{receiptModalPayment.class_name}-{receiptModalPayment.section_name} (Roll {receiptModalPayment.roll_no})</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Payment Date:</span> <span>{receiptModalPayment.payment_date}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Payment Method:</span> <span>{receiptModalPayment.payment_method}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Transaction Ref:</span> <span className="font-mono">{receiptModalPayment.transaction_id}</span></div>
            </div>

            <div className="border-2 border-slate-900 p-4 bg-emerald-100 flex items-center justify-between text-slate-950 font-black text-sm">
              <span>{receiptModalPayment.fee_type.toUpperCase()}</span>
              <span className="text-xl text-emerald-900">${receiptModalPayment.amount}.00</span>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs font-bold">
              <div>Received By: <strong className="uppercase text-indigo-900">{receiptModalPayment.received_by}</strong></div>
              <div className="border-b-2 border-slate-900 w-32 text-center pb-1">Cashier Seal</div>
            </div>

            <div className="flex justify-end pt-4 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white font-black border-2 border-slate-900 flex items-center gap-2 uppercase text-xs"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>PRINT RECEIPT</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* REVERSE PAYMENT CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!reversePaymentId}
        onClose={() => setReversePaymentId(null)}
        onConfirm={handleReversePayment}
        title="REVERSE PAYMENT"
        message="Are you sure you want to reverse this payment? This will create a refund record."
        confirmText="YES, REVERSE PAYMENT"
      />
    </div>
  );
};
