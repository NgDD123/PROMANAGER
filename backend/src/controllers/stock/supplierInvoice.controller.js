import { SupplierInvoiceModel } from "../../models/stock/supplierInvoice.model.js";

export const SupplierInvoiceController = {
  async create(req, res) {
    try {
      console.log("📥 [CREATE] Request body:", req.body);
      const invoice = await SupplierInvoiceModel.create(req.body);
      console.log("✅ [CREATE] Created invoice:", invoice);
      res.status(201).json(invoice);
    } catch (err) {
      console.error("❌ [CREATE] Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      console.log("📥 [GET ALL] Fetching all invoices");
      const invoices = await SupplierInvoiceModel.findAll();
      console.log(`✅ [GET ALL] Found ${invoices.length} invoices`);
      res.json(invoices);
    } catch (err) {
      console.error("❌ [GET ALL] Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      console.log("[GET BY ID] Invoice ID:", req.params.id);
      const invoice = await SupplierInvoiceModel.findById(req.params.id);
      if (!invoice) {
        console.warn("⚠️ [GET BY ID] Invoice not found:", req.params.id);
        return res.status(404).json({ message: "Invoice not found" });
      }
      console.log("✅ [GET BY ID] Found invoice:", invoice);
      res.json(invoice);
    } catch (err) {
      console.error("❌ [GET BY ID] Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getBySupplier(req, res) {
    try {
      console.log("[GET BY SUPPLIER] Supplier ID:", req.params.supplierId);
      const invoices = await SupplierInvoiceModel.findBySupplier(req.params.supplierId);
      console.log(`✅ [GET BY SUPPLIER] Found ${invoices.length} invoices`);
      res.json(invoices);
    } catch (err) {
      console.error("❌ [GET BY SUPPLIER] Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(id, data) {
  const ref = supplierInvoiceCollection.doc(id);
  await ref.update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  // Fetch the full updated document
  const updatedSnap = await ref.get();
  if (!updatedSnap.exists) throw new Error("Invoice not found after update");
  
  return { id: updatedSnap.id, ...updatedSnap.data() };
},


  async remove(req, res) {
    try {
      console.log("[REMOVE] Invoice ID:", req.params.id);
      await SupplierInvoiceModel.remove(req.params.id);
      console.log("✅ [REMOVE] Invoice deleted:", req.params.id);
      res.json({ message: "Invoice deleted" });
    } catch (err) {
      console.error("❌ [REMOVE] Error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};
