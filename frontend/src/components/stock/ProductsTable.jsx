import React, { useMemo, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
  TablePagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { formatCurrency } from "../../utils/format";

export default function ProductsTable({
  title,
  data,
  fields,
  loading,
  onEdit,
  deleteItem,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2, color: "text.secondary" }}>
          Loading {title}...
        </Typography>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <Typography color="text.secondary">No {title} available.</Typography>
      </div>
    );
  }

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";
    return date.toISOString().slice(0, 10);
  };

  const summary = useMemo(() => {
    const grouped = {};

    data.forEach((item) => {
      const name = item.name || item.productName || "Unnamed Product";
      const quantity = Number(item.quantity || 0);
      const price = Number(item.unitPrice || item.price || item.value || 0);

      if (!grouped[name]) {
        grouped[name] = { quantity: 0, value: 0, currency: item.currency || "RWF" };
      }

      grouped[name].quantity += quantity;
      grouped[name].value += quantity * price;
    });

    const totalValue = Object.values(grouped).reduce((sum, p) => sum + p.value, 0);

    return { grouped, totalValue };
  }, [data]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Main Table */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "grey.800",
            mb: 3,
          }}
        >
          {title || "Stock Inventory"}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: '600px',
          }}
        >
          <TableContainer sx={{ flex: 1, overflow: "auto", minHeight: '500px' }}>
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
                    #
                  </TableCell>
                  {fields.map((field) => (
                    <TableCell
                      key={field.name}
                      sx={{
                        bgcolor: "#0d9488",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        py: 1.5,
                      }}
                    >
                      {field.label}
                    </TableCell>
                  ))}
                  {(onEdit || deleteItem) && (
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
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedData.map((item, index) => {
                  const actualIndex = page * rowsPerPage + index;
                  const isEven = actualIndex % 2 === 0;
                  
                  return (
                    <TableRow
                      key={item.id || item._id || index}
                      hover
                      sx={{
                        bgcolor: isEven ? "#fafafa" : "#f5f5f5",
                        "&:hover": {
                          bgcolor: "#e8f5e9",
                        },
                        "&:last-child td": { border: 0 },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "grey.800",
                          py: 1.5,
                        }}
                      >
                        {actualIndex + 1}
                      </TableCell>

                      {fields.map((field) => {
                        let value = item[field.name];

                        if (field.type === "currency") {
                          value = formatCurrency(
                            Number(value || 0),
                            item.currency || "RWF"
                          );
                        }

                        if (
                          field.type === "date" ||
                          field.name.toLowerCase().includes("date")
                        ) {
                          value = formatDate(value);
                        }

                        if (typeof value === "string" && value.length > 40) {
                          value = value.slice(0, 40) + "...";
                        }

                        return (
                          <TableCell
                            key={field.name}
                            sx={{
                              color: "grey.800",
                              py: 1.5,
                              maxWidth: 220,
                            }}
                            title={
                              typeof item[field.name] === "string"
                                ? item[field.name]
                                : ""
                            }
                          >
                            {value || "-"}
                          </TableCell>
                        );
                      })}

                      {(onEdit || deleteItem) && (
                        <TableCell
                          align="center"
                          sx={{
                            color: "grey.800",
                            py: 1.5,
                          }}
                        >
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {onEdit && (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onEdit(item)}
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
                            )}
                            {deleteItem && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this item?"
                                      )
                                    ) {
                                      deleteItem(item.id || item._id);
                                    }
                                  }}
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
                            )}
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data.length}
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
        </Paper>
      </div>

      {/* Summary Table */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "grey.800",
            mb: 3,
          }}
        >
          Stock Summary
        </Typography>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: '400px',
          }}
        >
          <TableContainer sx={{ flex: 1, overflow: "auto", minHeight: '300px' }}>
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
                    Product
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      bgcolor: "#0d9488",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      py: 1.5,
                    }}
                  >
                    Total Quantity
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      bgcolor: "#0d9488",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      py: 1.5,
                    }}
                  >
                    Total Value
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(summary.grouped).map(([name, info], index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <TableRow
                      key={name}
                      hover
                      sx={{
                        bgcolor: isEven ? "#fafafa" : "#f5f5f5",
                        "&:hover": {
                          bgcolor: "#e8f5e9",
                        },
                      }}
                    >
                      <TableCell sx={{ color: "grey.800", py: 1.5 }}>{name}</TableCell>
                      <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                        {info.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                        {formatCurrency(info.value, info.currency)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow
                  sx={{
                    bgcolor: "#e3f2fd",
                    "& td": {
                      fontWeight: 600,
                      color: "grey.800",
                      py: 1.5,
                    },
                  }}
                >
                  <TableCell>Total Stock Value</TableCell>
                  <TableCell align="right">—</TableCell>
                  <TableCell align="right" sx={{ color: "success.main" }}>
                    {formatCurrency(summary.totalValue, "RWF")}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    </div>
  );
}
