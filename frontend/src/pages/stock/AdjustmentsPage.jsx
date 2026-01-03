import React, { useState } from 'react';
import { useStock } from '../../context/stockContext';
import StockTable from '../../components/stock/StockTable';

export default function AdjustmentsPage() {
  const { adjustments, products, loading, addItem, updateItem, deleteItem } =
    useStock();

  const [form, setForm] = useState({
    productId: '',
    type: '',
    quantity: 1,
    reason: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === 'productId') {
      const selected = products.find((p) => p.id === value);
      if (selected) updatedForm.product = selected.name;
    }

    if (name === 'quantity') updatedForm.quantity = Number(value);

    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId) return alert('Please select a product.');

    const now = new Date().toISOString();

    await addItem('adjustment', {
      productId: form.productId,
      product: form.product,
      type: form.type || 'Unknown',
      quantity: Number(form.quantity),
      reason: form.reason || 'No reason provided',
      date: now,
      createdAt: now,
      updatedAt: now,
    });

    setForm({ productId: '', type: '', quantity: 1, reason: '' });
  };

  const fields = [
    { name: 'product', label: 'Product Name' },
    { name: 'type', label: 'Adjustment Type' },
    { name: 'quantity', label: 'Quantity' },
    { name: 'reason', label: 'Reason' },
    { name: 'date', label: 'Adjustment Date' },
    { name: 'createdAt', label: 'Created At' },
    { name: 'updatedAt', label: 'Updated At' },
  ];

  const transformedAdjustments = adjustments.map((a) => ({
    ...a,
    quantity: Number(a.quantity || 0),
    createdAt: a.createdAt?._seconds
      ? new Date(a.createdAt._seconds * 1000)
      : new Date(a.createdAt || Date.now()),
    updatedAt: a.updatedAt?._seconds
      ? new Date(a.updatedAt._seconds * 1000)
      : new Date(a.updatedAt || Date.now()),
  }));

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Adjustments</h1>
      </div>

      <StockTable
        title='Adjustments'
        data={transformedAdjustments}
        fields={fields}
        addItem={handleSubmit}
        updateItem={(id, data) => updateItem('adjustment', id, data)}
        deleteItem={(id) => deleteItem('adjustment', id)}
        loading={loading}
      />
    </div>
  );
}
