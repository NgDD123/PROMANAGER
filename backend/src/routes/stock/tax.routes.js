import express from "express";
import { TaxController } from "../../controllers/stock/tax.controller.js";
import { requireAuth } from "../../middleware/stock/auth.js";

const router = express.Router();

// Tax Group Routes
router.post("/groups", requireAuth, TaxController.createTaxGroup);
router.get("/groups/all", requireAuth, TaxController.getAllTaxGroups);
router.put("/groups/:id", requireAuth, TaxController.updateTaxGroup);
router.delete("/groups/:id", requireAuth, TaxController.deleteTaxGroup);

// Tax Report Routes
router.get("/transactions/all", requireAuth, TaxController.getTaxTransactions);
router.get("/reports/by-type", requireAuth, TaxController.getTaxReport);
router.get("/reports/summary", requireAuth, TaxController.getTaxSummary);

// Tax Configuration Routes
router.post("/", requireAuth, TaxController.createTax);
router.get("/", requireAuth, TaxController.getAllTaxes);
router.get("/active", requireAuth, TaxController.getActiveTaxes);
router.get("/:id", requireAuth, TaxController.getTaxById);
router.put("/:id", requireAuth, TaxController.updateTax);
router.delete("/:id", requireAuth, TaxController.deleteTax);

export default router;
