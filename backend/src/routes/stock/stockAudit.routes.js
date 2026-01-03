import express from "express";
import { stockAduditController } from "../../controllers/stock/stockAudit.controller.js";

const router = express.Router();

router.post("/", AuditController.create);
router.get("/", AuditController.getAll);
router.get("/:id", AuditController.getById);
router.put("/:id", AuditController.update);
router.delete("/:id", AuditController.remove);

export default router;
