import { AxiosError } from "axios";

import AuthStore from "@/store/auth";
import { OPEN_ROUTE } from "../constant";

export const responseInterceptorErrFunc = async (error: AxiosError) => {
  const originalRequest = error.config;

  if (!originalRequest) {
    return Promise.reject(error);
  }

  const status = error.response?.status;

  if (status !== 401) {
    return Promise.reject(error);
  }

  if (OPEN_ROUTE.some((route) => originalRequest.url?.includes(route))) {
    return Promise.reject(error);
  }

  AuthStore.getState().clearAuthData?.();

  return Promise.reject(error);
};