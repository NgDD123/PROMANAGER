import express from "express";
import JournalController from "../../controllers/stock/journal.controller.js";

const router = express.Router();

// Create a journal entry
router.post("/", JournalController.create);

// Get all journal entries
router.get("/", JournalController.getAll);

// Delete a journal entry
router.delete("/:id", JournalController.remove);

export default router;
