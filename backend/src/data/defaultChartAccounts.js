// src/data/defaultChartAccounts.js

const defaultChartAccounts = [
  // =================== ASSETS ===================
  // Current Assets
  { code: 1000, name: "Cash on Hand / Petty Cash", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1001, name: "Cash in Bank – Main Account", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1002, name: "Cash in Bank – Secondary Account", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1003, name: "Cash in Transit", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1010, name: "Accounts Receivable – Trade", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1011, name: "Accounts Receivable – Other", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1012, name: "Allowance for Doubtful Accounts (Contra)", category: "Assets", subCategory: "Contra Assets", statement: "Balance Sheet" },
  { code: 1020, name: "Inventory – Finished Goods", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1021, name: "Inventory – Work in Progress", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1022, name: "Inventory – Raw Materials / Components", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1023, name: "Inventory – Returned Goods", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1030, name: "Prepaid Expenses", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1040, name: "Deposits (Utility / Lease)", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1050, name: "Short-term Investments", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },
  { code: 1060, name: "Other Current Assets", category: "Assets", subCategory: "Current Assets", statement: "Balance Sheet" },

  // Non-Current / Fixed Assets
  { code: 1500, name: "Land", category: "Assets", subCategory: "Non-Current Assets", statement: "Balance Sheet" },
  { code: 1510, name: "Buildings", category: "Assets", subCategory: "Non-Current Assets", statement: "Balance Sheet" },
  { code: 1520, name: "Leasehold Improvements", category: "Assets", subCategory: "Non-Current Assets", statement: "Balance Sheet" },
  { code: 1530, name: "Machinery & Equipment", category: "Assets", subCategory: "Non-Current Assets", statement: "Balance Sheet" },
  { code: 1540, name: "Furniture & Fixtures", category: "Assets", subCategory: "Non-Current Assets", statement: "Balance Sheet" },
  { code: 1550, name: "Vehicles", category: "Assets", subCategory: "Non-Current Assets", statement: "Balance Sheet" },
  { code: 1560, name: "Computers & IT Equipment", category: "Assets", subCategory: "Non-Current Assets", statement: "Balance Sheet" },
  { code: 1570, name: "Office Equipment", category: "Assets", subCategory: "Non-Current Assets", statement: "Balance Sheet" },
  { code: 1590, name: "Construction in Progress", category: "Assets", subCategory: "Non-Current Assets", statement: "Balance Sheet" },
  { code: 1600, name: "Accumulated Depreciation (Contra)", category: "Assets", subCategory: "Contra Assets", statement: "Balance Sheet" },

  // Intangible Assets
  { code: 1650, name: "Goodwill", category: "Assets", subCategory: "Intangible Assets", statement: "Balance Sheet" },
  { code: 1651, name: "Patents & Trademarks", category: "Assets", subCategory: "Intangible Assets", statement: "Balance Sheet" },
  { code: 1652, name: "Software Licenses", category: "Assets", subCategory: "Intangible Assets", statement: "Balance Sheet" },
  { code: 1653, name: "Copyrights", category: "Assets", subCategory: "Intangible Assets", statement: "Balance Sheet" },
  { code: 1654, name: "Accumulated Amortization (Contra)", category: "Assets", subCategory: "Contra Assets", statement: "Balance Sheet" },

  // Other Assets
  { code: 1900, name: "Deferred Tax Assets", category: "Assets", subCategory: "Other Assets", statement: "Balance Sheet" },
  { code: 1910, name: "Long-term Investments", category: "Assets", subCategory: "Other Assets", statement: "Balance Sheet" },
  { code: 1920, name: "Other Non-Current Assets", category: "Assets", subCategory: "Other Assets", statement: "Balance Sheet" },

  // =================== LIABILITIES ===================
  // Current Liabilities
  { code: 2000, name: "Accounts Payable – Trade", category: "Liabilities", subCategory: "Current Liabilities", statement: "Balance Sheet" },
  { code: 2001, name: "Accrued Expenses", category: "Liabilities", subCategory: "Current Liabilities", statement: "Balance Sheet" },
  { code: 2002, name: "Taxes Payable", category: "Liabilities", subCategory: "Current Liabilities", statement: "Balance Sheet" },
  { code: 2003, name: "VAT Payable", category: "Liabilities", subCategory: "Current Liabilities", statement: "Balance Sheet" },
  { code: 2004, name: "Employee Withholding / PAYE Payable", category: "Liabilities", subCategory: "Current Liabilities", statement: "Balance Sheet" },
  { code: 2005, name: "Unearned Revenue / Deferred Income", category: "Liabilities", subCategory: "Current Liabilities", statement: "Balance Sheet" },
  { code: 2006, name: "Customer Advances", category: "Liabilities", subCategory: "Current Liabilities", statement: "Balance Sheet" },
  { code: 2010, name: "Dividends Payable", category: "Liabilities", subCategory: "Current Liabilities", statement: "Balance Sheet" },

  // Long-Term Liabilities
  { code: 2500, name: "Bank Loan Payable (Long Term)", category: "Liabilities", subCategory: "Long-Term Liabilities", statement: "Balance Sheet" },
  { code: 2501, name: "Mortgage Payable", category: "Liabilities", subCategory: "Long-Term Liabilities", statement: "Balance Sheet" },
  { code: 2502, name: "Lease Liability (Long Term)", category: "Liabilities", subCategory: "Long-Term Liabilities", statement: "Balance Sheet" },
  { code: 2503, name: "Bonds Payable", category: "Liabilities", subCategory: "Long-Term Liabilities", statement: "Balance Sheet" },
  { code: 2504, name: "Deferred Tax Liabilities", category: "Liabilities", subCategory: "Long-Term Liabilities", statement: "Balance Sheet" },

  // =================== EQUITY ===================
  { code: 3000, name: "Share Capital / Owner’s Equity", category: "Equity", subCategory: "Capital", statement: "Balance Sheet" },
  { code: 3001, name: "Additional Paid-in Capital", category: "Equity", subCategory: "Capital", statement: "Balance Sheet" },
  { code: 3002, name: "Retained Earnings", category: "Equity", subCategory: "Capital", statement: "Balance Sheet" },
  { code: 3003, name: "Revaluation Surplus", category: "Equity", subCategory: "Capital", statement: "Balance Sheet" },
  { code: 3004, name: "Other Comprehensive Income", category: "Equity", subCategory: "Capital", statement: "Balance Sheet" },
  { code: 3005, name: "Drawings / Owner Withdrawals", category: "Equity", subCategory: "Contra Equity", statement: "Balance Sheet" },

  // =================== REVENUE ===================
  { code: 4000, name: "Product Sales", category: "Revenue", subCategory: "Operating Revenue", statement: "Income Statement" },
  { code: 4001, name: "Service Income", category: "Revenue", subCategory: "Operating Revenue", statement: "Income Statement" },
  { code: 4002, name: "Rental Income", category: "Revenue", subCategory: "Other Revenue", statement: "Income Statement" },
  { code: 4003, name: "Interest Income", category: "Revenue", subCategory: "Other Revenue", statement: "Income Statement" },
  { code: 4004, name: "Commission Income", category: "Revenue", subCategory: "Other Revenue", statement: "Income Statement" },
  { code: 4005, name: "Foreign Exchange Gain", category: "Revenue", subCategory: "Other Revenue", statement: "Income Statement" },
  { code: 4006, name: "Gain on Sale of Assets", category: "Revenue", subCategory: "Other Revenue", statement: "Income Statement" },

  // =================== EXPENSES ===================
  { code: 5000, name: "Cost of Goods Sold", category: "Expenses", subCategory: "COGS", statement: "Income Statement" },
  { code: 6000, name: "Salaries & Wages", category: "Expenses", subCategory: "Operating Expense", statement: "Income Statement" },
  { code: 6001, name: "Rent Expense", category: "Expenses", subCategory: "Operating Expense", statement: "Income Statement" },
  { code: 6002, name: "Utilities Expense", category: "Expenses", subCategory: "Operating Expense", statement: "Income Statement" },
  { code: 6003, name: "Insurance Expense", category: "Expenses", subCategory: "Operating Expense", statement: "Income Statement" },
  { code: 6004, name: "Marketing Expense", category: "Expenses", subCategory: "Operating Expense", statement: "Income Statement" },
  { code: 6005, name: "Repair & Maintenance", category: "Expenses", subCategory: "Operating Expense", statement: "Income Statement" },
  { code: 6006, name: "Depreciation Expense", category: "Expenses", subCategory: "Operating Expense", statement: "Income Statement" },
  { code: 7000, name: "Interest Expense", category: "Expenses", subCategory: "Financial Expense", statement: "Income Statement" },
  { code: 7001, name: "Loss on Sale of Assets", category: "Expenses", subCategory: "Financial Expense", statement: "Income Statement" },
  { code: 7002, name: "Bad Debt Expense", category: "Expenses", subCategory: "Financial Expense", statement: "Income Statement" },
  { code: 7003, name: "Foreign Exchange Loss", category: "Expenses", subCategory: "Financial Expense", statement: "Income Statement" },
  { code: 7004, name: "Miscellaneous Expense", category: "Expenses", subCategory: "Other Expense", statement: "Income Statement" },
];

export default defaultChartAccounts;
