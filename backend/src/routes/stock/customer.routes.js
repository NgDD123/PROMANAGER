import express from "express";
import { CustomerController } from "../../controllers/stock/customer.controller.js";

const router = express.Router();

router.post("/", CustomerController.create);
console.log("hited costomerRouter")
router.get("/", CustomerController.getAll);
router.get("/:id", CustomerController.getById);
router.put("/:id", CustomerController.update);
router.delete("/:id", CustomerController.remove);

export default router;
