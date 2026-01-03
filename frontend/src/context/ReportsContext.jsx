import React, { createContext, useContext, useState, useEffect } from "react";
import { journalService } from "../services/stock.service";

const ReportsContext = createContext();

export const ReportsProvider = ({ children }) => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [trialBalance, setTrialBalance] = useState([]);
  const [incomeStatement, setIncomeStatement] = useState([]);
  const [balanceSheet, setBalanceSheet] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);

  const [loadingLedger, setLoadingLedger] = useState(true);
  const [loadingTrial, setLoadingTrial] = useState(true);
  const [loadingIncome, setLoadingIncome] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingCashFlow, setLoadingCashFlow] = useState(true);

  // -------------------------------
  // Load journal entries on mount
  // -------------------------------
  useEffect(() => {
    const loadJournalEntries = async () => {
      try {
        const entries = await journalService.getAll();
        setJournalEntries(entries);
      } catch (err) {
        console.error("Error loading journal entries:", err);
      }
    };
    loadJournalEntries();
  }, []);

  // -------------------------------
  // Recalculate all reports whenever journalEntries changes
  // -------------------------------
  useEffect(() => {
    recalcReports();
  }, [journalEntries]);

  // -------------------------------
  // Helper: Calculate Ledger
  // -------------------------------
  const calcLedger = () => {
    const ledgerMap = {};
    journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        const key = line.accountId;
        if (!ledgerMap[key]) ledgerMap[key] = [];

        const prevBalance = ledgerMap[key].length
          ? ledgerMap[key][ledgerMap[key].length - 1].balance
          : 0;

        const debit = line.type === "debit" ? Number(line.amount) : 0;
        const credit = line.type === "credit" ? Number(line.amount) : 0;
        const balance = prevBalance + debit - credit;

        ledgerMap[key].push({
          id: `${entry.id}-${line.accountId}`,
          date: entry.date,
          accountId: line.accountId,
          accountName: line.accountName,
          description: entry.description,
          debit,
          credit,
          balance,
        });
      });
    });
    return Object.values(ledgerMap).flat();
  };

  // -------------------------------
  // Helper: Calculate Trial Balance
  // -------------------------------
  const calcTrialBalance = () => {
    const accounts = {};
    journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (!accounts[line.accountId]) {
          accounts[line.accountId] = {
            accountId: line.accountId,
            accountName: line.accountName,
            debit: 0,
            credit: 0,
          };
        }
        if (line.type === "debit") accounts[line.accountId].debit += Number(line.amount);
        else if (line.type === "credit") accounts[line.accountId].credit += Number(line.amount);
      });
    });
    return Object.values(accounts);
  };

  // -------------------------------
  // Helper: Income Statement
  // -------------------------------
  const calcIncomeStatement = () => {
    const statement = [];

    journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        const name = line.accountName?.toLowerCase() || "";
        let category = "";

        // Expanded keyword detection
        if (name.match(/revenue|sales|income|turnover/i)) category = "revenue";
        else if (name.match(/expense|cost|supplies|rent|utilities|salary|wage|insurance|maintenance|tax/i))
          category = "expense";

        if (category) {
          const existing = statement.find((i) => i.accountId === line.accountId);
          const amount = Number(line.amount);
          if (existing) existing.amount += amount;
          else
            statement.push({
              accountId: line.accountId,
              accountName: line.accountName,
              amount,
              type: category,
            });
        }
      });
    });

    return statement;
  };

  // -------------------------------
  // Helper: Balance Sheet
  // -------------------------------
  const calcBalanceSheet = () => {
    const sheet = [];

    journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        const name = line.accountName?.toLowerCase() || "";
        let category = "";

        // Expanded keyword detection
        if (name.match(/cash|asset|receivable|inventory|prepaid|bank/i)) category = "asset";
        else if (name.match(/liability|payable|loan|accrued|tax/i)) category = "liability";
        else if (name.match(/equity|capital|retained|drawing/i)) category = "equity";

        if (category) {
          const existing = sheet.find((i) => i.accountId === line.accountId);
          const amount = line.type === "debit" ? Number(line.amount) : -Number(line.amount);
          if (existing) existing.amount += amount;
          else
            sheet.push({
              accountId: line.accountId,
              accountName: line.accountName,
              amount,
              category,
            });
        }
      });
    });

    return sheet;
  };

  // -------------------------------
  // Helper: Cash Flow
  // -------------------------------
  const calcCashFlow = () => {
    const flow = [];

    journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        const name = line.accountName?.toLowerCase() || "";
        if (name.match(/cash|bank|checking|savings/i)) {
          const existing = flow.find((i) => i.activity === line.accountName);
          const amount = line.type === "debit" ? Number(line.amount) : -Number(line.amount);
          if (existing) existing.amount += amount;
          else
            flow.push({
              accountId: line.accountId,
              activity: line.accountName,
              amount,
            });
        }
      });
    });

    return flow;
  };

  // -------------------------------
  // Recalculate all reports
  // -------------------------------
  const recalcReports = () => {
    setLoadingLedger(true);
    setLoadingTrial(true);
    setLoadingIncome(true);
    setLoadingBalance(true);
    setLoadingCashFlow(true);

    setLedger(calcLedger());
    setTrialBalance(calcTrialBalance());
    setIncomeStatement(calcIncomeStatement());
    setBalanceSheet(calcBalanceSheet());
    setCashFlow(calcCashFlow());

    setLoadingLedger(false);
    setLoadingTrial(false);
    setLoadingIncome(false);
    setLoadingBalance(false);
    setLoadingCashFlow(false);
  };

  // -------------------------------
  // CRUD helpers for Journal
  // -------------------------------
  const addJournalEntry = async (data) => {
    const created = await journalService.create(data);
    setJournalEntries((prev) => [created, ...prev]);
    recalcReports(); // ✅ Force all reports to refresh immediately
    return created;
  };

  const removeJournalEntry = async (id) => {
    await journalService.remove(id);
    setJournalEntries((prev) => prev.filter((j) => j.id !== id));
    recalcReports(); // ✅ Update reports after deletion too
  };

  const refreshJournalEntries = async () => {
    try {
      const entries = await journalService.getAll();
      setJournalEntries(entries);
    } catch (err) {
      console.error("Error refreshing journal entries:", err);
    }
  };

  // -------------------------------
  // Public function: loadReports()
  // -------------------------------
  const loadReports = async () => {
    try {
      console.log("🔁 Refreshing all reports...");
      await refreshJournalEntries();
      recalcReports();
      console.log("✅ Reports recalculated successfully");
    } catch (error) {
      console.error("❌ Error loading reports:", error);
    }
  };

  return (
    <ReportsContext.Provider
      value={{
        journalEntries,
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
        loadReports, // ✅ preserved
        addJournalEntry,
        removeJournalEntry,
        refreshJournalEntries,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => useContext(ReportsContext);
