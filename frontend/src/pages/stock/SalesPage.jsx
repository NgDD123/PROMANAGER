import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '../../context/stockContext';
import StockTable from '../../components/stock/StockTable';

export default function SalesPage() {
  const navigate = useNavigate();
  const {
    sales,
    productSettings,
    accountSettings,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getProductStock,
    createJournalEntry,
  } = useStock();

  const [formVisible, setFormVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formWidth, setFormWidth] = useState(45);
  const [formHeight, setFormHeight] = useState(65);

  const [form, setForm] = useState({
    productId: '',
    productName: '',   // ✅ ADD THIS
    description: '',
    quantity: 1,
    unit: 'Kg',
    unitPrice: 0,
    discount: 0,
    tax: 0,
    totalPrice: 0,
    batchNumber: '',
    expirationDate: '',
    qualityGrade: '',
    warranty: '',
    serialNumber: '',
    paymentAccountId: '',
    revenueAccountId: '',
    taxPayableAccountId: '',
  });

  // Multi-item cart
  const [cartItems, setCartItems] = useState([]);

  const resetForm = () => {
    setForm({
      productId: '',
      productName: '',   // ✅ ADD THIS
      description: '',
      quantity: 1,
      unit: 'Kg',
      unitPrice: 0,
      discount: 0,
      tax: 0,
      totalPrice: 0,
      batchNumber: '',
      expirationDate: '',
      qualityGrade: '',
      warranty: '',
      serialNumber: '',
      paymentAccountId: '',
      revenueAccountId: '',
      taxPayableAccountId: '',
    });
    setEditingId(null);
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === 'productId') {
      const selected = productSettings.find((ps) => ps.id === value);
      if (selected) {
        updatedForm = {
          ...updatedForm,
          productName: selected.name,
          type: selected.type,
          storeLocation: selected.mainOrSub,
          productCategory: selected.productCategory,
          qualityGrade: selected.quality,
          tax: selected.tax || 0,
        };
      }
    }

    const quantity = Number(updatedForm.quantity) || 0;
    const price = Number(updatedForm.unitPrice) || 0;
    const discount = Number(updatedForm.discount) || 0;
    const tax = Number(updatedForm.tax) || 0;

    const subtotal = quantity * price;
    const discountAmount = discount > 1 ? discount : subtotal * (discount / 100);
    const taxAmount = tax > 1 ? tax : subtotal * (tax / 100);
    updatedForm.totalPrice = subtotal - discountAmount + taxAmount;

    setForm(updatedForm);
  };

  // Add current form item to cart
  // Add current form item to cart
