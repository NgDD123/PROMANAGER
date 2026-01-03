// ================================
// ✅ Expense Context (Fixed + Normalized + Journal Compatible)
// ================================
import React, { createContext, useContext, useState, useEffect } from "react";
import { expenseService, journalService } from "../services/stock.service";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("🖥️ ExpenseProvider mounted");

  // 🔹 Normalize each expense record for table display
  const normalizeExpense = (exp) => ({
    id: exp.id,
    expenseAccountId: exp.expenseAccountId || exp.expenseAccount || "",
    expenseAccountName:
      exp.expenseAccountName ||
      exp.expenseAccount?.name ||
      exp.expenseAccount ||
      "-",
    paymentAccountId: exp.paymentAccountId || exp.paymentAccount || "",
    paymentAccountName:
      exp.paymentAccountName ||
      exp.paymentAccount?.name ||
      exp.paymentAccount ||
      "-",
    supplierName: exp.supplierName || "-",
    supplierContact: exp.supplierContact || "-",
    supplierAddress: exp.supplierAddress || "-",
    description: exp.description || "-",
    totalAmount:
      Number(exp.amount) ||
      Number(exp.totalAmount) ||
      Number(exp.price) ||
      0,
    currency: exp.currency || "RWF",
    date: exp.date || exp.expenseDate || "-",
  });

  // ==========================
  // 🔄 Load all expenses
  // ==========================
  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true);
      try {
        console.log("🔄 Loading expenses...");
        const data = await expenseService.getAll();
        console.log("✅ Raw Expenses loaded:", data);
        const normalized = data.map(normalizeExpense);
        console.log("📘 Normalized Expenses:", normalized);
        setExpenses(normalized);
      } catch (err) {
        console.error(
          "❌ Error loading expenses:",
          err.response?.data || err.message
        );
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, []);

  // ==========================
  // ➕ Add Expense + Journal Entry (FIXED)
  // ==========================
  const addExpense = async (form) => {
    try {
      const payload = {
        date: form.expenseDate,
        description: form.description,
        expenseAccountId: form.expenseAccount,
        paymentAccountId: form.paymentAccount,
        amount: Number(form.totalAmount),
        supplierName: form.supplierName,
        supplierContact: form.supplierContact,
        supplierAddress: form.supplierAddress,
        currency: form.currency,
      };

      console.log("💾 Submitting payload:", payload);

      // === Validate ===
      if (
        !payload.date ||
        !payload.expenseAccountId ||
        !payload.paymentAccountId ||
        !payload.amount
      ) {
        throw new Error("Missing required fields before sending.");
      }

      // === Create Expense ===
      const created = await expenseService.create(payload);
      console.log("✅ Expense created successfully:", created);

      // ✅ FIXED: Match Sales/Purchase journal format
      const journalEntry = {
        date: payload.date,
        reference: `EXP-${created.id || Date.now()}`,
        description: payload.description || "Expense transaction",
        lines: [
          {
            accountId: payload.expenseAccountId,
            accountName: form.expenseAccountName,
            type: "debit",
            amount: payload.amount,
          },
          {
            accountId: payload.paymentAccountId,
            accountName: form.paymentAccountName,
            type: "credit",
            amount: payload.amount,
          },
        ],
        totalDebit: payload.amount,
        totalCredit: payload.amount,
        createdAt: new Date().toISOString(),
        module: "Expense",
        linkedId: created.id,
      };

      console.log("🧾 Posting journal entry:", journalEntry);
      await journalService.create(journalEntry);
      console.log(
        "✅ Journal entry created for expense:",
        journalEntry.reference
      );

      const normalized = normalizeExpense(created);
      setExpenses((prev) => [normalized, ...prev]);

      return normalized;
    } catch (err) {
      console.error(
        "⚠️ Failed to add expense or journal:",
        err.response?.data || err.message
      );
      throw err;
    }
  };

  // ==========================
  // 🗑 Remove Expense
  // ==========================
  const removeExpense = async (id) => {
    try {
      console.log("🗑 Removing expense:", id);
      await expenseService.remove(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      console.log("✅ Expense removed successfully");
    } catch (err) {
      console.error(
        "❌ Error removing expense:",
        err.response?.data || err.message
      );
    }
  };

  // ==========================
  // 🔁 Refresh Expense List
  // ==========================
  const refreshExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseService.getAll();
      const normalized = data.map(normalizeExpense);
      setExpenses(normalized);
    } catch (err) {
      console.error(
        "❌ Error refreshing expenses:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        addExpense,
        removeExpense,
        refreshExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
