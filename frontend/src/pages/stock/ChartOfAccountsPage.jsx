import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useStock } from "../../context/stockContext";
import ChartOfAccountsTable from "../../components/stock/ChartOfAccountsTable";
import ChartOfAccountsForm from "../../components/stock/ChartOfAccountsForm";

export default function ChartOfAccountsPage() {
  const {
    accountSettings,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useStock();

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log("ChartOfAccountsPage loaded");
    console.log("accountSettings:", accountSettings);
  }, [accountSettings]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (selected) {
        await updateAccount(selected.id, data);
      } else {
        await addAccount(data);
      }
      setShowForm(false);
      setSelected(null);
    } catch (err) {
      console.error("Error saving account:", err);
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
      <ChartOfAccountsTable
        data={accountSettings || []}
        loading={loading}
        onAdd={handleOpenDialog}
        onEdit={(item) => {
          setSelected(item);
          setShowForm(true);
        }}
        onDelete={(id) => deleteAccount(id)}
      />

      <Dialog
        open={showForm}
        onClose={handleCloseDialog}
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
          }}
        >
          {selected ? 'Edit Account' : 'Add Account'}
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'white', maxHeight: '80vh', overflow: 'auto' }}>
          <ChartOfAccountsForm
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
