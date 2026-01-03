import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useStock } from '../../context/stockContext';
import StockTable from '../../components/stock/StockTable';
import { formatCurrency, supportedCurrencies } from '../../utils/format';

export default function ExpensesPage() {
  const { expenses, loading, addExpense, removeExpense, refreshExpenses } =
    useExpenses();
  const { accountSettings, loading: accountsLoading } = useStock();

  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    expenseAccount: '',
    expenseAccountName: '',
    paymentAccount: '',
    paymentAccountName: '',
    supplierName: '',
    supplierAddress: '',
    supplierContact: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalAmount: 0,
    currency: 'RWF',
    expenseDate: new Date().toISOString().slice(0, 10),
  });

  // Update totalAmount when quantity or unitPrice changes
  useEffect(() => {
    const q = Number(form.quantity) || 0;
    const p = Number(form.unitPrice) || 0;
    setForm((prev) => ({ ...prev, totalAmount: q * p }));
  }, [form.quantity, form.unitPrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.expenseAccount) return alert('Please select an Expense Account.');
    if (!form.paymentAccount) return alert('Please select a Payment Account.');
    if (!form.supplierName) return alert('Supplier Name is required.');

    try {
      await addExpense(form);
      setFormVisible(false);
      refreshExpenses();
    } catch (err) {
      console.error('❌ Expense submission failed:', err);
      alert(
        'Failed to save expense: ' + (err.response?.data?.error || err.message)
      );
    }
  };

  const fields = [
    { name: 'expenseAccountName', label: 'Expense Account' },
    { name: 'supplierName', label: 'Supplier' },
    { name: 'description', label: 'Description' },
    { name: 'totalAmount', label: 'Total', type: 'currency' },
    { name: 'currency', label: 'Currency' },
    { name: 'date', label: 'Date' },
  ];

  return (
    <div className='flex bg-gray-50 min-h-screen'>
      {/* LEFT SIDE: Expense List */}
      <div className='flex-1 p-6 border-r border-gray-200'>
        <div className='bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden'>
          <StockTable
            title='Expenses'
            data={expenses} // Use normalized data from context
            fields={fields}
            loading={loading || accountsLoading}
            deleteItem={(id) => removeExpense(id)}
            onAdd={() => setFormVisible(!formVisible)}
          />
        </div>
      </div>

      {/* RIGHT SIDE: Add Expense Form */}
      {formVisible && (
        <div className='fixed top-0 right-0 w-[700px] h-full bg-white shadow-2xl border-l border-gray-200 z-50 p-6 overflow-y-auto transition-transform duration-300'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4'>
            Add Expense
          </h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Expense Account */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Expense Account
              </label>
              <select
                name='expenseAccount'
                value={form.expenseAccount}
                onChange={(e) => {
                  const acc = accountSettings.find(
                    (a) => a.id === e.target.value
                  );
                  setForm((prev) => ({
                    ...prev,
                    expenseAccount: acc?.id,
                    expenseAccountName: acc?.name,
                  }));
                }}
                className='border w-full p-2 rounded'
                required
              >
                <option value=''>Select Expense Account</option>
                {accountSettings
                  .filter((a) => a.category?.toLowerCase() === 'expenses')
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Payment Account */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Payment Account
              </label>
              <select
                name='paymentAccount'
                value={form.paymentAccount}
                onChange={(e) => {
                  const acc = accountSettings.find(
                    (a) => a.id === e.target.value
                  );
                  setForm((prev) => ({
                    ...prev,
                    paymentAccount: acc?.id,
                    paymentAccountName: acc?.name,
                  }));
                }}
                className='border w-full p-2 rounded'
                required
              >
                <option value=''>Select Payment Account</option>
                {accountSettings
                  .filter((a) =>
                    ['assets', 'cash', 'bank'].includes(
                      a.category?.toLowerCase()
                    )
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Supplier Details */}
            <input
              type='text'
              name='supplierName'
              value={form.supplierName}
              onChange={handleChange}
              placeholder='Supplier Name'
              className='border w-full p-2 rounded'
              required
            />
            <input
              type='text'
              name='supplierContact'
              value={form.supplierContact}
              onChange={handleChange}
              placeholder='Supplier Contact'
              className='border w-full p-2 rounded'
            />
            <input
              type='text'
              name='supplierAddress'
              value={form.supplierAddress}
              onChange={handleChange}
              placeholder='Supplier Address'
              className='border w-full p-2 rounded'
            />

            {/* Description */}
            <textarea
              name='description'
              value={form.description}
              onChange={handleChange}
              placeholder='Expense Description'
              className='border w-full p-2 rounded'
            />

            {/* Quantity, Unit Price, Total */}
            <div className='grid grid-cols-3 gap-3'>
              <input
                type='number'
                name='quantity'
                value={form.quantity}
                onChange={handleChange}
                className='border w-full p-2 rounded'
                placeholder='Qty'
              />
              <input
                type='number'
                name='unitPrice'
                value={form.unitPrice}
                onChange={handleChange}
                className='border w-full p-2 rounded'
                placeholder='Unit Price'
              />
              <input
                type='text'
                name='totalAmount'
                value={formatCurrency(form.totalAmount, form.currency)}
                readOnly
                className='border w-full p-2 rounded bg-gray-100'
              />
            </div>

            {/* Currency & Date */}
            <select
              name='currency'
              value={form.currency}
              onChange={handleChange}
              className='border w-full p-2 rounded'
            >
              {supportedCurrencies.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>

            <input
              type='date'
              name='expenseDate'
              value={form.expenseDate}
              onChange={handleChange}
              className='border w-full p-2 rounded'
            />

            <button
              type='submit'
              className='w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg'
            >
              Save Expense
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
