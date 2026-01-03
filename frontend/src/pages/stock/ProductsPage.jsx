import React, { useState } from 'react';
import { Typography, TextField, MenuItem, Button, Stack, Divider } from '@mui/material';
import { useStock } from '../../context/stockContext';
import StockTable from '../../components/stock/StockTable';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function StockReports() {
  const { generateReport } = useStock();

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('');
  const [total, setTotal] = useState(0);

  const handleGenerate = () => {
    console.log('--- handleGenerate called ---');
    console.log('ReportType:', reportType, 'StartDate:', startDate, 'EndDate:', endDate);

    if (!reportType) {
      console.log('No report type selected');
      return alert('Select report type');
    }

    const result = generateReport(
      reportType.toLowerCase(),
      startDate,
      endDate
    );

    console.log('Result from generateReport:', result);

    if (!result.length) {
      console.log('No data found for this report');
      alert('No data found');
      return;
    }

    setData(result);

    const computedTotal = result.reduce((s, i) => {
      const price = Number(i.totalPrice || 0);
      console.log('Adding totalPrice:', price, 'Current sum:', s);
      return s + price;
    }, 0);

    console.log('Computed total:', computedTotal);
    setTotal(computedTotal);

    // Summary
    const summaryMap = {};
    result.forEach((i) => {
      console.log('Processing item for summary:', i);
      summaryMap[i.productName] =
        (summaryMap[i.productName] || 0) + Number(i.quantity || 0);
    });

    const summaryArray = Object.entries(summaryMap).map(([name, qty]) => ({
      productName: name,
      quantity: qty,
    }));

    console.log('Summary array:', summaryArray);
    setSummary(summaryArray);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={700}>
          Stock Reports
        </Typography>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="grid grid-cols-4 gap-4">
            <TextField
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="Opening Qty">Opening Qty</MenuItem>
              <MenuItem value="Purchase">Purchase</MenuItem>
              <MenuItem value="Sale">Sale</MenuItem>
              <MenuItem value="Closing Qty">Closing Qty</MenuItem>
            </TextField>
            <Button variant="contained" onClick={handleGenerate}>
              Generate
            </Button>
          </div>
        </div>

        {/* Report Table */}
        {data.length > 0 && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <StockTable
              title={`${reportType} Report`}
              data={data}
              fields={[
                { name: 'productName', label: 'Product' },
                { name: 'unit', label: 'Unit' },
                { name: 'quantity', label: 'Qty' },
                { name: 'unitPrice', label: 'Price', type: 'currency' },
                { name: 'totalPrice', label: 'Total', type: 'currency' },
              ]}
            />
            <Divider />
            <div className="p-4 text-right font-bold">
              TOTAL: {total.toFixed(2)}
            </div>
          </div>
        )}

        {/* Summary */}
        {summary.length > 0 && (
          <div className="bg-white rounded-xl border">
            <StockTable
              title="Summary"
              data={summary}
              fields={[
                { name: 'productName', label: 'Product' },
                { name: 'quantity', label: 'Total Qty' },
              ]}
            />
          </div>
        )}
      </Stack>
    </div>
  );
}
