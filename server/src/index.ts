import express from "express";
import cookieParser from "cookie-parser";

import { env } from "@/config/env";
import { corsMiddleware } from "@/middleware";
import { authRoutes } from "./routes";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
