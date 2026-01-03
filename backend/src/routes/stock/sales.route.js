import express from "express";
import { SalesController } from "../../controllers/stock/sales.controller.js";

const router = express.Router();

// CRUD routes for sales
router.post("/", SalesController.create);
router.get("/", SalesController.getAll);
router.get("/:id", SalesController.getById);
router.put("/:id", SalesController.update);
router.delete("/:id", SalesController.remove);

export default router;
