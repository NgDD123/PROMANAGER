// frontend/src/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './components/stock/sidebar.jsx';
import StockNavbar from './components/stock/StockNavbar.jsx';

export default function AppLayout() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar - MUI Drawer handles its own positioning */}
      <Sidebar />

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Box
          component="header"
          sx={{
            height: 64,
            background: 'linear-gradient(to right, #0d9488, #06b6d4, #0d9488)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            boxShadow: 2,
          }}
        >
          <Box component="h1" sx={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.5px', m: 0 }}>
            Stock Dashboard
          </Box>

          {/* ✅ Navbar with login/logout separated from dashboard */}
          <StockNavbar />
        </Box>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 3,
            bgcolor: 'grey.50',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
