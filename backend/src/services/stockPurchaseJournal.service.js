import JournalModel from "../models/stock/journal.model.js";
import { AccountModel } from "../models/stock/accounts.model.js";
import { GLAccountModel } from "../models/stock/glAccount.model.js";

const normalize = (value = "") => String(value).toLowerCase();

const accountName = (account, fallback = "") =>
  account?.name || account?.accountName || account?.glAccountName || fallback;

const accountCode = (account) => account?.code || account?.accountCode || account?.glCode || "";

const accountType = (account) => account?.accountType || account?.type || account?.category || "";

const loadAccounts = async () => {
  const [chartAccounts, glAccounts] = await Promise.all([
    AccountModel.findAll().catch(() => []),
    GLAccountModel.getAll().catch(() => []),
  ]);
  return [...chartAccounts, ...glAccounts];
};

const findAccount = (accounts, explicitId, matchers) => {
  if (explicitId) {
    const explicit = accounts.find((account) => account.id === explicitId || String(accountCode(account)) === String(explicitId));
    if (explicit) return explicit;
  }

  return accounts.find((account) => {
    const haystack = [
      accountName(account),
      accountCode(account),
      accountType(account),
      account?.statement,
      account?.subCategory,
      account?.category,
      account?.usedWhen,
      account?.meaning,
    ].map(normalize).join(" ");
    return matchers.some((matcher) => haystack.includes(matcher));
  });
};

const line = (account, type, amount, fallbackName) => ({
  accountId: account?.id || accountCode(account) || fallbackName,
  accountName: accountName(account, fallbackName),
  type,
  amount: Number(amount) || 0,
  debit: type === "debit" ? Number(amount) || 0 : 0,
  credit: type === "credit" ? Number(amount) || 0 : 0,
});

const itemAmountParts = (item) => {
  const quantity = Number(item.quantity || 0);
  const unitPrice = Number(item.unitPrice || 0);
  const subtotal = quantity * unitPrice;
  const discount = Number(item.discount || 0);
  const discountAmount = discount > 1 ? discount : subtotal * (discount / 100);
  const netBeforeTax = Math.max(0, subtotal - discountAmount);
  const taxValue = Number(item.taxAmount || 0);
  const tax = taxValue || (Number(item.tax || 0) > 1 ? Number(item.tax || 0) : netBeforeTax * (Number(item.tax || 0) / 100));
  const total = Number(item.totalPrice || item.total || 0) || netBeforeTax + tax;

  return {
    inventoryAmount: Math.max(0, total - tax),
    tax,
    total,
  };
};

const calculatePurchaseParts = (purchase) => {
  const items = Array.isArray(purchase.items) && purchase.items.length
    ? purchase.items
    : [purchase];
  const explicitTax = Array.isArray(purchase.taxes)
    ? purchase.taxes.reduce((sum, tax) => sum + Number(tax.taxAmount || 0), 0)
    : 0;

  const byInventoryAccount = new Map();
  let inventory = 0;
  let tax = 0;
  let total = Number(purchase.totalAmount || purchase.totalPrice || purchase.total || 0);

  items.forEach((item) => {
    const parts = itemAmountParts(item);
    const accountId = item.inventoryAccountId || purchase.inventoryAccountId || "";
    const current = byInventoryAccount.get(accountId) || { amount: 0, accountId };
    current.amount += parts.inventoryAmount;
    byInventoryAccount.set(accountId, current);
    inventory += parts.inventoryAmount;
    tax += parts.tax;
  });

  tax = explicitTax || tax;
  total = total || inventory + tax;

  return {
    inventory,
    tax,
    total,
    inventoryLines: Array.from(byInventoryAccount.values()).filter((item) => item.amount > 0),
  };
};

export const postPurchaseJournal = async ({
  purchase,
  purchaseId,
  sourceType = "supplierInvoice",
  userId = null,
}) => {
  const allJournals = await JournalModel.findAll();
  const existing = allJournals.find((entry) =>
    entry.reference === purchaseId ||
    entry.referenceId === purchaseId ||
    entry.source?.id === purchaseId
  );
  if (existing) return { created: false, journalEntry: existing };

  const accounts = await loadAccounts();
  const { inventoryLines, tax, total } = calculatePurchaseParts(purchase);

  if (!total) return { created: false, journalEntry: null };

  const payableAccount = findAccount(accounts, purchase.payableAccountId || purchase.paymentAccountId, [
    "accounts payable",
    "payable",
    "trade payable",
    "supplier payable",
  ]);
  const taxAccount = tax > 0
    ? findAccount(accounts, purchase.inputTaxAccountId || purchase.taxReceivableAccountId, [
      "vat input",
      "input tax",
      "vat receivable",
      "tax receivable",
    ])
    : null;

  const journalLines = inventoryLines.length
    ? inventoryLines.map((item) => {
      const inventoryAccount = findAccount(accounts, item.accountId, [
        "inventory",
        "stock",
        "finished goods",
        "raw materials",
      ]);
      return line(inventoryAccount, "debit", item.amount, "Inventory");
    })
    : [
      line(findAccount(accounts, purchase.inventoryAccountId, [
        "inventory",
        "stock",
        "finished goods",
        "raw materials",
      ]), "debit", total - tax, "Inventory"),
    ];

  if (tax > 0) {
    journalLines.push(line(taxAccount, "debit", tax, "VAT Input / Tax Receivable"));
  }

  journalLines.push(line(payableAccount, "credit", total, "Accounts Payable"));

  const reference = purchase.invoiceNumber || purchase.number || purchaseId;
  const journalEntry = await JournalModel.create({
    date: purchase.date || purchase.invoiceDate || new Date().toISOString(),
    description: `Purchase invoice - ${reference}`,
    reference,
    referenceId: purchaseId,
    source: {
      type: sourceType,
      id: purchaseId,
    },
    userId,
    lines: journalLines,
  });

  console.log(`✅ [PURCHASE JOURNAL] Purchase ${reference} recorded`);
  console.log(`📊 [CASH FLOW] Accounts Payable increased by ${total}`);
  console.log(`📦 [INVENTORY] Inventory increased by ${total - tax}`);

  return { created: true, journalEntry };
};
