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
  CircularProgress,
  TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
} from "@mui/icons-material";
import { useReports } from "../../context/ReportsContext";

export default function ReportsTable({ reportType }) {
  const {
    ledger,
    trialBalance,
    incomeStatement,
    balanceSheet,
    cashFlow,
    loadingLedger,
    loadingTrial,
    loadingIncome,
    loadingBalance,
    loadingCashFlow,
  } = useReports();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  let data = [];
  let loading = false;
  let title = "";

  switch (reportType) {
    case "ledger":
      data = ledger;
      loading = loadingLedger;
      title = "Ledger";
      break;
    case "trialBalance":
      data = trialBalance;
      loading = loadingTrial;
      title = "Trial Balance";
      break;
    case "incomeStatement":
      data = incomeStatement;
      loading = loadingIncome;
      title = "Income Statement";
      break;
    case "balanceSheet":
      data = balanceSheet;
      loading = loadingBalance;
      title = "Balance Sheet";
      break;
    case "cashFlow":
      data = cashFlow;
      loading = loadingCashFlow;
      title = "Cash Flow Statement";
      break;
    default:
      data = [];
      loading = false;
      title = "Report";
  }

  const filteredData = data.filter((row) => {
    if (reportType === "ledger") {
      return (
        row.accountName?.toLowerCase().includes(search.toLowerCase()) ||
        row.description?.toLowerCase().includes(search.toLowerCase())
      );
    } else if (reportType === "trialBalance") {
      return row.accountName?.toLowerCase().includes(search.toLowerCase());
    } else if (reportType === "incomeStatement" || reportType === "balanceSheet") {
      return row.accountName?.toLowerCase().includes(search.toLowerCase());
    } else if (reportType === "cashFlow") {
      return row.activity?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return "-";
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

  const getHeaders = () => {
    if (reportType === "ledger") {
      return ["Date", "Description", "Account", "Debit", "Credit", "Balance"];
    } else if (reportType === "trialBalance") {
      return ["Account", "Debit", "Credit"];
    } else if (reportType === "incomeStatement" || reportType === "balanceSheet") {
      return ["Account", "Amount", "Type"];
    } else if (reportType === "cashFlow") {
      return ["Activity", "Amount"];
    }
    return [];
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" sx={{ fontWeight: 600, color: "grey.800" }}>
          {title}
        </Typography>
        <TextField
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <CircularProgress />
          <Typography sx={{ ml: 2, color: "text.secondary" }}>
            Loading {title}...
          </Typography>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Typography color="text.secondary">No records found</Typography>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden shadow-md flex-1 flex flex-col min-h-[600px]">
          <TableContainer sx={{ flex: 1, overflow: "auto", minHeight: '500px' }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  {getHeaders().map((header) => (
                    <TableCell
                      key={header}
                      align={
                        header === "Debit" ||
                        header === "Credit" ||
                        header === "Balance" ||
                        header === "Amount"
                          ? "right"
                          : "left"
                      }
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
                {paginatedData.map((row, index) => {
                  const actualIndex = page * rowsPerPage + index;
                  const isEven = actualIndex % 2 === 0;
                  return (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        bgcolor: isEven ? "#fafafa" : "#f5f5f5",
                        "&:hover": {
                          bgcolor: "#e8f5e9",
                        },
                      }}
                    >
                      {reportType === "ledger" && (
                        <>
                          <TableCell sx={{ color: "grey.800", py: 1.5 }}>
                            {row.date ? new Date(row.date).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell sx={{ color: "grey.800", py: 1.5 }}>
                            {row.description || "-"}
                          </TableCell>
                          <TableCell sx={{ color: "grey.800", py: 1.5 }}>
                            {row.accountName || row.accountId}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                            {row.debit ? formatAmount(row.debit) : "-"}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                            {row.credit ? formatAmount(row.credit) : "-"}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                            {formatAmount(row.balance)}
                          </TableCell>
                        </>
                      )}

                      {reportType === "trialBalance" && (
                        <>
                          <TableCell sx={{ color: "grey.800", py: 1.5 }}>
                            {row.accountName || row.accountId}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                            {formatAmount(row.debit)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                            {formatAmount(row.credit)}
                          </TableCell>
                        </>
                      )}

                      {(reportType === "incomeStatement" ||
                        reportType === "balanceSheet") && (
                        <>
                          <TableCell sx={{ color: "grey.800", py: 1.5 }}>
                            {row.accountName || row.accountId}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                            {formatAmount(row.amount)}
                          </TableCell>
                          <TableCell sx={{ color: "grey.800", py: 1.5 }}>
                            {row.type || row.category || "-"}
                          </TableCell>
                        </>
                      )}

                      {reportType === "cashFlow" && (
                        <>
                          <TableCell sx={{ color: "grey.800", py: 1.5 }}>
                            {row.activity}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "grey.800", py: 1.5 }}>
                            {formatAmount(row.amount)}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
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
      )}
    </div>
  );
}
