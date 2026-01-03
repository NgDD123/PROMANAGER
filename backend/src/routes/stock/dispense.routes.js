import express from "express";
import { DispenseController } from "../../controllers/stock/dispense.controller.js";

const router = express.Router();

// CRUD Routes
router.post("/", DispenseController.create);
router.get("/", DispenseController.getAll);
router.get("/:id", DispenseController.getById);
router.put("/:id", DispenseController.update);
router.delete("/:id", DispenseController.remove);

export default router;
