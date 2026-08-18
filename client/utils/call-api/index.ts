import axios, { AxiosInstance } from "axios";

import { THttpMethod, TResponseType } from "@/types";
import { assertEnv, getHeaderConfig } from "./helper";
import { requestInterceptorFunc } from "../interceptors/request";
import { responseInterceptorErrFunc } from "../interceptors/response";

const baseUrl = assertEnv(
  process.env.NEXT_PUBLIC_BACKEND_URL!,
  "ENV is MISSING. Please add NEXT_PUBLIC_BACKEND_URL to your .env file.",
);

export const api: AxiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

api.interceptors.request.use(requestInterceptorFunc);
api.interceptors.response.use((res) => res, responseInterceptorErrFunc);

const CallApi = async <T, P = unknown>(
  url: string,
  method: THttpMethod,
  responseType: TResponseType = "json",
  payload?: P,
): Promise<T> => {
  try {
    const resp = await api({
      url,
      method,
      data: payload,
      headers: {
        ...getHeaderConfig(payload),
      },
      responseType,
    });

    return resp.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message ?? error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
    }

    throw error;
  }
};

export default CallApi;