"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "@/schemas/auth";
import type { TLoginFormValues } from "@/types/schema-derived";
import { useLoginMutation, useSignupMutation } from "@/hook/queries/auth";
import AuthStore from "@/store/auth";
import SessionStore from "@/store/session";
import type { IUserResponse } from "@/interface";
import { getMutationError } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthFormProps = {
  mode: "login" | "signup";
};

function getNextPath(): string {
  if (typeof window === "undefined") {
    return "/verify";
  }
  const params = new URLSearchParams(window.location.search);
  const value = params.get("next");
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/verify";
}

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const mutateAuthData = AuthStore((state) => state.mutateAuthData);
  const mutateSession = SessionStore((state) => state.mutateSession);

  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();

  const isPending = isLogin
    ? loginMutation.isPending
    : signupMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: TLoginFormValues) => {
    setServerError(null);

    const handleSuccess = (res: { data?: IUserResponse | null }) => {
      if (res.data) {
        mutateAuthData(res.data);
        mutateSession({ userId: res.data.id });
      }
      router.replace(getNextPath());
    };

    const handleError = (error: unknown) => {
      setServerError(getMutationError(error));
    };

    if (isLogin) {
      loginMutation.mutate(values, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    } else {
      signupMutation.mutate(values, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-semibold text-primary text-2xl uppercase">
            {isLogin ? "Log in" : "Create your account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Welcome back. Verify your listings."
              : "One account for all your verification history."}
          </CardDescription>
        </CardHeader>

        <form
          noValidate
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                placeholder="you@example.com"
                {...register("email")}
                className="rounded-md p-4 h-12"
              />

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <Input
                id="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                aria-invalid={Boolean(errors.password)}
                placeholder="At least 8 characters"
                {...register("password")}
                className="rounded-md p-4 h-12"
              />

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p role="alert" className="text-sm text-destructive">
                {serverError}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md p-4 h-12"
            >
              {isPending
                ? isLogin
                  ? "Logging in…"
                  : "Creating account…"
                : isLogin
                  ? "Log in"
                  : "Sign up"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Log in
                  </Link>
                </>
              )}
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
