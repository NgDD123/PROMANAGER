// ========================================
// ✅ ProductionCostPage.jsx (Final Version)
// Auto-updates when cycles change
// ========================================
import React, { useState, useEffect, useMemo } from 'react';
import { useProduction } from '../../context/ProductionContext';
import { useStock } from '../../context/stockContext';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  CircularProgress,
  TablePagination,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import {
  Save as SaveIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

export default function ProductionCostPage() {
  const { cycles } = useProduction();
  const { products, getProductStock, createJournalEntry, addItem } = useStock();

  // ✅ Only show completed cycles dynamically
  const [completedCycles, setCompletedCycles] = useState(
    cycles.filter((c) => c.status === 'completed')
  );

  const [formData, setFormData] = useState({
    cycleId: '',
    productId: '',
    quantity: 0,
    rawMaterials: [],
    laborCost: 0,
    overheadCost: 0,
    totalCost: 0,
    dateProduced: '',
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 🔁 Auto-refresh completed cycles when `cycles` from context update
  useEffect(() => {
    setCompletedCycles(cycles.filter((c) => c.status === 'completed'));
  }, [cycles]);

  // 🔁 Auto-fill form when cycleId changes
  useEffect(() => {
    if (!formData.cycleId) return;

    const selectedCycle = completedCycles.find(
      (c) => c.id === formData.cycleId
    );
    if (selectedCycle) {
      const totalMaterialCost = (selectedCycle.rawMaterials || []).reduce(
        (sum, rm) => {
          const product = products.find((p) => p.id === rm.productId);
          return sum + (product?.costPrice || 0) * (rm.quantity || 0);
        },
        0
      );

      const totalCost =
        totalMaterialCost +
        Number(selectedCycle.laborCost || 0) +
        Number(selectedCycle.overheadCost || 0);

      setFormData({
        cycleId: selectedCycle.id,
        productId: selectedCycle.productId || selectedCycle.productName,
        quantity:
          selectedCycle.quantityCompleted || selectedCycle.quantityPlanned,
        rawMaterials: selectedCycle.rawMaterials || [],
        laborCost: selectedCycle.laborCost || 0,
        overheadCost: selectedCycle.overheadCost || 0,
        totalCost,
        dateProduced:
          selectedCycle.dateProduced || new Date().toISOString().slice(0, 10),
      });
    }
  }, [formData.cycleId, completedCycles, products]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit and record production cost
  const handleSubmit = async () => {
    const {
      cycleId,
      productId,
      quantity,
      rawMaterials,
      laborCost,
      overheadCost,
      totalCost,
      dateProduced,
    } = formData;

    if (!cycleId || !productId || quantity <= 0 || !dateProduced) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields!',
        severity: 'warning',
      });
      return;
    }

    try {
      // 🔍 Verify materials (optional)
      for (const rm of rawMaterials) {
        const stockQty = getProductStock(rm.productId);
        if (stockQty < rm.quantity) {
          console.warn(`⚠️ Not enough stock for ${rm.productId}`);
        }
      }

      // ✅ Add finished goods to inventory
      await addItem('receive', {
        productId,
        quantity,
        description: `Produced via Cycle ${cycleId}`,
      });

      // ✅ Create journal entry
      await createJournalEntry({
        type: 'production',
        date: dateProduced,
        description: `Cycle ${cycleId} — ${quantity} units completed`,
        debitAccountId: 'FinishedGoodsInventory',
        creditAccountId: 'WorkInProgress',
        amount: totalCost,
        details: {
          laborCost,
          overheadCost,
          materialCost: totalCost - (Number(laborCost) + Number(overheadCost)),
        },
      });

      setSnackbar({
        open: true,
        message: 'Production cost recorded successfully!',
        severity: 'success',
      });

      // 🧹 Reset form
      setFormData({
        cycleId: '',
        productId: '',
        quantity: 0,
        rawMaterials: [],
        laborCost: 0,
        overheadCost: 0,
        totalCost: 0,
        dateProduced: '',
      });
    } catch (err) {
      console.error('❌ Error saving production cost:', err);
      setSnackbar({
        open: true,
        message: `Failed to record production cost: ${err.message}`,
        severity: 'error',
      });
    }
  };

  // Calculate table data with costs
  const tableData = useMemo(() => {
    return completedCycles.map((c) => {
      const materialCost = (c.rawMaterials || []).reduce((sum, rm) => {
        const p = products.find((pr) => pr.id === rm.productId);
        return sum + (p?.costPrice || 0) * rm.quantity;
      }, 0);
      const totalCost =
        Number(materialCost) +
        Number(c.laborCost || 0) +
        Number(c.overheadCost || 0);

      return {
        ...c,
        materialCost,
        totalCost,
      };
    });
  }, [completedCycles, products]);

  const paginatedData = tableData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className='p-6 flex flex-col gap-6'>
      {/* Header */}
      <div className='rounded-xl overflow-hidden shadow-md'>
        <div className='p-6 border-b border-gray-200'>
          <Typography variant='h5' sx={{ fontWeight: 600, color: 'grey.800' }}>
            Production Cost Allocation
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1 }}>
            Allocate production costs for completed cycles and add finished goods to inventory
          </Typography>
        </div>

        {/* Production Cost Form */}
        <div className='p-6'>
          <Card variant='outlined' sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <div className='flex items-center gap-3 mb-4'>
                <AssignmentIcon sx={{ fontSize: 32, color: '#0d9488' }} />
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Cost Allocation Form
                </Typography>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <FormControl fullWidth>
                  <InputLabel>Select Completed Cycle</InputLabel>
                  <Select
                    name='cycleId'
                    value={formData.cycleId}
                    onChange={handleChange}
                    label='Select Completed Cycle'
                  >
                    <MenuItem value=''>
                      <em>Select Cycle</em>
                    </MenuItem>
                    {completedCycles.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.productName} (Cycle {c.id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label='Product'
                  value={
                    products.find((p) => p.id === formData.productId)?.name ||
                    formData.productId ||
                    ''
                  }
                  disabled
                  fullWidth
                />

                <TextField
                  label='Quantity Produced'
                  type='number'
                  value={formData.quantity}
                  disabled
                  fullWidth
                />

                <TextField
                  label='Labor Cost'
                  type='number'
                  value={formData.laborCost}
                  disabled
                  fullWidth
                />

                <TextField
                  label='Overhead Cost'
                  type='number'
                  value={formData.overheadCost}
                  disabled
                  fullWidth
                />

                <TextField
                  label='Total Cost'
                  type='number'
                  value={formData.totalCost.toFixed(2)}
                  disabled
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      fontWeight: 600,
                    },
                  }}
                />

                <TextField
                  label='Date Produced'
                  type='date'
                  name='dateProduced'
                  value={formData.dateProduced}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </div>

              {/* Raw Materials */}
              {formData.rawMaterials && formData.rawMaterials.length > 0 && (
                <div className='mt-4'>
                  <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
                    Raw Materials Used:
                  </Typography>
                  <div className='grid grid-cols-2 gap-2'>
                    {formData.rawMaterials.map((rm, i) => (
                      <div
                        key={i}
                        className='p-2 border rounded bg-gray-50 flex justify-between items-center'
                      >
                        <Typography variant='body2'>
                          {products.find((p) => p.id === rm.productId)?.name || '-'}
                        </Typography>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          Qty: {rm.quantity}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant='contained'
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={!formData.cycleId}
                sx={{
                  mt: 3,
                  bgcolor: '#0d9488',
                  '&:hover': { bgcolor: '#14b8a6' },
                  '&:disabled': { bgcolor: 'grey.300' },
                }}
              >
                Save Production Cost
              </Button>
            </CardContent>
          </Card>

          {/* Completed Cycles Table */}
          <div>
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'grey.800', mb: 3 }}>
              Completed Production Cycles
            </Typography>
            {completedCycles.length === 0 ? (
              <Typography color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
                No completed cycles yet
              </Typography>
            ) : (
              <>
                <div className='rounded-xl overflow-hidden shadow-md flex-1 flex flex-col min-h-[400px]'>
                  <TableContainer sx={{ flex: 1, overflow: 'auto', minHeight: '400px' }}>
                    <Table size='medium' stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              bgcolor: '#0d9488',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              py: 1.5,
                            }}
                          >
                            Cycle ID
                          </TableCell>
                          <TableCell
                            sx={{
                              bgcolor: '#0d9488',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              py: 1.5,
                            }}
                          >
                            Product
                          </TableCell>
                          <TableCell
                            align='right'
                            sx={{
                              bgcolor: '#0d9488',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              py: 1.5,
                            }}
                          >
                            Planned Qty
                          </TableCell>
                          <TableCell
                            align='right'
                            sx={{
                              bgcolor: '#0d9488',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              py: 1.5,
                            }}
                          >
                            Completed Qty
                          </TableCell>
                          <TableCell
                            align='right'
                            sx={{
                              bgcolor: '#0d9488',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              py: 1.5,
                            }}
                          >
                            Labor Cost
                          </TableCell>
                          <TableCell
                            align='right'
                            sx={{
                              bgcolor: '#0d9488',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              py: 1.5,
                            }}
                          >
                            Overhead Cost
                          </TableCell>
                          <TableCell
                            align='right'
                            sx={{
                              bgcolor: '#0d9488',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              py: 1.5,
                            }}
                          >
                            Total Cost
                          </TableCell>
                          <TableCell
                            align='center'
                            sx={{
                              bgcolor: '#0d9488',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              py: 1.5,
                            }}
                          >
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((row, index) => {
                          const actualIndex = page * rowsPerPage + index;
                          const isEven = actualIndex % 2 === 0;
                          return (
                            <TableRow
                              key={row.id}
                              hover
                              sx={{
                                bgcolor: isEven ? '#fafafa' : '#f5f5f5',
                                '&:hover': { bgcolor: '#e8f5e9' },
                              }}
                            >
                              <TableCell sx={{ color: 'grey.800', py: 1.5 }}>{row.id}</TableCell>
                              <TableCell sx={{ color: 'grey.800', py: 1.5 }}>
                                {row.productName}
                              </TableCell>
                              <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                                {row.quantityPlanned}
                              </TableCell>
                              <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                                {row.quantityCompleted}
                              </TableCell>
                              <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                                {formatCurrency(row.laborCost)}
                              </TableCell>
                              <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                                {formatCurrency(row.overheadCost)}
                              </TableCell>
                              <TableCell
                                align='right'
                                sx={{ color: 'grey.800', py: 1.5, fontWeight: 600 }}
                              >
                                {formatCurrency(row.totalCost)}
                              </TableCell>
                              <TableCell align='center' sx={{ py: 1.5 }}>
                                <Chip label='Completed' size='small' color='success' />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component='div'
                    count={tableData.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    sx={{
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      '& .MuiTablePagination-toolbar': { bgcolor: 'grey.50' },
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
