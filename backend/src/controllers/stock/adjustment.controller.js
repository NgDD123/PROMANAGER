import { AdjustmentModel } from "../../models/stock/adjustment.model.js";

export const AdjustmentController = {
  async create(req, res) {
    try {
      const adjustment = await AdjustmentModel.create(req.body);
      res.status(201).json(adjustment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const adjustments = await AdjustmentModel.findAll();
      res.json(adjustments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const adjustment = await AdjustmentModel.findById(req.params.id);
      if (!adjustment) return res.status(404).json({ message: "Adjustment not found" });
      res.json(adjustment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const adjustment = await AdjustmentModel.update(req.params.id, req.body);
      res.json(adjustment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await AdjustmentModel.remove(req.params.id);
      res.json({ message: "Adjustment deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
