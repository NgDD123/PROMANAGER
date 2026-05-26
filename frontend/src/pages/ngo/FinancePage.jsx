import React, { useState } from 'react';
import { DollarSign, CreditCard, Users, TrendingUp, Plus, Save, Trash2 } from 'lucide-react';

export default function FinancePage() {
  const [budgets] = useState([
    { id: 1, department: 'Programs', allocated: 250000, spent: 125000 },
    { id: 2, department: 'Finance & Grants', allocated: 90000, spent: 45000 }
  ]);

  const [grants] = useState([
    { id: 1, name: 'Child Sponsorship Grant', donor: 'Global Children Fund', budget: 180000, spent: 72000, utilization: 40, compliance: 'On Track' },
    { id: 2, name: 'Rural Health Outreach', donor: 'International Health Partners', budget: 260000, spent: 114000, utilization: 44, compliance: 'On Track' }
  ]);

  const [payrollRuns] = useState([
    { id: 1, period: 'May 2026', staff: 32, gross: 52000, status: 'Approved / Paid' }
  ]);

  const [donorReports] = useState([
    { id: 1, report: 'Q1 Donor Financial Report', donor: 'Global Children Fund', net: 37000, status: 'Published' }
  ]);

  const [payments] = useState([]);
  const [banks] = useState([
    { id: 1, account: 'Main Operating Bank', bank: 'Equity Bank', currency: 'USD', balance: 118500 }
  ]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalGrantBudget = grants.reduce((sum, g) => sum + g.budget, 0);
  const totalGrantSpent = grants.reduce((sum, g) => sum + g.spent, 0);
  const totalPayroll = payrollRuns.reduce((sum, p) => sum + p.gross, 0);
  const totalDonorNet = donorReports.reduce((sum, r) => sum + r.net, 0);
  const totalBankBalance = banks.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Finance Workspace</h1>
          <p className="text-sm text-gray-600 mt-1">Manage budgets, grants, payroll approvals, and donor financial reports</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Financial Overview */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard icon={DollarSign} label="Department Budgets" value={`$${(totalBudget / 1000).toFixed(0)}k`} />
          <MetricCard icon={TrendingUp} label="Grant Budget" value={`$${(totalGrantBudget / 1000).toFixed(0)}k`} />
          <MetricCard icon={TrendingUp} label="Grant Spent" value={`$${(totalGrantSpent / 1000).toFixed(0)}k`} />
          <MetricCard icon={Users} label="Payroll" value={`$${(totalPayroll / 1000).toFixed(0)}k`} />
          <MetricCard icon={DollarSign} label="Donor Net" value={`$${(totalDonorNet / 1000).toFixed(0)}k`} />
          <MetricCard icon={CreditCard} label="Bank Balance" value={`$${(totalBankBalance / 1000).toFixed(1)}k`} />
        </section>

        {/* Readiness Checklist */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">Finance Readiness</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <StatusBadge label="Finance department exists" status="ready" />
            <StatusBadge label="Budgets allocated" status="ready" />
            <StatusBadge label="Grant compliance tracked" status="ready" />
            <StatusBadge label="Payroll approved" status="ready" />
            <StatusBadge label="Donor report published" status="ready" />
          </div>
        </section>

        {/* Grants Management */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Grant Management</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 whitespace-nowrap shrink-0">
              <Plus className="w-4 h-4" />
              Add Grant
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Grant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Donor</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Budget</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Spent</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Utilization</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {grants.map(grant => (
                  <tr key={grant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{grant.name}</td>
                    <td className="px-4 py-3 text-sm">{grant.donor}</td>
                    <td className="px-4 py-3 text-sm text-right">${grant.budget.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">${grant.spent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">{grant.utilization}%</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">{grant.compliance}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Payroll Runs */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Payroll Approval</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 whitespace-nowrap shrink-0">
              <Plus className="w-4 h-4" />
              Add Payroll
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Period</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Staff</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Gross Pay</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payrollRuns.map(payroll => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{payroll.period}</td>
                    <td className="px-4 py-3 text-sm text-right">{payroll.staff}</td>
                    <td className="px-4 py-3 text-sm text-right">${payroll.gross.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">{payroll.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Donor Reports */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Donor Reports</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 whitespace-nowrap shrink-0">
              <Plus className="w-4 h-4" />
              Add Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Report</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Donor</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Net</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {donorReports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{report.report}</td>
                    <td className="px-4 py-3 text-sm">{report.donor}</td>
                    <td className="px-4 py-3 text-sm text-right">${report.net.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">{report.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bank Reconciliation */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">Bank Reconciliation</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Account</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Bank</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Currency</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Reconciled</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {banks.map(bank => (
                  <tr key={bank.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{bank.account}</td>
                    <td className="px-4 py-3 text-sm">{bank.bank}</td>
                    <td className="px-4 py-3 text-sm text-center">{bank.currency}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">${bank.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, status }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
      <div className="w-2 h-2 rounded-full bg-green-600"></div>
      <span className="text-sm font-medium text-green-900">{label}</span>
    </div>
  );
}
