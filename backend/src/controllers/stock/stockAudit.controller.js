import { StockAuditModel } from "../../models/stock/stockAudit.model.js";

export const StockAuditController = {
  async log(req, res) {
    try {
      const { action, data, userId } = req.body;
      const audit = await StockAuditModel.log(action, data, userId);
      res.status(201).json(audit);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const audits = await StockAuditModel.findAll();
      res.json(audits);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const audit = await StockAuditModel.findById(req.params.id);
      if (!audit) return res.status(404).json({ message: "Audit not found" });
      res.json(audit);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
