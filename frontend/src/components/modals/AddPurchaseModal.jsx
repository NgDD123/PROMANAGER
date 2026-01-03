import React, { useState } from 'react';
import { useStock } from '../../context/stockContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';

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
    <div className='p-4 mt-4 bg-gray-50 rounded-lg border'>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <TextField
            name='name'
            value={supplierForm.name}
            onChange={handleChange}
            label='Supplier Name'
            fullWidth
            size='small'
          />
          <TextField
            name='company'
            value={supplierForm.company}
            onChange={handleChange}
            label='Company Name'
            fullWidth
            size='small'
          />
          <TextField
            name='email'
            value={supplierForm.email}
            onChange={handleChange}
            label='Email'
            fullWidth
            size='small'
          />
          <TextField
            name='location'
            value={supplierForm.location}
            onChange={handleChange}
            label='Location'
            fullWidth
            size='small'
          />
          <TextField
            name='contact'
            value={supplierForm.contact}
            onChange={handleChange}
            label='Contact'
            placeholder='+250 789999999'
            fullWidth
            size='small'
          />
          <TextField
            name='tin'
            value={supplierForm.tin}
            onChange={handleChange}
            label='TIN'
            placeholder='TIN:999999999'
            fullWidth
            size='small'
          />
          <div className='col-span-full'>
            <Button type='submit' variant='contained' size='small'>
              Add Supplier
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AddPurchaseModal({ isOpen, onClose }) {
  const {
    productSettings,
    accountSettings,
    suppliers,
    addSupplier,
    addInvoice,
  } = useStock();

  const [form, setForm] = useState({
    productId: '',
    productName: '',
    description: '',
    quantity: 1,
    unit: 'pieces',
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
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);

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

  const resetForm = () => {
    setForm({
      productId: '',
      productName: '',
      description: '',
      quantity: 1,
      unit: 'pieces',
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
      items: invoiceItems.map((i) => ({
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
        inventoryAccountId:
          accountSettings.find((acc) => acc.id === i.inventoryAccountId)
            ?.name || i.inventoryAccountId,
        type: i.type || 'Product',
        openingStock: i.openingStock || 0,
      })),
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentType: invoiceItems[0]?.paymentType || 'accrual',
    };

    await addInvoice(newInvoice);
    setInvoiceItems([]);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Add Purchase / Invoice
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        {/* Supplier selection & AddSupplierForm */}
        <div className='p-4 mb-6 bg-gray-50 rounded-lg shadow'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-semibold'>Supplier</h3>
            <Button
              size='small'
              onClick={() => setAddSupplierOpen(!addSupplierOpen)}
            >
              {addSupplierOpen ? 'Hide' : 'Add New'}
            </Button>
          </div>
          <FormControl fullWidth size='small'>
            <InputLabel>Select Supplier</InputLabel>
            <Select
              name='supplierId'
              value={form.supplierId}
              onChange={handleChange}
              label='Select Supplier'
            >
              <MenuItem value=''>Select Supplier</MenuItem>
              {suppliers.map((sup) => (
                <MenuItem key={sup.id} value={sup.id}>
                  {sup.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {fields.map((field) => (
            <div key={field.name}>
              {field.name === 'productName' ? (
                <FormControl fullWidth size='small'>
                  <InputLabel>Select Product</InputLabel>
                  <Select
                    name='productId'
                    value={form.productId}
                    onChange={handleChange}
                    label='Select Product'
                  >
                    <MenuItem value=''>Select Product</MenuItem>
                    {productSettings.map((ps) => (
                      <MenuItem key={ps.id} value={ps.id}>
                        {ps.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : field.name === 'storeCategory' ? (
                <FormControl fullWidth size='small'>
                  <InputLabel>Store Category</InputLabel>
                  <Select
                    name='storeCategory'
                    value={form.storeCategory}
                    onChange={handleChange}
                    label='Store Category'
                  >
                    {storeCategories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : field.name === 'inventoryAccountId' ? (
                <FormControl fullWidth size='small'>
                  <InputLabel>Inventory Account</InputLabel>
                  <Select
                    name='inventoryAccountId'
                    value={form.inventoryAccountId}
                    onChange={handleChange}
                    label='Inventory Account'
                  >
                    <MenuItem value=''>Select Inventory Account</MenuItem>
                    {accountSettings.map((acc) => (
                      <MenuItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  label={field.label}
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
                  fullWidth
                  size='small'
                />
              )}
            </div>
          ))}

          <div>
            <FormControl fullWidth size='small'>
              <InputLabel>Payment Type</InputLabel>
              <Select
                name='paymentType'
                value={form.paymentType}
                onChange={handleChange}
                label='Payment Type'
              >
                {paymentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className='col-span-full text-right'>
            <h3 className='text-lg font-semibold'>
              Total: ${form.totalPrice || '0.00'}
            </h3>
          </div>

          <div className='col-span-full flex justify-end gap-4'>
            <Button variant='contained' onClick={addItemToInvoice}>
              Add to Invoice
            </Button>
            <Button variant='contained' color='success' onClick={submitInvoice}>
              Submit Invoice
            </Button>
            <Button variant='outlined' onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>

        {invoiceItems.length > 0 && (
          <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4'>
              Invoice Items (Draft)
            </h3>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    {fields.map((f) => (
                      <TableCell key={f.name}>{f.label}</TableCell>
                    ))}
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceItems.map((item, idx) => (
                    <TableRow key={item.id}>
                      {fields.map((f) => (
                        <TableCell key={f.name}>{item[f.name]}</TableCell>
                      ))}
                      <TableCell>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() =>
                            setInvoiceItems((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div className='text-right mt-4'>
              <h3 className='text-lg font-semibold'>
                Total: $
                {invoiceItems
                  .reduce((sum, i) => sum + Number(i.totalPrice || 0), 0)
                  .toFixed(2)}
              </h3>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
