import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  DollarSign,
  Plus,
  CheckCircle,
  Clock,
  Printer,
  Receipt,
  X,
  AlertCircle,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { StatusBadge } from '../components/StatusBadge';
import { Invoice } from '../types/lis';

export const BillingView: React.FC = () => {
  const { currentLab, invoices, recordPayment } = useLIS();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Payment Recording Modal State
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('POS Card Terminal');

  // Receipt Modal State
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.patientName.toLowerCase().includes(term) ||
      inv.requestNumber.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Financial aggregates
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);

  const handleOpenPayment = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPaymentAmount(inv.balance);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice || paymentAmount <= 0) return;

    recordPayment(payingInvoice.id, Number(paymentAmount), paymentMethod);
    setPayingInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-700" />
            Laboratory Billing, Invoicing & Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic pricing settlements, partial payments, receipts, and receivables ledger in {currentLab.currency} ({currentLab.currencySymbol}).
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Total Invoiced
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {currentLab.currencySymbol}{totalInvoiced.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{invoices.length} billing statements</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 block">
            Revenue Collected
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {currentLab.currencySymbol}{totalCollected.toLocaleString()}
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5">Cleared through cashier & POS</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 block">
            Outstanding Balance
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {currentLab.currencySymbol}{totalOutstanding.toLocaleString()}
          </div>
          <p className="text-[10px] text-amber-600 mt-0.5">Pending patient settlement</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice #, order #, or patient name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-hidden font-medium"
          >
            <option value="all">All Invoices</option>
            <option value="paid">Fully Paid</option>
            <option value="partial">Partial Payment</option>
            <option value="unpaid">Unpaid / Due</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient / Order #</th>
                <th className="py-3 px-4">Items / Tests</th>
                <th className="py-3 px-3">Total Payable</th>
                <th className="py-3 px-3">Paid Amount</th>
                <th className="py-3 px-3">Balance</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No billing statements found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-teal-800">
                      {inv.invoiceNumber}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        {new Date(inv.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{inv.patientName}</p>
                      <span className="font-mono text-[10px] text-slate-500 block">{inv.requestNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-700 max-w-xs">
                        {inv.items.map((it) => it.testName).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {currentLab.currencySymbol}{inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-emerald-700">
                      {currentLab.currencySymbol}{inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-amber-700">
                      {currentLab.currencySymbol}{inv.balance.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge type="payment" value={inv.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.balance > 0 && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-semibold text-xs transition-colors"
                          >
                            Record Payment
                          </button>
                        )}
                        <button
                          onClick={() => setReceiptInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Print Thermal Cash Receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold">Record Diagnostic Payment</h2>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <p className="font-semibold text-slate-900">{payingInvoice.patientName}</p>
                <p className="text-slate-500">
                  Invoice: {payingInvoice.invoiceNumber} • Remaining Balance: {currentLab.currencySymbol}{payingInvoice.balance.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Amount Received ({currentLab.currencySymbol}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={payingInvoice.balance}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Gateway / Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                >
                  <option value="POS Card Terminal">POS Card Terminal</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cash Cashier">Cash Desk</option>
                  <option value="Health Insurance (HMO)">HMO Settlement</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold shadow-xs"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Printable Modal */}
      {receiptInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">Payment Receipt</span>
              <button
                onClick={() => setReceiptInvoice(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 font-mono text-xs text-slate-800 space-y-4">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h3 className="font-bold text-sm text-slate-900">{currentLab.name}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{currentLab.address}</p>
                <p className="text-[10px] text-slate-500">Tel: {currentLab.phone}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Receipt No:</span>
                  <span className="font-bold">{receiptInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Ref:</span>
                  <span>{receiptInvoice.requestNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Patient:</span>
                  <span className="font-bold">{receiptInvoice.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date/Time:</span>
                  <span>{new Date(receiptInvoice.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
                {receiptInvoice.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[170px]">{it.testName}</span>
                    <span>{currentLab.currencySymbol}{it.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{currentLab.currencySymbol}{receiptInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Amount Paid:</span>
                  <span>{currentLab.currencySymbol}{receiptInvoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Outstanding:</span>
                  <span>{currentLab.currencySymbol}{receiptInvoice.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Method:</span>
                  <span>{receiptInvoice.paymentMethod || 'Cash Desk'}</span>
                </div>
              </div>

              <div className="text-center border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-500">
                <p>Thank you for choosing {currentLab.name}</p>
                <p className="mt-0.5">Retain receipt for diagnostic report collection</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                onClick={() => setReceiptInvoice(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
