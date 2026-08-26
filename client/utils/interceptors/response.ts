import { AxiosError } from "axios";

import AuthStore from "@/store/auth";
import SessionStore from "@/store/session";
import { queryClient } from "@/providers/react-query";
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
  SessionStore.getState().mutateSession(null);
  SessionStore.getState().setLoading(false);
  queryClient.clear();

  return Promise.reject(error);
};
