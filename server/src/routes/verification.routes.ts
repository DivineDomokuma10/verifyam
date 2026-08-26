import { Router } from "express";

import {
  createVerificationController,
  getVerificationController,
  listVerificationsController,
  parseListingController,
} from "@/controller/verification";
import {
  requireAuth,
  createVerificationRateLimit,
  requireTrustedOrigin,
} from "@/middleware";

const router = Router();

router.use(requireAuth);

router.post("/parse", requireTrustedOrigin, parseListingController);

router.post(
  "/",
  requireTrustedOrigin,
  createVerificationRateLimit,
  createVerificationController,
);

router.get("/", listVerificationsController);

router.get("/:id", getVerificationController);

export default router;
