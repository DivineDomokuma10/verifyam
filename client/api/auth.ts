import { TApiResponse } from "@/types";
import CallApi from "@/utils/call-api";
import { AUTH_ENDPOINTS } from "@/enum";

import { IUserResponse } from "@/interface";
import { TLoginFormValues, TSignupFormValues } from "@/types/schema-derived";

class AuthApi {
  static async login(payload: TLoginFormValues) {
    const res = await CallApi<TApiResponse<IUserResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      "POST",
      "json",
      payload,
    );

    if (res.status === "error") {
      return { message: res.message };
    }

    return { data: res.data, message: res.message };
  }

  static async signup(payload: TSignupFormValues) {
    const res = await CallApi<TApiResponse<IUserResponse>>(
      AUTH_ENDPOINTS.SIGNUP,
      "POST",
      "json",
      payload,
    );

    if (res.status === "error") {
      return { message: res.message };
    }

    return { data: res.data, message: res.message };
  }

  static async logout() {
    const res = await CallApi<TApiResponse<null>>(AUTH_ENDPOINTS.LOGOUT, "GET");

    if (res.status === "error") {
      return { message: res.message };
    }

    return { data: res.data, message: res.message };
  }

  static async getMe() {
    const res = await CallApi<TApiResponse<IUserResponse>>(
      AUTH_ENDPOINTS.ME,
      "GET",
    );

    if (res.status === "error") {
      return { message: res.message };
    }

    return { data: res.data, message: res.message };
  }
}

export default AuthApi;