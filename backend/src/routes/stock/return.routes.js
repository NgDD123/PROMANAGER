import express from "express";
import { ReturnController } from "../../controllers/stock/return.controller.js";

const router = express.Router();

router.post("/", ReturnController.create);
router.get("/", ReturnController.getAll);
router.get("/:id", ReturnController.getById);
router.put("/:id", ReturnController.update);
router.delete("/:id", ReturnController.remove);

export default router;
