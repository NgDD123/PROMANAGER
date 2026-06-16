import { ExpenseModel } from "../../models/stock/expenses.model.js";
import JournalModel from "../../models/stock/journal.model.js";
import { AccountModel } from "../../models/stock/accounts.model.js";

const accountCode = (account) => String(account?.code || account?.accountCode || account?.glCode || "");

const findAccount = (accounts, value) => {
  const id = String(value || "");
  return accounts.find((account) => account.id === id || accountCode(account) === id);
};

const asMoney = (value) => Number(Number(value || 0).toFixed(2));

export const ExpenseController = {
  // Create new expense + linked journal entry
  async create(req, res) {
    try {
      const {
        date,
        expenseDate,
        description,
        expenseAccountId,
        expenseAccount,
        paymentAccountId,
        paymentAccount,
        amount,
        supplierName,
        supplierContact,
        supplierAddress,
        supplierId,
        paymentType,
        status,
        currency,
        quantity,
        unit,
        unitPrice,
        totalAmount,
      } = req.body;

      const expenseDateValue = date || expenseDate;
      const expenseAccountValue = expenseAccountId || expenseAccount;
      const paymentAccountValue = paymentAccountId || paymentAccount;
      const expenseAmount = asMoney(amount || totalAmount || (Number(quantity || 0) * Number(unitPrice || 0)));

      if (!expenseDateValue || !expenseAccountValue || !paymentAccountValue || !expenseAmount) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const accounts = await AccountModel.findAll();
      const expenseAcc = findAccount(accounts, expenseAccountValue);
      const paymentAcc = findAccount(accounts, paymentAccountValue);

      if (!expenseAcc || !paymentAcc) {
        return res.status(400).json({ error: "Invalid account selection." });
      }

      // Double-entry: Debit Expense, Credit Cash/Payable
      const entryDescription = description || `Expense: ${expenseAcc.name}`;
      const lines = [
        {
          accountId: expenseAcc.id,
          accountName: expenseAcc.name,
          description: entryDescription,
          type: "debit",
          amount: expenseAmount,
          debit: expenseAmount,
          credit: 0,
        },
        {
          accountId: paymentAcc.id,
          accountName: paymentAcc.name,
          description: entryDescription,
          type: "credit",
          amount: expenseAmount,
          debit: 0,
          credit: expenseAmount,
        },
      ];

      const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
      const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

      if (totalDebit !== totalCredit) {
        return res.status(400).json({ error: "Unbalanced entry (debit ≠ credit)." });
      }

      // Create expense record with all UI fields
      const expense = await ExpenseModel.create({
        date: expenseDateValue,
        description,
        expenseAccountId: expenseAcc.id,
        expenseAccountName: expenseAcc.name,
        paymentAccountId: paymentAcc.id,
        paymentAccountName: paymentAcc.name,
        amount: expenseAmount,
        currency: currency || "RWF",
        supplierId: supplierId || "",
        supplierName: supplierName || "-",
        supplierContact: supplierContact || "-",
        supplierAddress: supplierAddress || "-",
        quantity: quantity || 1,
        unit: unit || "pcs",
        unitPrice: unitPrice || 0,
        totalAmount: expenseAmount,
        paymentType: paymentType || "accrual",
        status: status || "pending",
      });

      // Create linked journal entry
      const journal = await JournalModel.create({
        date: expenseDateValue,
        reference: `EXP-${expense.id}`,
        description: entryDescription,
        lines,
        totalDebit,
        totalCredit,
        module: "Expense",
        linkedId: expense.id,
        source: { type: "expense", id: expense.id }
      });

      res.status(201).json({ message: "Expense recorded successfully", expense, journal });
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

  // Get expense by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const expense = await ExpenseModel.findById(id);
      
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(expense);
    } catch (err) {
      console.error("Get expense by ID error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Update expense
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      console.log(`Updating expense ${id} with data:`, updateData);
      
      const updatedExpense = await ExpenseModel.update(id, updateData);
      
      res.json({ 
        message: "Expense updated successfully", 
        expense: updatedExpense 
      });
    } catch (err) {
      console.error("Expense update error:", err);
      if (err.message === 'Expense not found') {
        return res.status(404).json({ error: err.message });
      }
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
