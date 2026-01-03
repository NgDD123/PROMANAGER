// src/pages/production/ProductionPlanningPage.jsx
import React, { useState, useMemo } from 'react';
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
  IconButton,
  Tooltip,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

export default function ProductionPlanningPage() {
  const { products = [] } = useStock() || {};
  const {
    wipCycles = [],
    addWIPCycle,
    deleteWIPCycle,
    loading,
  } = useProduction() || {};

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    startDate: '',
    endDate: '',
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCycle = async () => {
    if (
      !formData.productId ||
      !formData.quantity ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setSnackbar({
        open: true,
        message: 'Please fill all fields correctly!',
        severity: 'warning',
      });
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setSnackbar({
        open: true,
        message: 'Start date must be before end date!',
        severity: 'warning',
      });
      return;
    }

    try {
      await addWIPCycle(formData);
      setFormData({ productId: '', quantity: '', startDate: '', endDate: '' });
      setSnackbar({
        open: true,
        message: 'Production cycle added successfully!',
        severity: 'success',
      });
      setPage(0); // Reset to first page
    } catch (error) {
      console.error('❌ Error adding cycle:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add production cycle!',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cycle?')) return;

    try {
      await deleteWIPCycle(id);
      setSnackbar({
        open: true,
        message: 'Cycle deleted successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('❌ Error deleting cycle:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete cycle!',
        severity: 'error',
      });
    }
  };

  const paginatedCycles = useMemo(() => {
    if (!Array.isArray(wipCycles)) return [];
    return wipCycles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [wipCycles, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <div className='p-6 flex justify-center items-center min-h-screen'>
        <CircularProgress size={48} sx={{ color: '#0d9488' }} />
        <Typography sx={{ ml: 2, color: 'text.secondary' }}>
          Loading production data...
        </Typography>
      </div>
    );
  }

  return (
    <div className='p-6 flex flex-col gap-6'>
      <div className='rounded-xl overflow-hidden shadow-md'>
        <div className='p-6 border-b border-gray-200'>
          <Typography variant='h5' sx={{ fontWeight: 600, color: 'grey.800' }}>
            Production Planning
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1 }}>
            Schedule work-in-progress production cycles
          </Typography>
        </div>

        {/* Form */}
        <div className='p-6 border-b border-gray-200'>
          <Card variant='outlined'>
            <CardContent sx={{ p: 3 }}>
              <div className='flex items-center gap-3 mb-4'>
                <CalendarIcon sx={{ fontSize: 32, color: '#0d9488' }} />
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Schedule Production Cycle
                </Typography>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
                <FormControl fullWidth>
                  <InputLabel>Product</InputLabel>
                  <Select
                    name='productId'
                    value={formData.productId}
                    onChange={handleChange}
                    label='Product'
                  >
                    <MenuItem value=''>
                      <em>Select Product</em>
                    </MenuItem>
                    {Array.isArray(products) &&
                      products.map((p) => (
                        <MenuItem key={p.id || p._id} value={p.id || p._id}>
                          {p.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <TextField
                  label='Quantity'
                  type='number'
                  name='quantity'
                  value={formData.quantity}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  label='Start Date'
                  type='date'
                  name='startDate'
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <TextField
                  label='End Date'
                  type='date'
                  name='endDate'
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <Button
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={handleAddCycle}
                  fullWidth
                  sx={{
                    bgcolor: '#0d9488',
                    height: '56px',
                    '&:hover': { bgcolor: '#14b8a6' },
                  }}
                >
                  Add Cycle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WIP Table */}
        <div className='p-6'>
          <div className='flex justify-between items-center mb-4'>
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'grey.800' }}>
              Scheduled WIP Cycles
            </Typography>
          </div>

          {!Array.isArray(wipCycles) || wipCycles.length === 0 ? (
            <Typography color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
              No scheduled cycles. Add a new cycle to get started.
            </Typography>
          ) : (
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
                        Quantity
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
                        Start Date
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
                        End Date
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
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCycles.map((c, index) => {
                      const actualIndex = page * rowsPerPage + index;
                      const isEven = actualIndex % 2 === 0;
                      return (
                        <TableRow
                          key={c.id || c._id}
                          hover
                          sx={{
                            bgcolor: isEven ? '#fafafa' : '#f5f5f5',
                            '&:hover': { bgcolor: '#e8f5e9' },
                          }}
                        >
                          <TableCell sx={{ color: 'grey.800', py: 1.5 }}>
                            {products.find((p) => (p.id || p._id) === c.productId)?.name || '-'}
                          </TableCell>
                          <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                            {c.quantity}
                          </TableCell>
                          <TableCell sx={{ color: 'grey.800', py: 1.5 }}>
                            {c.startDate
                              ? new Date(c.startDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell sx={{ color: 'grey.800', py: 1.5 }}>
                            {c.endDate ? new Date(c.endDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell align='center' sx={{ py: 1.5 }}>
                            <Tooltip title='Delete Cycle'>
                              <IconButton
                                size='small'
                                onClick={() => handleDelete(c.id || c._id)}
                                sx={{ color: '#d32f2f' }}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component='div'
                count={wipCycles.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTablePagination-toolbar': { bgcolor: 'grey.50' },
                }}
              />
            </div>
          )}
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
