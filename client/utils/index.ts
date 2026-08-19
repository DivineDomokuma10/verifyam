import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

import AuthApi from "@/api/auth";
import AuthStore from "@/store/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMutationError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
}

export const handleLogout = async () => {
  await AuthApi.logout();

  AuthStore.getState().clearAuthData?.();
  window.location.replace("/login");
};