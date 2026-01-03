import express from "express";
import IncomeStatementController from "../../controllers/stock/incomeStatement.controller.js";

const router = express.Router();

router.post("/generate", IncomeStatementController.generate);
router.get("/", IncomeStatementController.get);
router.delete("/:id", IncomeStatementController.remove);

export default router;
