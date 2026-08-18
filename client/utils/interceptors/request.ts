import { InternalAxiosRequestConfig } from "axios";

export const requestInterceptorFunc = (config: InternalAxiosRequestConfig) => {
  return config;
};