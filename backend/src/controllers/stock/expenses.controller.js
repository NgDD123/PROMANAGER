import { ExpenseModel } from "../../models/stock/expenses.model.js";
import JournalModel from "../../models/stock/journal.model.js";
import { AccountModel } from "../../models/stock/accounts.model.js";

export const ExpenseController = {
  // Create new expense + linked journal entry
  async create(req, res) {
    try {
      const {
        date,
        description,
        expenseAccountId,
        paymentAccountId,
        amount,
        supplierName,
        supplierContact,
        supplierAddress,
        currency,
        quantity,
        unit,
        unitPrice,
        totalAmount,
      } = req.body;

      if (!date || !expenseAccountId || !paymentAccountId || !amount) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const accounts = await AccountModel.findAll();
      const expenseAcc = accounts.find(a => a.id === expenseAccountId);
      const paymentAcc = accounts.find(a => a.id === paymentAccountId);

      if (!expenseAcc || !paymentAcc) {
        return res.status(400).json({ error: "Invalid account selection." });
      }

      // Double-entry: Debit Expense, Credit Cash/Payable
      const lines = [
        { accountId: expenseAccountId, debit: amount, credit: 0 },
        { accountId: paymentAccountId, debit: 0, credit: amount }
      ];

      const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
      const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

      if (totalDebit !== totalCredit) {
        return res.status(400).json({ error: "Unbalanced entry (debit ≠ credit)." });
      }

      // Create expense record with all UI fields
      const expense = await ExpenseModel.create({
        date,
        description,
        expenseAccountId,
        expenseAccountName: expenseAcc.name,
        paymentAccountId,
        paymentAccountName: paymentAcc.name,
        amount,
        currency: currency || "RWF",
        supplierName: supplierName || "-",
        supplierContact: supplierContact || "-",
        supplierAddress: supplierAddress || "-",
        quantity: quantity || 1,
        unit: unit || "pcs",
        unitPrice: unitPrice || 0,
        totalAmount: totalAmount || amount,
      });

      // Create linked journal entry
      await JournalModel.create({
        date,
        description: description || `Expense: ${expenseAcc.name}`,
        lines,
        source: { type: "expense", id: expense.id }
      });

      res.status(201).json({ message: "Expense recorded successfully", expense });
    } catch (err) {
      console.error("Expense create error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get all expenses
  async getAll(req, res) {
    try {
      const expenses = await ExpenseModel.findAll();
      res.json(expenses);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete expense and related journal
  async remove(req, res) {
    try {
      const { id } = req.params;
      const expense = await ExpenseModel.findById(id);
      if (!expense) return res.status(404).json({ error: "Expense not found" });

      await ExpenseModel.remove(id);
      await JournalModel.removeBySource("expense", id);

      res.json({ message: "Expense deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
