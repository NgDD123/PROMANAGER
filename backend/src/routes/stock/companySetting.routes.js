import express from "express";
import { CompanySettingController } from "../../controllers/stock/companySetting.controller.js";
import { requireAuth } from "../../middleware/stock/auth.js";

const router = express.Router();

router.get("/", requireAuth, CompanySettingController.get);
router.post("/", requireAuth, CompanySettingController.save);
router.put("/", requireAuth, CompanySettingController.save);

export default router;
