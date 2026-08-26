import { Router } from "express";

import {
  loginController,
  signupController,
  logoutController,
} from "@/controller/auth";
import { authRateLimit, requireAuth, requireTrustedOrigin } from "@/middleware";

const router = Router();

router.post("/login", requireTrustedOrigin, authRateLimit, loginController);

router.post("/signup", requireTrustedOrigin, authRateLimit, signupController);

router.post("/logout", requireTrustedOrigin, logoutController);

router.use(requireAuth);

router.get("/me", (req, res) => {
  res.json({
    status: "success",
    message: "Authenticated",
    data: req.user,
  });
});

export default router;
