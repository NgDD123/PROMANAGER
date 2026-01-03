import { ReturnModel } from "../../models/stock/return.model.js";

export const ReturnController = {
  async create(req, res) {
    try {
      const returnItem = await ReturnModel.create(req.body);
      res.status(201).json(returnItem);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const returns = await ReturnModel.findAll();
      res.json(returns);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const returnItem = await ReturnModel.findById(req.params.id);
      if (!returnItem) return res.status(404).json({ message: "Return not found" });
      res.json(returnItem);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const returnItem = await ReturnModel.update(req.params.id, req.body);
      res.json(returnItem);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await ReturnModel.remove(req.params.id);
      res.json({ message: "Return deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
