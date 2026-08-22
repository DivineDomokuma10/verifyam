import { Router } from "express";

import {
  createVerificationController,
  getVerificationController,
  listVerificationsController,
  parseListingController,
} from "@/controller/verification";
import { requireAuth, createVerificationRateLimit } from "@/middleware";

const router = Router();

router.use(requireAuth);

router.post("/parse", parseListingController);

router.post("/", createVerificationRateLimit, createVerificationController);

router.get("/", listVerificationsController);

router.get("/:id", getVerificationController);

export default router;