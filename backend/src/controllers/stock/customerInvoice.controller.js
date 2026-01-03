import { CustomerInvoiceModel } from "../../models/stock/customerInvoice.model.js";

export const CustomerInvoiceController = {
  async create(req, res) {
    try {
      const invoice = await CustomerInvoiceModel.create(req.body);
      res.status(201).json(invoice);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const invoices = await CustomerInvoiceModel.findAll();
      res.json(invoices);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const invoice = await CustomerInvoiceModel.findById(req.params.id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      res.json(invoice);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getByCustomer(req, res) {
    try {
      const invoices = await CustomerInvoiceModel.findByCustomer(req.params.customerId);
      res.json(invoices);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const invoice = await CustomerInvoiceModel.update(req.params.id, req.body);
      res.json(invoice);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await CustomerInvoiceModel.remove(req.params.id);
      res.json({ message: "Invoice deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
