import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Stack,
  Grid,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

export default function ChartOfAccountsForm({ initialData, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    accountType: "",
    category: "",
    subCategory: "",
    statement: "",
    status: "Active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const accountTypes = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
  const categories = ["Current", "Non-Current", "Operating", "Non-Operating"];
  const subCategories = ["Cash", "Accounts Receivable", "Inventory", "Fixed Assets", "Accounts Payable", "Long-term Debt"];
  const statements = ["Balance Sheet", "Income Statement", "Cash Flow"];
  const statusOptions = ["Active", "Inactive"];

  return (
    <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            mb: 3,
            fontWeight: 600,
            color: "grey.800",
            pb: 2,
            borderBottom: "2px solid",
            borderColor: "#0d9488",
          }}
        >
          {initialData ? "Edit Account" : "Add Account"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Code */}
            <TextField
              fullWidth
              size="small"
              name="code"
              label="Account Code"
              value={formData.code}
              onChange={handleChange}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#0d9488" },
                  "&.Mui-focused fieldset": { borderColor: "#0d9488" },
                },
              }}
            />

            {/* Name */}
            <TextField
              fullWidth
              size="small"
              name="name"
              label="Account Name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#0d9488" },
                  "&.Mui-focused fieldset": { borderColor: "#0d9488" },
                },
              }}
            />

            {/* Account Type */}
            <FormControl fullWidth size="small">
              <InputLabel>Account Type</InputLabel>
              <Select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                label="Account Type"
                required
                sx={{
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                }}
              >
                {accountTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Category */}
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
                sx={{
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sub Category */}
            <FormControl fullWidth size="small">
              <InputLabel>Sub Category</InputLabel>
              <Select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                label="Sub Category"
                sx={{
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                }}
              >
                {subCategories.map((sub) => (
                  <MenuItem key={sub} value={sub}>
                    {sub}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Statement */}
            <FormControl fullWidth size="small">
              <InputLabel>Statement</InputLabel>
              <Select
                name="statement"
                value={formData.statement}
                onChange={handleChange}
                label="Statement"
                sx={{
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                }}
              >
                {statements.map((stmt) => (
                  <MenuItem key={stmt} value={stmt}>
                    {stmt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status */}
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
                sx={{
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0d9488",
                  },
                }}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                startIcon={<CancelIcon />}
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
                variant="contained"
                disabled={saving}
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: "#0d9488",
                  "&:hover": {
                    bgcolor: "#14b8a6",
                  },
                  "&:disabled": {
                    bgcolor: "grey.400",
                  },
                }}
              >
                {initialData ? "Update" : "Save"}
              </Button>
            </Stack>
          </Stack>
        </form>
    </Box>
  );
}
