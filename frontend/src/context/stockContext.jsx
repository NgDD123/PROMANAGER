// ========================================
// ✅ StockContext.jsx (Professional & Robust with Totals & Reporting)
// ========================================
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  stockService,
  backendProductSettingsService,
  accountSettingsService,
  journalService,
} from "../services/stock.service";

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [dispenses, setDispenses] = useState([]);
  const [assets, setAssets] = useState([]);
  const [productSettings, setProductSettings] = useState([]);
  const [accountSettings, setAccountSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);



  // ============================
  // Load all stock & settings safely
  // ============================
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [
          stockResRaw,
          productSettingsResRaw,
          accountSettingsResRaw,
          fixedAssetsResRaw,
          productsResRaw,
          suppliersResRaw,
          invoicesResRaw,
          customersResRaw,
          paymentsResRaw, // 👈 Add this
        ] = await Promise.allSettled([
          stockService.getAll(),
          backendProductSettingsService.getAll(),
          accountSettingsService.getAll(),
          stockService.getAll("fixed-assets"),
          stockService.getAll("products"),
          stockService.getAll("supplier"),
          stockService.getAll("invoice"),
          stockService.getAll("customer"),
          stockService.getAll("payment"), // 👈 Fetch from back
        ]);

        const stockRes =
          stockResRaw.status === "fulfilled" ? stockResRaw.value : {};
        const productSettingsRes =
          productSettingsResRaw.status === "fulfilled" &&
            Array.isArray(productSettingsResRaw.value)
            ? productSettingsResRaw.value
            : [];
        const accountSettingsRes =
          accountSettingsResRaw.status === "fulfilled"
            ? Array.isArray(accountSettingsResRaw.value)
              ? accountSettingsResRaw.value
              : accountSettingsResRaw.value?.data ||
              accountSettingsResRaw.value?.accounts ||
              []
            : [];

        const fixedAssetsRes =
          fixedAssetsResRaw.status === "fulfilled"
            ? Array.isArray(fixedAssetsResRaw.value)
              ? fixedAssetsResRaw.value
              : fixedAssetsResRaw.value?.data || []
            : [];
        // Ensure we always get an array, even if API returns { data: [...] }
        const productsRaw =
          productsResRaw.status === "fulfilled"
            ? Array.isArray(productsResRaw.value)
              ? productsResRaw.value
              : productsResRaw.value?.data || []
            : [];
        const suppliersRaw =
          suppliersResRaw.status === "fulfilled" &&
            Array.isArray(suppliersResRaw.value)
            ? suppliersResRaw.value
            : [];

        const customersRaw =
          customersResRaw.status === "fulfilled" &&
            Array.isArray(customersResRaw.value)
            ? customersResRaw.value
            : [];

        const invoicesRaw =
          invoicesResRaw.status === "fulfilled" &&
            Array.isArray(invoicesResRaw.value)
            ? invoicesResRaw.value
            : [];

        // Normalize products one-to-one
        const normalizedProducts = productsRaw.map((p) => ({
          id: p.id,
          name: p.name || "-",
          category: p.category || "General",
          unit: p.unit || "-",
          buyingPrice: Number(p.costPrice) || 0,
          sellingPrice: Number(p.sellingPrice) || 0,
          quantity: Number(p.currentStock) || 0,
          supplier: p.supplier || "-",
          expiryDate: p.expiryDate || "-",
          barcode: p.barcode || "",
          description: p.description || "",
          status: p.status || "active",
        }));

        setProducts(normalizedProducts);
        // Normalize suppliers
        const normalizedSuppliers = suppliersRaw.map((s) => ({
          id: s.id,
          name: s.name || "-",
          phone: s.phone || "-",
          email: s.email || "-",
          address: s.address || "-",
          status: s.status || "active",
        }));
        setSuppliers(normalizedSuppliers);

        // Normalize customers
        const normalizedCustomers = customersRaw.map((c) => ({
          id: c.id,
          name: c.name || "-",
          phone: c.phone || "-",
          email: c.email || "-",
          address: c.address || "-",
          status: c.status || "active",
        }));
        setCustomers(normalizedCustomers);

        // Normalize invoices
        // Normalize invoices
        const normalizedInvoices = invoicesRaw.map((inv) => ({
          id: inv.id,
          number: inv.number || "-",
          type: inv.type || "sale",
          customerId: inv.customerId || "",
          supplierId: inv.supplierId || "",
          date: inv.date || "-",
          items: Array.isArray(inv.items)
            ? inv.items.map((item) => ({
               productId: item.productId || "",          // ✅ ADD
              productName: item.productName || "-",
              description: item.description || "",
              quantity: Number(item.quantity) || 0,
              unit: item.unit || "-",
              unitPrice: Number(item.unitPrice) || 0,
              discount: Number(item.discount) || 0,
              tax: Number(item.tax) || 0,
              total: Number(item.total) || 0,
              batchNo: item.batchNo || "",
              expiry: item.expiry || "",
              quality: item.quality || "",
              warranty: item.warranty || "",
              serialNo: item.serialNo || "",
              storeLocation: item.storeLocation || "-",
              storeCategory: item.storeCategory || "-",
              inventoryAccount: item.inventoryAccount || "-",
              inventoryAccountId: item.inventoryAccountId || "", // ✅ ADD
              type: item.type || "Product",
              openingStock: Number(item.openingStock) || 0,
            }))
            : [],
          totalAmount: Number(inv.totalAmount) || 0,
          status: inv.status || "pending",
        }));

        setInvoices(normalizedInvoices);

        const paymentsRaw =
          paymentsResRaw.status === "fulfilled" && Array.isArray(paymentsResRaw.value)
            ? paymentsResRaw.value
            : [];

        const normalizedPayments = paymentsRaw.map((p) => ({
          id: p.id,
          date: p.date || new Date().toISOString(),
          amount: Number(p.amount) || 0,
          paymentType: p.paymentType || "supplier", // supplier or customer
          relatedId: p.relatedId || "", // supplierId or customerId
          method: p.method || "cash",
          reference: p.reference || "-",
          description: p.description || "",
          status: p.status || "completed",
        }));

        setPayments(normalizedPayments);



        setPurchases(
          stockRes.purchases && Array.isArray(stockRes.purchases)
            ? stockRes.purchases
            : []
        );
        setSales(
          stockRes.sales && Array.isArray(stockRes.sales) ? stockRes.sales : []
        );
        setDispenses(
          stockRes.dispenses && Array.isArray(stockRes.dispenses)
            ? stockRes.dispenses
            : []
        );
        setAccountSettings(accountSettingsRes);

        const inventoryAccounts = accountSettingsRes.filter(
          (acc) =>
            acc.type === "Assets" &&
            acc.category === "Current Assets" &&
            acc.name?.toLowerCase().includes("inventory")
        );

        const productsWithInventory = productSettingsRes.map((p) => ({
          ...p,
          inventoryAccountId: p.inventoryAccountId || inventoryAccounts[0]?.id || "",
        }));
        setProductSettings(productsWithInventory);

        setAssets(
          fixedAssetsRes.map((a) => ({
            id: a.id,
            assetName: a.assetName || a.name || "-",
            cost: Number(a.cost) || 0,
            usefulLife: Number(a.usefulLife) || 5,
            acquisitionDate: a.acquisitionDate || "-",
            accountId: a.accountId || a.purchaseAccountId || "",
            accountName:
              a.accountName ||
              a.purchaseAccountName ||
              (a.account && a.account.name) ||
              "-",
            paymentAccountId: a.paymentAccountId || null,
            paymentAccountName: a.paymentAccountName || null,
            accumulatedDepreciation: Number(a.accumulatedDepreciation) || 0,
            currency: a.currency || "RWF",
          }))
        );
      } catch (err) {
        console.error("❌ Error loading stock data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // ============================
  // Product CRUD
  // ============================
  const addProduct = async (data) => {
    const newProduct = await stockService.add("products", data);
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id, data) => {
    const updated = await stockService.update("products", id, data);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProduct = async (id) => {
    await stockService.remove("products", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ============================
  // Account CRUD
  // ============================
  const addAccount = async (data) => {
    await accountSettingsService.create(data);
    const updated = await accountSettingsService.getAll();
    setAccountSettings(updated);
  };

  const updateAccount = async (id, data) => {
    await accountSettingsService.update(id, data);
    const updated = await accountSettingsService.getAll();
    setAccountSettings(updated);
  };

  const deleteAccount = async (id) => {
    await accountSettingsService.remove(id);
    const updated = await accountSettingsService.getAll();
    setAccountSettings(updated);
  };

  const getAccountName = (id) => {
    const acc = accountSettings.find((a) => a.id === id);
    return acc ? acc.name : id;
  };

  // ============================
  // Product Settings CRUD
  // ============================
  const addProductSetting = async (data) => {
    const created = await backendProductSettingsService.create(data);
    const updated = await backendProductSettingsService.getAll();
    setProductSettings(updated);
    return created;
  };

  const updateProductSetting = async (id, data) => {
    await backendProductSettingsService.update(id, data);
    const updated = await backendProductSettingsService.getAll();
    setProductSettings(updated);
  };

  const deleteProductSetting = async (id) => {
    await backendProductSettingsService.remove(id);
    const updated = await backendProductSettingsService.getAll();
    setProductSettings(updated);
  };
  // ============================
  // SUPPLIER CRUD
  // ============================
  const addSupplier = async (data) => {
    const newSupplier = await stockService.add("supplier", data);
    setSuppliers((prev) => [...prev, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = async (id, data) => {
    const updated = await stockService.update("supplier", id, data);
    setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteSupplier = async (id) => {
    await stockService.remove("supplier", id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // ============================
  // CUSTOMER CRUD
  // ============================
  const addCustomer = async (data) => {
    const newCustomer = await stockService.add("customer", data);
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = async (id, data) => {
    const updated = await stockService.update("customer", id, data);
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteCustomer = async (id) => {
    await stockService.remove("customer", id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // ============================
  // INVOICE CRUD
  // ============================
  const addInvoice = async (data) => {
    const response = await stockService.add("invoice", data);
    const savedInvoice = response.data || response;
    setInvoices((prev) => [...prev, savedInvoice]);
    return savedInvoice;
  };


  const updateInvoice = async (id, data) => {
    const response = await stockService.update("invoice", id, data);

    // Extract actual invoice object
    const updatedInvoice = response.data || response;

    // Update invoices state safely
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updatedInvoice } : inv))
    );

    return updatedInvoice;
  };


  const deleteInvoice = async (id) => {
    await stockService.remove("invoice", id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const getInvoicesBySupplier = (supplierId) =>
    invoices.filter((inv) => inv.supplierId === supplierId);
  const getInvoicesByCustomer = (customerId) =>
    invoices.filter((inv) => inv.customerId === customerId);
  const approveInvoice = async (invoiceId) => {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return;

  for (const item of invoice.items) {
    if (!item.productId || !item.inventoryAccountId) continue;

    await addItem("purchase", {
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.total,
      supplierId: invoice.supplierId,
      invoiceId: invoice.id,
      inventoryAccountId: item.inventoryAccountId,
      paymentAccountId: "accounts_payable",
      date: invoice.date,
      description: `Purchase from Invoice ${invoice.number}`,
    });
  }

  await updateInvoice(invoiceId, { status: "approved" });
};


 

  const addPayment = async (data) => {
  try {
    console.log("💰 [addPayment] Starting payment...", data);

    // 1️⃣ Save payment
    const saved = await stockService.add("payment", data);
    setPayments((prev) => [...prev, saved]);

    // 2️⃣ Create PAYMENT journal (NO INVENTORY)
    await createJournalEntry({
      type: "payment",
      date: data.date || new Date().toISOString(),
      description: data.description || `Payment ${saved.id}`,
      referenceId: saved.id,
      lines: [
        {
          accountId: "accounts_payable",
          type: "debit",
          amount: Number(data.amount),
        },
        {
          accountId: data.cashOrBankAccountId,
          type: "credit",
          amount: Number(data.amount),
        },
      ],
    });

    // 3️⃣ Update invoice status (optional)
    const invoiceId = data.relatedInvoiceId || data.invoiceId;
    if (invoiceId) {
      await updateInvoice(invoiceId, { status: "paid" });
    }

    console.log("✅ Payment processed correctly");
    return saved;
  } catch (error) {
    console.error("❌ Error in addPayment:", error);
    throw error;
  }
};





  const updatePayment = async (id, data) => {
    const updated = await stockService.update("payment", id, data);
    setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deletePayment = async (id) => {
    await stockService.remove("payment", id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const getPaymentsBySupplier = (supplierId) =>
    payments.filter((p) => p.paymentType === "supplier" && p.relatedId === supplierId);

  const getPaymentsByCustomer = (customerId) =>
    payments.filter((p) => p.paymentType === "customer" && p.relatedId === customerId);



  // ============================
// Journal Entry (FIXED)
// ============================
 // ============================
  // ✅ JOURNAL ENTRY (MULTI-LINE)
  // ============================
  const createJournalEntry = async (entry) => {
    if (!Array.isArray(entry.lines) || entry.lines.length < 2) {
      throw new Error("Journal entry must have at least 2 lines");
    }

    const data = {
      date: entry.date,
      description: entry.description,
      referenceId: entry.referenceId,
      type: entry.type,
      lines: entry.lines.map((l) => ({
        accountId: l.accountId,
        accountName: l.accountName || getAccountName(l.accountId) ||
         l.accountId, // ✅ prevents "Unknown Account",
        type: l.type, // debit | credit
        amount: Number(l.amount),
        note: l.note || "",
      })),
    };

    return await journalService.create(data);
  };


  // ============================
  // Stock CRUD
  // ============================
  const addItem = async (type, data) => {
    let saved;

    switch (type) {
      case "purchase": {
  saved = await stockService.add("purchase", data);
  setPurchases((prev) => [...prev, saved]);

  // ✅ VALID MULTI-LINE JOURNAL ENTRY
  await createJournalEntry({
    type: "purchase",
    date: new Date().toISOString(),
    description: data.description || `Purchase of ${data.productName}`,
    referenceId: saved.id,
    lines: [
      {
        accountId: data.inventoryAccountId,
        accountName: getAccountName(data.inventoryAccountId),
        type: "debit",
        amount: Number(data.totalPrice),
      },
      {
        accountId: data.paymentAccountId,
        accountName: getAccountName(data.paymentAccountId),
        type: "credit",
        amount: Number(data.totalPrice),
      },
    ],
  });

  break;
}


      case "sale":
  saved = await stockService.add("sales", data);

  // Normalize saved sale (numbers must be Number type)
  const normalizedSale = {
    ...saved,
    items: Array.isArray(saved.items)
      ? saved.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          discount: Number(item.discount) || 0,
          tax: Number(item.tax) || 0,
          totalPrice: Number(item.totalPrice) || 0,
        }))
      : [],
    totalPrice: Number(saved.totalPrice) || 0,
  };

  setSales((prev) => [...prev, normalizedSale]);
  break;



      case "dispense":
        saved = await stockService.add("dispense", data);
        setDispenses((prev) => [...prev, saved]);
        break;

      case "fixed-assets": {
        const response = await stockService.add("fixed-assets", data);
        const savedAsset = response?.data?.asset || response?.asset || null;

        if (savedAsset) {
          const normalized = {
            id: savedAsset.id,
            assetName: savedAsset.assetName || savedAsset.name || "-",
            cost: Number(savedAsset.cost) || 0,
            usefulLife: Number(savedAsset.usefulLife) || 5,
            acquisitionDate: savedAsset.acquisitionDate || "-",
            accountId: savedAsset.purchaseAccountId || "",
            accountName: savedAsset.purchaseAccountName || "-",
            paymentAccountId: savedAsset.paymentAccountId || null,
            paymentAccountName: savedAsset.paymentAccountName || null,
            accumulatedDepreciation: Number(savedAsset.accumulatedDepreciation) || 0,
            currency: savedAsset.currency || "RWF",
          };

          setAssets((prev) => [normalized, ...prev]);
        }

        if (data.paymentAccountId) {
          await createJournalEntry({
            type: "fixed-asset",
            date: data.acquisitionDate,
            description: `Acquisition of ${data.assetName}`,
            debitAccountId: data.accountId,
            debitAccountName: getAccountName(data.accountId),
            creditAccountId: data.paymentAccountId,
            creditAccountName: getAccountName(data.paymentAccountId),
            amount: Number(data.cost),
            referenceId: savedAsset?.id,
          });
        }
        break;
      }

      default:
        throw new Error("Unknown stock type");
    }

    return saved;
  };

  // ============================
  // Get Product Stock
  // ============================
  const getProductStock = (productId) => {
    if (!productId) return 0;

    const purchased = (purchases || [])
      .filter((p) => p.productId === productId)
      .reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

    const sold = (sales || [])
      .filter((s) => s.productId === productId)
      .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

    const dispensed = (dispenses || [])
      .filter((d) => d.productId === productId)
      .reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

    const stock = purchased - sold - dispensed;
    return stock > 0 ? stock : 0;
  };

  // ============================
  // Get Product Total Price
  // ============================
  const getProductTotalPrice = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return 0;

    const stockQty = getProductStock(productId);
    return stockQty * (Number(product.buyingPrice) || 0);
  };

  // ============================
  // Total Purchases Value
  // ============================
  const getTotalPurchases = (startDate, endDate) => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const filtered = purchases.filter((p) => {
      const d = p.date ? new Date(p.date) : null;
      if (!d) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    const totalQty = filtered.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const totalValue = filtered.reduce(
      (sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.unitPrice) || 0),
      0
    );

    return { totalQty, totalValue };
  };

  // ============================
  // Total Sales Value
  // ============================
  const getTotalSales = (startDate, endDate) => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const filtered = sales.filter((s) => {
      const d = s.date ? new Date(s.date) : null;
      if (!d) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    const totalQty = filtered.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
    const totalValue = filtered.reduce(
      (sum, s) => sum + (Number(s.quantity) || 0) * (Number(s.unitPrice) || 0),
      0
    );

    return { totalQty, totalValue };
  };

  // ============================
  // Total Closing Stock Value
  // ============================
  const getTotalClosingStockValue = () => {
    const totalValue = products.reduce((sum, p) => {
      const closingQty = getProductStock(p.id);
      return sum + closingQty * (Number(p.buyingPrice) || 0);
    }, 0);

    return totalValue;
  };
// ================================
// 📊 UNIVERSAL REPORT GENERATOR (Firebase compatible)
// ================================
const generateReport = (type, startDate, endDate) => {
  console.log('--- generateReport called ---');
  console.log('Type:', type, 'StartDate:', startDate, 'EndDate:', endDate);

  if (!type) return [];

  // ---------------------------
  // Parse start & end dates
  // ---------------------------
  const parseDate = (d) => {
    if (!d) return null;

    // New Firebase timestamp
    if (d._seconds !== undefined)
      return new Date(d._seconds * 1000 + (d._nanoseconds || 0) / 1000000);

    // Old Firebase timestamp
    if (d.seconds !== undefined) return new Date(d.seconds * 1000);

    // Already a Date object
    if (d instanceof Date) return d;

    // String
    if (typeof d === 'string') return new Date(d);

    console.warn('Unknown date format:', d);
    return null;
  };

  const start = startDate ? parseDate(startDate) : null;
  const end = endDate ? parseDate(endDate) : null;

  console.log('Parsed Start:', start);
  console.log('Parsed End:', end);

  const inRange = (d) => {
    const date = parseDate(d);
    const valid = date && (!start || date >= start) && (!end || date <= end);
    console.log('Checking date:', date, 'InRange:', valid);
    return valid;
  };

  // ---------------------------
  // SALES
  // ---------------------------
  if (type === 'sale') {
    const result = sales
      .flatMap((s) =>
        (s.items || []).map((i) => ({
          date: s.createdAt || s.date,
          productId: i.productId || '',
          productName: i.productName || '',
          unit: i.unit || '',
          quantity: Number(i.quantity || 0),
          unitPrice: Number(i.unitPrice || 0),
          totalPrice: Number(i.totalPrice || 0),
        }))
      )
      .filter((i) => inRange(i.date));

    console.log('Sales result:', result, 'length:', result.length);
    return result;
  }

  // ---------------------------
  // PURCHASES / INVOICES
  // ---------------------------
  if (type === 'purchase') {
    const result = invoices
      .flatMap((inv) =>
        (inv.items || []).map((i) => ({
          date: inv.createdAt || inv.date,
          productId: i.productId || '',
          productName: i.productName || '',
          unit: i.unit || '',
          quantity: Number(i.quantity || 0),
          unitPrice: Number(i.unitPrice || 0),
          totalPrice: Number(i.totalPrice || 0),
        }))
      )
      .filter((i) => inRange(i.date));

    console.log('Purchase result:', result, 'length:', result.length);
    return result;
  }

  // ---------------------------
  // OPENING STOCK
  // ---------------------------
  if (type === 'opening qty') {
    const result = products.map((p) => ({
      productName: p.name || '',
      category: p.category || '',
      unit: p.unit || '',
      reportQty: Number(p.openingStock || 0),
      unitPrice: Number(p.buyingPrice || 0),
      totalPrice: Number(p.openingStock || 0) * Number(p.buyingPrice || 0),
    }));

    console.log('Opening result:', result, 'length:', result.length);
    return result;
  }

  // ---------------------------
  // CLOSING STOCK
  // ---------------------------
  if (type === 'closing qty') {
    const result = products.map((p) => {
      const purchased = invoices
        .flatMap((i) => i.items || [])
        .filter((i) => i.productId === p.id)
        .reduce((s, i) => s + Number(i.quantity || 0), 0);

      const sold = sales
        .flatMap((s) => s.items || [])
        .filter((i) => i.productId === p.id)
        .reduce((s, i) => s + Number(i.quantity || 0), 0);

      const closing = Number(p.openingStock || 0) + purchased - sold;

      return {
        productName: p.name || '',
        category: p.category || '',
        unit: p.unit || '',
        reportQty: closing,
        unitPrice: Number(p.buyingPrice || 0),
        totalPrice: closing * Number(p.buyingPrice || 0),
      };
    });

    console.log('Closing result:', result, 'length:', result.length);
    return result;
  }

  console.log('Unknown report type:', type);
  return [];
};


  // ============================
  // Generic Getter by ID and Type
  // ============================
  const getById = async (type, id) => {
    if (!type || !id) throw new Error("Missing type or id in getById()");
    try {
      const item = await stockService.getById(type, id);
      return item;
    } catch (error) {
      console.error(`❌ Error fetching ${type} by id (${id}):`, error);
      throw error;
    }
  };
  const addPurchases = async (data) => {
    return await addItem("purchase", data);
  };

  return (
    <StockContext.Provider
      value={{
        products,
        purchases,
        sales,
        dispenses,
        payments, // ✅ Added
        assets,
        productSettings,
        accountSettings,
        loading,
        suppliers,
        invoices,
        customers,

        addSupplier,
        updateSupplier,
        deleteSupplier,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getInvoicesBySupplier,
        getInvoicesByCustomer,
        approveInvoice,
        addPayment,
        updatePayment,
        deletePayment,
        getPaymentsBySupplier,
        getPaymentsByCustomer,
         getById,

        addAccount,
        updateAccount,
        deleteAccount,
        addItem,
        addProduct,
        updateProduct,

        deleteProduct,
        getProductStock,
        getProductTotalPrice,
        getTotalPurchases,
        getTotalSales,
        getTotalClosingStockValue,
        createJournalEntry,
        addProductSetting,
        updateProductSetting,
        deleteProductSetting,
        generateReport,
        addPurchases,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext);
