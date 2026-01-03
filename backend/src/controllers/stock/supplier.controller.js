import { SupplierModel } from "../../models/stock/supplier.model.js";

export const SupplierController = {
  async create(req, res) {
    try {
      console.log("📥 [CREATE] Request body:", req.body);
      const supplier = await SupplierModel.create(req.body);
      console.log("supplier created:", supplier )
      res.status(201).json(supplier);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const suppliers = await SupplierModel.findAll();
      res.json(suppliers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const supplier = await SupplierModel.findById(req.params.id);
      if (!supplier) return res.status(404).json({ message: "Supplier not found" });
      res.json(supplier);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const supplier = await SupplierModel.update(req.params.id, req.body);
      res.json(supplier);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await SupplierModel.remove(req.params.id);
      res.json({ message: "Supplier deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
