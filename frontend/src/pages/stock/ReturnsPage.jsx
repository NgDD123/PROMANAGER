import React from 'react';
import { useStock } from '../../context/stockContext';
import StockTable from '../../components/stock/StockTable';

export default function ReturnsPage() {
  const { returns, addItem, updateItem, deleteItem, loading } = useStock();

  const fields = [
    { name: 'product', label: 'Product Name' },
    { name: 'customer', label: 'Customer' },
    { name: 'quantity', label: 'Quantity' },
    { name: 'reason', label: 'Return Reason' },
    { name: 'date', label: 'Return Date' },
    { name: 'createdAt', label: 'Created At' },
    { name: 'updatedAt', label: 'Updated At' },
  ];

  const transformedReturns = returns.map((r) => ({
    ...r,
    quantity: Number(r.quantity || 0),
    createdAt: r.createdAt?._seconds
      ? new Date(r.createdAt._seconds * 1000)
      : new Date(r.createdAt || Date.now()),
    updatedAt: r.updatedAt?._seconds
      ? new Date(r.updatedAt._seconds * 1000)
      : new Date(r.updatedAt || Date.now()),
  }));

  const handleAddReturn = async (data) => {
    const now = new Date().toISOString();
    await addItem('return', {
      ...data,
      quantity: Number(data.quantity),
      date: now,
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <StockTable
      title='Returns'
      data={transformedReturns}
      fields={fields}
      addItem={handleAddReturn}
      updateItem={(id, data) => updateItem('return', id, data)}
      deleteItem={(id) => deleteItem('return', id)}
      loading={loading}
    />
  );
}
