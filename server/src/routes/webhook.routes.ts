import { Router } from "express";

import { verifyWebhook } from "@/middleware";
import { calleWebhookController } from "@/controller/webhook";

const router = Router();

router.post("/calle", verifyWebhook, calleWebhookController);

export default router;
