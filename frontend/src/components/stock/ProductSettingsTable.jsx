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
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

export default function ProductSettingsTable({
  data,
  loading,
  onEdit,
  onDelete,
  onAdd,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [previewItem, setPreviewItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.type?.toLowerCase().includes(search.toLowerCase()) ||
      item.locationGroup?.toLowerCase().includes(search.toLowerCase()) ||
      item.storeLocation?.toLowerCase().includes(search.toLowerCase()) ||
      item.productCategory?.toLowerCase().includes(search.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handlePreview = (item) => {
    setPreviewItem(item);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewItem(null);
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="rounded-xl overflow-hidden shadow-md flex-1 flex flex-col min-h-[600px]">
        <div className="p-6 flex justify-between items-center border-b border-gray-200">
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "grey.800",
            }}
          >
            Product & Store Settings
          </Typography>
          <div className="flex items-center gap-4">
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
                Add Setting
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center flex-1">
            <CircularProgress />
            <Typography sx={{ ml: 2, color: "text.secondary" }}>
              Loading...
            </Typography>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex justify-center items-center flex-1">
            <Typography color="text.secondary">
              No product settings found.
            </Typography>
          </div>
        ) : (
          <>
            <TableContainer sx={{ flex: 1, overflow: "auto", minHeight: '500px' }}>
              <Table stickyHeader size="medium">
                <TableHead>
                  <TableRow>
                    {["Name", "Type", "Store Category", "Status", "Actions"].map((header) => (
                      <TableCell
                        key={header}
                        align={header === "Status" || header === "Actions" ? "center" : "left"}
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
                  {paginatedData.map((item, index) => {
                    const actualIndex = page * rowsPerPage + index;
                    const isEven = actualIndex % 2 === 0;
                    return (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{
                          bgcolor: isEven ? "#fafafa" : "#f5f5f5",
                          "&:hover": {
                            bgcolor: "#e8f5e9",
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500, color: "grey.800", py: 1.5 }}>
                          {item.name}
                        </TableCell>
                        <TableCell sx={{ color: "grey.800", py: 1.5 }}>{item.type}</TableCell>
                        <TableCell sx={{ color: "grey.800", py: 1.5 }}>
                          {item.storeCategory}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Chip
                            label={item.status}
                            size="small"
                            color={
                              item.status === "Active"
                                ? "success"
                                : item.status === "Inactive"
                                ? "error"
                                : "default"
                            }
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <div className="flex justify-center items-center gap-1">
                            <Tooltip title="Preview">
                              <IconButton
                                size="small"
                                onClick={() => handlePreview(item)}
                                sx={{ color: '#0d9488' }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {onEdit && (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => onEdit(item)}
                                  sx={{ color: '#1976d2' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onDelete && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => onDelete(item.id)}
                                  sx={{ color: '#d32f2f' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
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
          </>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#0d9488',
            color: 'white',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Product & Store Setting Details
          <IconButton onClick={handleClosePreview} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {previewItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  {previewItem.name || '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Type
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewItem.type || '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Store
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewItem.mainOrSub || '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Store Location
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewItem.storeLocation || '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Location Group
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewItem.locationGroup || '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Store Category
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewItem.storeCategory || '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Product Category
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewItem.productCategory || '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Quality
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewItem.quality || '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Tax (%)
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewItem.tax ? `${previewItem.tax}%` : '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Opening Stock
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewItem.openingStock || '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Unit
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewItem.unit || '-'}
                </Typography>
              </div>

              <div>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Status
                </Typography>
                <div sx={{ mb: 2 }}>
                  <Chip
                    label={previewItem.status || '-'}
                    size="small"
                    color={
                      previewItem.status === "Active"
                        ? "success"
                        : previewItem.status === "Inactive"
                        ? "error"
                        : "default"
                    }
                    sx={{ fontWeight: 600 }}
                  />
                </div>
              </div>

              {previewItem.productDetails && (
                <div className="col-span-2">
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Product Details
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {previewItem.productDetails || '-'}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClosePreview}>Close</Button>
          {onEdit && previewItem && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                handleClosePreview();
                onEdit(previewItem);
              }}
              sx={{
                bgcolor: '#0d9488',
                '&:hover': { bgcolor: '#14b8a6' },
              }}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
