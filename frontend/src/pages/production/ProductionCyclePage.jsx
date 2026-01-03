import React, { useState, useMemo } from 'react';
import { useProduction } from '../../context/ProductionContext';
import { useStock } from '../../context/stockContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import AttachRawMaterials from '../../components/prodution/RawMaterialSelector';
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
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  GetApp as ExportIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export default function ProductionCyclePage() {
  const { plans, cycles, startCycle, completeCycle, loading } = useProduction();
  const { products } = useStock();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [showRawMaterialModal, setShowRawMaterialModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [completeForm, setCompleteForm] = useState({
    producedQty: '',
    laborCost: '',
    overheadCost: '',
  });

  const [filterProduct, setFilterProduct] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [plansPage, setPlansPage] = useState(0);
  const [plansRowsPerPage, setPlansRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filter approved plans
  const approvedPlans = useMemo(
    () => plans.filter((p) => p.status === 'approved'),
    [plans]
  );

  const filteredPlans = useMemo(() => {
    return approvedPlans.filter((p) => {
      const searchLower = search.toLowerCase();
      return (
        (p.planName || '').toLowerCase().includes(searchLower) ||
        (p.productName || '').toLowerCase().includes(searchLower)
      );
    });
  }, [approvedPlans, search]);

  const paginatedPlans = filteredPlans.slice(
    plansPage * plansRowsPerPage,
    plansPage * plansRowsPerPage + plansRowsPerPage
  );

  // Filter cycles
  const filteredCycles = useMemo(() => {
    return cycles.filter((c) => {
      const matchesProduct = !filterProduct || c.productName === filterProduct;
      const createdAt = c.createdAt?.toDate
        ? c.createdAt.toDate()
        : new Date(c.createdAt);
      const matchesDate =
        (!dateRange.from || createdAt >= new Date(dateRange.from)) &&
        (!dateRange.to || createdAt <= new Date(dateRange.to));
      return matchesProduct && matchesDate;
    });
  }, [cycles, filterProduct, dateRange]);

  const paginatedCycles = filteredCycles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Start cycle
  const handleStartCycle = (plan) => {
    setSelectedPlan(plan);
    setShowRawMaterialModal(true);
  };

  // Complete cycle
  const openCompleteModal = (cycle) => {
    setSelectedCycle(cycle);
    setCompleteForm({
      producedQty: cycle.quantityPlanned || '',
      laborCost: cycle.costSummary?.laborCost || 0,
      overheadCost: cycle.costSummary?.overheadCost || 0,
    });
    setShowCompleteModal(true);
  };

  const handleSubmitCompleteCycle = async () => {
    if (!selectedCycle?.id) {
      setSnackbar({ open: true, message: 'Missing cycle ID', severity: 'error' });
      return;
    }

    const { producedQty, laborCost, overheadCost } = completeForm;
    if (!producedQty) {
      setSnackbar({ open: true, message: 'Please enter produced quantity', severity: 'warning' });
      return;
    }

    try {
      await completeCycle({
        cycleId: selectedCycle.id,
        producedQty: Number(producedQty),
        laborCost: Number(laborCost),
        overheadCost: Number(overheadCost),
      });
      setSnackbar({ open: true, message: 'Cycle completed successfully!', severity: 'success' });
      setShowCompleteModal(false);
      setSelectedCycle(null);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to complete cycle', severity: 'error' });
    }
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Production Cycles Summary', 14, 10);
    const tableData = filteredCycles.map((c) => [
      c.id,
      c.productName,
      c.quantityPlanned,
      c.quantityCompleted,
      c.costSummary?.laborCost || 0,
      c.costSummary?.overheadCost || 0,
      c.costSummary?.materialCost || 0,
      c.costSummary?.totalCost || 0,
      c.status,
    ]);
    doc.autoTable({
      head: [
        [
          'Cycle ID',
          'Product',
          'Planned Qty',
          'Completed Qty',
          'Labor Cost',
          'Overhead Cost',
          'Material Cost',
          'Total Cost',
          'Status',
        ],
      ],
      body: tableData,
    });
    doc.save('ProductionCyclesReport.pdf');
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'planned':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className='p-6 flex flex-col gap-6'>
      {/* Header */}
      <div className='rounded-xl overflow-hidden shadow-md'>
        <div className='p-6 flex justify-between items-center border-b border-gray-200'>
          <Typography variant='h5' sx={{ fontWeight: 600, color: 'grey.800' }}>
            Production Cycles
          </Typography>
          <div className='flex items-center gap-3'>
            <CSVLink
              data={filteredCycles.map((c) => ({
                id: c.id,
                product: c.productName,
                plannedQty: c.quantityPlanned,
                completedQty: c.quantityCompleted,
                laborCost: c.costSummary?.laborCost || 0,
                overheadCost: c.costSummary?.overheadCost || 0,
                materialCost: c.costSummary?.materialCost || 0,
                totalCost: c.costSummary?.totalCost || 0,
                status: c.status,
              }))}
              filename='ProductionCycles.csv'
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant='outlined'
                startIcon={<ExportIcon />}
                sx={{ borderColor: '#0d9488', color: '#0d9488' }}
              >
                Export CSV
              </Button>
            </CSVLink>
            <Button
              variant='outlined'
              startIcon={<ExportIcon />}
              onClick={exportPDF}
              sx={{ borderColor: '#0d9488', color: '#0d9488' }}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className='p-6 flex flex-wrap gap-4 items-end border-b border-gray-200'>
          <TextField
            type='date'
            label='From Date'
            value={dateRange.from}
            onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
            size='small'
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            type='date'
            label='To Date'
            value={dateRange.to}
            onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
            size='small'
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <FormControl size='small' sx={{ width: 200 }}>
            <InputLabel>Filter by Product</InputLabel>
            <Select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              label='Filter by Product'
            >
              <MenuItem value=''>All Products</MenuItem>
              {products.map((p) => (
                <MenuItem key={p.id} value={p.name}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Approved Plans Table */}
        <div className='p-6 border-b border-gray-200'>
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'grey.800', mb: 3 }}>
            Approved Plans
          </Typography>
          {loading ? (
            <div className='flex justify-center items-center py-10'>
              <CircularProgress />
              <Typography sx={{ ml: 2, color: 'text.secondary' }}>Loading plans...</Typography>
            </div>
          ) : filteredPlans.length === 0 ? (
            <Typography color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
              No approved plans available.
            </Typography>
          ) : (
            <>
              <div className='mb-4 flex justify-end'>
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
              </div>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size='small' stickyHeader>
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
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPlans.map((p, index) => {
                      const actualIndex = plansPage * plansRowsPerPage + index;
                      const isEven = actualIndex % 2 === 0;
                      return (
                        <TableRow
                          key={p.id}
                          hover
                          sx={{
                            bgcolor: isEven ? '#fafafa' : '#f5f5f5',
                            '&:hover': { bgcolor: '#e8f5e9' },
                          }}
                        >
                          <TableCell sx={{ color: 'grey.800', py: 1.5 }}>
                            {p.planName}
                          </TableCell>
                          <TableCell sx={{ color: 'grey.800', py: 1.5 }}>
                            {p.productName}
                          </TableCell>
                          <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                            {p.quantity}
                          </TableCell>
                          <TableCell align='center' sx={{ py: 1.5 }}>
                            <Tooltip title='Start Cycle'>
                              <IconButton
                                size='small'
                                onClick={() => handleStartCycle(p)}
                                sx={{ color: '#0d9488' }}
                              >
                                <PlayArrowIcon fontSize='small' />
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
                count={filteredPlans.length}
                page={plansPage}
                onPageChange={(e, newPage) => setPlansPage(newPage)}
                rowsPerPage={plansRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setPlansRowsPerPage(parseInt(e.target.value, 10));
                  setPlansPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTablePagination-toolbar': { bgcolor: 'grey.50' },
                }}
              />
            </>
          )}
        </div>

        {/* Production Cycles Table */}
        <div className='p-6'>
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'grey.800', mb: 3 }}>
            Production Cycles
          </Typography>
          {loading ? (
            <div className='flex justify-center items-center py-10'>
              <CircularProgress />
              <Typography sx={{ ml: 2, color: 'text.secondary' }}>Loading cycles...</Typography>
            </div>
          ) : filteredCycles.length === 0 ? (
            <Typography color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
              No cycles found.
            </Typography>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 600 }}>
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
                        Material Cost
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
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCycles.map((c, index) => {
                      const actualIndex = page * rowsPerPage + index;
                      const isEven = actualIndex % 2 === 0;
                      return (
                        <TableRow
                          key={c.id}
                          hover
                          sx={{
                            bgcolor: isEven ? '#fafafa' : '#f5f5f5',
                            '&:hover': { bgcolor: '#e8f5e9' },
                          }}
                        >
                          <TableCell sx={{ color: 'grey.800', py: 1.5 }}>{c.id}</TableCell>
                          <TableCell sx={{ color: 'grey.800', py: 1.5 }}>
                            {c.productName}
                          </TableCell>
                          <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                            {c.quantityPlanned}
                          </TableCell>
                          <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                            {c.quantityCompleted || 0}
                          </TableCell>
                          <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                            {formatCurrency(c.costSummary?.laborCost)}
                          </TableCell>
                          <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                            {formatCurrency(c.costSummary?.overheadCost)}
                          </TableCell>
                          <TableCell align='right' sx={{ color: 'grey.800', py: 1.5 }}>
                            {formatCurrency(c.costSummary?.materialCost)}
                          </TableCell>
                          <TableCell
                            align='right'
                            sx={{ color: 'grey.800', py: 1.5, fontWeight: 600 }}
                          >
                            {formatCurrency(c.costSummary?.totalCost)}
                          </TableCell>
                          <TableCell align='center' sx={{ py: 1.5 }}>
                            <Chip
                              label={c.status || 'unknown'}
                              size='small'
                              color={getStatusColor(c.status)}
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell align='center' sx={{ py: 1.5 }}>
                            {c.status !== 'completed' ? (
                              <Tooltip title='Complete Cycle'>
                                <IconButton
                                  size='small'
                                  onClick={() => openCompleteModal(c)}
                                  sx={{ color: '#0d9488' }}
                                >
                                  <CheckCircleIcon fontSize='small' />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Chip label='Done' size='small' color='success' icon={<CheckCircleIcon />} />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component='div'
                count={filteredCycles.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTablePagination-toolbar': { bgcolor: 'grey.50' },
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Attach Raw Materials Modal */}
      {showRawMaterialModal && selectedPlan && (
        <AttachRawMaterials
          plan={selectedPlan}
          onClose={() => {
            setShowRawMaterialModal(false);
            setSelectedPlan(null);
          }}
        />
      )}

      {/* Complete Cycle Dialog */}
      <Dialog
        open={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedCycle(null);
        }}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#0d9488',
            color: 'white',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Complete Cycle - {selectedCycle?.productName}
          <IconButton
            onClick={() => {
              setShowCompleteModal(false);
              setSelectedCycle(null);
            }}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <div className='space-y-4'>
            <TextField
              fullWidth
              label='Produced Quantity'
              type='number'
              value={completeForm.producedQty}
              onChange={(e) =>
                setCompleteForm({
                  ...completeForm,
                  producedQty: e.target.value,
                })
              }
              required
              size='small'
            />
            <TextField
              fullWidth
              label='Labor Cost'
              type='number'
              value={completeForm.laborCost}
              onChange={(e) =>
                setCompleteForm({
                  ...completeForm,
                  laborCost: e.target.value,
                })
              }
              size='small'
            />
            <TextField
              fullWidth
              label='Overhead Cost'
              type='number'
              value={completeForm.overheadCost}
              onChange={(e) =>
                setCompleteForm({
                  ...completeForm,
                  overheadCost: e.target.value,
                })
              }
              size='small'
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setShowCompleteModal(false);
              setSelectedCycle(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleSubmitCompleteCycle}
            sx={{
              bgcolor: '#0d9488',
              '&:hover': { bgcolor: '#14b8a6' },
            }}
            startIcon={<CheckCircleIcon />}
          >
            Complete Cycle
          </Button>
        </DialogActions>
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
