import { Router } from "express";

import {
  createVerificationController,
  getVerificationController,
  listVerificationsController,
  parseListingController,
} from "@/controller/verification";
import { requireAuth } from "@/middleware";

const router = Router();

router.use(requireAuth);

router.post("/parse", parseListingController);

router.post("/", createVerificationController);

router.get("/", listVerificationsController);

router.get("/:id", getVerificationController);

export default router;