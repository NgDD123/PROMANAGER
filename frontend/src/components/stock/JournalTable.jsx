import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  TablePagination,
  Button,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material";

export default function JournalTable({ data, onDelete, onAdd }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredData = data.filter(
    (entry) =>
      entry.description?.toLowerCase().includes(search.toLowerCase()) ||
      entry.lines?.some((line) =>
        line.accountName?.toLowerCase().includes(search.toLowerCase())
      )
  );

  const formatAmount = (amount) => {
    if (!amount) return "-";
    return Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" sx={{ fontWeight: 600, color: "grey.800" }}>
          General Journal
        </Typography>
        <div className="flex items-center gap-4">
          <TextField
            placeholder="Search by description or account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
          {onAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAdd}
              sx={{
                bgcolor: '#0d9488',
                '&:hover': {
                  bgcolor: '#14b8a6',
                },
              }}
            >
              Add Entry
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden shadow-md flex-1 flex flex-col min-h-[600px]">
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
                  Date
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
                  Description
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
                  Account
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
                  Debit
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
                  Credit
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
                    <Typography color="text.secondary">
                      No journal entries found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((entry, entryIndex) => {
                  const actualIndex = page * rowsPerPage + entryIndex;
                  return (
                    entry.lines?.map((line, i) => {
                      const isEven = actualIndex % 2 === 0;
                      return (
                        <TableRow
                          key={`${entry.id}-${i}`}
                          hover
                          sx={{
                            bgcolor: isEven ? "#fafafa" : "#f5f5f5",
                            "&:hover": {
                              bgcolor: "#e8f5e9",
                            },
                          }}
                        >
                          {i === 0 && (
                            <>
                              <TableCell
                                rowSpan={entry.lines.length}
                                sx={{
                                  verticalAlign: "top",
                                  color: "grey.800",
                                  py: 1.5,
                                }}
                              >
                                {entry.date
                                  ? new Date(entry.date).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                              <TableCell
                                rowSpan={entry.lines.length}
                                sx={{
                                  verticalAlign: "top",
                                  color: "grey.800",
                                  py: 1.5,
                                }}
                              >
                                {entry.description || "-"}
                              </TableCell>
                            </>
                          )}

                          <TableCell sx={{ color: "grey.800", py: 1.5 }}>
                            {line.accountName || line.accountId || "-"}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                            {line.type === "debit" ? formatAmount(line.amount) : "-"}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                            {line.type === "credit" ? formatAmount(line.amount) : "-"}
                          </TableCell>

                          {i === 0 && (
                            <TableCell
                              rowSpan={entry.lines.length}
                              align="center"
                              sx={{
                                verticalAlign: "top",
                                color: "grey.800",
                                py: 1.5,
                              }}
                            >
                              {onDelete && (
                                <Tooltip title="Delete Entry">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(entry.id)}
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
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredData.length}
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
  );
}
