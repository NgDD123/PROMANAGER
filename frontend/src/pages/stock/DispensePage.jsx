import React, { useState } from 'react';
import { useStock } from '../../context/stockContext';
import StockTable from '../../components/stock/StockTable';

export default function DispensePage() {
  const { dispenses, products, loading, addItem, updateItem, deleteItem } =
    useStock();

  const [form, setForm] = useState({
    productId: '',
    customer: '',
    quantity: 1,
    price: 0,
    total: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    // Auto-fill price when product is selected
    if (name === 'productId') {
      const selected = products.find((p) => p.id === value);
      if (selected) {
        updatedForm.price = selected.price || 0;
        updatedForm.product = selected.name;
      }
    }

    // Auto-calculate total
    if (name === 'quantity' || name === 'price') {
      updatedForm.total = (updatedForm.quantity * updatedForm.price).toFixed(2);
    }

    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId) return alert('Please select a product.');

    await addItem('dispense', {
      productId: form.productId,
      product: form.product,
      customer: form.customer || 'Unknown Customer',
      quantity: Number(form.quantity),
      price: Number(form.price),
      total: Number(form.total),
      date: new Date().toISOString(),
    });

    setForm({ productId: '', customer: '', quantity: 1, price: 0, total: 0 });
  };

  const fields = [
    { name: 'product', label: 'Product Name' },
    { name: 'customer', label: 'Customer' },
    { name: 'quantity', label: 'Quantity' },
    { name: 'price', label: 'Unit Price', type: 'currency' },
    { name: 'total', label: 'Total', type: 'currency' },
    { name: 'date', label: 'Dispense Date' },
  ];

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden'>
        <StockTable
          title='Dispenses'
          data={dispenses}
          fields={fields}
          addItem={(collection, data) => addItem('dispense', data)}
          updateItem={(id, data) => updateItem('dispense', id, data)}
          deleteItem={(id) => deleteItem('dispense', id)}
          loading={loading}
          onAdd={() => {
            const form = { productId: '', customer: '', quantity: 1, price: 0, total: 0 };
            setForm(form);
            // You might want to show a dialog here instead
            alert('Add dispense functionality - implement dialog/modal');
          }}
        />
      </div>
    </div>
  );
}
