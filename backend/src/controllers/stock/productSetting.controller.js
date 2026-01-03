import { ProductSettingModel } from "../../models/stock/productSetting.model.js";

export const ProductSettingController = {
  async create(req, res) {
    try {
      const setting = await ProductSettingModel.create(req.body);
      return res.status(201).json(setting);
    } catch (err) {
      console.error("Error creating product setting:", err);
      return res.status(500).json({ error: "Failed to create product setting" });
    }
  },

  async getAll(req, res) {
    try {
      const items = await ProductSettingModel.getAll();
      return res.status(200).json(items);
    } catch (err) {
      console.error("Error fetching product settings:", err);
      return res.status(500).json({ error: "Failed to fetch product settings" });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await ProductSettingModel.getById(id);
      if (!item) return res.status(404).json({ error: "Product setting not found" });
      return res.status(200).json(item);
    } catch (err) {
      console.error("Error fetching product setting:", err);
      return res.status(500).json({ error: "Failed to fetch product setting" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await ProductSettingModel.update(id, req.body);
      if (!updated) return res.status(404).json({ error: "Product setting not found" });
      return res.status(200).json(updated);
    } catch (err) {
      console.error("Error updating product setting:", err);
      return res.status(500).json({ error: "Failed to update product setting" });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ProductSettingModel.remove(id);
      if (!deleted) return res.status(404).json({ error: "Product setting not found" });
      return res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
      console.error("Error deleting product setting:", err);
      return res.status(500).json({ error: "Failed to delete product setting" });
    }
  },
};
