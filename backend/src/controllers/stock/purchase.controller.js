import { PurchaseModel } from "../../models/stock/purchase.model.js";

export const PurchaseController = {
  async create(req, res) {
    try {
      const purchase = await PurchaseModel.create(req.body);
      res.status(201).json(purchase);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const purchases = await PurchaseModel.findAll();
      res.json(purchases);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const purchase = await PurchaseModel.findById(req.params.id);
      if (!purchase) return res.status(404).json({ message: "Purchase not found" });
      res.json(purchase);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
  try {
    console.log("[UPDATE] Invoice ID:", req.params.id, "Update body:", req.body);
    
    // Find the existing invoice first
    const existing = await SupplierInvoiceModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Merge the existing data with the new fields
    const updatedData = { ...existing, ...req.body };

    // Make sure items and totals are preserved if not included in update
    if (!req.body.items) {
      updatedData.items = existing.items;
    }
    if (!req.body.totalAmount) {
      updatedData.totalAmount = existing.totalAmount;
    }
    if (!req.body.supplierId) {
      updatedData.supplierId = existing.supplierId;
    }

    const updatedInvoice = await SupplierInvoiceModel.update(req.params.id, updatedData);

    console.log("✅ [UPDATE] Updated invoice:", updatedInvoice);
    res.json(updatedInvoice);
  } catch (err) {
    console.error("❌ [UPDATE] Error:", err);
    res.status(500).json({ error: err.message });
  }
},


  async remove(req, res) {
    try {
      await PurchaseModel.remove(req.params.id);
      res.json({ message: "Purchase deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
