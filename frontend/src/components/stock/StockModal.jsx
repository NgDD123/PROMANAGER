import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

export default function StockModal({ isOpen, onClose, onSubmit, fields, initialData }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  const handleChange = (e, name) => {
    setFormData({ ...formData, [name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
          p: 0,
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#0d9488",
            color: "white",
            fontWeight: 600,
            fontSize: "1.25rem",
            py: 2,
            px: 3,
          }}
        >
          {initialData ? "Edit Item" : "Add Item"}
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: "white" }}>
          <form onSubmit={handleSubmit} id="stock-form">
            <Grid container spacing={2}>
              {fields.map((f) => (
                <Grid item xs={12} sm={6} key={f.name}>
                  <TextField
                    fullWidth
                    label={f.label}
                    type={f.type === "currency" ? "number" : f.type || "text"}
                    value={formData[f.name] || ""}
                    onChange={(e) => handleChange(e, f.name)}
                    required
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#0d9488",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#0d9488",
                        },
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </form>
        </DialogContent>

        <DialogActions
          sx={{
            bgcolor: "white",
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: "grey.400",
              color: "grey.700",
              "&:hover": {
                borderColor: "grey.600",
                bgcolor: "grey.50",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="stock-form"
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              bgcolor: "#0d9488",
              "&:hover": {
                bgcolor: "#14b8a6",
              },
            }}
          >
            {initialData ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

StockModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
  initialData: PropTypes.object,
};
