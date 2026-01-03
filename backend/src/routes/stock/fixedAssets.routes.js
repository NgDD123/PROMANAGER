import express from "express";
import { FixedAssetController } from "../../controllers/stock/fixedAssets.controller.js";

const router = express.Router();

// ✅ Create asset
router.post("/", FixedAssetController.create);

// ✅ Get all assets
router.get("/", FixedAssetController.getAll);

// ✅ Delete asset
router.delete("/:id", FixedAssetController.remove);

// ✅ Post monthly depreciation (manual trigger)
router.post("/post-depreciation", FixedAssetController.postMonthlyDepreciation);
router.get("/depreciation-summary", FixedAssetController.depreciationSummary);


export default router;
