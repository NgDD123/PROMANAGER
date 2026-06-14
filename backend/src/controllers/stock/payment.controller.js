import { PaymentModel } from "../../models/stock/payment.model.js";
import { AccountModel } from "../../models/stock/accounts.model.js";
import JournalModel from "../../models/stock/journal.model.js";

const getAccountBalance = async (accountId) => {
  const journal = await JournalModel.findAll();
  let balance = 0;
  
  journal.forEach((entry) => {
    if (entry.lines) {
      entry.lines.forEach((line) => {
        if (line.accountId === accountId || line.accountId === accountId?.id || line.accountId === accountId?.code) {
          balance += (line.debit || 0) - (line.credit || 0);
        }
      });
    }
  });
  return Math.max(balance, 0);
};

const journalLine = (account, type, amount, fallbackName) => ({
  accountId: account?.id || account?.code || fallbackName,
  accountName: account?.name || fallbackName,
  type,
  amount: Number(amount) || 0,
  debit: type === "debit" ? Number(amount) || 0 : 0,
  credit: type === "credit" ? Number(amount) || 0 : 0,
});

const normalize = (value = "") => String(value).toLowerCase();

const findAccount = (accounts, explicitId, matchers) => {
  if (explicitId) {
    const explicit = accounts.find((account) => String(account.id) === String(explicitId) || String(account.code) === String(explicitId));
    if (explicit) return explicit;
  }

  return accounts.find((account) => {
    const haystack = [
      account.name,
      account.code,
      account.accountType,
      account.category,
      account.subCategory,
      account.statement,
      account.sourceAccountRole,
    ].map(normalize).join(" ");
    return matchers.some((matcher) => haystack.includes(matcher));
  });
};

const postSupplierPaymentJournal = async (payment) => {
  const amount = Number(payment.amount) || 0;
  if (!amount) return null;

  const accounts = await AccountModel.findAll();
  const bankAccountId = payment.cashOrBankAccountId || payment.accountId || payment.paymentAccountId;
  const bankAccount = findAccount(accounts, bankAccountId, ["bank accounts", "cash in bank", "cash on hand", "petty cash", "bank"]);
  const payableAccount = findAccount(accounts, payment.payableAccountId, ["accounts payable", "trade payable", "supplier payable", "payable"]);

  if (!bankAccount) {
    console.warn(`⚠️ [PAYMENT JOURNAL] Bank account not found for ID: ${bankAccountId}`);
  }

  return JournalModel.create({
    date: payment.date || payment.paymentDate || new Date().toISOString(),
    description: payment.description || `Supplier payment - ${payment.reference || payment.id}`,
    reference: payment.reference || payment.id,
    referenceId: payment.id,
    source: {
      type: "supplierPayment",
      id: payment.id,
    },
    lines: [
      journalLine(payableAccount, "debit", amount, "Accounts Payable"),
      journalLine(bankAccount, "credit", amount, "Cash / Bank"),
    ],
  });
};

export const PaymentController = {
  // ===== BANK BALANCE CHECK =====
  async checkBankBalance(req, res) {
    try {
      const { accountId, amount } = req.query;
      if (!accountId || !amount) {
        return res.status(400).json({ error: "Account ID and amount required" });
      }
      
      const balance = await getAccountBalance(accountId);
      const paymentAmount = Number(amount);
      const hasBalance = balance >= paymentAmount;
      
      res.json({
        accountId,
        availableBalance: balance,
        requestedAmount: paymentAmount,
        canPay: hasBalance,
        message: hasBalance ? "Sufficient balance available" : `Insufficient balance. Available: ${balance}, Requested: ${paymentAmount}`,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ===== SUPPLIER PAYMENTS =====
  async createSupplierPayment(req, res) {
    try {
      console.log("📥 [CREATE] Request body:", req.body);
      
      const { amount, accountId, cashOrBankAccountId } = req.body;
      const bankAccountId = accountId || cashOrBankAccountId;
      
      if (!bankAccountId) {
        return res.status(400).json({
          error: "Bank account ID required (accountId or cashOrBankAccountId)"
        });
      }
      
      if (!amount) {
        return res.status(400).json({
          error: "Payment amount required"
        });
      }
      
      const balance = await getAccountBalance(bankAccountId);
      
      if (balance < Number(amount)) {
        return res.status(400).json({
          error: "Insufficient bank balance",
          availableBalance: balance,
          requestedAmount: Number(amount),
        });
      }
      
      const payment = await PaymentModel.createSupplierPayment(req.body);
      const journalEntry = await postSupplierPaymentJournal(payment);
      
      console.log("✅ [PAYMENT] Journal entry created:", journalEntry?.id);
      console.log("💰 [BALANCE UPDATE] Bank balance reduced by:", amount);
      
      res.status(201).json({ 
        ...payment, 
        journalEntryId: journalEntry?.id || null,
        message: "Payment processed and bank balance updated"
      });
    } catch (err) {
      console.error("❌ [PAYMENT ERROR]:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getAllSupplierPayments(req, res) {
    try {
      const payments = await PaymentModel.findAllSupplierPayments();
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getSupplierPaymentById(req, res) {
    try {
      const payment = await PaymentModel.findSupplierPaymentById(req.params.id);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateSupplierPayment(req, res) {
    try {
      const payment = await PaymentModel.updateSupplierPayment(req.params.id, req.body);
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async removeSupplierPayment(req, res) {
    try {
      await PaymentModel.removeSupplierPayment(req.params.id);
      await JournalModel.removeBySource("supplierPayment", req.params.id);
      res.json({ message: "Supplier payment deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getPaymentsBySupplier(req, res) {
    try {
      const payments = await PaymentModel.findBySupplier(req.params.supplierId);
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ===== CUSTOMER PAYMENTS =====
  async createCustomerPayment(req, res) {
    try {
      const payment = await PaymentModel.createCustomerPayment(req.body);
      res.status(201).json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAllCustomerPayments(req, res) {
    try {
      const payments = await PaymentModel.findAllCustomerPayments();
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getCustomerPaymentById(req, res) {
    try {
      const payment = await PaymentModel.findCustomerPaymentById(req.params.id);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateCustomerPayment(req, res) {
    try {
      const payment = await PaymentModel.updateCustomerPayment(req.params.id, req.body);
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async removeCustomerPayment(req, res) {
    try {
      await PaymentModel.removeCustomerPayment(req.params.id);
      res.json({ message: "Customer payment deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getPaymentsByCustomer(req, res) {
    try {
      const payments = await PaymentModel.findByCustomer(req.params.customerId);
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
