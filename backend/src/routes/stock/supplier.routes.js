import express from "express";
import { SupplierController } from "../../controllers/stock/supplier.controller.js";

const router = express.Router();

router.post("/", SupplierController.create);
console.log("hited suplierRouter")
router.get("/", SupplierController.getAll);
router.get("/:id", SupplierController.getById);
router.put("/:id", SupplierController.update);
router.delete("/:id", SupplierController.remove);

export default router;
