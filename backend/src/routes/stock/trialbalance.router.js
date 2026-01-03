import express from "express";
import TrialBalanceController from "../../controllers/stock/trialbalance.controller.js";

const router = express.Router();

router.get("/", TrialBalanceController.getAll);

export default router;
