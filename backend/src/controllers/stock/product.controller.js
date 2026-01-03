import { ProductModel } from "../../models/stock/product.model.js";
import { db } from "../../../utils/firebase.js";

export const ProductController = {
  async create(req, res) {
    console.log("➡️ Entered ProductController.create");
    console.log("Request Body:", req.body);

    try {
      const product = await ProductModel.create(req.body);
      console.log("✅ Product Created:", product);
      res.status(201).json(product);
    } catch (err) {
      console.error("❌ Create Product Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    console.log("➡️ Entered ProductController.getAll");

    try {
      const products = await ProductModel.findAll();
      console.log("✅ Fetched All Products:", products.length);
      res.json(products);
    } catch (err) {
      console.error("❌ Get All Products Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    console.log("➡️ Entered ProductController.getById");
    console.log("Params:", req.params);

    try {
      const product = await ProductModel.findById(req.params.id);
      if (!product) {
        console.warn("⚠️ Product Not Found:", req.params.id);
        return res.status(404).json({ message: "Product not found" });
      }
      console.log("✅ Product Found:", product);
      res.json(product);
    } catch (err) {
      console.error("❌ Get Product By ID Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    console.log("➡️ Entered ProductController.update");
    console.log("Params:", req.params, "Body:", req.body);

    try {
      const updated = await ProductModel.update(req.params.id, req.body);
      console.log("✅ Product Updated:", updated);
      res.json(updated);
    } catch (err) {
      console.error("❌ Update Product Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    console.log("➡️ Entered ProductController.remove");
    console.log("Params:", req.params);

    try {
      await ProductModel.remove(req.params.id);
      console.log("✅ Product Deleted:", req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      console.error("❌ Delete Product Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async adjustStock(req, res) {
    console.log("➡️ Entered ProductController.adjustStock");
    console.log("Params:", req.params, "Body:", req.body);

    try {
      const { id } = req.params;
      const { qtyChange } = req.body;

      if (!qtyChange) {
        console.warn("⚠️ qtyChange missing in request");
        return res.status(400).json({ error: "qtyChange required" });
      }

      const updated = await ProductModel.adjustStock(id, qtyChange);
      console.log("✅ Stock Adjusted:", updated);
      res.json(updated);
    } catch (err) {
      console.error("❌ Adjust Stock Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async filterByTypeAndDate(req, res) {
    console.log("➡️ Entered ProductController.filterByTypeAndDate");
    console.log("📥 Filter Report Request Body:", req.body);


    try {
      const { reportType, startDate, endDate } = req.body;
      if (!reportType) {
        console.warn("⚠️ reportType missing");
        return res.status(400).json({ error: "reportType required" });
      }

      let data = [];

      switch (reportType) {
        case "Purchases":
          console.log("📦 Filtering Purchases");
          data = await ProductModel.filterTransactionsByDateRange(
            db().collection("purchases"),
            startDate,
            endDate
          );
          break;
        case "Sales":
          console.log("💰 Filtering Sales");
          data = await ProductModel.filterTransactionsByDateRange(
            db().collection("sales"),
            startDate,
            endDate
          );
          break;
        case "Damaged / Wasted":
          console.log("⚠️ Filtering Damaged/Wasted Products");
          const allProducts = await ProductModel.findAll();
          data = allProducts.filter((p) => Number(p.damaged || 0) > 0);
          break;
        case "Opening Qty":
        case "Closing Qty":
        case "Returns (In/Out)":
        case "Summary":
          console.log("📊 Generating Summary Report");
          data = await ProductModel.getSummaryReport(startDate, endDate);
          break;
        default:
          console.warn("❌ Invalid report type:", reportType);
          return res.status(400).json({ error: "Invalid report type" });
      }

      if (!data || data.length === 0) {
        console.warn("⚠️ No records found for report");
        return res.json({ message: "No records found for this report type and date range", data: [] });
      }

      console.log("✅ Report Data Fetched:", data.length);
      res.json(data);
    } catch (err) {
      console.error("❌ Report Filter Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getSummaryReport(req, res) {
    console.log("➡️ Entered ProductController.getSummaryReport");
    console.log("Query Params:", req.query);

    try {
      const { startDate, endDate } = req.query;
      const report = await ProductModel.getSummaryReport(startDate, endDate);

      if (!report || report.length === 0) {
        console.warn("⚠️ No records found in Summary Report");
        return res.json({ message: "No records found", data: [] });
      }

      console.log("✅ Summary Report Fetched:", report.length);
      res.json(report);
    } catch (err) {
      console.error("❌ Summary Report Error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};
