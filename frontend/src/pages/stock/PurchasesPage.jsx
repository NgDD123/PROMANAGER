import React, { useState, useEffect } from 'react';
import { useStock } from '../../context/stockContext';
import StockTable from '../../components/stock/StockTable';
import AddPurchaseModal from '../../components/modals/AddPurchaseModal';
import SinglePurchaseHistory from '../../components/modals/SinglePurchaseHistory';
import { Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

function AddSupplierForm({ onAdd }) {
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact: '',
    email: '',
    tin: '',
    company: '',
    location: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplierForm({ ...supplierForm, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierForm.name) return alert('Supplier name required');
    onAdd(supplierForm);
    setSupplierForm({
      name: '',
      contact: '',
      email: '',
      tin: '',
      company: '',
      location: '',
    });
  };

  return (
    <form
      className='grid grid-cols-1 gap-2 p-2 bg-white border rounded-lg'
      onSubmit={handleSubmit}
    >
      <input
        name='name'
        value={supplierForm.name}
        onChange={handleChange}
        placeholder='Supplier Name'
        className='border p-2 rounded-lg w-full'
      />
      <input
        name='company'
        value={supplierForm.company}
        onChange={handleChange}
        placeholder='Company Name'
        className='border p-2 rounded-lg w-full'
      />
      <input
        name='email'
        value={supplierForm.email}
        onChange={handleChange}
        placeholder='Email'
        className='border p-2 rounded-lg w-full'
      />
      <input
        name='location'
        value={supplierForm.location}
        onChange={handleChange}
        placeholder='Location'
        className='border p-2 rounded-lg w-full'
      />
      <input
        name='contact'
        value={supplierForm.contact}
        onChange={handleChange}
        placeholder='+250 789999999'
        className='border p-2 rounded-lg w-full'
      />
      <input
        name='tin'
        value={supplierForm.tin}
        onChange={handleChange}
        placeholder='TIN:999999999'
        className='border p-2 rounded-lg w-full'
      />
      <button
        type='submit'
        className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg'
      >
        Add Supplier
      </button>
    </form>
  );
}

export default function PurchasesPage() {
  const {
    getById,
    purchases,
    productSettings,
    accountSettings,
    suppliers,
    invoices,
    addSupplier,
    addPurchases,
    addInvoice,
    updateItem,
    updateInvoice,
    deleteItem,
    addPayment,
    approveInvoice,
    loading,
  } = useStock();

  const [formVisible, setFormVisible] = useState(false);
  const [formWidth, setFormWidth] = useState(45);
  const [formHeight, setFormHeight] = useState(65);

  const [form, setForm] = useState({
    productId: '',
    productName: '',
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
    storeCategory: 'Online',
    storeLocation: '',
    inventoryAccountId: '',
    type: '',
    openingStock: 0,
    paymentType: 'accrual',
    supplierId: '',
  });

  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [invoiceToPay, setInvoiceToPay] = useState(null);
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState('');
  const [localInvoices, setLocalInvoices] = useState([]);
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const calculateTotalPrice = ({ quantity, unitPrice, discount, tax }) => {
    const q = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const d = Number(discount) || 0;
    const t = Number(tax) || 0;

    const subtotal = q * price;
    const discountAmount = d > 1 ? d : subtotal * (d / 100);
    const taxAmount = t > 1 ? t : subtotal * (t / 100);

    return +(subtotal - discountAmount + taxAmount).toFixed(2);
  };

  useEffect(() => {
    setLocalInvoices(invoices);
  }, [invoices]);

  const resetForm = () => {
    setForm({
      productId: '',
      productName: '',
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
      storeCategory: 'Online',
      storeLocation: '',
      inventoryAccountId: '',
      type: '',
      openingStock: 0,
      paymentType: 'accrual',
      supplierId: '',
    });
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
          storeCategory: selected.storeCategory || 'Online',
          qualityGrade: selected.quality,
          tax: selected.tax || 0,
          inventoryAccountId: selected.inventoryAccountId || '',
          type: selected.type,
          storeLocation: selected.mainOrSub || '',
          openingStock: selected.openingStock || 0,
        };
      }
    }

    updatedForm.totalPrice = calculateTotalPrice(updatedForm);

    setForm(updatedForm);
  };

  const addItemToInvoice = () => {
    if (!form.productId) return alert('Please select product.');
    if (!form.supplierId) return alert('Please select supplier.');

    // Calculate totalPrice before adding
    const totalPrice = calculateTotalPrice(form);

    const newItem = { ...form, id: Date.now(), totalPrice };
    setInvoiceItems((prev) => [...prev, newItem]);
    resetForm();
  };

  const submitInvoice = async () => {
    if (invoiceItems.length === 0) return alert('Add products first');

    const selectedSupplier = suppliers.find(
      (sup) => sup.id === invoiceItems[0].supplierId
    );

    const invoiceTotal = invoiceItems.reduce(
      (sum, i) => sum + Number(i.totalPrice),
      0
    );

   const newInvoice = {
  supplierId: selectedSupplier?.id || '',
  totalAmount: invoiceTotal,
  items: invoiceItems.map((i) => {
    // Find the actual account ID
    const account = accountSettings.find(acc => acc.id === i.inventoryAccountId || acc.name === i.inventoryAccountId);
    return {
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
      discount: i.discount,
      tax: i.tax,
      totalPrice: i.totalPrice,
      batchNo: i.batchNo || '',
      expiry: i.expiry || '',
      quality: i.quality || '',
      warranty: i.warranty || '',
      serialNo: i.serialNo || '',
      storeLocation: i.storeLocation,
      storeCategory: i.storeCategory,
      inventoryAccountId: account?.id || '',  // ✅ Use ID
      inventoryAccountName: account?.name || 'Unknown Account',
      type: i.type || 'Product',
      openingStock: i.openingStock || 0,
    };
  }),
  status: 'pending',
  createdAt: new Date().toISOString(),
  paymentType: invoiceItems[0]?.paymentType || 'accrual',
};

    const savedInvoice = await addInvoice(newInvoice);
    // 2️⃣ Save each invoice item as a purchase
    for (const item of invoiceItems) {
      const purchasesData = {
        ...item,
        supplierId: savedInvoice.supplierId,
        invoiceId: savedInvoice.id,
        createdAt: new Date().toISOString(),
      };
      await addPurchases(purchasesData); // must exist in useStock
    }


    setInvoiceItems([]);
    setFormVisible(false);

    console.log('✅ Invoice created with items:', savedInvoice);
  };

  const handleInvoiceAction = async (invoiceId, action) => {
  try {
    const invoice = localInvoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    // If user wants to pay, open the modal instead of updating status
    if (action === 'pay') {
      setInvoiceToPay(invoice);
      setPayModalOpen(true);
      return;
    }

    // For approve/reject actions, update invoice status
    const response = await updateInvoice(invoiceId, { status: action });
    const updatedInvoice = response?.data || response;

    // Update local state
    setLocalInvoices(prev =>
      prev.map(inv => (inv.id === invoiceId ? updatedInvoice : inv))
    );

    if (selectedInvoice?.id === invoiceId) {
      setSelectedInvoice(updatedInvoice);
    }

    console.log(`✅ Invoice ${action}d successfully:`, invoiceId);
  } catch (error) {
    console.error(error);
    alert('Error updating invoice status');
  }
};



 const confirmPayment = async () => {
  console.log("➡️ [confirmPayment] Payment confirmation started...");

  if (!selectedPaymentAccount || !invoiceToPay) {
    alert("Select payment account first.");
    return;
  }

  try {
    // Fetch latest invoice data
    const invoiceRes = await getById("invoice", invoiceToPay.id);
    const invoiceData = invoiceRes?.data || invoiceRes;

    if (!invoiceData || !Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
      alert("Invoice has no items to process.");
      return;
    }

    // Prepare inventory lines for journal
    const inventoryMap = {};
    invoiceData.items.forEach((item) => {
      let accountId = item.inventoryAccountId;

      if (!accountId && item.inventoryAccountName) {
        const account = accountSettings.find(acc => acc.name === item.inventoryAccountName);
        if (account) accountId = account.id;
      }

      if (!accountId) {
        console.warn(`⚠️ Skipping item ${item.productName}: no valid inventory account`);
        return;
      }

      const itemTotal = Number(item.totalPrice || item.total) ||
        (Number(item.unitPrice || 0) * Number(item.quantity || 0) - Number(item.discount || 0) + Number(item.tax || 0));

      if (!inventoryMap[accountId]) {
        const account = accountSettings.find(acc => acc.id === accountId);
        inventoryMap[accountId] = {
          accountId,
          accountName: account?.name || 'Unknown Account',
          amount: 0,
        };
      }

      inventoryMap[accountId].amount += itemTotal;
    });

    const inventoryLines = Object.values(inventoryMap);
    if (inventoryLines.length === 0) {
      alert('No inventory accounts found in invoice items');
      return;
    }

    const totalAmount = inventoryLines.reduce((sum, l) => sum + l.amount, 0);

    // 1️⃣ Create payment (journal handled automatically)
    const paymentData = {
      date: new Date().toISOString(),
      amount: totalAmount,
      paymentType: "supplier",
      relatedId: invoiceData.supplierId,
      invoiceId: invoiceData.id,
      method: "cash",
      cashOrBankAccountId: selectedPaymentAccount,
      description: `Payment for Invoice #${invoiceData.number || invoiceData.id}`,
      inventoryLines,
    };

    const savedPayment = await addPayment(paymentData);
    console.log("✅ Payment saved:", savedPayment);

    // 2️⃣ Update invoice status to paid
    await updateInvoice(invoiceData.id, { status: "paid" });

    // 3️⃣ Add purchases for each invoice item
    for (const item of invoiceData.items) {
      const accountId = item.inventoryAccountId || accountSettings.find(acc => acc.name === item.inventoryAccountName)?.id;

      if (!accountId) continue;

      await addPurchases({
        ...item,
        invoiceId: invoiceData.id,
        supplierId: invoiceData.supplierId,
        totalPrice: item.totalPrice || (item.unitPrice * item.quantity),
        inventoryAccountId: accountId,
        paymentAccountId: selectedPaymentAccount,
        date: invoiceData.date || new Date().toISOString(),
        description: `Purchases from invoice ${invoiceData.id}`,
      });

      console.log(`📥 Purchases added for product: ${item.productName}`);
    }

    // 4️⃣ Reset modal and selection
    setInvoiceToPay(null);
    setSelectedPaymentAccount("");
    setPayModalOpen(false);

    console.log("✅ Payment + Purchases + Journal processed successfully");
  } catch (err) {
    console.error("🔥 Payment failed:", err);
    alert("Payment failed. Check console.");
  }
};


  const fields = [
    { name: 'productName', label: 'Item/Service' },
    { name: 'description', label: 'Description' },
    { name: 'quantity', label: 'Qty' },
    { name: 'unit', label: 'Unit' },
    { name: 'unitPrice', label: 'Unit Price' },
    { name: 'discount', label: 'Discount' },
    { name: 'tax', label: 'Tax' },
    { name: 'totalPrice', label: 'Total' },
    { name: 'batchNumber', label: 'Batch No' },
    { name: 'expirationDate', label: 'Expiry' },
    { name: 'qualityGrade', label: 'Quality' },
    { name: 'warranty', label: 'Warranty' },
    { name: 'serialNumber', label: 'Serial No' },
    { name: 'storeLocation', label: 'Store Location' },
    { name: 'storeCategory', label: 'Store Category' },
    { name: 'inventoryAccountId', label: 'Inventory Account' },
    { name: 'type', label: 'Type' },
    { name: 'openingStock', label: 'Opening Stock' },
  ];

  const storeCategories = [
    'Online',
    'Raw Materials',
    'Finished Products',
    'Service',
  ];
  const paymentTypes = ['accrual', 'cash', 'bank', 'check', 'credit'];

  return (
    <div className='bg-gray-50 min-h-screen '>
      <div className='flex gap-6'>
        {/* Left: Invoice Details & List */}
        <div className='w-1/2 space-y-6 overflow-y-auto max-h-[80vh]'>
          {selectedInvoice && (
            <div className='bg-white shadow-lg border border-gray-200 p-6 rounded-xl overflow-x-auto'>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h2 className='text-lg font-semibold'>
                    Invoice #{selectedInvoice.id}
                  </h2>
                  <div>
                    <strong>Status:</strong> {selectedInvoice.status}
                  </div>
                  <div>
                    <strong>Payment Type:</strong> {selectedInvoice.paymentType}
                  </div>
                </div>
                <div className='text-right'>
                  <h3 className='font-semibold'>Supplier</h3>
                  <div>{selectedInvoice.supplier?.name || 'N/A'}</div>
                  <div>{selectedInvoice.supplier?.company}</div>
                  <div>{selectedInvoice.supplier?.contact}</div>
                  <div>{selectedInvoice.supplier?.email}</div>
                  <div>{selectedInvoice.supplier?.tin}</div>
                  <div>{selectedInvoice.supplier?.location}</div>
                </div>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm border min-w-[1200px] table-auto'>
                  <thead className='bg-gray-200 sticky top-0 z-10'>
                    <tr>
                      {fields.map((f) => (
                        <th key={f.name} className='border px-2 py-1'>
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedInvoice.items || []).map((item) => (
                      <tr key={item.id} className='border-t'>
                        {fields.map((f) => (
                          <td key={f.name} className='border px-2 py-1'>
                            {item[f.name]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='text-right font-semibold mt-2'></div>
            </div>
          )}

          {localInvoices.length > 0 && (
            <div className='bg-white shadow-lg rounded-xl border border-gray-200 p-4 space-y-4'>
              <h2 className='text-lg font-semibold mb-4'>Invoices</h2>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm border min-w-[600px] table-auto'>
                  <thead className='bg-gray-200 sticky top-0 z-10'>
                    <tr>
                      <th className='border px-2 py-1'>ID</th>
                      <th className='border px-2 py-1'>Total</th>
                      <th className='border px-2 py-1'>Payment Type</th>
                      <th className='border px-2 py-1'>Status</th>
                      <th className='border px-2 py-1'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localInvoices?.map((inv) => {
                      const total =
                        inv.total ??
                        (inv.items?.reduce(
                          (sum, i) => sum + Number(i.totalPrice || 0),
                          0
                        ) ||
                          0);
                      return (
                        <tr key={inv.id} className='border-t'>
                          <td className='border px-2 py-1'>{inv.id}</td>
                          <td className='border px-2 py-1'>
                            ${total.toFixed(2)}
                          </td>
                          <td className='border px-2 py-1'>
                            {inv.paymentType}
                          </td>
                          <td className='border px-2 py-1'>{inv.status}</td>
                          <td className='flex flex-wrap gap-2 items-center border px-2 py-1'>
                            <button
                              className='text-blue-600 underline'
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              View
                            </button>
                            {inv.status === 'pending' && (
                              <>
                                <button
                                  className='text-green-600 underline'
                                  onClick={() =>
                                    handleInvoiceAction(inv.id, 'approved')
                                  }
                                >
                                  Approve
                                </button>
                                <button
                                  className='text-red-600 underline'
                                  onClick={() =>
                                    handleInvoiceAction(inv.id, 'rejected')
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {inv.status === 'approved' && (
                              <button
                                className='text-green-600 underline'
                                onClick={() => {
                                  setPayModalOpen(true);
                                  setInvoiceToPay(inv);
                                }}
                              >
                                Pay
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {payModalOpen && invoiceToPay && (
                  <div className='mt-6 border-t pt-4'>
                    <h3 className='font-semibold mb-2'>
                      Pay Invoice #{invoiceToPay.id}
                    </h3>
                    <label className='block mb-1 font-medium'>
                      Select Payment Account
                    </label>
                    <select
                      value={selectedPaymentAccount}
                      onChange={(e) =>
                        setSelectedPaymentAccount(e.target.value)
                      }
                      className='border w-full p-2 rounded-lg mb-3'
                    >
                      <option value=''>-- Select Account --</option>
                      {accountSettings.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                    <div className='flex justify-end gap-2'>
                      <button
                        className='bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded-lg'
                        onClick={() => {
                          setPayModalOpen(false);
                          setInvoiceToPay(null);
                          setSelectedPaymentAccount('');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg'
                        onClick={confirmPayment}
                      >
                        Confirm Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Purchase Form */}
        {formVisible && (
          <div
            style={{ width: `${formWidth}%`, height: `${formHeight}vh` }}
            className='bg-white shadow-2xl border border-gray-200 rounded-2xl p-6 transition-all duration-300 overflow-y-auto'
          >
            <h2 className='text-lg font-semibold mb-4'>
              Add Purchase / Invoice
            </h2>

            {/* Supplier selection & AddSupplierForm */}
            <div className='mb-4 p-3 border rounded-lg bg-gray-50'>
              <h3 className='font-semibold mb-2 flex justify-between items-center'>
                Supplier
                <button
                  className='text-sm text-blue-600 underline'
                  onClick={() => setAddSupplierOpen(!addSupplierOpen)}
                >
                  {addSupplierOpen ? 'Hide' : 'Add New'}
                </button>
              </h3>
              <select
                name='supplierId'
                value={form.supplierId}
                onChange={handleChange}
                className='border w-full p-2 rounded-lg mb-2'
              >
                <option value=''>Select Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
              {addSupplierOpen && (
                <AddSupplierForm
                  onAdd={async (newSupplier) => {
                    const added = await addSupplier(newSupplier);
                    setForm({ ...form, supplierId: added.id });
                    setAddSupplierOpen(false);
                  }}
                />
              )}
            </div>

            {/* Purchase Form Fields */}
            <form className='grid grid-cols-3 gap-3'>
              {fields.map((field) => (
                <div key={field.name}>
                  <label className='block text-sm font-medium mb-1'>
                    {field.label}
                  </label>
                  {field.name === 'productName' ? (
                    <select
                      name='productId'
                      value={form.productId}
                      onChange={handleChange}
                      className='border w-full p-2 rounded-lg'
                    >
                      <option value=''>Select Product</option>
                      {productSettings.map((ps) => (
                        <option key={ps.id} value={ps.id}>
                          {ps.name}
                        </option>
                      ))}
                    </select>
                  ) : field.name === 'storeCategory' ? (
                    <select
                      name='storeCategory'
                      value={form.storeCategory}
                      onChange={handleChange}
                      className='border w-full p-2 rounded-lg'
                    >
                      {storeCategories.map((cat) => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : field.name === 'inventoryAccountId' ? (
                    <select
                      name='inventoryAccountId'
                      value={form.inventoryAccountId}
                      onChange={handleChange}
                      className='border w-full p-2 rounded-lg'
                    >
                      <option value=''>Select Inventory Account</option>
                      {accountSettings.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      type={
                        [
                          'quantity',
                          'unitPrice',
                          'discount',
                          'tax',
                          'openingStock',
                        ].includes(field.name)
                          ? 'number'
                          : 'text'
                      }
                      className='border w-full p-2 rounded-lg'
                    />
                  )}
                </div>
              ))}

              <div className='col-span-1'>
                <label className='block text-sm font-medium mb-1'>
                  Payment Type
                </label>
                <select
                  name='paymentType'
                  value={form.paymentType}
                  onChange={handleChange}
                  className='border w-full p-2 rounded-lg'
                >
                  {paymentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className='col-span-3 text-right font-semibold mt-2'>
                Total: ${form.totalPrice || '0.00'}
              </div>

              <div className='col-span-3 flex justify-end gap-3 mt-2'>
                <button
                  type='button'
                  onClick={addItemToInvoice}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
                >
                  Add to Invoice
                </button>
                <button
                  type='button'
                  onClick={submitInvoice}
                  className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg'
                >
                  Submit Invoice
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

            {invoiceItems.length > 0 && (
              <div className='mt-4 bg-gray-100 p-3 rounded-lg overflow-x-auto'>
                <h3 className='font-semibold mb-2'>Invoice Items (Draft)</h3>
                <table className='w-full text-sm border min-w-[1200px] table-auto'>
                  <thead className='bg-gray-200 sticky top-0 z-10'>
                    <tr>
                      {fields.map((f) => (
                        <th key={f.name} className='border px-2 py-1'>
                          {f.label}
                        </th>
                      ))}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, idx) => (
                      <tr key={item.id} className='border-t'>
                        {fields.map((f) => (
                          <td key={f.name} className='border px-2 py-1'>
                            {item[f.name]}
                          </td>
                        ))}
                        <td>
                          <button
                            className='text-red-500'
                            onClick={() =>
                              setInvoiceItems((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='text-right font-semibold mt-2'>
                  Total: $
                  {invoiceItems
                    .reduce((sum, i) => sum + Number(i.totalPrice || 0), 0)
                    .toFixed(2)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className='bg-white rounded-xl p-4 mt-6 overflow-x-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Purchases History</h2>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddPurchaseModal(true)}
            sx={{ borderRadius: 2 }}
          >
            Add Purchase
          </Button>
        </div>
        <StockTable
          title=''
          data={purchases}
          fields={[
            { name: 'productName', label: 'Product' },
            { name: 'quantity', label: 'Qty' },
            { name: 'unitPrice', label: 'Unit Price' },
            { name: 'totalPrice', label: 'Total' },
            { name: 'storeCategory', label: 'Category' },
          ]}
          updateItem={(id, data) => updateItem('purchase', id, data)}
          deleteItem={(id) => deleteItem('purchase', id)}
          onEdit={(item) => setSelectedPurchase(item)}
          loading={loading}
        />
      </div>

      <AddPurchaseModal
        isOpen={showAddPurchaseModal}
        onClose={() => setShowAddPurchaseModal(false)}
      />
      
      <SinglePurchaseHistory
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        purchase={selectedPurchase}
      />
    </div>
  );
}
