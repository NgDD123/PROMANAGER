import React, { useState } from 'react';
import { useFixedAssets } from '../../context/FixedAssetContext';
import { useStock } from '../../context/stockContext';
import StockTable from '../../components/stock/StockTable';
import { formatCurrency, supportedCurrencies } from '../../utils/format';
import {
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Calculate as CalculateIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

export default function FixedAssetsPage() {
  const {
    assets,
    loading,
    addAsset,
    removeAsset,
    refreshAssets,
    postMonthlyDepreciation,
  } = useFixedAssets();

  const { accountSettings, loading: accountsLoading } = useStock();

  const [formOpen, setFormOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [form, setForm] = useState({
    assetName: '',
    cost: 0,
    usefulLife: 5,
    purchaseDate: new Date().toISOString().slice(0, 10),
    accountId: '',
    accountName: '',
    paymentAccountId: '',
    paymentAccountName: '',
    currency: 'RWF',
  });

  // ===========================
  // Dashboard Calculations
  // ===========================
  const totalCost = assets.reduce((sum, a) => sum + Number(a.cost || 0), 0);
  const totalDepreciation = assets.reduce(
    (sum, a) => sum + Number(a.accumulatedDepreciation || 0),
    0
  );
  const netBookValue = totalCost - totalDepreciation;

  // ===========================
  // Form Handlers
  // ===========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.assetName) {
      setAlertMessage('Asset Name is required.');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (!form.cost || form.cost <= 0) {
      setAlertMessage('Cost must be greater than 0.');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (!form.accountId) {
      setAlertMessage('Select an Asset Account.');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (!form.paymentAccountId) {
      setAlertMessage('Select a Payment Account.');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    try {
      const payload = {
        assetName: form.assetName,
        cost: Number(form.cost),
        usefulLife: Number(form.usefulLife),
        acquisitionDate: form.purchaseDate,
        purchaseAccountId: form.accountId,
        purchaseAccountName: form.accountName,
        paymentAccountId: form.paymentAccountId,
        paymentAccountName: form.paymentAccountName,
        currency: form.currency,
      };

      const saved = await addAsset(payload);

      if (saved) {
        setAlertMessage('Asset saved successfully!');
        setAlertSeverity('success');
        setAlertOpen(true);
        setFormOpen(false);
        refreshAssets();
        setForm({
          assetName: '',
          cost: 0,
          usefulLife: 5,
          purchaseDate: new Date().toISOString().slice(0, 10),
          accountId: '',
          accountName: '',
          paymentAccountId: '',
          paymentAccountName: '',
          currency: 'RWF',
        });
      } else {
        throw new Error('No asset returned from backend.');
      }
    } catch (err) {
      console.error('❌ Asset save failed:', err);
      setAlertMessage(
        'Failed to save asset: ' + (err.response?.data?.error || err.message)
      );
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleDepreciation = async () => {
    try {
      await postMonthlyDepreciation();
      setAlertMessage('Monthly depreciation posted successfully!');
      setAlertSeverity('success');
      setAlertOpen(true);
      refreshAssets();
    } catch (err) {
      setAlertMessage(
        'Failed to post depreciation: ' +
          (err.response?.data?.error || err.message)
      );
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setForm({
      assetName: '',
      cost: 0,
      usefulLife: 5,
      purchaseDate: new Date().toISOString().slice(0, 10),
      accountId: '',
      accountName: '',
      paymentAccountId: '',
      paymentAccountName: '',
      currency: 'RWF',
    });
  };

  // ===========================
  // Table Fields
  // ===========================
  const fields = [
    { name: 'assetName', label: 'Asset Name' },
    { name: 'cost', label: 'Cost', type: 'currency' },
    {
      name: 'accumulatedDepreciation',
      label: 'Accumulated Depreciation',
      type: 'currency',
    },
    { name: 'usefulLife', label: 'Useful Life (Years)' },
    { name: 'acquisitionDate', label: 'Purchase Date' },
    { name: 'purchaseAccountName', label: 'Asset Account' },
    { name: 'paymentAccountName', label: 'Payment Account' },
    { name: 'currency', label: 'Currency' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'grey.800' }}>
            Fixed Assets
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
              sx={{
                bgcolor: '#0d9488',
                '&:hover': {
                  bgcolor: '#14b8a6',
                },
              }}
            >
              Add Asset
            </Button>
            <Button
              variant="contained"
              startIcon={<CalculateIcon />}
              onClick={handleDepreciation}
              sx={{
                bgcolor: '#f59e0b',
                '&:hover': {
                  bgcolor: '#d97706',
                },
              }}
            >
              Post Depreciation
            </Button>
          </div>
        </div>

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            sx={{
              boxShadow: 2,
              borderRadius: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <div className="flex items-center gap-2 mb-1">
                <AccountBalanceWalletIcon sx={{ color: '#0d9488', fontSize: 28 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Cost
                </Typography>
              </div>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'grey.800' }}>
                {formatCurrency(totalCost, 'RWF')}
              </Typography>
            </CardContent>
          </Card>
          <Card
            sx={{
              boxShadow: 2,
              borderRadius: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDownIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Accumulated Depreciation
                </Typography>
              </div>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'grey.800' }}>
                {formatCurrency(totalDepreciation, 'RWF')}
              </Typography>
            </CardContent>
          </Card>
          <Card
            sx={{
              boxShadow: 2,
              borderRadius: 2,
              bgcolor: '#ecfdf5',
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <div className="flex items-center gap-2 mb-1">
                <AccountBalanceWalletIcon sx={{ color: '#10b981', fontSize: 28 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Net Book Value
                </Typography>
              </div>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#065f46' }}>
                {formatCurrency(netBookValue, 'RWF')}
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* Assets Table */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <StockTable
            title='Fixed Assets'
            data={assets}
            fields={fields}
            loading={loading || accountsLoading}
            deleteItem={(id) => removeAsset(id)}
          />
        </Paper>
      </div>

      {/* Add Asset Dialog */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#0d9488',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.25rem',
            py: 2,
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Add Fixed Asset
          <IconButton
            onClick={handleCloseForm}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: 'white' }}>
          <form id="asset-form" onSubmit={handleSubmit} className="mt-1">
            <div className="flex flex-col gap-6">
              <TextField
                fullWidth
                label="Asset Name"
                name="assetName"
                value={form.assetName}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#0d9488',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0d9488',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Cost"
                name="cost"
                type="number"
                value={form.cost}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#0d9488',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0d9488',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Useful Life (Years)"
                name="usefulLife"
                type="number"
                value={form.usefulLife}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                inputProps={{ min: 1 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#0d9488',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0d9488',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Purchase Date"
                name="purchaseDate"
                type="date"
                value={form.purchaseDate}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#0d9488',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0d9488',
                    },
                  },
                }}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Asset Account</InputLabel>
                <Select
                  name="accountId"
                  value={form.accountId}
                  onChange={(e) => {
                    const acc = accountSettings.find(
                      (a) => a.id === e.target.value
                    );
                    setForm((prev) => ({
                      ...prev,
                      accountId: acc?.id || '',
                      accountName: acc?.name || '',
                    }));
                  }}
                  label="Asset Account"
                  required
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0d9488',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0d9488',
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select Asset Account</em>
                  </MenuItem>
                  {accountSettings
                    .filter((a) => a.category?.toLowerCase() === 'assets')
                    .map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Payment Account</InputLabel>
                <Select
                  name="paymentAccountId"
                  value={form.paymentAccountId}
                  onChange={(e) => {
                    const acc = accountSettings.find(
                      (a) => a.id === e.target.value
                    );
                    setForm((prev) => ({
                      ...prev,
                      paymentAccountId: acc?.id || '',
                      paymentAccountName: acc?.name || '',
                    }));
                  }}
                  label="Payment Account"
                  required
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0d9488',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0d9488',
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select Payment Account</em>
                  </MenuItem>
                  {accountSettings
                    .filter((a) =>
                      ['assets', 'cash', 'bank'].includes(a.category?.toLowerCase())
                    )
                    .map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  label="Currency"
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0d9488',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0d9488',
                    },
                  }}
                >
                  {supportedCurrencies.map((cur) => (
                    <MenuItem key={cur} value={cur}>
                      {cur}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </form>
        </DialogContent>
        <DialogActions
          sx={{
            bgcolor: 'white',
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            onClick={handleCloseForm}
            variant="outlined"
            sx={{
              borderColor: 'grey.400',
              color: 'grey.700',
              '&:hover': {
                borderColor: 'grey.600',
                bgcolor: 'grey.50',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="asset-form"
            variant="contained"
            sx={{
              bgcolor: '#0d9488',
              '&:hover': {
                bgcolor: '#14b8a6',
              },
            }}
          >
            Save Asset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
