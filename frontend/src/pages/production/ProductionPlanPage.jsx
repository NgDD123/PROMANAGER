// ========================================
// ✅ ProductionPlanPage.jsx (Final, Stable)
// ========================================
import React, { useState, useMemo } from 'react';
import { useProduction } from '../../context/ProductionContext';
import ProductionPlanForm from '../../components/prodution/ProductionPlanForm';
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
  IconButton,
  Tooltip,
  Dialog,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export default function ProductionPlanPage() {
  const { plans, createPlan, deletePlan, approvePlan, loading } =
    useProduction();
  const { productSettings } = useStock();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ✅ Filter finished products only
  const finishedProducts = useMemo(() => {
    if (!productSettings) return [];
    return productSettings.filter(
      (p) =>
        p.storeCategory?.toLowerCase() === 'finished products' &&
        p.status?.toLowerCase() === 'active'
    );
  }, [productSettings]);

  // ✅ Create new plan
  const handleCreate = async (data) => {
    try {
      await createPlan(data);
      setShowForm(false);
      setSearch(''); // Reset search
      setPage(0); // Reset to first page
      setSnackbar({ open: true, message: 'Production plan created successfully!', severity: 'success' });
    } catch (err) {
      console.error('❌ Error creating plan:', err);
      setSnackbar({ open: true, message: 'Failed to create production plan', severity: 'error' });
    }
  };

  // ✅ Approve plan
  const handleApprove = async (plan) => {
    if (!plan?.id) {
      setSnackbar({ open: true, message: 'Plan ID is missing', severity: 'error' });
      return;
    }

    try {
      await approvePlan(plan);
      setSnackbar({
        open: true,
        message: `Plan "${plan.planName || plan.finishedProductName}" approved successfully`,
        severity: 'success',
      });
    } catch (err) {
      console.error('❌ Error approving plan:', err);
      setSnackbar({ open: true, message: 'Failed to approve plan', severity: 'error' });
    }
  };

  // ✅ Delete plan
  const handleDelete = async (plan) => {
    if (!plan?.id) return;
    if (!window.confirm(`Are you sure you want to delete "${plan.planName}"?`))
      return;

    try {
      await deletePlan(plan.id);
      setSnackbar({ open: true, message: `Plan "${plan.planName}" deleted successfully`, severity: 'success' });
    } catch (err) {
      console.error('❌ Error deleting plan:', err);
      setSnackbar({ open: true, message: 'Failed to delete plan', severity: 'error' });
    }
  };

  // Filter and pagination
  const filteredPlans = useMemo(() => {
    if (!Array.isArray(plans)) return [];
    return plans.filter((plan) => {
      const searchLower = search.toLowerCase();
      return (
        (plan.planName || '').toLowerCase().includes(searchLower) ||
        (plan.productName || plan.finishedProductName || '').toLowerCase().includes(searchLower) ||
        (plan.status || '').toLowerCase().includes(searchLower)
      );
    });
  }, [plans, search]);

  const paginatedPlans = filteredPlans.slice(
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

  return (
    <div className='p-6 flex flex-col h-full'>
      <div className='rounded-xl overflow-hidden shadow-md flex-1 flex flex-col min-h-[600px]'>
        <div className='p-6 flex justify-between items-center border-b border-gray-200'>
          <Typography variant='h5' sx={{ fontWeight: 600, color: 'grey.800' }}>
            Production Plans
          </Typography>
          <div className='flex items-center gap-4'>
            <TextField
              placeholder='Search plans...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size='small'
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{
                bgcolor: '#0d9488',
                '&:hover': {
                  bgcolor: '#14b8a6',
                },
              }}
            >
              Create New Plan
            </Button>
          </div>
        </div>

        <TableContainer sx={{ flex: 1, overflow: 'auto', minHeight: '500px' }}>
          {loading ? (
            <div className='flex justify-center items-center py-10'>
              <CircularProgress />
              <Typography sx={{ ml: 2, color: 'text.secondary' }}>
                Loading production plans...
              </Typography>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className='flex justify-center items-center py-10'>
              <Typography color='text.secondary'>No production plans found.</Typography>
            </div>
          ) : (
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
                    Plan Name
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
                    Quantity
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
                {paginatedPlans.map((plan, index) => {
                  const actualIndex = page * rowsPerPage + index;
                  const isEven = actualIndex % 2 === 0;
                  return (
                    <TableRow
                      key={plan.id}
                      hover
                      sx={{
                        bgcolor: isEven ? '#fafafa' : '#f5f5f5',
                        '&:hover': {
                          bgcolor: '#e8f5e9',
                        },
                      }}
                    >
                      <TableCell sx={{ color: 'grey.800', py: 1.5 }}>
                        {plan.planName || plan.planCode || 'Unnamed Plan'}
                      </TableCell>
                      <TableCell sx={{ color: 'grey.800', py: 1.5 }}>
                        {plan.productName || plan.finishedProductName || 'Unknown Product'}
                      </TableCell>
                      <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                        {plan.quantity ?? plan.plannedQty ?? 0}
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1.5 }}>
                        <Chip
                          label={plan.status || 'unknown'}
                          size='small'
                          color={
                            plan.status === 'approved'
                              ? 'success'
                              : plan.status === 'planned'
                              ? 'info'
                              : 'default'
                          }
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1.5 }}>
                        <div className='flex justify-center items-center gap-2'>
                          {plan.status === 'planned' && (
                            <Tooltip title='Approve Plan'>
                              <IconButton
                                size='small'
                                onClick={() => handleApprove(plan)}
                                sx={{ color: '#0d9488' }}
                              >
                                <CheckCircleIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title='Delete Plan'>
                            <IconButton
                              size='small'
                              onClick={() => handleDelete(plan)}
                              sx={{ color: '#d32f2f' }}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {filteredPlans.length > 0 && (
          <TablePagination
            component='div'
            count={filteredPlans.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              '& .MuiTablePagination-toolbar': {
                bgcolor: 'grey.50',
              },
            }}
          />
        )}
      </div>

      {/* Form Dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <div className='p-6'>
          <div className='flex justify-between items-center mb-4'>
            <Typography variant='h6' sx={{ fontWeight: 600, color: '#0d9488' }}>
              Create Production Plan
            </Typography>
          </div>
          <ProductionPlanForm
            onSubmit={handleCreate}
            finishedProducts={finishedProducts}
          />
        </div>
      </Dialog>

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
