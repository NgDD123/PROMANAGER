import React, { useState } from 'react';
import { useStock } from '../../context/stockContext';
import StockTable from '../../components/stock/StockTable';

export default function TransfersPage() {
  const { transfers, products, loading, addItem, updateItem, deleteItem } =
    useStock();

  const [form, setForm] = useState({
    productId: '',
    fromLocation: '',
    toLocation: '',
    quantity: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    // Auto-fill product name when product is selected
    if (name === 'productId') {
      const selected = products.find((p) => p.id === value);
      if (selected) {
        updatedForm.product = selected.name;
      }
    }

    // Ensure quantity is a number
    if (name === 'quantity') {
      updatedForm.quantity = Number(value);
    }

    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId) return alert('Please select a product.');

    await addItem('transfer', {
      productId: form.productId,
      product: form.product,
      fromLocation: form.fromLocation || 'Unknown',
      toLocation: form.toLocation || 'Unknown',
      quantity: Number(form.quantity),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setForm({ productId: '', fromLocation: '', toLocation: '', quantity: 1 });
  };

  const fields = [
    { name: 'product', label: 'Product Name' },
    { name: 'fromLocation', label: 'From' },
    { name: 'toLocation', label: 'To' },
    { name: 'quantity', label: 'Quantity' },
    { name: 'date', label: 'Transfer Date' },
    { name: 'createdAt', label: 'Created At' },
    { name: 'updatedAt', label: 'Updated At' },
  ];

  // Transform transfers for proper display
  const transformedTransfers = transfers.map((t) => ({
    ...t,
    quantity: Number(t.quantity || 0),
    createdAt:
      t.createdAt instanceof Date
        ? t.createdAt
        : t.createdAt?._seconds
        ? new Date(t.createdAt._seconds * 1000)
        : new Date(t.createdAt || Date.now()),
    updatedAt:
      t.updatedAt instanceof Date
        ? t.updatedAt
        : t.updatedAt?._seconds
        ? new Date(t.updatedAt._seconds * 1000)
        : new Date(t.updatedAt || Date.now()),
  }));

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Transfers</h1>
      </div>

      <StockTable
        title='Transfers'
        data={transformedTransfers}
        fields={fields}
        addItem={(collection, data) => addItem('transfer', data)}
        updateItem={(id, data) => updateItem('transfer', id, data)}
        deleteItem={(id) => deleteItem('transfer', id)}
        loading={loading}
      />
    </div>
  );
}
