import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertCircle, Plus, Download } from 'lucide-react';

export default function AuditPage() {
  const [chartOfAccounts] = useState([
    { code: '1000', account: 'Cash on Hand', type: 'Asset', fund: 'Unrestricted' },
    { code: '1010', account: 'Operating Bank Account', type: 'Asset', fund: 'Unrestricted' },
    { code: '1020', account: 'Restricted Grant Bank Account', type: 'Asset', fund: 'Restricted' },
    { code: '2000', account: 'Accounts Payable', type: 'Liability', fund: 'Unrestricted' },
    { code: '3000', account: 'Net Assets Without Donor Restrictions', type: 'Net Assets', fund: 'Unrestricted' },
    { code: '4000', account: 'Unrestricted Contributions', type: 'Revenue', fund: 'Unrestricted' },
    { code: '5000', account: 'Program Supplies and Materials', type: 'Expense', fund: 'Restricted' }
  ]);

  const [journalEntries] = useState([
    { reference: 'DON-001', debit: '1000', credit: '4000', amount: 90000, status: 'posted' },
    { reference: 'PV-2026-001', debit: '5000', credit: '1000', amount: 18500, status: 'posted' }
  ]);

  const [paymentVouchers] = useState([]);

  const totalDebits = journalEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalCredits = journalEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const isBalanced = totalDebits === totalCredits;

  const auditControls = [
    { control: 'Double-entry journal', status: isBalanced ? 'Balanced' : 'Unbalanced' },
    { control: 'Bank reconciliation', status: 'Available' },
    { control: 'Restricted funds', status: 'Tracked' },
    { control: 'Payment approvals', status: 'Pending approvals' },
    { control: 'Donor reporting', status: 'Published' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Workspace</h1>
          <p className="text-sm text-gray-600 mt-1">Chart of accounts, journal entries, trial balance, and audit controls</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Audit Status Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard 
            icon={FileText} 
            label="Chart of Accounts" 
            value={`${chartOfAccounts.length} accounts`}
            status="ready"
          />
          <StatusCard 
            icon={CheckCircle2} 
            label="Trial Balance" 
            value={isBalanced ? 'Balanced' : 'Unbalanced'}
            status={isBalanced ? 'ready' : 'warning'}
          />
          <StatusCard 
            icon={FileText} 
            label="Payment Vouchers" 
            value={`${paymentVouchers.length} payments`}
            status="ready"
          />
        </section>

        {/* Audit Controls */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">Audit Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {auditControls.map((item, index) => (
              <ControlBadge key={index} control={item.control} status={item.status} />
            ))}
          </div>
        </section>

        {/* Chart of Accounts */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Chart of Accounts</h2>
              <p className="text-sm text-gray-600">{chartOfAccounts.length} accounts configured</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Account</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Fund</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {chartOfAccounts.map(account => (
                  <tr key={account.code} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-semibold">{account.code}</td>
                    <td className="px-4 py-3 text-sm">{account.account}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getTypeColor(account.type)}`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getFundColor(account.fund)}`}>
                        {account.fund}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Double-Entry Journal */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Double-Entry Journal</h2>
              <p className="text-sm text-gray-600">{journalEntries.length} posted entries</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              Add Journal Entry
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Reference</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Debit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Credit</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {journalEntries.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{entry.reference}</td>
                    <td className="px-4 py-3 text-sm font-mono">{entry.debit}</td>
                    <td className="px-4 py-3 text-sm font-mono">{entry.credit}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">${entry.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded capitalize">{entry.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Trial Balance */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Trial Balance</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Total Debits</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-1">${totalDebits.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Total Credits</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-900 mt-1">${totalCredits.toLocaleString()}</p>
            </div>
            <div className={`p-4 border rounded-lg ${isBalanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-sm font-medium ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>Balance Status</p>
              <p className={`text-xl sm:text-2xl font-bold mt-1 ${isBalanced ? 'text-green-900' : 'text-red-900'}`}>
                {isBalanced ? 'Balanced' : 'Unbalanced'}
              </p>
            </div>
          </div>
        </section>

        {/* Statement of Activities */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">Statement of Activities</h2>
          <div className="space-y-3">
            <StatementLine label="Donor income" amount={90000} />
            <StatementLine label="Grant spending" amount={186000} negative />
            <StatementLine label="Payroll expense" amount={52000} negative />
            <StatementLine label="Payment vouchers" amount={0} negative />
            <div className="border-t-2 border-gray-300 pt-3 mt-3">
              <StatementLine label="Net surplus / deficit" amount={-148000} isTotal />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, status }) {
  const colors = {
    ready: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-lg ${colors[status]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-base sm:text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function ControlBadge({ control, status }) {
  const isGood = status === 'Balanced' || status === 'Available' || status === 'Tracked' || status === 'Published';
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${isGood ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      {isGood ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <AlertCircle className="w-4 h-4 text-amber-600" />
      )}
      <div>
        <p className={`text-xs font-semibold ${isGood ? 'text-green-900' : 'text-amber-900'}`}>{control}</p>
        <p className={`text-xs ${isGood ? 'text-green-700' : 'text-amber-700'}`}>{status}</p>
      </div>
    </div>
  );
}

function StatementLine({ label, amount, negative, isTotal }) {
  const displayAmount = negative ? -Math.abs(amount) : amount;
  const isNegative = displayAmount < 0;
  
  return (
    <div className={`flex justify-between items-center ${isTotal ? 'font-bold text-lg' : ''}`}>
      <span className={isTotal ? 'text-gray-900' : 'text-gray-700'}>{label}</span>
      <span className={isNegative ? 'text-red-600' : 'text-gray-900'}>
        ${Math.abs(displayAmount).toLocaleString()}
      </span>
    </div>
  );
}

function getTypeColor(type) {
  const colors = {
    'Asset': 'bg-blue-100 text-blue-800',
    'Liability': 'bg-red-100 text-red-800',
    'Net Assets': 'bg-purple-100 text-purple-800',
    'Revenue': 'bg-green-100 text-green-800',
    'Expense': 'bg-orange-100 text-orange-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

function getFundColor(fund) {
  const colors = {
    'Unrestricted': 'bg-emerald-100 text-emerald-800',
    'Restricted': 'bg-amber-100 text-amber-800',
    'Board Designated': 'bg-indigo-100 text-indigo-800'
  };
  return colors[fund] || 'bg-gray-100 text-gray-800';
}
