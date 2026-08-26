import express from "express";
import cookieParser from "cookie-parser";

import { env } from "@/config/env";
import { corsMiddleware, globalErrorHandler, notFoundHandler } from "@/middleware";
import { authRoutes, verificationRoutes, webhookRoutes } from "./routes";

const app = express();

app.disable("x-powered-by");

app.use(corsMiddleware);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/verifications", verificationRoutes);
app.use("/api/webhooks", webhookRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
