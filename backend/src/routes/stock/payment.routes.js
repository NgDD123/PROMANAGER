import express from "express";
import { PaymentController } from "../../controllers/stock/payment.controller.js";

const router = express.Router();

// ===== SUPPLIER PAYMENTS =====
router.post("/", PaymentController.createSupplierPayment);
console.log("payment is hited by end point")
router.get("/", PaymentController.getAllSupplierPayments);
router.get("/:id", PaymentController.getSupplierPaymentById);
router.put("/:id", PaymentController.updateSupplierPayment);
router.delete("/:id", PaymentController.removeSupplierPayment);
router.get("/:supplierId", PaymentController.getPaymentsBySupplier);

// ===== CUSTOMER PAYMENTS =====
router.post("/", PaymentController.createCustomerPayment);
router.get("/", PaymentController.getAllCustomerPayments);
router.get("/:id", PaymentController.getCustomerPaymentById);
router.put("/:id", PaymentController.updateCustomerPayment);
router.delete("/:id", PaymentController.removeCustomerPayment);
router.get("/:customerId", PaymentController.getPaymentsByCustomer);

export default router;
