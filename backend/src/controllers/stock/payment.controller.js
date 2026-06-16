import { PaymentModel } from "../../models/stock/payment.model.js";
import { AccountModel } from "../../models/stock/accounts.model.js";
import JournalModel from "../../models/stock/journal.model.js";

const normalizeText = (value = "") => String(value).toLowerCase();

const isIncomingBankSource = (entry) => {
  const sourceType = normalizeText(entry?.source?.type || entry?.type || "");
  return ["sale", "cashier", "customerpayment", "customer payment", "bankdeposit", "bank deposit"].some((type) =>
    sourceType.includes(type)
  );
};

const getAccountBalance = async (accountId) => {
  const [journal, accounts] = await Promise.all([
    JournalModel.findAll(),
    AccountModel.findAll(),
  ]);
  const account = accounts.find(
    (item) =>
      String(item.id) === String(accountId) ||
      String(item.code || "") === String(accountId)
  );
  if (!account) {
    return {
      account: null,
      balance: 0,
    };
  }

  let balance = account.sourceType === "CompanySettings" || account.sourceAccountRole === "Bank"
    ? Number(account.openingBalance) || Number(account.openingInvestment) || 0
    : 0;
  
  journal.forEach((entry) => {
    if (entry.lines) {
      entry.lines.forEach((line) => {
        const lineAccountId = String(line.accountId || "");
        const matchesAccount =
          lineAccountId === String(accountId) ||
          lineAccountId === String(account?.id || "") ||
          lineAccountId === String(account?.code || "");

        if (matchesAccount) {
          const debit = Number(line.debit || 0);
          const credit = Number(line.credit || 0);

          if (credit > 0) {
            balance -= credit;
          }

          if (debit > 0 && isIncomingBankSource(entry)) {
            balance += debit;
          }
        }
      });
    }
  });
  return {
    account,
    balance: Math.max(balance, 0),
  };
};

const journalLine = (account, type, amount, fallbackName, description = "") => ({
  accountId: account?.id || account?.code || fallbackName,
  accountName: account?.name || fallbackName,
  description,
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
      journalLine(payableAccount, "debit", amount, "Accounts Payable", payment.description || `Supplier payment - ${payment.reference || payment.id}`),
      journalLine(bankAccount, "credit", amount, "Cash / Bank", payment.description || `Supplier payment - ${payment.reference || payment.id}`),
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
      
      const { account, balance } = await getAccountBalance(accountId);
      const paymentAmount = Number(amount);
      const hasBalance = balance >= paymentAmount;
      
      res.json({
        accountId,
        accountName: account?.name || account?.accountName || accountId,
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
      
      const { account, balance } = await getAccountBalance(bankAccountId);

      if (!account) {
        return res.status(400).json({
          error: "Selected bank account was not found",
          availableBalance: 0,
          requestedAmount: Number(amount),
        });
      }
      
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
