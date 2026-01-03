import React, { useState, useEffect } from "react";
import { useReports } from "../../context/ReportsContext";
import ReportsTable from "../../components/stock/ReportsTable";
import { Tabs, Tab, Typography } from "@mui/material";

export default function ReportsDashboard() {
  const { loadReports } = useReports();
  const [activeTab, setActiveTab] = useState("ledger");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: "ledger", label: "Ledger" },
    { key: "trialBalance", label: "Trial Balance" },
    { key: "incomeStatement", label: "Income Statement" },
    { key: "balanceSheet", label: "Balance Sheet" },
    { key: "cashFlow", label: "Cash Flow" },
  ];

  const fetchReport = async (type) => {
    setLoading(true);
    try {
      const data = await loadReports(type);
      setReportData(data);
    } catch (err) {
      console.error(`Error loading ${type} report:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Load report on tab change
  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Typography variant="h4" sx={{ fontWeight: 600, color: 'grey.800', mb: 4 }}>
        Financial Reports
      </Typography>

      {/* Tabs */}
      <div className="mb-4 bg-white rounded-t-xl shadow-sm border border-gray-200 border-b-0">
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 64,
              '&.Mui-selected': {
                color: '#0d9488',
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#0d9488',
              height: 3,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} value={tab.key} />
          ))}
        </Tabs>
      </div>

      {/* Active Report Table */}
      <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 overflow-hidden border-t-0">
        <ReportsTable
          reportType={activeTab}
          data={reportData}
          loading={loading}
        />
      </div>
    </div>
  );
}
