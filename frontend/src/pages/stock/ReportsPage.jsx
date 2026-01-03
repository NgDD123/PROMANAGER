import React from 'react';
import { useStock } from '../../context/stockContext';
import StockTable from '../../components/stock/StockTable';

export default function ReportsPage() {
  const { reports, loading } = useStock();

  const fields = [
    { name: 'title', label: 'Report Title' },
    { name: 'description', label: 'Description' },
    { name: 'date', label: 'Generated On' },
  ];

  // Read-only dummy handlers
  const dummy = () => {};

  return (
    <StockTable
      title='Reports'
      data={reports}
      fields={fields}
      addItem={dummy}
      updateItem={dummy}
      deleteItem={dummy}
      loading={loading}
    />
  );
}
