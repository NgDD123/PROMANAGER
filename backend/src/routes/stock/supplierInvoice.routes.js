import express from "express";
import { SupplierInvoiceController } from "../../controllers/stock/supplierInvoice.controller.js";

const router = express.Router();

router.post("/", SupplierInvoiceController.create);
console.log("hited suplierInvoice")
router.get("/", SupplierInvoiceController.getAll);
router.get("/:id", SupplierInvoiceController.getById);
router.get("/supplier/:supplierId", SupplierInvoiceController.getBySupplier);
router.put("/:id", SupplierInvoiceController.update);
router.delete("/:id", SupplierInvoiceController.remove);

export default router;
