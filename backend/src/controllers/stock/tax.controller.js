import { TaxModel } from "../../models/stock/tax.model.js";
import { TaxGroupModel } from "../../models/stock/taxGroup.model.js";
import { TaxTransactionModel } from "../../models/stock/taxTransaction.model.js";
import { db } from "../../../utils/firebase.js";

const asNumber = (value) => Number(value) || 0;

const toIsoDate = (value) => {
  if (!value) return "";
  if (value?.toDate) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
};

const getDocumentDate = (doc) => (
  toIsoDate(doc.transactionDate) ||
  toIsoDate(doc.invoiceDate) ||
  toIsoDate(doc.date) ||
  toIsoDate(doc.createdAt) ||
  new Date().toISOString()
);

const calculateTaxableAmount = (item = {}) => {
  const gross = asNumber(item.taxableAmount);
  if (gross) return gross;

  const subtotal = asNumber(item.quantity) * asNumber(item.unitPrice || item.price);
  const discount = asNumber(item.discount);
  const discountAmount = discount > 1 ? discount : subtotal * (discount / 100);
  return Math.max(0, subtotal - discountAmount);
};

const normalizeTaxRecord = ({
  source,
  sourceDoc,
  tax,
  item,
  transactionType,
  fallbackTaxType = "VAT",
  fallbackTaxName = "VAT",
}) => {
  const taxableAmount = calculateTaxableAmount(tax?.taxableAmount ? tax : item);
  const rawRate = asNumber(tax?.taxRate ?? tax?.rate ?? item?.taxRate ?? item?.tax);
  const explicitTaxAmount = asNumber(tax?.taxAmount ?? item?.taxAmount ?? item?.totalTax);
  const taxAmount = explicitTaxAmount || (rawRate > 1 ? rawRate : taxableAmount * (rawRate / 100));
  const taxRate = asNumber(tax?.taxRate ?? tax?.rate) || (rawRate > 1 && taxableAmount ? (taxAmount / taxableAmount) * 100 : rawRate);

  if (!taxableAmount && !taxAmount && !taxRate) return null;

  const transactionDate = getDocumentDate(sourceDoc);
  const transactionId = sourceDoc.id || sourceDoc.invoiceId || "";
  const taxName = tax?.taxName || tax?.name || item?.taxName || fallbackTaxName;
  const taxType = tax?.taxType || item?.taxType || fallbackTaxType;
  const invoiceNumber = sourceDoc.invoiceNumber || sourceDoc.number || sourceDoc.reference || transactionId;

  return {
    id: `${source}-${transactionId}-${tax?.taxId || tax?.id || item?.productId || item?.id || "tax"}`,
    source,
    transactionType,
    transactionId,
    transactionDate,
    taxId: tax?.taxId || tax?.id || "",
    taxName,
    taxCode: tax?.taxCode || tax?.code || "",
    taxType,
    taxableAmount: Number(taxableAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    taxRate: Number(taxRate.toFixed(4)),
    customerId: sourceDoc.customerId || null,
    supplierId: sourceDoc.supplierId || null,
    invoiceNumber,
    description: `${source} - ${invoiceNumber}`,
  };
};

const taxRecordsFromDocument = (source, sourceDoc, transactionType) => {
  const explicitTaxes = Array.isArray(sourceDoc.taxes) ? sourceDoc.taxes : [];
  if (explicitTaxes.length) {
    return explicitTaxes
      .map((tax, index) => normalizeTaxRecord({
        source,
        sourceDoc,
        tax: { ...tax, id: tax.id || tax.taxId || index },
        item: tax,
        transactionType,
      }))
      .filter(Boolean);
  }

  const items = Array.isArray(sourceDoc.items) ? sourceDoc.items : [];
  if (items.length) {
    return items
      .map((item, index) => normalizeTaxRecord({
        source,
        sourceDoc,
        item: { ...item, id: item.id || item.productId || index },
        transactionType,
      }))
      .filter(Boolean);
  }

  return [normalizeTaxRecord({
    source,
    sourceDoc,
    item: sourceDoc,
    tax: sourceDoc,
    transactionType,
  })].filter(Boolean);
};

const readCollection = async (collectionName) => {
  const snapshot = await db().collection(collectionName).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const dateInRange = (value, startDate, endDate) => {
  const date = toIsoDate(value).slice(0, 10);
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
};

const getUnifiedTaxTransactions = async (filters = {}) => {
  const [
    existingTaxTransactions,
    sales,
    customerInvoices,
    purchases,
    supplierInvoices,
    expenses,
    returns,
  ] = await Promise.all([
    TaxTransactionModel.getAll({}),
    readCollection("sales"),
    readCollection("customerInvoices"),
    readCollection("purchases"),
    readCollection("supplierInvoices"),
    readCollection("expenses"),
    readCollection("returns"),
  ]);

  const derived = [
    ...sales.flatMap((doc) => taxRecordsFromDocument("Sales", doc, "Sale")),
    ...customerInvoices.flatMap((doc) => taxRecordsFromDocument("Customer Invoice", doc, "Sale")),
    ...purchases.flatMap((doc) => taxRecordsFromDocument("Purchase", doc, "Purchase")),
    ...supplierInvoices.flatMap((doc) => taxRecordsFromDocument("Supplier Invoice", doc, "Purchase")),
    ...expenses.flatMap((doc) => taxRecordsFromDocument("Expense", doc, "Expense")),
    ...returns.flatMap((doc) => taxRecordsFromDocument("Return", doc, "Return")),
  ];

  const derivedTransactionIds = new Set(derived.map((item) => String(item.transactionId)).filter(Boolean));
  const legacyOnly = existingTaxTransactions
    .filter((item) => !derivedTransactionIds.has(String(item.transactionId || "")))
    .map((item) => ({ source: item.source || "Tax Transaction", ...item }));

  return [...derived, ...legacyOnly]
    .filter((item) => !filters.transactionType || item.transactionType === filters.transactionType)
    .filter((item) => !filters.taxType || item.taxType === filters.taxType)
    .filter((item) => dateInRange(item.transactionDate, filters.startDate, filters.endDate))
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
};

const summarizeTaxTransactions = (transactions) => {
  const summary = {};

  transactions.forEach((txn) => {
    const key = `${txn.transactionType || "Other"}::${txn.taxType || "Other"}`;
    if (!summary[key]) {
      summary[key] = {
        transactionType: txn.transactionType || "Other",
        taxType: txn.taxType || "Other",
        totalTaxableAmount: 0,
        totalTaxAmount: 0,
        transactionCount: 0,
      };
    }
    summary[key].totalTaxableAmount += asNumber(txn.taxableAmount);
    summary[key].totalTaxAmount += asNumber(txn.taxAmount);
    summary[key].transactionCount += 1;
  });

  return Object.values(summary).map((item) => ({
    ...item,
    totalTaxableAmount: Number(item.totalTaxableAmount.toFixed(2)),
    totalTaxAmount: Number(item.totalTaxAmount.toFixed(2)),
  }));
};

export const TaxController = {
  // Tax Configuration
  async createTax(req, res) {
    try {
      console.log('Creating tax with data:', req.body);
      const tax = await TaxModel.create(req.body);
      console.log('Tax created successfully:', tax);
      return res.status(201).json(tax);
    } catch (err) {
      console.error("Error creating tax:", err);
      return res.status(500).json({ 
        error: "Failed to create tax",
        message: err.message,
        details: err.stack 
      });
    }
  },

  async getAllTaxes(req, res) {
    try {
      const taxes = await TaxModel.getAll();
      return res.status(200).json(taxes);
    } catch (err) {
      console.error("Error fetching taxes:", err);
      return res.status(500).json({ error: "Failed to fetch taxes" });
    }
  },

  async getActiveTaxes(req, res) {
    try {
      const taxes = await TaxModel.getActive();
      return res.status(200).json(taxes);
    } catch (err) {
      console.error("Error fetching active taxes:", err);
      return res.status(500).json({ error: "Failed to fetch active taxes" });
    }
  },

  async getTaxById(req, res) {
    try {
      const { id } = req.params;
      const tax = await TaxModel.getById(id);
      if (!tax) return res.status(404).json({ error: "Tax not found" });
      return res.status(200).json(tax);
    } catch (err) {
      console.error("Error fetching tax:", err);
      return res.status(500).json({ error: "Failed to fetch tax" });
    }
  },

  async updateTax(req, res) {
    try {
      const { id } = req.params;
      const updated = await TaxModel.update(id, req.body);
      if (!updated) return res.status(404).json({ error: "Tax not found" });
      return res.status(200).json(updated);
    } catch (err) {
      console.error("Error updating tax:", err);
      return res.status(500).json({ error: "Failed to update tax" });
    }
  },

  async deleteTax(req, res) {
    try {
      const { id } = req.params;
      const deleted = await TaxModel.remove(id);
      if (!deleted) return res.status(404).json({ error: "Tax not found" });
      return res.status(200).json({ message: "Tax deleted successfully" });
    } catch (err) {
      console.error("Error deleting tax:", err);
      return res.status(500).json({ error: "Failed to delete tax" });
    }
  },

  // Tax Groups
  async createTaxGroup(req, res) {
    try {
      const group = await TaxGroupModel.create(req.body);
      return res.status(201).json(group);
    } catch (err) {
      console.error("Error creating tax group:", err);
      return res.status(500).json({ error: "Failed to create tax group" });
    }
  },

  async getAllTaxGroups(req, res) {
    try {
      const groups = await TaxGroupModel.getAll();
      return res.status(200).json(groups);
    } catch (err) {
      console.error("Error fetching tax groups:", err);
      return res.status(500).json({ error: "Failed to fetch tax groups" });
    }
  },

  async updateTaxGroup(req, res) {
    try {
      const { id } = req.params;
      const updated = await TaxGroupModel.update(id, req.body);
      if (!updated) return res.status(404).json({ error: "Tax group not found" });
      return res.status(200).json(updated);
    } catch (err) {
      console.error("Error updating tax group:", err);
      return res.status(500).json({ error: "Failed to update tax group" });
    }
  },

  async deleteTaxGroup(req, res) {
    try {
      const { id } = req.params;
      const deleted = await TaxGroupModel.remove(id);
      if (!deleted) return res.status(404).json({ error: "Tax group not found" });
      return res.status(200).json({ message: "Tax group deleted successfully" });
    } catch (err) {
      console.error("Error deleting tax group:", err);
      return res.status(500).json({ error: "Failed to delete tax group" });
    }
  },

  // Tax Reports
  async getTaxTransactions(req, res) {
    try {
      const { startDate, endDate, taxType, transactionType } = req.query;
      const filters = { startDate, endDate, taxType, transactionType };
      const transactions = await getUnifiedTaxTransactions(filters);
      return res.status(200).json(transactions);
    } catch (err) {
      console.error("Error fetching tax transactions:", err);
      return res.status(500).json({ error: "Failed to fetch tax transactions" });
    }
  },

  async getTaxReport(req, res) {
    try {
      const { taxType, startDate, endDate } = req.query;
      const transactions = await getUnifiedTaxTransactions({ taxType, startDate, endDate });
      return res.status(200).json(transactions);
    } catch (err) {
      console.error("Error generating tax report:", err);
      return res.status(500).json({ error: "Failed to generate tax report" });
    }
  },

  async getTaxSummary(req, res) {
    try {
      const { startDate, endDate, taxType, transactionType } = req.query;
      const transactions = await getUnifiedTaxTransactions({ startDate, endDate, taxType, transactionType });
      const summary = summarizeTaxTransactions(transactions);
      return res.status(200).json(summary);
    } catch (err) {
      console.error("Error generating tax summary:", err);
      return res.status(500).json({ error: "Failed to generate tax summary" });
    }
  },
};
