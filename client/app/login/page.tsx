import type { Metadata } from "next";

import { AuthForm } from "@/components/shared/auth-form";

export const metadata: Metadata = {
  title: "Log in — VERIFY",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
