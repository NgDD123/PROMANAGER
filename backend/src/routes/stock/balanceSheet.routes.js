import express from "express";
import BalanceSheetController from "../../controllers/stock/balanceSheet.controller.js";

const router = express.Router();

router.post("/generate", BalanceSheetController.generate);
router.get("/", BalanceSheetController.get);
router.delete("/:id", BalanceSheetController.remove);

export default router;
