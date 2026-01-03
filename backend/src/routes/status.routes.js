// backend/src/routes/status.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { goOnline, goOffline, listAvailable } from "../controllers/status.controller.js";

const router = Router();

// Mark user as online
router.post("/online", requireAuth, goOnline);

// Mark user as offline
router.post("/offline", requireAuth, goOffline);

// List available users by role
router.get("/:role", requireAuth, listAvailable);

export default router;
