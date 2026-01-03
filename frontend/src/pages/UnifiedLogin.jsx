import React, { useState } from 'react';
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
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

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

export default function UnifiedLogin() {
  const { login: regularLogin } = useAuth();
  const { login: stockLogin } = useStockAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;

      // Try stock login first
      try {
        user = await stockLogin(email, password);
      } catch (stockErr) {
        // If stock login fails, try regular login
        try {
          user = await regularLogin(email, password);
        } catch (regularErr) {
          throw new Error('Invalid email or password');
        }
      }

      // Redirect based on role
      const redirectPath = getRedirectPath(user.role);
      nav(redirectPath);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="xs"
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
          <LoginIcon sx={{ fontSize: 48, color: '#0d9488', mb: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#111827' }}>
            Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            variant="outlined"
            disabled={loading}
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
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            variant="outlined"
            disabled={loading}
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: '#0d9488',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Register
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

