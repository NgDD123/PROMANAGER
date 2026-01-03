import { DispenseModel } from "../../models/stock/dispense.model.js";
import { db } from "../../../utils/firebase.js";

export const DispenseController = {
  // ✅ Create new dispense with automatic product name resolution
  async create(req, res) {
    try {
      const { productId, product, quantity, price, customer } = req.body;

      if (!productId && !product) {
        return res.status(400).json({
          error: "Product ID or product name is required.",
        });
      }

      // 🔍 Try to fetch product name from "products" collection if productId provided
      let productName = product || "Unnamed Product";
      if (productId) {
        const productSnap = await db().collection("products").doc(productId).get();
        if (productSnap.exists) {
          productName = productSnap.data().name || productName;
        }
      }

      const dispense = await DispenseModel.create({
        productId,
        product: productName,
        quantity,
        price,
        customer,
      });

      res.status(201).json({
        message: "Dispense record created successfully.",
        data: dispense,
      });
    } catch (err) {
      console.error("Error creating dispense:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ✅ Get all dispenses
  async getAll(req, res) {
    try {
      const dispenses = await DispenseModel.findAll();
      res.json(dispenses);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ✅ Get single dispense by ID
  async getById(req, res) {
    try {
      const dispense = await DispenseModel.findById(req.params.id);
      if (!dispense)
        return res.status(404).json({ message: "Dispense not found" });
      res.json(dispense);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ✅ Update dispense
  async update(req, res) {
    try {
      const { productId, product } = req.body;
      let productName = product;

      // Re-resolve product name if productId is provided
      if (productId) {
        const productSnap = await db().collection("products").doc(productId).get();
        if (productSnap.exists) {
          productName = productSnap.data().name;
        }
      }

      const updatedData = await DispenseModel.update(req.params.id, {
        ...req.body,
        product: productName,
      });
      res.json(updatedData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ✅ Delete dispense
  async remove(req, res) {
    try {
      await DispenseModel.remove(req.params.id);
      res.json({ message: "Dispense deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
