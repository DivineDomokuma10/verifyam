import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

import AuthApi from "@/api/auth";
import AuthStore from "@/store/auth";
import SessionStore from "@/store/session";
import { queryClient } from "@/providers/react-query";

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
  try {
    await AuthApi.logout();
  } finally {
    AuthStore.getState().clearAuthData?.();
    SessionStore.getState().mutateSession(null);
    queryClient.clear();
    window.location.replace("/login");
  }
};

export function formatRelativeTime(date: string | Date): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000,
  );

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h ago`;
  }
  const days = Math.floor(seconds / 86400);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
}
