import express from "express";
import { ProductSettingController } from "../../controllers/stock/productSetting.controller.js";

const router = express.Router();

// CRUD Routes
router.post("/", ProductSettingController.create);        // Create
router.get("/", ProductSettingController.getAll);        // Get All
router.get("/:id", ProductSettingController.getById);    // Get by ID
router.put("/:id", ProductSettingController.update);     // Update
router.delete("/:id", ProductSettingController.remove);  // Delete

export default router;
