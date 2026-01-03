import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Typography,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory as PackageIcon,
  Description as FileTextIcon,
  LocalOffer as TagIcon,
  Calculate as CalculateIcon,
  Layers as LayersIcon,
  LocationOn as LocationOnIcon,
  QrCode as QrCodeIcon,
  CalendarToday as CalendarTodayIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  VerifiedUser as VerifiedUserIcon,
  Inventory2 as Inventory2Icon,
  Business as BusinessIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/icons-material';

export default function SinglePurchaseHistory({ isOpen, onClose, purchase }) {
  if (!purchase) return null;

  const iconMap = {
    productName: <PackageIcon sx={{ fontSize: 16 }} />,
    description: <FileTextIcon sx={{ fontSize: 16 }} />,
    type: <TagIcon sx={{ fontSize: 16 }} />,
    quantity: <LayersIcon sx={{ fontSize: 16 }} />,
    unit: <TagIcon sx={{ fontSize: 16 }} />,
    unitPrice: <CalculateIcon sx={{ fontSize: 16 }} />,
    discount: <CalculateIcon sx={{ fontSize: 16 }} />,
    tax: <CalculateIcon sx={{ fontSize: 16 }} />,
    totalPrice: <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />,
    storeLocation: <LocationOnIcon sx={{ fontSize: 16 }} />,
    storeCategory: <BusinessIcon sx={{ fontSize: 16 }} />,
    batchNumber: <QrCodeIcon sx={{ fontSize: 16 }} />,
    expirationDate: <CalendarTodayIcon sx={{ fontSize: 16 }} />,
    qualityGrade: <WorkspacePremiumIcon sx={{ fontSize: 16 }} />,
    warranty: <VerifiedUserIcon sx={{ fontSize: 16 }} />,
    serialNumber: <QrCodeIcon sx={{ fontSize: 16 }} />,
    inventoryAccountId: <Inventory2Icon sx={{ fontSize: 16 }} />,
    openingStock: <LayersIcon sx={{ fontSize: 16 }} />,
  };

  const sections = [
    {
      title: 'General Information',
      icon: <PackageIcon sx={{ fontSize: 20, color: '#0d9488' }} />,
      fields: [
        'productName',
        'description',
        'type',
        'storeCategory',
        'storeLocation',
      ],
    },
    {
      title: 'Quantity & Pricing',
      icon: <CalculateIcon sx={{ fontSize: 20, color: '#0d9488' }} />,
      fields: [
        'quantity',
        'unit',
        'unitPrice',
        'discount',
        'tax',
        'totalPrice',
      ],
    },
    {
      title: 'Inventory Details',
      icon: <Inventory2Icon sx={{ fontSize: 20, color: '#0d9488' }} />,
      fields: ['inventoryAccountId', 'openingStock'],
    },
    {
      title: 'Product Metadata',
      icon: <QrCodeIcon sx={{ fontSize: 20, color: '#0d9488' }} />,
      fields: [
        'batchNumber',
        'expirationDate',
        'qualityGrade',
        'serialNumber',
        'warranty',
      ],
    },
  ];

  const formatFieldName = (field) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#0d9488',
          color: 'white',
          fontWeight: 600,
          fontSize: '1.5rem',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            {purchase.productName || 'Purchase Details'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Detailed purchase overview
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
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

      <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sections.map((section) => (
            <Box key={section.title} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {section.icon}
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                  {section.title}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {section.fields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <Card
                      sx={{
                        height: '100%',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 3,
                          bgcolor: 'rgba(13, 148, 136, 0.05)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ color: '#6b7280' }}>
                            {iconMap[field]}
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#6b7280',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              fontSize: '0.65rem',
                            }}
                          >
                            {formatFieldName(field)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: '#111827',
                            wordBreak: 'break-word',
                          }}
                        >
                          {purchase[field] || '—'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
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
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#374151',
            '&:hover': {
              bgcolor: '#1f2937',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
