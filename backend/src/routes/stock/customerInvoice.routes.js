import express from "express";
import { CustomerInvoiceController } from "../../controllers/stock/customerInvoice.controller.js";

const router = express.Router();

router.post("/", CustomerInvoiceController.create);
console.log("hited customerInvoice")
router.get("/", CustomerInvoiceController.getAll);
router.get("/:id", CustomerInvoiceController.getById);
router.get("/customer/:customerId", CustomerInvoiceController.getByCustomer);
router.put("/:id", CustomerInvoiceController.update);
router.delete("/:id", CustomerInvoiceController.remove);

export default router;
