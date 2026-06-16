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
    const explicit = accounts.find((account) => account.id === explicitId || accountCode(account) === explicitId);
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
    ].map(normalize).join(" ");
    return matchers.some((matcher) => haystack.includes(matcher));
  });
};

const buildItemDescription = (items = []) => {
  const names = (Array.isArray(items) ? items : [])
    .map((item) => item.productName || item.name || item.description)
    .filter(Boolean);
  if (!names.length) return "";
  return names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3} more` : "");
};

const line = (account, type, amount, fallbackName, description = "") => ({
  accountId: account?.id || accountCode(account) || fallbackName,
  accountName: accountName(account, fallbackName),
  description,
  type,
  amount: Number(amount) || 0,
  debit: type === "debit" ? Number(amount) || 0 : 0,
  credit: type === "credit" ? Number(amount) || 0 : 0,
});

const calculateSaleParts = (sale) => {
  const items = Array.isArray(sale.items) ? sale.items : [];
  const total = Number(sale.totalPrice || sale.totalAmount || 0);
  const taxFromItems = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const discount = Number(item.discount || 0);
    const itemTotal = Number(item.totalPrice || 0);
    const subtotal = quantity * unitPrice;
    const discountAmount = discount > 1 ? discount : subtotal * (discount / 100);
    return sum + Math.max(0, itemTotal - (subtotal - discountAmount));
  }, 0);
  const tax = Number(sale.taxAmount || sale.totalTax || taxFromItems || 0);
  return {
    total,
    tax,
    revenue: Math.max(0, total - tax),
  };
};

export const postSaleJournal = async ({
  sale,
  saleId,
  sourceType = "sale",
  costDetails = [],
  userId = null,
}) => {
  const accounts = await loadAccounts();
  const { total, tax, revenue } = calculateSaleParts(sale);

  if (!total) return null;

  const saleReference = sale.invoiceNumber || sale.receiptNumber || saleId;
  const saleItems = buildItemDescription(sale.items);
  const description = sale.description ||
    `${sourceType === "cashier" ? "POS cashier sale" : "Sales page sale"} ${saleReference}${saleItems ? ` - ${saleItems}` : ""}`;

  const paymentAccount = findAccount(accounts, sale.paymentAccountId, [
    "cash",
    "bank",
    "accounts receivable",
    "receivable",
  ]);
  const revenueAccount = findAccount(accounts, sale.revenueAccountId, [
    "product sales",
    "sales revenue",
    "sales",
    "revenue",
    "income",
  ]);
  const taxAccount = tax > 0
    ? findAccount(accounts, sale.taxPayableAccountId, ["tax payable", "vat payable", "sales tax payable", "tax"])
    : null;

  const journalLines = [
    line(paymentAccount, "debit", total, sale.paymentMethod === "credit" ? "Accounts Receivable" : "Cash / Bank", description),
    line(revenueAccount, "credit", taxAccount ? revenue : total, "Product Sales Revenue", description),
  ];

  if (taxAccount && tax > 0) {
    journalLines.push(line(taxAccount, "credit", tax, "Tax Payable", `Tax on ${description}`));
  }

  const totalCost = costDetails.reduce((sum, item) => sum + Number(item.costOfGoodsSold || 0), 0);
  if (totalCost > 0) {
    const cogsAccount = findAccount(accounts, sale.cogsAccountId, ["cost of goods", "cost of sales", "cogs"]);
    const inventoryAccount = findAccount(accounts, sale.inventoryAccountId, ["inventory", "finished goods"]);
    journalLines.push(line(cogsAccount, "debit", totalCost, "Cost of Goods Sold", `COGS for ${description}`));
    journalLines.push(line(inventoryAccount, "credit", totalCost, "Inventory", `Inventory issued for ${description}`));
  }

  return JournalModel.create({
    date: sale.date || new Date().toISOString(),
    description,
    reference: saleReference,
    source: {
      type: sourceType,
      id: saleId,
    },
    userId,
    lines: journalLines,
  });
};

export const ensureSaleJournal = async ({
  sale,
  sourceType = "sale",
  costDetails = [],
  userId = null,
}) => {
  const allJournals = await JournalModel.findAll();
  const existingByReference = allJournals.find((entry) =>
    entry.reference === sale.id ||
    entry.referenceId === sale.id ||
    entry.source?.id === sale.id
  );
  if (existingByReference) {
    return { created: false, journalEntry: existingByReference };
  }

  const existingTypes = sourceType === "cashier" ? ["cashier", "sale"] : ["sale", "cashier"];
  for (const type of existingTypes) {
    const existing = await JournalModel.findBySource(type, sale.id);
    if (existing.length) {
      return { created: false, journalEntry: existing[0] };
    }
  }

  const journalEntry = await postSaleJournal({
    sale,
    saleId: sale.id,
    sourceType,
    costDetails,
    userId,
  });

  return { created: Boolean(journalEntry), journalEntry };
};