const addToCart = () => {
  if (!form.productId) return alert('Please select a product.');

  const quantity = Number(form.quantity) || 0;
  const unitPrice = Number(form.unitPrice) || 0;
  const discount = Number(form.discount) || 0;
  const tax = Number(form.tax) || 0;

  const subtotal = quantity * unitPrice;
  const discountAmount = discount > 1 ? discount : subtotal * (discount / 100);
  const taxAmount = tax > 1 ? tax : subtotal * (tax / 100);
  const totalPrice = subtotal - discountAmount + taxAmount;

  const item = {
    productId: form.productId,
    productName: form.productName || 'N/A',    // Ensure product name is sent
    description: form.description || '',       // Ensure description is sent
    unit: form.unit || 'Kg',                   // Ensure unit is sent
    quantity,
    unitPrice,
    discount,
    tax,
    totalPrice,
    batchNumber: form.batchNumber,
    expirationDate: form.expirationDate,
    qualityGrade: form.qualityGrade,
    warranty: form.warranty,
    serialNumber: form.serialNumber,
    paymentAccountId: form.paymentAccountId,
    revenueAccountId: form.revenueAccountId,
    taxPayableAccountId: form.taxPayableAccountId,
  };

  setCartItems([...cartItems, item]);
  resetForm();
};


  const removeFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) return alert('Add at least one item to cart.');

    const firstItem = cartItems[0];
    if (!firstItem.paymentAccountId || !firstItem.revenueAccountId) {
      return alert('Select payment & revenue account in first item.');
    }

    try {
      // Map cart items exactly as the invoice expects
      const itemsForSave = cartItems.map((i) => ({
        productName: i.productName,
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
        discount: i.discount,
        tax: i.tax,
        totalPrice: i.totalPrice,
        batchNumber: i.batchNumber,
        expirationDate: i.expirationDate,
        qualityGrade: i.qualityGrade,
        warranty: i.warranty,
        serialNumber: i.serialNumber,
      }));

      const totalPrice = itemsForSave.reduce((acc, i) => acc + Number(i.totalPrice), 0);

      const saved = await addItem('sale', {
        items: itemsForSave,
        totalPrice,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Journal entry
      const taxAmount = cartItems.reduce((acc, i) => acc + Number(i.tax || 0), 0);
      const revenueAmount = totalPrice - taxAmount;

      const journalLines = [
        { accountId: firstItem.paymentAccountId, type: 'debit', amount: totalPrice },
        { accountId: firstItem.revenueAccountId, type: 'credit', amount: revenueAmount },
      ];

      if (taxAmount > 0 && firstItem.taxPayableAccountId) {
        journalLines.push({
          accountId: firstItem.taxPayableAccountId,
          type: 'credit',
          amount: taxAmount,
        });
      }

      await createJournalEntry({
        type: 'sale',
        date: new Date().toISOString(),
        description: 'Multi-item sale',
        referenceId: saved.id,
        lines: journalLines,
      });

      navigate(`/stock/invoice/${saved.id}`, { state: { sale: saved } });
      setCartItems([]);
      resetForm();
      setFormVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setFormVisible(true);
    setEditMode(true);
    setEditingId(item.id);
    setForm(item);
  };

  const handleRowClick = (sale) => {
    navigate(`/stock/invoice/${sale.id}`, { state: { sale } });
  };

  const fields = [
    { name: 'productName', label: 'Item/Service' },
    { name: 'description', label: 'Desc' },
    { name: 'quantity', label: 'Q' },
    { name: 'unit', label: 'Unit' },
    { name: 'unitPrice', label: 'Price', type: 'currency' },
    { name: 'discount', label: 'Disc' },
    { name: 'totalPrice', label: 'Total', type: 'currency' },
    { name: 'batchNumber', label: 'Batch No' },
    { name: 'expirationDate', label: 'Expiry' },
    { name: 'qualityGrade', label: 'Quality' },
    { name: 'warranty', label: 'Warranty' },
    { name: 'serialNumber', label: 'Serial No' },
    { name: 'storeLocation', label: 'Store Location' },
    { name: 'productCategory', label: 'Category' },
  ];

  return (
    <div className='bg-gray-50 min-h-screen p-6'>
      {formVisible && (
        <div
          style={{ width: `${formWidth}%`, height: `${formHeight}vh` }}
          className='ml-auto mb-6 bg-white shadow-2xl border border-gray-200 rounded-2xl p-6 transition-all duration-300 overflow-y-auto'
        >
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>
            {editMode ? 'Edit Sale' : 'Add New Sale'}
          </h2>

          <div className='flex gap-4 mb-4 text-sm text-gray-600'>
            <div>
              <label>Width: {formWidth}%</label>
              <input
                type='range'
                min='20'
                max='35'
                value={formWidth}
                onChange={(e) => setFormWidth(e.target.value)}
                className='w-32 ml-2'
              />
            </div>
            <div>
              <label>Height: {formHeight}vh</label>
              <input
                type='range'
                min='30'
                max='45'
                value={formHeight}
                onChange={(e) => setFormHeight(e.target.value)}
                className='w-32 ml-2'
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className='grid grid-cols-3 gap-3'>
            {/* --- ALL YOUR ORIGINAL FORM FIELDS REMAIN EXACTLY --- */}
            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Item / Service</label>
              <select
                name='productId'
                value={form.productId}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
              >
                <option value=''>Select Product</option>
                {productSettings.map((ps) => (
                  <option key={ps.id} value={ps.id}>{ps.name}</option>
                ))}
              </select>
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Quantity</label>
              <input
                name='quantity'
                value={form.quantity}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
                type='number'
              />
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Unit</label>
              <input
                name='unit'
                value={form.unit}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
              />
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Unit Price</label>
              <input
                name='unitPrice'
                value={form.unitPrice}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
                type='number'
              />
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Discount</label>
              <input
                name='discount'
                value={form.discount}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
                type='number'
              />
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Tax</label>
              <input
                name='tax'
                value={form.tax}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
                type='number'
              />
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Batch Number</label>
              <input
                name='batchNumber'
                value={form.batchNumber}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
              />
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Expiration Date</label>
              <input
                name='expirationDate'
                value={form.expirationDate}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
                type='date'
              />
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Quality Grade</label>
              <input
                name='qualityGrade'
                value={form.qualityGrade}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
              />
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Warranty</label>
              <input
                name='warranty'
                value={form.warranty}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
              />
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Serial Number</label>
              <input
                name='serialNumber'
                value={form.serialNumber}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
              />
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Payment Account</label>
              <select
                name='paymentAccountId'
                value={form.paymentAccountId}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
              >
                <option value=''>Select Account</option>
                {accountSettings.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Revenue Account</label>
              <select
                name='revenueAccountId'
                value={form.revenueAccountId}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
              >
                <option value=''>Select Revenue Account</option>
                {accountSettings
                  .filter((acc) => acc.name.toLowerCase().includes('revenue'))
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
              </select>
            </div>

            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Tax Payable Account</label>
              <select
                name='taxPayableAccountId'
                value={form.taxPayableAccountId}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
              >
                <option value=''>Select Tax Account (optional)</option>
                {accountSettings
                  .filter((acc) => acc.name.toLowerCase().includes('tax'))
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
              </select>
            </div>
            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
              <input
                name='description'
                value={form.description}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg'
              />
            </div>

            <div className='col-span-3 text-right font-semibold text-gray-800'>
              Total: ${form.totalPrice || '0.00'}
            </div>

            <div className='col-span-3 flex justify-between gap-3 mt-2'>
              <button
                type='button'
                onClick={addToCart}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
              >
                Add to Cart
              </button>

              <button
                type='submit'
                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg'
              >
                {editMode ? 'Update Sale' : 'Save Sale'}
              </button>

              <button
                type='button'
                onClick={() => setFormVisible(false)}
                className='bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg'
              >
                Cancel
              </button>
            </div>
          </form>

          {cartItems.length > 0 && (
            <div className='mt-4'>
              <h3 className='font-semibold mb-2'>Cart Items:</h3>
              <ul className='text-xs border rounded-md p-2'>
                {cartItems.map((item, i) => (
                  <li key={i} className='flex justify-between py-1'>
                    <span>{item.productName} x {item.quantity} - ${item.totalPrice.toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(i)}
                      className='text-red-600 hover:underline'
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className='bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden'>
        <StockTable
          title='Sales'
          data={sales}
          fields={fields}
          updateItem={(id, data) => updateItem('sale', id, data)}
          deleteItem={(id) => deleteItem('sale', id)}
          loading={loading}
          onEdit={handleEdit}
          onAdd={() => {
            setFormVisible(!formVisible);
            resetForm();
          }}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
