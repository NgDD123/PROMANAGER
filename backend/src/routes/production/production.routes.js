// src/routes/production/production.routes.js
import express from "express";
import { ProductionController } from "../../controllers/production/production.controller.js";

const router = express.Router();

// --- 🧩 PLANS ---
router.post("/plans", ProductionController.createPlan);
router.get("/plans", ProductionController.listPlans);
router.get("/plans/:id", ProductionController.getPlan);
router.put("/plans/:id", ProductionController.updatePlan);
router.put("/plans/:id/approve", ProductionController.approvePlan);

// --- ⚙️ CYCLES ---
router.get("/cycles", ProductionController.listCycles);
router.post("/cycles/start", ProductionController.startCycle);
router.post("/cycles/complete", ProductionController.completeCycle);
console.log("🔥 /cycles/complete route hit");

// --- 🔍 QUALITY INSPECTION ---
router.post("/inspections", ProductionController.createInspection);
router.get("/inspections", ProductionController.getInspections);

// --- 📊 REPORTS ---
router.get("/summary", ProductionController.getProductionSummary);

export default router;
