import express from "express";
import { AccountController } from "../../controllers/stock/accounts.controller.js";

const router = express.Router();

// Seed default accounts
router.post("/seed", AccountController.seedDefault);

// Get all accounts
router.get("/", AccountController.getAll);

export default router;
