import { Router } from "express";

import {
  loginController,
  signupController,
  logoutController,
} from "@/controller/auth";
import { requireAuth } from "@/middleware";

const router = Router();

router.post("/login", loginController);

router.post("/signup", signupController);

router.post("/logout", logoutController);

router.use(requireAuth);

router.get("/me", (req, res) => {
  res.json(req.user);
});

export default router;
