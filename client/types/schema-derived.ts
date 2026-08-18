import z from "zod";

import { loginSchema, signupSchema } from "@/schemas/auth";

export type TLoginFormValues = z.infer<typeof loginSchema>;

export type TSignupFormValues = z.infer<typeof signupSchema>;