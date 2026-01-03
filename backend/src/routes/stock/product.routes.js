import express from "express";
import { ProductController } from "../../controllers/stock/product.controller.js";

const router = express.Router();

// ========================
// 🔹 CORE CRUD ROUTES
// ========================
router.post("/", ProductController.create);       // Create new product
router.get("/", ProductController.getAll);        // Get all products
console.log("/ route hit");
router.get("/:id", ProductController.getById);    // Get product by ID
router.put("/:id", ProductController.update);     // Update product
router.delete("/:id", ProductController.remove);  // Delete product

// ========================
// 🔹 STOCK ADJUSTMENT
// ========================
// Adjust stock (sales, returns, damaged, etc.)
router.put("/:id/adjust-stock", ProductController.adjustStock);

// ========================
// 🔹 REPORTS & SUMMARIES
// ========================
router.get("/report/summary", ProductController.getSummaryReport);  // Get summary report
console.log("🔥 /report/filter route hit");
router.post("/report/filter", ProductController.filterByTypeAndDate); // Filter by report type & date
console.log("🔥 /report/filter route hit");
export default router;
