import { TransferModel } from "../../models/stock/transfer.model.js";

export const TransferController = {
  async create(req, res) {
    try {
      const transfer = await TransferModel.create(req.body);
      res.status(201).json(transfer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const transfers = await TransferModel.findAll();
      res.json(transfers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const transfer = await TransferModel.findById(req.params.id);
      if (!transfer) return res.status(404).json({ message: "Transfer not found" });
      res.json(transfer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const transfer = await TransferModel.update(req.params.id, req.body);
      res.json(transfer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await TransferModel.remove(req.params.id);
      res.json({ message: "Transfer deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
