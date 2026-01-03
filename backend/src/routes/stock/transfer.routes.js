import express from "express";
import { TransferController } from "../../controllers/stock/transfer.controller.js";
const router = express.Router();

router.post("/", TransferController.create);
router.get("/", TransferController.getAll);
router

export default router;