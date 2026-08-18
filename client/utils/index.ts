import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

import AuthApi from "@/api/auth";
import AuthStore from "@/store/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleLogout = async () => {
  await AuthApi.logout();

  AuthStore.getState().clearAuthData?.();
  window.location.replace("/login");
};