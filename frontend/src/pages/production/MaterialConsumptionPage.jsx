// src/pages/production/MaterialConsumptionPage.js
import React, { useState } from 'react';
import { useStock } from '../../context/stockContext';
import { useProduction } from '../../context/ProductionContext';
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export default function MaterialConsumptionPage() {
  const { products, getProductStock, updateItem } = useStock();
  const { wipCycles, completeCycle, loading } = useProduction();
  const [selectedCycle, setSelectedCycle] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleConsumeMaterials = async () => {
    const cycle = (wipCycles || []).find((c) => c.id === selectedCycle);
    
    if (!cycle) {
      setSnackbar({ open: true, message: 'Please select a WIP cycle first', severity: 'warning' });
      return;
    }

    const productStock = getProductStock(cycle.productId);
    if (productStock < cycle.quantityPlanned) {
      setSnackbar({
        open: true,
        message: 'Not enough raw material stock for this cycle',
        severity: 'error',
      });
      return;
    }

    try {
      // Reduce stock in StockContext
      await updateItem('purchase', cycle.productId, {
        quantity: productStock - cycle.quantityPlanned,
      });

      // Mark cycle as completed
      await completeCycle(cycle.id);
      
      setSnackbar({
        open: true,
        message: 'Materials consumed and cycle completed successfully!',
        severity: 'success',
      });
      
      setSelectedCycle(''); // Reset selection
    } catch (error) {
      console.error('Error consuming materials:', error);
      setSnackbar({
        open: true,
        message: 'Failed to consume materials',
        severity: 'error',
      });
    }
  };

  const availableCycles = (wipCycles || []).filter((c) => c.status !== 'Completed' && c.status !== 'completed');
  const selectedCycleData = availableCycles.find((c) => c.id === selectedCycle);

  return (
    <div className='p-6 flex flex-col h-full'>
      <div className='rounded-xl overflow-hidden shadow-md flex-1 flex flex-col min-h-[600px]'>
        <div className='p-6 border-b border-gray-200'>
          <Typography variant='h5' sx={{ fontWeight: 600, color: 'grey.800' }}>
            Material Consumption
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1 }}>
            Select a work-in-progress cycle to consume materials and complete it
          </Typography>
        </div>

        <div className='p-6 flex-1 flex items-center justify-center'>
          {loading ? (
            <div className='flex flex-col items-center gap-4'>
              <CircularProgress size={48} sx={{ color: '#0d9488' }} />
              <Typography color='text.secondary'>Loading cycles...</Typography>
            </div>
          ) : (
            <Card sx={{ maxWidth: 600, width: '100%', boxShadow: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <div className='flex items-center gap-3 mb-6'>
                  <InventoryIcon sx={{ fontSize: 40, color: '#0d9488' }} />
                  <div>
                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                      Consume Materials
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Choose a WIP cycle to process
                    </Typography>
                  </div>
                </div>

                <FormControl fullWidth sx={{ mb: 4 }}>
                  <InputLabel>Select WIP Cycle</InputLabel>
                  <Select
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    label='Select WIP Cycle'
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#0d9488',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#14b8a6',
                      },
                    }}
                  >
                    <MenuItem value=''>
                      <em>-- Select a cycle --</em>
                    </MenuItem>
                    {availableCycles.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name || c.productName} - {c.productName} (Qty: {c.quantityPlanned})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedCycleData && (
                  <Alert severity='info' sx={{ mb: 3 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
                      Cycle Details:
                    </Typography>
                    <Typography variant='body2'>
                      Product: {selectedCycleData.productName}
                    </Typography>
                    <Typography variant='body2'>
                      Planned Quantity: {selectedCycleData.quantityPlanned}
                    </Typography>
                    <Typography variant='body2'>
                      Available Stock: {getProductStock(selectedCycleData.productId)}
                    </Typography>
                  </Alert>
                )}

                {availableCycles.length === 0 && (
                  <Alert severity='warning' sx={{ mb: 3 }}>
                    No work-in-progress cycles available. Please start a production cycle first.
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant='contained'
                  size='large'
                  startIcon={<CheckCircleIcon />}
                  onClick={handleConsumeMaterials}
                  disabled={!selectedCycle || availableCycles.length === 0}
                  sx={{
                    bgcolor: '#0d9488',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#14b8a6',
                    },
                    '&:disabled': {
                      bgcolor: 'grey.300',
                    },
                  }}
                >
                  Consume Materials & Complete Cycle
                </Button>
              </CardContent>
            </Card>
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
