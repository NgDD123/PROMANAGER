import express from "express";
import LedgerController from "../../controllers/stock/ledger.controller.js";

const router = express.Router();

router.get("/", LedgerController.getAll);
router.get("/account/:accountId", LedgerController.getByAccount);

export default router;
