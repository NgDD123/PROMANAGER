import React, { useState, useRef, useMemo } from 'react';
import { useProduction } from '../../context/ProductionContext';
import { useStock } from '../../context/stockContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  GetApp as ExportIcon,
  Print as PrintIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const formatDate = (value) => {
  if (!value) return '-';
  if (value?.toDate) return value.toDate().toLocaleString();
  if (value?._seconds) return new Date(value._seconds * 1000).toLocaleString();
  return new Date(value).toLocaleString();
};

export default function ProductionReportsPage() {
  const {
    wipCycles = [],
    finishedGoods = [],
    damagedProducts = [],
  } = useProduction();
  const { products = [], getProductStock } = useStock();

  const [reportType, setReportType] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totals, setTotals] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const tableRef = useRef();

  const filterByDate = (data = []) => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return data.filter((d) => {
      const raw = d.dateProduced || d.datePlanned || d.createdAt;
      if (!raw) return false;

      let dateObj;
      if (raw.toDate) dateObj = raw.toDate();
      else if (raw._seconds) dateObj = new Date(raw._seconds * 1000);
      else dateObj = new Date(raw);

      if (isNaN(dateObj.getTime())) return false;
      if (start && dateObj < start) return false;
      if (end && dateObj > end) return false;

      return true;
    });
  };

  const handleGenerateReport = () => {
    let data = [];
    switch (reportType) {
      case 'WIP':
        data = filterByDate(wipCycles);
        break;
      case 'Finished Goods':
        data = filterByDate(finishedGoods);
        break;
      case 'Damaged':
        data = filterByDate(damagedProducts);
        break;
      case 'Material Consumption':
        data = filterByDate(finishedGoods).map((fg) => ({
          ...fg,
          rawMaterials: (fg.rawMaterials || []).map((rm) => ({
            ...rm,
            remaining: getProductStock(rm.productId),
            productName:
              products.find((p) => p.id === rm.productId)?.name || rm.productId,
          })),
        }));
        break;
      default:
        data = [];
    }

    setFilteredData(data);
    setTotals(data.reduce((sum, item) => sum + (item.quantityCompleted || 0), 0));
    setPage(0); // Reset to first page

    if (data.length === 0) {
      setSnackbar({
        open: true,
        message: 'No data found for the selected criteria',
        severity: 'info',
      });
    }
  };

  const exportExcel = () => {
    if (!filteredData.length) {
      setSnackbar({ open: true, message: 'No data to export', severity: 'warning' });
      return;
    }

    try {
      const excelData = filteredData.map((row) => {
        const rmStr = (row.rawMaterials || [])
          .map((rm) => {
            const name = rm.productName || rm.productId;
            return `${name} | Qty: ${rm.quantity} | Cost: ${
              rm.costPerUnit
            } | Total: ${rm.totalCost} | Remaining: ${rm.remaining ?? 0}`;
          })
          .join('; ');
        return {
          ...row,
          rawMaterials: rmStr,
          createdAt: formatDate(row.createdAt),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Production Report');
      XLSX.writeFile(workbook, `${reportType}_Report_${Date.now()}.xlsx`);
      setSnackbar({ open: true, message: 'Excel file exported successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export Excel file', severity: 'error' });
    }
  };

  const exportPDF = () => {
    if (!filteredData.length) {
      setSnackbar({ open: true, message: 'No data to export', severity: 'warning' });
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(14);
      doc.text(`${reportType} Report`, 14, 16);

      const tableRows = [];
      filteredData.forEach((row) => {
        tableRows.push([
          row.planId || '-',
          row.productName || '-',
          row.quantityPlanned || 0,
          row.quantityCompleted || 0,
          row.status || '-',
          row.laborCost || 0,
          row.overheadCost || 0,
          row.materialCost || 0,
          row.totalCost || 0,
          formatDate(row.createdAt),
        ]);

        (row.rawMaterials || []).forEach((rm) => {
          const name = rm.productName || rm.productId;
          tableRows.push([
            '',
            `↳ ${name}`,
            `Qty: ${rm.quantity}`,
            '',
            '',
            `Cost/unit: ${rm.costPerUnit}`,
            `Total: ${rm.totalCost}`,
            `Remaining: ${rm.remaining ?? 0}`,
            '',
            '',
          ]);
        });
      });

      doc.autoTable({
        head: [
          [
            'Plan ID',
            'Product Name',
            'Qty Planned',
            'Qty Completed',
            'Status',
            'Labor Cost',
            'Overhead Cost',
            'Material Cost',
            'Total Cost',
            'Created At',
          ],
        ],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 8 },
        bodyStyles: { valign: 'top' },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });

      doc.save(`${reportType}_Report_${Date.now()}.pdf`);
      setSnackbar({ open: true, message: 'PDF file exported successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export PDF file', severity: 'error' });
    }
  };

  const printReport = () => {
    if (!filteredData.length) {
      setSnackbar({ open: true, message: 'No data to print', severity: 'warning' });
      return;
    }
    window.print();
  };

  // Get table columns based on filtered data
  const columns = useMemo(() => {
    if (!filteredData.length) return [];
    const keys = Object.keys(filteredData[0]).filter((k) => k !== 'id' && k !== 'rawMaterials');
    return ['planId', 'productName', 'quantityPlanned', 'quantityCompleted', 'status', 'laborCost', 'overheadCost', 'materialCost', 'totalCost', 'createdAt'].filter(
      (key) => filteredData.some((row) => row.hasOwnProperty(key))
    );
  }, [filteredData]);

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatColumnName = (col) => {
    return col
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className='p-6 flex flex-col gap-6'>
      <div className='rounded-xl overflow-hidden shadow-md'>
        {/* Header */}
        <div className='p-6 flex justify-between items-center border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <AssessmentIcon sx={{ fontSize: 32, color: '#0d9488' }} />
            <div>
              <Typography variant='h5' sx={{ fontWeight: 600, color: 'grey.800' }}>
                Production Reports
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
                Generate and export production reports
              </Typography>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='p-6 flex flex-wrap gap-4 items-end border-b border-gray-200'>
          <TextField
            type='date'
            label='Start Date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size='small'
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180 }}
          />
          <TextField
            type='date'
            label='End Date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size='small'
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180 }}
          />
          <FormControl size='small' sx={{ width: 220 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label='Report Type'
            >
              <MenuItem value=''>
                <em>Select Report</em>
              </MenuItem>
              <MenuItem value='WIP'>Work In Progress</MenuItem>
              <MenuItem value='Finished Goods'>Finished Goods</MenuItem>
              <MenuItem value='Damaged'>Damaged Products</MenuItem>
              <MenuItem value='Material Consumption'>Material Consumption</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant='contained'
            onClick={handleGenerateReport}
            disabled={!reportType}
            sx={{
              bgcolor: '#0d9488',
              '&:hover': { bgcolor: '#14b8a6' },
              '&:disabled': { bgcolor: 'grey.300' },
            }}
          >
            Generate Report
          </Button>
        </div>

        {/* Export Buttons */}
        {filteredData.length > 0 && (
          <div className='p-6 flex gap-3 border-b border-gray-200'>
            <Button
              variant='outlined'
              startIcon={<ExportIcon />}
              onClick={exportExcel}
              sx={{ borderColor: '#0d9488', color: '#0d9488' }}
            >
              Export Excel
            </Button>
            <Button
              variant='outlined'
              startIcon={<ExportIcon />}
              onClick={exportPDF}
              sx={{ borderColor: '#0d9488', color: '#0d9488' }}
            >
              Export PDF
            </Button>
            <Button
              variant='outlined'
              startIcon={<PrintIcon />}
              onClick={printReport}
              sx={{ borderColor: '#0d9488', color: '#0d9488' }}
            >
              Print Report
            </Button>
            <div className='ml-auto flex items-center gap-2'>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                Total Quantity:
              </Typography>
              <Chip label={totals.toLocaleString()} color='primary' size='small' />
            </div>
          </div>
        )}

        {/* Table */}
        <div className='p-6'>
          {filteredData.length === 0 ? (
            <Typography color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
              {reportType
                ? 'No records found for the selected criteria. Please adjust your filters and try again.'
                : 'Select a report type and click "Generate Report" to view data.'}
            </Typography>
          ) : (
            <div className='rounded-xl overflow-hidden shadow-md flex-1 flex flex-col min-h-[400px]'>
              <div ref={tableRef}>
                <TableContainer sx={{ flex: 1, overflow: 'auto', minHeight: '400px' }}>
                  <Table size='medium' stickyHeader>
                    <TableHead>
                      <TableRow>
                        {columns.map((col) => (
                          <TableCell
                            key={col}
                            sx={{
                              bgcolor: '#0d9488',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              py: 1.5,
                              minWidth: 120,
                            }}
                          >
                            {formatColumnName(col)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.map((row, rowIndex) => {
                        const actualIndex = page * rowsPerPage + rowIndex;
                        const isEven = actualIndex % 2 === 0;
                        return (
                          <TableRow
                            key={row.planId || row.id || rowIndex}
                            hover
                            sx={{
                              bgcolor: isEven ? '#fafafa' : '#f5f5f5',
                              '&:hover': { bgcolor: '#e8f5e9' },
                            }}
                          >
                            {columns.map((col) => (
                              <TableCell
                                key={col}
                                sx={{ color: 'grey.800', py: 1.5 }}
                              >
                                {col === 'status' ? (
                                  <Chip
                                    label={row[col] || '-'}
                                    size='small'
                                    color={
                                      row[col] === 'completed'
                                        ? 'success'
                                        : row[col] === 'in_progress'
                                        ? 'info'
                                        : 'default'
                                    }
                                  />
                                ) : col === 'createdAt' ? (
                                  formatDate(row[col])
                                ) : (
                                  row[col]?.toString() || '-'
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              <TablePagination
                component='div'
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTablePagination-toolbar': { bgcolor: 'grey.50' },
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
