import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1).default("file:./dev.db"),
    PORT: z.coerce.number().default(4000),
    SESSION_TTL_DAYS: z.coerce.number().default(30),
    COOKIE_NAME: z.string().default("verify_session"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    CORS_ORIGINS: z
      .string()
      .default("http://localhost:3000")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    CALLE_API_KEY: z.string().default(""),
    CALLE_BASE_URL: z.string().url().default("https://api.heycall-e.com"),
    CALLE_MOCK: z
      .enum(["true", "false"])
      .default("true")
      .transform((value) => value === "true"),
    CALLE_MOCK_SCENARIO: z
      .enum([
        "verified",
        "warning",
        "inconclusive",
        "no_answer",
        "no_answer_then_verified",
      ])
      .default("verified"),
    CALLE_MOCK_DELAY_MS: z.coerce.number().default(15000),
    CALLE_REGION: z.string().default("NG"),
    CALLE_LOCALE: z.string().default("en-NG"),
    CALLE_WEBHOOK_URL: z.string().url().optional(),
    CALLE_WEBHOOK_SECRET: z.string().optional(),
    MAX_VERIFICATIONS_PER_HOUR: z.coerce.number().default(5),
    MAX_VERIFICATIONS_PER_DAY: z.coerce.number().default(10),
    DEFAULT_PHONE_REGION: z.string().default("NG"),
  })
  .superRefine((value, ctx) => {
    if (value.CALLE_MOCK) return;

    if (!value.CALLE_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CALLE_API_KEY"],
        message: "CALLE_API_KEY is required when CALLE_MOCK=false",
      });
    }

    if (!value.CALLE_WEBHOOK_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CALLE_WEBHOOK_URL"],
        message: "CALLE_WEBHOOK_URL is required when CALLE_MOCK=false",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
