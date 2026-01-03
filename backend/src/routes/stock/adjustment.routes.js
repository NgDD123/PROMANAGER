import express from "express";
import { AdjustmentController } from "../../controllers/stock/adjustment.controller.js";

const router = express.Router();

router.post("/", AdjustmentController.create);
router.get("/", AdjustmentController.getAll);
router.get("/:id", AdjustmentController.getById);
router.put("/:id", AdjustmentController.update);
router.delete("/:id", AdjustmentController.remove);

export default router;
