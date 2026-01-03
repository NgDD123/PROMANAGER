// routes/auth.routes.js
import { Router } from "express";
import {
  register,
  login,
  me,
  refresh,
  requestPasswordReset,
  resetPassword,
  logout,
} from "../../controllers/stock/auth.controller.js";
import { requireAuth } from "../../middleware/stock/auth.js";

const routers = Router();

routers.post("/register", register);
routers.post("/login", login);
console.log("login: hit me to login")
routers.post("/logout", requireAuth, logout);
routers.post("/refresh", refresh);
routers.post("/forgot-password", requestPasswordReset);
routers.post("/reset-password", resetPassword);
routers.get("/me", requireAuth, me);

export default routers;
