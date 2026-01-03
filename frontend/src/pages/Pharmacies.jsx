import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";

export default function Pharmacies() {
  const { fetchWithAuth } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    phone: "",
  });
  const [file, setFile] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch pharmacies from backend
  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`http://localhost:5000/api/v1/pharmacies/search`);
      if (!res.ok) throw new Error("Failed to fetch pharmacies");
      const data = await res.json();
      setPharmacies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
      setSnackbar({ open: true, message: "Failed to fetch pharmacies", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Create or update pharmacy
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const body = new FormData();
    Object.entries(formData).forEach(([key, value]) => body.append(key, value));
    if (file) body.append("legalDocument", file);

    try {
      let res;
      if (editingId) {
        res = await fetchWithAuth(`http://localhost:5000/api/v1/pharmacies/${editingId}`, {
          method: "PUT",
          body,
        });
      } else {
        res = await fetchWithAuth(`http://localhost:5000/api/v1/pharmacies`, {
          method: "POST",
          body,
        });
      }

      if (!res.ok) throw new Error("Failed to save pharmacy");

      setSnackbar({
        open: true,
        message: editingId ? "Pharmacy updated successfully" : "Pharmacy created successfully",
        severity: "success",
      });

      await fetchPharmacies();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving pharmacy:", err);
      setSnackbar({ open: true, message: "Failed to save pharmacy", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pharmacy?")) return;

    try {
      const res = await fetchWithAuth(`http://localhost:5000/api/v1/pharmacies/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPharmacies(pharmacies.filter((p) => p.id !== id));
        setSnackbar({ open: true, message: "Pharmacy deleted successfully", severity: "success" });
      } else {
        throw new Error("Failed to delete pharmacy");
      }
    } catch (err) {
      console.error("Error deleting pharmacy:", err);
      setSnackbar({ open: true, message: "Failed to delete pharmacy", severity: "error" });
    }
  };

  const handleEdit = (pharmacy) => {
    setFormData({
      name: pharmacy.name || "",
      country: pharmacy.country || "",
      city: pharmacy.city || "",
      district: pharmacy.district || "",
      sector: pharmacy.sector || "",
      cell: pharmacy.cell || "",
      village: pharmacy.village || "",
      phone: pharmacy.phone || "",
    });
    setEditingId(pharmacy.id);
    setFile(null);
    setOpenDialog(true);
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    setFormData({
      name: "",
      country: "",
      city: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      phone: "",
    });
    setFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      name: "",
      country: "",
      city: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      phone: "",
    });
    setFile(null);
  };

  // Filter logic
  const filteredPharmacies = pharmacies.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search) ||
      p.district?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = filterCity ? p.city === filterCity : true;
    return matchesSearch && matchesCity;
  });

  const paginatedPharmacies = filteredPharmacies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const uniqueCities = [...new Set(pharmacies.map((p) => p.city).filter(Boolean))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
          Pharmacies Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            bgcolor: '#0d9488',
            '&:hover': { bgcolor: '#14b8a6' },
          }}
        >
          Add Pharmacy
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <TextField
          placeholder="Search by name, city, phone, or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 300, flex: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by City</InputLabel>
          <Select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            label="Filter by City"
          >
            <MenuItem value="">All Cities</MenuItem>
            {uniqueCities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden shadow-md">
        {loading && pharmacies.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
            <Typography sx={{ ml: 2, color: "text.secondary" }}>
              Loading pharmacies...
            </Typography>
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Typography color="text.secondary">
              {search || filterCity ? "No pharmacies match your filters" : "No pharmacies found"}
            </Typography>
          </div>
        ) : (
          <>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {["Name", "Location", "Contact", "Legal Document", "Actions"].map((header) => (
                      <TableCell
                        key={header}
                        align={header === "Actions" ? "center" : "left"}
                        sx={{
                          bgcolor: "#0d9488",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          py: 1.5,
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPharmacies.map((pharmacy, index) => {
                    const actualIndex = page * rowsPerPage + index;
                    const isEven = actualIndex % 2 === 0;
                    return (
                      <TableRow
                        key={pharmacy.id}
                        hover
                        sx={{
                          bgcolor: isEven ? "#fafafa" : "#f5f5f5",
                          "&:hover": { bgcolor: "#e8f5e9" },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500, color: "grey.800", py: 2 }}>
                          <div className="flex items-center gap-2">
                            <BusinessIcon sx={{ color: "#0d9488", fontSize: 20 }} />
                            {pharmacy.name}
                          </div>
                        </TableCell>
                        <TableCell sx={{ color: "grey.800", py: 2 }}>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <LocationIcon sx={{ fontSize: 16, color: "#666" }} />
                              <span>{pharmacy.city || "—"}</span>
                            </div>
                            {pharmacy.district && (
                              <Typography variant="caption" color="text.secondary">
                                {pharmacy.district}
                              </Typography>
                            )}
                            {pharmacy.sector && (
                              <Typography variant="caption" color="text.secondary">
                                {pharmacy.sector}
                              </Typography>
                            )}
                          </div>
                        </TableCell>
                        <TableCell sx={{ color: "grey.800", py: 2 }}>
                          <div className="flex items-center gap-1">
                            <PhoneIcon sx={{ fontSize: 16, color: "#666" }} />
                            {pharmacy.phone || "—"}
                          </div>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {pharmacy.legalDocument ? (
                            <Tooltip title="View Document">
                              <IconButton
                                size="small"
                                href={pharmacy.legalDocument}
                                target="_blank"
                                rel="noreferrer"
                                sx={{ color: "#0d9488" }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <div className="flex justify-center items-center gap-1">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(pharmacy)}
                                sx={{ color: "#1976d2" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(pharmacy.id)}
                                sx={{ color: "#d32f2f" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {filteredPharmacies.length > rowsPerPage && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50">
                <Typography variant="body2" color="text.secondary">
                  Showing {page * rowsPerPage + 1} to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredPharmacies.length)} of{" "}
                  {filteredPharmacies.length} pharmacies
                </Typography>
                <div className="flex gap-2">
                  <Button
                    size="small"
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                  >
                    First
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(filteredPharmacies.length / rowsPerPage) - 1}
                  >
                    Next
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setPage(Math.ceil(filteredPharmacies.length / rowsPerPage) - 1)}
                    disabled={page >= Math.ceil(filteredPharmacies.length / rowsPerPage) - 1}
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#0d9488",
            color: "white",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {editingId ? "Edit Pharmacy" : "Add New Pharmacy"}
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                name="name"
                label="Pharmacy Name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                name="country"
                label="Country"
                value={formData.country}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="district"
                label="District"
                value={formData.district}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="sector"
                label="Sector"
                value={formData.sector}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="cell"
                label="Cell"
                value={formData.cell}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="village"
                label="Village"
                value={formData.village}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                fullWidth
                type="tel"
              />
              <div className="col-span-2">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                  id="legalDocument"
                  style={{ display: "none" }}
                />
                <label htmlFor="legalDocument">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{
                      borderColor: "#0d9488",
                      color: "#0d9488",
                      "&:hover": { borderColor: "#14b8a6", bgcolor: "#f0fdfa" },
                    }}
                  >
                    {file ? `Selected: ${file.name}` : "Upload Legal Document (PDF, JPG, PNG)"}
                  </Button>
                </label>
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "#0d9488",
                "&:hover": { bgcolor: "#14b8a6" },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {editingId ? "Updating..." : "Creating..."}
                </>
              ) : editingId ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
