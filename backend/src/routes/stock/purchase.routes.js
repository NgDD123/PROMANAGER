import express from "express";
import { PurchaseController } from "../../controllers/stock/purchase.controller.js";

const router = express.Router();

router.post("/", PurchaseController.create);
router.get("/", PurchaseController.getAll);
router.get("/:id", PurchaseController.getById);
router.put("/:id", PurchaseController.update);
router.delete("/:id", PurchaseController.remove);

export default router;
