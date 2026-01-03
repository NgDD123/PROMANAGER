import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useStockAuth } from '../context/StockAuthContext.jsx';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

// Helper function to determine redirect path based on role
const getRedirectPath = (role) => {
  const normalizedRole = (role || '').toUpperCase();

  // Stock management roles
  const stockRoles = [
    'ADMIN',
    'MANAGER',
    'STAFF',
    'STOREKEEPER',
    'ACCOUNTANT',
    'PURCHASER',
    'SALES',
    'PRODUCTIONMANAGER',
    'DIRECTOR_MANAGER',
    'PRODUCTION_MANAGER',
    'FINANCE_MANAGER',
    'SALE_MANAGER',
    'MARKETTING_MANAGER',
    'STOCK_KEEPER',
    'PROCUREMENT',
    'SUPER_ADMIN',
    'GUEST',
  ];

  if (stockRoles.includes(normalizedRole)) {
    return '/stock/inventory';
  }

  // Regular user roles
  switch (normalizedRole) {
    case 'PATIENT':
      return '/';
    case 'DOCTOR':
      return '/prescription';
    case 'PHARMACY':
      return '/pharmacy-rx';
    case 'CALLCENTER':
      return '/callcenter';
    default:
      return '/';
  }
};

// Regular user roles
const regularRoles = [
  { value: 'PATIENT', label: 'Patient' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'CALLCENTER', label: 'Call Center' },
];

// Stock user roles
const stockRoles = [
  { value: 'STAFF', label: 'Staff' },
  { value: 'STOREKEEPER', label: 'Store Keeper' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'PURCHASER', label: 'Purchaser' },
  { value: 'SALES', label: 'Sales' },
  { value: 'PRODUCTIONMANAGER', label: 'Production Manager' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
];

// Departments for stock users
const departments = [
  { value: 'General', label: 'General' },
  { value: 'Warehouse', label: 'Warehouse' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Production', label: 'Production' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Purchasing', label: 'Purchasing' },
];

export default function UnifiedRegister() {
  const { register: regularRegister } = useAuth();
  const { register: stockRegister } = useStockAuth();
  const nav = useNavigate();

  const [tabValue, setTabValue] = useState(0); // 0 for regular, 1 for stock
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [department, setDepartment] = useState('General');
  const [pharmacyId, setPharmacyId] = useState('');
  const [newPharmacyName, setNewPharmacyName] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch pharmacies for PHARMACY role
  useEffect(() => {
    if (tabValue === 0 && role === 'PHARMACY') {
      const fetchPharmacies = async () => {
        try {
          const resp = await fetch('http://localhost:5000/api/v1/pharmacies/search');
          if (resp.ok) {
            const data = await resp.json();
            setPharmacies(data);
          }
        } catch (err) {
          console.error('Fetch pharmacies error:', err);
        }
      };
      fetchPharmacies();
    }
  }, [tabValue, role]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setRole(newValue === 0 ? 'PATIENT' : 'STAFF');
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;

      if (tabValue === 0) {
        // Regular user registration
        if (!phone && role === 'PATIENT') {
          throw new Error('Please enter your phone number');
        }

        user = await regularRegister({
          name,
          email,
          password,
          phone,
          role,
          pharmacyId,
          newPharmacyName,
        });
      } else {
        // Stock user registration
        user = await stockRegister({
          name,
          email,
          password,
          role,
          department,
        });
      }

      // Redirect based on role
      const redirectPath = getRedirectPath(user.role);
      nav(redirectPath);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          borderRadius: 3,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <PersonAddIcon sx={{ fontSize: 48, color: '#0d9488', mb: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#111827' }}>
            Register
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create a new account
          </Typography>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Regular User" />
          <Tab label="Stock Management" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            variant="outlined"
            disabled={loading}
          />

          {tabValue === 0 && (
            <>
              <TextField
                label="Phone Number"
                placeholder="e.g., 250788123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={role === 'PATIENT'}
                fullWidth
                variant="outlined"
                disabled={loading}
              />

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Role"
                  disabled={loading}
                >
                  {regularRoles.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {role === 'PHARMACY' && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>Select Existing Pharmacy</InputLabel>
                    <Select
                      value={pharmacyId}
                      onChange={(e) => setPharmacyId(e.target.value)}
                      label="Select Existing Pharmacy"
                      disabled={loading}
                    >
                      <MenuItem value="">-- None / Create New --</MenuItem>
                      {pharmacies.map((ph) => (
                        <MenuItem key={ph.id} value={ph.id}>
                          {ph.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {!pharmacyId && (
                    <TextField
                      label="New Pharmacy Name"
                      placeholder="Enter new pharmacy name"
                      value={newPharmacyName}
                      onChange={(e) => setNewPharmacyName(e.target.value)}
                      fullWidth
                      variant="outlined"
                      disabled={loading}
                    />
                  )}
                </>
              )}
            </>
          )}

          {tabValue === 1 && (
            <>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Role"
                  disabled={loading}
                >
                  {stockRoles.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  label="Department"
                  disabled={loading}
                >
                  {departments.map((d) => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              bgcolor: '#0d9488',
              '&:hover': {
                bgcolor: '#14b8a6',
              },
              '&:disabled': {
                bgcolor: '#94a3b8',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#0d9488',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

