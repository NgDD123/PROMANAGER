import express from "express";
import CashFlowController from "../../controllers/stock/cashFlow.controller.js";

const router = express.Router();

router.post("/generate", CashFlowController.generate);
router.get("/", CashFlowController.get);
router.delete("/:id", CashFlowController.remove);

export default router;
