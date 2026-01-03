import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useStock } from '../../context/stockContext';
import ProductSettingsTable from '../../components/stock/ProductSettingsTable';
import ProductSettingForm from '../../components/stock/ProductSettingForm';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

export default function ProductSettingsPage() {
  const {
    productSettings,
    loading,
    addProductSetting,
    updateProductSetting,
    deleteProductSetting,
  } = useStock();

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (selected) await updateProductSetting(selected.id, data);
      else await addProductSetting(data);
      setShowForm(false);
      setSelected(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDialog = () => {
    setSelected(null);
    setShowForm(true);
  };

  const handleCloseDialog = () => {
    setShowForm(false);
    setSelected(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <ProductSettingsTable
        data={productSettings}
        loading={loading}
        onAdd={handleOpenDialog}
        onEdit={(item) => {
          setSelected(item);
          setShowForm(true);
        }}
        onDelete={(id) => deleteProductSetting(id)}
      />

      <Dialog
        open={showForm}
        onClose={handleCloseDialog}
        maxWidth="md"
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
          }}
        >
          {selected ? 'Edit Product Setting' : 'Add Product or Service'}
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'white', maxHeight: '80vh', overflow: 'auto' }}>
          <ProductSettingForm
            initialData={selected}
            saving={saving}
            onCancel={handleCloseDialog}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
