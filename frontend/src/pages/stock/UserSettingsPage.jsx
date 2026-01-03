import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  TablePagination,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material";
import { useStockAuth } from "../../context/StockAuthContext.jsx";

const ALL_ROLES = [
  "ADMIN",
  "MANAGER",
  "STOREKEEPER",
  "PURCHASER",
  "SALES",
  "ACCOUNTANT",
  "PRODUCTIONMANAGER",
  "STAFF",
  "VISITO",
];

const ALL_DEPARTMENTS = [
  "Warehouse",
  "Finance",
  "Purchasing",
  "Sales",
  "Production",
  "Management",
  "Visitor",
  "Staff",
];

export default function UserSettingsPage() {
  const { logout } = useStockAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
  });
  const [editingEmail, setEditingEmail] = useState(null);
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem("registeredStockUsers")) || [];
    setUsers(savedUsers);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      let updatedUsers = [...users];
      if (editingEmail) {
        const idx = updatedUsers.findIndex((u) => u.email === editingEmail);
        updatedUsers[idx] = { ...updatedUsers[idx], ...form };
        setMessage("User updated successfully!");
      } else {
        if (updatedUsers.find((u) => u.email === form.email)) {
          throw new Error("Email already exists.");
        }
        updatedUsers.push(form);
        setMessage("User created successfully!");
      }
      setUsers(updatedUsers);
      localStorage.setItem("registeredStockUsers", JSON.stringify(updatedUsers));
      setForm({ name: "", email: "", password: "", role: "", department: "" });
      setEditingEmail(null);
      setFormOpen(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleEdit = (u) => {
    setForm(u);
    setEditingEmail(u.email);
    setFormOpen(true);
  };

  const handleDelete = (email) => {
    const updatedUsers = users.filter((u) => u.email !== email);
    setUsers(updatedUsers);
    localStorage.setItem("registeredStockUsers", JSON.stringify(updatedUsers));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = users.filter((u) => {
    return (
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const paginatedData = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'grey.800' }}>
          User Settings
        </Typography>
        <div className="flex items-center gap-4">
          <TextField
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setFormOpen(true);
              setEditingEmail(null);
              setForm({ name: "", email: "", password: "", role: "", department: "" });
            }}
            sx={{
              bgcolor: '#0d9488',
              '&:hover': {
                bgcolor: '#14b8a6',
              },
            }}
          >
            Create New User
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded">
        <div className="rounded-xl overflow-hidden shadow-md">
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: "#0d9488",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      py: 1.5,
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#0d9488",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      py: 1.5,
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#0d9488",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      py: 1.5,
                    }}
                  >
                    Password
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#0d9488",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      py: 1.5,
                    }}
                  >
                    Department
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#0d9488",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      py: 1.5,
                    }}
                  >
                    Role
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      bgcolor: "#0d9488",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      py: 1.5,
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((u, index) => {
                    const actualIndex = page * rowsPerPage + index;
                    const isEven = actualIndex % 2 === 0;
                    return (
                      <TableRow
                        key={u.email}
                        hover
                        sx={{
                          bgcolor: isEven ? "#fafafa" : "#f5f5f5",
                          "&:hover": {
                            bgcolor: "#e8f5e9",
                          },
                        }}
                      >
                        <TableCell sx={{ color: "grey.800", py: 1.5 }}>{u.name}</TableCell>
                        <TableCell sx={{ color: "grey.800", py: 1.5 }}>{u.email}</TableCell>
                        <TableCell sx={{ color: "grey.800", py: 1.5 }}>{u.password}</TableCell>
                        <TableCell sx={{ color: "grey.800", py: 1.5 }}>{u.department}</TableCell>
                        <TableCell sx={{ color: "grey.800", py: 1.5 }}>{u.role}</TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <div className="flex items-center justify-center gap-2">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(u)}
                                sx={{
                                  "&:hover": {
                                    bgcolor: "primary.light",
                                    color: "white",
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(u.email)}
                                sx={{
                                  "&:hover": {
                                    bgcolor: "error.light",
                                    color: "white",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              "& .MuiTablePagination-toolbar": {
                bgcolor: "grey.50",
              },
            }}
          />
        </div>
      </div>

      <Dialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingEmail(null);
          setForm({ name: "", email: "", password: "", role: "", department: "" });
        }}
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
          {editingEmail ? "Edit User" : "Create User"}
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: 'white' }}>
          {message && (
            <Alert severity={message.includes("success") ? "success" : "error"} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#0d9488" },
                    "&.Mui-focused fieldset": { borderColor: "#0d9488" },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#0d9488" },
                    "&.Mui-focused fieldset": { borderColor: "#0d9488" },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#0d9488" },
                    "&.Mui-focused fieldset": { borderColor: "#0d9488" },
                  },
                }}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  label="Department"
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
                  {ALL_DEPARTMENTS.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  label="Role"
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
                  {ALL_ROLES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingEmail(null);
                    setForm({ name: "", email: "", password: "", role: "", department: "" });
                  }}
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
                  sx={{
                    bgcolor: "#0d9488",
                    "&:hover": {
                      bgcolor: "#14b8a6",
                    },
                  }}
                >
                  {editingEmail ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
